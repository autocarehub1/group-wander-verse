# 🔧 Fix: CocoaPods Configuration Error

## Error You're Seeing:
```
Unable to open base configuration reference file
'Pods/Target Support Files/Pods-App/Pods-App.debug.xcconfig'
```

## ✅ Quick Fix (5 minutes)

### Step 1: Close Xcode
Close Xcode completely (Cmd + Q)

### Step 2: Open Terminal
1. Press `Cmd + Space`
2. Type "Terminal"
3. Press Enter

### Step 3: Navigate to Project
```bash
cd ~/Documents/wander2geda/ios/App
```

### Step 4: Install CocoaPods (if needed)
Check if CocoaPods is installed:
```bash
pod --version
```

**If you get "command not found"**, install it:
```bash
sudo gem install cocoapods
```
(Enter your Mac password when prompted)

### Step 5: Install Dependencies
```bash
pod install
```

This will:
- Download all iOS dependencies
- Create the `Pods/` folder
- Generate configuration files
- Take 2-5 minutes

You should see:
```
Pod installation complete! There are 11 dependencies...
```

### Step 6: Open the CORRECT File
```bash
open App.xcworkspace
```

**IMPORTANT:** Open `App.xcworkspace`, NOT `App.xcodeproj`!

### Step 7: Build in Xcode
- Wait for indexing to complete
- Click Play (▶) button
- App should build successfully!

---

## 🎯 Complete Command Sequence

Copy and paste these commands one at a time:

```bash
# 1. Go to iOS project
cd ~/Documents/wander2geda/ios/App

# 2. Install pods
pod install

# 3. Open workspace
open App.xcworkspace
```

---

## ⚠️ Common Issues

### "pod: command not found"
**Fix:** Install CocoaPods first
```bash
sudo gem install cocoapods
```

### "Permission denied"
**Fix:** Use sudo
```bash
sudo gem install cocoapods
```

### Still getting errors after pod install?
**Fix:** Clean and reinstall
```bash
# Remove old pods
rm -rf Pods/
rm Podfile.lock

# Reinstall
pod install

# Open workspace
open App.xcworkspace
```

### Wrong Xcode version?
**Fix:** Update Xcode from Mac App Store
- Need Xcode 14.0 or later
- Go to App Store → Updates

### "Unable to find a specification for..."
**Fix:** Update CocoaPods repo
```bash
pod repo update
pod install
```

---

## 🔍 Verify Installation

After `pod install`, check these files exist:
```bash
ls Pods/
ls Pods/Target\ Support\ Files/Pods-App/
```

You should see:
- `Pods/` folder created
- Many pod folders inside
- Configuration files (.xcconfig)

---

## ✅ Success Checklist

- [ ] CocoaPods installed (`pod --version` works)
- [ ] Ran `pod install` in ios/App/ directory
- [ ] Saw "Pod installation complete!" message
- [ ] Pods/ folder exists
- [ ] Opening `App.xcworkspace` (NOT .xcodeproj)
- [ ] Xcode opens without configuration errors

---

## 🎯 Why This Happens

CocoaPods is a dependency manager for iOS. It:
- Manages native iOS libraries
- Creates configuration files Xcode needs
- Must be installed before building

The error means Xcode is looking for files that `pod install` creates.

---

## 📞 Still Having Issues?

### If pod install fails:
1. Update Ruby: `sudo gem update --system`
2. Update CocoaPods: `sudo gem install cocoapods`
3. Clear cache: `pod cache clean --all`
4. Try again: `pod install`

### If Xcode still shows errors:
1. Clean build: Product → Clean Build Folder (Cmd + Shift + K)
2. Close Xcode
3. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
4. Reopen App.xcworkspace
5. Build again

---

## 💡 Pro Tip

Always use these commands after downloading the project:
```bash
cd ios/App
pod install
open App.xcworkspace
```

This ensures all dependencies are ready before opening in Xcode!
