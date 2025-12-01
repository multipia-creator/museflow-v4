/**
 * MuseFlow V10.0 - PWA Installer
 * Purpose: Handle PWA installation prompt
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Register Service Worker
        this.registerServiceWorker();

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ MuseFlow PWA installed successfully!');
            this.hideInstallButton();
            if (window.notificationSystem) {
                window.notificationSystem.show(
                    '🎉 앱 설치 완료!',
                    'MuseFlow를 홈 화면에서 바로 실행할 수 있습니다',
                    'success'
                );
            }
        });
    }

    // Register Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 New version available!');
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Show install button
    showInstallButton() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Create install button
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span>앱 설치</span>
        `;
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            transition: all 0.3s ease;
        `;

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'translateY(-3px)';
            installBtn.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.6)';
        });

        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'translateY(0)';
            installBtn.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
        });

        installBtn.addEventListener('click', () => {
            this.promptInstall();
        });

        document.body.appendChild(installBtn);
    }

    // Hide install button
    hideInstallButton() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.remove();
        }
    }

    // Prompt installation
    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('✅ User accepted PWA install');
        } else {
            console.log('❌ User dismissed PWA install');
        }

        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    // Show update notification
    showUpdateNotification() {
        if (window.notificationSystem) {
            window.notificationSystem.show(
                '🆕 새 버전 사용 가능',
                '페이지를 새로고침하여 최신 버전을 사용하세요',
                'info',
                {
                    action: {
                        text: '새로고침',
                        callback: () => window.location.reload()
                    }
                }
            );
        }
    }

    // Check if running as PWA
    isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }
}

// Initialize PWA Installer
window.pwaInstaller = new PWAInstaller();

// Check if running as PWA
if (window.pwaInstaller.isPWA()) {
    console.log('✅ Running as PWA');
    document.body.classList.add('pwa-mode');
} else {
    console.log('🌐 Running in browser');
}

console.log('%cMuseFlow V10.0 - PWA Ready', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
