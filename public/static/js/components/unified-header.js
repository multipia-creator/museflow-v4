/**
 * MuseFlow Unified Header Component
 * Auto-inject navigation header for pages without navigation
 */

(function() {
    'use strict';
    
    const HEADER_HTML = `
        <nav class="unified-navbar" id="unified-navbar-injected">
            <div class="unified-nav-container">
                <!-- Logo -->
                <a href="/" class="unified-nav-logo">
                    <img src="/static/images/museflow-logo-neon.png" 
                         alt="MuseFlow Logo" 
                         class="logo-image">
                    <span class="unified-nav-logo-text">MuseFlow</span>
                </a>

                <!-- Desktop Navigation -->
                <div class="unified-nav-links">
                    <a href="/" class="unified-nav-link">홈</a>
                    <a href="/dashboard" class="unified-nav-link">대시보드</a>
                    <a href="/canvas-ultimate-clean" class="unified-nav-link">캔버스</a>
                    <a href="/workflow-tools" class="unified-nav-link">도구</a>
                    <a href="/budget" class="unified-nav-link">예산</a>
                    <a href="/analytics-dashboard" class="unified-nav-link">분석</a>
                </div>

                <!-- User Menu -->
                <div class="unified-nav-actions">
                    <button class="unified-nav-btn" id="unified-nav-user-btn">
                        <i class="fas fa-user-circle"></i>
                    </button>
                    <button class="unified-nav-btn unified-nav-mobile-toggle" id="unified-nav-mobile-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div class="unified-nav-mobile" id="unified-nav-mobile">
                <a href="/" class="unified-nav-mobile-link">홈</a>
                <a href="/dashboard" class="unified-nav-mobile-link">대시보드</a>
                <a href="/canvas-ultimate-clean" class="unified-nav-mobile-link">캔버스</a>
                <a href="/workflow-tools" class="unified-nav-mobile-link">도구</a>
                <a href="/budget" class="unified-nav-mobile-link">예산</a>
                <a href="/analytics-dashboard" class="unified-nav-mobile-link">분석</a>
            </div>
        </nav>
    `;

    const HEADER_STYLES = `
        <style>
            .unified-navbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .unified-nav-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0.75rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 2rem;
            }

            .unified-nav-logo {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                text-decoration: none;
                transition: transform 0.2s;
            }

            .unified-nav-logo:hover {
                transform: translateY(-2px);
            }

            .unified-nav-logo .logo-image {
                height: 36px;
                width: auto;
                object-fit: contain;
                filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
            }

            .unified-nav-logo-text {
                font-size: 1.25rem;
                font-weight: 700;
                background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .unified-nav-links {
                display: flex;
                gap: 0.5rem;
                flex: 1;
            }

            .unified-nav-link {
                padding: 0.5rem 1rem;
                color: #e2e8f0;
                text-decoration: none;
                border-radius: 0.5rem;
                transition: all 0.2s;
                font-weight: 500;
            }

            .unified-nav-link:hover {
                background: rgba(139, 92, 246, 0.1);
                color: #a78bfa;
            }

            .unified-nav-actions {
                display: flex;
                gap: 0.5rem;
            }

            .unified-nav-btn {
                width: 40px;
                height: 40px;
                border-radius: 0.5rem;
                border: 1px solid rgba(139, 92, 246, 0.3);
                background: rgba(139, 92, 246, 0.1);
                color: #a78bfa;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .unified-nav-btn:hover {
                background: rgba(139, 92, 246, 0.2);
                border-color: rgba(139, 92, 246, 0.5);
            }

            .unified-nav-mobile-toggle {
                display: none;
            }

            .unified-nav-mobile {
                display: none;
                flex-direction: column;
                gap: 0.25rem;
                padding: 1rem;
                background: rgba(15, 23, 42, 0.98);
                border-top: 1px solid rgba(139, 92, 246, 0.2);
            }

            .unified-nav-mobile.active {
                display: flex;
            }

            .unified-nav-mobile-link {
                padding: 0.75rem 1rem;
                color: #e2e8f0;
                text-decoration: none;
                border-radius: 0.5rem;
                transition: all 0.2s;
            }

            .unified-nav-mobile-link:hover {
                background: rgba(139, 92, 246, 0.1);
                color: #a78bfa;
            }

            @media (max-width: 768px) {
                .unified-nav-links {
                    display: none;
                }

                .unified-nav-mobile-toggle {
                    display: flex;
                }

                .unified-nav-logo .logo-image {
                    height: 32px;
                }

                .unified-nav-logo-text {
                    font-size: 1.1rem;
                }
            }

            /* Adjust body padding to account for fixed header */
            body {
                padding-top: 60px;
            }
        </style>
    `;

    function injectHeader() {
        // Check if page already has navigation
        if (document.querySelector('nav') || document.querySelector('.unified-navbar')) {
            return;
        }

        // Inject styles
        const styleEl = document.createElement('div');
        styleEl.innerHTML = HEADER_STYLES;
        document.head.appendChild(styleEl.firstElementChild);

        // Inject header
        const headerEl = document.createElement('div');
        headerEl.innerHTML = HEADER_HTML;
        document.body.insertBefore(headerEl.firstElementChild, document.body.firstChild);

        // Setup mobile toggle
        setupMobileMenu();
    }

    function setupMobileMenu() {
        const mobileToggle = document.getElementById('unified-nav-mobile-toggle');
        const mobileMenu = document.getElementById('unified-nav-mobile');

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });
        }
    }

    // Auto-inject on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeader);
    } else {
        injectHeader();
    }

    // Export for manual use
    window.UnifiedHeader = {
        inject: injectHeader
    };
})();
