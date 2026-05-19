import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getRideHistory } from '../services';
import { RADIUS, SHADOW } from '../theme';

export default function HistoryScreen() {
  const { colors, accent } = useTheme();
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getRideHistory();
      setHistory(res.data?.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, []);

  const totalSpent   = history.reduce((s, r) => s + parseFloat(r.total_cost || 0), 0);
  const totalRides   = history.length;
  const avgDuration  = totalRides
    ? (history.reduce((s, r) => s + parseFloat(r.duration_hours || 0), 0) / totalRides).toFixed(1)
    : 0;

  const s = styles(colors, accent);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchHistory(); }}
          tintColor={accent}
        />
      }
    >
      {/* Summary cards */}
      <View style={s.summaryRow}>
        {[
          { label: 'Total Rides', value: totalRides,             icon: 'bicycle',       color: accent    },
          { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: 'wallet-outline', color: '#3b82f6' },
          { label: 'Avg Hours',   value: `${avgDuration}h`,     icon: 'time-outline',  color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <View key={label} style={[s.summaryCard, { borderTopColor: color }]}>
            <Ionicons name={icon} size={18} color={color} style={{ marginBottom: 6 }} />
            <Text style={s.summaryValue}>{loading ? '—' : value}</Text>
            <Text style={s.summaryLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Ride History</Text>

      {loading ? (
        <ActivityIndicator color={accent} style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>🗓️</Text>
          <Text style={s.emptyText}>No history yet</Text>
        </View>
      ) : (
        history.map((r, i) => (
          <View key={r.id || i} style={s.card}>
            <View style={s.cardTop}>
              <View style={s.cardLeft}>
                <Text style={s.rideName}>{r.cycle?.name || r.booking?.cycle?.name || 'Cycle'}</Text>
                <View style={s.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                  <Text style={s.metaText}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <Text style={s.cost}>₹{parseFloat(r.total_cost || 0).toFixed(2)}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.cardBottom}>
              <View style={s.pill}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={s.pillText}>{parseFloat(r.duration_hours || 0).toFixed(1)}h</Text>
              </View>
              {r.pickup_location ? (
                <View style={s.pill}>
                  <Ionicons name="navigate-outline" size={12} color={colors.textMuted} />
                  <Text style={s.pillText} numberOfLines={1}>{r.pickup_location}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = (c, accent) => StyleSheet.create({
  screen:       { flex: 1, backgroundColor: c.bgPrimary },
  summaryRow:   { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  summaryCard:  { flex: 1, backgroundColor: c.bgCard, borderRadius: RADIUS.lg, padding: 14, borderTopWidth: 3, borderWidth: 1, borderColor: c.border, ...SHADOW.sm, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '900', color: c.textPrimary },
  summaryLabel: { fontSize: 11, color: c.textMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary, paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  card:         { marginHorizontal: 16, marginBottom: 10, backgroundColor: c.bgCard, borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: c.border, ...SHADOW.sm },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft:     { flex: 1 },
  rideName:     { fontSize: 15, fontWeight: '800', color: c.textPrimary, marginBottom: 4 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:     { fontSize: 12, color: c.textMuted },
  cost:         { fontSize: 18, fontWeight: '900', color: accent },
  divider:      { height: 1, backgroundColor: c.border, marginBottom: 10 },
  cardBottom:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.bgInput, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillText:     { fontSize: 12, color: c.textSecondary, maxWidth: 120 },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyText:    { fontSize: 14, color: c.textMuted, marginTop: 12, fontWeight: '600' },
});
