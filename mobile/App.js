import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen        from './src/screens/LoginScreen';
import RegisterScreen     from './src/screens/RegisterScreen';
import DashboardScreen    from './src/screens/DashboardScreen';
import CycleDetailsScreen from './src/screens/CycleDetailsScreen';
import MyRidesScreen      from './src/screens/MyRidesScreen';
import HistoryScreen      from './src/screens/HistoryScreen';
import ProfileScreen      from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Bottom Tab Navigator ──────────────────────────────────────────
function MainTabs() {
  const { colors, accent, dark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '900', fontSize: 18, color: colors.textPrimary },
        headerTintColor: accent,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
          elevation: 0,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:    focused ? 'bicycle'        : 'bicycle-outline',
            Rides:   focused ? 'list'           : 'list-outline',
            History: focused ? 'time'           : 'time-outline',
            Profile: focused ? 'person'         : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'apps'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={DashboardScreen} options={{ title: 'EcoCycle', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Rides"   component={MyRidesScreen}   options={{ title: 'My Rides' }} />
      <Tab.Screen name="History" component={HistoryScreen}   options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}   options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ── Root Stack (handles auth + cycle details modal) ───────────────
function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const { colors, accent }      = useTheme();

  if (loading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bgPrimary }]}>
        <View style={[styles.splashLogo, { backgroundColor: accent }]}>
          <Ionicons name="bicycle" size={40} color="#fff" />
        </View>
        <Text style={[styles.splashTitle, { color: colors.textPrimary }]}>EcoCycle</Text>
        <ActivityIndicator color={accent} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main"         component={MainTabs} />
          <Stack.Screen
            name="CycleDetails"
            component={CycleDetailsScreen}
            options={{
              headerShown: true,
              title: 'Cycle Details',
              headerStyle: { backgroundColor: colors.bgCard },
              headerTintColor: accent,
              headerTitleStyle: { fontWeight: '900', color: colors.textPrimary },
              presentation: 'card',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── App Root ──────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashLogo:  { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  splashTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
});
