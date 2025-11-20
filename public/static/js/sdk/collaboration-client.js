/**
 * Collaboration WebSocket Client
 * Real-time collaboration with cursors and selections
 */

class CollaborationClient {
  constructor(workflowId, userId, userName) {
    this.workflowId = workflowId;
    this.userId = userId;
    this.userName = userName;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.listeners = new Map();
    this.users = new Map();
    this.pingInterval = null;
  }

  /**
   * Connect to collaboration room
   */
  async connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}/api/collaboration/connect/${this.workflowId}?userId=${this.userId}&userName=${encodeURIComponent(this.userName)}`;

      console.log('🔌 Connecting to collaboration room:', url);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('✅ Connected to collaboration room');
        this.emit('connected');
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('❌ Disconnected from collaboration room');
        this.stopPing();
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.emit('error', error);
    }
  }

  /**
   * Disconnect from collaboration room
   */
  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Attempt reconnection
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      this.emit('reconnect-failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval
   */
  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', {});
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop ping interval
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'init':
          // Initial state with all users
          message.payload.users.forEach(user => {
            this.users.set(user.id, user);
          });
          this.emit('init', message.payload);
          break;

        case 'user-joined':
          // New user joined
          this.users.set(message.payload.user.id, message.payload.user);
          this.emit('user-joined', message.payload.user);
          break;

        case 'user-left':
          // User left
          this.users.delete(message.payload.userId);
          this.emit('user-left', message.payload.userId);
          break;

        case 'cursor-update':
          // Cursor position update
          const user = this.users.get(message.payload.userId);
          if (user) {
            user.cursor = message.payload.cursor;
          }
          this.emit('cursor-update', message.payload);
          break;

        case 'selection-update':
          // Node selection update
          const selUser = this.users.get(message.payload.userId);
          if (selUser) {
            selUser.selectedNodes = message.payload.nodeIds;
          }
          this.emit('selection-update', message.payload);
          break;

        case 'node-update':
          // Node updated
          this.emit('node-update', message.payload);
          break;

        case 'node-create':
          // Node created
          this.emit('node-create', message.payload);
          break;

        case 'node-delete':
          // Node deleted
          this.emit('node-delete', message.payload);
          break;

        case 'connection-create':
          // Connection created
          this.emit('connection-create', message.payload);
          break;

        case 'connection-delete':
          // Connection deleted
          this.emit('connection-delete', message.payload);
          break;

        case 'pong':
          // Ping response
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  }

  /**
   * Send message to server
   */
  send(type, payload) {
    if (!this.isConnected || !this.ws) {
      console.warn('Not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify({ type, payload }));
    } catch (error) {
      console.error('Send error:', error);
    }
  }

  /**
   * Send cursor position
   */
  sendCursor(x, y) {
    this.send('cursor-move', { x, y });
  }

  /**
   * Send node selection
   */
  sendSelection(nodeIds) {
    this.send('node-select', { nodeIds });
  }

  /**
   * Send node update
   */
  sendNodeUpdate(node) {
    this.send('node-update', { node });
  }

  /**
   * Send node creation
   */
  sendNodeCreate(node) {
    this.send('node-create', { node });
  }

  /**
   * Send node deletion
   */
  sendNodeDelete(nodeId) {
    this.send('node-delete', { nodeId });
  }

  /**
   * Send connection creation
   */
  sendConnectionCreate(connection) {
    this.send('connection-create', { connection });
  }

  /**
   * Send connection deletion
   */
  sendConnectionDelete(connectionId) {
    this.send('connection-delete', { connectionId });
  }

  /**
   * Event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error (${event}):`, error);
      }
    });
  }

  /**
   * Get all active users
   */
  getUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   */
  getUser(userId) {
    return this.users.get(userId);
  }
}

// Global instance
window.CollaborationClient = null;

// Initialize collaboration client
function initCollaboration(workflowId, userId, userName) {
  if (window.CollaborationClient) {
    window.CollaborationClient.disconnect();
  }
  
  window.CollaborationClient = new CollaborationClient(workflowId, userId, userName);
  return window.CollaborationClient;
}
