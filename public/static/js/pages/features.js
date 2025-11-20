/**
 * Features Page - AI-Powered Capabilities
 * Showcase Museflow's world-class features
 */

const Features = {
  init() {
    console.log('🎨 Initializing Features Page...');
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.createElement('div');
    container.setAttribute('data-page', 'features');
    
    container.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);">
        
        <!-- Navigation -->
        <nav style="position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.95); 
                    backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; padding: 16px 0;">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; 
                      display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="/logo-full.png" alt="Museflow" style="height: 40px; width: auto;">
              <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">Museflow</h2>
            </div>
            
            <div style="display: flex; gap: 32px; align-items: center;">
              <a href="#" data-nav="/" style="text-decoration: none; color: #6b7280; font-weight: 600; 
                                             transition: color 0.2s;"
                 onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#6b7280'">
                Home
              </a>
              <a href="#" data-nav="/features" style="text-decoration: none; color: #6366f1; font-weight: 600;">
                Features
              </a>
              <a href="#" data-nav="/modules" style="text-decoration: none; color: #6b7280; font-weight: 600; 
                                                     transition: color 0.2s;"
                 onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#6b7280'">
                Modules
              </a>
              <a href="#" data-nav="/pricing" style="text-decoration: none; color: #6b7280; font-weight: 600; 
                                                      transition: color 0.2s;"
                 onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#6b7280'">
                Pricing
              </a>
              <a href="#" data-nav="/about" style="text-decoration: none; color: #6b7280; font-weight: 600; 
                                                    transition: color 0.2s;"
                 onmouseover="this.style.color='#1f2937'" onmouseout="this.style.color='#6b7280'">
                About
              </a>
              <button 
                data-nav="/login"
                style="padding: 10px 24px; background: linear-gradient(135deg, #667eea, #764ba2); 
                       color: white; border: none; border-radius: 10px; font-weight: 600; 
                       cursor: pointer; transition: transform 0.2s;"
                onmouseover="this.style.transform='translateY(-2px)'"
                onmouseout="this.style.transform='translateY(0)'">
                Get Started
              </button>
            </div>
          </div>
        </nav>
        
        <!-- Hero Section -->
        <section style="padding: 120px 24px 80px; text-align: center;">
          <div style="max-width: 900px; margin: 0 auto;">
            <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; 
                        color: #6366f1; border-radius: 20px; font-weight: 600; 
                        font-size: 14px; margin-bottom: 24px;">
              🚀 World-Class Features
            </div>
            
            <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; 
                       margin: 0 0 24px 0; line-height: 1.2;">
              AI-Powered Museum<br/>Workflow Platform
            </h1>
            
            <p style="font-size: 20px; color: #6b7280; line-height: 1.6; margin: 0 0 48px 0;">
              Streamline your museum operations with intelligent automation,<br/>
              visual workflow design, and seamless collaboration.
            </p>
            
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <button 
                data-nav="/signup"
                style="padding: 16px 32px; background: linear-gradient(135deg, #667eea, #764ba2); 
                       color: white; border: none; border-radius: 12px; font-size: 18px; 
                       font-weight: 600; cursor: pointer; transition: all 0.3s;"
                onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(102, 126, 234, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                Start Free Trial
              </button>
              
              <button 
                style="padding: 16px 32px; background: white; color: #6366f1; 
                       border: 2px solid #6366f1; border-radius: 12px; font-size: 18px; 
                       font-weight: 600; cursor: pointer; transition: all 0.3s;"
                onmouseover="this.style.background='#6366f1'; this.style.color='white'"
                onmouseout="this.style.background='white'; this.style.color='#6366f1'"
                onclick="document.getElementById('demo-video').scrollIntoView({behavior: 'smooth'})">
                Watch Demo
              </button>
            </div>
          </div>
        </section>
        
        <!-- Key Features Grid -->
        <section style="padding: 80px 24px; background: white;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 64px;">
              <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 16px 0;">
                Everything you need
              </h2>
              <p style="font-size: 18px; color: #6b7280; max-width: 600px; margin: 0 auto;">
                Powerful features designed for modern museum professionals
              </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
              ${this.renderFeatureCards()}
            </div>
          </div>
        </section>
        
        <!-- AI Features Section -->
        <section style="padding: 80px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 64px;">
              <h2 style="font-size: 42px; font-weight: 800; color: white; margin: 0 0 16px 0;">
                🤖 AI-Powered Intelligence
              </h2>
              <p style="font-size: 18px; color: rgba(255, 255, 255, 0.9); max-width: 600px; margin: 0 auto;">
                Let AI handle the routine, while you focus on creativity
              </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px;">
              ${this.renderAIFeatures()}
            </div>
          </div>
        </section>
        
        <!-- Canvas Features Section -->
        <section style="padding: 80px 24px; background: #f9fafb;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;">
              <div>
                <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; 
                            color: #6366f1; border-radius: 20px; font-weight: 600; 
                            font-size: 14px; margin-bottom: 16px;">
                  Figma-Style Canvas
                </div>
                
                <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 24px 0;">
                  Visual Workflow Design
                </h2>
                
                <p style="font-size: 18px; color: #6b7280; line-height: 1.6; margin: 0 0 32px 0;">
                  Design complex museum workflows with an intuitive drag-and-drop interface. 
                  Connect nodes, visualize dependencies, and manage your entire project on an infinite canvas.
                </p>
                
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${[
                    '88+ specialized nodes for museum workflows',
                    'Infinite zoom and pan capabilities',
                    'Real-time collaboration (coming soon)',
                    'Auto-save and version history',
                    'Keyboard shortcuts for power users'
                  ].map(item => `
                    <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px; 
                               color: #374151; font-size: 16px;">
                      <span style="display: flex; align-items: center; justify-content: center; 
                                   width: 24px; height: 24px; background: #10b981; 
                                   border-radius: 50%; color: white; font-weight: 700;">✓</span>
                      ${item}
                    </li>
                  `).join('')}
                </ul>
              </div>
              
              <div style="background: white; border-radius: 24px; padding: 32px; 
                          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);">
                <div style="aspect-ratio: 4/3; background: linear-gradient(135deg, #667eea20, #764ba220); 
                            border-radius: 16px; display: flex; align-items: center; 
                            justify-content: center; font-size: 64px;">
                  🎨
                </div>
                <p style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 14px;">
                  Interactive canvas screenshot coming soon
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Demo Video Section -->
        <section id="demo-video" style="padding: 80px 24px; background: white;">
          <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 16px 0;">
              See Museflow in Action
            </h2>
            <p style="font-size: 18px; color: #6b7280; margin: 0 0 48px 0;">
              Watch how museums are transforming their workflows
            </p>
            
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #667eea, #764ba2); 
                        border-radius: 24px; display: flex; align-items: center; 
                        justify-content: center; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.2);">
              <div style="text-align: center; color: white;">
                <div style="font-size: 72px; margin-bottom: 16px;">▶</div>
                <div style="font-size: 20px; font-weight: 600;">Demo video coming soon</div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- CTA Section -->
        <section style="padding: 80px 24px; background: #1f2937; text-align: center;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 800; color: white; margin: 0 0 24px 0;">
              Ready to transform your museum?
            </h2>
            <p style="font-size: 18px; color: #9ca3af; margin: 0 0 48px 0;">
              Join hundreds of museums already using Museflow
            </p>
            
            <button 
              data-nav="/signup"
              style="padding: 18px 48px; background: linear-gradient(135deg, #667eea, #764ba2); 
                     color: white; border: none; border-radius: 12px; font-size: 20px; 
                     font-weight: 700; cursor: pointer; transition: all 0.3s;"
              onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(102, 126, 234, 0.6)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              Start Free Trial →
            </button>
          </div>
        </section>
        
        <!-- Footer -->
        <footer style="padding: 48px 24px; background: #111827; color: white;">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 24px;">
              <img src="/logo-full.png" alt="Museflow" style="height: 40px; width: auto;">
              <h3 style="font-size: 24px; font-weight: 700; margin: 0;">Museflow</h3>
            </div>
            
            <p style="color: #9ca3af; margin: 0 0 24px 0;">
              AI-Powered Museum Workflow Platform
            </p>
            
            <div style="display: flex; gap: 32px; justify-content: center; margin-bottom: 32px;">
              <a href="#" data-nav="/" style="color: #9ca3af; text-decoration: none; 
                                             transition: color 0.2s;"
                 onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">
                Home
              </a>
              <a href="#" data-nav="/features" style="color: #9ca3af; text-decoration: none; 
                                                      transition: color 0.2s;"
                 onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">
                Features
              </a>
              <a href="#" data-nav="/modules" style="color: #9ca3af; text-decoration: none; 
                                                     transition: color 0.2s;"
                 onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">
                Modules
              </a>
              <a href="#" data-nav="/pricing" style="color: #9ca3af; text-decoration: none; 
                                                      transition: color 0.2s;"
                 onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">
                Pricing
              </a>
              <a href="#" data-nav="/about" style="color: #9ca3af; text-decoration: none; 
                                                    transition: color 0.2s;"
                 onmouseover="this.style.color='white'" onmouseout="this.style.color='#9ca3af'">
                About
              </a>
            </div>
            
            <div style="border-top: 1px solid #374151; padding-top: 24px; color: #6b7280; font-size: 14px;">
              © 2025 Museflow. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
      
      <style>
        @media (max-width: 968px) {
          h1 {
            font-size: 36px !important;
          }
          
          h2 {
            font-size: 32px !important;
          }
          
          nav > div {
            flex-direction: column;
            gap: 16px;
          }
          
          nav > div > div:last-child {
            flex-direction: column;
            width: 100%;
          }
          
          section > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
    
    document.getElementById('app').appendChild(container);
    console.log('✅ Features page rendered');
  },

  renderFeatureCards() {
    const features = [
      {
        icon: '🎨',
        title: 'Visual Workflow Design',
        description: 'Drag-and-drop interface with 88+ specialized nodes for museum operations.'
      },
      {
        icon: '🤖',
        title: 'AI Automation',
        description: 'Intelligent suggestions and workflow automation powered by advanced AI.'
      },
      {
        icon: '📊',
        title: 'Real-time Analytics',
        description: 'Track progress, measure performance, and optimize your workflows.'
      },
      {
        icon: '🔗',
        title: 'Seamless Integration',
        description: 'Connect with your existing tools and systems effortlessly.'
      },
      {
        icon: '👥',
        title: 'Team Collaboration',
        description: 'Work together in real-time with your team members anywhere.'
      },
      {
        icon: '🔒',
        title: 'Enterprise Security',
        description: 'Bank-level encryption and compliance with museum industry standards.'
      }
    ];

    return features.map(feature => `
      <div style="padding: 32px; background: white; border-radius: 20px; 
                  border: 2px solid #e5e7eb; transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.borderColor='#6366f1'; this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)'"
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea20, #764ba220); 
                    border-radius: 16px; display: flex; align-items: center; 
                    justify-content: center; font-size: 32px; margin-bottom: 20px;">
          ${feature.icon}
        </div>
        <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">
          ${feature.title}
        </h3>
        <p style="color: #6b7280; line-height: 1.6; margin: 0;">
          ${feature.description}
        </p>
      </div>
    `).join('');
  },

  renderAIFeatures() {
    const aiFeatures = [
      {
        icon: '🎯',
        title: 'Smart Node Recommendations',
        description: 'AI suggests the next best nodes based on your current workflow context and museum best practices.'
      },
      {
        icon: '🔮',
        title: 'Workflow Prediction',
        description: 'Predict bottlenecks and optimize resource allocation before issues arise.'
      },
      {
        icon: '📝',
        title: 'Auto-Documentation',
        description: 'Generate comprehensive project documentation and reports automatically.'
      },
      {
        icon: '🎓',
        title: 'Best Practice Learning',
        description: 'Learn from thousands of successful museum projects and apply proven patterns.'
      }
    ];

    return aiFeatures.map(feature => `
      <div style="padding: 32px; background: rgba(255, 255, 255, 0.1); 
                  backdrop-filter: blur(10px); border-radius: 20px; 
                  border: 2px solid rgba(255, 255, 255, 0.2);">
        <div style="font-size: 48px; margin-bottom: 16px;">${feature.icon}</div>
        <h3 style="font-size: 24px; font-weight: 700; color: white; margin: 0 0 12px 0;">
          ${feature.title}
        </h3>
        <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0; font-size: 16px;">
          ${feature.description}
        </p>
      </div>
    `).join('');
  },

  attachEvents() {
    // Navigation links
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.dataset.nav;
        Router.navigate(path);
      });
    });
    
    console.log('✅ Features events attached');
  }
};

window.Features = Features;
console.log('✅ Features page loaded');
