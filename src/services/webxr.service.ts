/**
 * WebXR Service
 * AR/VR support for immersive museum experiences
 * Supports both AR (augmented reality) and VR (virtual reality) modes
 */

export interface WebXRSession {
  mode: 'immersive-vr' | 'immersive-ar' | 'inline';
  referenceSpace: XRReferenceSpace | null;
  session: XRSession | null;
  isActive: boolean;
}

export interface WebXRCapabilities {
  supportsVR: boolean;
  supportsAR: boolean;
  supportsInline: boolean;
  availableFeatures: string[];
}

export interface ArtworkMarker {
  id: string;
  artworkId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  infoPanel: {
    title: string;
    artist: string;
    description: string;
    year: string;
  };
}

export class WebXRService {
  private currentSession: WebXRSession | null = null;
  private capabilities: WebXRCapabilities | null = null;
  private onSessionStartCallback: ((session: WebXRSession) => void) | null = null;
  private onSessionEndCallback: (() => void) | null = null;

  constructor() {
    this.checkCapabilities();
  }

  /**
   * Check WebXR capabilities
   */
  async checkCapabilities(): Promise<WebXRCapabilities> {
    const capabilities: WebXRCapabilities = {
      supportsVR: false,
      supportsAR: false,
      supportsInline: false,
      availableFeatures: [],
    };

    if (!('xr' in navigator)) {
      console.warn('WebXR not supported in this browser');
      this.capabilities = capabilities;
      return capabilities;
    }

    try {
      // Check VR support
      capabilities.supportsVR = await (navigator as any).xr.isSessionSupported('immersive-vr');
      
      // Check AR support
      capabilities.supportsAR = await (navigator as any).xr.isSessionSupported('immersive-ar');
      
      // Check inline support
      capabilities.supportsInline = await (navigator as any).xr.isSessionSupported('inline');

      // Available features
      capabilities.availableFeatures = [
        'local-floor',
        'bounded-floor',
        'hand-tracking',
        'hit-test',
        'dom-overlay',
        'anchors',
        'plane-detection',
        'depth-sensing',
      ];

      console.log('✅ WebXR capabilities:', capabilities);
    } catch (error) {
      console.error('Error checking WebXR capabilities:', error);
    }

    this.capabilities = capabilities;
    return capabilities;
  }

  /**
   * Start VR session
   */
  async startVRSession(canvas: HTMLCanvasElement, features: string[] = []): Promise<WebXRSession> {
    if (!this.capabilities?.supportsVR) {
      throw new Error('VR not supported on this device');
    }

    try {
      const xr = (navigator as any).xr;

      // Request session with features
      const sessionInit: any = {
        requiredFeatures: ['local-floor', ...features],
        optionalFeatures: ['hand-tracking', 'bounded-floor'],
      };

      const session = await xr.requestSession('immersive-vr', sessionInit);

      // Setup session
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      if (!gl) {
        throw new Error('Failed to get WebGL context');
      }

      await session.updateRenderState({
        baseLayer: new (window as any).XRWebGLLayer(session, gl),
      });

      // Get reference space
      const referenceSpace = await session.requestReferenceSpace('local-floor');

      const webxrSession: WebXRSession = {
        mode: 'immersive-vr',
        referenceSpace,
        session,
        isActive: true,
      };

      this.currentSession = webxrSession;

      // Handle session end
      session.addEventListener('end', () => {
        this.handleSessionEnd();
      });

      console.log('✅ VR session started');
      if (this.onSessionStartCallback) {
        this.onSessionStartCallback(webxrSession);
      }

      return webxrSession;
    } catch (error: any) {
      console.error('❌ Failed to start VR session:', error);
      throw new Error(`VR session failed: ${error.message}`);
    }
  }

  /**
   * Start AR session
   */
  async startARSession(canvas: HTMLCanvasElement, features: string[] = []): Promise<WebXRSession> {
    if (!this.capabilities?.supportsAR) {
      throw new Error('AR not supported on this device');
    }

    try {
      const xr = (navigator as any).xr;

      // Request session with AR features
      const sessionInit: any = {
        requiredFeatures: ['hit-test', 'dom-overlay', ...features],
        optionalFeatures: ['anchors', 'plane-detection', 'depth-sensing'],
        domOverlay: { root: document.body },
      };

      const session = await xr.requestSession('immersive-ar', sessionInit);

      // Setup session
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      if (!gl) {
        throw new Error('Failed to get WebGL context');
      }

      await session.updateRenderState({
        baseLayer: new (window as any).XRWebGLLayer(session, gl),
      });

      // Get reference space
      const referenceSpace = await session.requestReferenceSpace('local-floor');

      const webxrSession: WebXRSession = {
        mode: 'immersive-ar',
        referenceSpace,
        session,
        isActive: true,
      };

      this.currentSession = webxrSession;

      // Handle session end
      session.addEventListener('end', () => {
        this.handleSessionEnd();
      });

      console.log('✅ AR session started');
      if (this.onSessionStartCallback) {
        this.onSessionStartCallback(webxrSession);
      }

      return webxrSession;
    } catch (error: any) {
      console.error('❌ Failed to start AR session:', error);
      throw new Error(`AR session failed: ${error.message}`);
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession?.session) {
      return;
    }

    try {
      await this.currentSession.session.end();
      console.log('✅ XR session ended');
    } catch (error) {
      console.error('Error ending XR session:', error);
    }
  }

  /**
   * Handle session end
   */
  private handleSessionEnd(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession = null;
    }

    if (this.onSessionEndCallback) {
      this.onSessionEndCallback();
    }

    console.log('XR session ended');
  }

  /**
   * Get current session
   */
  getCurrentSession(): WebXRSession | null {
    return this.currentSession;
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.currentSession?.isActive || false;
  }

  /**
   * Set session start callback
   */
  onSessionStart(callback: (session: WebXRSession) => void): void {
    this.onSessionStartCallback = callback;
  }

  /**
   * Set session end callback
   */
  onSessionEnd(callback: () => void): void {
    this.onSessionEndCallback = callback;
  }

  /**
   * Perform hit test for AR placement
   */
  async performHitTest(
    session: XRSession,
    referenceSpace: XRReferenceSpace,
    x: number,
    y: number
  ): Promise<XRHitTestResult | null> {
    try {
      const hitTestSource = await session.requestHitTestSource({
        space: referenceSpace,
      });

      // This would be called in the render loop
      // For now, return null as placeholder
      return null;
    } catch (error) {
      console.error('Hit test failed:', error);
      return null;
    }
  }

  /**
   * Place artwork marker in AR
   */
  createArtworkMarker(artwork: ArtworkMarker): any {
    // Create virtual artwork marker for AR
    const marker = {
      id: artwork.id,
      artworkId: artwork.artworkId,
      position: artwork.position,
      rotation: artwork.rotation,
      scale: artwork.scale,
      info: artwork.infoPanel,
      created: Date.now(),
    };

    console.log('Created AR marker:', marker);
    return marker;
  }

  /**
   * Get recommended VR controllers
   */
  getRecommendedControllers(): string[] {
    return [
      'oculus-touch',
      'valve-index',
      'htc-vive',
      'windows-mixed-reality',
      'generic',
    ];
  }

  /**
   * Get WebXR statistics
   */
  getStats(): any {
    return {
      sessionActive: this.isSessionActive(),
      mode: this.currentSession?.mode || 'none',
      capabilities: this.capabilities,
      timestamp: Date.now(),
    };
  }
}

// Singleton instance
let webxrService: WebXRService | null = null;

/**
 * Initialize WebXR Service
 */
export function initWebXR(): WebXRService {
  if (!webxrService) {
    webxrService = new WebXRService();
  }
  return webxrService;
}

/**
 * Get WebXR Service instance
 */
export function getWebXR(): WebXRService {
  if (!webxrService) {
    throw new Error('WebXR Service not initialized. Call initWebXR() first.');
  }
  return webxrService;
}
