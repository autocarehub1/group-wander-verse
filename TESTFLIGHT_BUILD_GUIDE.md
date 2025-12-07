# 🚀 WanderTogether - TestFlight Build Guide

Complete step-by-step guide to build and deploy your app to TestFlight.

---

## ⚠️ Requirements

### You MUST Have:
1. **Mac computer** (MacBook, iMac, Mac Mini, Mac Studio)
2. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/
3. **Xcode** (latest version)
   - Download from Mac App Store (free, ~15GB)
4. **iPhone 16** (for testing)
5. **USB cable** (to connect iPhone to Mac)

**Estimated Time**: 2-3 hours for first build

---

## 📋 Pre-Build Checklist

- [ ] Mac computer ready
- [ ] Apple Developer account active ($99/year subscription)
- [ ] Xcode installed from Mac App Store
- [ ] Project downloaded from Emergent
- [ ] iPhone 16 available for testing

---

## 🎯 Step 1: Download Project from Emergent

### Option A: Download ZIP
1. In Emergent, click the menu (⋮)
2. Select **"Download Project"** or **"Export"**
3. Save to your Mac (e.g., `~/Documents/WanderTogether`)
4. Extract the ZIP file

### Option B: Git Clone (if available)
```bash
# If you have Git access
git clone [your-repo-url]
cd WanderTogether
```

---

## 🎯 Step 2: Set Up Apple Developer Account

### 2.1 Create App Store Connect App

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **"My Apps"**
4. Click the **"+"** button → **"New App"**

**Fill in details:**
- **Platform**: iOS
- **Name**: WanderTogether
- **Primary Language**: English (U.S.)
- **Bundle ID**: Create new → `com.wandertogether.app` (or your own)
- **SKU**: `wandertogether-001` (unique identifier)
- **User Access**: Full Access

5. Click **"Create"**

### 2.2 App Information

In App Store Connect, fill in:

**Category**:
- Primary: Travel
- Secondary: Social Networking

**Age Rating**: 
- 4+ (suitable for all ages)

**App Description** (for later):
```
WanderTogether is the ultimate group travel planning companion. 
Coordinate trips with friends, manage shared expenses, plan activities 
together, and stay connected throughout your adventures.

Features:
• Create and manage group trips
• Send invitations via QR codes or shareable links
• Track and split expenses automatically
• Real-time group messaging
• AI-powered activity suggestions
• Collaborative itinerary planning
• Payment verification with photo uploads
• Budget tracking and management
• Works offline with PWA support
```

**Keywords**: 
```
travel, trips, group travel, expenses, split bills, itinerary, vacation, planning, friends
```

---

## 🎯 Step 3: Open Project in Xcode

### 3.1 Navigate to iOS Project
```bash
cd ~/Documents/WanderTogether
open ios/App/App.xcworkspace
```

**IMPORTANT**: Open `App.xcworkspace`, NOT `App.xcodeproj`!

### 3.2 First Time Xcode Setup

When Xcode opens:
1. It may ask to install additional components → Click **"Install"**
2. Wait for indexing to complete (progress bar at top)
3. Trust the project if prompted

---

## 🎯 Step 4: Configure Signing & Capabilities

### 4.1 Select Project
1. In left sidebar, click **"App"** (blue icon at top)
2. Under TARGETS, select **"App"**
3. Go to **"Signing & Capabilities"** tab

### 4.2 Set Up Team
1. Under **"Team"**, click the dropdown
2. If your Apple ID isn't listed:
   - Click **"Add an Account..."**
   - Sign in with your Apple Developer account
   - Wait for Xcode to sync
3. Select your team/account

### 4.3 Bundle Identifier
- Should be: `com.wandertogether.app`
- If you need to change it, make it unique
- **Remember this** - you'll need it for App Store Connect

### 4.4 Signing Certificate
Xcode should automatically:
- Create a signing certificate
- Generate a provisioning profile
- Show "Signing for 'App' requires a development team..."

If you see errors:
- Make sure Apple Developer account is paid/active
- Try clicking **"Download Manual Profiles"** (under Team dropdown)
- Or click **"Try Again"**

### 4.5 Capabilities (Already Configured)
Your app has these capabilities:
- ✅ Camera (for payment proofs)
- ✅ Location Services (for geolocation)
- ✅ Push Notifications
- ✅ Background Modes (for notifications)

---

## 🎯 Step 5: Build & Test on Your iPhone

### 5.1 Connect iPhone
1. Connect iPhone 16 via USB to Mac
2. On iPhone, tap **"Trust This Computer"** when prompted
3. Enter iPhone passcode

### 5.2 Select Device
1. In Xcode, at the top toolbar, click the device selector
2. Select your **iPhone 16** from the list
3. Wait for "Preparing device" to complete

### 5.3 Build & Run
1. Click the **Play button** (▶) or press `Cmd + R`
2. Xcode will build the app (takes 2-5 minutes first time)
3. App will install on your iPhone

### 5.4 Trust Developer Certificate (First Time Only)
On your iPhone:
1. Go to **Settings** → **General** → **VPN & Device Management**
2. Under "Developer App", tap your certificate
3. Tap **"Trust [Your Name]"**
4. Confirm by tapping **"Trust"**

### 5.5 Test the App
The app should now launch on your iPhone 16!

**Test these features:**
- Create a trip
- Test expense tracking
- Try group chat
- Test camera (payment proofs)
- Check location services
- Verify UI looks good

---

## 🎯 Step 6: Archive for TestFlight

### 6.1 Change Scheme to Release
1. Click scheme selector (next to device selector)
2. Select **"Edit Scheme..."**
3. Select **"Archive"** from left sidebar
4. Under "Build Configuration", select **"Release"**
5. Click **"Close"**

### 6.2 Select Generic iOS Device
1. In device selector at top
2. Select **"Any iOS Device (arm64)"** or **"Generic iOS Device"**

**Do NOT have your iPhone selected for archiving!**

### 6.3 Create Archive
1. Go to **Product** → **Archive**
2. Wait for build to complete (5-10 minutes)
3. When done, Organizer window opens automatically

### 6.4 Troubleshooting Archive Issues

**"No signing certificate found"**:
- Go back to Signing & Capabilities
- Click "Download Manual Profiles"
- Make sure "Automatically manage signing" is checked

**"Bundle Identifier mismatch"**:
- Make sure Bundle ID matches what you created in App Store Connect
- Update in both Xcode and App Store Connect to match

**Build errors**:
- Clean build folder: **Product** → **Clean Build Folder**
- Try again

---

## 🎯 Step 7: Distribute to TestFlight

### 7.1 Organizer Window
After archiving, you should see the Organizer:
- If not, go to **Window** → **Organizer**
- Select **"Archives"** tab
- Your archive should be listed

### 7.2 Distribute App
1. Select your archive
2. Click **"Distribute App"** button
3. Select **"App Store Connect"**
4. Click **"Next"**

### 7.3 Distribution Options
1. Select **"Upload"**
2. Click **"Next"**
3. **App Store Connect Distribution Options**:
   - ✅ Upload your app's symbols (for crash reports)
   - ✅ Manage Version and Build Number (Xcode will handle it)
4. Click **"Next"**

### 7.4 Re-sign (if needed)
1. Select your distribution certificate
2. Select provisioning profile
3. Click **"Next"**

### 7.5 Review & Upload
1. Review the archive details
2. Click **"Upload"**
3. Wait for upload to complete (5-15 minutes depending on internet speed)

### 7.6 Success!
You should see: **"Upload Successful"**

---

## 🎯 Step 8: Set Up TestFlight in App Store Connect

### 8.1 Wait for Processing
1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"WanderTogether"**
3. Go to **"TestFlight"** tab
4. Your build will show "Processing" (10-30 minutes)
5. You'll receive an email when ready

### 8.2 Add Test Information (While Waiting)

**Test Information**:
- **What to Test**: "Please test all features: trip creation, expense tracking, group chat, and payment verification."
- **Beta App Description**: Same as App Store description above
- **Feedback Email**: your-email@example.com
- **Marketing URL**: (optional) your website
- **Privacy Policy URL**: (required) - see below

### 8.3 Privacy Policy (Required!)

You need a privacy policy URL. Quick options:

**Option 1: Use a privacy policy generator**
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

**Option 2: Host on GitHub Pages** (free)
1. Create `privacy.html` with your policy
2. Upload to GitHub repository
3. Enable GitHub Pages in repo settings
4. Use that URL

**Sample Privacy Policy**: See Section 9 below

### 8.4 Export Compliance
When build finishes processing:
1. Click on the build number
2. Answer export compliance questions:
   - "Is your app designed to use cryptography?" → **No** (unless you added custom crypto)
3. Click **"Start Internal Testing"**

---

## 🎯 Step 9: Add Testers & Send Invites

### 9.1 Internal Testing (Free, up to 100 testers)

1. In TestFlight tab, click **"Internal Testing"**
2. Click the **"+"** next to "Testers"
3. **Add Testers**:
   - Enter email addresses
   - Each tester needs an Apple ID
4. Click **"Add"**

### 9.2 External Testing (Public Beta, up to 10,000 testers)

**Note**: Requires Apple review (24-48 hours)

1. Click **"External Testing"**
2. Click **"+"** to create a test group
3. Name it (e.g., "Beta Testers")
4. Add testers by email
5. Submit for review
6. Wait for approval

### 9.3 Testers Receive Invite

Testers will:
1. Receive email invitation
2. Install **TestFlight app** from App Store (free)
3. Open invite link in email
4. Tap **"Install"** in TestFlight app
5. App installs on their iPhone!

### 9.4 Public Link (Optional)

For external testing:
1. Enable **"Public Link"** in external testing group
2. Share this link with anyone
3. Anyone with link can join (up to limit)
4. No email invite needed!

---

## 🎯 Step 10: Update Builds for TestFlight

When you make changes and want to release a new version:

### 10.1 Update Version Number
In Xcode:
1. Select project "App"
2. Under "Identity" section:
   - **Version**: Increment (e.g., 1.0.0 → 1.0.1)
   - **Build**: Auto-increments or set manually (e.g., 1 → 2)

### 10.2 Rebuild & Archive
1. Clean build: **Product** → **Clean Build Folder**
2. Archive: **Product** → **Archive**
3. Distribute to TestFlight (same as before)

### 10.3 Testers Auto-Update
- Testers with auto-update enabled get new version automatically
- Or they manually update in TestFlight app

---

## 📱 Sample Privacy Policy

Create this as `privacy.html` and host somewhere public:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WanderTogether Privacy Policy</title>
</head>
<body>
    <h1>Privacy Policy for WanderTogether</h1>
    <p><strong>Effective Date:</strong> [Today's Date]</p>
    
    <h2>1. Information We Collect</h2>
    <p>WanderTogether collects the following information:</p>
    <ul>
        <li><strong>Account Information:</strong> Email, name, and profile details</li>
        <li><strong>Trip Information:</strong> Trip destinations, dates, and itineraries</li>
        <li><strong>Expense Data:</strong> Shared expenses and payment information</li>
        <li><strong>Messages:</strong> Group chat communications</li>
        <li><strong>Location:</strong> Location data when you use location features (optional)</li>
        <li><strong>Photos:</strong> Payment proof images you upload</li>
    </ul>

    <h2>2. How We Use Information</h2>
    <p>We use your information to:</p>
    <ul>
        <li>Provide trip planning and coordination services</li>
        <li>Enable group communication and expense sharing</li>
        <li>Improve app functionality and user experience</li>
        <li>Send notifications about trip updates and activities</li>
    </ul>

    <h2>3. Information Sharing</h2>
    <p>We share information:</p>
    <ul>
        <li>With trip participants you invite</li>
        <li>With service providers who assist in app operations</li>
        <li>When required by law or to protect rights and safety</li>
    </ul>
    <p>We do NOT sell your personal information to third parties.</p>

    <h2>4. Data Security</h2>
    <p>We implement security measures to protect your information, including encryption and secure data storage.</p>

    <h2>5. Your Rights</h2>
    <p>You can:</p>
    <ul>
        <li>Access and update your information in app settings</li>
        <li>Delete your account and data</li>
        <li>Control location and notification permissions</li>
    </ul>

    <h2>6. Children's Privacy</h2>
    <p>WanderTogether is not intended for children under 13. We do not knowingly collect information from children.</p>

    <h2>7. Changes to Policy</h2>
    <p>We may update this policy and will notify users of significant changes.</p>

    <h2>8. Contact Us</h2>
    <p>For questions about privacy, contact: [your-email@example.com]</p>
</body>
</html>
```

---

## 🎯 Troubleshooting Common Issues

### "Code signing error"
- Make sure Apple Developer account is active ($99/year paid)
- Check that Bundle ID matches App Store Connect
- Try revoking and regenerating certificates in developer.apple.com

### "Archive button grayed out"
- Select "Any iOS Device" (not your connected iPhone)
- Make sure no build errors exist
- Clean build folder and try again

### "Build Processing" takes forever
- Usually 10-30 minutes, but can take up to 2 hours
- Check status in App Store Connect
- You'll receive email when done

### "Missing compliance"
- Answer export compliance questions in App Store Connect
- For most apps: No custom cryptography = answer No

### Testers can't install
- Make sure they have TestFlight app installed
- Check their Apple ID email is correct
- Try sending invite again

### App crashes on launch
- Check crash logs in Xcode (Window → Organizer → Crashes)
- Test on actual device first before uploading
- Check database connection strings are correct for production

---

## 🚀 Going Live on App Store (After TestFlight)

Once testing is complete and you're ready for public release:

### 1. App Store Listing
- Add screenshots (required: 6.7", 6.5" iPhone)
- Add app preview video (optional)
- Write detailed description
- Add keywords for search

### 2. Age Rating
- Complete the age rating questionnaire
- Most travel apps are 4+

### 3. Pricing
- Free or Paid (can change later)
- Set availability in countries

### 4. Submit for Review
- Click "Submit for Review"
- Wait 24-48 hours for Apple review
- Respond to any review feedback

### 5. Release
- Choose automatic or manual release
- Once approved, app goes live!

---

## ✅ Quick Reference Checklist

**Before You Start:**
- [ ] Mac with Xcode installed
- [ ] Apple Developer account ($99/year)
- [ ] Project downloaded from Emergent
- [ ] App created in App Store Connect

**Build Steps:**
1. [ ] Open ios/App/App.xcworkspace in Xcode
2. [ ] Configure Signing & Capabilities
3. [ ] Test on iPhone 16
4. [ ] Archive for Release
5. [ ] Upload to App Store Connect
6. [ ] Wait for processing (10-30 min)
7. [ ] Complete TestFlight info
8. [ ] Add testers
9. [ ] Send invites
10. [ ] Gather feedback & iterate

---

## 📞 Support & Resources

**Apple Documentation:**
- TestFlight Overview: https://developer.apple.com/testflight/
- App Store Connect Guide: https://developer.apple.com/app-store-connect/
- Xcode Documentation: https://developer.apple.com/documentation/xcode

**Helpful Videos:**
- "How to Submit to TestFlight" - YouTube search
- "Xcode Archive and Upload" - YouTube search

**Common Links:**
- App Store Connect: https://appstoreconnect.apple.com
- Apple Developer: https://developer.apple.com
- TestFlight App: https://apps.apple.com/app/testflight/id899247664

---

## 🎯 Timeline Estimate

**First Time Setup**: 2-3 hours
- Xcode install: 30-60 min
- Project setup: 30 min
- Building & testing: 30 min
- Archive & upload: 30 min
- App Store Connect setup: 30 min

**Updates**: 30 minutes
- Build & archive: 10 min
- Upload: 10 min
- TestFlight processing: 10 min

---

## 💡 Pro Tips

1. **Test Thoroughly First**: Use TestFlight extensively before App Store submission
2. **Multiple Test Groups**: Create groups for different testing phases
3. **Feedback Collection**: Use TestFlight's built-in feedback feature
4. **Version Numbers**: Use semantic versioning (1.0.0, 1.0.1, 1.1.0, etc.)
5. **Beta Testing Duration**: TestFlight builds expire after 90 days
6. **Screenshots**: Take screenshots on real devices for App Store listing
7. **App Store Optimization**: Research keywords for better discoverability

---

## 🎉 You're Ready!

Your WanderTogether app is fully prepared for TestFlight distribution. Follow these steps on your Mac, and you'll have your app in testers' hands within a few hours!

**Good luck with your launch! 🚀📱**
