/**
 * Sync Module - SUPABASE VERSION
 * Handles synchronization with Supabase (Google Sheets alternative)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://supabase.com and sign up (FREE)
 * 2. Create a new project
 * 3. Get your project URL and anon key from Settings > API
 * 4. Update SUPABASE_URL and SUPABASE_KEY below
 * 5. Run the SQL command provided in SUPABASE-SETUP.md to create table
 */

class SyncManager {
    constructor() {
        // REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
        this.SUPABASE_URL = 'https://xqytacbrzaukapiqhwnr.supabase.co';
        this.SUPABASE_KEY = 'sb_publishable_qVsOieJRzxFrRnbCAarpgQ_o4bFMy_B';
        
        this.apiUrl = `${this.SUPABASE_URL}/rest/v1/cost_entries`;
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

        console.log('Auto-sync started (Supabase)');
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

            console.log(`Syncing ${queue.length} entries to Supabase...`);
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
                await this.delay(200);
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
     * Sync a single entry to Supabase
     */
    async syncEntry(entry) {
        try {
            // Prepare data for Supabase
            const data = {
                id: entry.id,
                project: entry.project,
                cost_type: entry.costType,
                description: entry.description || '',
                amount: parseFloat(entry.amount),
                payment_mode: entry.paymentMode,
                status: entry.status,
                entry_date: entry.date,
                created_at: entry.timestamp,
                synced_at: new Date().toISOString()
            };

            // Use upsert to handle both insert and update
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            console.log('Entry synced to Supabase:', entry.id);
            return { success: true };

        } catch (error) {
            console.error('Failed to sync entry to Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch records from Supabase (optional - for verification)
     */
    async fetchRecords() {
        if (!this.isOnline()) {
            return { success: false, message: 'No internet connection' };
        }

        try {
            const response = await fetch(`${this.apiUrl}?select=*&order=created_at.desc`, {
                method: 'GET',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data: data };

        } catch (error) {
            console.error('Failed to fetch records from Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete an entry from Supabase
     */
    async deleteFromSupabase(id) {
        try {
            const response = await fetch(`${this.apiUrl}?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log('Entry deleted from Supabase:', id);
            return { success: true };

        } catch (error) {
            console.error('Failed to delete from Supabase:', error);
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
     * Test connection to Supabase
     */
    async testConnection() {
        if (!this.isOnline()) {
            return { success: false, message: 'No internet connection' };
        }

        try {
            const response = await fetch(this.apiUrl + '?limit=1', {
                method: 'GET',
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });

            if (response.ok) {
                return { success: true, message: 'Connection to Supabase successful!' };
            } else {
                const error = await response.json();
                return { success: false, message: error.message || 'Connection failed' };
            }

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
