import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Crosshair, Info, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons for Vite (use local node_modules assets, NOT unpkg CDN)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const LiveMap = ({
  cycles = [],
  onCycleSelect,
  showDropMarker = false,
  onDropLocationChange,
  dropLatLng = null,
  height = '420px',
}) => {
  const mapRef            = useRef(null);
  const mapInstanceRef    = useRef(null);
  const markersRef        = useRef([]);
  const dropMarkerRef     = useRef(null);
  const userMarkerRef     = useRef(null);
  const userLocatedRef    = useRef(false);
  const [mapReady,       setMapReady]       = useState(false);
  const [locating,       setLocating]       = useState(false);
  const [selectedCycle,  setSelectedCycle]  = useState(null);
  const [error,          setError]          = useState('');

  const makeCycleIcon = useCallback((cycle) => {
    const isAvail = cycle.status === 'available';
    const color   = isAvail ? '#22c55e' : '#ef4444';
    const emoji   = cycle.cycle_type === 'electric' ? '⚡' : cycle.cycle_type === 'mountain' ? '🏔️' : '🚲';
    return L.divIcon({
      html: `
        <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="sh${cycle.id}" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.35"/>
            </filter>
          </defs>
          <ellipse cx="20" cy="45" rx="6" ry="2" fill="${color}" opacity="0.3"/>
          <path d="M20 44 L14 30 Q20 22 26 30 Z" fill="${color}" opacity="0.85"/>
          <circle cx="20" cy="20" r="18" fill="${color}" filter="url(#sh${cycle.id})"/>
          <circle cx="20" cy="20" r="14" fill="white" opacity="0.92"/>
          <text x="20" y="26" text-anchor="middle" font-size="16">${emoji}</text>
        </svg>`,
      className:    '',
      iconSize:     [40, 48],
      iconAnchor:   [20, 48],
      popupAnchor:  [0, -48],
    });
  }, []);

  const makeUserIcon = useCallback(() => L.divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
    className:  '',
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  }), []);

  const makeDropIcon = useCallback(() => L.divIcon({
    html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 43 L10 28 Q18 18 26 28 Z" fill="#f59e0b" opacity="0.9"/>
      <circle cx="18" cy="18" r="16" fill="#f59e0b"/>
      <circle cx="18" cy="18" r="10" fill="white" opacity="0.85"/>
      <text x="18" y="23" text-anchor="middle" font-size="13">📍</text>
    </svg>`,
    className:   '',
    iconSize:    [36, 44],
    iconAnchor:  [18, 44],
    popupAnchor: [0, -44],
  }), []);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center:      INDIA_CENTER,
      zoom:        DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom:     19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Multiple invalidateSize calls so map renders correctly when conditionally shown
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    // ResizeObserver catches container size changes (e.g. parent animating in)
    let ro;
    if (window.ResizeObserver && mapRef.current) {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(mapRef.current);
    }

    setMapReady(true);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ── Cycle markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (!cycles.length) return;

    cycles.forEach(cycle => {
      const lat = parseFloat(cycle.latitude)  || parseFloat(cycle.lat)
        || (INDIA_CENTER[0] + (Math.random() - 0.5) * 0.06);
      const lng = parseFloat(cycle.longitude) || parseFloat(cycle.lng)
        || (INDIA_CENTER[1] + (Math.random() - 0.5) * 0.06);

      const marker = L.marker([lat, lng], { icon: makeCycleIcon(cycle) })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;margin-bottom:4px;">${cycle.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:6px;">📍 ${cycle.location}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;color:#22c55e;font-size:16px;">₹${cycle.price_per_hour}/hr</span>
              <span style="padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;
                background:${cycle.status === 'available' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
                color:${cycle.status === 'available' ? '#16a34a' : '#dc2626'};">
                ${cycle.status}
              </span>
            </div>
          </div>`, { maxWidth: 220 });

      marker.on('click', () => {
        setSelectedCycle(cycle);
        if (onCycleSelect) onCycleSelect(cycle);
      });
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0 && !userLocatedRef.current) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14 });
    }
  }, [cycles, mapReady, makeCycleIcon, onCycleSelect]);

  // ── Drop marker ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    if (!showDropMarker) {
      if (dropMarkerRef.current) {
        map.removeLayer(dropMarkerRef.current);
        dropMarkerRef.current = null;
      }
      return;
    }
    if (dropMarkerRef.current) return;

    const initPos = (dropLatLng && dropLatLng.lat != null && dropLatLng.lng != null)
      ? [dropLatLng.lat, dropLatLng.lng]
      : map.getCenter();

    const marker = L.marker(initPos, { icon: makeDropIcon(), draggable: true })
      .addTo(map)
      .bindPopup('<div style="font-family:Space Grotesk,sans-serif;font-size:13px;font-weight:700;">Drop Location 📍<br/><span style="font-size:11px;font-weight:400;color:#888;">Drag to change drop point</span></div>');

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      // FIX: guard so pos is never undefined before calling onDropLocationChange
      if (pos && onDropLocationChange) {
        onDropLocationChange({ lat: pos.lat, lng: pos.lng });
      }
    });

    dropMarkerRef.current = marker;

    // FIX: only call onDropLocationChange if initPos is valid numbers
    if (onDropLocationChange && Array.isArray(initPos) &&
        typeof initPos[0] === 'number' && typeof initPos[1] === 'number') {
      onDropLocationChange({ lat: initPos[0], lng: initPos[1] });
    }
  }, [showDropMarker, mapReady, makeDropIcon, dropLatLng, onDropLocationChange]);

  // ── Locate user ───────────────────────────────────────────────────────────
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocating(false);
        const map = mapInstanceRef.current;
        if (!map) return;
        userLocatedRef.current = true;
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker([latitude, longitude], { icon: makeUserIcon() })
          .addTo(map)
          .bindPopup('<b style="font-family:Space Grotesk">You are here 📍</b>');
        map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });
      },
      () => {
        setLocating(false);
        setError('Location access denied');
        setTimeout(() => setError(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [makeUserIcon]);

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ height, border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Controls */}
      <div className="absolute top-3 left-3 z-[999] flex flex-col gap-2">
        <button onClick={locateUser} disabled={locating}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
          style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            color: locating ? 'var(--text-muted)' : 'var(--accent)', fontFamily: 'Space Grotesk',
          }}>
          {locating
            ? <span className="spinner inline-block w-3.5 h-3.5 border-2 rounded-full"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            : <Crosshair size={13} />}
          {locating ? 'Locating...' : 'My Location'}
        </button>
        {showDropMarker && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg"
            style={{
              background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.3)',
              color: '#d97706', fontFamily: 'Space Grotesk',
            }}>
            <MapPin size={12} /> Drag 🟡 to set drop
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-3 right-3 z-[999] px-3 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626' }}>
          <Info size={12} /> {error}
        </div>
      )}

      {/* Selected cycle panel */}
      {selectedCycle && (
        <div className="absolute bottom-4 left-4 right-4 z-[999] rounded-2xl p-4 shadow-lg"
          style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <button className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
            onClick={() => setSelectedCycle(null)}>
            <X size={12} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'var(--bg-input)' }}>
              {selectedCycle.cycle_type === 'electric' ? '⚡' : selectedCycle.cycle_type === 'mountain' ? '🏔️' : '🚲'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                {selectedCycle.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {selectedCycle.location}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-base"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                ₹{selectedCycle.price_per_hour}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/hr</p>
            </div>
          </div>
          {selectedCycle.status === 'available' && (
            <a href={`/booking/${selectedCycle.id}`}
              className="btn-primary w-full mt-3 py-2 text-xs"
              style={{ display: 'flex', textDecoration: 'none' }}>
              Rent This Cycle →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveMap;