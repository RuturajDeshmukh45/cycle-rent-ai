import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllCycles } from '../services';
import { RADIUS, SHADOW, COLORS } from '../theme';

const TYPE_COLOR = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };
const TYPE_ICON  = { electric: 'flash',   mountain: 'trail-sign', standard: 'bicycle' };

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, accent } = useTheme();
  const [cycles,     setCycles]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Good Morning' : hour < 17 ? '👋 Good Afternoon' : '🌙 Good Evening';

  const fetchCycles = useCallback(async () => {
    try {
      const res = await getAllCycles({ status: 'available' });
      setCycles(res.data?.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCycles(); }, []);

  const filtered = cycles.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location?.toLowerCase().includes(search.toLowerCase());
    const matchType   = !typeFilter || c.cycle_type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = [
    { label: 'Available', value: cycles.filter(c => c.status === 'available').length, icon: 'bicycle', color: accent },
    { label: 'Stations',  value: new Set(cycles.map(c => c.location)).size,            icon: 'location', color: '#3b82f6' },
    { label: 'Electric',  value: cycles.filter(c => c.cycle_type === 'electric').length, icon: 'flash', color: '#f59e0b' },
  ];

  const s = styles(colors, accent);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCycles(); }} tintColor={accent} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting},</Text>
          <Text style={s.name}>{user?.name?.split(' ')[0]} 🚲</Text>
          <Text style={s.subGreeting}>Find eco-friendly cycles near you</Text>
        </View>
        <TouchableOpacity style={s.mapBtn} onPress={() => navigation.navigate('Map')}>
          <Ionicons name="map-outline" size={20} color={accent} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {stats.map(({ label, value, icon, color }) => (
          <View key={label} style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.statIcon, { backgroundColor: color + '18' }]}>
              <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={s.statValue}>{loading ? '—' : value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* AI Banner */}
      <TouchableOpacity style={s.aiBanner} activeOpacity={0.8}>
        <View style={s.aiIconBox}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.aiTitle}>AI Insights</Text>
          <Text style={s.aiSub}>Get smart ride recommendations</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={accent} />
      </TouchableOpacity>

      {/* Search */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search cycles or locations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 12 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Type filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 4 }}>
        {['', 'standard', 'electric', 'mountain'].map(t => (
          <TouchableOpacity key={t} style={[s.chip, typeFilter === t && s.chipActive]} onPress={() => setTypeFilter(t)}>
            <Text style={[s.chipText, typeFilter === t && s.chipTextActive]}>
              {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cycle list */}
      <Text style={s.sectionTitle}>Available Cycles ({filtered.length})</Text>

      {loading ? (
        <ActivityIndicator color={accent} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>🚲</Text>
          <Text style={s.emptyText}>No cycles found</Text>
        </View>
      ) : (
        filtered.map(cycle => (
          <TouchableOpacity key={cycle.id} style={s.cycleCard} onPress={() => navigation.navigate('CycleDetails', { cycle })} activeOpacity={0.85}>
            <View style={s.cycleImageBox}>
              {cycle.image_url
                ? <Image source={{ uri: cycle.image_url }} style={s.cycleImage} />
                : (
                  <View style={[s.cycleImagePlaceholder, { backgroundColor: TYPE_COLOR[cycle.cycle_type] + '18' }]}>
                    <Ionicons name={TYPE_ICON[cycle.cycle_type] || 'bicycle'} size={28} color={TYPE_COLOR[cycle.cycle_type]} />
                  </View>
                )
              }
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cycleHeaderRow}>
                <Text style={s.cycleName}>{cycle.name}</Text>
                <View style={[s.typeBadge, { backgroundColor: TYPE_COLOR[cycle.cycle_type] + '18' }]}>
                  <Text style={[s.typeText, { color: TYPE_COLOR[cycle.cycle_type] }]}>{cycle.cycle_type}</Text>
                </View>
              </View>
              <View style={s.locationRow}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text style={s.locationText}>{cycle.location}</Text>
              </View>
              <View style={s.priceRow}>
                <Text style={s.price}>₹{cycle.price_per_hour}<Text style={s.perHour}>/hr</Text></Text>
                <View style={s.availableDot} />
                <Text style={[s.availableText, { color: accent }]}>Available</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = (c, accent) => StyleSheet.create({
  screen:  { flex: 1, backgroundColor: c.bgPrimary },
  content: { paddingBottom: 100 },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting:{ fontSize: 13, color: c.textMuted, fontWeight: '600' },
  name:    { fontSize: 24, fontWeight: '900', color: c.textPrimary, letterSpacing: -0.5 },
  subGreeting: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
  mapBtn:  { width: 44, height: 44, borderRadius: 14, backgroundColor: accent + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: accent + '30' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: c.bgCard, borderRadius: RADIUS.lg, padding: 14, borderTopWidth: 3, borderWidth: 1, borderColor: c.border, ...SHADOW.sm },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue:{ fontSize: 22, fontWeight: '900', color: c.textPrimary },
  statLabel:{ fontSize: 11, color: c.textMuted, marginTop: 2 },

  aiBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: accent + '12', borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: accent + '30', gap: 12 },
  aiIconBox:{ width: 38, height: 38, borderRadius: 12, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', ...SHADOW.accent },
  aiTitle:  { fontSize: 14, fontWeight: '800', color: c.textPrimary },
  aiSub:    { fontSize: 12, color: c.textMuted },

  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: c.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: c.border, height: 48 },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 14, color: c.textPrimary },

  chips: { marginTop: 12 },
  chip:  { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border },
  chipActive: { backgroundColor: accent, borderColor: accent },
  chipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary, paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },

  cycleCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: c.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: c.border, padding: 14, gap: 14, ...SHADOW.sm },
  cycleImageBox: { width: 72, height: 72, borderRadius: RADIUS.lg, overflow: 'hidden' },
  cycleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cycleImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.lg },
  cycleHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cycleName:{ fontSize: 15, fontWeight: '800', color: c.textPrimary, flex: 1 },
  typeBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 6 },
  typeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  locationText: { fontSize: 12, color: c.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price:    { fontSize: 16, fontWeight: '900', color: c.textPrimary },
  perHour:  { fontSize: 12, fontWeight: '400', color: c.textMuted },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent },
  availableText: { fontSize: 12, fontWeight: '700' },

  empty:    { alignItems: 'center', paddingTop: 60 },
  emptyText:{ fontSize: 14, color: c.textMuted, marginTop: 12, fontWeight: '600' },
});
