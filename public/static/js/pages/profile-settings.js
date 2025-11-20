/**
 * Profile Settings Page - User Profile, Billing, and Help
 * Features:
 * - Profile tab: Edit user info, profile photo, account deletion
 * - Billing tab: Current plan, payment method, billing history
 * - Help tab: Documentation, FAQ, support links
 */

const ProfileSettings = {
  currentTab: 'profile',
  
  init(tab = 'profile') {
    console.log(`🎨 Initializing Profile Settings... Tab: ${tab}`);
    
    // Check authentication
    if (!Auth.requireAuth()) return;
    
    this.currentTab = tab;
    this.render();
    this.attachEvents();
  },
  
  render() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const container = document.createElement('div');
    container.setAttribute('data-page', 'profile-settings');
    
    container.innerHTML = `
      <!-- Top Navigation Bar -->
      <nav style="position: fixed; top: 0; left: 0; right: 0; height: 70px; 
                  background: white; border-bottom: 1px solid #e5e7eb; z-index: 100;
                  display: flex; align-items: center; justify-content: space-between; 
                  padding: 0 32px;">
        
        <!-- Logo -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="/logo-full.png" alt="Museflow" style="height: 40px; width: auto;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">
            Museflow
          </h2>
        </div>
        
        <!-- Back Button -->
        <button 
          id="back-to-dashboard"
          style="padding: 10px 20px; background: #f3f4f6; color: #374151; 
                 border: none; border-radius: 10px; font-size: 14px; 
                 font-weight: 600; cursor: pointer; transition: all 0.2s;
                 display: flex; align-items: center; gap: 8px;"
          onmouseover="this.style.background='#e5e7eb'"
          onmouseout="this.style.background='#f3f4f6'"
        >
          ← Back to Dashboard
        </button>
      </nav>
      
      <!-- Main Content -->
      <div style="margin-top: 70px; padding: 32px; background: #f9fafb; min-height: calc(100vh - 70px);">
        
        <!-- Page Header -->
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 36px; font-weight: 800; color: #1f2937; margin: 0 0 8px 0;">
            Settings
          </h1>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">
            Manage your account settings and preferences
          </p>
        </div>
        
        <!-- Tabs -->
        <div style="display: flex; gap: 16px; border-bottom: 2px solid #e5e7eb; margin-bottom: 32px;">
          <button 
            class="tab-btn" 
            data-tab="profile"
            style="padding: 12px 24px; background: ${this.currentTab === 'profile' ? 'transparent' : 'transparent'}; 
                   color: ${this.currentTab === 'profile' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'profile' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#374151'"
            onmouseout="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#6b7280'"
          >
            👤 Profile
          </button>
          <button 
            class="tab-btn" 
            data-tab="billing"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'billing' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'billing' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#374151'"
            onmouseout="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#6b7280'"
          >
            💳 Billing
          </button>
          <button 
            class="tab-btn" 
            data-tab="help"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'help' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'help' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#374151'"
            onmouseout="if(this.dataset.tab !== '${this.currentTab}') this.style.color='#6b7280'"
          >
            ❓ Help
          </button>
        </div>
        
        <!-- Tab Content -->
        <div id="tab-content">
          ${this.renderTabContent(currentUser)}
        </div>
        
      </div>
    `;
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(container);
  },
  
  renderTabContent(user) {
    switch(this.currentTab) {
      case 'profile':
        return this.renderProfileContent(user);
      case 'billing':
        return this.renderBillingContent(user);
      case 'help':
        return this.renderHelpContent();
      default:
        return this.renderProfileContent(user);
    }
  },
  
  renderProfileContent(user) {
    return `
      <div style="max-width: 800px;">
        <!-- Profile Card -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            Profile Information
          </h2>
          
          <!-- Profile Photo -->
          <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
            <div style="width: 100px; height: 100px; border-radius: 20px; 
                        background: linear-gradient(135deg, #667eea, #764ba2); 
                        display: flex; align-items: center; justify-content: center; 
                        color: white; font-weight: 700; font-size: 48px;">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <button 
                id="change-photo-btn"
                style="padding: 10px 20px; background: #6366f1; color: white; 
                       border: none; border-radius: 10px; font-size: 14px; 
                       font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 8px;"
                onmouseover="this.style.background='#4f46e5'"
                onmouseout="this.style.background='#6366f1'"
              >
                Change Photo
              </button>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
          
          <!-- Profile Form -->
          <form id="profile-form">
            <div style="display: grid; gap: 20px;">
              
              <!-- Name -->
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="profile-name"
                  value="${user.name}"
                  style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; 
                         border-radius: 10px; font-size: 15px; transition: all 0.2s;"
                  onfocus="this.style.borderColor='#6366f1'"
                  onblur="this.style.borderColor='#e5e7eb'"
                  required
                />
              </div>
              
              <!-- Email -->
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="profile-email"
                  value="${user.email}"
                  style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; 
                         border-radius: 10px; font-size: 15px; transition: all 0.2s;"
                  onfocus="this.style.borderColor='#6366f1'"
                  onblur="this.style.borderColor='#e5e7eb'"
                  required
                />
              </div>
              
              <!-- Role (Read-only) -->
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                  Role
                </label>
                <input 
                  type="text" 
                  value="${user.role || 'User'}"
                  style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; 
                         border-radius: 10px; font-size: 15px; background: #f9fafb; color: #6b7280;"
                  disabled
                />
              </div>
              
              <!-- Save Button -->
              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button 
                  type="submit"
                  style="padding: 12px 24px; background: #6366f1; color: white; 
                         border: none; border-radius: 10px; font-size: 15px; 
                         font-weight: 600; cursor: pointer; transition: all 0.2s;"
                  onmouseover="this.style.background='#4f46e5'"
                  onmouseout="this.style.background='#6366f1'"
                >
                  Save Changes
                </button>
                <button 
                  type="button"
                  id="cancel-profile-btn"
                  style="padding: 12px 24px; background: #f3f4f6; color: #374151; 
                         border: none; border-radius: 10px; font-size: 15px; 
                         font-weight: 600; cursor: pointer; transition: all 0.2s;"
                  onmouseover="this.style.background='#e5e7eb'"
                  onmouseout="this.style.background='#f3f4f6'"
                >
                  Cancel
                </button>
              </div>
              
            </div>
          </form>
        </div>
        
        <!-- Danger Zone -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 2px solid #fecaca;">
          <h2 style="font-size: 20px; font-weight: 700; color: #dc2626; margin: 0 0 12px 0;">
            ⚠️ Danger Zone
          </h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px 0;">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button 
            id="delete-account-btn"
            style="padding: 10px 20px; background: #dc2626; color: white; 
                   border: none; border-radius: 10px; font-size: 14px; 
                   font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.background='#b91c1c'"
            onmouseout="this.style.background='#dc2626'"
          >
            Delete Account
          </button>
        </div>
      </div>
    `;
  },
  
  renderBillingContent(user) {
    return `
      <div style="max-width: 800px;">
        <!-- Current Plan -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            Current Plan
          </h2>
          
          <div style="display: flex; justify-content: space-between; align-items: start; 
                      padding: 24px; background: linear-gradient(135deg, #667eea10, #764ba210); 
                      border-radius: 12px; border: 2px solid #6366f1;">
            <div>
              <h3 style="font-size: 28px; font-weight: 800; color: #1f2937; margin: 0 0 8px 0;">
                Professional Plan
              </h3>
              <p style="font-size: 16px; color: #6b7280; margin: 0 0 16px 0;">
                Unlimited projects • Advanced features • Priority support
              </p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Next billing date: <strong>December 20, 2025</strong>
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 36px; font-weight: 800; color: #6366f1; margin: 0 0 4px 0;">
                $49
              </div>
              <div style="font-size: 14px; color: #6b7280;">per month</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button 
              style="padding: 10px 20px; background: #6366f1; color: white; 
                     border: none; border-radius: 10px; font-size: 14px; 
                     font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#4f46e5'"
              onmouseout="this.style.background='#6366f1'"
              onclick="Toast.info('Upgrade feature coming soon!')"
            >
              Upgrade Plan
            </button>
            <button 
              style="padding: 10px 20px; background: #f3f4f6; color: #374151; 
                     border: none; border-radius: 10px; font-size: 14px; 
                     font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#e5e7eb'"
              onmouseout="this.style.background='#f3f4f6'"
              onclick="Toast.info('Cancel subscription feature coming soon!')"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
        
        <!-- Payment Method -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            Payment Method
          </h2>
          
          <div style="display: flex; align-items: center; justify-content: space-between; 
                      padding: 20px; background: #f9fafb; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 50px; height: 35px; background: white; border-radius: 8px; 
                          display: flex; align-items: center; justify-content: center; 
                          font-weight: 800; font-size: 12px; color: #1f2937; border: 1px solid #e5e7eb;">
                VISA
              </div>
              <div>
                <div style="font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                  •••• •••• •••• 4242
                </div>
                <div style="font-size: 13px; color: #6b7280;">
                  Expires 12/2026
                </div>
              </div>
            </div>
            <button 
              style="padding: 8px 16px; background: #f3f4f6; color: #374151; 
                     border: none; border-radius: 8px; font-size: 13px; 
                     font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#e5e7eb'"
              onmouseout="this.style.background='#f3f4f6'"
              onclick="Toast.info('Update payment method feature coming soon!')"
            >
              Update
            </button>
          </div>
        </div>
        
        <!-- Billing History -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            Billing History
          </h2>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="text-align: left; padding: 12px 0; font-size: 13px; font-weight: 600; color: #6b7280;">
                    DATE
                  </th>
                  <th style="text-align: left; padding: 12px 0; font-size: 13px; font-weight: 600; color: #6b7280;">
                    DESCRIPTION
                  </th>
                  <th style="text-align: right; padding: 12px 0; font-size: 13px; font-weight: 600; color: #6b7280;">
                    AMOUNT
                  </th>
                  <th style="text-align: right; padding: 12px 0; font-size: 13px; font-weight: 600; color: #6b7280;">
                    STATUS
                  </th>
                  <th style="text-align: right; padding: 12px 0; font-size: 13px; font-weight: 600; color: #6b7280;">
                    INVOICE
                  </th>
                </tr>
              </thead>
              <tbody>
                ${this.renderBillingHistory()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  renderBillingHistory() {
    const history = [
      { date: 'Nov 20, 2025', description: 'Professional Plan', amount: '$49.00', status: 'Paid' },
      { date: 'Oct 20, 2025', description: 'Professional Plan', amount: '$49.00', status: 'Paid' },
      { date: 'Sep 20, 2025', description: 'Professional Plan', amount: '$49.00', status: 'Paid' },
      { date: 'Aug 20, 2025', description: 'Professional Plan', amount: '$49.00', status: 'Paid' }
    ];
    
    return history.map((item, index) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 16px 0; font-size: 14px; color: #374151;">
          ${item.date}
        </td>
        <td style="padding: 16px 0; font-size: 14px; color: #374151;">
          ${item.description}
        </td>
        <td style="padding: 16px 0; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">
          ${item.amount}
        </td>
        <td style="padding: 16px 0; text-align: right;">
          <span style="padding: 4px 12px; background: #d1fae5; color: #065f46; 
                       border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${item.status}
          </span>
        </td>
        <td style="padding: 16px 0; text-align: right;">
          <button 
            style="padding: 4px 12px; background: #f3f4f6; color: #374151; 
                   border: none; border-radius: 6px; font-size: 12px; 
                   font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.background='#e5e7eb'"
            onmouseout="this.style.background='#f3f4f6'"
            onclick="Toast.info('Download invoice feature coming soon!')"
          >
            📄 View
          </button>
        </td>
      </tr>
    `).join('');
  },
  
  renderHelpContent() {
    return `
      <div style="max-width: 800px;">
        <!-- Quick Help Links -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
          
          <a href="#" onclick="Toast.info('Documentation coming soon!'); return false;"
             style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; 
                    text-decoration: none; transition: all 0.2s;"
             onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
            <div style="font-size: 32px; margin-bottom: 12px;">📚</div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              Documentation
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Complete guides and API references
            </p>
          </a>
          
          <a href="#" onclick="Toast.info('Community coming soon!'); return false;"
             style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; 
                    text-decoration: none; transition: all 0.2s;"
             onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
            <div style="font-size: 32px; margin-bottom: 12px;">👥</div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              Community
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Join discussions and get help
            </p>
          </a>
          
          <a href="#" onclick="Toast.info('Video tutorials coming soon!'); return false;"
             style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; 
                    text-decoration: none; transition: all 0.2s;"
             onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
            <div style="font-size: 32px; margin-bottom: 12px;">🎥</div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              Video Tutorials
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Learn with step-by-step videos
            </p>
          </a>
          
          <a href="#" onclick="Toast.info('Support ticket system coming soon!'); return false;"
             style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; 
                    text-decoration: none; transition: all 0.2s;"
             onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
            <div style="font-size: 32px; margin-bottom: 12px;">💬</div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              Contact Support
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Get help from our support team
            </p>
          </a>
          
        </div>
        
        <!-- FAQ Section -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            Frequently Asked Questions
          </h2>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${this.renderFAQ()}
          </div>
        </div>
      </div>
    `;
  },
  
  renderFAQ() {
    const faqs = [
      {
        question: 'How do I create a new project?',
        answer: 'Click the "New Project" button on your dashboard, select the modules you need, and give your project a name. You can start building your workflow immediately.'
      },
      {
        question: 'Can I collaborate with team members?',
        answer: 'Yes! Professional and Enterprise plans include team collaboration features. You can invite team members, assign roles, and work together in real-time.'
      },
      {
        question: 'How do I export my project data?',
        answer: 'You can export your projects in multiple formats (JSON, PDF, CSV) from the project settings menu. All your workflow data and visualizations can be exported.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'You can cancel your subscription anytime from the Billing tab. Your account will remain active until the end of your current billing period.'
      }
    ];
    
    return faqs.map((faq, index) => `
      <div class="faq-item" data-faq-index="${index}" 
           style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; transition: all 0.2s;">
        <button 
          class="faq-question"
          style="width: 100%; padding: 20px; background: white; border: none; 
                 display: flex; justify-content: space-between; align-items: center; 
                 cursor: pointer; text-align: left; transition: all 0.2s;"
          onmouseover="this.style.background='#f9fafb'"
          onmouseout="this.style.background='white'"
        >
          <span style="font-size: 16px; font-weight: 600; color: #1f2937;">
            ${faq.question}
          </span>
          <span class="faq-icon" style="font-size: 20px; color: #6b7280; transition: transform 0.2s;">
            ▼
          </span>
        </button>
        <div class="faq-answer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
          <div style="padding: 0 20px 20px 20px; font-size: 14px; color: #6b7280; line-height: 1.6;">
            ${faq.answer}
          </div>
        </div>
      </div>
    `).join('');
  },
  
  attachEvents() {
    // Back to Dashboard
    const backBtn = document.getElementById('back-to-dashboard');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/project-manager');
      });
    }
    
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.dataset.tab;
        Router.navigate(`/${tab}`);
      });
    });
    
    // Profile Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProfileUpdate();
      });
    }
    
    // Cancel Profile Changes
    const cancelBtn = document.getElementById('cancel-profile-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        Router.navigate('/project-manager');
      });
    }
    
    // Change Photo
    const changePhotoBtn = document.getElementById('change-photo-btn');
    if (changePhotoBtn) {
      changePhotoBtn.addEventListener('click', () => {
        Toast.info('Photo upload feature coming soon!');
      });
    }
    
    // Delete Account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          Toast.error('Account deletion feature coming soon!');
        }
      });
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      
      question.addEventListener('click', () => {
        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
        
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-icon');
          otherAnswer.style.maxHeight = '0';
          otherIcon.style.transform = 'rotate(0deg)';
        });
        
        // Toggle current item
        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
    
    console.log('✅ Profile Settings events attached');
  },
  
  handleProfileUpdate() {
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    
    if (!name || !email) {
      Toast.error('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.error('Please enter a valid email address');
      return;
    }
    
    // Get current user
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('museflow_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex].name = name;
      users[userIndex].email = email;
      localStorage.setItem('museflow_users', JSON.stringify(users));
      
      // Update current user session
      localStorage.setItem('museflow_user', JSON.stringify(users[userIndex]));
      
      Toast.success('Profile updated successfully!');
      
      // Re-render to show updated data
      setTimeout(() => {
        this.render();
        this.attachEvents();
      }, 1000);
    }
  }
};

// Expose globally
window.ProfileSettings = ProfileSettings;
console.log('✅ Profile Settings page loaded');
