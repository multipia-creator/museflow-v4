/**
 * Mobile Navigation Component
 * Professional hamburger menu with smooth animations
 */

class MobileNav {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Inject CSS if not already present
        if (!document.getElementById('mobile-nav-styles')) {
            this.injectStyles();
        }

        // Create mobile navigation if it doesn't exist
        this.createMobileNav();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.id = 'mobile-nav-styles';
        style.textContent = `
            /* Mobile Navigation Styles */
            .mobile-nav-container {
                display: none;
            }

            @media (max-width: 768px) {
                .mobile-nav-container {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                }

                .mobile-nav-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: rgba(15, 10, 31, 0.95);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .mobile-nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: white;
                    font-weight: 700;
                    font-size: 1.25rem;
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .mobile-nav-logo i {
                    font-size: 1.5rem;
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* Hamburger Button */
                .hamburger-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    position: relative;
                    width: 32px;
                    height: 32px;
                    z-index: 1001;
                }

                .hamburger-icon {
                    position: relative;
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 2px;
                }

                .hamburger-icon::before,
                .hamburger-icon::after {
                    content: '';
                    position: absolute;
                    width: 24px;
                    height: 2px;
                    background: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 2px;
                }

                .hamburger-icon::before {
                    top: -7px;
                }

                .hamburger-icon::after {
                    bottom: -7px;
                }

                /* Animated Hamburger when open */
                .hamburger-btn.active .hamburger-icon {
                    background: transparent;
                }

                .hamburger-btn.active .hamburger-icon::before {
                    top: 0;
                    transform: rotate(45deg);
                    background: #8b5cf6;
                }

                .hamburger-btn.active .hamburger-icon::after {
                    bottom: 0;
                    transform: rotate(-45deg);
                    background: #ec4899;
                }

                /* Mobile Menu */
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 10, 31, 0.98);
                    backdrop-filter: blur(20px);
                    transform: translateX(-100%);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow-y: auto;
                    padding-top: 70px;
                    z-index: 999;
                }

                .mobile-menu.active {
                    transform: translateX(0);
                }

                .mobile-menu-content {
                    padding: 2rem 1.5rem;
                }

                /* Menu Links */
                .mobile-menu-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                }

                .mobile-menu-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateX(-20px);
                }

                .mobile-menu.active .mobile-menu-link {
                    animation: slideInLeft 0.4s ease forwards;
                }

                .mobile-menu-link:nth-child(1) { animation-delay: 0.1s; }
                .mobile-menu-link:nth-child(2) { animation-delay: 0.15s; }
                .mobile-menu-link:nth-child(3) { animation-delay: 0.2s; }
                .mobile-menu-link:nth-child(4) { animation-delay: 0.25s; }
                .mobile-menu-link:nth-child(5) { animation-delay: 0.3s; }
                .mobile-menu-link:nth-child(6) { animation-delay: 0.35s; }
                .mobile-menu-link:nth-child(7) { animation-delay: 0.4s; }
                .mobile-menu-link:nth-child(8) { animation-delay: 0.45s; }

                @keyframes slideInLeft {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .mobile-menu-link:active {
                    transform: scale(0.98);
                    background: rgba(139, 92, 246, 0.1);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .mobile-menu-link i {
                    font-size: 1.25rem;
                    width: 24px;
                    text-align: center;
                    color: #8b5cf6;
                }

                .mobile-menu-link.active {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
                    border-color: rgba(139, 92, 246, 0.4);
                }

                /* User Section */
                .mobile-user-section {
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                }

                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .mobile-user-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .mobile-user-details h4 {
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem 0;
                }

                .mobile-user-details p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .mobile-logout-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                    color: #fca5a5;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .mobile-logout-btn:active {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(0.98);
                }

                /* Language Selector in Mobile */
                .mobile-lang-section {
                    padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: auto;
                }

                .mobile-lang-select {
                    width: 100%;
                    padding: 0.875rem;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 10px;
                    color: white;
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                /* Hide desktop nav on mobile */
                .navbar,
                .nav-links {
                    display: none !important;
                }

                /* Overlay */
                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    z-index: 998;
                }

                .mobile-menu-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                /* Main content push when menu open */
                body.mobile-menu-open {
                    overflow: hidden;
                }
            }

            /* Desktop - hide mobile nav */
            @media (min-width: 769px) {
                .mobile-nav-container {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createMobileNav() {
        // Check if already exists
        if (document.querySelector('.mobile-nav-container')) {
            return;
        }

        const currentPath = window.location.pathname;
        const isAuthenticated = !!localStorage.getItem('authToken');
        const userName = localStorage.getItem('userName') || 'User';
        const userEmail = localStorage.getItem('userEmail') || '';

        const navHTML = `
            <div class="mobile-nav-container">
                <!-- Mobile Header -->
                <div class="mobile-nav-header">
                    <a href="/" class="mobile-nav-logo">
                        <i class="fas fa-palette"></i>
                        <span>MuseFlow</span>
                    </a>
                    <button class="hamburger-btn" id="mobile-menu-toggle" aria-label="메뉴 열기">
                        <span class="hamburger-icon"></span>
                    </button>
                </div>

                <!-- Overlay -->
                <div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>

                <!-- Mobile Menu -->
                <div class="mobile-menu" id="mobile-menu">
                    <div class="mobile-menu-content">
                        ${isAuthenticated ? `
                            <!-- User Section -->
                            <div class="mobile-user-section">
                                <div class="mobile-user-info">
                                    <div class="mobile-user-avatar">${userName.charAt(0).toUpperCase()}</div>
                                    <div class="mobile-user-details">
                                        <h4>${userName}</h4>
                                        <p>${userEmail}</p>
                                    </div>
                                </div>
                                <button class="mobile-logout-btn" id="mobile-logout-btn">
                                    <i class="fas fa-sign-out-alt"></i>
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        ` : ''}

                        <!-- Navigation Links -->
                        <div class="mobile-menu-links">
                            <a href="/" class="mobile-menu-link ${currentPath === '/' ? 'active' : ''}">
                                <i class="fas fa-home"></i>
                                <span>홈</span>
                            </a>
                            ${isAuthenticated ? `
                                <a href="/dashboard" class="mobile-menu-link ${currentPath === '/dashboard' ? 'active' : ''}">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span>대시보드</span>
                                </a>
                                <a href="/projects" class="mobile-menu-link ${currentPath === '/projects' ? 'active' : ''}">
                                    <i class="fas fa-folder"></i>
                                    <span>프로젝트</span>
                                </a>
                                <a href="/canvas" class="mobile-menu-link ${currentPath === '/canvas' ? 'active' : ''}">
                                    <i class="fas fa-paint-brush"></i>
                                    <span>캔버스</span>
                                </a>
                                <a href="/account" class="mobile-menu-link ${currentPath === '/account' ? 'active' : ''}">
                                    <i class="fas fa-user-circle"></i>
                                    <span>계정</span>
                                </a>
                                <a href="/admin" class="mobile-menu-link ${currentPath === '/admin' ? 'active' : ''}">
                                    <i class="fas fa-cog"></i>
                                    <span>관리자</span>
                                </a>
                            ` : `
                                <a href="/login" class="mobile-menu-link ${currentPath === '/login' ? 'active' : ''}">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>로그인</span>
                                </a>
                                <a href="/signup" class="mobile-menu-link ${currentPath === '/signup' ? 'active' : ''}">
                                    <i class="fas fa-user-plus"></i>
                                    <span>회원가입</span>
                                </a>
                            `}
                            <a href="/help-center.html" class="mobile-menu-link">
                                <i class="fas fa-question-circle"></i>
                                <span>도움말</span>
                            </a>
                        </div>
                    </div>

                    <!-- Language Selector -->
                    <div class="mobile-lang-section">
                        <select class="mobile-lang-select" id="mobile-lang-select">
                            <option value="ko">한국어 (Korean)</option>
                            <option value="en">English</option>
                            <option value="ja">日本語 (Japanese)</option>
                            <option value="zh-CN">简体中文 (Chinese)</option>
                            <option value="zh-TW">繁體中文 (Taiwan)</option>
                            <option value="fr">Français (French)</option>
                            <option value="de">Deutsch (German)</option>
                            <option value="es">Español (Spanish)</option>
                            <option value="it">Italiano (Italian)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');
        const logoutBtn = document.getElementById('mobile-logout-btn');
        const langSelect = document.getElementById('mobile-lang-select');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        if (langSelect) {
            // Set current language
            const currentLang = localStorage.getItem('museflow_language') || 'ko';
            langSelect.value = currentLang;

            langSelect.addEventListener('change', (e) => {
                localStorage.setItem('museflow_language', e.target.value);
                window.location.reload();
            });
        }

        // Close menu when clicking on links
        const menuLinks = document.querySelectorAll('.mobile-menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 200);
            });
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');

        toggleBtn?.classList.add('active');
        menu?.classList.add('active');
        overlay?.classList.add('active');
        document.body.classList.add('mobile-menu-open');
    }

    close() {
        this.isOpen = false;
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');

        toggleBtn?.classList.remove('active');
        menu?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileNav = new MobileNav();
    });
} else {
    window.mobileNav = new MobileNav();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNav;
}
