# 🚀 TestFlight Quick Start - 15 Minute Version

## ⚠️ Prerequisites
- ✅ Mac with Xcode installed
- ✅ Apple Developer account ($99/year) - Sign up: https://developer.apple.com/programs/
- ✅ Project downloaded from Emergent

---

## 🎯 Fast Track Steps

### 1. Create App in App Store Connect (5 min)
```
1. Go to https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Name: WanderTogether
4. Bundle ID: com.wandertogether.app (create new)
5. SKU: wandertogether-001
6. Create
```

### 2. Open in Xcode (2 min)
```bash
cd ~/Downloads/WanderTogether  # or wherever you saved it
open ios/App/App.xcworkspace   # NOT .xcodeproj!
```

### 3. Configure Signing (1 min)
```
1. Click "App" in sidebar
2. Signing & Capabilities tab
3. Team → Select your Apple ID
4. Auto-signing should work ✓
```

### 4. Test on iPhone (2 min)
```
1. Connect iPhone via USB
2. Select iPhone from device dropdown
3. Click Play ▶ button
4. On iPhone: Settings → General → Device Management → Trust
5. Test the app!
```

### 5. Archive & Upload (5 min)
```
1. Device dropdown → Select "Any iOS Device"
2. Product → Archive (wait 5-10 min)
3. Distribute App → App Store Connect
4. Upload → Next → Next → Upload
5. Wait for "Upload Successful"
```

### 6. Set Up TestFlight (10 min)
```
1. Go back to App Store Connect
2. TestFlight tab (wait for processing 10-30 min)
3. Add Test Information:
   - What to Test: "Test all features"
   - Feedback Email: your@email.com
4. Export Compliance: No cryptography
5. Add Testers → Enter emails
6. Send Invites!
```

---

## 📱 Testers Install App

```
1. Check email for TestFlight invite
2. Install TestFlight app from App Store
3. Open invite link
4. Tap Install in TestFlight
5. Done!
```

---

## 🔄 Push Updates

```
1. In Xcode: Increment Build number
2. Product → Clean Build Folder
3. Product → Archive
4. Distribute to TestFlight
5. Testers auto-update!
```

---

## ⚠️ Requirements You NEED

**Apple Developer Account** ($99/year):
- Sign up: https://developer.apple.com/programs/
- Takes 24-48 hours to activate
- Required for TestFlight

**Privacy Policy URL** (required):
- Use generator: https://www.privacypolicygenerator.info/
- Or host on GitHub Pages (free)
- See full guide for template

---

## 🆘 Quick Fixes

**"Signing Error"**
→ Check Apple Developer account is paid/active

**"Archive button grayed"**
→ Select "Any iOS Device", not your iPhone

**"Build still processing"**
→ Wait 10-30 min, check email for completion

**"Testers can't install"**
→ Check they have TestFlight app + correct email

---

## 📚 Full Detailed Guide

See `/app/TESTFLIGHT_BUILD_GUIDE.md` for:
- Complete step-by-step instructions
- Troubleshooting for all issues
- Privacy policy template
- App Store submission guide
- Screenshots guide

---

## ⏱️ Time Required

- **First Time**: 2-3 hours (including Xcode install)
- **After Setup**: 30 minutes per update
- **TestFlight Processing**: 10-30 minutes

---

## 🎯 Your App is Ready!

Everything is configured and synced. Download the project to your Mac and follow these steps!

**Need help?** Check the full guide: `/app/TESTFLIGHT_BUILD_GUIDE.md`
