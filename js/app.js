/**
 * Main Application File
 * Initializes the app and coordinates all modules
 */

(async function() {
    'use strict';

    console.log('🚀 Project Cost Tracker - Initializing...');

    /**
     * Initialize the application
     */
    async function initApp() {
        try {
            // Show loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            
            // Step 1: Initialize Database
            console.log('📦 Initializing database...');
            await db.init();
            console.log('✅ Database ready');

            // Step 2: Register Service Worker for PWA
            if ('serviceWorker' in navigator) {
                try {
                    console.log('📱 Registering service worker...');
                    const registration = await navigator.serviceWorker.register('./service-worker.js');
                    console.log('✅ Service Worker registered:', registration.scope);
                } catch (error) {
                    console.warn('⚠️ Service Worker registration failed:', error);
                }
            }

            // Step 3: Initialize UI Manager
            console.log('🎨 Initializing UI...');
            uiManager.init();
            console.log('✅ UI ready');

            // Step 4: Initialize Sync Manager
            console.log('🔄 Initializing sync manager...');
            syncManager.updateOnlineStatus();
            syncManager.startAutoSync();
            console.log('✅ Sync manager ready');

            // Step 5: Setup beforeinstallprompt for PWA
            setupPWAInstall();

            // Step 6: Setup visibility change handler
            setupVisibilityHandler();

            // Step 7: Hide loading screen with animation
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                console.log('✅ App ready!');
            }, 500);

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            alert('Failed to initialize app. Please refresh the page.');
        }
    }

    /**
     * Setup PWA install prompt
     */
    function setupPWAInstall() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            console.log('💾 PWA install available');
            
            // You can show a custom install button here
            // For now, we'll log it
            showToast('Add to Home Screen available!', 'info');
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed');
            deferredPrompt = null;
        });
    }

    /**
     * Setup page visibility handler
     * Sync when app becomes visible again
     */
    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('📱 App became visible');
                
                // Update online status
                syncManager.updateOnlineStatus();
                
                // Trigger sync if online
                if (syncManager.isOnline() && syncManager.autoSyncEnabled) {
                    setTimeout(() => {
                        syncManager.syncAll();
                    }, 1000);
                }
            }
        });
    }

    /**
     * Setup global error handler
     */
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // You can log errors to a service here
    });

    /**
     * Setup unhandled promise rejection handler
     */
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // You can log errors to a service here
    });

    /**
     * Prevent accidental data loss on page unload
     */
    window.addEventListener('beforeunload', (event) => {
        // Check if there are unsynced items
        db.getUnsyncedEntries().then(unsynced => {
            if (unsynced.length > 0) {
                const message = `You have ${unsynced.length} unsynced entries. Are you sure you want to leave?`;
                event.returnValue = message;
                return message;
            }
        });
    });

    /**
     * Handle iOS Safari specific issues
     */
    function setupIOSFixes() {
        // Prevent pull-to-refresh
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchDiff = touchY - touchStartY;

            // Prevent pull-to-refresh if at top of page
            if (touchDiff > 0 && window.scrollY === 0) {
                e.preventDefault();
            }
        }, { passive: false });

        // Fix viewport height on iOS
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
    }

    /**
     * Setup keyboard shortcuts (optional)
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save (when on add page)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (uiManager.currentPage === 'add') {
                    document.getElementById('costForm').requestSubmit();
                }
            }

            // Ctrl/Cmd + K to focus search (when on list page)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (uiManager.currentPage === 'list') {
                    document.getElementById('searchInput')?.focus();
                }
            }
        });
    }

    /**
     * Check for app updates
     */
    async function checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            
            if (registration) {
                registration.update();
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            if (confirm('A new version is available! Reload to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            }
        }
    }

    /**
     * Setup periodic update checks
     */
    setInterval(checkForUpdates, 60000); // Check every minute

    // Initialize iOS fixes
    setupIOSFixes();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Start the app
    initApp();

})();
