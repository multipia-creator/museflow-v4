/**
 * Content Pages - Modules, Pricing, About
 * Simple placeholder pages
 */

// Modules Page
const Modules = {
  init() {
    console.log('🎨 Initializing Modules Page...');
    const container = document.createElement('div');
    container.setAttribute('data-page', 'modules');
    container.innerHTML = `
      <div style="min-height: 100vh; background: #f9fafb;">
        ${Navbar.render('light')}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; 
                      color: #6366f1; border-radius: 20px; font-weight: 600; 
                      font-size: 14px; margin-bottom: 24px;">
            Complete Museum Management System
          </div>
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0; line-height: 1.2;">
            Six Modules, Infinite Possibilities
          </h1>
          <p style="font-size: 20px; color: #6b7280; max-width: 900px; margin: 0 auto; line-height: 1.6;">
            From curatorial conception to visitor experience, Museflow covers every aspect of modern museum operations. Each module features dozens of specialized workflow nodes designed by museum professionals, for museum professionals.
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
    Navbar.attachEvents(container);
  },
  
  renderModules() {
    const modules = [
      { 
        icon: '🎨', 
        name: 'Exhibition Planning & Management', 
        color: '#8b5cf6', 
        nodes: 15, 
        desc: 'Orchestrate every phase of exhibition development—from initial concept and curatorial research to installation, opening, and post-exhibition evaluation. Manage loan agreements, conservation requirements, insurance certificates, courier arrangements, and complex installation schedules with ease.',
        features: ['Timeline Management', 'Budget Tracking', 'Loan Administration', 'Installation Planning', 'Catalogue Production']
      },
      { 
        icon: '📚', 
        name: 'Education & Public Programs', 
        color: '#06b6d4', 
        nodes: 14, 
        desc: 'Design and deliver transformative learning experiences for all audiences. Plan school tours, workshops, lectures, symposia, and community partnerships. Track attendance, measure educational impact, manage facilitators, and continuously improve program quality based on visitor feedback.',
        features: ['Program Scheduling', 'Facilitator Management', 'Materials Development', 'Impact Measurement', 'Community Outreach']
      },
      { 
        icon: '📦', 
        name: 'Collection Management & Conservation', 
        color: '#10b981', 
        nodes: 15, 
        desc: 'Transform collection stewardship with comprehensive digital cataloging, condition reporting, conservation treatment tracking, and provenance documentation. Generate accession records, manage deaccessions, track object locations, and ensure compliance with professional standards and legal requirements.',
        features: ['Digital Cataloging', 'Condition Reporting', 'Treatment Tracking', 'Provenance Research', 'Inventory Management']
      },
      { 
        icon: '📰', 
        name: 'Publications & Digital Media', 
        color: '#f59e0b', 
        nodes: 14, 
        desc: 'Produce scholarly exhibition catalogues, collection guides, research publications, and digital content that meet the highest academic standards. Manage editorial calendars, coordinate with authors and designers, track image rights, oversee production workflows, and distribute publications effectively.',
        features: ['Editorial Workflows', 'Image Rights Management', 'Production Scheduling', 'Print & Digital Publishing', 'Distribution Tracking']
      },
      { 
        icon: '🔬', 
        name: 'Research & Documentation', 
        color: '#ec4899', 
        nodes: 15, 
        desc: 'Support rigorous academic research and institutional knowledge creation. Document object histories, facilitate visiting scholar programs, manage research archives, coordinate conservation science studies, and publish findings that advance the field. Built-in citation management and research ethics compliance.',
        features: ['Research Projects', 'Scholar Collaboration', 'Documentation Standards', 'Conservation Science', 'Knowledge Management']
      },
      { 
        icon: '⚙️', 
        name: 'Operations & Administration', 
        color: '#6366f1', 
        nodes: 15, 
        desc: 'Streamline institutional operations from strategic planning to daily management. Coordinate budgets, manage human resources, oversee facility maintenance, ensure regulatory compliance, track key performance indicators, and maintain institutional policies. The operational backbone for excellent museums.',
        features: ['Budget Management', 'HR Administration', 'Facility Management', 'Compliance Tracking', 'Performance Metrics']
      }
    ];
    
    return modules.map(m => `
      <div style="padding: 48px; background: white; border-radius: 24px; border: 2px solid #e5e7eb; 
                  transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.borderColor='${m.color}'; this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'"
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        <div style="width: 80px; height: 80px; background: ${m.color}15; border-radius: 20px; 
                    display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px;">
          ${m.icon}
        </div>
        <h2 style="font-size: 28px; font-weight: 800; color: #1f2937; margin: 0 0 16px 0; line-height: 1.3;">${m.name}</h2>
        <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.7;">${m.desc}</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
          <p style="font-size: 13px; color: #9ca3af; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Key Capabilities</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${m.features.map(f => `
              <span style="padding: 6px 12px; background: ${m.color}10; color: ${m.color}; 
                           border-radius: 6px; font-size: 13px; font-weight: 600;">
                ${f}
              </span>
            `).join('')}
          </div>
          <p style="font-size: 14px; color: ${m.color}; font-weight: 600; margin: 16px 0 0 0;">${m.nodes} specialized workflow nodes</p>
        </div>
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
        ${Navbar.render('light')}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; 
                      color: #6366f1; border-radius: 20px; font-weight: 600; 
                      font-size: 14px; margin-bottom: 24px;">
            Flexible Plans for Every Institution
          </div>
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0; line-height: 1.2;">
            Pricing That Grows<br/>With Your Museum
          </h1>
          <p style="font-size: 20px; color: #6b7280; max-width: 700px; margin: 0 auto; line-height: 1.6;">
            From small galleries to major institutions, Museflow scales with your needs. Start free, upgrade when ready, and only pay for what you use.
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
    Navbar.attachEvents(container);
    this.attachEvents();
  },
  
  renderPlans() {
    const plans = [
      { 
        name: 'Foundation', 
        price: 'Free', 
        tagline: 'Perfect for getting started',
        features: [
          '3 Active Projects', 
          '5 Team Members', 
          'All 6 Core Modules', 
          'Community Forum Support',
          '1GB Cloud Storage',
          'Basic Analytics Dashboard'
        ], 
        cta: 'Start Free Today' 
      },
      { 
        name: 'Professional', 
        price: '$49', 
        period: '/month per user', 
        tagline: 'For serious museum professionals',
        features: [
          'Unlimited Projects', 
          'Unlimited Team Members', 
          'All Premium Modules', 
          'Priority Email Support',
          'Advanced AI Features',
          '50GB Cloud Storage',
          'Custom Workflows',
          'Advanced Analytics & Reports',
          'API Access',
          'Version History (30 days)'
        ], 
        cta: 'Start 14-Day Free Trial', 
        popular: true 
      },
      { 
        name: 'Enterprise', 
        price: 'Custom', 
        tagline: 'For large institutions',
        features: [
          'Everything in Professional',
          'Dedicated Account Manager', 
          'Custom Integrations & API',
          '24/7 Priority Phone Support',
          '99.9% Uptime SLA',
          'Unlimited Cloud Storage',
          'On-Premise Deployment Option',
          'Advanced Security & Compliance',
          'Custom Training & Onboarding',
          'White-Label Options'
        ], 
        cta: 'Contact Sales Team' 
      }
    ];
    
    return plans.map(p => `
      <div style="padding: 48px; background: white; border-radius: 24px; 
                  border: 2px solid ${p.popular ? '#6366f1' : '#e5e7eb'}; position: relative;
                  ${p.popular ? 'transform: scale(1.05); box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);' : ''}
                  transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.transform='${p.popular ? 'scale(1.07)' : 'translateY(-8px)'}'; this.style.boxShadow='0 20px 60px rgba(0,0,0,0.15)'"
           onmouseout="this.style.transform='${p.popular ? 'scale(1.05)' : 'translateY(0)'}'; this.style.boxShadow='${p.popular ? '0 20px 60px rgba(99, 102, 241, 0.15)' : 'none'}'">
        ${p.popular ? '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 6px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">⭐ MOST POPULAR</div>' : ''}
        <h3 style="font-size: 28px; font-weight: 800; color: #1f2937; margin: 0 0 8px 0;">${p.name}</h3>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">${p.tagline}</p>
        <div style="margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb;">
          <span style="font-size: 48px; font-weight: 900; color: #1f2937;">${p.price}</span>
          ${p.period ? `<div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${p.period}</div>` : ''}
        </div>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
          ${p.features.map(f => `
            <li style="padding: 10px 0; color: #374151; display: flex; align-items: start; gap: 12px; font-size: 15px; line-height: 1.6;">
              <span style="display: flex; align-items: center; justify-content: center; 
                           width: 20px; height: 20px; background: #10b981; border-radius: 50%; 
                           color: white; font-weight: 700; font-size: 12px; flex-shrink: 0; margin-top: 2px;">✓</span>
              ${f}
            </li>
          `).join('')}
        </ul>
        <button data-nav="/signup" style="width: 100%; padding: 16px; background: ${p.popular ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'}; 
               color: ${p.popular ? 'white' : '#6366f1'}; border: 2px solid ${p.popular ? 'transparent' : '#6366f1'}; 
               border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-size: 16px;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.2)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
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
        ${Navbar.render('light')}
        
        <section style="padding: 120px 24px 80px; text-align: center;">
          <div style="display: inline-block; padding: 8px 16px; background: #eef2ff; 
                      color: #6366f1; border-radius: 20px; font-weight: 600; 
                      font-size: 14px; margin-bottom: 24px;">
            Our Mission & Vision
          </div>
          <h1 style="font-size: 56px; font-weight: 900; color: #1f2937; margin: 0 0 24px 0; line-height: 1.2;">
            Transforming How<br/>Museums Work
          </h1>
          <p style="font-size: 20px; color: #6b7280; max-width: 900px; margin: 0 auto; line-height: 1.7;">
            We believe museums deserve technology as inspiring as the collections they preserve. Museflow combines decades of museum best practices with cutting-edge AI to create workflows that are powerful yet intuitive, comprehensive yet elegant.
          </p>
        </section>
        
        <section style="padding: 80px 24px; background: #f9fafb;">
          <div style="max-width: 900px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 32px 0; text-align: center;">
              The Story Behind Museflow
            </h2>
            <p style="font-size: 18px; color: #6b7280; line-height: 1.8; margin: 0 0 24px 0;">
              Museflow was born from a simple observation: while museums are at the forefront of preserving culture and driving innovation in visitor experience, they often rely on outdated, disconnected tools for internal operations. Spreadsheets for exhibition planning. Email chains for approvals. Separate systems for collections, education, and administration that never talk to each other.
            </p>
            <p style="font-size: 18px; color: #6b7280; line-height: 1.8; margin: 0 0 24px 0;">
              Founded in 2024 by museum professionals and technology innovators, Museflow set out to change this paradigm. We spent years studying how the world's leading museums operate, interviewing hundreds of curators, educators, registrars, and administrators. We learned that museum work is inherently collaborative, deeply complex, and profoundly meaningful.
            </p>
            <p style="font-size: 18px; color: #6b7280; line-height: 1.8; margin: 0;">
              Today, Museflow empowers cultural institutions worldwide—from small community museums to major national galleries—to manage every aspect of their operations with clarity and confidence. Our platform doesn't just digitize workflows; it transforms how museums think about operational excellence, enabling them to dedicate more time to their core mission: preserving culture and inspiring audiences.
            </p>
          </div>
        </section>
        
        <section style="padding: 80px 24px;">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 42px; font-weight: 800; color: #1f2937; margin: 0 0 64px 0;">
              Our Core Values
            </h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px;">
              ${[
                { 
                  icon: '🎯', 
                  title: 'Museum-First Design', 
                  desc: 'Every feature is born from real museum needs, refined through continuous dialogue with cultural professionals. We don\'t build generic project management—we build museum excellence.' 
                },
                { 
                  icon: '🚀', 
                  title: 'Relentless Innovation', 
                  desc: 'We harness the latest advances in AI, visual design, and collaborative technology, but never at the expense of usability. Innovation must serve the mission.' 
                },
                { 
                  icon: '🤝', 
                  title: 'True Partnership', 
                  desc: 'Your success is our success. We\'re not just a software vendor—we\'re your partner in operational transformation, committed to your long-term growth and impact.' 
                },
                { 
                  icon: '🌍', 
                  title: 'Cultural Stewardship', 
                  desc: 'We recognize the profound responsibility museums carry. Our tools help preserve cultural heritage while making it accessible to wider, more diverse audiences.' 
                },
                { 
                  icon: '🔒', 
                  title: 'Trust & Security', 
                  desc: 'Museum collections represent irreplaceable cultural treasures. We treat data security and privacy with the same reverence museums treat their objects.' 
                },
                { 
                  icon: '📚', 
                  title: 'Continuous Learning', 
                  desc: 'The museum field evolves, and so do we. We learn from every institution we work with, constantly improving our understanding and capabilities.' 
                }
              ].map(v => `
                <div style="padding: 32px; background: white; border-radius: 20px; border: 2px solid #e5e7eb; 
                            transition: all 0.3s; cursor: pointer;"
                     onmouseover="this.style.borderColor='#6366f1'; this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)'"
                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                  <div style="font-size: 56px; margin-bottom: 20px;">${v.icon}</div>
                  <h3 style="font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">${v.title}</h3>
                  <p style="color: #6b7280; line-height: 1.7; font-size: 15px;">${v.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </div>
    `;
    document.getElementById('app').appendChild(container);
    Navbar.attachEvents(container);
  }
};

window.Modules = Modules;
window.Pricing = Pricing;
window.About = About;
console.log('✅ Content pages loaded');
