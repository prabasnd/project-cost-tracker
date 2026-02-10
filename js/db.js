/**
 * IndexedDB Database Module
 * Handles all local data storage operations
 */

class Database {
    constructor() {
        this.dbName = 'ProjectCostTrackerDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize database and create object stores
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create entries object store if it doesn't exist
                if (!db.objectStoreNames.contains('entries')) {
                    const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
                    
                    // Create indexes for efficient querying
                    entriesStore.createIndex('project', 'project', { unique: false });
                    entriesStore.createIndex('costType', 'costType', { unique: false });
                    entriesStore.createIndex('status', 'status', { unique: false });
                    entriesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    entriesStore.createIndex('date', 'date', { unique: false });
                    entriesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Create sync queue object store
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id' });
                }

                console.log('Database setup complete');
            };
        });
    }

    /**
     * Generate UUID for unique entry IDs
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Add a new cost entry
     */
    async addEntry(entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');

            // Add metadata
            const entryWithMetadata = {
                ...entry,
                id: this.generateUUID(),
                timestamp: new Date().toISOString(),
                syncStatus: 'local' // Start as unsynced
            };

            const request = store.add(entryWithMetadata);

            request.onsuccess = () => {
                console.log('Entry added:', entryWithMetadata.id);
                resolve(entryWithMetadata);
            };

            request.onerror = () => {
                console.error('Failed to add entry:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                // Add to sync queue
                this.addToSyncQueue(entryWithMetadata);
            };
        });
    }

    /**
     * Update an existing entry
     */
    async updateEntry(id, updates) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get existing entry
                const existingEntry = await this.getEntry(id);
                
                if (!existingEntry) {
                    reject(new Error('Entry not found'));
                    return;
                }

                const transaction = this.db.transaction(['entries'], 'readwrite');
                const store = transaction.objectStore('entries');

                // Merge updates with existing entry
                const updatedEntry = {
                    ...existingEntry,
                    ...updates,
                    id: id, // Preserve ID
                    timestamp: new Date().toISOString(),
                    syncStatus: 'local' // Mark as needing sync
                };

                const request = store.put(updatedEntry);

                request.onsuccess = () => {
                    console.log('Entry updated:', id);
                    resolve(updatedEntry);
                };

                request.onerror = () => {
                    console.error('Failed to update entry:', request.error);
                    reject(request.error);
                };

                transaction.oncomplete = () => {
                    // Add to sync queue
                    this.addToSyncQueue(updatedEntry);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Delete an entry
     */
    async deleteEntry(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Entry deleted:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('Failed to delete entry:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get a single entry by ID
     */
    async getEntry(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Failed to get entry:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all entries
     */
    async getAllEntries() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('Failed to get entries:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get entries by project name
     */
    async getEntriesByProject(projectName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('project');
            const request = index.getAll(projectName);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get unsynced entries
     */
    async getUnsyncedEntries() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('syncStatus');
            const request = index.getAll('local');

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Mark entry as synced
     */
    async markAsSynced(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const entry = await this.getEntry(id);
                if (!entry) {
                    reject(new Error('Entry not found'));
                    return;
                }

                const transaction = this.db.transaction(['entries'], 'readwrite');
                const store = transaction.objectStore('entries');
                
                entry.syncStatus = 'synced';
                const request = store.put(entry);

                request.onsuccess = () => {
                    console.log('Entry marked as synced:', id);
                    resolve(true);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Add entry to sync queue
     */
    async addToSyncQueue(entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');

            const queueItem = {
                id: entry.id,
                entry: entry,
                addedAt: new Date().toISOString(),
                retries: 0
            };

            const request = store.put(queueItem);

            request.onsuccess = () => {
                console.log('Added to sync queue:', entry.id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('Failed to add to sync queue:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get sync queue
     */
    async getSyncQueue() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Remove item from sync queue
     */
    async removeFromSyncQueue(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Removed from sync queue:', id);
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Clear all data (use with caution)
     */
    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries', 'syncQueue'], 'readwrite');
            
            const entriesStore = transaction.objectStore('entries');
            const queueStore = transaction.objectStore('syncQueue');
            
            entriesStore.clear();
            queueStore.clear();

            transaction.oncomplete = () => {
                console.log('All data cleared');
                resolve(true);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    /**
     * Get database statistics
     */
    async getStats() {
        const entries = await this.getAllEntries();
        const unsynced = await this.getUnsyncedEntries();
        
        return {
            totalEntries: entries.length,
            unsyncedEntries: unsynced.length,
            syncedEntries: entries.length - unsynced.length,
            totalAmount: entries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
            projects: [...new Set(entries.map(e => e.project))].length
        };
    }
}

// Create global database instance
const db = new Database();
