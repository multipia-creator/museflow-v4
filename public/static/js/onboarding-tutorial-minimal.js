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
    
    // Create ultra-minimal tooltip (60% smaller)
    function createTooltip(step, index) {
        // Remove existing
        if (tooltipElement) {
            tooltipElement.remove();
        }
        
        const totalSteps = TUTORIALS.canvas.length;
        
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'minimal-tutorial';
        
        // Ultra-compact icon-only layout
        tooltipElement.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 4px;">
                    <i data-lucide="${step.icon}" style="width: 18px; height: 18px; color: #3b82f6; stroke-width: 2;"></i>
                </div>
                <div style="font-size: 9px; font-weight: 600; color: #1f2937; margin-bottom: 2px; line-height: 1.2;">
                    ${step.title}
                </div>
                <div style="font-size: 7px; color: #6b7280; line-height: 1.3; margin-bottom: 6px;">
                    ${step.content}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
                    <span style="font-size: 7px; color: #9ca3af;">${index + 1}/${totalSteps}</span>
                    <div style="display: flex; gap: 3px;">
                        <button onclick="window.minimalTutorial.dismiss()" style="
                            width: 16px;
                            height: 16px;
                            padding: 0;
                            font-size: 10px;
                            border-radius: 3px;
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            background: #ffffff;
                            color: #9ca3af;
                            cursor: pointer;
                            transition: all 0.15s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.background='#fef2f2'; this.style.borderColor='#ef4444'; this.style.color='#ef4444'" 
                           onmouseout="this.style.background='#ffffff'; this.style.borderColor='rgba(0,0,0,0.1)'; this.style.color='#9ca3af'"
                           title="Skip">×</button>
                        <button onclick="window.minimalTutorial.next()" style="
                            width: 16px;
                            height: 16px;
                            padding: 0;
                            font-size: 9px;
                            border-radius: 3px;
                            border: 1px solid rgba(59, 130, 246, 0.3);
                            background: #3b82f6;
                            color: #ffffff;
                            cursor: pointer;
                            transition: all 0.15s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.background='#2563eb'" 
                           onmouseout="this.style.background='#3b82f6'"
                           title="${index < totalSteps - 1 ? 'Next' : 'Done'}">→</button>
                    </div>
                </div>
            </div>
        `;
        
        // Ultra-compact style - 60% smaller
        tooltipElement.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 20px;
            width: 72px;
            background: #ffffff;
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 6px;
            padding: 8px 6px;
            box-shadow: 0 2px 12px rgba(59, 130, 246, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08);
            z-index: 1000;
            font-family: Inter, -apple-system, sans-serif;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(tooltipElement);
        
        // Initialize lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Add pulse animation on first show
        if (index === 0) {
            tooltipElement.style.animation = 'tutorial-pulse 2s ease-in-out';
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
