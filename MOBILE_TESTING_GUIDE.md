# WanderTogether Mobile Testing Guide

## How to Run the App on Your Phone

Your WanderTogether app is now ready to run as a native Android app! Here are your options:

---

## 🚀 Option 1: Web Browser Testing (Easiest - Start Here!)

Since WanderTogether is a Progressive Web App (PWA), you can test most features directly in your phone's browser:

### Steps:
1. **Open your phone's browser** (Chrome, Safari, etc.)
2. **Navigate to your Replit webview URL** (the public URL shown in Replit)
3. **Add to Home Screen** for an app-like experience:
   - **Android**: Tap menu (⋮) → "Add to Home Screen"
   - **iOS**: Tap Share (□↑) → "Add to Home Screen"

### What Works:
- ✅ All trip planning features
- ✅ Invitations & QR codes
- ✅ Expense tracking
- ✅ Group messaging
- ✅ Activity planning
- ✅ Most UI interactions

### Limitations:
- ⚠️ Some native features require the full app (camera for payment proofs, push notifications)

---

## 📱 Option 2: Build Native Android APK (Full Native Experience)

To test ALL features including native plugins (Camera, Geolocation, Push Notifications), build the Android app:

### Prerequisites:
- Install [Android Studio](https://developer.android.com/studio)
- Enable Developer Mode on your Android phone
- Enable USB Debugging on your phone

### Steps:

#### 1. Download Project Files
Since you're on Replit, you'll need to download your project to your local machine:
- Click the 3-dot menu in Replit → Download as ZIP
- Extract the ZIP file on your computer

#### 2. Open in Android Studio
```bash
cd your-extracted-folder
npx cap open android
```

This opens the Android project in Android Studio.

#### 3. Connect Your Phone
- Connect your phone via USB
- Allow USB debugging when prompted on phone
- Select your device in Android Studio (top toolbar)

#### 4. Run the App
- Click the green "Run" button (▶) in Android Studio
- The app will install and launch on your phone!

---

## 🔄 Option 3: Live Reload Testing (Best for Development)

Test with instant updates as you code:

### Prerequisites:
- Your phone and computer on same WiFi network
- Install Ionic CLI: `npm install -g @ionic/cli`

### Steps:
```bash
# Build the app
npm run build

# Run with live reload
ionic cap run android --livereload --external
```

Your phone will connect to your development server and reload instantly when you save changes!

---

## 🎯 Recommended Testing Flow

1. **Start with Web Browser** → Test core functionality quickly
2. **Add to Home Screen** → Get app-like feel
3. **Build Native APK** → Test camera, notifications, and full native features when needed

---

## 📦 What's Already Configured

Your app has these native features ready:
- 📷 **Camera** - For payment proof uploads
- 📍 **Geolocation** - For location sharing & check-ins  
- 🔔 **Push Notifications** - For trip updates & reminders
- 📱 **Status Bar** - Native status bar customization
- ⌨️ **Keyboard** - Smart keyboard handling
- 📤 **Share** - Native share dialogs
- 📳 **Haptics** - Touch feedback
- 📱 **Device Info** - Platform detection
- 🔧 **App** - App lifecycle management

---

## 🐛 Troubleshooting

**"App won't install on phone"**
- Enable "Install from Unknown Sources" in phone settings
- Check phone has enough storage space

**"Camera/Location not working"**
- Grant permissions when prompted
- Check Android app permissions in Settings

**"Can't connect to development server"**
- Ensure phone and computer on same WiFi
- Check firewall isn't blocking port 5000

---

## 📖 Additional Resources

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Capacitor Workflow Guide](https://capacitorjs.com/docs/basics/workflow)
- [Android Studio Guide](https://developer.android.com/studio/intro)
