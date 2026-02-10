# 📗 Google Sheets Setup Guide

Complete step-by-step guide to setting up the Google Sheets backend for Project Cost Tracker.

---

## Prerequisites

- A Google account
- Access to Google Sheets
- Access to Google Apps Script

---

## Step 1: Create Google Sheet

### 1.1 Create New Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create new spreadsheet
3. Name it: **"Project Cost Tracker"**

### 1.2 Sheet Structure (Optional - Auto-Created)

The Apps Script will automatically create the "Entries" sheet with headers:

| Column | Header |
|--------|--------|
| A | ID |
| B | Project |
| C | Cost Type |
| D | Description |
| E | Amount |
| F | Payment Mode |
| G | Status |
| H | Date |
| I | Timestamp |
| J | Synced At |

**Note:** You don't need to manually create this. The script creates it on first sync.

---

## Step 2: Setup Apps Script

### 2.1 Open Apps Script Editor

1. In your Google Sheet, click **Extensions** in the menu
2. Click **Apps Script**
3. A new tab will open with the Apps Script editor

### 2.2 Prepare the Editor

1. Delete any existing code in `Code.gs`
2. The editor should be empty and ready

### 2.3 Copy Script Code

1. Open `google-apps-script/Code.gs` from your project folder
2. Copy **ALL** the code
3. Paste it into the Apps Script editor
4. The code should start with `/**` and end with `}`

### 2.4 Save the Project

1. Click the **💾 Save** icon (or Ctrl+S / Cmd+S)
2. Name your project: **"Cost Tracker API"**
3. Click **OK**

---

## Step 3: Deploy as Web App

### 3.1 Create Deployment

1. Click **Deploy** button in top-right
2. Select **New deployment** from dropdown

### 3.2 Configure Deployment

**Type:**
1. Click ⚙️ (gear icon) next to "Select type"
2. Choose **Web app**

**Configuration:**

| Setting | Value | Description |
|---------|-------|-------------|
| **Description** | `Cost Tracker API v1` | Version identifier |
| **Execute as** | `Me (your-email@gmail.com)` | Run with your permissions |
| **Who has access** | Choose one option below | ⬇️ |

**Access Options:**

- **Option A: Anyone** (Easiest - for testing)
  - ✅ No login required
  - ⚠️ Anyone with URL can access
  - 💡 Use for personal testing

- **Option B: Anyone with Google account** (Recommended)
  - ✅ Requires Google login
  - ✅ More secure
  - 💡 Use for production

- **Option C: Only myself** (Most secure)
  - ✅ Only you can access
  - ⚠️ Must be logged into your Google account
  - 💡 Use for personal use only

### 3.3 Authorize the Script

1. Click **Deploy**
2. You'll see **"Authorization required"**
3. Click **Authorize access**
4. Choose your Google account
5. Click **Advanced** (if you see a warning)
6. Click **Go to Cost Tracker API (unsafe)**
   - This is safe - it's your own script
7. Click **Allow**

### 3.4 Copy Web App URL

1. After authorization, you'll see a success dialog
2. Copy the **Web app URL**
3. It looks like:
   ```
   https://script.google.com/macros/s/XXXXXXXXXX/exec
   ```
4. Save this URL - you'll need it in the next step

---

## Step 4: Configure the App

### 4.1 Update sync.js

1. Open `js/sync.js` in your project
2. Find this line (around line 8):
   ```javascript
   this.scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace with your actual URL:
   ```javascript
   this.scriptURL = 'https://script.google.com/macros/s/XXXXXXXXXX/exec';
   ```
4. Save the file

### 4.2 Test the Connection

1. Deploy your app (upload to server or run locally)
2. Open in browser
3. Open browser console (F12)
4. Run:
   ```javascript
   syncManager.testConnection()
   ```
5. You should see:
   ```javascript
   {success: true, message: 'Connection successful'}
   ```

---

## Step 5: First Sync Test

### 5.1 Create Test Entry

1. Open the app
2. Navigate to **Add** tab
3. Fill in test data:
   - Project: "Test Project"
   - Cost Type: "Material"
   - Amount: 1000
   - Payment Mode: "Cash"
   - Status: "Paid"
   - Date: Today
4. Click **Save Entry**

### 5.2 Trigger Sync

**Option A: Manual Sync**
1. Click the sync button in header
2. Wait for "Synced successfully" message

**Option B: Wait for Auto-Sync**
1. Auto-sync runs every 30 seconds
2. Watch for sync status to change

### 5.3 Verify in Google Sheets

1. Go back to your Google Sheet
2. You should see a new sheet named **"Entries"**
3. Row 1 has headers
4. Row 2 has your test data
5. All columns populated correctly

---

## Step 6: Update Deployment (Future Updates)

When you need to update the script:

### 6.1 Edit the Script

1. Make changes in Apps Script editor
2. Save the changes

### 6.2 Deploy New Version

1. Click **Deploy** > **Manage deployments**
2. Click ✏️ Edit icon next to active deployment
3. Update **Version**:
   - Change description to `Cost Tracker API v2` (or next version)
4. Click **Deploy**
5. Your Web App URL stays the same

---

## Common Issues & Solutions

### Issue: "Authorization Error"

**Cause:** Apps Script not authorized

**Solution:**
1. Go to Apps Script editor
2. Click **Run** > **Run function** > **doPost**
3. Authorize again
4. Redeploy

### Issue: "Script function not found"

**Cause:** Code not saved or deployment error

**Solution:**
1. Verify all code is pasted in `Code.gs`
2. Save the project
3. Redeploy as Web App

### Issue: "Access Denied"

**Cause:** Wrong access permissions

**Solution:**
1. Go to **Deploy** > **Manage deployments**
2. Edit deployment
3. Change "Who has access" to "Anyone"
4. Redeploy

### Issue: Data Not Appearing in Sheet

**Cause:** Sync not working or script error

**Solution:**
1. Open Apps Script editor
2. Click **Executions** tab (left sidebar)
3. Check for errors
4. Look at error messages
5. Fix issues in code

### Issue: "CORS Error"

**Cause:** Using fetch with wrong settings

**Solution:**
- Verify `mode: 'no-cors'` is set in fetch call
- Check in `js/sync.js`:
  ```javascript
  mode: 'no-cors', // Important for Apps Script
  ```

---

## Security Best Practices

### 1. Restrict Access

For production, use **"Anyone with Google account"** not "Anyone"

### 2. Add Input Validation

In `Code.gs`, add validation:

```javascript
function validateData(data) {
  if (!data.id || !data.project || !data.amount) {
    throw new Error('Missing required fields');
  }
  
  if (isNaN(parseFloat(data.amount))) {
    throw new Error('Invalid amount');
  }
  
  return true;
}

// Use in addRecord:
function addRecord(data) {
  validateData(data); // Add this line
  // ... rest of code
}
```

### 3. Add Rate Limiting (Optional)

Prevent abuse:

```javascript
const RATE_LIMIT = 100; // requests per minute
const rateLimitCache = CacheService.getScriptCache();

function checkRateLimit(identifier) {
  const key = 'ratelimit_' + identifier;
  const count = parseInt(rateLimitCache.get(key) || '0');
  
  if (count >= RATE_LIMIT) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimitCache.put(key, (count + 1).toString(), 60);
  return true;
}
```

### 4. Share Sheet Appropriately

1. Click **Share** in Google Sheet
2. Add specific Google accounts
3. Set permissions (View/Edit)
4. Don't share publicly

---

## Advanced Features

### Create Summary Sheet

Add to `Code.gs`:

```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Cost Tracker')
    .addItem('Create Summary', 'createSummary')
    .addToUi();
}

function createSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let summarySheet = ss.getSheetByName('Summary');
  
  if (summarySheet) {
    ss.deleteSheet(summarySheet);
  }
  
  summarySheet = ss.insertSheet('Summary');
  
  // Add summary formulas
  summarySheet.getRange('A1').setValue('Total by Project');
  summarySheet.getRange('A2').setFormula('=QUERY(Entries!A:J, "SELECT B, SUM(E) GROUP BY B")');
  
  summarySheet.getRange('D1').setValue('Total by Status');
  summarySheet.getRange('D2').setFormula('=QUERY(Entries!A:J, "SELECT G, SUM(E) GROUP BY G")');
}
```

### Email Notifications

Get email when new entry synced:

```javascript
function addRecord(data) {
  // ... existing code ...
  
  // Send email notification
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: 'New Cost Entry Added',
    body: `Project: ${data.project}\nAmount: ₹${data.amount}\nStatus: ${data.status}`
  });
  
  // ... rest of code ...
}
```

---

## Testing Checklist

- [ ] Google Sheet created
- [ ] Apps Script code pasted
- [ ] Script saved and authorized
- [ ] Web App deployed
- [ ] Web App URL copied
- [ ] URL updated in sync.js
- [ ] Test entry created in app
- [ ] Manual sync successful
- [ ] Data appears in Google Sheet
- [ ] Auto-sync working
- [ ] Edit entry syncs
- [ ] Multiple entries sync correctly

---

## Next Steps

1. ✅ Complete this setup
2. 📱 Install app on iPad (see `IPAD-INSTALL.md`)
3. 🚀 Start tracking costs!

---

## Support

If you encounter issues:

1. Check **Apps Script Executions** for errors
2. Verify **Web App URL** is correct
3. Test with browser console commands
4. Review Google Apps Script [documentation](https://developers.google.com/apps-script)

---

**Setup Complete! 🎉**
