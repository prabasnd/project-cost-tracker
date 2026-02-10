/**
 * Sync Module
 * Handles synchronization with Google Sheets via Apps Script
 */

class SyncManager {
    constructor() {
        // IMPORTANT: Replace with your actual Google Apps Script Web App URL
        this.scriptURL = 'https://script.google.com/macros/s/AKfycbz3uDt_pJsRon9vuaqnr-Ly5oAoETmeGEd3QWLj9ttf_CEOTs9jGSBXiKlaqlo86lSI/exec';
        
        this.isSyncing = false;
        this.syncInterval = null;
        this.autoSyncEnabled = true;
        this.syncIntervalTime = 30000; // 30 seconds
    }

    /**
     * Check if online
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Start auto-sync
     */
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            if (this.autoSyncEnabled && this.isOnline() && !this.isSyncing) {
                this.syncAll();
            }
        }, this.syncIntervalTime);

        console.log('Auto-sync started');
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('Auto-sync stopped');
    }

    /**
     * Sync all unsynced entries
     */
    async syncAll() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return { success: false, message: 'Sync already in progress' };
        }

        if (!this.isOnline()) {
            console.log('Cannot sync - offline');
            return { success: false, message: 'No internet connection' };
        }

        this.isSyncing = true;
        this.updateSyncUI(true);

        try {
            const queue = await db.getSyncQueue();
            
            if (queue.length === 0) {
                console.log('No entries to sync');
                this.isSyncing = false;
                this.updateSyncUI(false);
                return { success: true, message: 'Nothing to sync', synced: 0 };
            }

            console.log(`Syncing ${queue.length} entries...`);
            let syncedCount = 0;
            let failedCount = 0;

            for (const item of queue) {
                try {
                    const result = await this.syncEntry(item.entry);
                    
                    if (result.success) {
                        // Mark as synced in database
                        await db.markAsSynced(item.id);
                        
                        // Remove from sync queue
                        await db.removeFromSyncQueue(item.id);
                        
                        syncedCount++;
                    } else {
                        failedCount++;
                        console.error('Failed to sync entry:', item.id, result.error);
                    }
                } catch (error) {
                    failedCount++;
                    console.error('Error syncing entry:', item.id, error);
                }

                // Small delay to avoid overwhelming the server
                await this.delay(300);
            }

            this.isSyncing = false;
            this.updateSyncUI(false);

            const message = `Synced: ${syncedCount}, Failed: ${failedCount}`;
            console.log(message);

            return {
                success: true,
                message: message,
                synced: syncedCount,
                failed: failedCount
            };

        } catch (error) {
            this.isSyncing = false;
            this.updateSyncUI(false);
            console.error('Sync error:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Sync a single entry to Google Sheets
     */
    async syncEntry(entry) {
        try {
            const response = await fetch(this.scriptURL, {
                method: 'POST',
                mode: 'no-cors', // Important for Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addRecord',
                    data: {
                        id: entry.id,
                        project: entry.project,
                        costType: entry.costType,
                        description: entry.description || '',
                        amount: entry.amount,
                        paymentMode: entry.paymentMode,
                        status: entry.status,
                        date: entry.date,
                        timestamp: entry.timestamp
                    }
                })
            });

            // Note: With no-cors mode, we can't read the response
            // We assume success if no error is thrown
            console.log('Entry synced to Google Sheets:', entry.id);
            
            return { success: true };

        } catch (error) {
            console.error('Failed to sync entry:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch records from Google Sheets (optional - for verification)
     */
    async fetchRecords() {
        if (!this.isOnline()) {
            return { success: false, message: 'No internet connection' };
        }

        try {
            const response = await fetch(`${this.scriptURL}?action=getRecords`, {
                method: 'GET',
            });

            const data = await response.json();
            return { success: true, data: data };

        } catch (error) {
            console.error('Failed to fetch records:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update sync UI indicators
     */
    updateSyncUI(isSyncing) {
        const syncBtn = document.getElementById('syncBtn');
        
        if (syncBtn) {
            if (isSyncing) {
                syncBtn.classList.add('syncing');
            } else {
                syncBtn.classList.remove('syncing');
            }
        }
    }

    /**
     * Update online/offline status
     */
    updateOnlineStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (this.isOnline()) {
            statusDot.classList.add('online');
            statusText.textContent = 'Online';
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Offline';
        }
    }

    /**
     * Utility: Delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test connection to Google Sheets
     */
    async testConnection() {
        if (!this.isOnline()) {
            return { success: false, message: 'No internet connection' };
        }

        try {
            const response = await fetch(this.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'ping'
                })
            });

            return { success: true, message: 'Connection successful' };

        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, message: error.message };
        }
    }
}

// Create global sync manager instance
const syncManager = new SyncManager();

// Setup online/offline event listeners
window.addEventListener('online', () => {
    console.log('Connection restored - online');
    syncManager.updateOnlineStatus();
    
    // Trigger sync when coming back online
    if (syncManager.autoSyncEnabled) {
        setTimeout(() => {
            syncManager.syncAll();
        }, 1000);
    }
    
    showToast('Connection restored - syncing...', 'success');
});

window.addEventListener('offline', () => {
    console.log('Connection lost - offline');
    syncManager.updateOnlineStatus();
    showToast('Working offline - data will sync when online', 'warning');
});
