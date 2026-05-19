import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile } from '../services';
import { RADIUS, SHADOW } from '../theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { colors, accent, dark, toggle } = useTheme();
  const [editing, setEditing]   = useState(false);
  const [form,    setForm]       = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { Toast.show({ type: 'error', text1: 'Name is required' }); return; }
    setLoading(true);
    try {
      const res = await updateProfile(form);
      await updateUser(res.data?.data);
      Toast.show({ type: 'success', text1: 'Profile updated! ✅' });
      setEditing(false);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const s = styles(colors, accent);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        {user?.role === 'admin' && (
          <View style={s.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={accent} />
            <Text style={[s.adminText, { color: accent }]}>Administrator</Text>
          </View>
        )}
      </View>

      {/* Edit form */}
      <View style={s.card}>
        <View style={s.cardHeaderRow}>
          <Text style={s.cardTitle}>Personal Info</Text>
          <TouchableOpacity onPress={() => { setEditing(e => !e); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}>
            <Ionicons name={editing ? 'close' : 'pencil-outline'} size={20} color={accent} />
          </TouchableOpacity>
        </View>

        {[
          { label: 'Full Name', key: 'name', icon: 'person-outline', keyboard: 'default', cap: 'words' },
          { label: 'Phone', key: 'phone', icon: 'call-outline', keyboard: 'phone-pad', cap: 'none' },
        ].map(({ label, key, icon, keyboard, cap }) => (
          <View key={key} style={s.fieldWrap}>
            <Text style={s.label}>{label}</Text>
            <View style={[s.inputRow, !editing && s.inputDisabled]}>
              <Ionicons name={icon} size={16} color={colors.textMuted} style={{ marginLeft: 14 }} />
              <TextInput
                style={s.input}
                value={editing ? form[key] : (user?.[key] || '—')}
                onChangeText={t => setForm(f => ({ ...f, [key]: t }))}
                editable={editing}
                keyboardType={keyboard}
                autoCapitalize={cap}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        ))}

        {/* Email (read-only) */}
        <View style={s.fieldWrap}>
          <Text style={s.label}>Email (read-only)</Text>
          <View style={[s.inputRow, s.inputDisabled]}>
            <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={{ marginLeft: 14 }} />
            <Text style={[s.input, { color: colors.textMuted, paddingTop: 14 }]}>{user?.email}</Text>
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Settings */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Settings</Text>
        <View style={s.settingRow}>
          <View style={s.settingLeft}>
            <Ionicons name={dark ? 'moon' : 'sunny'} size={20} color={accent} />
            <Text style={s.settingText}>Dark Mode</Text>
          </View>
          <Switch value={dark} onValueChange={toggle} trackColor={{ false: colors.border, true: accent + '80' }} thumbColor={dark ? accent : '#fff'} />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={s.version}>EcoCycle v1.0.0 · Sustainable Urban Mobility</Text>
    </ScrollView>
  );
}

const styles = (c, accent) => StyleSheet.create({
  screen:        { flex: 1, backgroundColor: c.bgPrimary },
  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, backgroundColor: c.bgCard, borderBottomWidth: 1, borderBottomColor: c.border },
  avatar:        { width: 80, height: 80, borderRadius: 26, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...SHADOW.accent },
  avatarText:    { fontSize: 28, fontWeight: '900', color: '#fff' },
  name:          { fontSize: 20, fontWeight: '900', color: c.textPrimary },
  email:         { fontSize: 13, color: c.textMuted, marginTop: 4 },
  adminBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: accent + '15', borderRadius: 20 },
  adminText:     { fontSize: 12, fontWeight: '700' },
  card:          { margin: 16, marginBottom: 0, backgroundColor: c.bgCard, borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: c.border, ...SHADOW.sm },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:     { fontSize: 16, fontWeight: '800', color: c.textPrimary },
  fieldWrap:     { marginBottom: 14 },
  label:         { fontSize: 11, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: c.border, height: 48 },
  inputDisabled: { opacity: 0.7 },
  input:         { flex: 1, paddingHorizontal: 10, fontSize: 14, color: c.textPrimary, height: '100%' },
  saveBtn:       { backgroundColor: accent, borderRadius: RADIUS.lg, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4, ...SHADOW.accent },
  saveBtnText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  settingRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  settingLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText:   { fontSize: 15, color: c.textPrimary, fontWeight: '600' },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 16, borderRadius: RADIUS.xl, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430' },
  logoutText:    { fontSize: 15, fontWeight: '800', color: '#ef4444' },
  version:       { textAlign: 'center', fontSize: 11, color: c.textMuted, marginBottom: 8 },
});
