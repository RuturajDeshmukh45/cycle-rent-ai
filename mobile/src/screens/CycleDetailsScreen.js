import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { createBooking } from '../services';
import { RADIUS, SHADOW } from '../theme';

const TYPE_COLOR = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };

export default function CycleDetailsScreen({ route, navigation }) {
  const { cycle } = route.params;
  const { colors, accent } = useTheme();
  const [hours,    setHours]    = useState('1');
  const [pickup,   setPickup]   = useState(cycle.location || '');
  const [drop,     setDrop]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const cost = parseFloat(hours || 0) * cycle.price_per_hour;
  const typeColor = TYPE_COLOR[cycle.cycle_type] || accent;

  const handleBook = async () => {
    if (!hours || parseFloat(hours) <= 0) { Toast.show({ type: 'error', text1: 'Enter valid hours' }); return; }
    if (!pickup.trim()) { Toast.show({ type: 'error', text1: 'Pickup location required' }); return; }
    Alert.alert(
      'Confirm Booking',
      `Book ${cycle.name} for ${hours} hour(s)?\nTotal: ₹${cost.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: async () => {
          setLoading(true);
          try {
            const startTime = new Date();
            const endTime   = new Date(startTime.getTime() + parseFloat(hours) * 3600000);
            await createBooking({
              cycle_id: cycle.id,
              start_time: startTime.toISOString(),
              end_time:   endTime.toISOString(),
              pickup_location: pickup,
              drop_location:   drop || pickup,
            });
            Toast.show({ type: 'success', text1: 'Booking confirmed! 🎉' });
            navigation.navigate('MyRides');
          } catch (err) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Booking failed' });
          } finally { setLoading(false); }
        }},
      ]
    );
  };

  const s = styles(colors, accent, typeColor);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Image */}
      <View style={s.imageBox}>
        {cycle.image_url
          ? <Image source={{ uri: cycle.image_url }} style={s.image} />
          : (
            <View style={[s.imagePlaceholder, { backgroundColor: typeColor + '18' }]}>
              <Ionicons name="bicycle" size={64} color={typeColor} />
            </View>
          )
        }
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.typeBadgeFloat}>
          <Ionicons name="flash" size={12} color={typeColor} />
          <Text style={[s.typeBadgeText, { color: typeColor }]}>{cycle.cycle_type}</Text>
        </View>
      </View>

      <View style={s.content}>
        {/* Info */}
        <Text style={s.name}>{cycle.name}</Text>
        <View style={s.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={s.locationText}>{cycle.location}</Text>
        </View>
        {cycle.description && <Text style={s.description}>{cycle.description}</Text>}

        {/* Price card */}
        <View style={s.priceCard}>
          <View>
            <Text style={s.priceLabel}>Rate per hour</Text>
            <Text style={s.price}>₹{cycle.price_per_hour}<Text style={s.perHour}>/hr</Text></Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: accent + '18' }]}>
            <View style={[s.dot, { backgroundColor: accent }]} />
            <Text style={[s.statusText, { color: accent }]}>Available</Text>
          </View>
        </View>

        {/* Booking form */}
        <Text style={s.sectionTitle}>Book This Cycle</Text>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Duration (hours)</Text>
          <View style={s.inputRow}>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
            <TextInput
              style={s.input}
              value={hours}
              onChangeText={setHours}
              keyboardType="decimal-pad"
              placeholder="e.g. 2"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Pickup Location</Text>
          <View style={s.inputRow}>
            <Ionicons name="navigate-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
            <TextInput
              style={s.input}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Pickup point"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Drop Location</Text>
          <View style={s.inputRow}>
            <Ionicons name="flag-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
            <TextInput
              style={s.input}
              value={drop}
              onChangeText={setDrop}
              placeholder="Drop point (optional)"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Cost preview */}
        <View style={s.costCard}>
          <Text style={s.costLabel}>Estimated Cost</Text>
          <Text style={s.costValue}>₹{isNaN(cost) ? '0.00' : cost.toFixed(2)}</Text>
        </View>

        {/* Book button */}
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="bicycle" size={20} color="#fff" /><Text style={s.bookBtnText}>Confirm Booking</Text></>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (c, accent, typeColor) => StyleSheet.create({
  screen:  { flex: 1, backgroundColor: c.bgPrimary },
  imageBox:{ height: 260, position: 'relative' },
  image:   { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 48, left: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: c.bgCard + 'cc', alignItems: 'center', justifyContent: 'center' },
  typeBadgeFloat: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.bgCard + 'ee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  content: { padding: 20 },
  name:    { fontSize: 24, fontWeight: '900', color: c.textPrimary, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  locationText: { fontSize: 13, color: c.textMuted },
  description: { fontSize: 14, color: c.textSecondary, lineHeight: 20, marginBottom: 16 },
  priceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.bgCard, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: c.border, marginBottom: 24 },
  priceLabel: { fontSize: 12, color: c.textMuted, marginBottom: 4 },
  price:   { fontSize: 26, fontWeight: '900', color: c.textPrimary },
  perHour: { fontSize: 14, fontWeight: '400', color: c.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md },
  dot:     { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: c.textPrimary, marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  label:   { fontSize: 11, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputRow:{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: c.border, height: 50 },
  input:   { flex: 1, paddingHorizontal: 12, fontSize: 15, color: c.textPrimary },
  costCard:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: accent + '10', borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: accent + '30', marginBottom: 20 },
  costLabel:{ fontSize: 14, fontWeight: '700', color: c.textSecondary },
  costValue:{ fontSize: 24, fontWeight: '900', color: accent },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: accent, borderRadius: RADIUS.xl, height: 56, ...SHADOW.accent },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
