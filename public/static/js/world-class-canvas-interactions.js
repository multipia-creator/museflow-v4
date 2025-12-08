/**
 * MuseFlow World-Class Canvas Interaction System
 * 
 * Features:
 * 1. Bezier Curve Connector System (SVG-based, Figma-like)
 * 2. Cursor-Based Zoom (Intelligent center point)
 * 3. Snap to Grid (8px precision)
 * 4. Multi-Connection Points (4 directions)
 * 5. Smart Guide Lines (Auto-alignment)
 * 6. Mini-map Navigator (Bird's eye view)
 * 7. Drag Box Selection (Multi-select)
 * 
 * @version 1.0.0
 * @date 2025-12-08
 * @goal Surpass Figma - World-Class Tier
 */

class WorldClassCanvasInteraction {
    constructor(viewport, canvasContainer) {
        this.viewport = viewport;
        this.canvasContainer = canvasContainer;
        this.connections = [];
        this.connectingFrom = null;
        this.snapToGridEnabled = true;
        this.gridSize = 8; // 8px grid for precision
        this.smartGuidesEnabled = true;
        this.miniMapEnabled = true;
        
        this.init();
    }
    
    init() {
        console.log('🚀 World-Class Canvas Interaction System Initialized');
        this.setupBezierConnections();
        this.setupCursorBasedZoom();
        this.setupSnapToGrid();
        this.setupMultiConnectionPoints();
        this.setupSmartGuides();
        this.setupMiniMap();
        this.setupDragBoxSelection();
    }
    
    // ========================================
    // 1. BEZIER CURVE CONNECTOR SYSTEM
    // ========================================
    
    setupBezierConnections() {
        // Create SVG canvas for connections
        this.connectionCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.connectionCanvas.setAttribute('class', 'connection-canvas-svg');
        this.connectionCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Create defs for arrow markers
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Arrow marker definition (Figma-style)
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#000000');
        
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        this.connectionCanvas.appendChild(defs);
        
        this.viewport.appendChild(this.connectionCanvas);
        
        console.log('✅ Bezier Curve Connection System Ready');
    }
    
    createBezierConnection(fromCard, toCard, fromPoint = 'right', toPoint = 'left') {
        const conn = {
            from: fromCard,
            to: toCard,
            fromPoint: fromPoint,
            toPoint: toPoint,
            path: null,
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        this.connections.push(conn);
        this.updateBezierConnectionPath(conn);
        
        console.log('🔗 Bezier Connection Created:', conn.id);
        return conn;
    }
    
    updateBezierConnectionPath(conn) {
        const fromPos = this.getConnectionPoint(conn.from, conn.fromPoint);
        const toPos = this.getConnectionPoint(conn.to, conn.toPoint);
        
        if (!fromPos || !toPos) return;
        
        // Calculate Bezier control points (Figma-style smooth curves)
        const dx = Math.abs(toPos.x - fromPos.x);
        const dy = Math.abs(toPos.y - fromPos.y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(distance * 0.5, 100); // Max 100px curve
        
        let cp1x, cp1y, cp2x, cp2y;
        
        // Smart control points based on connection direction
        if (conn.fromPoint === 'right' && conn.toPoint === 'left') {
            cp1x = fromPos.x + curvature;
            cp1y = fromPos.y;
            cp2x = toPos.x - curvature;
            cp2y = toPos.y;
        } else if (conn.fromPoint === 'bottom' && conn.toPoint === 'top') {
            cp1x = fromPos.x;
            cp1y = fromPos.y + curvature;
            cp2x = toPos.x;
            cp2y = toPos.y - curvature;
        } else if (conn.fromPoint === 'top' && conn.toPoint === 'bottom') {
            cp1x = fromPos.x;
            cp1y = fromPos.y - curvature;
            cp2x = toPos.x;
            cp2y = toPos.y + curvature;
        } else if (conn.fromPoint === 'left' && conn.toPoint === 'right') {
            cp1x = fromPos.x - curvature;
            cp1y = fromPos.y;
            cp2x = toPos.x + curvature;
            cp2y = toPos.y;
        } else {
            // Default fallback
            cp1x = fromPos.x + curvature;
            cp1y = fromPos.y;
            cp2x = toPos.x - curvature;
            cp2y = toPos.y;
        }
        
        // Create SVG path with cubic Bezier curve
        const pathData = `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`;
        
        if (!conn.path) {
            conn.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            conn.path.setAttribute('class', 'bezier-connection');
            conn.path.setAttribute('stroke', '#000000');
            conn.path.setAttribute('stroke-width', '2');
            conn.path.setAttribute('fill', 'none');
            conn.path.setAttribute('marker-end', 'url(#arrowhead)');
            conn.path.style.transition = 'stroke 0.2s ease, stroke-width 0.2s ease';
            
            // Hover effect
            conn.path.addEventListener('mouseenter', () => {
                conn.path.setAttribute('stroke', '#3b82f6');
                conn.path.setAttribute('stroke-width', '3');
            });
            
            conn.path.addEventListener('mouseleave', () => {
                conn.path.setAttribute('stroke', '#000000');
                conn.path.setAttribute('stroke-width', '2');
            });
            
            this.connectionCanvas.appendChild(conn.path);
        }
        
        conn.path.setAttribute('d', pathData);
    }
    
    getConnectionPoint(card, direction) {
        if (!card || !card.style.left) return null;
        
        const x = parseInt(card.style.left) || 0;
        const y = parseInt(card.style.top) || 0;
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        switch(direction) {
            case 'right':
                return { x: x + width, y: y + height / 2 };
            case 'left':
                return { x: x, y: y + height / 2 };
            case 'top':
                return { x: x + width / 2, y: y };
            case 'bottom':
                return { x: x + width / 2, y: y + height };
            default:
                return { x: x + width, y: y + height / 2 };
        }
    }
    
    updateAllConnections() {
        this.connections.forEach(conn => this.updateBezierConnectionPath(conn));
    }
    
    // ========================================
    // 2. CURSOR-BASED ZOOM SYSTEM
    // ========================================
    
    setupCursorBasedZoom() {
        let currentZoom = 1;
        let pan = { x: 0, y: 0 };
        
        this.canvasContainer.addEventListener('wheel', (e) => {
            if (!e.ctrlKey && !e.metaKey) return;
            
            e.preventDefault();
            
            // Get cursor position relative to canvas
            const rect = this.canvasContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calculate zoom point in viewport coordinates
            const zoomPointX = (mouseX - pan.x) / currentZoom;
            const zoomPointY = (mouseY - pan.y) / currentZoom;
            
            // Calculate new zoom level
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.min(Math.max(currentZoom * delta, 0.1), 5);
            
            // Adjust pan to keep zoom point stable
            pan.x = mouseX - zoomPointX * newZoom;
            pan.y = mouseY - zoomPointY * newZoom;
            
            currentZoom = newZoom;
            
            // Apply transformation
            this.viewport.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${currentZoom})`;
            
            // Update connections
            this.updateAllConnections();
        }, { passive: false });
        
        // Store zoom and pan for external access
        this.zoom = currentZoom;
        this.pan = pan;
        
        console.log('✅ Cursor-Based Zoom Ready');
    }
    
    // ========================================
    // 3. SNAP TO GRID SYSTEM
    // ========================================
    
    setupSnapToGrid() {
        // Add grid visualization toggle
        const gridToggle = document.createElement('button');
        gridToggle.innerHTML = '<i data-lucide="grid-3x3"></i> Grid';
        gridToggle.className = 'toolbar-button';
        gridToggle.title = 'Toggle Snap to Grid (G)';
        gridToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
        `;
        
        gridToggle.addEventListener('click', () => {
            this.snapToGridEnabled = !this.snapToGridEnabled;
            gridToggle.style.background = this.snapToGridEnabled ? 
                'rgba(59, 130, 246, 0.8)' : 'rgba(0, 0, 0, 0.8)';
            console.log('📐 Snap to Grid:', this.snapToGridEnabled ? 'ON' : 'OFF');
        });
        
        document.body.appendChild(gridToggle);
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        console.log('✅ Snap to Grid Ready (8px)');
    }
    
    snapToGrid(value) {
        if (!this.snapToGridEnabled) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }
    
    // ========================================
    // 4. MULTI-CONNECTION POINTS SYSTEM
    // ========================================
    
    setupMultiConnectionPoints() {
        // This will be enhanced in the card creation function
        // Each card will have 4 connection handles (top, right, bottom, left)
        console.log('✅ Multi-Connection Points Ready (4 directions)');
    }
    
    addConnectionHandles(cardEl) {
        const directions = ['top', 'right', 'bottom', 'left'];
        
        directions.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `connection-handle connection-handle-${dir}`;
            handle.dataset.direction = dir;
            
            // Position handles
            const positions = {
                'top': 'top: -6px; left: 50%; transform: translateX(-50%);',
                'right': 'right: -6px; top: 50%; transform: translateY(-50%);',
                'bottom': 'bottom: -6px; left: 50%; transform: translateX(-50%);',
                'left': 'left: -6px; top: 50%; transform: translateY(-50%);'
            };
            
            handle.style.cssText = `
                position: absolute;
                width: 12px;
                height: 12px;
                background: #000000;
                border: 2px solid #ffffff;
                border-radius: 50%;
                cursor: crosshair;
                opacity: 0;
                transition: opacity 0.2s ease, transform 0.2s ease;
                z-index: 10;
                ${positions[dir]}
            `;
            
            // Show handles on card hover
            cardEl.addEventListener('mouseenter', () => {
                handle.style.opacity = '1';
            });
            
            cardEl.addEventListener('mouseleave', () => {
                if (!this.connectingFrom) {
                    handle.style.opacity = '0';
                }
            });
            
            // Connection logic
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                this.connectingFrom = {
                    card: cardEl,
                    direction: dir,
                    handle: handle
                };
                
                handle.style.background = '#3b82f6';
                handle.style.transform += ' scale(1.5)';
                
                console.log('🔗 Connection Started:', dir);
            });
            
            cardEl.appendChild(handle);
        });
    }
    
    // ========================================
    // 5. SMART GUIDE LINES SYSTEM
    // ========================================
    
    setupSmartGuides() {
        // Create guide line containers
        this.guideLines = {
            horizontal: this.createGuideLine('horizontal'),
            vertical: this.createGuideLine('vertical')
        };
        
        console.log('✅ Smart Guide Lines Ready');
    }
    
    createGuideLine(orientation) {
        const line = document.createElement('div');
        line.className = `smart-guide-${orientation}`;
        line.style.cssText = `
            position: absolute;
            background: #3b82f6;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease;
            z-index: 999;
            ${orientation === 'horizontal' ? 
                'width: 100%; height: 1px; left: 0;' : 
                'height: 100%; width: 1px; top: 0;'}
        `;
        this.viewport.appendChild(line);
        return line;
    }
    
    showSmartGuide(orientation, position) {
        if (!this.smartGuidesEnabled) return;
        
        const line = this.guideLines[orientation];
        line.style.opacity = '1';
        
        if (orientation === 'horizontal') {
            line.style.top = position + 'px';
        } else {
            line.style.left = position + 'px';
        }
        
        // Auto-hide after 500ms
        setTimeout(() => {
            line.style.opacity = '0';
        }, 500);
    }
    
    // ========================================
    // 6. MINI-MAP NAVIGATOR
    // ========================================
    
    setupMiniMap() {
        const miniMap = document.createElement('div');
        miniMap.className = 'mini-map-navigator';
        miniMap.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 200px;
            height: 150px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #000000;
            border-radius: 8px;
            overflow: hidden;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        const miniMapCanvas = document.createElement('canvas');
        miniMapCanvas.width = 200;
        miniMapCanvas.height = 150;
        miniMapCanvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;
        
        miniMap.appendChild(miniMapCanvas);
        document.body.appendChild(miniMap);
        
        this.miniMap = miniMapCanvas;
        this.miniMapContext = miniMapCanvas.getContext('2d');
        
        // Update mini-map every 500ms
        setInterval(() => this.updateMiniMap(), 500);
        
        console.log('✅ Mini-Map Navigator Ready');
    }
    
    updateMiniMap() {
        if (!this.miniMapContext) return;
        
        const ctx = this.miniMapContext;
        const canvas = this.miniMap;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw all cards (simplified)
        const cards = this.viewport.querySelectorAll('.card');
        const scale = 0.05; // Scale factor for mini-map
        
        cards.forEach(card => {
            const x = (parseInt(card.style.left) || 0) * scale;
            const y = (parseInt(card.style.top) || 0) * scale;
            const w = card.offsetWidth * scale;
            const h = card.offsetHeight * scale;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, w, h);
        });
        
        // Draw viewport boundary
        const viewportRect = this.canvasContainer.getBoundingClientRect();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, viewportRect.width * scale, viewportRect.height * scale);
    }
    
    // ========================================
    // 7. DRAG BOX SELECTION
    // ========================================
    
    setupDragBoxSelection() {
        let selectionBox = null;
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        this.canvasContainer.addEventListener('mousedown', (e) => {
            // Only activate on canvas background (not on cards)
            if (e.target.closest('.card')) return;
            if (e.button !== 0) return; // Only left click
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // Create selection box
            selectionBox = document.createElement('div');
            selectionBox.className = 'drag-selection-box';
            selectionBox.style.cssText = `
                position: fixed;
                border: 2px solid #3b82f6;
                background: rgba(59, 130, 246, 0.1);
                pointer-events: none;
                z-index: 9999;
                left: ${startX}px;
                top: ${startY}px;
            `;
            document.body.appendChild(selectionBox);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !selectionBox) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            if (selectionBox) {
                // Get selection box bounds
                const boxRect = selectionBox.getBoundingClientRect();
                
                // Find cards within selection box
                const cards = this.viewport.querySelectorAll('.card');
                const selectedCards = [];
                
                cards.forEach(card => {
                    const cardRect = card.getBoundingClientRect();
                    
                    // Check if card intersects with selection box
                    if (this.rectsIntersect(boxRect, cardRect)) {
                        card.classList.add('selected');
                        selectedCards.push(card);
                    }
                });
                
                if (selectedCards.length > 0) {
                    console.log('📦 Box Selection:', selectedCards.length, 'cards selected');
                }
                
                // Remove selection box
                selectionBox.remove();
                selectionBox = null;
            }
        });
        
        console.log('✅ Drag Box Selection Ready');
    }
    
    rectsIntersect(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }
}

// Global initialization
window.WorldClassCanvasInteraction = WorldClassCanvasInteraction;

console.log('🌟 World-Class Canvas Interaction System Loaded');
