/**
 * Google Apps Script - Backend for Project Cost Tracker
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create a new Google Sheet
 * 2. Name it "Project Cost Tracker"
 * 3. Go to Extensions > Apps Script
 * 4. Delete any existing code and paste this entire script
 * 5. Save the project (name it "Cost Tracker API")
 * 6. Click "Deploy" > "New deployment"
 * 7. Choose type: "Web app"
 * 8. Settings:
 *    - Description: "Cost Tracker API v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (for testing) or "Anyone with Google account" (more secure)
 * 9. Click "Deploy"
 * 10. Copy the Web App URL
 * 11. Paste this URL in your sync.js file (replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')
 * 
 * SHEET STRUCTURE:
 * The script will automatically create headers in Sheet1:
 * ID | Project | Cost Type | Description | Amount | Payment Mode | Status | Date | Timestamp
 */

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getRecords') {
      return getRecords();
    }
    
    if (action === 'ping') {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Server is alive' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addRecord') {
      return addRecord(data.data);
    }
    
    if (action === 'ping') {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Server is alive' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get or create the main sheet
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Entries');
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Entries');
    
    // Add headers
    const headers = [
      'ID',
      'Project',
      'Cost Type',
      'Description',
      'Amount',
      'Payment Mode',
      'Status',
      'Date',
      'Timestamp',
      'Synced At'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#6366f1');
    headerRange.setFontColor('#ffffff');
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  
  return sheet;
}

/**
 * Add a new record to the sheet
 */
function addRecord(data) {
  try {
    const sheet = getSheet();
    
    // Check if record with this ID already exists
    const existingData = sheet.getDataRange().getValues();
    const idColumn = 0; // ID is in column A (index 0)
    
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][idColumn] === data.id) {
        // Record already exists, update it instead
        Logger.log('Record already exists, updating: ' + data.id);
        return updateRecord(data, i + 1); // +1 because array is 0-indexed but rows are 1-indexed
      }
    }
    
    // Prepare row data
    const rowData = [
      data.id,
      data.project,
      data.costType,
      data.description || '',
      parseFloat(data.amount),
      data.paymentMode,
      data.status,
      data.date,
      data.timestamp,
      new Date().toISOString()
    ];
    
    // Append row
    sheet.appendRow(rowData);
    
    // Format amount column as currency
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 5).setNumberFormat('₹#,##0.00'); // Amount column
    
    Logger.log('Record added successfully: ' + data.id);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: 'Record added successfully',
        id: data.id
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error adding record: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update an existing record
 */
function updateRecord(data, rowIndex) {
  try {
    const sheet = getSheet();
    
    // Update row data (skip ID column)
    const rowData = [
      data.id,
      data.project,
      data.costType,
      data.description || '',
      parseFloat(data.amount),
      data.paymentMode,
      data.status,
      data.date,
      data.timestamp,
      new Date().toISOString()
    ];
    
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    
    // Format amount column as currency
    sheet.getRange(rowIndex, 5).setNumberFormat('₹#,##0.00');
    
    Logger.log('Record updated successfully: ' + data.id);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: 'Record updated successfully',
        id: data.id
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error updating record: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get all records from the sheet
 */
function getRecords() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Remove header row
    const headers = data[0];
    const records = data.slice(1);
    
    // Convert to array of objects
    const result = records.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        data: result,
        count: result.length
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error getting records: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Delete a record by ID (optional - for future use)
 */
function deleteRecord(id) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 1);
        
        Logger.log('Record deleted successfully: ' + id);
        
        return ContentService.createTextOutput(
          JSON.stringify({ 
            success: true, 
            message: 'Record deleted successfully',
            id: id
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Record not found' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error deleting record: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Create a summary sheet with pivot-like data (optional)
 */
function createSummarySheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let summarySheet = ss.getSheetByName('Summary');
    
    if (summarySheet) {
      ss.deleteSheet(summarySheet);
    }
    
    summarySheet = ss.insertSheet('Summary');
    
    // Get data from main sheet
    const mainSheet = getSheet();
    const data = mainSheet.getDataRange().getValues();
    
    // Calculate summaries
    // (Add your summary logic here)
    
    summarySheet.getRange('A1').setValue('Summary created at: ' + new Date().toString());
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Summary created' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
