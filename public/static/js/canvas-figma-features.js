/**
 * MuseFlow Canvas - Figma-like Features
 * 캔버스 페이지 개선: 레이어 관리 + 선택/편집 + 정렬 도구
 */

// ========== 1. Layer Management System ==========
class LayerManager {
    constructor() {
        this.layers = [];
        this.selectedLayers = [];
        this.layerIdCounter = 1;
    }

    init() {
        this.createLayerPanel();
        this.bindEvents();
        this.refreshLayerTree();
    }

    createLayerPanel() {
        const layerPanelHTML = `
            <div class="layer-panel" id="layerPanel" style="
                position: fixed;
                left: 40px;
                top: 64px;
                bottom: 48px;
                width: 280px;
                background: rgba(26, 26, 26, 0.98);
                border: 1px solid #333;
                border-radius: 8px;
                z-index: 150;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <div class="layer-panel-header" style="
                    padding: 16px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="font-size: 14px; font-weight: 600; color: #fff; margin: 0;">
                        <i class="fas fa-layer-group" style="margin-right: 8px; color: #8b5cf6;"></i>
                        Layers
                    </h3>
                    <button class="layer-panel-toggle" onclick="toggleLayerPanel()" style="
                        width: 28px;
                        height: 28px;
                        border: none;
                        background: transparent;
                        color: #666;
                        cursor: pointer;
                        border-radius: 6px;
                        transition: all 0.2s;
                    " title="Toggle Panel">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
                <div class="layer-search" style="
                    padding: 12px 16px;
                    border-bottom: 1px solid #333;
                    position: relative;
                ">
                    <input type="text" id="layerSearch" placeholder="Search layers..." style="
                        width: 100%;
                        padding: 8px 12px 8px 36px;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid #444;
                        border-radius: 6px;
                        color: #fff;
                        font-size: 13px;
                        outline: none;
                        transition: all 0.2s;
                    ">
                    <i class="fas fa-search" style="
                        position: absolute;
                        left: 28px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #666;
                        font-size: 12px;
                    "></i>
                </div>
                <div class="layer-tree" id="layerTree" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                ">
                    <!-- Layer items will be dynamically inserted -->
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', layerPanelHTML);
    }

    bindEvents() {
        // Layer search
        const searchInput = document.getElementById('layerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterLayers(e.target.value));
        }

        // Drag and drop for layer reordering
        const layerTree = document.getElementById('layerTree');
        if (layerTree) {
            layerTree.addEventListener('dragover', this.handleDragOver.bind(this));
            layerTree.addEventListener('drop', this.handleDrop.bind(this));
        }
    }

    addLayer(element) {
        const layerId = `layer-${this.layerIdCounter++}`;
        const layer = {
            id: layerId,
            element: element,
            name: element.dataset.layerName || `Layer ${this.layerIdCounter - 1}`,
            type: element.dataset.type || 'card',
            visible: true,
            locked: false,
            order: this.layers.length
        };
        
        element.dataset.layerId = layerId;
        this.layers.push(layer);
        this.refreshLayerTree();
        return layerId;
    }

    removeLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index > -1) {
            this.layers.splice(index, 1);
            this.refreshLayerTree();
        }
    }

    refreshLayerTree() {
        const layerTree = document.getElementById('layerTree');
        if (!layerTree) return;

        layerTree.innerHTML = this.layers.map(layer => {
            const isSelected = this.selectedLayers.includes(layer.id);
            return `
                <div class="layer-item" 
                     data-layer-id="${layer.id}" 
                     draggable="true"
                     onclick="window.layerManager.selectLayer('${layer.id}', event)"
                     style="
                         padding: 8px 12px;
                         margin: 4px 0;
                         background: ${isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)'};
                         border: 1px solid ${isSelected ? '#8b5cf6' : '#333'};
                         border-radius: 6px;
                         cursor: pointer;
                         display: flex;
                         align-items: center;
                         gap: 8px;
                         transition: all 0.2s;
                     ">
                    <i class="fas fa-grip-vertical" style="color: #666; font-size: 10px; cursor: grab;"></i>
                    <i class="fas ${this.getLayerIcon(layer.type)}" style="color: #8b5cf6; font-size: 12px;"></i>
                    <span style="flex: 1; font-size: 13px; color: #fff; font-weight: 500;">${layer.name}</span>
                    <button onclick="window.layerManager.toggleVisibility('${layer.id}', event)" style="
                        width: 24px;
                        height: 24px;
                        border: none;
                        background: transparent;
                        color: ${layer.visible ? '#8b5cf6' : '#666'};
                        cursor: pointer;
                        border-radius: 4px;
                        transition: all 0.2s;
                    ">
                        <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button onclick="window.layerManager.toggleLock('${layer.id}', event)" style="
                        width: 24px;
                        height: 24px;
                        border: none;
                        background: transparent;
                        color: ${layer.locked ? '#ef4444' : '#666'};
                        cursor: pointer;
                        border-radius: 4px;
                        transition: all 0.2s;
                    ">
                        <i class="fas ${layer.locked ? 'fa-lock' : 'fa-lock-open'}"></i>
                    </button>
                </div>
            `;
        }).join('');

        // Bind drag events
        const items = layerTree.querySelectorAll('.layer-item');
        items.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    getLayerIcon(type) {
        const icons = {
            'card': 'fa-square',
            'video': 'fa-video',
            'audio': 'fa-volume-up',
            'image': 'fa-image',
            'text': 'fa-font',
            'node': 'fa-circle'
        };
        return icons[type] || 'fa-square';
    }

    selectLayer(layerId, event) {
        event?.stopPropagation();
        
        if (event?.shiftKey) {
            // Multi-select with Shift
            const index = this.selectedLayers.indexOf(layerId);
            if (index > -1) {
                this.selectedLayers.splice(index, 1);
            } else {
                this.selectedLayers.push(layerId);
            }
        } else {
            // Single select
            this.selectedLayers = [layerId];
        }
        
        this.refreshLayerTree();
        this.highlightSelectedElements();
    }

    highlightSelectedElements() {
        // Remove previous highlights
        document.querySelectorAll('.layer-selected').forEach(el => {
            el.classList.remove('layer-selected');
        });

        // Add highlights to selected layers
        this.selectedLayers.forEach(layerId => {
            const layer = this.layers.find(l => l.id === layerId);
            if (layer && layer.element) {
                layer.element.classList.add('layer-selected');
            }
        });
    }

    toggleVisibility(layerId, event) {
        event?.stopPropagation();
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            if (layer.element) {
                layer.element.style.display = layer.visible ? '' : 'none';
            }
            this.refreshLayerTree();
        }
    }

    toggleLock(layerId, event) {
        event?.stopPropagation();
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.locked = !layer.locked;
            if (layer.element) {
                layer.element.style.pointerEvents = layer.locked ? 'none' : '';
                layer.element.style.opacity = layer.locked ? '0.6' : '1';
            }
            this.refreshLayerTree();
        }
    }

    filterLayers(searchText) {
        const items = document.querySelectorAll('.layer-item');
        items.forEach(item => {
            const layerId = item.dataset.layerId;
            const layer = this.layers.find(l => l.id === layerId);
            if (layer) {
                const matches = layer.name.toLowerCase().includes(searchText.toLowerCase());
                item.style.display = matches ? '' : 'none';
            }
        });
    }

    handleDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.target.style.opacity = '0.5';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        // Implement reordering logic here
        return false;
    }
}

// ========== 2. Selection & Editing System ==========
class SelectionManager {
    constructor() {
        this.selectedElements = [];
        this.selectionBox = null;
        this.isBoxSelecting = false;
        this.boxStartX = 0;
        this.boxStartY = 0;
    }

    init() {
        this.createSelectionBox();
        this.bindKeyboardEvents();
        this.bindMouseEvents();
    }

    createSelectionBox() {
        this.selectionBox = document.createElement('div');
        this.selectionBox.id = 'selectionBox';
        this.selectionBox.style.cssText = `
            position: absolute;
            border: 2px dashed #3B82F6;
            background: rgba(59, 130, 246, 0.1);
            pointer-events: none;
            display: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.selectionBox);
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Shift + Click for multi-select (handled in click event)
            
            // Ctrl/Cmd + A: Select All
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }

            // Ctrl/Cmd + D: Duplicate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.duplicateSelected();
            }

            // Delete/Backspace: Delete selected
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.deleteSelected();
                }
            }

            // Arrow keys: Move selected
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    this.moveSelected(e.key, e.shiftKey ? 10 : 1);
                }
            }

            // Escape: Clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    bindMouseEvents() {
        const viewport = document.getElementById('vp');
        if (!viewport) return;

        viewport.addEventListener('mousedown', (e) => {
            if (e.shiftKey && e.button === 0) {
                // Start box selection
                this.startBoxSelection(e);
            } else if (e.target.classList.contains('card') || e.target.closest('.card')) {
                // Card selection
                const card = e.target.classList.contains('card') ? e.target : e.target.closest('.card');
                this.selectElement(card, e.shiftKey);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isBoxSelecting) {
                this.updateBoxSelection(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isBoxSelecting) {
                this.endBoxSelection(e);
            }
        });
    }

    startBoxSelection(e) {
        this.isBoxSelecting = true;
        this.boxStartX = e.clientX;
        this.boxStartY = e.clientY;
        
        this.selectionBox.style.left = e.clientX + 'px';
        this.selectionBox.style.top = e.clientY + 'px';
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';
        this.selectionBox.style.display = 'block';
    }

    updateBoxSelection(e) {
        if (!this.isBoxSelecting) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const left = Math.min(this.boxStartX, currentX);
        const top = Math.min(this.boxStartY, currentY);
        const width = Math.abs(currentX - this.boxStartX);
        const height = Math.abs(currentY - this.boxStartY);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    endBoxSelection(e) {
        this.isBoxSelecting = false;
        this.selectionBox.style.display = 'none';

        // Find elements within selection box
        const boxRect = this.selectionBox.getBoundingClientRect();
        const cards = document.querySelectorAll('.card');
        
        this.clearSelection();
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            if (this.isIntersecting(boxRect, cardRect)) {
                this.selectElement(card, true);
            }
        });
    }

    isIntersecting(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    selectElement(element, isMulti = false) {
        if (!isMulti) {
            this.clearSelection();
        }

        if (this.selectedElements.includes(element)) {
            // Deselect if already selected
            const index = this.selectedElements.indexOf(element);
            this.selectedElements.splice(index, 1);
            element.classList.remove('layer-selected');
        } else {
            // Select
            this.selectedElements.push(element);
            element.classList.add('layer-selected');
        }

        // Update layer manager
        if (window.layerManager) {
            const layerId = element.dataset.layerId;
            if (layerId) {
                window.layerManager.selectLayer(layerId, { shiftKey: isMulti });
            }
        }
    }

    selectAll() {
        this.clearSelection();
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            this.selectedElements.push(card);
            card.classList.add('layer-selected');
        });
    }

    clearSelection() {
        this.selectedElements.forEach(el => {
            el.classList.remove('layer-selected');
        });
        this.selectedElements = [];
    }

    deleteSelected() {
        this.selectedElements.forEach(el => {
            const layerId = el.dataset.layerId;
            if (layerId && window.layerManager) {
                window.layerManager.removeLayer(layerId);
            }
            el.remove();
        });
        this.selectedElements = [];
    }

    duplicateSelected() {
        const duplicates = [];
        this.selectedElements.forEach(el => {
            const clone = el.cloneNode(true);
            clone.style.left = (parseInt(el.style.left) || 0) + 20 + 'px';
            clone.style.top = (parseInt(el.style.top) || 0) + 20 + 'px';
            el.parentNode.appendChild(clone);
            
            // Add to layer manager
            if (window.layerManager) {
                window.layerManager.addLayer(clone);
            }
            
            duplicates.push(clone);
        });
        
        this.clearSelection();
        duplicates.forEach(el => this.selectElement(el, true));
    }

    moveSelected(direction, distance) {
        this.selectedElements.forEach(el => {
            const currentLeft = parseInt(el.style.left) || 0;
            const currentTop = parseInt(el.style.top) || 0;

            switch(direction) {
                case 'ArrowUp':
                    el.style.top = (currentTop - distance) + 'px';
                    break;
                case 'ArrowDown':
                    el.style.top = (currentTop + distance) + 'px';
                    break;
                case 'ArrowLeft':
                    el.style.left = (currentLeft - distance) + 'px';
                    break;
                case 'ArrowRight':
                    el.style.left = (currentLeft + distance) + 'px';
                    break;
            }
        });
    }
}

// ========== 3. Alignment Tools ==========
class AlignmentTools {
    constructor() {
        this.gridSize = 20; // Grid snap size
        this.snapEnabled = true;
    }

    init() {
        this.createToolbar();
    }

    createToolbar() {
        const toolbarHTML = `
            <div class="alignment-toolbar" style="
                position: fixed;
                top: 64px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(26, 26, 26, 0.98);
                border: 1px solid #333;
                border-radius: 8px;
                padding: 8px 12px;
                display: flex;
                gap: 4px;
                z-index: 200;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <!-- Alignment Tools -->
                <div class="toolbar-group" style="display: flex; gap: 4px; padding-right: 8px; border-right: 1px solid #333;">
                    <button onclick="window.alignmentTools.align('left')" title="Align Left (Ctrl+Shift+L)" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-align-left"></i>
                    </button>
                    <button onclick="window.alignmentTools.align('center-h')" title="Center Horizontally" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-align-center"></i>
                    </button>
                    <button onclick="window.alignmentTools.align('right')" title="Align Right (Ctrl+Shift+R)" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-align-right"></i>
                    </button>
                    <button onclick="window.alignmentTools.align('top')" title="Align Top (Ctrl+Shift+T)" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="window.alignmentTools.align('center-v')" title="Center Vertically" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-arrows-alt-v"></i>
                    </button>
                    <button onclick="window.alignmentTools.align('bottom')" title="Align Bottom (Ctrl+Shift+B)" style="
                        width: 32px; height: 32px; border: none; background: rgba(139, 92, 246, 0.1);
                        color: #8b5cf6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>

                <!-- Distribution Tools -->
                <div class="toolbar-group" style="display: flex; gap: 4px; padding-right: 8px; border-right: 1px solid #333;">
                    <button onclick="window.alignmentTools.distribute('horizontal')" title="Distribute Horizontally" style="
                        width: 32px; height: 32px; border: none; background: rgba(59, 130, 246, 0.1);
                        color: #3B82F6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-arrows-alt-h"></i>
                    </button>
                    <button onclick="window.alignmentTools.distribute('vertical')" title="Distribute Vertically" style="
                        width: 32px; height: 32px; border: none; background: rgba(59, 130, 246, 0.1);
                        color: #3B82F6; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-arrows-alt-v"></i>
                    </button>
                </div>

                <!-- Grid Snap Toggle -->
                <div class="toolbar-group" style="display: flex; gap: 4px;">
                    <button onclick="window.alignmentTools.toggleSnap()" id="snapToggle" title="Grid Snap (G)" style="
                        width: 32px; height: 32px; border: none; background: ${this.snapEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'};
                        color: ${this.snapEnabled ? '#10b981' : '#666'}; border-radius: 6px; cursor: pointer; transition: all 0.2s;
                    ">
                        <i class="fas fa-th"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toolbarHTML);
        this.bindKeyboardShortcuts();
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.shiftKey) {
                    switch(e.key.toLowerCase()) {
                        case 'l':
                            e.preventDefault();
                            this.align('left');
                            break;
                        case 'r':
                            e.preventDefault();
                            this.align('right');
                            break;
                        case 't':
                            e.preventDefault();
                            this.align('top');
                            break;
                        case 'b':
                            e.preventDefault();
                            this.align('bottom');
                            break;
                    }
                }
            } else if (e.key.toLowerCase() === 'g') {
                e.preventDefault();
                this.toggleSnap();
            }
        });
    }

    align(type) {
        if (!window.selectionManager || window.selectionManager.selectedElements.length === 0) {
            this.showMessage('선택된 요소가 없습니다');
            return;
        }

        const elements = window.selectionManager.selectedElements;
        const bounds = this.getBounds(elements);

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            
            switch(type) {
                case 'left':
                    el.style.left = bounds.left + 'px';
                    break;
                case 'right':
                    el.style.left = (bounds.right - rect.width) + 'px';
                    break;
                case 'center-h':
                    el.style.left = (bounds.left + (bounds.width - rect.width) / 2) + 'px';
                    break;
                case 'top':
                    el.style.top = bounds.top + 'px';
                    break;
                case 'bottom':
                    el.style.top = (bounds.bottom - rect.height) + 'px';
                    break;
                case 'center-v':
                    el.style.top = (bounds.top + (bounds.height - rect.height) / 2) + 'px';
                    break;
            }
        });

        this.showMessage(`정렬 완료: ${type}`);
    }

    distribute(direction) {
        if (!window.selectionManager || window.selectionManager.selectedElements.length < 3) {
            this.showMessage('3개 이상의 요소를 선택해주세요');
            return;
        }

        const elements = window.selectionManager.selectedElements;
        const sorted = [...elements].sort((a, b) => {
            if (direction === 'horizontal') {
                return parseInt(a.style.left || 0) - parseInt(b.style.left || 0);
            } else {
                return parseInt(a.style.top || 0) - parseInt(b.style.top || 0);
            }
        });

        const first = sorted[0].getBoundingClientRect();
        const last = sorted[sorted.length - 1].getBoundingClientRect();
        
        if (direction === 'horizontal') {
            const totalSpace = last.left - (first.left + first.width);
            const gap = totalSpace / (sorted.length - 1);
            
            sorted.forEach((el, i) => {
                if (i > 0 && i < sorted.length - 1) {
                    const rect = el.getBoundingClientRect();
                    el.style.left = (first.left + first.width + gap * i) + 'px';
                }
            });
        } else {
            const totalSpace = last.top - (first.top + first.height);
            const gap = totalSpace / (sorted.length - 1);
            
            sorted.forEach((el, i) => {
                if (i > 0 && i < sorted.length - 1) {
                    const rect = el.getBoundingClientRect();
                    el.style.top = (first.top + first.height + gap * i) + 'px';
                }
            });
        }

        this.showMessage(`분산 완료: ${direction}`);
    }

    toggleSnap() {
        this.snapEnabled = !this.snapEnabled;
        const btn = document.getElementById('snapToggle');
        if (btn) {
            btn.style.background = this.snapEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)';
            btn.style.color = this.snapEnabled ? '#10b981' : '#666';
        }
        this.showMessage(`그리드 스냅: ${this.snapEnabled ? 'ON' : 'OFF'}`);
    }

    snapToGrid(value) {
        if (!this.snapEnabled) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    getBounds(elements) {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            left = Math.min(left, rect.left);
            top = Math.min(top, rect.top);
            right = Math.max(right, rect.right);
            bottom = Math.max(bottom, rect.bottom);
        });

        return {
            left, top, right, bottom,
            width: right - left,
            height: bottom - top
        };
    }

    showMessage(text) {
        const existingMsg = document.getElementById('alignmentMessage');
        if (existingMsg) existingMsg.remove();

        const message = document.createElement('div');
        message.id = 'alignmentMessage';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(139, 92, 246, 0.95);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }
}

// ========== Global Functions ==========
function toggleLayerPanel() {
    const panel = document.getElementById('layerPanel');
    if (panel) {
        const isHidden = panel.style.transform === 'translateX(-100%)';
        panel.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
    }
}

// ========== Initialize on DOMContentLoaded ==========
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for selected state
    const style = document.createElement('style');
    style.textContent = `
        .layer-selected {
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5) !important;
            border: 2px solid #8b5cf6 !important;
        }

        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
            10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .layer-panel-toggle:hover {
            background: rgba(139, 92, 246, 0.1) !important;
            color: #8b5cf6 !important;
        }

        #layerSearch:focus {
            border-color: #8b5cf6;
            background: rgba(139, 92, 246, 0.05);
        }

        .layer-item:hover {
            background: rgba(255,255,255,0.08) !important;
            border-color: #555 !important;
        }

        .alignment-toolbar button:hover {
            transform: scale(1.1);
            filter: brightness(1.2);
        }
    `;
    document.head.appendChild(style);

    // Initialize all systems
    window.layerManager = new LayerManager();
    window.selectionManager = new SelectionManager();
    window.alignmentTools = new AlignmentTools();

    window.layerManager.init();
    window.selectionManager.init();
    window.alignmentTools.init();

    // Auto-detect existing cards and add to layer manager
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.dataset.layerName = card.querySelector('.card-header')?.textContent || `Card ${index + 1}`;
            card.dataset.type = 'card';
            window.layerManager.addLayer(card);
        });
    }, 500);

    console.log('✅ Canvas Figma Features initialized');
});
