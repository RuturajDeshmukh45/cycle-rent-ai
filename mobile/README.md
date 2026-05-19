# EcoCycle Mobile App 🚲

React Native (Expo) mobile app for EcoCycle — works on both **Android & iOS**.

---

## 📋 Prerequisites

Install these on your computer:

1. **Node.js** (v18+) → https://nodejs.org
2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```
3. **Expo Go app** on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

---

## 🚀 Setup & Run

### Step 1 — Install dependencies
```bash
cd ecocycle-mobile
npm install
```

### Step 2 — Configure API URL

Open `src/services/api.js` and update the `API_BASE_URL`:

```js
// For Android Emulator (AVD):
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator:
export const API_BASE_URL = 'http://localhost:5000/api';

// For Real Device (phone on same WiFi as your computer):
// Find your computer's local IP (run `ipconfig` on Windows or `ifconfig` on Mac/Linux)
export const API_BASE_URL = 'http://192.168.X.X:5000/api';
```

### Step 3 — Start your backend
```bash
cd ../backend
npm run dev
```
Make sure the backend runs on port **5000**.

### Step 4 — Start the mobile app
```bash
cd ecocycle-mobile
npx expo start
```

### Step 5 — Open on your device
- **Real phone**: Scan the QR code with the **Expo Go** app
- **Android Emulator**: Press `a` in the terminal
- **iOS Simulator**: Press `i` in the terminal (Mac only)

---

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| **Login** | Email + password sign in |
| **Register** | Create new account |
| **Home (Dashboard)** | Browse available cycles, search & filter |
| **Cycle Details** | View cycle info + book it |
| **My Rides** | Active & past bookings, complete/cancel, rate rides |
| **History** | Full ride history with cost summary |
| **Profile** | Edit name/phone, dark mode toggle, logout |

---

## 🔨 Build APK / IPA for Distribution

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA
```bash
eas build --platform ios
```

---

## 🛠️ Project Structure

```
ecocycle-mobile/
├── App.js                     # Root navigator
├── app.json                   # Expo config
├── src/
│   ├── context/
│   │   ├── AuthContext.js     # Login/logout state
│   │   └── ThemeContext.js    # Dark/light mode
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── CycleDetailsScreen.js
│   │   ├── MyRidesScreen.js   # Includes review/rating
│   │   ├── HistoryScreen.js
│   │   └── ProfileScreen.js
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   └── index.js           # All API calls
│   └── theme.js               # Colors, shadows, radius
└── assets/                    # App icons & splash
```

---

## ⚠️ Troubleshooting

**"Network Error" on real device?**
→ Make sure phone and computer are on the **same WiFi**
→ Update `API_BASE_URL` in `src/services/api.js` with your computer's local IP

**Android Emulator can't connect?**
→ Use `http://10.0.2.2:5000/api` (not `localhost`)

**Expo Go shows blank screen?**
→ Run `npx expo start --clear` to clear cache

**Port already in use?**
→ Run `npx expo start --port 8082`
