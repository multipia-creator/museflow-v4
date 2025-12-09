/**
 * MuseFlow Interactive Tutorial System - Phase 3
 * 
 * Step-by-step interactive onboarding and feature discovery
 * 
 * @version 1.0.0
 * @date 2025-12-08
 * @goal Perfect 100/100 World-Class Score
 */

class InteractiveTutorial {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.overlay = null;
        this.tooltip = null;
        this.isActive = false;
        this.init();
    }
    
    init() {
        console.log('🎓 Interactive Tutorial System Initialized');
        this.defineTutorialSteps();
        this.createTutorialUI();
        this.checkFirstVisit();
    }
    
    // ========================================
    // TUTORIAL STEPS DEFINITION
    // ========================================
    
    defineTutorialSteps() {
        this.steps = [
            {
                target: '.canvas',
                title: '👋 Welcome to MuseFlow!',
                content: 'This is your infinite canvas workspace. You can create, connect, and organize widget cards here.',
                position: 'center',
                action: null,
                highlight: false
            },
            {
                target: '.sidebar button:nth-child(1)',
                title: '📁 Projects Panel',
                content: 'Click here to access your projects. Create new workflows or open existing ones.',
                position: 'right',
                action: 'click',
                highlight: true
            },
            {
                target: '.sidebar button:nth-child(2)',
                title: '🧩 Widgets Library',
                content: 'Browse 87 powerful widgets including AI agents, data processors, and visualization tools.',
                position: 'right',
                action: 'click',
                highlight: true
            },
            {
                target: '.viewport',
                title: '🎨 Canvas Interactions',
                content: 'Drag cards to move them. Click to select. Hold Space to pan. Scroll to zoom.',
                position: 'center',
                action: null,
                highlight: false
            },
            {
                target: '.card:first-child',
                title: '🔗 Creating Connections',
                content: 'Hover over a card to see connection handles. Click and drag to connect cards together.',
                position: 'bottom',
                action: 'hover',
                highlight: true
            },
            {
                target: '.sidebar button:nth-child(3)',
                title: '📚 Layers Panel',
                content: 'Manage card layers, lock/unlock, and organize your canvas structure.',
                position: 'right',
                action: 'click',
                highlight: true
            },
            {
                target: null,
                title: '⌨️ Keyboard Shortcuts',
                content: 'Press <kbd>Cmd+/</kbd> or <kbd>?</kbd> to view all keyboard shortcuts. Essential for productivity!',
                position: 'center',
                action: null,
                highlight: false
            },
            {
                target: '.sidebar button:nth-child(4)',
                title: '🤖 AI Assistant',
                content: 'Get intelligent suggestions, auto-complete workflows, and AI-powered insights.',
                position: 'right',
                action: 'click',
                highlight: true
            },
            {
                target: null,
                title: '🎉 You\'re Ready!',
                content: 'You\'ve completed the tutorial. Start creating amazing workflows with MuseFlow!',
                position: 'center',
                action: null,
                highlight: false
            }
        ];
        
        console.log(`✅ Defined ${this.steps.length} tutorial steps`);
    }
    
    // ========================================
    // TUTORIAL UI CREATION
    // ========================================
    
    createTutorialUI() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99998;
            pointer-events: none;
        `;
        document.body.appendChild(this.overlay);
        
        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tutorial-tooltip';
        this.tooltip.style.cssText = `
            display: none;
            position: fixed;
            max-width: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 24px;
            z-index: 99999;
            pointer-events: auto;
        `;
        document.body.appendChild(this.tooltip);
        
        console.log('✅ Tutorial UI created');
    }
    
    // ========================================
    // TUTORIAL FLOW CONTROL
    // ========================================
    
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('museflow-tutorial-completed');
        
        if (!hasVisited) {
            // Show tutorial welcome after 2 seconds
            setTimeout(() => {
                this.showWelcomePrompt();
            }, 2000);
        }
    }
    
    showWelcomePrompt() {
        const prompt = document.createElement('div');
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            z-index: 100000;
            text-align: center;
        `;
        
        prompt.innerHTML = `
            <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0; color: #000000;">
                👋 Welcome to MuseFlow!
            </h2>
            <p style="font-size: 16px; color: #666666; margin: 0 0 32px 0; line-height: 1.6;">
                Would you like a quick tour to get started? It takes less than 2 minutes.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="tutorial-start" style="
                    padding: 12px 32px;
                    background: #0D99FF;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Start Tutorial</button>
                <button id="tutorial-skip" style="
                    padding: 12px 32px;
                    background: transparent;
                    color: #666666;
                    border: 1px solid #E5E5E5;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Skip for Now</button>
            </div>
            <p style="font-size: 13px; color: #999999; margin: 24px 0 0 0;">
                You can restart the tutorial anytime from the help menu.
            </p>
        `;
        
        document.body.appendChild(prompt);
        
        // Event listeners
        document.getElementById('tutorial-start')?.addEventListener('click', () => {
            prompt.remove();
            this.start();
        });
        
        document.getElementById('tutorial-skip')?.addEventListener('click', () => {
            prompt.remove();
            localStorage.setItem('museflow-tutorial-completed', 'true');
        });
        
        // Hover effects
        const startBtn = document.getElementById('tutorial-start');
        if (startBtn) {
            startBtn.addEventListener('mouseenter', () => {
                startBtn.style.background = '#0A7DD9';
                startBtn.style.transform = 'translateY(-1px)';
                startBtn.style.boxShadow = '0 4px 12px rgba(13, 153, 255, 0.3)';
            });
            startBtn.addEventListener('mouseleave', () => {
                startBtn.style.background = '#0D99FF';
                startBtn.style.transform = 'translateY(0)';
                startBtn.style.boxShadow = 'none';
            });
        }
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(0);
        
        console.log('🎓 Tutorial started');
        
        // Announce to screen readers
        if (window.wcagAAA) {
            window.wcagAAA.announce('Interactive tutorial started', 'polite');
        }
    }
    
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.complete();
            return;
        }
        
        const step = this.steps[index];
        this.currentStep = index;
        
        // Show overlay
        this.overlay.style.display = 'block';
        
        // Highlight target element
        if (step.target) {
            this.highlightElement(step.target, step.highlight);
        }
        
        // Position and show tooltip
        this.showTooltip(step);
        
        console.log(`📖 Showing step ${index + 1}/${this.steps.length}: ${step.title}`);
    }
    
    highlightElement(selector, highlight) {
        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        const element = document.querySelector(selector);
        if (!element) return;
        
        if (highlight) {
            element.classList.add('tutorial-highlight');
            
            // Add highlight style
            if (!document.getElementById('tutorial-highlight-style')) {
                const style = document.createElement('style');
                style.id = 'tutorial-highlight-style';
                style.textContent = `
                    .tutorial-highlight {
                        position: relative;
                        z-index: 99999 !important;
                        box-shadow: 0 0 0 4px #0D99FF, 0 0 20px rgba(13, 153, 255, 0.5) !important;
                        transition: all 0.3s !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Scroll into view
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
    
    showTooltip(step) {
        const { title, content, position, target } = step;
        
        // Update content
        this.tooltip.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: #000000;">
                    ${title}
                </h3>
                <div style="font-size: 14px; color: #666666; line-height: 1.6;">
                    ${content}
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; color: #999999;">
                    Step ${this.currentStep + 1} of ${this.steps.length}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${this.currentStep > 0 ? '<button id="tutorial-prev" style="padding: 8px 16px; background: transparent; border: 1px solid #E5E5E5; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Back</button>' : ''}
                    <button id="tutorial-next" style="padding: 8px 20px; background: #0D99FF; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                        ${this.currentStep < this.steps.length - 1 ? 'Next' : 'Finish'}
                    </button>
                    <button id="tutorial-close" style="padding: 8px 16px; background: transparent; border: 1px solid #E5E5E5; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: #999999;">Skip</button>
                </div>
            </div>
        `;
        
        // Position tooltip
        if (target && position !== 'center') {
            const element = document.querySelector(target);
            if (element) {
                const rect = element.getBoundingClientRect();
                this.positionTooltip(rect, position);
            }
        } else {
            // Center position
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
        }
        
        this.tooltip.style.display = 'block';
        
        // Event listeners
        document.getElementById('tutorial-next')?.addEventListener('click', () => this.next());
        document.getElementById('tutorial-prev')?.addEventListener('click', () => this.previous());
        document.getElementById('tutorial-close')?.addEventListener('click', () => this.close());
    }
    
    positionTooltip(targetRect, position) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const padding = 16;
        
        switch (position) {
            case 'top':
                this.tooltip.style.left = targetRect.left + targetRect.width / 2 + 'px';
                this.tooltip.style.top = targetRect.top - tooltipRect.height - padding + 'px';
                this.tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'bottom':
                this.tooltip.style.left = targetRect.left + targetRect.width / 2 + 'px';
                this.tooltip.style.top = targetRect.bottom + padding + 'px';
                this.tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                this.tooltip.style.left = targetRect.left - tooltipRect.width - padding + 'px';
                this.tooltip.style.top = targetRect.top + targetRect.height / 2 + 'px';
                this.tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                this.tooltip.style.left = targetRect.right + padding + 'px';
                this.tooltip.style.top = targetRect.top + targetRect.height / 2 + 'px';
                this.tooltip.style.transform = 'translateY(-50%)';
                break;
        }
    }
    
    next() {
        this.showStep(this.currentStep + 1);
    }
    
    previous() {
        this.showStep(this.currentStep - 1);
    }
    
    close() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.tooltip.style.display = 'none';
        
        // Remove highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        console.log('🚪 Tutorial closed');
        
        // Announce to screen readers
        if (window.wcagAAA) {
            window.wcagAAA.announce('Tutorial closed', 'polite');
        }
    }
    
    complete() {
        this.close();
        localStorage.setItem('museflow-tutorial-completed', 'true');
        
        // Show completion message
        const completion = document.createElement('div');
        completion.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 400px;
            z-index: 100000;
            text-align: center;
        `;
        
        completion.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 12px 0; color: #000000;">
                Tutorial Complete!
            </h2>
            <p style="font-size: 15px; color: #666666; margin: 0 0 24px 0;">
                You're all set to create amazing workflows with MuseFlow.
            </p>
            <button id="completion-close" style="
                padding: 12px 32px;
                background: #0D99FF;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
            ">Start Creating</button>
        `;
        
        document.body.appendChild(completion);
        
        document.getElementById('completion-close')?.addEventListener('click', () => {
            completion.remove();
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            completion.remove();
        }, 5000);
        
        console.log('✅ Tutorial completed');
        
        // Announce to screen readers
        if (window.wcagAAA) {
            window.wcagAAA.announce('Tutorial completed! You are ready to start creating.', 'polite');
        }
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    
    restart() {
        localStorage.removeItem('museflow-tutorial-completed');
        this.start();
    }
}

// Global initialization
window.InteractiveTutorial = InteractiveTutorial;
window.tutorial = new InteractiveTutorial();

// Add global shortcut to restart tutorial
document.addEventListener('keydown', (e) => {
    // Cmd+Shift+T to restart tutorial
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 't') {
        e.preventDefault();
        if (window.tutorial) {
            window.tutorial.restart();
        }
    }
});

console.log('🌟 Interactive Tutorial System Loaded - Press Cmd+Shift+T to restart');
