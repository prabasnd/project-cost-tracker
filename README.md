# 📊 Project Cost Tracker - Offline-First PWA

A production-ready, offline-first web application for tracking project costs on iPad, with automatic Google Sheets synchronization.

## ✨ Features

### Core Functionality
- ✅ **100% Offline Operation** - Works without internet connection
- 📱 **iPad Optimized** - Touch-friendly interface designed for field use
- 💾 **IndexedDB Storage** - Local data persistence with no data loss
- 🔄 **Auto-Sync** - Automatic background sync to Google Sheets when online
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 📊 **Rich Analytics** - Charts and reports powered by Chart.js
- 📥 **CSV Export** - Export data for offline analysis

### Data Management
- Add, Edit, Delete cost entries
- Track: Project, Cost Type, Amount, Payment Mode, Status, Date
- Search and filter capabilities
- Duplicate prevention using UUID
- Sync status indicators (Local/Synced)

### Technical Features
- Progressive Web App (PWA) with installability
- Service Worker for offline caching
- Responsive design for all screen sizes
- No data loss on browser refresh or close
- Visual online/offline indicators
- Sync retry queue with error handling

---

## 📁 Project Structure

```
project-cost-tracker/
├── index.html                 # Main HTML file
├── manifest.json              # PWA manifest
├── service-worker.js          # Service worker for offline support
│
├── css/
│   └── styles.css             # Complete styles with dark mode
│
├── js/
│   ├── db.js                  # IndexedDB database module
│   ├── sync.js                # Google Sheets sync module
│   ├── ui.js                  # UI manager and interactions
│   ├── charts.js              # Chart.js visualization module
│   └── app.js                 # Main app initialization
│
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
│
├── google-apps-script/
│   └── Code.gs                # Google Apps Script backend
│
└── docs/
    ├── DEPLOYMENT.md           # Deployment guide
    ├── GOOGLE-SHEETS-SETUP.md  # Google Sheets setup
    └── IPAD-INSTALL.md         # iPad installation guide
```

---

## 🚀 Quick Start

### 1. Deploy Files

**Option A: Local Server (Development)**
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

**Option B: Web Hosting (Production)**
- Upload all files to: GitHub Pages, Netlify, Vercel, Firebase Hosting, etc.
- Ensure HTTPS is enabled (required for PWA)

### 2. Setup Google Sheets Backend

See detailed guide: `docs/GOOGLE-SHEETS-SETUP.md`

**Quick Steps:**
1. Create new Google Sheet
2. Go to Extensions > Apps Script
3. Paste code from `google-apps-script/Code.gs`
4. Deploy as Web App
5. Copy the Web App URL
6. Update `js/sync.js` with your URL:
   ```javascript
   this.scriptURL = 'YOUR_WEB_APP_URL_HERE';
   ```

### 3. Install on iPad

See detailed guide: `docs/IPAD-INSTALL.md`

**Quick Steps:**
1. Open the app URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

---

## 🎯 Usage Guide

### Adding Cost Entries

1. Navigate to **Add** tab
2. Fill in the form:
   - **Project Name** (required)
   - **Cost Type**: Labour, Material, Payment, Other
   - **Description**: Optional notes
   - **Amount**: In ₹ (required)
   - **Payment Mode**: Cash, Bank, UPI
   - **Status**: Pending, Paid, Partial
   - **Date** (required)
3. Tap **Save Entry**
4. Entry is saved locally immediately

### Managing Entries

**View All Entries**
- Navigate to **List** tab
- Use search box to find entries
- Filter by Project, Type, or Status
- See sync status (Local/Synced)

**Edit Entry**
- Tap edit icon on any entry
- Modify fields
- Tap **Update Entry**
- Changes marked for sync

**Delete Entry**
- Tap delete icon
- Confirm deletion
- Entry removed from local storage

### Syncing Data

**Manual Sync**
- Tap sync button in header
- Requires internet connection
- Shows sync progress

**Auto-Sync**
- Runs every 30 seconds when online
- Syncs when app becomes visible
- Syncs when internet reconnects
- Silent background operation

### Reports & Analytics

**Summary Cards**
- Total Paid
- Total Pending
- Partial Payments

**Charts**
- Cost by Type (Doughnut chart)
- Cost by Project (Bar chart)
- Status Distribution (Pie chart)

**Date Filtering**
- Select start and end dates
- Apply filter to reports
- Export filtered data to CSV

### Dashboard

- Quick statistics overview
- Recent entries list
- Payment status chart
- Sync queue status

---

## 🔧 Configuration

### Sync Settings

Edit `js/sync.js`:

```javascript
// Sync interval (milliseconds)
this.syncIntervalTime = 30000; // 30 seconds

// Enable/disable auto-sync
this.autoSyncEnabled = true;
```

### Theme

Default theme is set in `js/ui.js`:
```javascript
const savedTheme = localStorage.getItem('theme') || 'light';
```

Users can toggle theme using the sun/moon icon.

### Cache Version

Update in `service-worker.js` when deploying changes:
```javascript
const CACHE_NAME = 'project-cost-tracker-v1.0.1';
```

---

## 📊 Google Sheets Integration

### Sheet Structure

Automatically created with these columns:

| Column | Description |
|--------|-------------|
| ID | Unique UUID for each entry |
| Project | Project name |
| Cost Type | Labour/Material/Payment/Other |
| Description | Optional notes |
| Amount | Cost amount in ₹ |
| Payment Mode | Cash/Bank/UPI |
| Status | Pending/Paid/Partial |
| Date | Entry date |
| Timestamp | Creation timestamp |
| Synced At | Last sync time |

### API Endpoints

The Google Apps Script provides:

**POST /addRecord**
- Adds or updates a record
- Duplicate prevention using ID

**GET /getRecords**
- Retrieves all records
- Returns JSON array

**POST ping**
- Health check endpoint

---

## 🔐 Security & Privacy

### Data Storage
- All data stored locally in IndexedDB
- No third-party analytics or tracking
- Data only sent to your Google Sheet

### Google Sheets Access
- Uses your Google account
- You control who can access the sheet
- Can be restricted to specific Google accounts

### HTTPS Requirement
- Required for PWA features
- Required for Service Worker
- Use free hosting with HTTPS (Netlify, Vercel, etc.)

---

## 🐛 Troubleshooting

### App Not Working Offline

**Check:**
1. Service Worker registered? (Check browser DevTools)
2. Assets cached? (Check Application > Cache Storage)
3. Using HTTPS? (Required for Service Worker)

**Solution:**
```javascript
// Force refresh Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});
// Then reload page
```

### Sync Not Working

**Check:**
1. Internet connection active?
2. Google Apps Script URL correct in `sync.js`?
3. Web App deployed and accessible?

**Test:**
```javascript
// In browser console
syncManager.testConnection()
```

### Data Not Showing

**Check:**
1. Browser IndexedDB enabled?
2. Storage quota not exceeded?

**Verify:**
```javascript
// In browser console
db.getAllEntries().then(console.log)
```

### Icons Not Displaying

**Generate icons** using a tool like:
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

Place generated icons in `/icons/` directory.

---

## 🔄 Updates & Maintenance

### Updating the App

1. Update version in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'project-cost-tracker-v1.0.1';
   ```

2. Deploy new files

3. Users will be prompted to reload on next visit

### Database Migrations

When adding new fields:

1. Update IndexedDB schema in `db.js`
2. Increment version number:
   ```javascript
   this.version = 2;
   ```
3. Add migration logic in `onupgradeneeded`

---

## 💡 Tips & Best Practices

### For Best Performance

1. **Keep entries synced** - Reduce sync queue size
2. **Regular CSV exports** - Backup your data
3. **Clear old data** - Archive completed projects
4. **Use filters** - Find data faster

### For iPad Users

1. **Add to Home Screen** - Full-screen experience
2. **Portrait orientation** - Optimized layout
3. **Use touch gestures** - Swipe navigation
4. **Enable notifications** - Get sync alerts

### For Field Work

1. **Work offline first** - No internet needed
2. **Sync when convenient** - Manual or auto
3. **Check sync status** - Green dot = synced
4. **Export before clearing** - Keep backups

---

## 🆘 Support

### Browser Compatibility

- ✅ Safari 13+ (iPad/iPhone)
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Firefox 75+

### Known Limitations

- iOS Safari doesn't support Background Sync API (manual sync required)
- Storage quota varies by browser (~50MB typically)
- Large datasets (>10,000 entries) may impact performance

---

## 📝 License

MIT License - Free for personal and commercial use

---

## 🙏 Credits

Built with:
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [Google Fonts](https://fonts.google.com/) - Outfit & JetBrains Mono
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Local storage
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - Offline support

---

## 📧 Contact

For issues, questions, or contributions, please open an issue on GitHub.

**Happy Tracking! 📊💰**
