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
                title: '🚀 프로젝트 생성',
                content: '여기를 클릭하여 새로운 프로젝트를 시작하세요. AI가 자동으로 워크플로우를 생성해드립니다!',
                position: 'bottom'
            },
            {
                target: '.projects-grid',
                title: '📁 내 프로젝트',
                content: '생성한 프로젝트들이 여기에 표시됩니다. 프로젝트를 클릭하면 Canvas로 이동합니다.',
                position: 'top'
            },
            {
                target: '[href="/canvas-ultimate-clean"]',
                title: '🎨 캔버스',
                content: 'Canvas에서 워크플로우를 시각적으로 편집하고 관리할 수 있습니다.',
                position: 'bottom'
            }
        ],
        canvas: [
            {
                target: '.canvas-container',
                title: '✨ AI 워크플로우',
                content: 'AI가 생성한 19개 노드를 드래그하여 배치하고 연결할 수 있습니다.',
                position: 'center'
            },
            {
                target: '[data-ai-generate]',
                title: '🤖 AI 생성',
                content: '자연어로 설명하면 AI가 자동으로 워크플로우를 생성합니다.',
                position: 'bottom'
            },
            {
                target: '.widget-panel',
                title: '🧩 87개 Widget',
                content: '87개의 전문 위젯을 드래그 앤 드롭으로 추가할 수 있습니다.',
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
            background: rgba(0, 0, 0, 0.7);
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
            top: ${rect.top - 8}px;
            left: ${rect.left - 8}px;
            width: ${rect.width + 16}px;
            height: ${rect.height + 16}px;
            border: 3px solid #8b5cf6;
            border-radius: 12px;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3), 
                        0 0 40px rgba(139, 92, 246, 0.5);
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
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            max-width: 320px;
            z-index: 10001;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
        `;
        
        tooltip.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3 style="color: white; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                    ${step.title}
                </h3>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; line-height: 1.6; margin: 0;">
                    ${step.content}
                </p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.85rem;">
                    ${currentStep + 1} / ${currentTutorial.length}
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="tutorial-skip-btn" style="
                        padding: 0.5rem 1rem;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        color: rgba(255, 255, 255, 0.7);
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                        건너뛰기
                    </button>
                    <button class="tutorial-next-btn" style="
                        padding: 0.5rem 1.5rem;
                        background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 600;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='translateY(-1px)'" 
                       onmouseout="this.style.transform='translateY(0)'">
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
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h3 style="color: white; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                        튜토리얼 완료!
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; margin-bottom: 1.5rem;">
                        이제 MuseFlow의 모든 기능을 사용할 수 있습니다
                    </p>
                    <button class="tutorial-done-btn" style="
                        padding: 0.75rem 2rem;
                        background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
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
