/**
 * Minimal Onboarding Tutorial - Figma-style
 * Consistent with Canvas Light Theme
 */

(function() {
    'use strict';
    
    // Tutorial Configuration
    const TUTORIALS = {
        canvas: [
            {
                title: 'Projects',
                content: '프로젝트를 관리합니다',
                icon: 'folder'
            },
            {
                title: 'Widgets',
                content: '87개 위젯 사용 가능',
                icon: 'package'
            },
            {
                title: 'Layers',
                content: '레이어를 관리합니다',
                icon: 'layers'
            }
        ]
    };
    
    let currentStep = 0;
    let tooltipElement = null;
    let autoProgressTimer = null;
    
    // Check if should show
    function shouldShow() {
        const completed = localStorage.getItem('onboarding_completed') === 'true';
        const dismissed = sessionStorage.getItem('tutorial_dismissed') === 'true';
        return !completed && !dismissed;
    }
    
    // Start tutorial
    function start() {
        if (!shouldShow()) return;
        
        currentStep = 0;
        showStep(currentStep);
        console.log('✅ [Minimal Tutorial] Started');
    }
    
    // Show step
    function showStep(index) {
        if (index >= TUTORIALS.canvas.length) {
            complete();
            return;
        }
        
        const step = TUTORIALS.canvas[index];
        createTooltip(step, index);
        
        // Auto-progress after 7 seconds
        clearTimeout(autoProgressTimer);
        autoProgressTimer = setTimeout(() => {
            next();
        }, 7000);
    }
    
    // Create minimal tooltip
    function createTooltip(step, index) {
        // Remove existing
        if (tooltipElement) {
            tooltipElement.remove();
        }
        
        const totalSteps = TUTORIALS.canvas.length;
        
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'minimal-tutorial';
        tooltipElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">
                    Tip ${index + 1}/${totalSteps}
                </span>
                <button class="minimal-tutorial-close" onclick="window.minimalTutorial.dismiss()" style="
                    background: transparent;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 2px;
                    font-size: 14px;
                    line-height: 1;
                    transition: color 0.15s;
                " onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#9ca3af'">
                    ×
                </button>
            </div>
            <div style="margin-bottom: 6px;">
                <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 3px;">
                    <i data-lucide="${step.icon}" style="width: 12px; height: 12px; display: inline-block; margin-right: 4px; vertical-align: -1px;"></i>
                    ${step.title}
                </div>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">
                    ${step.content}
                </div>
            </div>
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                <button onclick="window.minimalTutorial.next()" style="
                    padding: 5px 10px;
                    font-size: 11px;
                    font-weight: 500;
                    border-radius: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    background: #ffffff;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.15s;
                " onmouseover="this.style.borderColor='#3b82f6'; this.style.color='#3b82f6'" 
                   onmouseout="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.color='#6b7280'">
                    ${index < totalSteps - 1 ? 'Next' : 'Done'}
                </button>
            </div>
        `;
        
        // Minimal style - Fixed bottom-right
        tooltipElement.style.cssText = `
            position: fixed;
            bottom: 72px;
            right: 20px;
            width: 180px;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            z-index: 1000;
            font-family: Inter, sans-serif;
            transition: opacity 0.15s;
        `;
        
        document.body.appendChild(tooltipElement);
        
        // Initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    // Next step
    function next() {
        currentStep++;
        showStep(currentStep);
    }
    
    // Dismiss
    function dismiss() {
        if (tooltipElement) {
            tooltipElement.remove();
            tooltipElement = null;
        }
        clearTimeout(autoProgressTimer);
        sessionStorage.setItem('tutorial_dismissed', 'true');
        console.log('ℹ️ [Minimal Tutorial] Dismissed');
    }
    
    // Complete
    function complete() {
        dismiss();
        localStorage.setItem('onboarding_completed', 'true');
        console.log('✅ [Minimal Tutorial] Completed');
    }
    
    // Public API
    window.minimalTutorial = {
        start,
        next,
        dismiss,
        complete
    };
    
    // Auto-start on canvas pages
    if (window.location.pathname.includes('canvas')) {
        // Wait for page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(start, 1000);
            });
        } else {
            setTimeout(start, 1000);
        }
    }
    
})();
