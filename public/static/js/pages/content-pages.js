/**
 * Content Pages - Modules, Pricing, About
 * Simple placeholder pages
 */

// Shared Navigation Component
const ContentNav = {
  render() {
    return `
      <nav style="position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.95); 
                  backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; padding: 16px 0;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; 
                    display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 16px; cursor: pointer;" data-nav="/">
            <img src="/logo.svg" alt="Museflow" style="width: 40px; height: 40px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">Museflow</h2>
          </div>
          
          <div style="display: flex; gap: 32px; align-items: center;">
            <a href="#" data-nav="/" style="text-decoration: none; color: #6b7280; font-weight: 600;">Home</a>
            <a href="#" data-nav="/features" style="text-decoration: none; color: #6b7280; font-weight: 600;">Features</a>
            <a href="#" data-nav="/modules" style="text-decoration: none; color: #6b7280; font-weight: 600;">Modules</a>
            <a href="#" data-nav="/pricing" style="text-decoration: none; color: #6b7280; font-weight: 600;">Pricing</a>
            <a href="#" data-nav="/about" style="text-decoration: none; color: #6b7280; font-weight: 600;">About</a>
            <button data-nav="/login" style="padding: 10px 24px; background: linear-gradient(135deg, #667eea, #764ba2); 
                   color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
              Get Started
            </button>
          </div>
        </div>
      </nav>
    `;
  },
  
  attachEvents() {
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate(link.dataset.nav);
      });
    });
  }
};

// Modules Page
const Modules = {
  init() {
    console.log('🎨 Initializing Modules Page...');
    const container = document.createElement('div');
    container.setAttribute('data-page', 'modules');
    container.innerHTML = `
      <div style="min-height: 100vh; background: #f9fafb;">
        ${ContentNav.render()}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0;">
            6 Specialized Modules
          </h1>
          <p style="font-size: 20px; color: #6b7280; max-width: 800px; margin: 0 auto;">
            Everything museums need, organized into powerful modules
          </p>
        </section>
        
        <section style="padding: 0 24px 80px;">
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px;">
            ${this.renderModules()}
          </div>
        </section>
      </div>
    `;
    document.getElementById('app').appendChild(container);
    ContentNav.attachEvents();
  },
  
  renderModules() {
    const modules = [
      { icon: '🎨', name: 'Exhibition', color: '#8b5cf6', nodes: 15, desc: 'Plan and execute world-class exhibitions' },
      { icon: '📚', name: 'Education', color: '#06b6d4', nodes: 14, desc: 'Create engaging educational programs' },
      { icon: '📦', name: 'Archive', color: '#10b981', nodes: 15, desc: 'Manage digital and physical collections' },
      { icon: '📰', name: 'Publication', color: '#f59e0b', nodes: 14, desc: 'Produce compelling content and publications' },
      { icon: '🔬', name: 'Research', color: '#ec4899', nodes: 15, desc: 'Conduct and document research projects' },
      { icon: '⚙️', name: 'Administration', color: '#6366f1', nodes: 15, desc: 'Streamline operational workflows' }
    ];
    
    return modules.map(m => `
      <div style="padding: 48px; background: white; border-radius: 24px; border: 2px solid #e5e7eb;">
        <div style="width: 80px; height: 80px; background: ${m.color}15; border-radius: 20px; 
                    display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px;">
          ${m.icon}
        </div>
        <h2 style="font-size: 32px; font-weight: 800; color: #1f2937; margin: 0 0 12px 0;">${m.name}</h2>
        <p style="font-size: 16px; color: #6b7280; margin: 0 0 16px 0;">${m.desc}</p>
        <p style="font-size: 14px; color: ${m.color}; font-weight: 600;">${m.nodes} specialized nodes</p>
      </div>
    `).join('');
  }
};

// Pricing Page
const Pricing = {
  init() {
    console.log('🎨 Initializing Pricing Page...');
    const container = document.createElement('div');
    container.setAttribute('data-page', 'pricing');
    container.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(180deg, #f9fafb 0%, #ffffff 50%);">
        ${ContentNav.render()}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0;">
            Simple, Transparent Pricing
          </h1>
          <p style="font-size: 20px; color: #6b7280;">
            Choose the plan that fits your museum
          </p>
        </section>
        
        <section style="padding: 0 24px 80px;">
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
            ${this.renderPlans()}
          </div>
        </section>
      </div>
    `;
    document.getElementById('app').appendChild(container);
    ContentNav.attachEvents();
    this.attachEvents();
  },
  
  renderPlans() {
    const plans = [
      { name: 'Starter', price: 'Free', features: ['1 Project', '2 Team Members', 'Basic Modules', 'Community Support'], cta: 'Start Free' },
      { name: 'Professional', price: '$49', period: '/month', features: ['Unlimited Projects', '10 Team Members', 'All Modules', 'Priority Support', 'AI Features'], cta: 'Start Trial', popular: true },
      { name: 'Enterprise', price: 'Custom', features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integration', 'SLA Guarantee', 'On-premise Option'], cta: 'Contact Sales' }
    ];
    
    return plans.map(p => `
      <div style="padding: 48px; background: white; border-radius: 24px; 
                  border: 2px solid ${p.popular ? '#6366f1' : '#e5e7eb'}; position: relative;
                  ${p.popular ? 'transform: scale(1.05);' : ''}">
        ${p.popular ? '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; background: #6366f1; color: white; border-radius: 20px; font-size: 12px; font-weight: 700;">POPULAR</div>' : ''}
        <h3 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">${p.name}</h3>
        <div style="margin-bottom: 24px;">
          <span style="font-size: 48px; font-weight: 900; color: #1f2937;">${p.price}</span>
          ${p.period ? `<span style="color: #6b7280;">${p.period}</span>` : ''}
        </div>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
          ${p.features.map(f => `
            <li style="padding: 12px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
              <span style="color: #10b981;">✓</span> ${f}
            </li>
          `).join('')}
        </ul>
        <button data-nav="/signup" style="width: 100%; padding: 16px; background: ${p.popular ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'}; 
               color: ${p.popular ? 'white' : '#6366f1'}; border: 2px solid ${p.popular ? 'transparent' : '#6366f1'}; 
               border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s;">
          ${p.cta}
        </button>
      </div>
    `).join('');
  },
  
  attachEvents() {
    document.querySelectorAll('button[data-nav="/signup"]').forEach(btn => {
      btn.addEventListener('click', () => Router.navigate('/signup'));
    });
  }
};

// About Page
const About = {
  init() {
    console.log('🎨 Initializing About Page...');
    const container = document.createElement('div');
    container.setAttribute('data-page', 'about');
    container.innerHTML = `
      <div style="min-height: 100vh; background: #ffffff;">
        ${ContentNav.render()}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0;">
            About Museflow
          </h1>
          <p style="font-size: 20px; color: #6b7280; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            We're on a mission to empower museums with AI-powered tools that make workflow management intuitive, efficient, and collaborative.
          </p>
        </section>
        
        <section style="padding: 80px 24px; background: #f9fafb;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 24px 0; text-align: center;">
              Our Story
            </h2>
            <p style="font-size: 18px; color: #6b7280; line-height: 1.8; margin: 0 0 24px 0;">
              Founded in 2024, Museflow was born from the frustration of managing complex museum projects with outdated tools. 
              We saw museums struggling with disconnected systems, manual processes, and lack of visibility into their workflows.
            </p>
            <p style="font-size: 18px; color: #6b7280; line-height: 1.8; margin: 0;">
              Today, Museflow serves hundreds of museums worldwide, helping them streamline operations, collaborate effectively, 
              and focus on what matters most: creating amazing experiences for their visitors.
            </p>
          </div>
        </section>
        
        <section style="padding: 80px 24px;">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 64px 0;">
              Our Values
            </h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px;">
              ${[
                { icon: '🎯', title: 'User-Centric', desc: 'Every feature is designed with museum professionals in mind' },
                { icon: '🚀', title: 'Innovation', desc: 'We push the boundaries of what\'s possible with AI and design' },
                { icon: '🤝', title: 'Partnership', desc: 'We succeed when our customers succeed' }
              ].map(v => `
                <div>
                  <div style="font-size: 64px; margin-bottom: 16px;">${v.icon}</div>
                  <h3 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">${v.title}</h3>
                  <p style="color: #6b7280; line-height: 1.6;">${v.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </div>
    `;
    document.getElementById('app').appendChild(container);
    ContentNav.attachEvents();
  }
};

window.Modules = Modules;
window.Pricing = Pricing;
window.About = About;
console.log('✅ Content pages loaded');
