/**
 * Onboarding Tutorial System
 * Lightweight tutorial without external dependencies
 */

(function() {
    'use strict';
    
    // ==========================================
    // Tutorial Steps Configuration
    // ==========================================
    
    const TUTORIALS = {
        dashboard: [
            {
                target: '[data-action="create-project"]',
                icon: 'fa-plus-circle',
                title: '프로젝트 생성',
                content: '새 프로젝트를 시작하세요',
                position: 'bottom'
            },
            {
                target: '.projects-grid',
                icon: 'fa-folder',
                title: '프로젝트 목록',
                content: '프로젝트를 클릭하면 Canvas로 이동합니다',
                position: 'top'
            },
            {
                target: '[href="/canvas-ultimate-clean"]',
                icon: 'fa-palette',
                title: '캔버스',
                content: '워크플로우를 시각적으로 편집합니다',
                position: 'bottom'
            }
        ],
        canvas: [
            {
                target: '.canvas-container',
                icon: 'fa-project-diagram',
                title: 'AI 워크플로우',
                content: '19개 노드를 드래그하여 배치하세요',
                position: 'center'
            },
            {
                target: '[data-ai-generate]',
                icon: 'fa-magic',
                title: 'AI 생성',
                content: '자연어로 워크플로우를 자동 생성합니다',
                position: 'bottom'
            },
            {
                target: '.widget-panel',
                icon: 'fa-th',
                title: '87개 Widget',
                content: '드래그 앤 드롭으로 위젯을 추가하세요',
                position: 'left'
            }
        ]
    };
    
    // ==========================================
    // Tutorial State
    // ==========================================
    
    let currentTutorial = null;
    let currentStep = 0;
    let tutorialOverlay = null;
    let spotlightElement = null;
    
    // ==========================================
    // Check if tutorial should show
    // ==========================================
    
    function shouldShowTutorial() {
        // Check if user has seen tutorial
        const hasSeenTutorial = localStorage.getItem('onboarding_completed') === 'true';
        
        // Check if user explicitly dismissed
        const dismissed = sessionStorage.getItem('tutorial_dismissed') === 'true';
        
        return !hasSeenTutorial && !dismissed;
    }
    
    // ==========================================
    // Start Tutorial
    // ==========================================
    
    function startTutorial(type = 'dashboard') {
        if (!TUTORIALS[type]) {
            console.warn('[Tutorial] Unknown tutorial type:', type);
            return;
        }
        
        currentTutorial = TUTORIALS[type];
        currentStep = 0;
        
        createOverlay();
        showStep(currentStep);
        
        console.log(`✅ [Tutorial] Started ${type} tutorial`);
    }
    
    // ==========================================
    // Create Overlay
    // ==========================================
    
    function createOverlay() {
        // Create overlay
        tutorialOverlay = document.createElement('div');
        tutorialOverlay.id = 'tutorial-overlay';
        tutorialOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(tutorialOverlay);
    }
    
    // ==========================================
    // Show Step
    // ==========================================
    
    function showStep(stepIndex) {
        if (!currentTutorial || stepIndex >= currentTutorial.length) {
            completeTutorial();
            return;
        }
        
        const step = currentTutorial[stepIndex];
        
        // Highlight target element
        highlightElement(step.target);
        
        // Show tooltip
        showTooltip(step);
    }
    
    // ==========================================
    // Highlight Element
    // ==========================================
    
    function highlightElement(selector) {
        // Remove previous spotlight
        if (spotlightElement) {
            spotlightElement.remove();
        }
        
        const targetEl = document.querySelector(selector);
        if (!targetEl) {
            console.warn('[Tutorial] Target element not found:', selector);
            return;
        }
        
        const rect = targetEl.getBoundingClientRect();
        
        // Create spotlight
        spotlightElement = document.createElement('div');
        spotlightElement.className = 'tutorial-spotlight';
        spotlightElement.style.cssText = `
            position: fixed;
            top: ${rect.top - 4}px;
            left: ${rect.left - 4}px;
            width: ${rect.width + 8}px;
            height: ${rect.height + 8}px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 6px;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
            z-index: 10000;
            pointer-events: none;
            animation: pulse 2s ease-in-out infinite;
        `;
        
        document.body.appendChild(spotlightElement);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.02); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ==========================================
    // Show Tooltip
    // ==========================================
    
    function showTooltip(step) {
        // Remove previous tooltip
        const existing = document.querySelector('.tutorial-tooltip');
        if (existing) existing.remove();
        
        const targetEl = document.querySelector(step.target);
        if (!targetEl) return;
        
        const rect = targetEl.getBoundingClientRect();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: #0d0d0d;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.875rem;
            max-width: 240px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            pointer-events: auto;
        `;
        
        tooltip.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.625rem; margin-bottom: 0.625rem;">
                <i class="fas ${step.icon}" style="color: rgba(255, 255, 255, 0.4); font-size: 0.875rem; margin-top: 0.125rem;"></i>
                <div style="flex: 1;">
                    <h3 style="color: white; font-size: 0.8125rem; font-weight: 500; margin: 0 0 0.25rem 0; line-height: 1.3;">
                        ${step.title}
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; line-height: 1.4; margin: 0;">
                        ${step.content}
                    </p>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding-top: 0.625rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="color: rgba(255, 255, 255, 0.3); font-size: 0.6875rem;">
                    ${currentStep + 1}/${currentTutorial.length}
                </div>
                <div style="display: flex; gap: 0.375rem;">
                    <button class="tutorial-skip-btn" style="
                        padding: 0.25rem 0.625rem;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        color: rgba(255, 255, 255, 0.5);
                        cursor: pointer;
                        font-size: 0.6875rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='rgba(255,255,255,0.7)'" 
                       onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='rgba(255,255,255,0.5)'">
                        건너뛰기
                    </button>
                    <button class="tutorial-next-btn" style="
                        padding: 0.25rem 0.875rem;
                        background: white;
                        border: none;
                        border-radius: 4px;
                        color: #0d0d0d;
                        cursor: pointer;
                        font-size: 0.6875rem;
                        font-weight: 500;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.9)'" 
                       onmouseout="this.style.background='white'">
                        ${currentStep < currentTutorial.length - 1 ? '다음' : '완료'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        positionTooltip(tooltip, targetEl, step.position);
        
        // Add event listeners
        tooltip.querySelector('.tutorial-skip-btn').addEventListener('click', skipTutorial);
        tooltip.querySelector('.tutorial-next-btn').addEventListener('click', nextStep);
    }
    
    // ==========================================
    // Position Tooltip
    // ==========================================
    
    function positionTooltip(tooltip, targetEl, position) {
        const rect = targetEl.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'bottom':
                top = rect.bottom + 16;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = rect.top - tooltipRect.height - 16;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 16;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 16;
                break;
            case 'center':
            default:
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                break;
        }
        
        // Keep tooltip on screen
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }
    
    // ==========================================
    // Next Step
    // ==========================================
    
    function nextStep() {
        currentStep++;
        showStep(currentStep);
    }
    
    // ==========================================
    // Skip Tutorial
    // ==========================================
    
    function skipTutorial() {
        sessionStorage.setItem('tutorial_dismissed', 'true');
        cleanupTutorial();
    }
    
    // ==========================================
    // Complete Tutorial
    // ==========================================
    
    function completeTutorial() {
        localStorage.setItem('onboarding_completed', 'true');
        
        // Show completion message
        const tooltip = document.querySelector('.tutorial-tooltip');
        if (tooltip) {
            tooltip.innerHTML = `
                <div style="text-align: center; padding: 0.75rem;">
                    <i class="fas fa-check-circle" style="color: white; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                    <h3 style="color: white; font-size: 0.8125rem; font-weight: 500; margin-bottom: 0.25rem;">
                        튜토리얼 완료
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; margin-bottom: 0.75rem;">
                        이제 모든 기능을 사용할 수 있습니다
                    </p>
                    <button class="tutorial-done-btn" style="
                        padding: 0.375rem 1.25rem;
                        background: white;
                        border: none;
                        border-radius: 4px;
                        color: #0d0d0d;
                        cursor: pointer;
                        font-size: 0.6875rem;
                        font-weight: 500;
                    ">
                        시작하기
                    </button>
                </div>
            `;
            
            tooltip.querySelector('.tutorial-done-btn').addEventListener('click', cleanupTutorial);
            
            setTimeout(cleanupTutorial, 3000); // Auto-close after 3s
        } else {
            cleanupTutorial();
        }
        
        console.log('✅ [Tutorial] Completed');
    }
    
    // ==========================================
    // Cleanup
    // ==========================================
    
    function cleanupTutorial() {
        if (tutorialOverlay) {
            tutorialOverlay.remove();
            tutorialOverlay = null;
        }
        
        if (spotlightElement) {
            spotlightElement.remove();
            spotlightElement = null;
        }
        
        const tooltip = document.querySelector('.tutorial-tooltip');
        if (tooltip) tooltip.remove();
        
        currentTutorial = null;
        currentStep = 0;
    }
    
    // ==========================================
    // Auto-start Tutorial
    // ==========================================
    
    function autoStartTutorial() {
        if (!shouldShowTutorial()) return;
        
        // Detect page type
        const path = window.location.pathname;
        let tutorialType = 'dashboard';
        
        if (path.includes('/dashboard')) {
            tutorialType = 'dashboard';
        } else if (path.includes('/canvas')) {
            tutorialType = 'canvas';
        } else {
            return; // Don't show tutorial on other pages
        }
        
        // Delay to ensure page is fully loaded
        setTimeout(() => {
            startTutorial(tutorialType);
        }, 1500);
    }
    
    // ==========================================
    // Initialization
    // ==========================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoStartTutorial);
    } else {
        autoStartTutorial();
    }
    
    // ==========================================
    // Global API
    // ==========================================
    
    window.OnboardingTutorial = {
        start: startTutorial,
        skip: skipTutorial,
        reset: () => {
            localStorage.removeItem('onboarding_completed');
            sessionStorage.removeItem('tutorial_dismissed');
        }
    };
    
    console.log('✅ [Onboarding Tutorial] Module loaded');
    
})();
