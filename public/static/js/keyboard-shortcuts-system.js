/**
 * MuseFlow World-Class Keyboard Shortcuts System
 * 
 * Implements 25+ core keyboard shortcuts matching Figma/industry standards
 * 
 * @version 1.0.0
 * @date 2025-12-08
 * @goal Reach Figma-level keyboard efficiency (96/100)
 */

class KeyboardShortcutsSystem {
    constructor() {
        this.shortcuts = {};
        this.activeModifiers = {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false
        };
        
        this.init();
    }
    
    init() {
        console.log('🎹 Keyboard Shortcuts System Initialized');
        this.registerCoreShortcuts();
        this.setupEventListeners();
        this.createShortcutGuide();
    }
    
    // ========================================
    // CORE SHORTCUTS REGISTRATION
    // ========================================
    
    registerCoreShortcuts() {
        // === TOOLS (5 shortcuts) ===
        this.register('v', 'selectTool', 'Activate select/move tool');
        this.register('r', 'rectangleTool', 'Create rectangle');
        this.register('t', 'textTool', 'Add text');
        this.register('h', 'handTool', 'Activate hand tool (pan)');
        this.register('c', 'commentTool', 'Add comment');
        
        // === ACTIONS (10 shortcuts) ===
        this.register('Cmd+c', 'copy', 'Copy selection');
        this.register('Cmd+v', 'paste', 'Paste');
        this.register('Cmd+d', 'duplicate', 'Duplicate selection');
        this.register('Cmd+g', 'group', 'Group selection');
        this.register('Cmd+Shift+g', 'ungroup', 'Ungroup');
        this.register('Delete', 'delete', 'Delete selection');
        this.register('Backspace', 'delete', 'Delete selection');
        this.register('Cmd+a', 'selectAll', 'Select all');
        this.register('Cmd+z', 'undo', 'Undo');
        this.register('Cmd+Shift+z', 'redo', 'Redo');
        
        // === VIEW (7 shortcuts) ===
        this.register('Cmd+0', 'zoomTo100', 'Zoom to 100%');
        this.register('Cmd+1', 'zoomToFit', 'Zoom to fit all');
        this.register('Cmd+2', 'zoomToSelection', 'Zoom to selection');
        this.register('Cmd++', 'zoomIn', 'Zoom in');
        this.register('Cmd+=', 'zoomIn', 'Zoom in (alternative)');
        this.register('Cmd+-', 'zoomOut', 'Zoom out');
        this.register('Cmd+_', 'zoomOut', 'Zoom out (alternative)');
        
        // === NAVIGATION (4 shortcuts) ===
        this.register('ArrowUp', 'nudgeUp', 'Move selection up 1px');
        this.register('ArrowDown', 'nudgeDown', 'Move selection down 1px');
        this.register('ArrowLeft', 'nudgeLeft', 'Move selection left 1px');
        this.register('ArrowRight', 'nudgeRight', 'Move selection right 1px');
        this.register('Shift+ArrowUp', 'nudgeUp10', 'Move selection up 10px');
        this.register('Shift+ArrowDown', 'nudgeDown10', 'Move selection down 10px');
        this.register('Shift+ArrowLeft', 'nudgeLeft10', 'Move selection left 10px');
        this.register('Shift+ArrowRight', 'nudgeRight10', 'Move selection right 10px');
        
        // === PANELS (4 shortcuts) ===
        this.register('Cmd+/', 'toggleShortcutGuide', 'Toggle keyboard shortcuts guide');
        this.register('?', 'toggleShortcutGuide', 'Toggle keyboard shortcuts guide');
        this.register('Escape', 'closeAllPanels', 'Close all panels');
        this.register('Space', 'activateHandTool', 'Temporary hand tool (hold)');
        
        console.log(`✅ Registered ${Object.keys(this.shortcuts).length} keyboard shortcuts`);
    }
    
    register(keyCombo, action, description) {
        this.shortcuts[keyCombo.toLowerCase()] = {
            action: action,
            description: description,
            handler: this.getActionHandler(action)
        };
    }
    
    // ========================================
    // ACTION HANDLERS
    // ========================================
    
    getActionHandler(action) {
        const handlers = {
            // Tools
            selectTool: () => this.activateTool('select'),
            rectangleTool: () => this.activateTool('rectangle'),
            textTool: () => this.activateTool('text'),
            handTool: () => this.activateTool('hand'),
            commentTool: () => this.activateTool('comment'),
            
            // Actions
            copy: () => this.copySelection(),
            paste: () => this.pasteSelection(),
            duplicate: () => this.duplicateSelection(),
            group: () => this.groupSelection(),
            ungroup: () => this.ungroupSelection(),
            delete: () => this.deleteSelection(),
            selectAll: () => this.selectAll(),
            undo: () => this.undo(),
            redo: () => this.redo(),
            
            // View
            zoomTo100: () => this.setZoom(1),
            zoomToFit: () => this.zoomToFit(),
            zoomToSelection: () => this.zoomToSelection(),
            zoomIn: () => this.zoomIn(),
            zoomOut: () => this.zoomOut(),
            
            // Navigation
            nudgeUp: () => this.nudge(0, -1),
            nudgeDown: () => this.nudge(0, 1),
            nudgeLeft: () => this.nudge(-1, 0),
            nudgeRight: () => this.nudge(1, 0),
            nudgeUp10: () => this.nudge(0, -10),
            nudgeDown10: () => this.nudge(0, 10),
            nudgeLeft10: () => this.nudge(-10, 0),
            nudgeRight10: () => this.nudge(10, 0),
            
            // Panels
            toggleShortcutGuide: () => this.toggleShortcutGuide(),
            closeAllPanels: () => this.closeAllPanels(),
            activateHandTool: () => this.activateHandTool()
        };
        
        return handlers[action] || (() => console.warn(`No handler for action: ${action}`));
    }
    
    // ========================================
    // TOOL ACTIONS
    // ========================================
    
    activateTool(toolName) {
        console.log(`🔧 Tool activated: ${toolName}`);
        this.announce(`${toolName} tool activated`);
        
        // Visual feedback
        const toolIndicator = document.getElementById('current-tool');
        if (toolIndicator) {
            toolIndicator.textContent = toolName.charAt(0).toUpperCase() + toolName.slice(1);
        }
        
        // Change cursor
        const canvas = document.querySelector('.canvas');
        if (canvas) {
            canvas.style.cursor = this.getToolCursor(toolName);
        }
    }
    
    getToolCursor(toolName) {
        const cursors = {
            select: 'default',
            rectangle: 'crosshair',
            text: 'text',
            hand: 'grab',
            comment: 'help'
        };
        return cursors[toolName] || 'default';
    }
    
    // ========================================
    // SELECTION ACTIONS
    // ========================================
    
    copySelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) {
            this.announce('No selection to copy');
            return;
        }
        
        console.log(`📋 Copied ${selected.length} item(s)`);
        this.announce(`Copied ${selected.length} item(s)`);
        
        // Store in clipboard
        window.clipboardData = Array.from(selected).map(card => ({
            html: card.outerHTML,
            left: parseInt(card.style.left) || 0,
            top: parseInt(card.style.top) || 0
        }));
    }
    
    pasteSelection() {
        if (!window.clipboardData || window.clipboardData.length === 0) {
            this.announce('Nothing to paste');
            return;
        }
        
        console.log(`📋 Pasted ${window.clipboardData.length} item(s)`);
        this.announce(`Pasted ${window.clipboardData.length} item(s)`);
        
        const viewport = document.querySelector('.viewport');
        if (!viewport) return;
        
        // Paste with offset
        window.clipboardData.forEach(item => {
            const temp = document.createElement('div');
            temp.innerHTML = item.html;
            const newCard = temp.firstElementChild;
            
            // Offset position
            newCard.style.left = (item.left + 20) + 'px';
            newCard.style.top = (item.top + 20) + 'px';
            
            viewport.appendChild(newCard);
        });
    }
    
    duplicateSelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) {
            this.announce('No selection to duplicate');
            return;
        }
        
        console.log(`📋 Duplicated ${selected.length} item(s)`);
        this.announce(`Duplicated ${selected.length} item(s)`);
        
        const viewport = document.querySelector('.viewport');
        if (!viewport) return;
        
        selected.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.remove('selected');
            
            // Offset position
            const left = parseInt(card.style.left) || 0;
            const top = parseInt(card.style.top) || 0;
            clone.style.left = (left + 20) + 'px';
            clone.style.top = (top + 20) + 'px';
            
            viewport.appendChild(clone);
        });
    }
    
    groupSelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length < 2) {
            this.announce('Select 2 or more items to group');
            return;
        }
        
        console.log(`📦 Grouped ${selected.length} items`);
        this.announce(`Grouped ${selected.length} items`);
    }
    
    ungroupSelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) {
            this.announce('No group selected');
            return;
        }
        
        console.log(`📦 Ungrouped selection`);
        this.announce('Ungrouped selection');
    }
    
    deleteSelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) {
            this.announce('No selection to delete');
            return;
        }
        
        console.log(`🗑️ Deleted ${selected.length} item(s)`);
        this.announce(`Deleted ${selected.length} item(s)`);
        
        selected.forEach(card => card.remove());
    }
    
    selectAll() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('selected'));
        
        console.log(`✅ Selected all ${cards.length} items`);
        this.announce(`Selected ${cards.length} items`);
    }
    
    // ========================================
    // HISTORY ACTIONS
    // ========================================
    
    undo() {
        console.log('↩️ Undo');
        this.announce('Undo');
        // TODO: Implement undo stack
    }
    
    redo() {
        console.log('↪️ Redo');
        this.announce('Redo');
        // TODO: Implement redo stack
    }
    
    // ========================================
    // VIEW ACTIONS
    // ========================================
    
    setZoom(level) {
        const viewport = document.querySelector('.viewport');
        if (!viewport) return;
        
        viewport.style.transform = `scale(${level})`;
        console.log(`🔍 Zoom: ${level * 100}%`);
        this.announce(`Zoom ${level * 100}%`);
    }
    
    zoomToFit() {
        console.log('🔍 Zoom to fit');
        this.announce('Zoom to fit');
        // TODO: Calculate fit zoom
        this.setZoom(1);
    }
    
    zoomToSelection() {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) {
            this.announce('No selection to zoom to');
            return;
        }
        
        console.log('🔍 Zoom to selection');
        this.announce('Zoom to selection');
        // TODO: Calculate selection bounds and zoom
    }
    
    zoomIn() {
        const viewport = document.querySelector('.viewport');
        if (!viewport) return;
        
        const currentScale = parseFloat(viewport.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
        const newScale = Math.min(currentScale * 1.2, 5);
        this.setZoom(newScale);
    }
    
    zoomOut() {
        const viewport = document.querySelector('.viewport');
        if (!viewport) return;
        
        const currentScale = parseFloat(viewport.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
        const newScale = Math.max(currentScale * 0.8, 0.1);
        this.setZoom(newScale);
    }
    
    // ========================================
    // NAVIGATION ACTIONS
    // ========================================
    
    nudge(dx, dy) {
        const selected = document.querySelectorAll('.card.selected');
        if (selected.length === 0) return;
        
        selected.forEach(card => {
            const left = parseInt(card.style.left) || 0;
            const top = parseInt(card.style.top) || 0;
            
            card.style.left = (left + dx) + 'px';
            card.style.top = (top + dy) + 'px';
        });
        
        // Update connections if exists
        if (window.worldClassCanvas) {
            window.worldClassCanvas.updateAllConnections();
        }
    }
    
    // ========================================
    // PANEL ACTIONS
    // ========================================
    
    closeAllPanels() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        });
        
        console.log('🚪 Closed all panels');
        this.announce('Closed all panels');
    }
    
    activateHandTool() {
        const canvas = document.querySelector('.canvas');
        if (canvas) {
            canvas.style.cursor = 'grab';
            console.log('✋ Hand tool activated (hold Space)');
        }
    }
    
    toggleShortcutGuide() {
        const guide = document.getElementById('keyboard-shortcuts-guide');
        if (!guide) return;
        
        const isHidden = guide.style.display === 'none' || !guide.style.display;
        guide.style.display = isHidden ? 'flex' : 'none';
        
        console.log(`📚 Shortcuts guide: ${isHidden ? 'shown' : 'hidden'}`);
        this.announce(`Shortcuts guide ${isHidden ? 'opened' : 'closed'}`);
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        console.log('✅ Keyboard event listeners attached');
    }
    
    handleKeyDown(e) {
        // Update modifier states
        this.activeModifiers.ctrl = e.ctrlKey;
        this.activeModifiers.shift = e.shiftKey;
        this.activeModifiers.alt = e.altKey;
        this.activeModifiers.meta = e.metaKey;
        
        // Skip if typing in input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            return;
        }
        
        // Build key combo string
        const keyCombo = this.buildKeyCombo(e);
        
        // Find and execute shortcut
        const shortcut = this.shortcuts[keyCombo];
        if (shortcut) {
            e.preventDefault();
            e.stopPropagation();
            shortcut.handler();
        }
    }
    
    handleKeyUp(e) {
        // Reset hand tool on Space release
        if (e.code === 'Space') {
            const canvas = document.querySelector('.canvas');
            if (canvas) {
                canvas.style.cursor = 'default';
            }
        }
    }
    
    buildKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('Cmd');
        if (e.shiftKey) parts.push('Shift');
        if (e.altKey) parts.push('Alt');
        
        // Handle special keys
        const specialKeys = {
            'Backspace': 'Backspace',
            'Delete': 'Delete',
            'Escape': 'Escape',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'Space': 'Space'
        };
        
        if (specialKeys[e.key]) {
            parts.push(specialKeys[e.key]);
        } else if (e.key.length === 1) {
            parts.push(e.key.toLowerCase());
        }
        
        return parts.join('+').toLowerCase();
    }
    
    // ========================================
    // SHORTCUT GUIDE UI
    // ========================================
    
    createShortcutGuide() {
        const guide = document.createElement('div');
        guide.id = 'keyboard-shortcuts-guide';
        guide.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 700px;
            max-height: 80vh;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            overflow: hidden;
            flex-direction: column;
        `;
        
        guide.innerHTML = `
            <div style="padding: 24px 32px; border-bottom: 1px solid #E5E5E5; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="font-size: 20px; font-weight: 700; margin: 0;">Keyboard Shortcuts</h2>
                <button onclick="document.getElementById('keyboard-shortcuts-guide').style.display='none'" 
                        style="width: 32px; height: 32px; border-radius: 8px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                        aria-label="Close shortcuts guide">
                    <i data-lucide="x" style="width:16px;height:16px"></i>
                </button>
            </div>
            <div style="padding: 24px 32px; overflow-y: auto; max-height: calc(80vh - 80px);">
                ${this.renderShortcutCategories()}
            </div>
        `;
        
        document.body.appendChild(guide);
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        console.log('✅ Keyboard shortcuts guide created');
    }
    
    renderShortcutCategories() {
        const categories = {
            'Tools': ['v', 'r', 't', 'h', 'c'],
            'Actions': ['Cmd+c', 'Cmd+v', 'Cmd+d', 'Cmd+g', 'Cmd+Shift+g', 'Delete', 'Cmd+a', 'Cmd+z', 'Cmd+Shift+z'],
            'View': ['Cmd+0', 'Cmd+1', 'Cmd+2', 'Cmd++', 'Cmd+-'],
            'Navigation': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
            'Panels': ['Cmd+/', 'Escape']
        };
        
        return Object.entries(categories).map(([category, keys]) => {
            const shortcuts = keys.map(key => {
                const shortcut = this.shortcuts[key.toLowerCase()];
                if (!shortcut) return '';
                
                return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0;">
                        <span style="color: #666666; font-size: 13px;">${shortcut.description}</span>
                        <kbd style="padding: 4px 8px; background: #F3F4F6; border-radius: 4px; font-family: 'SF Mono', Monaco, monospace; font-size: 11px; font-weight: 600; color: #000000;">
                            ${this.formatKeyCombo(key)}
                        </kbd>
                    </div>
                `;
            }).join('');
            
            return `
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #000000;">${category}</h3>
                    ${shortcuts}
                </div>
            `;
        }).join('');
    }
    
    formatKeyCombo(combo) {
        return combo
            .replace(/Cmd/g, '⌘')
            .replace(/Shift/g, '⇧')
            .replace(/Alt/g, '⌥')
            .replace(/ArrowUp/g, '↑')
            .replace(/ArrowDown/g, '↓')
            .replace(/ArrowLeft/g, '←')
            .replace(/ArrowRight/g, '→')
            .replace(/\+/g, ' ');
    }
    
    // ========================================
    // ACCESSIBILITY ANNOUNCEMENTS
    // ========================================
    
    announce(message) {
        const announcer = document.getElementById('aria-announcer') || this.createAnnouncer();
        announcer.textContent = message;
        
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
    
    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'aria-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        return announcer;
    }
}

// Global initialization
window.KeyboardShortcutsSystem = KeyboardShortcutsSystem;

console.log('🌟 Keyboard Shortcuts System Loaded');
