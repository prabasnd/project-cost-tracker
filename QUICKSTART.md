# ⚡ Quick Start Guide

Get up and running in 10 minutes!

---

## 🎯 What You Need

- ✅ A web server (Python, Node, or online hosting)
- ✅ Google account
- ✅ iPad with Safari (iOS 13+)
- ✅ 10 minutes of time

---

## Step 1: Run the App (2 minutes)

### Option A: Python (Easiest)
```bash
cd project-cost-tracker
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Option B: Node.js
```bash
cd project-cost-tracker
npx serve
```

### Option C: Upload to GitHub Pages
```bash
# Create repo, push files, enable Pages
# See DEPLOYMENT.md for details
```

---

## Step 2: Setup Google Sheets (5 minutes)

### Quick Setup:

1. **Create Sheet**
   - Go to sheets.google.com
   - Create new spreadsheet
   - Name it "Project Cost Tracker"

2. **Add Script**
   - Extensions → Apps Script
   - Delete existing code
   - Copy ALL code from `google-apps-script/Code.gs`
   - Paste into editor
   - Save (name it "Cost Tracker API")

3. **Deploy**
   - Click Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy
   - Authorize when prompted
   - Copy the Web App URL

4. **Update App**
   - Open `js/sync.js`
   - Line 8: Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
   - With your actual URL
   - Save file

---

## Step 3: Test It (3 minutes)

### Test Offline Mode:
1. Open app in browser
2. Create a test entry
3. Turn off WiFi
4. Create another entry
5. Both should save ✓

### Test Sync:
1. Turn WiFi back on
2. Click sync button in header
3. Check Google Sheet
4. Your entries should appear ✓

### Test on iPad:
1. Open app URL in Safari
2. Tap Share → Add to Home Screen
3. Launch app from home screen
4. Create entry
5. Works! ✓

---

## 🎊 You're Done!

Your app is ready to use!

### What's Next?

📖 **Read the full docs:**
- `README.md` - Complete overview
- `docs/GOOGLE-SHEETS-SETUP.md` - Detailed backend setup
- `docs/IPAD-INSTALL.md` - iPad installation
- `docs/DEPLOYMENT.md` - Production deployment

🚀 **Start using:**
- Add real project entries
- Test offline in the field
- Sync when you have internet
- Export data to CSV
- View reports and charts

💡 **Pro Tips:**
- Use auto-sync (enabled by default)
- Export CSV backups weekly
- Toggle dark mode for night use
- Search to find entries quickly

---

## 🆘 Quick Troubleshooting

### "Can't connect to Google Sheets"
- Check the URL in `js/sync.js`
- Verify Web App deployed correctly
- Make sure you're online

### "App won't install on iPad"
- Use Safari browser (not Chrome)
- Must be a real website (not file://)
- Reload the page and try again

### "Entries not syncing"
- Check green/red dot in header
- Try manual sync button
- Look for errors in browser console (F12)

### "Running out of storage"
- Export old data to CSV
- Delete old entries
- Browsers typically allow 50MB+

---

## 📞 Need Help?

Check these files:
- `README.md` - Full documentation
- `docs/` folder - All guides
- Google Apps Script logs - For sync errors

---

**Happy Tracking! Start adding your first real cost entry now! 📊💰**
