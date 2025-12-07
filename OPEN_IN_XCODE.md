# 🍎 How to Open WanderTogether in Xcode

## Step-by-Step Instructions

### Step 1: Download Project from Emergent

**In Emergent:**
1. Look for a **Download** or **Export** button (usually in the top menu or ⋮ menu)
2. Click to download the entire project as a ZIP file
3. Save it to your Mac's Downloads folder

### Step 2: Extract the Project

**On your Mac:**
1. Go to your Downloads folder
2. Find `WanderTogether.zip` (or similar name)
3. Double-click to extract it
4. You'll get a folder called `WanderTogether` or similar

### Step 3: Open Terminal

1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter

### Step 4: Navigate to Project & Open in Xcode

**Copy and paste these commands one at a time:**

```bash
# Go to Downloads folder
cd ~/Downloads/WanderTogether

# Open the iOS project in Xcode
open ios/App/App.xcworkspace
```

**IMPORTANT:** Open `App.xcworkspace`, NOT `App.xcodeproj`!

### Step 5: Xcode Opens!

Xcode will launch with your WanderTogether project loaded.

---

## 🚀 What to Do in Xcode

Once Xcode opens:

1. **Wait for Indexing** (progress bar at top) - takes 2-5 minutes first time

2. **Configure Signing:**
   - Click "App" in left sidebar
   - Go to "Signing & Capabilities" tab
   - Under "Team", select your Apple Developer account
   - If not listed, click "Add Account" and sign in

3. **Connect iPhone:**
   - Connect your iPhone 16 via USB
   - Select it from the device dropdown at top

4. **Build & Run:**
   - Click the Play button (▶) or press `Cmd + R`
   - App will build and install on your iPhone!

---

## 🆘 Common Issues

**"No such file or directory"**
→ The folder name might be different. Use `cd ~/Downloads/` then `ls` to see folder names

**"Xcode is not installed"**
→ Install Xcode from Mac App Store (free, ~15GB)

**"Cannot open .xcworkspace"**
→ Make sure you're in the right directory: `pwd` should show the project folder

**"Signing error"**
→ You need an Apple Developer account ($99/year): https://developer.apple.com/programs/

---

## 📁 Project Structure

When opened in Xcode, you'll see:

```
WanderTogether/
├── ios/
│   └── App/
│       ├── App.xcworkspace  ← Open this!
│       └── App.xcodeproj
├── client/  (React frontend)
├── server/  (Node.js backend)
└── dist/    (Built assets)
```

---

## ✅ You're Ready!

Follow these steps on your Mac to open the project in Xcode and start building!

For complete build instructions, see:
- `/app/TESTFLIGHT_BUILD_GUIDE.md`
- `/app/TESTFLIGHT_QUICK_START.md`
