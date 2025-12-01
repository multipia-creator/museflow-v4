/**
 * MuseFlow Onboarding Tour System
 * Simple, lightweight first-time user guide
 */

class OnboardingTour {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.overlay = null;
        this.tooltip = null;
    }
    
    init(steps) {
        this.steps = steps;
        
        // Check if user has seen tour
        const tourCompleted = localStorage.getItem('museflow_tour_completed');
        if (!tourCompleted && this.steps.length > 0) {
            setTimeout(() => this.start(), 1000); // Start after 1 second
        }
    }
    
    start() {
        this.createOverlay();
        this.showStep(0);
    }
    
    createOverlay() {
        // Create semi-transparent overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.overlay);
        
        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            max-width: 400px;
            z-index: 9999;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        `;
        document.body.appendChild(this.tooltip);
    }
    
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Highlight target element
        const target = document.querySelector(step.target);
        if (target) {
            // Bring target to front
            target.style.position = 'relative';
            target.style.zIndex = '10000';
            target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)';
            target.style.borderRadius = '12px';
            
            // Position tooltip near target
            const rect = target.getBoundingClientRect();
            const tooltipWidth = 400;
            const tooltipHeight = 200;
            
            let top = rect.bottom + 20;
            let left = rect.left;
            
            // Adjust if out of viewport
            if (left + tooltipWidth > window.innerWidth) {
                left = window.innerWidth - tooltipWidth - 20;
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = rect.top - tooltipHeight - 20;
            }
            
            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;
        }
        
        // Update tooltip content
        this.tooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="font-size: 2rem;">${step.icon || '🎯'}</div>
                <div>
                    <h3 style="margin: 0; color: white; font-size: 1.25rem; font-weight: 600;">${step.title}</h3>
                    <p style="margin: 0.25rem 0 0 0; color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Step ${stepIndex + 1} of ${this.steps.length}</p>
                </div>
            </div>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 1.5rem;">${step.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button onclick="onboardingTour.skip()" style="background: rgba(255, 255, 255, 0.1); border: none; padding: 0.5rem 1rem; border-radius: 8px; color: rgba(255, 255, 255, 0.6); cursor: pointer; font-weight: 500;">
                    건너뛰기
                </button>
                <div style="display: flex; gap: 0.5rem;">
                    ${stepIndex > 0 ? `
                        <button onclick="onboardingTour.prev()" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 0.5rem 1rem; border-radius: 8px; color: #a78bfa; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-arrow-left"></i> 이전
                        </button>
                    ` : ''}
                    <button onclick="onboardingTour.next()" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); border: none; padding: 0.5rem 1.5rem; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                        ${stepIndex === this.steps.length - 1 ? '완료 ✨' : '다음 <i class="fas fa-arrow-right"></i>'}
                    </button>
                </div>
            </div>
        `;
    }
    
    next() {
        // Remove highlight from current step
        const currentStep = this.steps[this.currentStep];
        const currentTarget = document.querySelector(currentStep.target);
        if (currentTarget) {
            currentTarget.style.zIndex = '';
            currentTarget.style.boxShadow = '';
        }
        
        this.showStep(this.currentStep + 1);
    }
    
    prev() {
        // Remove highlight from current step
        const currentStep = this.steps[this.currentStep];
        const currentTarget = document.querySelector(currentStep.target);
        if (currentTarget) {
            currentTarget.style.zIndex = '';
            currentTarget.style.boxShadow = '';
        }
        
        this.showStep(this.currentStep - 1);
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        // Remove highlights
        this.steps.forEach(step => {
            const target = document.querySelector(step.target);
            if (target) {
                target.style.zIndex = '';
                target.style.boxShadow = '';
            }
        });
        
        // Remove overlay and tooltip
        if (this.overlay) this.overlay.remove();
        if (this.tooltip) this.tooltip.remove();
        
        // Mark as completed
        localStorage.setItem('museflow_tour_completed', 'true');
        
        // Show success message
        if (window.notificationSystem) {
            window.notificationSystem.showInAppNotification('온보딩 투어 완료! 🎉 MuseFlow를 시작해보세요!', 'success');
        }
    }
    
    // Reset tour (for testing)
    reset() {
        localStorage.removeItem('museflow_tour_completed');
        console.log('✅ Tour reset. Refresh page to see it again.');
    }
}

// Global instance
const onboardingTour = new OnboardingTour();
