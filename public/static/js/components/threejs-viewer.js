/**
 * Three.js 3D Model Viewer Component
 * Displays 3D cultural heritage models in the browser
 */

class ThreeJSViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.options = {
      width: options.width || this.container.clientWidth,
      height: options.height || this.container.clientHeight || 600,
      backgroundColor: options.backgroundColor || 0x1a1a2e,
      cameraPosition: options.cameraPosition || { x: 0, y: 2, z: 5 },
      enableControls: options.enableControls !== false,
      enableGrid: options.enableGrid !== false,
      enableAxes: options.enableAxes || false,
      autoRotate: options.autoRotate || false,
      autoRotateSpeed: options.autoRotateSpeed || 2.0,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.mixer = null;
    this.clock = null;
    this.lights = [];
    this.animationId = null;
    this.isLoading = false;

    this.init();
  }

  /**
   * Initialize Three.js scene
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
    this.scene.fog = new THREE.Fog(this.options.backgroundColor, 10, 50);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.options.width / this.options.height,
      0.1,
      1000
    );
    this.camera.position.set(
      this.options.cameraPosition.x,
      this.options.cameraPosition.y,
      this.options.cameraPosition.z
    );

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.options.width, this.options.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.container.appendChild(this.renderer.domElement);

    // Add lights
    this.setupLights();

    // Add grid helper
    if (this.options.enableGrid) {
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      this.scene.add(gridHelper);
    }

    // Add axes helper
    if (this.options.enableAxes) {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
    }

    // Setup controls if enabled
    if (this.options.enableControls && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 1;
      this.controls.maxDistance = 50;
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.autoRotate = this.options.autoRotate;
      this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
    }

    // Clock for animations
    this.clock = new THREE.Clock();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start render loop
    this.animate();

    console.log('✅ Three.js viewer initialized');
  }

  /**
   * Setup scene lighting
   */
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light (main)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
    this.lights.push(fillLight);

    // Back light
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 3, -10);
    this.scene.add(backLight);
    this.lights.push(backLight);

    // Point light for highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);
    this.lights.push(pointLight);
  }

  /**
   * Load 3D model from URL
   */
  async loadModel(url, options = {}) {
    if (this.isLoading) {
      console.warn('Model is already loading');
      return;
    }

    this.isLoading = true;
    this.showLoadingIndicator();

    try {
      // Remove existing model
      if (this.model) {
        this.scene.remove(this.model);
        this.model = null;
      }

      console.log('Loading 3D model:', url);

      // Determine file type and use appropriate loader
      const extension = url.split('.').pop().toLowerCase();
      let loader;

      if (extension === 'glb' || extension === 'gltf') {
        loader = new THREE.GLTFLoader();
      } else if (extension === 'obj') {
        loader = new THREE.OBJLoader();
      } else if (extension === 'fbx') {
        loader = new THREE.FBXLoader();
      } else {
        throw new Error(`Unsupported file format: ${extension}`);
      }

      // Load model
      const result = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => resolve(gltf),
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            this.updateLoadingProgress(percent);
          },
          (error) => reject(error)
        );
      });

      // Extract model from loaded result
      if (extension === 'glb' || extension === 'gltf') {
        this.model = result.scene;
        
        // Setup animations if available
        if (result.animations && result.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          result.animations.forEach(clip => {
            this.mixer.clipAction(clip).play();
          });
        }
      } else {
        this.model = result;
      }

      // Center and scale model
      this.centerModel();
      if (options.scale) {
        this.model.scale.multiplyScalar(options.scale);
      }

      // Enable shadows
      this.model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // Add to scene
      this.scene.add(this.model);

      // Update camera to fit model
      this.fitCameraToModel();

      console.log('✅ Model loaded successfully');
      this.hideLoadingIndicator();

      return this.model;

    } catch (error) {
      console.error('❌ Failed to load model:', error);
      this.showError('Failed to load 3D model: ' + error.message);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Center model at origin
   */
  centerModel() {
    if (!this.model) return;

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);
  }

  /**
   * Fit camera to view entire model
   */
  fitCameraToModel() {
    if (!this.model) return;

    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Add some padding

    this.camera.position.set(0, maxDim / 2, cameraZ);
    this.camera.lookAt(0, 0, 0);

    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator() {
    let indicator = this.container.querySelector('.threejs-loading');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'threejs-loading';
      indicator.innerHTML = `
        <div class="spinner"></div>
        <div class="threejs-loading-text">Loading 3D Model...</div>
        <div class="threejs-loading-progress">
          <div class="threejs-loading-bar"></div>
        </div>
      `;
      this.container.appendChild(indicator);
    }
    indicator.style.display = 'flex';
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(percent) {
    const bar = this.container.querySelector('.threejs-loading-bar');
    if (bar) {
      bar.style.width = percent + '%';
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const indicator = this.container.querySelector('.threejs-loading');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.hideLoadingIndicator();
    const error = document.createElement('div');
    error.className = 'threejs-error';
    error.textContent = message;
    this.container.appendChild(error);
    setTimeout(() => error.remove(), 5000);
  }

  /**
   * Reset camera to initial position
   */
  resetCamera() {
    if (this.model) {
      this.fitCameraToModel();
    } else {
      this.camera.position.set(
        this.options.cameraPosition.x,
        this.options.cameraPosition.y,
        this.options.cameraPosition.z
      );
      this.camera.lookAt(0, 0, 0);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
    }
  }

  /**
   * Toggle auto-rotation
   */
  toggleAutoRotate() {
    if (this.controls) {
      this.controls.autoRotate = !this.controls.autoRotate;
      return this.controls.autoRotate;
    }
    return false;
  }

  /**
   * Take screenshot
   */
  takeScreenshot() {
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.model) {
      this.scene.remove(this.model);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    window.removeEventListener('resize', this.onWindowResize);

    this.container.innerHTML = '';
  }
}

// Export to global scope
window.ThreeJSViewer = ThreeJSViewer;
