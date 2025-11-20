// Museflow v4.0 - Landing Page

const Landing = {
  /**
   * Initialize landing page
   */
  init() {
    console.log('🏠 Loading Landing Page');
    this.render();
    this.attachEvents();
  },
  
  /**
   * Render landing page HTML
   */
  render() {
    const container = document.createElement('div');
    container.setAttribute('data-page', 'landing');
    
    container.innerHTML = `
      ${Navbar.render('light')}
      
      <!-- Hero Section -->
      <section style="
        padding: 120px 0;
        background: var(--gradient-hero);
        position: relative;
        overflow: hidden;
      ">
        <div class="container" style="
          text-align: center;
          position: relative;
          z-index: 1;
        ">
          <h1 style="
            font-size: 64px;
            font-weight: 800;
            color: white;
            margin-bottom: 24px;
            line-height: 1.1;
          ">
            Transform Museum Operations<br>With Intelligent Workflows
          </h1>
          <p style="
            font-size: 24px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 48px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.5;
          ">
            Empower your cultural institution with AI-driven workflow automation. From exhibitions to education, streamline every aspect of museum management in one unified platform.
          </p>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <button id="cta-get-started" class="btn btn-large" style="
              background: white;
              color: var(--primary-600);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            ">
              Get Started Free
            </button>
            <button id="cta-learn-more" class="btn btn-large" style="
              background: rgba(255, 255, 255, 0.2);
              color: white;
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.3);
            ">
              Learn More
            </button>
          </div>
        </div>
        
        <!-- Background decoration -->
        <div style="
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
      </section>
      
      <!-- Modules Section -->
      <section style="
        padding: 100px 0;
        background: white;
      ">
        <div class="container">
          <h2 style="
            text-align: center;
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
          ">Six Comprehensive Modules for Modern Museums</h2>
          <p style="
            text-align: center;
            font-size: 20px;
            color: var(--gray-600);
            margin-bottom: 64px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
          ">Built specifically for cultural institutions, each module is designed to address the unique challenges museums face daily—from curatorial planning to visitor engagement.</p>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
          ">
            ${this.renderModules()}
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer style="
        background: var(--gray-900);
        color: white;
        padding: 64px 0 32px;
      ">
        <div class="container">
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 48px;
            margin-bottom: 48px;
          ">
            <div>
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: var(--gradient-primary);
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                ">🏛️</div>
                <span style="font-size: 20px; font-weight: 700;">Museflow</span>
              </div>
              <p style="color: var(--gray-400);">
                AI-powered workflow platform for museums
              </p>
            </div>
            
            <div>
              <h4 style="margin-bottom: 16px; font-size: 16px;">Product</h4>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;">
                  <a href="#" data-nav="/features" style="color: var(--gray-400); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-500)'" onmouseout="this.style.color='var(--gray-400)'">Features</a>
                </li>
                <li style="margin-bottom: 8px;">
                  <a href="#" data-nav="/modules" style="color: var(--gray-400); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-500)'" onmouseout="this.style.color='var(--gray-400)'">Modules</a>
                </li>
                <li style="margin-bottom: 8px;">
                  <a href="#" data-nav="/pricing" style="color: var(--gray-400); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-500)'" onmouseout="this.style.color='var(--gray-400)'">Pricing</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style="margin-bottom: 16px; font-size: 16px;">Contact</h4>
              <p style="color: var(--gray-400); margin-bottom: 8px;">
                Prof. Hyun Woo Nam
              </p>
              <p style="color: var(--gray-400); margin-bottom: 8px;">
                Seokyeong University
              </p>
              <p style="color: var(--gray-400);">
                gallerypia@gmail.com
              </p>
            </div>
          </div>
          
          <div style="
            border-top: 1px solid var(--gray-800);
            padding-top: 32px;
            text-align: center;
            color: var(--gray-400);
          ">
            © 2025 Museflow. All rights reserved.
          </div>
        </div>
      </footer>
    `;
    
    document.body.appendChild(container);
  },
  
  /**
   * Render module cards
   */
  renderModules() {
    const modules = [
      { 
        id: 'exhibition', 
        icon: '🎨', 
        name: 'Exhibition Planning', 
        color: '#8b5cf6', 
        desc: 'Orchestrate compelling exhibitions from concept to closing—manage timelines, budgets, loans, and installations with precision.' 
      },
      { 
        id: 'education', 
        icon: '📚', 
        name: 'Education & Outreach', 
        color: '#06b6d4', 
        desc: 'Design impactful educational programs, workshops, and community initiatives that bring art and culture to life for diverse audiences.' 
      },
      { 
        id: 'archive', 
        icon: '📦', 
        name: 'Collection Management', 
        color: '#10b981', 
        desc: 'Digitize, catalog, and preserve your collections with advanced metadata management and condition reporting workflows.' 
      },
      { 
        id: 'publication', 
        icon: '📰', 
        name: 'Publications & Media', 
        color: '#f59e0b', 
        desc: 'Produce scholarly catalogs, exhibition guides, and digital content with streamlined editorial and production workflows.' 
      },
      { 
        id: 'research', 
        icon: '🔬', 
        name: 'Research & Documentation', 
        color: '#ec4899', 
        desc: 'Facilitate academic research, provenance studies, and conservation documentation with collaborative research tools.' 
      },
      { 
        id: 'administration', 
        icon: '⚙️', 
        name: 'Operations & Admin', 
        color: '#6366f1', 
        desc: 'Streamline institutional operations—from budget planning and HR to facility management and compliance tracking.' 
      }
    ];
    
    return modules.map(m => `
      <div class="card" style="
        text-align: center;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: ${m.color}15;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
        ">${m.icon}</div>
        <h3 style="
          font-size: 24px;
          font-weight: 600;
          color: ${m.color};
          margin-bottom: 12px;
        ">${m.name}</h3>
        <p style="
          color: var(--gray-600);
          font-size: 16px;
        ">${m.desc}</p>
      </div>
    `).join('');
  },
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const container = document.querySelector('[data-page="landing"]');
    
    // Attach Navbar events
    Navbar.attachEvents(container);
    
    // Get Started CTA
    document.getElementById('cta-get-started')?.addEventListener('click', () => {
      if (Auth.check()) {
        Router.navigate('/project-manager');
      } else {
        Router.navigate('/signup');
      }
    });
    
    // Learn More CTA
    document.getElementById('cta-learn-more')?.addEventListener('click', () => {
      // Scroll to modules section
      const modulesSection = document.querySelector('section:nth-of-type(2)');
      modulesSection?.scrollIntoView({ behavior: 'smooth' });
    });
  }
};

// Expose globally
window.Landing = Landing;
console.log('✅ Landing Page loaded');
