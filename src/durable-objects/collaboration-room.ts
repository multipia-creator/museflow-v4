/**
 * Collaboration Room Durable Object
 * Real-time collaboration state management with WebSocket
 */

export interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedNodes: string[];
  lastActivity: number;
}

export interface RoomState {
  workflowId: string;
  users: Map<string, User>;
  created: number;
  lastActivity: number;
}

export class CollaborationRoom implements DurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, string>; // WebSocket -> userId
  private users: Map<string, User>;
  private workflowId: string;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.sessions = new Map();
    this.users = new Map();
    this.workflowId = '';
  }

  /**
   * Handle HTTP requests (WebSocket upgrades)
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept WebSocket connection
      await this.handleWebSocket(server, request);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // HTTP endpoints
    if (url.pathname === '/state') {
      return this.getState();
    }

    if (url.pathname === '/users') {
      return this.getUsers();
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * Handle WebSocket connection
   */
  async handleWebSocket(ws: WebSocket, request: Request): Promise<void> {
    // Accept connection
    ws.accept();

    // Get user info from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || `user-${Date.now()}`;
    const userName = url.searchParams.get('userName') || 'Anonymous';
    this.workflowId = url.searchParams.get('workflowId') || '';

    // Register session
    this.sessions.set(ws, userId);

    // Create or update user
    const user: User = {
      id: userId,
      name: userName,
      color: this.generateUserColor(userId),
      cursor: null,
      selectedNodes: [],
      lastActivity: Date.now(),
    };

    this.users.set(userId, user);

    // Send initial state to new user
    this.sendToUser(ws, {
      type: 'init',
      payload: {
        userId,
        users: Array.from(this.users.values()),
        workflowId: this.workflowId,
      },
    });

    // Broadcast user joined to others
    this.broadcast(
      {
        type: 'user-joined',
        payload: { user },
      },
      userId
    );

    // Handle messages
    ws.addEventListener('message', (event: MessageEvent) => {
      this.handleMessage(ws, userId, event.data);
    });

    // Handle disconnection
    ws.addEventListener('close', () => {
      this.handleDisconnect(ws, userId);
    });

    ws.addEventListener('error', () => {
      this.handleDisconnect(ws, userId);
    });

    console.log(`✅ User connected: ${userName} (${userId})`);
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(ws: WebSocket, userId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      const user = this.users.get(userId);

      if (!user) return;

      // Update last activity
      user.lastActivity = Date.now();

      switch (message.type) {
        case 'cursor-move':
          // Update cursor position
          user.cursor = message.payload;
          this.broadcast(
            {
              type: 'cursor-update',
              payload: { userId, cursor: message.payload },
            },
            userId
          );
          break;

        case 'node-select':
          // Update selected nodes
          user.selectedNodes = message.payload.nodeIds;
          this.broadcast(
            {
              type: 'selection-update',
              payload: { userId, nodeIds: message.payload.nodeIds },
            },
            userId
          );
          break;

        case 'node-update':
          // Broadcast node update
          this.broadcast(
            {
              type: 'node-update',
              payload: { userId, ...message.payload },
            },
            userId
          );
          break;

        case 'node-create':
          // Broadcast node creation
          this.broadcast(
            {
              type: 'node-create',
              payload: { userId, ...message.payload },
            },
            userId
          );
          break;

        case 'node-delete':
          // Broadcast node deletion
          this.broadcast(
            {
              type: 'node-delete',
              payload: { userId, ...message.payload },
            },
            userId
          );
          break;

        case 'connection-create':
          // Broadcast connection creation
          this.broadcast(
            {
              type: 'connection-create',
              payload: { userId, ...message.payload },
            },
            userId
          );
          break;

        case 'connection-delete':
          // Broadcast connection deletion
          this.broadcast(
            {
              type: 'connection-delete',
              payload: { userId, ...message.payload },
            },
            userId
          );
          break;

        case 'viewport-update':
          // Update viewport (no broadcast needed)
          break;

        case 'ping':
          // Respond to ping
          this.sendToUser(ws, { type: 'pong', payload: {} });
          break;

        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  /**
   * Handle user disconnection
   */
  handleDisconnect(ws: WebSocket, userId: string): void {
    try {
      ws.close();
    } catch (e) {
      // Already closed
    }

    this.sessions.delete(ws);
    this.users.delete(userId);

    // Broadcast user left
    this.broadcast({
      type: 'user-left',
      payload: { userId },
    });

    console.log(`👋 User disconnected: ${userId}`);
  }

  /**
   * Broadcast message to all users except sender
   */
  broadcast(message: any, exceptUserId?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [ws, userId] of this.sessions.entries()) {
      if (userId !== exceptUserId) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to send to ${userId}:`, error);
        }
      }
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(ws: WebSocket, message: any): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Generate consistent color for user
   */
  generateUserColor(userId: string): string {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get room state (HTTP endpoint)
   */
  async getState(): Promise<Response> {
    const state = {
      workflowId: this.workflowId,
      userCount: this.users.size,
      users: Array.from(this.users.values()),
    };

    return new Response(JSON.stringify(state), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Get active users (HTTP endpoint)
   */
  async getUsers(): Promise<Response> {
    const users = Array.from(this.users.values());

    return new Response(JSON.stringify({ users }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Alarm handler (cleanup inactive users)
   */
  async alarm(): Promise<void> {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    // Remove inactive users
    for (const [userId, user] of this.users.entries()) {
      if (now - user.lastActivity > timeout) {
        this.users.delete(userId);
        this.broadcast({
          type: 'user-left',
          payload: { userId },
        });
      }
    }

    // Schedule next cleanup
    if (this.users.size > 0) {
      await this.state.storage.setAlarm(Date.now() + 60 * 1000); // 1 minute
    }
  }
}
