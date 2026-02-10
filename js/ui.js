/**
 * UI Module
 * Handles all user interface interactions and rendering
 */

class UIManager {
    constructor() {
        this.currentPage = 'add';
        this.currentFilters = {
            search: '',
            project: '',
            type: '',
            status: ''
        };
        this.dateRange = {
            start: null,
            end: null
        };
    }

    /**
     * Initialize UI
     */
    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.loadInitialData();
        this.setCurrentDate();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Form submission
        const costForm = document.getElementById('costForm');
        costForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Edit form submission
        const editForm = document.getElementById('editForm');
        editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));

        // Search and filters
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.renderEntriesList();
        });

        document.getElementById('filterProject')?.addEventListener('change', (e) => {
            this.currentFilters.project = e.target.value;
            this.renderEntriesList();
        });

        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.currentFilters.type = e.target.value;
            this.renderEntriesList();
        });

        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.renderEntriesList();
        });

        // Sync button
        document.getElementById('syncBtn')?.addEventListener('click', () => {
            this.handleManualSync();
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('cancelEdit')?.addEventListener('click', () => {
            this.closeEditModal();
        });

        // Report date filter
        document.getElementById('applyDateFilter')?.addEventListener('click', () => {
            this.applyDateFilter();
        });

        // Export CSV
        document.getElementById('exportCSV')?.addEventListener('click', () => {
            this.exportToCSV();
        });
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    }

    /**
     * Switch between pages
     */
    switchPage(pageName) {
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

        // Show selected page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageName}Page`)?.classList.add('active');

        this.currentPage = pageName;

        // Load page-specific data
        this.loadPageData(pageName);
    }

    /**
     * Load data for specific page
     */
    async loadPageData(pageName) {
        switch (pageName) {
            case 'list':
                await this.renderEntriesList();
                await this.updateListStats();
                break;
            case 'reports':
                await this.renderReports();
                break;
            case 'dashboard':
                await this.renderDashboard();
                break;
        }
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            project: document.getElementById('projectName').value.trim(),
            costType: document.getElementById('costType').value,
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            paymentMode: document.getElementById('paymentMode').value,
            status: document.getElementById('status').value,
            date: document.getElementById('entryDate').value
        };

        try {
            // Add to database
            const entry = await db.addEntry(formData);
            
            showToast('Entry saved successfully!', 'success');
            
            // Reset form
            e.target.reset();
            this.setCurrentDate();
            
            // Update UI
            await this.updateListStats();

        } catch (error) {
            console.error('Error adding entry:', error);
            showToast('Failed to save entry', 'error');
        }
    }

    /**
     * Handle edit form submission
     */
    async handleEditSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('editEntryId').value;
        
        const updates = {
            project: document.getElementById('editProjectName').value.trim(),
            costType: document.getElementById('editCostType').value,
            description: document.getElementById('editDescription').value.trim(),
            amount: parseFloat(document.getElementById('editAmount').value),
            paymentMode: document.getElementById('editPaymentMode').value,
            status: document.getElementById('editStatus').value,
            date: document.getElementById('editDate').value
        };

        try {
            await db.updateEntry(id, updates);
            
            showToast('Entry updated successfully!', 'success');
            this.closeEditModal();
            
            // Refresh current view
            await this.loadPageData(this.currentPage);

        } catch (error) {
            console.error('Error updating entry:', error);
            showToast('Failed to update entry', 'error');
        }
    }

    /**
     * Open edit modal
     */
    openEditModal(entry) {
        document.getElementById('editEntryId').value = entry.id;
        document.getElementById('editProjectName').value = entry.project;
        document.getElementById('editCostType').value = entry.costType;
        document.getElementById('editDescription').value = entry.description || '';
        document.getElementById('editAmount').value = entry.amount;
        document.getElementById('editPaymentMode').value = entry.paymentMode;
        document.getElementById('editStatus').value = entry.status;
        document.getElementById('editDate').value = entry.date;

        document.getElementById('editModal').classList.add('active');
    }

    /**
     * Close edit modal
     */
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
    }

    /**
     * Delete entry with confirmation
     */
    async deleteEntry(id, projectName) {
        if (!confirm(`Delete entry for "${projectName}"?`)) {
            return;
        }

        try {
            await db.deleteEntry(id);
            showToast('Entry deleted successfully', 'success');
            
            // Refresh current view
            await this.loadPageData(this.currentPage);

        } catch (error) {
            console.error('Error deleting entry:', error);
            showToast('Failed to delete entry', 'error');
        }
    }

    /**
     * Render entries list
     */
    async renderEntriesList() {
        const container = document.getElementById('entriesList');
        
        try {
            let entries = await db.getAllEntries();
            
            // Apply filters
            entries = this.filterEntries(entries);
            
            // Sort by date (newest first)
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="text-center" style="padding: 40px;">
                        <p style="color: var(--text-muted); font-size: 16px;">No entries found</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = entries.map(entry => this.createEntryCard(entry)).join('');

            // Update project filter dropdown
            this.updateProjectFilter(entries);

        } catch (error) {
            console.error('Error rendering entries:', error);
            container.innerHTML = `<p>Error loading entries</p>`;
        }
    }

    /**
     * Filter entries based on current filters
     */
    filterEntries(entries) {
        return entries.filter(entry => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesSearch = 
                    entry.project.toLowerCase().includes(searchTerm) ||
                    entry.description?.toLowerCase().includes(searchTerm) ||
                    entry.costType.toLowerCase().includes(searchTerm);
                
                if (!matchesSearch) return false;
            }

            // Project filter
            if (this.currentFilters.project && entry.project !== this.currentFilters.project) {
                return false;
            }

            // Type filter
            if (this.currentFilters.type && entry.costType !== this.currentFilters.type) {
                return false;
            }

            // Status filter
            if (this.currentFilters.status && entry.status !== this.currentFilters.status) {
                return false;
            }

            return true;
        });
    }

    /**
     * Create entry card HTML
     */
    createEntryCard(entry) {
        const statusClass = `status-${entry.status.toLowerCase()}`;
        const syncBadgeClass = entry.syncStatus === 'synced' ? 'synced' : 'local';
        const syncBadgeText = entry.syncStatus === 'synced' ? '✓ Synced' : '⏳ Local';

        return `
            <div class="entry-card ${statusClass}">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${this.escapeHtml(entry.project)}</div>
                        <span class="entry-type">${entry.costType}</span>
                    </div>
                    <div class="entry-actions">
                        <button class="entry-btn" onclick="uiManager.openEditModal(${JSON.stringify(entry).replace(/"/g, '&quot;')})" title="Edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="entry-btn delete" onclick="uiManager.deleteEntry('${entry.id}', '${this.escapeHtml(entry.project)}')" title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>

                ${entry.description ? `<div class="entry-description">${this.escapeHtml(entry.description)}</div>` : ''}

                <div class="entry-details">
                    <div class="entry-detail">
                        <span class="entry-detail-label">Amount</span>
                        <span class="entry-detail-value entry-amount">₹${this.formatNumber(entry.amount)}</span>
                    </div>
                    <div class="entry-detail">
                        <span class="entry-detail-label">Payment Mode</span>
                        <span class="entry-detail-value">${entry.paymentMode}</span>
                    </div>
                    <div class="entry-detail">
                        <span class="entry-detail-label">Status</span>
                        <span class="entry-detail-value">${entry.status}</span>
                    </div>
                    <div class="entry-detail">
                        <span class="entry-detail-label">Date</span>
                        <span class="entry-detail-value">${this.formatDate(entry.date)}</span>
                    </div>
                </div>

                <div class="entry-meta">
                    <span>${this.formatDateTime(entry.timestamp)}</span>
                    <span class="sync-badge ${syncBadgeClass}">${syncBadgeText}</span>
                </div>
            </div>
        `;
    }

    /**
     * Update list statistics
     */
    async updateListStats() {
        try {
            const stats = await db.getStats();
            
            document.getElementById('totalEntries').textContent = stats.totalEntries;
            document.getElementById('unsyncedCount').textContent = stats.unsyncedEntries;

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    /**
     * Update project filter dropdown
     */
    updateProjectFilter(entries) {
        const projects = [...new Set(entries.map(e => e.project))].sort();
        const filterSelect = document.getElementById('filterProject');
        
        if (!filterSelect) return;

        // Keep current selection
        const currentValue = filterSelect.value;
        
        filterSelect.innerHTML = '<option value="">All Projects</option>' +
            projects.map(project => 
                `<option value="${this.escapeHtml(project)}">${this.escapeHtml(project)}</option>`
            ).join('');
        
        // Restore selection if still valid
        if (projects.includes(currentValue)) {
            filterSelect.value = currentValue;
        }
    }

    /**
     * Handle manual sync
     */
    async handleManualSync() {
        if (!syncManager.isOnline()) {
            showToast('No internet connection', 'error');
            return;
        }

        showToast('Syncing...', 'info');
        
        const result = await syncManager.syncAll();
        
        if (result.success) {
            showToast(result.message, 'success');
            await this.updateListStats();
            await this.loadPageData(this.currentPage);
        } else {
            showToast(result.message, 'error');
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'success');
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Update online status
        syncManager.updateOnlineStatus();

        // Load current page data
        await this.loadPageData(this.currentPage);
    }

    /**
     * Set current date in form
     */
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
    }

    /**
     * Apply date filter for reports
     */
    async applyDateFilter() {
        this.dateRange.start = document.getElementById('reportStartDate').value;
        this.dateRange.end = document.getElementById('reportEndDate').value;
        
        await this.renderReports();
    }

    /**
     * Render reports page
     */
    async renderReports() {
        try {
            let entries = await db.getAllEntries();
            
            // Apply date filter
            if (this.dateRange.start || this.dateRange.end) {
                entries = entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    
                    if (this.dateRange.start && entryDate < new Date(this.dateRange.start)) {
                        return false;
                    }
                    
                    if (this.dateRange.end && entryDate > new Date(this.dateRange.end)) {
                        return false;
                    }
                    
                    return true;
                });
            }

            // Calculate summaries
            const totalPaid = entries
                .filter(e => e.status === 'Paid')
                .reduce((sum, e) => sum + parseFloat(e.amount), 0);
            
            const totalPending = entries
                .filter(e => e.status === 'Pending')
                .reduce((sum, e) => sum + parseFloat(e.amount), 0);
            
            const totalPartial = entries
                .filter(e => e.status === 'Partial')
                .reduce((sum, e) => sum + parseFloat(e.amount), 0);

            // Update summary cards
            document.getElementById('totalPaid').textContent = `₹${this.formatNumber(totalPaid)}`;
            document.getElementById('totalPending').textContent = `₹${this.formatNumber(totalPending)}`;
            document.getElementById('totalPartial').textContent = `₹${this.formatNumber(totalPartial)}`;

            // Update charts
            chartsManager.updateCostTypeChart(entries);
            chartsManager.updateProjectChart(entries);

            // Render detailed table
            this.renderReportTable(entries);

        } catch (error) {
            console.error('Error rendering reports:', error);
        }
    }

    /**
     * Render detailed report table
     */
    renderReportTable(entries) {
        const container = document.getElementById('reportTable');
        
        if (entries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No data for selected period</p>';
            return;
        }

        // Group by project
        const byProject = {};
        entries.forEach(entry => {
            if (!byProject[entry.project]) {
                byProject[entry.project] = {
                    total: 0,
                    paid: 0,
                    pending: 0,
                    count: 0
                };
            }
            byProject[entry.project].total += parseFloat(entry.amount);
            byProject[entry.project].count++;
            
            if (entry.status === 'Paid') {
                byProject[entry.project].paid += parseFloat(entry.amount);
            } else if (entry.status === 'Pending') {
                byProject[entry.project].pending += parseFloat(entry.amount);
            }
        });

        const tableHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th style="text-align: left; padding: 12px;">Project</th>
                        <th style="text-align: right; padding: 12px;">Entries</th>
                        <th style="text-align: right; padding: 12px;">Total</th>
                        <th style="text-align: right; padding: 12px;">Paid</th>
                        <th style="text-align: right; padding: 12px;">Pending</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(byProject).map(([project, data]) => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: 600;">${this.escapeHtml(project)}</td>
                            <td style="text-align: right; padding: 12px;">${data.count}</td>
                            <td style="text-align: right; padding: 12px; font-family: 'JetBrains Mono', monospace;">₹${this.formatNumber(data.total)}</td>
                            <td style="text-align: right; padding: 12px; color: var(--success);">₹${this.formatNumber(data.paid)}</td>
                            <td style="text-align: right; padding: 12px; color: var(--warning);">₹${this.formatNumber(data.pending)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    /**
     * Export data to CSV
     */
    async exportToCSV() {
        try {
            let entries = await db.getAllEntries();
            
            // Apply current date filter if any
            if (this.dateRange.start || this.dateRange.end) {
                entries = entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    
                    if (this.dateRange.start && entryDate < new Date(this.dateRange.start)) {
                        return false;
                    }
                    
                    if (this.dateRange.end && entryDate > new Date(this.dateRange.end)) {
                        return false;
                    }
                    
                    return true;
                });
            }

            if (entries.length === 0) {
                showToast('No data to export', 'warning');
                return;
            }

            // Create CSV content
            const headers = ['Project', 'Cost Type', 'Description', 'Amount', 'Payment Mode', 'Status', 'Date', 'Sync Status'];
            const rows = entries.map(entry => [
                entry.project,
                entry.costType,
                entry.description || '',
                entry.amount,
                entry.paymentMode,
                entry.status,
                entry.date,
                entry.syncStatus
            ]);

            let csv = headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
            });

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `cost-tracker-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('CSV exported successfully', 'success');

        } catch (error) {
            console.error('Error exporting CSV:', error);
            showToast('Failed to export CSV', 'error');
        }
    }

    /**
     * Render dashboard
     */
    async renderDashboard() {
        try {
            const entries = await db.getAllEntries();
            const stats = await db.getStats();

            // Update quick stats
            document.getElementById('dashTotalCost').textContent = `₹${this.formatNumber(stats.totalAmount)}`;
            document.getElementById('dashTotalEntries').textContent = stats.totalEntries;
            document.getElementById('dashActiveProjects').textContent = stats.projects;
            
            const avgCost = stats.totalEntries > 0 ? stats.totalAmount / stats.totalEntries : 0;
            document.getElementById('dashAvgCost').textContent = `₹${this.formatNumber(avgCost)}`;

            // Render recent entries
            this.renderRecentEntries(entries);

            // Render sync queue
            this.renderSyncQueue();

            // Update status chart
            chartsManager.updateStatusChart(entries);

        } catch (error) {
            console.error('Error rendering dashboard:', error);
        }
    }

    /**
     * Render recent entries
     */
    renderRecentEntries(entries) {
        const container = document.getElementById('recentEntries');
        
        const recent = entries
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No entries yet</p>';
            return;
        }

        container.innerHTML = recent.map(entry => `
            <div class="recent-entry">
                <div class="recent-entry-title">${this.escapeHtml(entry.project)}</div>
                <div class="recent-entry-meta">
                    ${entry.costType} • ₹${this.formatNumber(entry.amount)} • ${this.formatDate(entry.date)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render sync queue
     */
    async renderSyncQueue() {
        const container = document.getElementById('syncQueue');
        
        try {
            const queue = await db.getSyncQueue();

            if (queue.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">All synced ✓</p>';
                return;
            }

            container.innerHTML = queue.map(item => `
                <div class="queue-item">
                    <strong>${this.escapeHtml(item.entry.project)}</strong><br>
                    ₹${this.formatNumber(item.entry.amount)} • ${this.formatDateTime(item.addedAt)}
                </div>
            `).join('');

        } catch (error) {
            console.error('Error rendering sync queue:', error);
            container.innerHTML = '<p style="color: var(--text-muted);">Error loading queue</p>';
        }
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return parseFloat(num).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * Format datetime
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Create global UI manager instance
const uiManager = new UIManager();

/**
 * Toast notification helper
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
