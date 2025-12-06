/**
 * MuseFlow V18.1 - Enhanced Keyboard Navigation
 * Complete keyboard accessibility support
 */

(function() {
    'use strict';

    /**
     * Focus Trap for Modals
     */
    class FocusTrap {
        constructor(element) {
            this.element = element;
            this.focusableElements = null;
            this.firstFocusable = null;
            this.lastFocusable = null;
            this.previouslyFocused = null;
        }

        activate() {
            this.previouslyFocused = document.activeElement;
            
            // Get all focusable elements
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ].join(', ');
            
            this.focusableElements = Array.from(
                this.element.querySelectorAll(focusableSelectors)
            ).filter(el => {
                return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
            });
            
            this.firstFocusable = this.focusableElements[0];
            this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
            
            // Set focus to first element
            if (this.firstFocusable) {
                this.firstFocusable.focus();
            }
            
            // Add event listener
            this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
        }

        handleKeyDown(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === this.firstFocusable) {
                        e.preventDefault();
                        this.lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === this.lastFocusable) {
                        e.preventDefault();
                        this.firstFocusable.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                this.deactivate();
            }
        }

        deactivate() {
            this.element.removeEventListener('keydown', this.handleKeyDown.bind(this));
            
            // Return focus to previously focused element
            if (this.previouslyFocused && this.previouslyFocused.focus) {
                this.previouslyFocused.focus();
            }
        }
    }

    /**
     * Tab Order Manager
     */
    function initTabOrder() {
        // Ensure logical tab order
        const mainNav = document.querySelector('.unified-navbar, .navbar');
        const mainContent = document.querySelector('#main-content, #dashboard-container, #canvas-container');
        const footer = document.querySelector('.museflow-footer');

        if (mainNav) mainNav.setAttribute('tabindex', '0');
        if (mainContent) mainContent.setAttribute('tabindex', '0');
        if (footer) footer.setAttribute('tabindex', '0');
    }

    /**
     * Keyboard Shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K: Open Command Palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const commandPalette = document.querySelector('#command-palette-modal');
                if (commandPalette) {
                    commandPalette.style.display = 'flex';
                    const focusTrap = new FocusTrap(commandPalette);
                    focusTrap.activate();
                }
            }

            // ESC: Close any open modal
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal, [role="dialog"]');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none' && window.getComputedStyle(modal).display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }

            // ? : Show keyboard shortcuts help
            if (e.key === '?' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                showKeyboardShortcuts();
            }
        });

        console.log('⌨️  Keyboard shortcuts initialized');
        console.log('   • Cmd/Ctrl + K: Command Palette');
        console.log('   • ESC: Close modal');
        console.log('   • ?: Show keyboard shortcuts');
    }

    /**
     * Show Keyboard Shortcuts Modal
     */
    function showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Tab', description: '다음 요소로 포커스 이동' },
            { key: 'Shift + Tab', description: '이전 요소로 포커스 이동' },
            { key: 'Enter / Space', description: '버튼/링크 활성화' },
            { key: 'ESC', description: '모달 닫기' },
            { key: 'Cmd/Ctrl + K', description: 'Command Palette 열기' },
            { key: '?', description: '키보드 단축키 도움말' }
        ];

        // Create modal if doesn't exist
        let modal = document.getElementById('keyboard-shortcuts-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'keyboard-shortcuts-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'shortcuts-title');
            modal.setAttribute('aria-modal', 'true');
            
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                    <div style="background: white; color: #111; padding: 2rem; border-radius: 16px; max-width: 500px; width: 90%;">
                        <h2 id="shortcuts-title" style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 700;">
                            ⌨️ 키보드 단축키
                        </h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${shortcuts.map(s => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 0.75rem; font-weight: 600; font-family: monospace;">
                                        ${s.key}
                                    </td>
                                    <td style="padding: 0.75rem;">
                                        ${s.description}
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                        <button id="close-shortcuts" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            닫기 (ESC)
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close button handler
            document.getElementById('close-shortcuts').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // ESC handler
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                }
            });
        }
        
        modal.style.display = 'flex';
        
        // Focus trap
        const focusTrap = new FocusTrap(modal.querySelector('div > div'));
        focusTrap.activate();
    }

    /**
     * Enhance Links - Open external links in new tab
     */
    function enhanceLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            const url = new URL(link.href);
            if (url.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // Add visual indicator
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon sr-only';
                    icon.textContent = ' (새 창에서 열기)';
                    link.appendChild(icon);
                }
            }
        });
    }

    /**
     * Announce to Screen Readers
     */
    function announceToScreenReader(message, priority = 'polite') {
        let liveRegion = document.getElementById('sr-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear after 3 seconds
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
    }

    /**
     * Initialize
     */
    function init() {
        initTabOrder();
        initKeyboardShortcuts();
        enhanceLinks();
        
        // Announce page load to screen readers
        window.addEventListener('load', () => {
            const pageTitle = document.title;
            announceToScreenReader(`${pageTitle} 페이지가 로드되었습니다`);
        });

        console.log('✅ Keyboard Navigation Enhanced');
        console.log('   • Tab order optimized');
        console.log('   • Focus trap implemented');
        console.log('   • Keyboard shortcuts active');
        console.log('   • Screen reader announcements enabled');
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for use in other scripts
    window.MuseFlowA11y = {
        FocusTrap,
        announceToScreenReader,
        showKeyboardShortcuts
    };

})();
