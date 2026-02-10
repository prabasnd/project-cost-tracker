# 📱 iPad Installation Guide

Step-by-step guide to install Project Cost Tracker as a Progressive Web App (PWA) on your iPad.

---

## Prerequisites

- iPad running iOS 13 or later
- Safari browser
- Internet connection (for initial install)
- Your app deployed and accessible via URL

---

## Installation Methods

### Method 1: Safari (Recommended)

This is the standard method for installing PWAs on iPad.

#### Step 1: Open in Safari

1. Open **Safari** on your iPad
2. Navigate to your app URL
   - Example: `https://your-app-domain.com`
   - Or: `http://192.168.1.x:8000` (if testing locally)
3. Wait for the app to load completely

#### Step 2: Add to Home Screen

1. Tap the **Share** button (square with arrow pointing up)
   - Located in the top-right or bottom center
2. Scroll down in the share menu
3. Tap **"Add to Home Screen"**
   - Look for the icon with a plus sign and a rounded square

#### Step 3: Customize Installation

1. **Edit Name** (optional)
   - Default: "Project Cost Tracker"
   - You can shorten to "Cost Tracker"
2. **Preview Icon**
   - Check that the app icon looks correct
3. Tap **"Add"** in top-right corner

#### Step 4: Launch the App

1. Go to your iPad home screen
2. Find the new **Cost Tracker** icon
3. Tap to launch
4. App opens in full-screen mode (no Safari UI)

---

### Method 2: Chrome (Alternative)

If you prefer Chrome:

#### Step 1: Open in Chrome

1. Open **Chrome** browser on iPad
2. Navigate to your app URL
3. Wait for page to load

#### Step 2: Add to Home Screen

1. Tap the **⋮** (three dots) menu in top-right
2. Tap **"Add to Home Screen"**
3. Enter app name
4. Tap **"Add"**

**Note:** Chrome on iOS uses Safari's engine, so features may be limited.

---

## First Launch Setup

### Initial Configuration

When you first launch the app:

1. **Grant Permissions**
   - Storage: Automatically granted
   - Notifications: Tap "Allow" if prompted (optional)

2. **Check Online Status**
   - Look for 🟢 or 🔴 dot in header
   - Green = Online, Red = Offline

3. **Test Offline Mode**
   - Turn on Airplane Mode
   - App should still work
   - Turn off Airplane Mode

4. **Create First Entry**
   - Tap **Add** tab
   - Fill in test entry
   - Tap **Save Entry**

5. **Verify Sync**
   - Ensure you're online
   - Tap sync button in header
   - Check Google Sheet for data

---

## iPad-Specific Features

### Full-Screen Experience

**Benefits:**
- No browser chrome (Safari UI hidden)
- Looks like native app
- More screen space
- Better focus

**Usage:**
- Swipe up from bottom to exit app
- Swipe between apps normally
- Use iPad gestures as usual

### Touch Optimization

The app is designed for touch:

- **Large Tap Targets** - Easy to tap buttons
- **Touch-Friendly Forms** - Big input fields
- **Swipe Navigation** - Bottom navigation bar
- **No Hover States** - All interactions work on touch

### Orientation Support

**Portrait Mode** (Recommended)
- Optimized layout
- Better for forms
- Easier one-handed use

**Landscape Mode**
- Also supported
- Wider layout for tables
- Good for viewing reports

### Keyboard Behavior

**Automatic Keyboard:**
- Appears when tapping input fields
- Optimized for number entry (Amount field)
- Date picker for date fields
- Done button to dismiss

**Tips:**
- Tap outside keyboard to dismiss
- Scroll if keyboard hides content
- Use tab key to move between fields

---

## Offline Usage Tips

### Best Practices

1. **Start Offline**
   - Don't rely on internet
   - All features work offline
   - Data saved locally

2. **Sync Regularly**
   - When you have internet
   - Manual or auto-sync
   - Check sync status

3. **Monitor Storage**
   - iPad provides ~50MB for app data
   - Thousands of entries possible
   - Export old data if needed

### Offline Indicators

**Visual Cues:**
- 🔴 **Offline** - Red dot in header
- 🟢 **Online** - Green dot in header
- ⏳ **Local** - Unsynced badge on entries
- ✓ **Synced** - Green badge on entries

### What Works Offline

✅ **Fully Functional:**
- Add new entries
- Edit existing entries
- Delete entries
- View all entries
- Search and filter
- View reports
- View dashboard
- Export to CSV
- Toggle dark mode

❌ **Requires Internet:**
- Sync to Google Sheets
- Update app (new version)
- Load external resources (first time)

---

## Troubleshooting

### App Won't Install

**Issue:** "Add to Home Screen" option missing

**Solution:**
1. Ensure using Safari (not Chrome in-app browser)
2. Must be on actual website, not in iframe
3. Try reloading the page
4. Update iOS to latest version

---

### App Not Working Offline

**Issue:** App shows error when offline

**Solution:**
1. Open app while online first
2. Let it load completely
3. Service Worker needs to cache assets
4. Try again after 30 seconds

---

### Data Not Syncing

**Issue:** Entries stay "Local" status

**Solution:**
1. Check internet connection (🟢 green dot)
2. Verify sync button works
3. Check Google Apps Script URL in settings
4. Wait for auto-sync (every 30 seconds)

---

### Can't Type in Fields

**Issue:** Keyboard doesn't appear

**Solution:**
1. Tap directly on input field
2. Try tapping again
3. Force close and reopen app
4. Restart Safari if needed

---

### App Looks Zoomed

**Issue:** Text or UI appears too large/small

**Solution:**
1. Check Safari zoom settings
2. Double-tap to reset zoom
3. Use pinch gesture to zoom out
4. Reinstall app if issue persists

---

### Updates Not Showing

**Issue:** New app version not appearing

**Solution:**
1. Swipe up to close app completely
2. Wait 5 seconds
3. Reopen app
4. Service Worker will check for updates
5. You may need to refresh

To force update:
1. Open in Safari (not PWA)
2. Long-press refresh button
3. Tap "Request Desktop Site"
4. Hard refresh (Cmd+Shift+R)
5. Add to Home Screen again

---

## Advanced Settings

### Clear App Data

**Warning:** This deletes all local data!

1. Open Safari Settings
2. Go to **Safari** > **Advanced** > **Website Data**
3. Find your app domain
4. Swipe left and tap **Delete**
5. Reinstall app from Safari

### Reset App

To completely reset:

1. Delete app from home screen
2. Clear Safari cache
3. Clear website data (above)
4. Reinstall app

---

## Performance Tips

### For Best Experience

1. **Keep iOS Updated**
   - Latest iOS version recommended
   - Better PWA support
   - Performance improvements

2. **Free Up Space**
   - Ensure adequate storage
   - 50MB+ free recommended
   - Delete unused apps

3. **Close Background Apps**
   - Better performance
   - More memory available
   - Smoother animations

4. **Regular Syncs**
   - Don't let queue build up
   - Sync every few hours
   - Export data regularly

### Battery Optimization

- App uses minimal battery
- Auto-sync only when app is open
- No background activity
- GPS not used
- No location tracking

---

## Privacy & Security

### Data Storage

**Local (iPad):**
- Stored in browser IndexedDB
- Encrypted by iOS
- Isolated from other apps
- Cleared when app deleted

**Remote (Google Sheets):**
- Only synced with your permission
- Uses your Google account
- You control access
- Can be disabled

### Permissions

**Not Required:**
- ❌ Camera
- ❌ Microphone  
- ❌ Location
- ❌ Contacts
- ❌ Photos

**Optional:**
- ✅ Notifications (for sync alerts)
- ✅ Storage (automatic)

---

## Sharing with Team

### Multi-User Setup

**Each team member:**
1. Installs app on their iPad
2. Uses same Google Sheets backend
3. All data syncs to central sheet
4. Real-time collaboration

**Important:**
- Everyone needs internet to sync
- Conflicts resolved by last-write-wins
- Use unique project names
- Coordinate who enters what

### Guest Access

For occasional users:
1. Share app URL
2. They can use in browser
3. No installation needed
4. Still works offline
5. Data still syncs

---

## Uninstalling

### Remove App

1. Long-press the app icon
2. Tap **"Remove App"**
3. Tap **"Delete App"**
4. Confirm deletion

**Data Handling:**
- Local data deleted from iPad
- Google Sheets data preserved
- Can reinstall anytime
- Previous data accessible via sheets

### Keep Data

To keep local data:
1. Export to CSV before uninstalling
2. Data in Google Sheets preserved
3. Reinstall to access synced data

---

## Tips for Field Work

### Best Practices

1. **Morning Setup**
   - Open app while online
   - Let it sync overnight entries
   - Check for updates
   - Verify offline mode works

2. **During Work**
   - Enter costs as they occur
   - Don't worry about internet
   - Use search to find projects
   - Take notes in description field

3. **End of Day**
   - Connect to WiFi
   - Let app auto-sync
   - Export CSV backup
   - Review dashboard

### Quick Entry Tips

1. **Use Recent Projects**
   - Project names auto-complete
   - Tap to reuse recent entries
   - Saves typing time

2. **Keyboard Shortcuts**
   - Tab between fields
   - Return to submit
   - Esc to cancel

3. **Templates** (Manual)
   - Create template entry
   - Duplicate and edit
   - Faster than typing all fields

---

## Maintenance

### Weekly Tasks

- [ ] Check sync status
- [ ] Export CSV backup
- [ ] Review sync queue
- [ ] Clear old entries (optional)

### Monthly Tasks

- [ ] Update app if new version
- [ ] Archive old projects
- [ ] Review Google Sheets
- [ ] Check storage usage

---

## Getting Help

### Debug Mode

Open Safari console:
1. Connect iPad to Mac
2. Open Safari on Mac
3. Develop > iPad > Your App
4. View console logs
5. Run test commands

### Test Commands

In console:
```javascript
// Check database
db.getAllEntries().then(console.log)

// Check sync queue
db.getSyncQueue().then(console.log)

// Force sync
syncManager.syncAll()

// Get stats
db.getStats().then(console.log)
```

---

## Next Steps

1. ✅ Install app on iPad
2. ✅ Create test entries
3. ✅ Verify offline mode
4. ✅ Test syncing
5. 🚀 Start using in the field!

---

**Happy Tracking! 📊**
