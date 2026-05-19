import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { login as loginService } from '../services';
import { RADIUS, SHADOW } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors, accent } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginService({ email, password });
      const { user, token } = res.data.data;
      await login(user, token);
      Toast.show({ type: 'success', text1: `Welcome back, ${user.name.split(' ')[0]}! 🚲` });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Invalid credentials' });
    } finally { setLoading(false); }
  };

  const s = styles(colors, accent);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Ionicons name="bicycle" size={32} color="#fff" />
          </View>
          <Text style={s.title}>EcoCycle</Text>
          <Text style={s.subtitle}>Sustainable Urban Mobility</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <Text style={s.cardSubtitle}>Enter your details to continue</Text>

          {/* Email */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Email Address</Text>
            <View style={[s.inputRow, errors.email && s.inputError]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={s.errText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={[s.inputRow, errors.password && s.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errText}>{errors.password}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <><Text style={s.btnText}>Sign In</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}
          </TouchableOpacity>

          {/* Register link */}
          <View style={s.row}>
            <Text style={s.linkText}>New to EcoCycle? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[s.linkText, { color: accent, fontWeight: '800' }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Ionicons name="leaf" size={12} color={accent} />
          <Text style={s.footerText}>  Zero Emissions • Smart Booking • AI Routes</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c, accent) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.bgPrimary },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...SHADOW.accent },
  title: { fontSize: 28, fontWeight: '900', color: c.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: c.textMuted, marginTop: 4 },
  card: { backgroundColor: c.bgCard, borderRadius: RADIUS.xxl, padding: 24, ...SHADOW.md, borderWidth: 1, borderColor: c.border },
  cardTitle: { fontSize: 22, fontWeight: '900', color: c.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: c.textSecondary, marginBottom: 24 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: c.border, height: 50 },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginLeft: 14, marginRight: 4 },
  input: { flex: 1, paddingHorizontal: 8, fontSize: 15, color: c.textPrimary, height: '100%' },
  eyeBtn: { padding: 14 },
  errText: { fontSize: 11, color: '#ef4444', fontWeight: '600', marginTop: 4, marginLeft: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: accent, borderRadius: RADIUS.lg, height: 52, marginTop: 8, ...SHADOW.accent },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontSize: 13, color: c.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  footerText: { fontSize: 11, color: c.textMuted },
});
