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
        padding: 160px 0 180px;
        background: #000000;
        position: relative;
        overflow: hidden;
      ">
        <!-- Blue glow - left side -->
        <div style="
          position: absolute;
          top: 10%;
          left: 10%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        "></div>
        
        <!-- Pink glow - right side -->
        <div style="
          position: absolute;
          top: 20%;
          right: 15%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 10s ease-in-out infinite reverse;
        "></div>
        
        <!-- Purple glow - bottom -->
        <div style="
          position: absolute;
          bottom: -10%;
          left: 30%;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite;
        "></div>
        
        <div class="container" style="
          text-align: center;
          position: relative;
          z-index: 1;
        ">
          <!-- Massive Neon Logo - 800px -->
          <div style="
            margin-bottom: 80px;
            animation: fadeInScale 1.5s ease-out;
          ">
            <img 
              src="/static/images/logo-square.png" 
              alt="Museflow" 
              style="
                width: 800px;
                height: 800px;
                max-width: 90vw;
                margin: 0 auto;
                filter: drop-shadow(0 0 100px rgba(96, 165, 250, 0.9))
                        drop-shadow(0 0 180px rgba(236, 72, 153, 0.7))
                        drop-shadow(0 0 140px rgba(139, 92, 246, 0.8));
                animation: logoGlow 4s ease-in-out infinite;
              "
            />
          </div>
          
          <h1 style="
            font-size: 80px;
            font-weight: 900;
            background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 40%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 32px;
            line-height: 1.1;
            animation: fadeInUp 1s ease-out 0.3s backwards;
            text-shadow: 0 0 40px rgba(96, 165, 250, 0.3);
          ">
            Transform Museum Operations<br>With Intelligent Workflows
          </h1>
          
          <p style="
            font-size: 26px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 64px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.7;
            animation: fadeInUp 1s ease-out 0.5s backwards;
          ">
            Empower your cultural institution with AI-driven workflow automation. From exhibitions to education, streamline every aspect of museum management in one unified platform.
          </p>
          
          <div style="
            display: flex; 
            gap: 24px; 
            justify-content: center;
            animation: fadeInUp 1s ease-out 0.7s backwards;
          ">
            <button id="cta-get-started" class="btn btn-large" style="
              background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
              color: white;
              border: none;
              padding: 20px 48px;
              font-size: 20px;
              font-weight: 700;
              border-radius: 16px;
              box-shadow: 0 0 40px rgba(96, 165, 250, 0.6),
                          0 0 80px rgba(236, 72, 153, 0.4),
                          0 20px 40px rgba(0, 0, 0, 0.3);
              transition: all 0.3s ease;
              cursor: pointer;
            " 
            onmouseover="this.style.transform='translateY(-6px) scale(1.05)'; this.style.boxShadow='0 0 60px rgba(96, 165, 250, 0.8), 0 0 100px rgba(236, 72, 153, 0.6), 0 30px 60px rgba(0, 0, 0, 0.4)'"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 40px rgba(96, 165, 250, 0.6), 0 0 80px rgba(236, 72, 153, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)'">
              Get Started Free
            </button>
            <button id="cta-learn-more" class="btn btn-large" style="
              background: rgba(255, 255, 255, 0.08);
              color: white;
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.2);
              padding: 20px 48px;
              font-size: 20px;
              font-weight: 700;
              border-radius: 16px;
              transition: all 0.3s ease;
              cursor: pointer;
            "
            onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.transform='translateY(-6px)'"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.transform='translateY(0)'">
              Learn More
            </button>
          </div>
        </div>
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
