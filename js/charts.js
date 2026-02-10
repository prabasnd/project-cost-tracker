/**
 * Charts Module
 * Handles all data visualization using Chart.js
 */

class ChartsManager {
    constructor() {
        this.costTypeChart = null;
        this.projectChart = null;
        this.statusChart = null;
        
        // Chart color scheme
        this.colors = {
            primary: '#6366f1',
            secondary: '#ec4899',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
            purple: '#a855f7',
            orange: '#f97316'
        };
    }

    /**
     * Get common chart options
     */
    getCommonOptions(title) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 13,
                            weight: '600'
                        },
                        color: isDark ? '#cbd5e1' : '#475569'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '₹' + context.parsed.toLocaleString('en-IN');
                            return label;
                        }
                    }
                }
            }
        };
    }

    /**
     * Update Cost Type Chart (Doughnut)
     */
    updateCostTypeChart(entries) {
        const canvas = document.getElementById('costTypeChart');
        if (!canvas) return;

        // Aggregate data by cost type
        const typeData = {};
        entries.forEach(entry => {
            const type = entry.costType;
            if (!typeData[type]) {
                typeData[type] = 0;
            }
            typeData[type] += parseFloat(entry.amount);
        });

        const labels = Object.keys(typeData);
        const data = Object.values(typeData);
        const backgroundColors = [
            this.colors.primary,
            this.colors.secondary,
            this.colors.success,
            this.colors.warning
        ];

        // Destroy existing chart
        if (this.costTypeChart) {
            this.costTypeChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.costTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                ...this.getCommonOptions(),
                cutout: '65%',
                plugins: {
                    ...this.getCommonOptions().plugins,
                    legend: {
                        ...this.getCommonOptions().plugins.legend,
                        position: 'right'
                    }
                }
            }
        });
    }

    /**
     * Update Project Chart (Bar)
     */
    updateProjectChart(entries) {
        const canvas = document.getElementById('projectChart');
        if (!canvas) return;

        // Aggregate data by project
        const projectData = {};
        entries.forEach(entry => {
            const project = entry.project;
            if (!projectData[project]) {
                projectData[project] = 0;
            }
            projectData[project] += parseFloat(entry.amount);
        });

        // Sort by amount
        const sorted = Object.entries(projectData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 projects

        const labels = sorted.map(item => item[0]);
        const data = sorted.map(item => item[1]);

        // Destroy existing chart
        if (this.projectChart) {
            this.projectChart.destroy();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const ctx = canvas.getContext('2d');
        this.projectChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Cost',
                    data: data,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                ...this.getCommonOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            },
                            color: isDark ? '#94a3b8' : '#64748b',
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 11
                            }
                        },
                        grid: {
                            color: isDark ? '#334155' : '#e2e8f0',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: isDark ? '#94a3b8' : '#64748b',
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 12,
                                weight: '600'
                            },
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    ...this.getCommonOptions().plugins,
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Update Status Chart (Pie)
     */
    updateStatusChart(entries) {
        const canvas = document.getElementById('statusChart');
        if (!canvas) return;

        // Aggregate data by status
        const statusData = {
            'Paid': 0,
            'Pending': 0,
            'Partial': 0
        };

        entries.forEach(entry => {
            const status = entry.status;
            if (statusData.hasOwnProperty(status)) {
                statusData[status] += parseFloat(entry.amount);
            }
        });

        const labels = Object.keys(statusData);
        const data = Object.values(statusData);
        const backgroundColors = [
            this.colors.success,
            this.colors.warning,
            this.colors.secondary
        ];

        // Destroy existing chart
        if (this.statusChart) {
            this.statusChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                ...this.getCommonOptions(),
                plugins: {
                    ...this.getCommonOptions().plugins,
                    legend: {
                        ...this.getCommonOptions().plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Destroy all charts (useful for theme changes)
     */
    destroyAll() {
        if (this.costTypeChart) this.costTypeChart.destroy();
        if (this.projectChart) this.projectChart.destroy();
        if (this.statusChart) this.statusChart.destroy();
    }

    /**
     * Refresh all charts (useful for theme changes)
     */
    async refreshAll() {
        try {
            const entries = await db.getAllEntries();
            
            this.updateCostTypeChart(entries);
            this.updateProjectChart(entries);
            this.updateStatusChart(entries);
        } catch (error) {
            console.error('Error refreshing charts:', error);
        }
    }
}

// Create global charts manager instance
const chartsManager = new ChartsManager();
