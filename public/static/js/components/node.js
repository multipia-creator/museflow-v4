/**
 * Node Component System
 * Base class and 88+ specialized nodes for 6 modules
 */

// Module definitions with colors
const MODULES = {
  exhibition: { name: 'Exhibition', icon: '🎨', color: '#8b5cf6' },
  education: { name: 'Education', icon: '📚', color: '#06b6d4' },
  archive: { name: 'Archive', icon: '📦', color: '#10b981' },
  publication: { name: 'Publication', icon: '📰', color: '#f59e0b' },
  research: { name: 'Research', icon: '🔬', color: '#ec4899' },
  administration: { name: 'Administration', icon: '⚙️', color: '#6366f1' }
};

/**
 * Base Node Class
 */
class Node {
  constructor(type, module, x = 0, y = 0) {
    this.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.module = module;
    this.x = x;
    this.y = y;
    this.width = 280;
    this.height = 180;
    
    // Visual state
    this.selected = false;
    this.hovered = false;
    this.dragging = false;
    
    // Node state
    this.status = 'pending'; // pending | in-progress | completed | error
    this.progress = 0; // 0-100
    
    // Connection points
    this.inputs = [];
    this.outputs = [];
    this.connections = { inputs: [], outputs: [] };
    
    // Properties
    this.properties = {};
    
    // Timestamps
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
  
  /**
   * Get module info
   */
  getModuleInfo() {
    return MODULES[this.module];
  }
  
  /**
   * Get color
   */
  getColor() {
    return MODULES[this.module]?.color || '#6b7280';
  }
  
  /**
   * Check if point is inside node
   */
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
  
  /**
   * Get connection point position
   */
  getConnectionPoint(type, index) {
    const pointSize = 12;
    const spacing = 30;
    const startY = 60;
    
    if (type === 'input') {
      return {
        x: this.x,
        y: this.y + startY + index * spacing,
        size: pointSize
      };
    } else {
      return {
        x: this.x + this.width,
        y: this.y + startY + index * spacing,
        size: pointSize
      };
    }
  }
  
  /**
   * Render node
   */
  render(ctx, zoom) {
    const moduleInfo = this.getModuleInfo();
    
    // Shadow
    if (this.selected) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10 / zoom;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4 / zoom;
    }
    
    // Main body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = this.selected ? this.getColor() : '#e5e7eb';
    ctx.lineWidth = (this.selected ? 3 : 2) / zoom;
    
    this.roundRect(ctx, this.x, this.y, this.width, this.height, 12);
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Header background
    ctx.fillStyle = this.getColor();
    this.roundRectPath(ctx, this.x, this.y, this.width, 50, 12, true, false);
    ctx.fill();
    
    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${16 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const icon = moduleInfo?.icon || '📄';
    const iconSize = 24 / zoom;
    ctx.font = `${iconSize}px Inter, sans-serif`;
    ctx.fillText(icon, this.x + 16, this.y + 25);
    
    ctx.font = `bold ${14 / zoom}px Inter, sans-serif`;
    ctx.fillText(this.type, this.x + 50, this.y + 25);
    
    // Content area
    ctx.fillStyle = '#6b7280';
    ctx.font = `${12 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    
    let contentY = this.y + 70;
    const lineHeight = 18 / zoom;
    
    // Render properties
    const props = this.getDisplayProperties();
    props.forEach(prop => {
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${prop.label}:`, this.x + 16, contentY);
      ctx.fillStyle = '#374151';
      ctx.fillText(prop.value, this.x + 100, contentY);
      contentY += lineHeight;
    });
    
    // Status badge
    this.renderStatusBadge(ctx, zoom);
    
    // Connection points
    this.renderConnectionPoints(ctx, zoom);
    
    // Menu button
    if (this.hovered || this.selected) {
      this.renderMenuButton(ctx, zoom);
    }
  }
  
  /**
   * Render status badge
   */
  renderStatusBadge(ctx, zoom) {
    const statusConfig = {
      pending: { text: 'Pending', color: '#9ca3af', bg: '#f3f4f6' },
      'in-progress': { text: 'In Progress', color: '#3b82f6', bg: '#dbeafe' },
      completed: { text: 'Complete', color: '#10b981', bg: '#d1fae5' },
      error: { text: 'Error', color: '#ef4444', bg: '#fee2e2' }
    };
    
    const status = statusConfig[this.status] || statusConfig.pending;
    
    const badgeX = this.x + 16;
    const badgeY = this.y + this.height - 35;
    const badgeWidth = 100;
    const badgeHeight = 24;
    
    // Badge background
    ctx.fillStyle = status.bg;
    this.roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 6);
    ctx.fill();
    
    // Badge text
    ctx.fillStyle = status.color;
    ctx.font = `bold ${11 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(status.text, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }
  
  /**
   * Render connection points
   */
  renderConnectionPoints(ctx, zoom) {
    const pointSize = 12;
    
    // Input points (left side)
    this.inputs.forEach((input, index) => {
      const point = this.getConnectionPoint('input', index);
      const isConnected = this.connections.inputs.some(c => c.inputIndex === index);
      
      ctx.fillStyle = isConnected ? this.getColor() : '#ffffff';
      ctx.strokeStyle = this.getColor();
      ctx.lineWidth = 2 / zoom;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    
    // Output points (right side)
    this.outputs.forEach((output, index) => {
      const point = this.getConnectionPoint('output', index);
      const isConnected = this.connections.outputs.some(c => c.outputIndex === index);
      
      ctx.fillStyle = isConnected ? this.getColor() : '#ffffff';
      ctx.strokeStyle = this.getColor();
      ctx.lineWidth = 2 / zoom;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
  
  /**
   * Render menu button
   */
  renderMenuButton(ctx, zoom) {
    const btnX = this.x + this.width - 40;
    const btnY = this.y + 8;
    const btnSize = 32;
    
    // Button background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.roundRect(ctx, btnX, btnY, btnSize, btnSize, 8);
    ctx.fill();
    
    // Three dots
    ctx.fillStyle = '#6b7280';
    const dotSize = 3;
    const dotSpacing = 6;
    const dotsX = btnX + btnSize / 2;
    const dotsY = btnY + btnSize / 2;
    
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(dotsX, dotsY + i * dotSpacing, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Get display properties (override in subclasses)
   */
  getDisplayProperties() {
    return [
      { label: 'Status', value: this.status },
      { label: 'Progress', value: `${this.progress}%` }
    ];
  }
  
  /**
   * Helper: Draw rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    this.roundRectPath(ctx, x, y, width, height, radius);
  }
  
  /**
   * Helper: Rounded rectangle path
   */
  roundRectPath(ctx, x, y, width, height, radius, topOnly = false, bottomOnly = false) {
    ctx.beginPath();
    
    if (topOnly) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else if (bottomOnly) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    ctx.closePath();
  }
  
  /**
   * Update node
   */
  update(properties) {
    Object.assign(this.properties, properties);
    this.updatedAt = new Date().toISOString();
  }
  
  /**
   * Serialize node
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      module: this.module,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      status: this.status,
      progress: this.progress,
      properties: this.properties,
      connections: this.connections,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Node Type Definitions
 * 88+ specialized nodes for 6 modules
 */

const NODE_TYPES = {
  // EXHIBITION MODULE (15 nodes)
  exhibition: [
    { type: 'Artwork', inputs: ['concept'], outputs: ['display', 'label'], icon: '🖼️' },
    { type: 'Timeline', inputs: ['dates'], outputs: ['schedule', 'milestones'], icon: '📅' },
    { type: 'Space Layout', inputs: ['dimensions'], outputs: ['floorplan', 'zones'], icon: '📐' },
    { type: 'Lighting Plan', inputs: ['space'], outputs: ['fixtures', 'lux'], icon: '💡' },
    { type: 'Signage', inputs: ['layout'], outputs: ['wayfinding', 'directions'], icon: '🪧' },
    { type: 'Label', inputs: ['artwork'], outputs: ['text', 'translation'], icon: '🏷️' },
    { type: 'Wall Color', inputs: ['space'], outputs: ['palette', 'samples'], icon: '🎨' },
    { type: 'Display Case', inputs: ['artifacts'], outputs: ['specs', 'security'], icon: '📦' },
    { type: 'Audio Guide', inputs: ['content'], outputs: ['script', 'audio'], icon: '🎧' },
    { type: 'Interactive Screen', inputs: ['content'], outputs: ['interface', 'media'], icon: '📱' },
    { type: 'Sensor Trigger', inputs: ['location'], outputs: ['event', 'data'], icon: '📡' },
    { type: 'AR Marker', inputs: ['content'], outputs: ['trigger', '3d'], icon: '🔮' },
    { type: 'Visitor Flow', inputs: ['layout'], outputs: ['paths', 'analysis'], icon: '🚶' },
    { type: 'Heat Map', inputs: ['data'], outputs: ['visualization', 'insights'], icon: '🗺️' },
    { type: 'Exhibition Report', inputs: ['metrics'], outputs: ['document', 'charts'], icon: '📊' }
  ],
  
  // EDUCATION MODULE (14 nodes)
  education: [
    { type: 'Workshop', inputs: ['topic'], outputs: ['plan', 'materials'], icon: '🎓' },
    { type: 'Lesson Plan', inputs: ['objectives'], outputs: ['curriculum', 'activities'], icon: '📝' },
    { type: 'Quiz', inputs: ['questions'], outputs: ['assessment', 'results'], icon: '❓' },
    { type: 'Certificate', inputs: ['completion'], outputs: ['document', 'badge'], icon: '🏆' },
    { type: 'Student Group', inputs: ['roster'], outputs: ['assignments', 'progress'], icon: '👥' },
    { type: 'Educator', inputs: ['schedule'], outputs: ['sessions', 'feedback'], icon: '👨‍🏫' },
    { type: 'Learning Material', inputs: ['content'], outputs: ['resources', 'media'], icon: '📚' },
    { type: 'Activity Sheet', inputs: ['lesson'], outputs: ['worksheet', 'instructions'], icon: '📄' },
    { type: 'Video Tutorial', inputs: ['script'], outputs: ['video', 'subtitles'], icon: '🎬' },
    { type: 'Virtual Tour', inputs: ['route'], outputs: ['experience', 'narration'], icon: '🌐' },
    { type: 'Feedback Form', inputs: ['questions'], outputs: ['survey', 'responses'], icon: '📋' },
    { type: 'Assessment', inputs: ['criteria'], outputs: ['evaluation', 'scores'], icon: '✅' },
    { type: 'Schedule', inputs: ['programs'], outputs: ['calendar', 'booking'], icon: '🗓️' },
    { type: 'Resource Library', inputs: ['files'], outputs: ['catalog', 'access'], icon: '📚' }
  ],
  
  // ARCHIVE MODULE (15 nodes)
  archive: [
    { type: 'Digital Asset', inputs: ['file'], outputs: ['metadata', 'storage'], icon: '💾' },
    { type: 'Metadata', inputs: ['schema'], outputs: ['fields', 'standards'], icon: '🏷️' },
    { type: 'Catalog Entry', inputs: ['item'], outputs: ['record', 'index'], icon: '📇' },
    { type: 'Preservation', inputs: ['condition'], outputs: ['treatment', 'monitoring'], icon: '🛡️' },
    { type: 'Condition Report', inputs: ['inspection'], outputs: ['assessment', 'photos'], icon: '📋' },
    { type: 'Provenance', inputs: ['history'], outputs: ['timeline', 'documentation'], icon: '📜' },
    { type: 'Rights Management', inputs: ['ownership'], outputs: ['permissions', 'licensing'], icon: '©️' },
    { type: '3D Scan', inputs: ['object'], outputs: ['model', 'measurements'], icon: '🎯' },
    { type: 'Photograph', inputs: ['subject'], outputs: ['images', 'catalog'], icon: '📷' },
    { type: 'Document', inputs: ['source'], outputs: ['digitized', 'ocr'], icon: '📄' },
    { type: 'Database Schema', inputs: ['requirements'], outputs: ['structure', 'relations'], icon: '🗄️' },
    { type: 'Search Interface', inputs: ['database'], outputs: ['ui', 'queries'], icon: '🔍' },
    { type: 'Export Format', inputs: ['data'], outputs: ['file', 'standard'], icon: '📤' },
    { type: 'Backup System', inputs: ['schedule'], outputs: ['copies', 'verification'], icon: '💿' },
    { type: 'Access Control', inputs: ['users'], outputs: ['permissions', 'audit'], icon: '🔐' }
  ],
  
  // PUBLICATION MODULE (14 nodes)
  publication: [
    { type: 'Article', inputs: ['research'], outputs: ['draft', 'images'], icon: '📰' },
    { type: 'Newsletter', inputs: ['content'], outputs: ['layout', 'distribution'], icon: '📧' },
    { type: 'Press Release', inputs: ['announcement'], outputs: ['document', 'media'], icon: '📢' },
    { type: 'Exhibition Catalog', inputs: ['artworks'], outputs: ['publication', 'essays'], icon: '📖' },
    { type: 'Annual Report', inputs: ['data'], outputs: ['report', 'infographics'], icon: '📊' },
    { type: 'Social Media', inputs: ['message'], outputs: ['posts', 'schedule'], icon: '📱' },
    { type: 'Blog Post', inputs: ['topic'], outputs: ['article', 'seo'], icon: '✍️' },
    { type: 'Brochure', inputs: ['information'], outputs: ['design', 'print'], icon: '📑' },
    { type: 'Poster', inputs: ['concept'], outputs: ['artwork', 'formats'], icon: '🎨' },
    { type: 'Video Script', inputs: ['story'], outputs: ['screenplay', 'storyboard'], icon: '🎬' },
    { type: 'Podcast', inputs: ['episode'], outputs: ['audio', 'show notes'], icon: '🎙️' },
    { type: 'Email Campaign', inputs: ['list'], outputs: ['template', 'metrics'], icon: '✉️' },
    { type: 'Print Layout', inputs: ['content'], outputs: ['design', 'proofs'], icon: '🖨️' },
    { type: 'Digital Magazine', inputs: ['articles'], outputs: ['issue', 'interactive'], icon: '📱' }
  ],
  
  // RESEARCH MODULE (15 nodes)
  research: [
    { type: 'Survey', inputs: ['questions'], outputs: ['responses', 'data'], icon: '📋' },
    { type: 'Data Collection', inputs: ['method'], outputs: ['dataset', 'raw'], icon: '📊' },
    { type: 'Analysis', inputs: ['data'], outputs: ['results', 'insights'], icon: '🔬' },
    { type: 'Research Report', inputs: ['findings'], outputs: ['document', 'presentation'], icon: '📄' },
    { type: 'Citation', inputs: ['sources'], outputs: ['bibliography', 'references'], icon: '📚' },
    { type: 'Interview', inputs: ['participants'], outputs: ['transcripts', 'recordings'], icon: '🎤' },
    { type: 'Observation', inputs: ['protocol'], outputs: ['notes', 'data'], icon: '👁️' },
    { type: 'Experiment', inputs: ['hypothesis'], outputs: ['procedure', 'results'], icon: '🧪' },
    { type: 'Hypothesis', inputs: ['theory'], outputs: ['proposition', 'testable'], icon: '💡' },
    { type: 'Literature Review', inputs: ['topic'], outputs: ['summary', 'gaps'], icon: '📖' },
    { type: 'Statistics', inputs: ['data'], outputs: ['analysis', 'significance'], icon: '📈' },
    { type: 'Visualization', inputs: ['data'], outputs: ['charts', 'diagrams'], icon: '📊' },
    { type: 'Conclusion', inputs: ['analysis'], outputs: ['summary', 'implications'], icon: '✅' },
    { type: 'Publication Draft', inputs: ['research'], outputs: ['manuscript', 'figures'], icon: '📝' },
    { type: 'Peer Review', inputs: ['draft'], outputs: ['feedback', 'revisions'], icon: '👥' }
  ],
  
  // ADMINISTRATION MODULE (15 nodes)
  administration: [
    { type: 'Budget', inputs: ['requirements'], outputs: ['plan', 'allocation'], icon: '💰' },
    { type: 'Schedule', inputs: ['tasks'], outputs: ['timeline', 'gantt'], icon: '📅' },
    { type: 'Staff Assignment', inputs: ['roles'], outputs: ['roster', 'shifts'], icon: '👥' },
    { type: 'Vendor', inputs: ['services'], outputs: ['contracts', 'performance'], icon: '🤝' },
    { type: 'Contract', inputs: ['terms'], outputs: ['agreement', 'signatures'], icon: '📜' },
    { type: 'Invoice', inputs: ['charges'], outputs: ['bill', 'payment'], icon: '💵' },
    { type: 'Purchase Order', inputs: ['items'], outputs: ['order', 'tracking'], icon: '🛒' },
    { type: 'Facility Management', inputs: ['spaces'], outputs: ['maintenance', 'bookings'], icon: '🏢' },
    { type: 'Security Plan', inputs: ['risks'], outputs: ['procedures', 'protocols'], icon: '🔒' },
    { type: 'Insurance', inputs: ['assets'], outputs: ['policy', 'claims'], icon: '🛡️' },
    { type: 'Risk Assessment', inputs: ['activities'], outputs: ['evaluation', 'mitigation'], icon: '⚠️' },
    { type: 'Compliance', inputs: ['regulations'], outputs: ['checklist', 'audit'], icon: '✅' },
    { type: 'Meeting Notes', inputs: ['agenda'], outputs: ['minutes', 'actions'], icon: '📝' },
    { type: 'Approval Flow', inputs: ['request'], outputs: ['decision', 'signatures'], icon: '✔️' },
    { type: 'Performance Metrics', inputs: ['kpis'], outputs: ['dashboard', 'reports'], icon: '📊' }
  ]
};

/**
 * Node Factory
 */
const NodeFactory = {
  createNode(type, module, x = 0, y = 0) {
    const node = new Node(type, module, x, y);
    
    // Find node definition
    const moduleDef = NODE_TYPES[module];
    if (moduleDef) {
      const nodeDef = moduleDef.find(n => n.type === type);
      if (nodeDef) {
        node.inputs = nodeDef.inputs || [];
        node.outputs = nodeDef.outputs || [];
      }
    }
    
    return node;
  },
  
  getAllNodeTypes() {
    return NODE_TYPES;
  },
  
  getModuleNodes(module) {
    return NODE_TYPES[module] || [];
  }
};

// Expose globally
window.Node = Node;
window.NodeFactory = NodeFactory;
window.NODE_TYPES = NODE_TYPES;
window.MODULES = MODULES;

console.log('✅ Node system loaded (88+ node types)');
