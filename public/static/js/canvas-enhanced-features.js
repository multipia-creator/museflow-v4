/**
 * MuseFlow Canvas Enhanced Features
 * Figma-like functionality: Layer Panel, Multi-selection, Alignment Tools
 */

class CanvasEnhancedFeatures {
    constructor() {
        this.selectedCards = new Set();
        this.layers = [];
        this.clipboardData = null;
        this.isBoxSelecting = false;
        this.boxSelectStart = { x: 0, y: 0 };
        this.boxSelectEnd = { x: 0, y: 0 };
        this.snapToGrid = true;
        this.gridSize = 20;
        
        this.init();
    }

    init() {
        this.createLayerPanel();
        this.createAlignmentTools();
        this.createBoxSelectionOverlay();
        this.setupKeyboardShortcuts();
        this.setupBoxSelection();
        this.updateLayers();
    }

    // ==========================================
    // LAYER PANEL
    // ==========================================
    createLayerPanel() {
        const panel = document.createElement('div');
        panel.id = 'layer-panel';
        panel.innerHTML = `
            <div class="layer-panel-header">
                <h3><i class="fas fa-layer-group"></i> Layers</h3>
                <div class="layer-panel-actions">
                    <button id="collapse-all-layers" title="Collapse All">
                        <i class="fas fa-compress-alt"></i>
                    </button>
                    <button id="expand-all-layers" title="Expand All">
                        <i class="fas fa-expand-alt"></i>
                    </button>
                </div>
            </div>
            <div class="layer-search">
                <i class="fas fa-search"></i>
                <input type="text" id="layer-search-input" placeholder="Search layers...">
            </div>
            <div id="layer-list" class="layer-list"></div>
        `;
        document.body.appendChild(panel);

        // Setup search
        document.getElementById('layer-search-input').addEventListener('input', (e) => {
            this.filterLayers(e.target.value);
        });

        // Setup collapse/expand
        document.getElementById('collapse-all-layers').addEventListener('click', () => {
            this.collapseAllLayers();
        });
        document.getElementById('expand-all-layers').addEventListener('click', () => {
            this.expandAllLayers();
        });
    }

    updateLayers() {
        const cards = document.querySelectorAll('.card');
        this.layers = Array.from(cards).map((card, index) => ({
            id: card.id || `card-${index}`,
            element: card,
            title: card.querySelector('.card-title')?.textContent || 'Untitled',
            type: card.dataset.type || 'default',
            visible: true,
            locked: false,
            zIndex: card.style.zIndex || index
        }));
        
        this.renderLayers();
    }

    renderLayers() {
        const layerList = document.getElementById('layer-list');
        layerList.innerHTML = '';

        // Sort by z-index (descending)
        const sortedLayers = [...this.layers].sort((a, b) => b.zIndex - a.zIndex);

        sortedLayers.forEach(layer => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            layerItem.dataset.layerId = layer.id;
            
            if (this.selectedCards.has(layer.element)) {
                layerItem.classList.add('selected');
            }

            layerItem.innerHTML = `
                <div class="layer-item-content">
                    <button class="layer-visibility" data-layer-id="${layer.id}">
                        <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="layer-lock" data-layer-id="${layer.id}">
                        <i class="fas fa-lock${layer.locked ? '' : '-open'}"></i>
                    </button>
                    <span class="layer-type-icon">${this.getLayerTypeIcon(layer.type)}</span>
                    <span class="layer-title">${layer.title}</span>
                </div>
            `;

            // Click to select
            layerItem.addEventListener('click', (e) => {
                if (e.target.closest('.layer-visibility') || e.target.closest('.layer-lock')) return;
                
                if (e.shiftKey) {
                    this.toggleCardSelection(layer.element);
                } else if (e.metaKey || e.ctrlKey) {
                    this.toggleCardSelection(layer.element);
                } else {
                    this.selectCard(layer.element, false);
                }
            });

            // Toggle visibility
            layerItem.querySelector('.layer-visibility').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLayerVisibility(layer.id);
            });

            // Toggle lock
            layerItem.querySelector('.layer-lock').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLayerLock(layer.id);
            });

            layerList.appendChild(layerItem);
        });
    }

    getLayerTypeIcon(type) {
        const icons = {
            video: '🎥',
            audio: '🎵',
            image: '🖼️',
            document: '📄',
            data: '📊',
            default: '📦'
        };
        return icons[type] || icons.default;
    }

    filterLayers(query) {
        const layerItems = document.querySelectorAll('.layer-item');
        const searchTerm = query.toLowerCase();

        layerItems.forEach(item => {
            const title = item.querySelector('.layer-title').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleLayerVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            layer.element.style.display = layer.visible ? '' : 'none';
            this.renderLayers();
        }
    }

    toggleLayerLock(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.locked = !layer.locked;
            if (layer.locked) {
                layer.element.style.pointerEvents = 'none';
                layer.element.style.opacity = '0.6';
            } else {
                layer.element.style.pointerEvents = '';
                layer.element.style.opacity = '';
            }
            this.renderLayers();
        }
    }

    collapseAllLayers() {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.add('collapsed');
        });
    }

    expandAllLayers() {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('collapsed');
        });
    }

    // ==========================================
    // ALIGNMENT TOOLS
    // ==========================================
    createAlignmentTools() {
        const toolbar = document.createElement('div');
        toolbar.id = 'alignment-toolbar';
        toolbar.innerHTML = `
            <div class="alignment-toolbar-group">
                <span class="toolbar-label">Align</span>
                <button id="align-left" title="Align Left (Cmd+Shift+L)">
                    <i class="fas fa-align-left"></i>
                </button>
                <button id="align-center-h" title="Align Center Horizontal">
                    <i class="fas fa-align-center"></i>
                </button>
                <button id="align-right" title="Align Right (Cmd+Shift+R)">
                    <i class="fas fa-align-right"></i>
                </button>
            </div>
            <div class="alignment-toolbar-divider"></div>
            <div class="alignment-toolbar-group">
                <button id="align-top" title="Align Top (Cmd+Shift+T)">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button id="align-center-v" title="Align Center Vertical">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
                <button id="align-bottom" title="Align Bottom (Cmd+Shift+B)">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="alignment-toolbar-divider"></div>
            <div class="alignment-toolbar-group">
                <span class="toolbar-label">Distribute</span>
                <button id="distribute-h" title="Distribute Horizontal">
                    <i class="fas fa-arrows-alt-h"></i>
                </button>
                <button id="distribute-v" title="Distribute Vertical">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
            </div>
            <div class="alignment-toolbar-divider"></div>
            <div class="alignment-toolbar-group">
                <label class="snap-toggle">
                    <input type="checkbox" id="snap-to-grid" checked>
                    <span>Snap to Grid</span>
                </label>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Setup alignment buttons
        document.getElementById('align-left').addEventListener('click', () => this.alignLeft());
        document.getElementById('align-center-h').addEventListener('click', () => this.alignCenterH());
        document.getElementById('align-right').addEventListener('click', () => this.alignRight());
        document.getElementById('align-top').addEventListener('click', () => this.alignTop());
        document.getElementById('align-center-v').addEventListener('click', () => this.alignCenterV());
        document.getElementById('align-bottom').addEventListener('click', () => this.alignBottom());
        document.getElementById('distribute-h').addEventListener('click', () => this.distributeH());
        document.getElementById('distribute-v').addEventListener('click', () => this.distributeV());
        
        // Setup snap to grid toggle
        document.getElementById('snap-to-grid').addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
        });
    }

    alignLeft() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const minLeft = Math.min(...cards.map(c => parseInt(c.style.left || 0)));
        cards.forEach(card => {
            card.style.left = `${minLeft}px`;
        });
    }

    alignCenterH() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const bounds = this.getSelectionBounds(cards);
        const centerX = bounds.left + bounds.width / 2;
        
        cards.forEach(card => {
            const cardWidth = card.offsetWidth;
            card.style.left = `${centerX - cardWidth / 2}px`;
        });
    }

    alignRight() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const maxRight = Math.max(...cards.map(c => parseInt(c.style.left || 0) + c.offsetWidth));
        cards.forEach(card => {
            card.style.left = `${maxRight - card.offsetWidth}px`;
        });
    }

    alignTop() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const minTop = Math.min(...cards.map(c => parseInt(c.style.top || 0)));
        cards.forEach(card => {
            card.style.top = `${minTop}px`;
        });
    }

    alignCenterV() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const bounds = this.getSelectionBounds(cards);
        const centerY = bounds.top + bounds.height / 2;
        
        cards.forEach(card => {
            const cardHeight = card.offsetHeight;
            card.style.top = `${centerY - cardHeight / 2}px`;
        });
    }

    alignBottom() {
        if (this.selectedCards.size < 2) return;
        const cards = Array.from(this.selectedCards);
        const maxBottom = Math.max(...cards.map(c => parseInt(c.style.top || 0) + c.offsetHeight));
        cards.forEach(card => {
            card.style.top = `${maxBottom - card.offsetHeight}px`;
        });
    }

    distributeH() {
        if (this.selectedCards.size < 3) return;
        const cards = Array.from(this.selectedCards).sort((a, b) => 
            parseInt(a.style.left || 0) - parseInt(b.style.left || 0)
        );
        
        const first = cards[0];
        const last = cards[cards.length - 1];
        const firstLeft = parseInt(first.style.left || 0);
        const lastLeft = parseInt(last.style.left || 0);
        const totalSpace = lastLeft - firstLeft;
        const spacing = totalSpace / (cards.length - 1);
        
        cards.forEach((card, index) => {
            if (index > 0 && index < cards.length - 1) {
                card.style.left = `${firstLeft + spacing * index}px`;
            }
        });
    }

    distributeV() {
        if (this.selectedCards.size < 3) return;
        const cards = Array.from(this.selectedCards).sort((a, b) => 
            parseInt(a.style.top || 0) - parseInt(b.style.top || 0)
        );
        
        const first = cards[0];
        const last = cards[cards.length - 1];
        const firstTop = parseInt(first.style.top || 0);
        const lastTop = parseInt(last.style.top || 0);
        const totalSpace = lastTop - firstTop;
        const spacing = totalSpace / (cards.length - 1);
        
        cards.forEach((card, index) => {
            if (index > 0 && index < cards.length - 1) {
                card.style.top = `${firstTop + spacing * index}px`;
            }
        });
    }

    getSelectionBounds(cards) {
        const lefts = cards.map(c => parseInt(c.style.left || 0));
        const tops = cards.map(c => parseInt(c.style.top || 0));
        const rights = cards.map(c => parseInt(c.style.left || 0) + c.offsetWidth);
        const bottoms = cards.map(c => parseInt(c.style.top || 0) + c.offsetHeight);
        
        return {
            left: Math.min(...lefts),
            top: Math.min(...tops),
            right: Math.max(...rights),
            bottom: Math.max(...bottoms),
            width: Math.max(...rights) - Math.min(...lefts),
            height: Math.max(...bottoms) - Math.min(...tops)
        };
    }

    // ==========================================
    // BOX SELECTION
    // ==========================================
    createBoxSelectionOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'box-selection-overlay';
        overlay.style.cssText = `
            position: absolute;
            border: 2px solid #3B82F6;
            background: rgba(59, 130, 246, 0.1);
            pointer-events: none;
            display: none;
            z-index: 10000;
        `;
        document.body.appendChild(overlay);
    }

    setupBoxSelection() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('mousedown', (e) => {
            // Only start box selection if clicking on canvas background (not on cards)
            if (e.target.classList.contains('card') || e.target.closest('.card')) return;
            
            this.isBoxSelecting = true;
            this.boxSelectStart = { x: e.clientX, y: e.clientY };
            
            const overlay = document.getElementById('box-selection-overlay');
            overlay.style.display = 'block';
            overlay.style.left = `${e.clientX}px`;
            overlay.style.top = `${e.clientY}px`;
            overlay.style.width = '0';
            overlay.style.height = '0';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isBoxSelecting) return;
            
            this.boxSelectEnd = { x: e.clientX, y: e.clientY };
            this.updateBoxSelection();
        });

        document.addEventListener('mouseup', () => {
            if (this.isBoxSelecting) {
                this.finishBoxSelection();
                this.isBoxSelecting = false;
                document.getElementById('box-selection-overlay').style.display = 'none';
            }
        });
    }

    updateBoxSelection() {
        const overlay = document.getElementById('box-selection-overlay');
        const left = Math.min(this.boxSelectStart.x, this.boxSelectEnd.x);
        const top = Math.min(this.boxSelectStart.y, this.boxSelectEnd.y);
        const width = Math.abs(this.boxSelectEnd.x - this.boxSelectStart.x);
        const height = Math.abs(this.boxSelectEnd.y - this.boxSelectStart.y);
        
        overlay.style.left = `${left}px`;
        overlay.style.top = `${top}px`;
        overlay.style.width = `${width}px`;
        overlay.style.height = `${height}px`;
    }

    finishBoxSelection() {
        const selectionRect = {
            left: Math.min(this.boxSelectStart.x, this.boxSelectEnd.x),
            top: Math.min(this.boxSelectStart.y, this.boxSelectEnd.y),
            right: Math.max(this.boxSelectStart.x, this.boxSelectEnd.x),
            bottom: Math.max(this.boxSelectStart.y, this.boxSelectEnd.y)
        };

        const cards = document.querySelectorAll('.card');
        this.clearSelection();

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (this.intersects(rect, selectionRect)) {
                this.addToSelection(card);
            }
        });

        this.updateLayers();
    }

    intersects(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    // ==========================================
    // SELECTION MANAGEMENT
    // ==========================================
    selectCard(card, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        this.selectedCards.add(card);
        card.classList.add('selected');
        this.updateLayers();
    }

    toggleCardSelection(card) {
        if (this.selectedCards.has(card)) {
            this.selectedCards.delete(card);
            card.classList.remove('selected');
        } else {
            this.selectedCards.add(card);
            card.classList.add('selected');
        }
        this.updateLayers();
    }

    addToSelection(card) {
        this.selectedCards.add(card);
        card.classList.add('selected');
    }

    clearSelection() {
        this.selectedCards.forEach(card => {
            card.classList.remove('selected');
        });
        this.selectedCards.clear();
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            // Cmd/Ctrl + D: Duplicate
            if (cmdOrCtrl && e.key === 'd') {
                e.preventDefault();
                this.duplicateSelection();
            }

            // Cmd/Ctrl + G: Group
            if (cmdOrCtrl && e.key === 'g') {
                e.preventDefault();
                this.groupSelection();
            }

            // Cmd/Ctrl + Shift + G: Ungroup
            if (cmdOrCtrl && e.shiftKey && e.key === 'g') {
                e.preventDefault();
                this.ungroupSelection();
            }

            // Delete/Backspace: Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.deleteSelection();
                }
            }

            // Cmd/Ctrl + A: Select All
            if (cmdOrCtrl && e.key === 'a') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.selectAll();
                }
            }

            // Cmd/Ctrl + C: Copy
            if (cmdOrCtrl && e.key === 'c') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.copySelection();
                }
            }

            // Cmd/Ctrl + V: Paste
            if (cmdOrCtrl && e.key === 'v') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.pasteSelection();
                }
            }

            // Arrow keys: Move selection
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (!e.target.matches('input, textarea') && this.selectedCards.size > 0) {
                    e.preventDefault();
                    this.moveSelection(e.key, e.shiftKey ? 10 : 1);
                }
            }

            // Cmd/Ctrl + Shift + L/R/T/B: Align
            if (cmdOrCtrl && e.shiftKey) {
                if (e.key === 'l') { e.preventDefault(); this.alignLeft(); }
                if (e.key === 'r') { e.preventDefault(); this.alignRight(); }
                if (e.key === 't') { e.preventDefault(); this.alignTop(); }
                if (e.key === 'b') { e.preventDefault(); this.alignBottom(); }
            }
        });
    }

    duplicateSelection() {
        if (this.selectedCards.size === 0) return;
        
        const newCards = [];
        this.selectedCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            clone.style.left = `${parseInt(card.style.left || 0) + 20}px`;
            clone.style.top = `${parseInt(card.style.top || 0) + 20}px`;
            document.getElementById('canvas').appendChild(clone);
            newCards.push(clone);
        });
        
        this.clearSelection();
        newCards.forEach(card => this.addToSelection(card));
        this.updateLayers();
    }

    deleteSelection() {
        if (this.selectedCards.size === 0) return;
        
        this.selectedCards.forEach(card => {
            card.remove();
        });
        this.clearSelection();
        this.updateLayers();
    }

    selectAll() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => this.addToSelection(card));
        this.updateLayers();
    }

    copySelection() {
        if (this.selectedCards.size === 0) return;
        
        this.clipboardData = Array.from(this.selectedCards).map(card => ({
            html: card.outerHTML,
            left: parseInt(card.style.left || 0),
            top: parseInt(card.style.top || 0)
        }));
    }

    pasteSelection() {
        if (!this.clipboardData) return;
        
        this.clearSelection();
        const canvas = document.getElementById('canvas');
        
        this.clipboardData.forEach(data => {
            const temp = document.createElement('div');
            temp.innerHTML = data.html;
            const card = temp.firstChild;
            card.id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            card.style.left = `${data.left + 20}px`;
            card.style.top = `${data.top + 20}px`;
            canvas.appendChild(card);
            this.addToSelection(card);
        });
        
        this.updateLayers();
    }

    moveSelection(direction, amount) {
        this.selectedCards.forEach(card => {
            const left = parseInt(card.style.left || 0);
            const top = parseInt(card.style.top || 0);
            
            switch(direction) {
                case 'ArrowLeft':
                    card.style.left = `${left - amount}px`;
                    break;
                case 'ArrowRight':
                    card.style.left = `${left + amount}px`;
                    break;
                case 'ArrowUp':
                    card.style.top = `${top - amount}px`;
                    break;
                case 'ArrowDown':
                    card.style.top = `${top + amount}px`;
                    break;
            }
        });
    }

    groupSelection() {
        if (this.selectedCards.size < 2) return;
        console.log('Group functionality - to be implemented');
    }

    ungroupSelection() {
        console.log('Ungroup functionality - to be implemented');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.canvasFeatures = new CanvasEnhancedFeatures();
    });
} else {
    window.canvasFeatures = new CanvasEnhancedFeatures();
}
