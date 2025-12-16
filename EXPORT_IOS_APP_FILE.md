# 📦 Export iOS App File (.ipa) from Xcode

## 🎯 Goal
Build your iOS app and export the .ipa file to your Downloads folder

---

## ✅ Prerequisites

Make sure you've already done:
- [ ] `npm install` (at project root)
- [ ] `pod install` (in ios/App/)
- [ ] Opened `App.xcworkspace` in Xcode
- [ ] Configured code signing with your Apple Developer account

---

## 🚀 Option 1: Export for Device Testing (.ipa file)

### Step 1: Select Device
In Xcode, at the top toolbar:
- Click device dropdown
- Select **"Any iOS Device (arm64)"** or **"Generic iOS Device"**

**Don't select a specific iPhone!**

### Step 2: Archive the App
1. Go to menu: **Product** → **Archive**
2. Wait for build to complete (5-10 minutes)
3. Organizer window opens automatically

If Organizer doesn't open:
- Go to **Window** → **Organizer**
- Click **"Archives"** tab

### Step 3: Export App
1. Select your archive (most recent one)
2. Click **"Distribute App"** button on the right
3. Select **"Development"** (for testing on your devices)
4. Click **"Next"**

### Step 4: Choose Export Options
1. Select **"Export"** (not Upload)
2. Click **"Next"**
3. **Distribution options:**
   - ✅ "App Thinning: None" 
   - ✅ "Rebuild from Bitcode: ❌" (uncheck)
   - ✅ "Strip Swift symbols: ✅" (optional)
4. Click **"Next"**

### Step 5: Re-sign (if needed)
1. Select your development certificate
2. Select provisioning profile
3. Click **"Next"**

### Step 6: Choose Export Location
1. Navigate to **Downloads** folder
2. Create folder name: "WanderTogether-App"
3. Click **"Export"**

### Step 7: Find Your .ipa File
```bash
# Your app is now at:
~/Downloads/WanderTogether-App/App.ipa
```

---

## 📱 Option 2: Quick Build for Connected iPhone

If you just want to install on your connected iPhone:

### Steps:
1. Connect iPhone via USB
2. Select your iPhone from device dropdown
3. Click Play (▶) button
4. App builds and installs automatically!

**Note:** This doesn't create a .ipa file, just installs directly.

---

## 🎯 Option 3: Export for TestFlight

For TestFlight distribution:

### Step 1: Archive
1. Select **"Any iOS Device"**
2. **Product** → **Archive**
3. Wait for completion

### Step 2: Distribute to TestFlight
1. Click **"Distribute App"**
2. Select **"App Store Connect"**
3. Click **"Next"**
4. Select **"Upload"** (not Export)
5. Click **"Next"**
6. Configure options → **"Next"**
7. Click **"Upload"**

**Result:** App uploads to App Store Connect (no local .ipa file)

---

## 📂 Finding Exported Files

### Default Archive Location:
```bash
~/Library/Developer/Xcode/Archives/
```

### Export Location (you choose):
When you export, you select where to save. Common locations:
- `~/Downloads/`
- `~/Desktop/`
- `~/Documents/`

### View in Finder:
In Xcode Organizer:
1. Right-click your archive
2. Select **"Show in Finder"**
3. This shows the .xcarchive file

For the .ipa:
1. After export completes
2. Click **"Show in Finder"** in the dialog
3. Your .ipa file is there!

---

## 📦 What You Get

### .ipa File Contains:
- Compiled app code
- All assets and resources
- Code signing information
- Ready to install on iOS devices

### File Size:
- Typical size: 50-100 MB
- Depends on assets and code

---

## 🔧 Install .ipa on iPhone

### Method 1: Using Xcode
1. Connect iPhone via USB
2. Open Xcode
3. **Window** → **Devices and Simulators**
4. Select your iPhone
5. Click **+** under "Installed Apps"
6. Select your .ipa file
7. App installs!

### Method 2: Using Apple Configurator
1. Download Apple Configurator 2 (Mac App Store - free)
2. Connect iPhone
3. Select device
4. Click **Add** → **Apps**
5. Select your .ipa file
6. Install

### Method 3: Using AirDrop (if .ipa is signed)
1. AirDrop .ipa to iPhone
2. Open on iPhone
3. Tap to install (if properly signed)

---

## ⚠️ Common Issues

### "Failed to create provisioning profile"
**Fix:** 
1. Make sure Apple Developer account is active
2. Check Bundle ID matches App Store Connect
3. Try **"Automatically manage signing"**

### "No valid signing identity"
**Fix:**
1. Xcode → Preferences → Accounts
2. Select your Apple ID
3. Click **"Download Manual Profiles"**
4. Try archive again

### Archive button is grayed out
**Fix:**
1. Select "Any iOS Device" (not simulator)
2. Make sure no build errors
3. Clean build: **Product** → **Clean Build Folder**

### Export fails with codesign error
**Fix:**
1. In Xcode, verify signing settings
2. Try **"Development"** distribution instead of **"Ad Hoc"**
3. Make sure certificate is not expired

---

## 🎯 Quick Reference Commands

### Terminal Commands (on your Mac):

```bash
# Navigate to project
cd ~/Documents/wander2geda

# Find exported apps
ls ~/Downloads/WanderTogether-App/

# Check if .ipa exists
ls ~/Downloads/WanderTogether-App/App.ipa

# Copy to specific location
cp ~/Downloads/WanderTogether-App/App.ipa ~/Desktop/

# View archive location
open ~/Library/Developer/Xcode/Archives/
```

---

## 📋 Export Checklist

- [ ] npm install completed
- [ ] pod install completed
- [ ] Project builds without errors
- [ ] Code signing configured
- [ ] Selected "Any iOS Device"
- [ ] Archived successfully
- [ ] Exported to Downloads folder
- [ ] .ipa file exists
- [ ] Can install on iPhone

---

## 🔍 Verify Export

After export, verify:
```bash
# Check file exists
ls ~/Downloads/WanderTogether-App/App.ipa

# Check file size (should be 50-100 MB)
ls -lh ~/Downloads/WanderTogether-App/App.ipa

# Show info
file ~/Downloads/WanderTogether-App/App.ipa
```

Should show: "iOS App Store Package"

---

## 📱 Distribution Options

### For Testing (Development):
- Export as .ipa
- Install via Xcode or Apple Configurator
- Limited to registered devices (up to 100)

### For Beta Testing (TestFlight):
- Upload to App Store Connect
- Add testers by email
- Up to 10,000 testers
- Requires Apple Developer account ($99/year)

### For Public (App Store):
- Submit for review
- Available to everyone
- Requires Apple Developer account ($99/year)

---

## ⏱️ Timeline

**Archive & Export Process:**
- Archive: 5-10 minutes
- Export: 1-2 minutes
- **Total: ~10 minutes**

**First Time:**
- May take longer (15-20 min)
- Xcode downloads additional components

---

## 💡 Pro Tips

1. **Name your archives:**
   - In Xcode, before archiving
   - Edit scheme → Archive → Name
   - Easier to identify later

2. **Keep archives organized:**
   - Organizer shows all archives
   - Can delete old ones
   - Right-click → Delete

3. **Version numbers:**
   - Increment before each archive
   - Helps track different builds
   - In Xcode: Version & Build numbers

4. **Test before distributing:**
   - Always test .ipa on real device
   - Make sure all features work
   - Check signing is correct

---

## 🎉 Success!

Once exported, you'll have:
- `App.ipa` file in Downloads folder
- Ready to install on iPhone
- Ready to share or distribute
- Can upload to TestFlight

---

## 📞 Need Help?

If export fails, check:
1. All pods installed correctly
2. No build errors in Xcode
3. Code signing configured
4. Apple Developer account active
5. Bundle ID matches App Store Connect

Still stuck? See:
- `TESTFLIGHT_BUILD_GUIDE.md` for detailed instructions
- Apple's Xcode documentation
- Developer Forums: https://developer.apple.com/forums/
