/**
 * ===================================================================
 * MuseFlow Canvas - Minimal Onboarding System
 * Unified with Dashboard Design System
 * ===================================================================
 */

class CanvasOnboarding {
    constructor() {
        this.storageKey = 'museflow_canvas_onboarding_completed';
        this.currentStep = 0;
        this.steps = [
            {
                title: '노드를 드래그하여 추가',
                description: '왼쪽 패널에서 노드를 드래그해 캔버스에 추가하세요',
                icon: 'move',
                highlight: '.left-panel',
                position: 'right'
            },
            {
                title: '노드를 연결',
                description: '노드의 핸들을 드래그해 다른 노드와 연결하세요',
                icon: 'link',
                highlight: null,
                position: 'center'
            },
            {
                title: '워크플로우 실행',
                description: 'Ctrl+Shift+R 또는 상단 실행 버튼을 클릭하세요',
                icon: 'play',
                highlight: null,
                position: 'top'
            }
        ];
    }

    /**
     * Check if onboarding should be shown
     */
    shouldShow() {
        const completed = localStorage.getItem(this.storageKey);
        return !completed;
    }

    /**
     * Initialize onboarding
     */
    init() {
        if (!this.shouldShow()) {
            return;
        }

        // Show compact tooltip after 1 second
        setTimeout(() => {
            this.showCompactTooltip();
        }, 1000);
    }

    /**
     * Show minimal compact tooltip (대시보드 스타일 통일)
     */
    showCompactTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'canvas-onboarding-tooltip';
        tooltip.className = 'canvas-onboarding-tooltip';
        tooltip.innerHTML = `
            <div class="onboarding-content">
                <div class="onboarding-icon">
                    <i data-lucide="lightbulb" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="onboarding-text">
                    <h3>캔버스 시작하기</h3>
                    <p>왼쪽 패널에서 노드를 드래그해 워크플로우를 만드세요</p>
                </div>
                <div class="onboarding-actions">
                    <button class="btn-secondary" onclick="CanvasOnboardingInstance.showFullTutorial()">
                        <i data-lucide="info" style="width: 14px; height: 14px;"></i>
                        가이드
                    </button>
                    <button class="btn-primary" onclick="CanvasOnboardingInstance.complete()">
                        시작하기
                    </button>
                </div>
                <button class="close-btn" onclick="CanvasOnboardingInstance.complete()">
                    <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Animate in
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 100);
    }

    /**
     * Show full tutorial (3-step mini guide)
     */
    showFullTutorial() {
        // Remove compact tooltip
        const existingTooltip = document.getElementById('canvas-onboarding-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        this.currentStep = 0;
        this.renderStepModal();
    }

    /**
     * Render step modal (미니멀 디자인)
     */
    renderStepModal() {
        const step = this.steps[this.currentStep];

        // Remove existing modal
        const existingModal = document.getElementById('canvas-tutorial-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'canvas-tutorial-modal';
        modal.className = 'canvas-tutorial-modal';
        modal.innerHTML = `
            <div class="tutorial-backdrop" onclick="CanvasOnboardingInstance.closeModal()"></div>
            <div class="tutorial-card">
                <div class="tutorial-header">
                    <div class="tutorial-icon">
                        <i data-lucide="${step.icon}" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="tutorial-progress">
                        <span class="progress-text">${this.currentStep + 1} / ${this.steps.length}</span>
                        <div class="progress-bar">
                            ${this.steps.map((_, i) => `
                                <div class="progress-dot ${i <= this.currentStep ? 'active' : ''}"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="tutorial-body">
                    <h2>${step.title}</h2>
                    <p>${step.description}</p>
                </div>
                <div class="tutorial-footer">
                    ${this.currentStep > 0 ? `
                        <button class="btn-secondary" onclick="CanvasOnboardingInstance.previousStep()">
                            <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
                            이전
                        </button>
                    ` : '<div></div>'}
                    ${this.currentStep < this.steps.length - 1 ? `
                        <button class="btn-primary" onclick="CanvasOnboardingInstance.nextStep()">
                            다음
                            <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
                        </button>
                    ` : `
                        <button class="btn-primary" onclick="CanvasOnboardingInstance.complete()">
                            완료
                            <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                        </button>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Animate in
        setTimeout(() => {
            modal.classList.add('visible');
        }, 100);

        // Highlight element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
    }

    /**
     * Highlight specific element
     */
    highlightElement(selector) {
        // Remove existing highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('onboarding-highlight');
        }
    }

    /**
     * Next step
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStepModal();
        }
    }

    /**
     * Previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStepModal();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('canvas-tutorial-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }

        // Remove highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
    }

    /**
     * Complete onboarding
     */
    complete() {
        localStorage.setItem(this.storageKey, 'true');

        // Remove tooltip
        const tooltip = document.getElementById('canvas-onboarding-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 300);
        }

        // Remove modal
        this.closeModal();

        // Show success toast
        if (typeof showToast === 'function') {
            showToast('🎉 캔버스를 시작하세요!', 'success');
        }
    }

    /**
     * Reset onboarding (for testing)
     */
    reset() {
        localStorage.removeItem(this.storageKey);
        console.log('✅ Onboarding reset. Reload page to see it again.');
    }
}

// Create global instance
window.CanvasOnboardingInstance = new CanvasOnboarding();

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CanvasOnboardingInstance.init();
    });
} else {
    window.CanvasOnboardingInstance.init();
}
