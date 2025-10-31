# Build WanderTogether Android APK - Simple Guide

Your Android app is **100% ready**! Since Replit doesn't include Android SDK, you'll build the APK on your computer. This is easier than it sounds - follow these steps:

---

## 📋 What You Need

1. **Android Studio** - [Download here](https://developer.android.com/studio) (free)
2. **This project** - Download from Replit
3. **Your Android phone** - For testing

---

## 🚀 Step-by-Step Instructions

### Step 1: Download Android Studio

1. Go to https://developer.android.com/studio
2. Download Android Studio for your operating system (Windows/Mac/Linux)
3. Install it (this takes about 10-15 minutes)
4. When it opens, let it download the Android SDK (happens automatically)

### Step 2: Download Your Project from Replit

**Option A: Direct Download**
1. In Replit, click the **3-dot menu** (⋮) at the top
2. Click **"Download as ZIP"**
3. Save the ZIP file to your computer
4. Extract the ZIP file to a folder (like `Documents/WanderTogether`)

**Option B: Git Clone (if you prefer)**
```bash
# Get your Replit git URL from the version control panel
git clone YOUR_REPLIT_GIT_URL
cd your-project-folder
```

### Step 3: Open the Android Project

1. Open Android Studio
2. Click **"Open"** (NOT "New Project")
3. Navigate to your extracted folder
4. Select the **`android`** folder inside your project
5. Click **"OK"**

Android Studio will take 1-2 minutes to set up the project (you'll see a progress bar).

### Step 4: Connect Your Phone

1. **Enable Developer Mode on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times (you'll see "You are now a developer!")
   
2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"
   
3. **Connect your phone to computer with USB cable**

4. **Allow debugging when prompted on your phone** (tap "OK")

### Step 5: Build and Install the App

1. In Android Studio, wait for "Gradle sync" to finish (bottom status bar)
2. At the top, you should see your phone's name in the device dropdown
3. Click the green **"Run"** button (▶) or press `Shift + F10`

**That's it!** The app will install and launch on your phone automatically!

---

## 📲 Alternative: Build APK File to Share

If you want an APK file you can share with friends or install on multiple devices:

### Option A: Debug APK (Quick)

1. In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait 1-2 minutes
3. When done, click **"locate"** in the notification
4. The APK is at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Install the APK:**
- Copy `app-debug.apk` to your phone
- Open it on your phone
- Tap "Install" (you may need to allow "Install from Unknown Sources")

### Option B: Release APK (For Production)

If you want to publish to Google Play Store or share widely:

1. Generate a signing key:
```bash
cd android/app
keytool -genkey -v -keystore wandertogether.keystore -alias wandertogether -keyalg RSA -keysize 2048 -validity 10000
```

2. In Android Studio: **Build → Generate Signed Bundle / APK**
3. Select **APK**
4. Choose your keystore file
5. Enter your password
6. Select "release" build variant
7. Click "Finish"

The signed APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎯 Quick Troubleshooting

**"Gradle sync failed"**
- Go to File → Invalidate Caches → Restart
- Make sure you have internet connection (downloads dependencies)

**"Device not showing in Android Studio"**
- Unplug and replug USB cable
- Try a different USB cable (some are charge-only)
- Check USB Debugging is enabled on phone
- Try "Revoke USB Debugging authorizations" on phone, then reconnect

**"App won't install on phone"**
- Enable "Install from Unknown Sources" in Settings → Security
- Make sure you have enough storage space
- Try uninstalling any previous version of WanderTogether

**"Build takes forever"**
- First build can take 5-10 minutes (downloads libraries)
- Subsequent builds are much faster (30 seconds)

---

## 🎉 What You'll Have

Once installed, your WanderTogether app will have:

- ✅ **Full offline support** - Works without internet
- ✅ **Native camera** - For payment proof uploads
- ✅ **Push notifications** - Trip updates & reminders
- ✅ **Geolocation** - Location sharing & check-ins
- ✅ **App icon on home screen** - Looks & feels native
- ✅ **Haptic feedback** - Touch vibrations
- ✅ **Native sharing** - Share trips via any app

---

## 📖 Additional Resources

- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Capacitor Android Development](https://capacitorjs.com/docs/android)
- [Enable Developer Mode (Video)](https://www.youtube.com/results?search_query=enable+developer+mode+android)

---

## 💡 Pro Tip: Development Workflow

Once you have this working, you can:

1. **Make changes in Replit** (easy editing & preview)
2. **Download updated project** when ready to test on phone
3. **Rebuild in Android Studio** (just click Run again)

Or develop directly in Android Studio for faster iteration!

---

**Need help?** Just ask - I can clarify any step or troubleshoot issues!
