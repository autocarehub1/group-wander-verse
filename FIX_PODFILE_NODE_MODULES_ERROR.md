# 🔧 Fix: Podfile Cannot Find node_modules

## Error You're Seeing:
```
Invalid `Podfile` file: cannot load such file -- 
/Users/emmanueleleruja/Documents/wander2geda/node_modules/@capacitor/ios/scripts/pods_helpers
```

## ✅ Root Cause:
The `node_modules` folder is missing! The iOS build needs Node.js dependencies installed first.

---

## 🎯 Quick Fix (Copy & Paste):

**Close Xcode**, then open Terminal and run:

```bash
# 1. Go to PROJECT ROOT (not ios/App!)
cd ~/Documents/wander2geda

# 2. Install Node.js dependencies
npm install
# This takes 5-10 minutes - be patient!

# 3. NOW install pods
cd ios/App
pod install

# 4. Open workspace
open App.xcworkspace
```

---

## 📋 Step-by-Step Instructions:

### Step 1: Install Node Dependencies FIRST

```bash
# Go to project root
cd ~/Documents/wander2geda

# Verify you're in the right place
ls package.json
# Should show: package.json

# Install dependencies
npm install
```

**Wait for completion!** This creates the `node_modules` folder that iOS needs.

### Step 2: Install CocoaPods

```bash
# Go to iOS folder
cd ios/App

# Install pods
pod install
```

You should see: `Pod installation complete!`

### Step 3: Open in Xcode

```bash
open App.xcworkspace
```

---

## 🔍 Why This Happens:

The iOS project (Capacitor) depends on Node.js packages in `node_modules/`. The Podfile needs:
- `@capacitor/ios` package
- Helper scripts
- Plugin configurations

Without `node_modules`, pod install can't find these files.

---

## ⚠️ Common Issues:

### "npm: command not found"
**You need Node.js installed!**

**Install Node.js:**
1. Go to https://nodejs.org
2. Download LTS version (20.x)
3. Install it
4. Restart Terminal
5. Try again: `npm install`

### "Permission denied" during npm install
**Fix:** Don't use sudo with npm
```bash
npm install
# NOT: sudo npm install
```

### npm install takes forever
**This is normal!** Installing all dependencies takes 5-10 minutes.
- Shows progress: "⸨░░░░░░░░⸩"
- Just wait patiently

### "EACCES" permission errors
**Fix:** Fix npm permissions
```bash
sudo chown -R $USER ~/.npm
npm install
```

---

## ✅ Complete Command Sequence:

Run these in order:

```bash
# Step 1: Go to project root
cd ~/Documents/wander2geda

# Step 2: Verify you're in the right place
pwd
# Should show: /Users/emmanueleleruja/Documents/wander2geda

# Step 3: Install Node dependencies (5-10 min)
npm install

# Step 4: Verify node_modules exists
ls node_modules/@capacitor/ios
# Should show files

# Step 5: Go to iOS folder
cd ios/App

# Step 6: Install pods (2-5 min)
pod install

# Step 7: Open workspace
open App.xcworkspace
```

---

## 🔍 Verify Installation:

After `npm install`, check:
```bash
cd ~/Documents/wander2geda
ls node_modules/@capacitor/ios/scripts/pods_helpers.rb
```

Should show the file path - means it's there!

---

## 📦 What Gets Installed:

**npm install creates:**
- `node_modules/` folder (~500MB)
- All JavaScript dependencies
- Capacitor iOS packages
- Helper scripts

**pod install creates:**
- `Pods/` folder
- Native iOS libraries
- Configuration files

**Both are required!**

---

## ⚡ Alternative: Use Yarn (Faster)

If you have Yarn installed:
```bash
cd ~/Documents/wander2geda
yarn install
cd ios/App
pod install
open App.xcworkspace
```

---

## 🎯 Success Checklist:

- [ ] Node.js installed (check: `node --version`)
- [ ] In project root (check: `pwd`)
- [ ] Ran `npm install` successfully
- [ ] `node_modules/` folder exists
- [ ] `node_modules/@capacitor/ios/` exists
- [ ] Ran `pod install` successfully
- [ ] `Pods/` folder exists
- [ ] Opening `App.xcworkspace`
- [ ] Xcode builds without errors

---

## 💡 Remember For Future:

**Order matters!**
1. ✅ First: `npm install` (at project root)
2. ✅ Then: `pod install` (in ios/App/)
3. ✅ Finally: Open `App.xcworkspace`

---

## 🆘 Still Having Issues?

### If npm install fails with network errors:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### If pod install still fails:
```bash
# Make sure you're in the right directory
cd ~/Documents/wander2geda/ios/App
pwd
# Should show: .../wander2geda/ios/App

# Try pod install again
pod install
```

### If nothing works:
```bash
# Nuclear option - reinstall everything
cd ~/Documents/wander2geda
rm -rf node_modules package-lock.json
npm install

cd ios/App
rm -rf Pods Podfile.lock
pod install

open App.xcworkspace
```

---

## ✅ Expected Timeline:

- npm install: 5-10 minutes
- pod install: 2-5 minutes
- First Xcode build: 5-10 minutes
- **Total: ~20 minutes**

Be patient! This is normal for first-time setup.
