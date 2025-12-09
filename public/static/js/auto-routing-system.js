/**
 * MuseFlow Auto-Routing Connection System - Phase 3
 * 
 * Intelligent connection routing with A* pathfinding algorithm
 * Avoids obstacles and creates smooth, optimal paths
 * 
 * @version 1.0.0
 * @date 2025-12-08
 * @goal Perfect 100/100 World-Class Score
 */

class AutoRoutingSystem {
    constructor() {
        this.gridSize = 8; // 8px grid for routing
        this.obstacles = [];
        this.connections = new Map();
        this.init();
    }
    
    init() {
        console.log('🗺️ Auto-Routing System Initialized (A* Pathfinding)');
        this.updateObstacles();
    }
    
    // ========================================
    // A* PATHFINDING ALGORITHM
    // ========================================
    
    /**
     * A* pathfinding algorithm
     * Finds optimal path avoiding obstacles
     * 
     * @param {Object} start - {x, y} start position
     * @param {Object} end - {x, y} end position
     * @param {Array} obstacles - Array of obstacle rectangles
     * @returns {Array} Path coordinates [{x, y}, ...]
     */
    findPath(start, end, obstacles = []) {
        const grid = this.createGrid(start, end, obstacles);
        const startNode = this.getNode(grid, start);
        const endNode = this.getNode(grid, end);
        
        if (!startNode || !endNode) {
            return this.straightLine(start, end);
        }
        
        const openSet = [startNode];
        const closedSet = new Set();
        
        startNode.g = 0;
        startNode.h = this.heuristic(startNode, endNode);
        startNode.f = startNode.h;
        
        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            // Found destination
            if (current === endNode) {
                return this.reconstructPath(current);
            }
            
            closedSet.add(current);
            
            // Check neighbors
            const neighbors = this.getNeighbors(grid, current);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                const tentativeG = current.g + this.distance(current, neighbor);
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }
                
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
        
        // No path found, return straight line
        return this.straightLine(start, end);
    }
    
    createGrid(start, end, obstacles) {
        const minX = Math.min(start.x, end.x) - 100;
        const maxX = Math.max(start.x, end.x) + 100;
        const minY = Math.min(start.y, end.y) - 100;
        const maxY = Math.max(start.y, end.y) + 100;
        
        const cols = Math.ceil((maxX - minX) / this.gridSize);
        const rows = Math.ceil((maxY - minY) / this.gridSize);
        
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                const x = minX + j * this.gridSize;
                const y = minY + i * this.gridSize;
                const walkable = !this.isInsideObstacle({x, y}, obstacles);
                
                grid[i][j] = {
                    x, y, i, j,
                    walkable,
                    g: Infinity,
                    h: 0,
                    f: Infinity,
                    parent: null
                };
            }
        }
        
        return grid;
    }
    
    getNode(grid, pos) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const node = grid[i][j];
                if (Math.abs(node.x - pos.x) < this.gridSize && 
                    Math.abs(node.y - pos.y) < this.gridSize) {
                    return node;
                }
            }
        }
        return null;
    }
    
    getNeighbors(grid, node) {
        const neighbors = [];
        const directions = [
            {i: -1, j: 0},  // Up
            {i: 1, j: 0},   // Down
            {i: 0, j: -1},  // Left
            {i: 0, j: 1},   // Right
            {i: -1, j: -1}, // Up-Left
            {i: -1, j: 1},  // Up-Right
            {i: 1, j: -1},  // Down-Left
            {i: 1, j: 1}    // Down-Right
        ];
        
        for (const dir of directions) {
            const ni = node.i + dir.i;
            const nj = node.j + dir.j;
            
            if (ni >= 0 && ni < grid.length && 
                nj >= 0 && nj < grid[0].length) {
                const neighbor = grid[ni][nj];
                if (neighbor.walkable) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
    
    heuristic(a, b) {
        // Manhattan distance with diagonal movement
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
    
    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({x: current.x, y: current.y});
            current = current.parent;
        }
        
        return this.smoothPath(path);
    }
    
    smoothPath(path) {
        if (path.length <= 2) return path;
        
        const smoothed = [path[0]];
        let i = 0;
        
        while (i < path.length - 1) {
            let j = i + 2;
            
            // Try to skip intermediate points
            while (j < path.length) {
                if (!this.hasObstacleBetween(path[i], path[j])) {
                    j++;
                } else {
                    break;
                }
            }
            
            smoothed.push(path[j - 1]);
            i = j - 1;
        }
        
        if (smoothed[smoothed.length - 1] !== path[path.length - 1]) {
            smoothed.push(path[path.length - 1]);
        }
        
        return smoothed;
    }
    
    hasObstacleBetween(a, b) {
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            
            if (this.isInsideObstacle({x, y}, this.obstacles)) {
                return true;
            }
        }
        return false;
    }
    
    isInsideObstacle(point, obstacles) {
        for (const obs of obstacles) {
            if (point.x >= obs.left && point.x <= obs.right &&
                point.y >= obs.top && point.y <= obs.bottom) {
                return true;
            }
        }
        return false;
    }
    
    straightLine(start, end) {
        return [start, end];
    }
    
    // ========================================
    // OBSTACLE DETECTION
    // ========================================
    
    updateObstacles() {
        this.obstacles = [];
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            this.obstacles.push({
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                element: card
            });
        });
        
        console.log(`🚧 Updated ${this.obstacles.length} obstacles`);
    }
    
    // ========================================
    // SVG PATH GENERATION
    // ========================================
    
    /**
     * Generate SVG path with Bezier curves
     * 
     * @param {Array} waypoints - Path coordinates from A*
     * @param {String} style - 'curved' | 'orthogonal' | 'straight'
     * @returns {String} SVG path d attribute
     */
    generatePath(waypoints, style = 'curved') {
        if (waypoints.length < 2) return '';
        
        if (style === 'straight') {
            return this.straightPath(waypoints);
        } else if (style === 'orthogonal') {
            return this.orthogonalPath(waypoints);
        } else {
            return this.curvedPath(waypoints);
        }
    }
    
    straightPath(waypoints) {
        const start = waypoints[0];
        let path = `M ${start.x} ${start.y}`;
        
        for (let i = 1; i < waypoints.length; i++) {
            const point = waypoints[i];
            path += ` L ${point.x} ${point.y}`;
        }
        
        return path;
    }
    
    orthogonalPath(waypoints) {
        if (waypoints.length < 2) return '';
        
        const start = waypoints[0];
        let path = `M ${start.x} ${start.y}`;
        
        for (let i = 1; i < waypoints.length; i++) {
            const prev = waypoints[i - 1];
            const curr = waypoints[i];
            
            // Create 90-degree turns
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal first
                path += ` H ${curr.x} V ${curr.y}`;
            } else {
                // Vertical first
                path += ` V ${curr.y} H ${curr.x}`;
            }
        }
        
        return path;
    }
    
    curvedPath(waypoints) {
        if (waypoints.length < 2) return '';
        
        const start = waypoints[0];
        let path = `M ${start.x} ${start.y}`;
        
        if (waypoints.length === 2) {
            // Simple Bezier curve for 2 points
            const end = waypoints[1];
            const dx = Math.abs(end.x - start.x);
            const controlOffset = Math.min(dx * 0.5, 100);
            
            const cp1x = start.x + controlOffset;
            const cp1y = start.y;
            const cp2x = end.x - controlOffset;
            const cp2y = end.y;
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
        } else {
            // Smooth curve through multiple points
            for (let i = 1; i < waypoints.length; i++) {
                const prev = waypoints[i - 1];
                const curr = waypoints[i];
                const next = waypoints[i + 1];
                
                if (i === 1) {
                    // First curve
                    const dx = curr.x - prev.x;
                    const dy = curr.y - prev.y;
                    const controlOffset = Math.hypot(dx, dy) * 0.3;
                    
                    const angle = Math.atan2(dy, dx);
                    const cp1x = prev.x + Math.cos(angle) * controlOffset;
                    const cp1y = prev.y + Math.sin(angle) * controlOffset;
                    const cp2x = curr.x - Math.cos(angle) * controlOffset;
                    const cp2y = curr.y - Math.sin(angle) * controlOffset;
                    
                    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
                } else if (next) {
                    // Smooth curve through middle point
                    const dx1 = curr.x - prev.x;
                    const dy1 = curr.y - prev.y;
                    const dx2 = next.x - curr.x;
                    const dy2 = next.y - curr.y;
                    
                    const angle1 = Math.atan2(dy1, dx1);
                    const angle2 = Math.atan2(dy2, dx2);
                    const avgAngle = (angle1 + angle2) / 2;
                    
                    const controlOffset = Math.min(
                        Math.hypot(dx1, dy1),
                        Math.hypot(dx2, dy2)
                    ) * 0.3;
                    
                    const cp1x = curr.x - Math.cos(avgAngle) * controlOffset;
                    const cp1y = curr.y - Math.sin(avgAngle) * controlOffset;
                    const cp2x = curr.x + Math.cos(avgAngle) * controlOffset;
                    const cp2y = curr.y + Math.sin(avgAngle) * controlOffset;
                    
                    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                    i++; // Skip next point as we already processed it
                }
            }
        }
        
        return path;
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    
    /**
     * Create auto-routed connection between two elements
     * 
     * @param {HTMLElement} fromElement - Source element
     * @param {HTMLElement} toElement - Target element
     * @param {Object} options - {style: 'curved'|'orthogonal'|'straight', color: '#color'}
     * @returns {SVGElement} Connection path element
     */
    createConnection(fromElement, toElement, options = {}) {
        const style = options.style || 'curved';
        const color = options.color || '#0D99FF';
        
        // Get connection points
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        const start = {
            x: fromRect.right,
            y: fromRect.top + fromRect.height / 2
        };
        
        const end = {
            x: toRect.left,
            y: toRect.top + toRect.height / 2
        };
        
        // Update obstacles
        this.updateObstacles();
        
        // Find optimal path
        const waypoints = this.findPath(start, end, this.obstacles);
        
        // Generate SVG path
        const pathData = this.generatePath(waypoints, style);
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        // Add arrow marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrow-${Date.now()}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', color);
        
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        svg.appendChild(defs);
        
        path.setAttribute('marker-end', `url(#${marker.id})`);
        svg.appendChild(path);
        
        // Store connection
        const connectionId = `${fromElement.id}-${toElement.id}`;
        this.connections.set(connectionId, {
            svg,
            path,
            from: fromElement,
            to: toElement,
            waypoints,
            style
        });
        
        console.log(`🔗 Created auto-routed connection: ${connectionId}`);
        
        return svg;
    }
    
    /**
     * Update all connections (e.g., after card move)
     */
    updateAllConnections() {
        this.updateObstacles();
        
        this.connections.forEach((conn, id) => {
            const fromRect = conn.from.getBoundingClientRect();
            const toRect = conn.to.getBoundingClientRect();
            
            const start = {
                x: fromRect.right,
                y: fromRect.top + fromRect.height / 2
            };
            
            const end = {
                x: toRect.left,
                y: toRect.top + toRect.height / 2
            };
            
            const waypoints = this.findPath(start, end, this.obstacles);
            const pathData = this.generatePath(waypoints, conn.style);
            
            conn.path.setAttribute('d', pathData);
            conn.waypoints = waypoints;
        });
    }
}

// Global initialization
window.AutoRoutingSystem = AutoRoutingSystem;
window.autoRouting = new AutoRoutingSystem();

console.log('🌟 Auto-Routing System Loaded - A* Pathfinding with Obstacle Avoidance');
