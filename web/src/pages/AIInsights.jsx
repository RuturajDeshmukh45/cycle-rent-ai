import { useState, useEffect, useCallback } from 'react';
import { getRecommendations, getDynamicPricing } from '../services/ai.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Brain, Clock, Route, TrendingUp, Zap, Star, RefreshCw } from 'lucide-react';

const PEAK_HOURS = [8, 9, 10, 17, 18, 19, 20];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const isPeak = PEAK_HOURS.includes(parseInt(label));
  return (
    <div className="rounded-xl p-2.5 text-xs"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontFamily: 'Space Grotesk' }}>
      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{label}:00</p>
      <p style={{ color: isPeak ? '#f59e0b' : 'var(--accent)' }}>
        {isPeak ? '🔥' : '✅'} Demand: {payload[0]?.value}
      </p>
    </div>
  );
};

const PriceTicker = ({ basePrice }) => {
  const [pricing, setPricing] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrice = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const isPeak = PEAK_HOURS.includes(hour);
      // Vary demand score by time of day for realistic pricing
      const demandScore = isPeak ? 75 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 25);
      const r = await getDynamicPricing({ base_price: basePrice, demand_score: demandScore });
      setPricing(r.data?.data?.pricing);
      setLastUpdated(new Date());
      setCountdown(60);
    } catch { } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, [basePrice]);

  useEffect(() => {
    fetchPrice();
    const priceInterval = setInterval(() => fetchPrice(), 60000);
    return () => clearInterval(priceInterval);
  }, [fetchPrice]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 60), 1000);
    return () => clearInterval(tick);
  }, []);

  if (!pricing) return (
    <div className="h-32 flex items-center justify-center rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
      <span className="spinner inline-block w-6 h-6 border-2 rounded-full"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  const isPeak = pricing.isPeakHour;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${isPeak ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.3)'}`,
        background: isPeak
          ? 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(239,68,68,0.06))'
          : 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.05))',
      }}>
      {/* Live bar */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: isPeak ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
          borderBottom: `1px solid ${isPeak ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'}`,
        }}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: isPeak ? '#f59e0b' : '#22c55e' }} />
          <span className="text-xs font-bold" style={{ color: isPeak ? '#d97706' : 'var(--accent)', fontFamily: 'Space Grotesk' }}>
            LIVE PRICE · Auto-updates every 60s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
            <Clock size={10} className="inline mr-1" />
            {countdown}s
          </span>
          <button onClick={() => fetchPrice(true)} disabled={refreshing}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
            <RefreshCw size={11} className={refreshing ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Price display */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              Current Dynamic Price
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold transition-all"
                style={{ fontFamily: 'Space Grotesk', color: isPeak ? '#d97706' : 'var(--accent)' }}>
                ₹{pricing.finalPrice}
              </span>
              <span className="text-base" style={{ color: 'var(--text-muted)' }}>/hr</span>
              {pricing.finalPrice !== pricing.basePrice && (
                <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>₹{pricing.basePrice}</span>
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{pricing.pricingReason}</p>
          </div>
          <div className="text-5xl">{isPeak ? '🔥' : '🟢'}</div>
        </div>

        {/* Multiplier breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Base Price', val: `₹${pricing.basePrice}`, color: 'var(--text-primary)' },
            { label: 'Time ×', val: `${pricing.timeMultiplier}×`, color: isPeak ? '#d97706' : 'var(--accent)' },
            { label: 'Demand ×', val: `${pricing.demandMultiplier}×`, color: isPeak ? '#ef4444' : '#10b981' },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>{label}</p>
              <p className="text-sm font-extrabold" style={{ color, fontFamily: 'Space Grotesk' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Hour-by-hour price preview */}
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
            Today's Price Schedule
          </p>
          <div className="flex gap-1 flex-wrap">
            {[6, 7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 22].map(h => {
              const isPeakH = PEAK_HOURS.includes(h);
              const estPrice = isPeakH
                ? (basePrice * pricing.timeMultiplier * 1.3).toFixed(0)
                : (basePrice * 1.0).toFixed(0);
              const isNow = new Date().getHours() === h;
              return (
                <div key={h} className="rounded-lg px-2 py-1.5 text-center transition-all"
                  style={{
                    background: isNow ? 'var(--accent)' : isPeakH ? 'rgba(245,158,11,0.1)' : 'var(--bg-input)',
                    border: `1px solid ${isNow ? 'transparent' : isPeakH ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                    minWidth: '44px',
                  }}>
                  <div style={{ fontSize: '10px', color: isNow ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                    {h}:00
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isNow ? '#fff' : isPeakH ? '#d97706' : 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                    ₹{estPrice}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        {isPeak ? (
          <div className="mt-3 rounded-xl px-3 py-2 text-xs"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#92400e' }}>
            💡 <strong>Peak hours active!</strong> Price is higher due to high demand. Off-peak starts at{' '}
            {new Date().getHours() >= 17 ? '9 PM' : '11 AM'}.
          </div>
        ) : (
          <div className="mt-3 rounded-xl px-3 py-2 text-xs"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', color: '#14532d' }}>
            🟢 <strong>Great time to ride!</strong> Off-peak pricing active. Next peak at{' '}
            {new Date().getHours() < 8 ? '8 AM' : new Date().getHours() < 17 ? '5 PM' : '8 AM tomorrow'}.
          </div>
        )}

        {lastUpdated && (
          <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
            Updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

const AIInsights = () => {
  const { data: recs, loading } = useFetch(getRecommendations);

  if (loading) return <Loader text="AI analyzing your data…" />;

  const demandData = recs?.timeRecommendation?.demandByHour
    ? Object.entries(recs.timeRecommendation.demandByHour)
      .map(([h, d]) => ({ hour: h, demand: d, isPeak: PEAK_HOURS.includes(parseInt(h)) }))
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', boxShadow: 'var(--shadow-accent)' }}>
          <Brain size={18} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            AI Insights
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Live pricing · Smart suggestions</p>
        </div>
      </div>

      {/* Fix 6: Live auto-updating price ticker */}
      <div className="mb-5">
        <PriceTicker basePrice={15} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Demand chart with peak markers */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              Demand by Hour
            </h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', fontFamily: 'Space Grotesk', border: '1px solid rgba(245,158,11,0.2)' }}>
              🔥 = Peak
            </span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={demandData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={3} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="demand" radius={[3, 3, 0, 0]}
                fill="var(--accent)"
                // Color bars by peak/off-peak
                shape={(props) => {
                  const isPeak = PEAK_HOURS.includes(parseInt(props.hour || props['hour']));
                  return <rect {...props} fill={isPeak ? '#f59e0b' : 'var(--accent)'} opacity={0.85} rx={3} ry={3} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: 'var(--accent)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Off-peak (cheaper)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Peak (higher price)</span>
            </div>
          </div>
        </div>

        {/* Best time */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: 'var(--success)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              Best Time to Rent
            </h2>
          </div>
          <div className="space-y-2 mb-3">
            {recs?.timeRecommendation?.bestTimeToRent?.slice(0, 4).map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>🕐 {t}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--success)', fontFamily: 'Space Grotesk' }}>
                  Low demand · Cheap
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>
              ⚠ Peak Hours (higher price)
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {recs?.timeRecommendation?.peakHours?.join(', ') || '8AM–10AM, 5PM–8PM'}
            </p>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      {recs?.routeRecommendation?.popularRoutes?.length > 0 && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Route size={16} style={{ color: '#a78bfa' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              Popular Routes
            </h2>
          </div>
          <div className="space-y-2">
            {recs.routeRecommendation.popularRoutes.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                    {r.from} → {r.to}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {r.distance} · ~{r.estimatedTime}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                  <span className="text-xs font-bold" style={{ fontFamily: 'Space Grotesk', color: '#f59e0b' }}>{r.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User insights */}
      {recs?.userInsights && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              Your Insights
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Total Rides', value: recs.userInsights.totalRides, color: 'var(--accent)' },
              { label: 'Total Spent', value: `₹${recs.userInsights.totalSpent}`, color: '#10b981' },
              { label: 'Avg Duration', value: `${recs.userInsights.avgDuration}h`, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-3 text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xl font-extrabold truncate" style={{ fontFamily: 'Space Grotesk', color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{recs.userInsights.message}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
