import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { getMyRides, completeBooking, cancelBooking, getBookingReview, submitReview, updateReview } from '../services';
import { RADIUS, SHADOW } from '../theme';

const STATUS_COLOR = {
  booked:    { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6' },
  active:    { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e' },
  completed: { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444' },
};

const StarRow = ({ rating, size = 16, onPress }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <TouchableOpacity key={s} onPress={() => onPress?.(s)} disabled={!onPress}>
        <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={size} color={s <= rating ? '#facc15' : '#94a3b8'} />
      </TouchableOpacity>
    ))}
  </View>
);

// Review modal
const ReviewModal = ({ visible, booking, existing, onClose, onDone }) => {
  const { colors, accent } = useTheme();
  const [rating,  setRating]  = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [loading, setLoading] = useState(false);
  const isEdit = !!existing;

  useEffect(() => {
    if (visible) { setRating(existing?.rating || 0); setComment(existing?.comment || ''); }
  }, [visible, existing]);

  const handleSubmit = async () => {
    if (!rating) { Toast.show({ type: 'error', text1: 'Please select a rating' }); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateReview(existing.id, { rating, comment });
        Toast.show({ type: 'success', text1: 'Review updated! ✏️' });
      } else {
        await submitReview({ booking_id: booking.id, rating, comment });
        Toast.show({ type: 'success', text1: 'Review submitted! 🌟' });
      }
      onDone();
      onClose();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const s = modalStyles(colors, accent);
  const labels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent!'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.header}>
          <View style={s.iconBox}>
            <Ionicons name={isEdit ? 'pencil' : 'bicycle'} size={18} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{isEdit ? 'Edit Your Review' : 'Rate Your Ride'}</Text>
            <Text style={s.subtitle}>{booking?.cycle?.name}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stars */}
        <View style={s.starsRow}>
          {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={s.starBtn}>
              <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={44} color={star <= rating ? '#facc15' : '#94a3b8'} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.ratingLabel}>{rating ? labels[rating] : 'Tap to rate'}</Text>

        {/* Comment */}
        <TextInput
          style={s.commentInput}
          placeholder="Share your experience (optional)..."
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          maxLength={300}
        />
        <Text style={s.charCount}>{comment.length}/300</Text>

        <TouchableOpacity style={[s.submitBtn, !rating && s.submitDisabled]} onPress={handleSubmit} disabled={loading || !rating}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>{isEdit ? 'Update Review' : 'Submit Review'}</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const modalStyles = (c, accent) => StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:    { backgroundColor: c.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: c.borderStrong, alignSelf: 'center', marginBottom: 20 },
  header:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  iconBox:  { width: 40, height: 40, borderRadius: 14, backgroundColor: accent + '18', alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: 16, fontWeight: '800', color: c.textPrimary },
  subtitle: { fontSize: 12, color: c.textMuted },
  closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: c.bgInput, alignItems: 'center', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn:  { padding: 4 },
  ratingLabel: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#b45309', marginBottom: 20, minHeight: 20 },
  commentInput: { backgroundColor: c.bgInput, borderRadius: RADIUS.lg, padding: 14, fontSize: 14, color: c.textPrimary, borderWidth: 1, borderColor: c.border, textAlignVertical: 'top', minHeight: 80, marginBottom: 4 },
  charCount:{ fontSize: 10, color: c.textMuted, textAlign: 'right', marginBottom: 16 },
  submitBtn:{ backgroundColor: accent, borderRadius: RADIUS.lg, height: 52, alignItems: 'center', justifyContent: 'center', ...SHADOW.accent },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default function MyRidesScreen() {
  const { colors, accent } = useTheme();
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewMap,  setReviewMap]  = useState({});
  const [reviewModal, setReviewModal] = useState(null); // { booking, existing }

  const fetchRides = useCallback(async () => {
    try {
      const res = await getMyRides();
      const list = res.data?.data || [];
      setBookings(list);
      // Load reviews for completed bookings
      const completed = list.filter(b => b.status === 'completed');
      const results   = await Promise.allSettled(
        completed.map(b => getBookingReview(b.id).then(r => ({ id: b.id, review: r?.data })))
      );
      const map = {};
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.review || null; });
      setReviewMap(map);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRides(); }, []);

  const handleComplete = (id) => {
    Alert.alert('Complete Ride', 'Are you sure you want to end this ride?', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, Complete', onPress: async () => {
        try {
          await completeBooking(id);
          Toast.show({ type: 'success', text1: 'Ride completed! 🎉' });
          await fetchRides();
          const booking = bookings.find(b => b.id === id);
          if (booking) setTimeout(() => setReviewModal({ booking: { ...booking, status: 'completed' }, existing: null }), 600);
        } catch (err) { Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed' }); }
      }},
    ]);
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: async () => {
        try {
          await cancelBooking(id);
          Toast.show({ type: 'success', text1: 'Booking cancelled' });
          fetchRides();
        } catch (err) { Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed' }); }
      }},
    ]);
  };

  const s = styles(colors, accent);

  const RideCard = ({ booking: b }) => {
    const sc = STATUS_COLOR[b.status] || STATUS_COLOR.cancelled;
    const review = reviewMap[b.id];
    const isActive = ['booked', 'active'].includes(b.status);

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cycleName}>{b.cycle?.name || 'Cycle'}</Text>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>{b.status}</Text>
          </View>
        </View>
        <View style={s.cardMeta}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={s.metaText}>{b.pickup_location || 'N/A'}</Text>
          <Text style={s.metaDot}>·</Text>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={s.metaText}>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </View>
        {b.total_cost ? (
          <Text style={s.cost}>₹{parseFloat(b.total_cost).toFixed(2)}</Text>
        ) : null}

        {/* Action buttons for active rides */}
        {isActive && (
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: accent + '15', borderColor: accent + '40' }]} onPress={() => handleComplete(b.id)}>
              <Ionicons name="checkmark-circle-outline" size={16} color={accent} />
              <Text style={[s.actionText, { color: accent }]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#ef444415', borderColor: '#ef444440' }]} onPress={() => handleCancel(b.id)}>
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
              <Text style={[s.actionText, { color: '#ef4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review section for completed rides */}
        {b.status === 'completed' && (
          <View style={s.reviewSection}>
            {review ? (
              <TouchableOpacity style={s.reviewDone} onPress={() => setReviewModal({ booking: b, existing: review })}>
                <StarRow rating={review.rating} size={14} />
                {review.comment ? <Text style={s.reviewComment} numberOfLines={1}>"{review.comment}"</Text> : null}
                <Ionicons name="pencil-outline" size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ) : review === null ? (
              <TouchableOpacity style={s.rateBtn} onPress={() => setReviewModal({ booking: b, existing: null })}>
                <Ionicons name="star-outline" size={14} color="#b45309" />
                <Text style={s.rateBtnText}>Rate this ride</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRides(); }} tintColor={accent} />}
      >
        {loading ? (
          <ActivityIndicator color={accent} style={{ marginTop: 60 }} />
        ) : bookings.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>🚲</Text>
            <Text style={s.emptyText}>No rides yet</Text>
            <Text style={s.emptySubText}>Book a cycle to get started</Text>
          </View>
        ) : (
          bookings.map(b => <RideCard key={b.id} booking={b} />)
        )}
      </ScrollView>

      {reviewModal && (
        <ReviewModal
          visible={!!reviewModal}
          booking={reviewModal.booking}
          existing={reviewModal.existing}
          onClose={() => setReviewModal(null)}
          onDone={fetchRides}
        />
      )}
    </View>
  );
}

const styles = (c, accent) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bgPrimary },
  card:   { marginHorizontal: 16, marginBottom: 12, backgroundColor: c.bgCard, borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: c.border, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cycleName: { fontSize: 16, fontWeight: '800', color: c.textPrimary, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  metaText: { fontSize: 12, color: c.textMuted },
  metaDot: { color: c.textMuted, marginHorizontal: 2 },
  cost:   { fontSize: 18, fontWeight: '900', color: c.textPrimary, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '700' },
  reviewSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border },
  reviewDone: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(250,204,21,0.08)', padding: 10, borderRadius: RADIUS.md },
  reviewComment: { fontSize: 12, color: c.textSecondary, flex: 1 },
  rateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(250,204,21,0.08)', padding: 10, borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(250,204,21,0.4)' },
  rateBtnText: { fontSize: 13, fontWeight: '700', color: '#b45309' },
  empty:   { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '800', color: c.textPrimary, marginTop: 16 },
  emptySubText: { fontSize: 14, color: c.textMuted, marginTop: 6 },
});
