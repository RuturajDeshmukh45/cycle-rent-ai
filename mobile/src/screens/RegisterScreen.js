import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { register as registerService } from '../services';
import { RADIUS, SHADOW } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const { colors, accent } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name required';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerService(form);
      const { user, token } = res.data.data;
      await login(user, token);
      Toast.show({ type: 'success', text1: 'Account created! Welcome 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  const s = styles(colors, accent);

  const Field = ({ label, icon, field, placeholder, keyboard, secure }) => (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, errors[field] && s.inputError]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} style={s.inputIcon} />
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={form[field]}
          onChangeText={t => set(field, t)}
          keyboardType={keyboard || 'default'}
          autoCapitalize={field === 'name' ? 'words' : 'none'}
          secureTextEntry={secure && !showPw}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={s.errText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logoBox}><Ionicons name="bicycle" size={32} color="#fff" /></View>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join thousands of eco riders</Text>
        </View>

        <View style={s.card}>
          <Field label="Full Name"     icon="person-outline"   field="name"     placeholder="John Doe" />
          <Field label="Email Address" icon="mail-outline"     field="email"    placeholder="name@example.com" keyboard="email-address" />
          <Field label="Password"      icon="lock-closed-outline" field="password" placeholder="••••••••" secure />
          <Field label="Phone (optional)" icon="call-outline"  field="phone"    placeholder="+91 9999999999" keyboard="phone-pad" />

          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <><Text style={s.btnText}>Create Account</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}
          </TouchableOpacity>

          <View style={s.row}>
            <Text style={s.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[s.linkText, { color: accent, fontWeight: '800' }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c, accent) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.bgPrimary },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...SHADOW.accent },
  title: { fontSize: 24, fontWeight: '900', color: c.textPrimary },
  subtitle: { fontSize: 13, color: c.textMuted, marginTop: 4 },
  card: { backgroundColor: c.bgCard, borderRadius: RADIUS.xxl, padding: 24, ...SHADOW.md, borderWidth: 1, borderColor: c.border },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: c.border, height: 50 },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginLeft: 14, marginRight: 4 },
  input: { paddingHorizontal: 8, fontSize: 15, color: c.textPrimary, height: '100%' },
  eyeBtn: { padding: 14 },
  errText: { fontSize: 11, color: '#ef4444', fontWeight: '600', marginTop: 4, marginLeft: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: accent, borderRadius: RADIUS.lg, height: 52, marginTop: 8, ...SHADOW.accent },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontSize: 13, color: c.textSecondary },
});
