# Build WanderTogether for iPhone 16 on Your Mac

Your iOS app is **100% ready to build!** Follow these steps to get WanderTogether running on your iPhone 16.

---

## 📋 What You Need

- ✅ Mac computer (any macOS version from 2020+)
- ✅ iPhone 16 with USB cable
- ✅ Xcode (free from Mac App Store)
- ✅ Apple ID (free - you already have one for your iPhone)

**Total time:** 30-45 minutes (most is waiting for Xcode to download)

---

## 🚀 Step-by-Step Instructions

### Step 1: Install Xcode on Your Mac

1. **Open Mac App Store** on your Mac
2. **Search for "Xcode"**
3. **Click "Get" then "Install"**
   - This is a large download (~15GB)
   - Takes 30-60 minutes depending on your internet
4. **Open Xcode once installed**
   - Agree to license agreement
   - Let it install additional components (5-10 minutes)
   - You can close it after setup completes

✅ **One-time setup - you only do this once!**

---

### Step 2: Download Your Project from Replit

**On this Replit page:**

1. Click the **3-dot menu** (⋮) in the top right
2. Select **"Download as ZIP"**
3. Save the file (e.g., `wandertogether.zip`)
4. Go to your **Downloads folder**
5. **Double-click the ZIP file** to extract it
6. **Move the extracted folder** to a permanent location:
   - Good: `Documents/WanderTogether`
   - Good: `Desktop/WanderTogether`
   - Bad: Leave it in Downloads (files might get deleted)

---

### Step 3: Install Node Dependencies FIRST! ⚠️

**IMPORTANT:** The downloaded ZIP doesn't include `node_modules` (too large). You must install dependencies first!

1. **Open Terminal** on your Mac (Applications → Utilities → Terminal)

2. **Navigate to your project folder:**
   ```bash
   cd ~/Documents/WanderTogether
   ```
   (Adjust path if you put it somewhere else)

3. **Install all dependencies:**
   ```bash
   npm install
   ```
   - This takes 2-5 minutes
   - Downloads all packages including @capacitor/ios
   - You'll see progress bars
   - Wait for "added XXX packages" message

✅ **Critical step - don't skip this!**

---

### Step 4: Install iOS CocoaPods Dependencies

Now install the iOS native dependencies.

1. **In Terminal (still open from Step 3):**

2. **Navigate to the iOS folder:**
   ```bash
   cd ios/App
   ```

3. **Install CocoaPods (if not already installed):**
   ```bash
   sudo gem install cocoapods
   ```
   - Enter your Mac password when prompted
   - Takes 2-3 minutes

4. **Install dependencies:**
   ```bash
   pod install
   ```
   - This installs all 9 Capacitor plugins
   - Takes 1-2 minutes
   - You'll see "Pod installation complete!"

✅ **Done!**

---

### Step 5: Open the iOS Project in Xcode

1. **Open Finder** and navigate to your project folder
2. Go into: `ios/App/`
3. **Double-click `App.xcworkspace`**
   - ⚠️ **Important:** Open `.xcworkspace` NOT `.xcodeproj`
   - The workspace file includes all dependencies

4. Xcode will open and show your project
5. **Wait for indexing to complete** (watch the top progress bar)
   - This takes 1-2 minutes the first time
   - You'll see "Indexing..." then it disappears when done

---

### Step 6: Configure App Signing

1. **In Xcode, select the "App" project** (top of left sidebar)
2. **Click on the "App" target** (under "TARGETS" in main area)
3. **Go to "Signing & Capabilities" tab** (top of main area)

4. **Under "Team" dropdown:**
   - If you see your Apple ID → Select it ✅
   - If not:
     - Click "Add Account..."
     - Sign in with your Apple ID
     - Select your account from dropdown

5. **Xcode will automatically:**
   - Create a provisioning profile
   - Register your app ID
   - Sign your app

You'll see: ✅ **"Signing for 'App' requires a development team..."** → Fixed automatically!

---

### Step 7: Connect Your iPhone 16

1. **Unlock your iPhone 16**
2. **Connect it to your Mac** using USB cable
3. **On your iPhone:** Tap **"Trust This Computer"** when prompted
4. **Enter your iPhone passcode**

5. **In Xcode:** Look at the top toolbar
   - Click the device dropdown (next to "App" button)
   - You should see your iPhone name → **Select it**
   - Example: "Noah's iPhone 16"

---

### Step 8: Build and Run! 🎉

1. **Click the big Play button** (▶) in top left of Xcode
   - Or press `Cmd + R`

2. **First time only:** Xcode will show an error on your iPhone:
   - "Untrusted Developer" or "Verify App"

3. **On your iPhone 16:**
   - Go to **Settings → General → VPN & Device Management**
   - Find your Apple ID under "Developer App"
   - Tap it → **Tap "Trust [Your Apple ID]"**
   - Tap **"Trust"** in popup

4. **Go back to Xcode** and click Play ▶ again

**🎉 The app will install and launch on your iPhone 16!**

---

## ✅ What You'll Have

Your WanderTogether app on iPhone 16 with:

- ✅ **Native camera** - Full camera access for payment proofs
- ✅ **Push notifications** - Real-time trip updates
- ✅ **Geolocation** - Location sharing & check-ins
- ✅ **Offline support** - Works without internet
- ✅ **Native performance** - Smooth iOS experience
- ✅ **App icon** - On your home screen
- ✅ **Haptic feedback** - Touch vibrations
- ✅ **Native sharing** - Share via Messages, WhatsApp, etc.
- ✅ **All 9 native plugins** - Camera, GPS, Notifications, Haptics, Share, Status Bar, Keyboard, Device, App

---

## 🔄 Making Updates

After you make changes to your app on Replit:

1. **Download the updated ZIP** from Replit
2. **Extract and replace** the old folder
3. **In Terminal:**
   ```bash
   cd ~/Documents/WanderTogether
   npm run build
   npx cap sync ios
   ```
4. **In Xcode:** Click Play ▶ to rebuild

The app updates on your iPhone automatically!

---

## 🐛 Troubleshooting

### "Could not locate device support files"
- **Fix:** Update Xcode from Mac App Store
- Your iPhone 16 requires latest Xcode version

### "iPhone is busy: Preparing debugger support"
- **Fix:** Wait 1-2 minutes, it's loading symbols
- Happens on first connect after iOS update

### "Build Failed" or red errors
1. **Product → Clean Build Folder** (or `Cmd + Shift + K`)
2. **Close Xcode**
3. **In Terminal:**
   ```bash
   cd ~/Documents/WanderTogether/ios/App
   pod install
   ```
4. **Re-open `App.xcworkspace` in Xcode**
5. **Try again**

### "Untrusted Developer" won't go away
- Make sure you're going to: Settings → **General** → VPN & Device Management
- Not: Settings → Privacy (wrong location)

### Can't find device in Xcode dropdown
- Unplug and replug USB cable
- Try different USB port
- Make sure iPhone is unlocked
- Restart Xcode

---

## 📱 Sharing with Friends (Optional)

Want to share the app with other iPhone users?

### Option: TestFlight (Beta Testing)

1. **Join Apple Developer Program** ($99/year)
   - https://developer.apple.com/programs/

2. **In Xcode:**
   - Product → Archive
   - Wait for archive to complete
   - Window → Organizer
   - Select archive → "Distribute App"
   - Choose "TestFlight & App Store"

3. **On App Store Connect:**
   - https://appstoreconnect.apple.com
   - Add testers by email
   - They install TestFlight app
   - They get your app

**Free alternative:** Build the app on each person's phone (same steps)

---

## 📖 Additional Resources

- **Xcode Help:** Help → Xcode Help (in Xcode menu)
- **Capacitor iOS Docs:** https://capacitorjs.com/docs/ios
- **Apple Developer:** https://developer.apple.com/support/

---

## 🎯 Quick Reference

**Most Common Commands:**

```bash
# Navigate to project
cd ~/Documents/WanderTogether

# Rebuild web assets
npm run build

# Sync to iOS
npx cap sync ios

# Install/update dependencies
cd ios/App
pod install
```

**Most Common Fixes:**

1. Build failed → Clean build folder (`Cmd + Shift + K`)
2. Pod errors → `pod install` again
3. Device not showing → Unplug and replug iPhone
4. App won't launch → Check trust settings on iPhone

---

**You're all set!** Follow the steps above and you'll have WanderTogether running natively on your iPhone 16. Each step is straightforward - just take it one at a time.

**Questions?** Let me know if you get stuck on any step!
