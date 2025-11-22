/**
 * Landing Page - Complete Interactivity
 * Features:
 * - AI search with voice recognition
 * - Tool modals with feature details
 * - Language switcher
 * - Mobile hamburger menu
 * - Smooth scroll navigation
 * - "Notify Me" functionality
 * - Privacy/Terms modals
 */

const Landing = {
  currentLanguage: 'ko',
  isVoiceListening: false,
  recognition: null,

  init() {
    console.log('🎨 Initializing Landing Page...');
    
    this.setupLanguage();
    this.attachEvents();
    this.setupVoiceRecognition();
    this.applyTranslations();
    
    console.log('✅ Landing Page initialized');
  },

  setupLanguage() {
    // Get saved language or default to Korean
    this.currentLanguage = localStorage.getItem('museflow_language') || 'ko';
    
    // Set language selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = this.currentLanguage;
    }
  },

  attachEvents() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        console.log('📱 Mobile menu toggled');
      });
      
      // Close menu when clicking links
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
        });
      });
    }

    // Language switcher
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // AI Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('ai-search');
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        this.handleSearch(searchInput.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(searchInput.value);
        }
      });
    }

    // Voice Recognition Button
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.toggleVoiceRecognition();
      });
    }

    // AI Tool Buttons
    const toolButtons = document.querySelectorAll('.ai-tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.showToolModal(tool);
      });
    });

    // Notify Me Button
    const notifyBtn = document.getElementById('notify-btn');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => {
        this.showNotifyModal();
      });
    }

    // Privacy & Terms Links
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    
    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('privacy-modal');
      });
    }
    
    if (termsLink) {
      termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('terms-modal');
      });
    }

    // Close modal buttons
    document.querySelectorAll('.policy-modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.policy-modal');
        if (modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Close modals on outside click
    document.querySelectorAll('.policy-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    console.log('✅ Landing page events attached');
  },

  setupVoiceRecognition() {
    // Check if browser supports Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = this.currentLanguage === 'ko' ? 'ko-KR' : 
                              this.currentLanguage === 'ja' ? 'ja-JP' :
                              this.currentLanguage === 'zh-CN' ? 'zh-CN' :
                              this.currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US';
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        this.isVoiceListening = true;
        const voiceBtn = document.getElementById('voice-btn');
        const voiceIcon = document.getElementById('voice-icon');
        if (voiceBtn) voiceBtn.classList.add('listening');
        if (voiceIcon) voiceIcon.className = 'fas fa-microphone-slash';
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Transcript:', transcript);
        
        const searchInput = document.getElementById('ai-search');
        if (searchInput) {
          searchInput.value = transcript;
        }
        
        // Auto-search
        this.handleSearch(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        this.stopVoiceRecognition();
        
        if (event.error === 'no-speech') {
          this.showToast('No speech detected. Please try again.', 'warning');
        } else if (event.error === 'not-allowed') {
          this.showToast('Microphone access denied. Please enable it in browser settings.', 'error');
        }
      };

      this.recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        this.stopVoiceRecognition();
      };

      console.log('✅ Voice recognition ready');
    } else {
      console.warn('⚠️ Voice recognition not supported in this browser');
    }
  },

  toggleVoiceRecognition() {
    if (!this.recognition) {
      this.showToast('Voice recognition not supported in your browser', 'error');
      return;
    }

    if (this.isVoiceListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
        this.showToast('Listening... Speak now', 'info');
      } catch (error) {
        console.error('Voice recognition error:', error);
        this.showToast('Failed to start voice recognition', 'error');
      }
    }
  },

  stopVoiceRecognition() {
    this.isVoiceListening = false;
    const voiceBtn = document.getElementById('voice-btn');
    const voiceIcon = document.getElementById('voice-icon');
    if (voiceBtn) voiceBtn.classList.remove('listening');
    if (voiceIcon) voiceIcon.className = 'fas fa-microphone';
  },

  handleSearch(query) {
    if (!query || query.trim() === '') {
      this.showToast('Please enter a search query', 'warning');
      return;
    }

    console.log('🔍 Searching for:', query);
    
    // Show loading
    this.showToast('Searching... 🔍', 'info');
    
    // Simulate search delay
    setTimeout(() => {
      // In production, this would call actual search API
      this.showToast(`Search results for "${query}" - Feature coming soon! 🚀`, 'success');
      
      // Navigate to projects page with search query
      sessionStorage.setItem('museflow_search_query', query);
      
      // Check if user is logged in
      if (Auth && Auth.check()) {
        window.location.href = '/projects.html';
      } else {
        // Show signup modal or redirect
        this.showToast('Please sign up to start searching', 'info');
        setTimeout(() => {
          window.location.href = '/signup.html';
        }, 1500);
      }
    }, 800);
  },

  showToolModal(tool) {
    console.log('🔧 Show tool modal:', tool);
    
    const toolData = {
      exhibition: {
        icon: '🎯',
        title: 'Plan Exhibition',
        description: 'AI-powered exhibition planning tool that helps you design, curate, and organize exhibitions from concept to execution.',
        features: [
          'Automatic workflow generation',
          'Artwork selection recommendations',
          'Budget estimation',
          'Timeline planning',
          'Space layout optimization'
        ]
      },
      budget: {
        icon: '💰',
        title: 'Calculate Budget',
        description: 'Smart budget calculator that automatically estimates costs and optimizes resource allocation for your museum projects.',
        features: [
          'Automatic cost estimation',
          'Resource allocation',
          'Financial forecasting',
          'Budget optimization',
          'Expense tracking'
        ]
      },
      artwork: {
        icon: '🏛️',
        title: 'Select Artworks',
        description: 'AI curator that recommends artworks based on your exhibition theme, space, and audience preferences.',
        features: [
          'AI-powered recommendations',
          'Theme matching',
          'Museum API integration',
          'Historical context',
          'Availability checking'
        ]
      },
      visitor: {
        icon: '👥',
        title: 'Predict Visitors',
        description: 'Machine learning-based visitor prediction system that forecasts attendance and optimizes capacity management.',
        features: [
          'Daily traffic prediction',
          'Peak hour analysis',
          'Capacity management',
          'Seasonal trends',
          'Event impact analysis'
        ]
      },
      space: {
        icon: '🏗️',
        title: 'Design Space',
        description: '3D space design tool that helps you visualize and optimize gallery layouts with digital twin technology.',
        features: [
          '3D layout visualization',
          'Artwork placement',
          'Flow optimization',
          'Lighting simulation',
          'Virtual walkthrough'
        ]
      },
      schedule: {
        icon: '📋',
        title: 'Manage Schedule',
        description: 'Intelligent scheduling system that manages timelines, milestones, and resource allocation automatically.',
        features: [
          'Auto-scheduling',
          'Milestone tracking',
          'Resource coordination',
          'Conflict detection',
          'Calendar integration'
        ]
      },
      guide: {
        icon: '💬',
        title: 'Create Guide',
        description: 'AI-powered guide generator that creates multilingual exhibition guides and visitor materials automatically.',
        features: [
          'Multilingual generation',
          'Audio guides',
          'Accessibility support',
          'Interactive content',
          'QR code integration'
        ]
      },
      all: {
        icon: '🤖',
        title: 'All AI Tools',
        description: 'Access all 8 AI agents working together to power your complete museum workflow management.',
        features: [
          'Complete workflow automation',
          'Multi-agent coordination',
          'Real-time collaboration',
          'Integrated dashboard',
          'Comprehensive analytics'
        ]
      }
    };

    const data = toolData[tool] || toolData.all;
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'tool-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f0a1f 100%); 
                  border-radius: 24px; padding: 3rem; max-width: 600px; width: 100%;
                  border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 20px 80px rgba(139, 92, 246, 0.3);
                  position: relative; animation: slideUp 0.3s ease;">
        
        <button id="modal-close" style="position: absolute; top: 1.5rem; right: 1.5rem; 
                                        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
                                        color: white; width: 40px; height: 40px; border-radius: 50%; 
                                        font-size: 24px; cursor: pointer; transition: all 0.3s ease;
                                        display: flex; align-items: center; justify-content: center;"
                onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='rotate(90deg)'"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='rotate(0)'">
          ×
        </button>
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div id="modal-icon" style="font-size: 4rem; margin-bottom: 1rem;">${data.icon}</div>
          <h2 id="modal-title" style="font-size: 2rem; font-weight: 800; color: white; margin-bottom: 1rem;
                                      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                                      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ${data.title}
          </h2>
          <p id="modal-desc" style="font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
            ${data.description}
          </p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 1rem;">Key Features:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.features.map(feature => `
              <li style="padding: 0.5rem 0; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 0.75rem;">
                <span style="color: #10b981; font-size: 1.2rem;">✓</span>
                ${feature}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.5rem;">🚀</span>
            <span style="font-weight: 700; color: white;">Coming Soon</span>
          </div>
          <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 0.95rem;">
            This feature is currently in development. Sign up to be notified when it becomes available!
          </p>
        </div>
        
        <div style="display: flex; gap: 1rem;">
          <button onclick="document.getElementById('tool-modal').remove()"
                  style="flex: 1; padding: 1rem; background: rgba(255, 255, 255, 0.1); 
                         border: 1px solid rgba(255, 255, 255, 0.2); color: white; 
                         border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;
                         transition: all 0.3s ease;"
                  onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'"
                  onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            Close
          </button>
          <button onclick="window.location.href='/signup.html'"
                  style="flex: 1; padding: 1rem; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                         border: none; color: white; border-radius: 12px; font-size: 1rem; 
                         font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                         box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);"
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(139, 92, 246, 0.6)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(139, 92, 246, 0.4)'">
            Get Started →
          </button>
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Close button
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Restore on close
    modal.addEventListener('remove', () => {
      document.body.style.overflow = 'auto';
    });
  },

  showNotifyModal() {
    const modal = document.createElement('div');
    modal.id = 'notify-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f0a1f 100%); 
                  border-radius: 24px; padding: 3rem; max-width: 500px; width: 100%;
                  border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 20px 80px rgba(139, 92, 246, 0.3);
                  animation: slideUp 0.3s ease;">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🔔</div>
          <h2 style="font-size: 2rem; font-weight: 800; color: white; margin-bottom: 0.5rem;">Get Notified</h2>
          <p style="color: rgba(255, 255, 255, 0.8);">Be the first to know when this feature launches!</p>
        </div>
        
        <form id="notify-form" style="margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <input type="email" id="notify-email" placeholder="Enter your email" required
                   style="width: 100%; padding: 1rem; background: rgba(255, 255, 255, 0.08); 
                          border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; 
                          color: white; font-size: 1rem; box-sizing: border-box;"
                   onfocus="this.style.borderColor='#8b5cf6'; this.style.background='rgba(255, 255, 255, 0.1)'"
                   onblur="this.style.borderColor='rgba(255, 255, 255, 0.15)'; this.style.background='rgba(255, 255, 255, 0.08)'" />
          </div>
          
          <button type="submit"
                  style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                         border: none; color: white; border-radius: 12px; font-size: 1rem; 
                         font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                         box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);"
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(139, 92, 246, 0.6)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(139, 92, 246, 0.4)'">
            Notify Me
          </button>
        </form>
        
        <button onclick="document.getElementById('notify-modal').remove()"
                style="width: 100%; padding: 1rem; background: rgba(255, 255, 255, 0.1); 
                       border: 1px solid rgba(255, 255, 255, 0.2); color: white; 
                       border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;"
                onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
          Cancel
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Handle form submission
    const form = document.getElementById('notify-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('notify-email').value;
        this.handleNotifySubmit(email);
        modal.remove();
        document.body.style.overflow = 'auto';
      });
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
      }
    });
  },

  handleNotifySubmit(email) {
    console.log('📧 Notify email:', email);
    
    // Save to localStorage
    const notifications = JSON.parse(localStorage.getItem('museflow_notify_emails') || '[]');
    if (!notifications.includes(email)) {
      notifications.push(email);
      localStorage.setItem('museflow_notify_emails', JSON.stringify(notifications));
    }
    
    this.showToast(`✅ Thank you! We'll notify you at ${email}`, 'success');
  },

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  changeLanguage(lang) {
    console.log('🌐 Changing language to:', lang);
    
    this.currentLanguage = lang;
    localStorage.setItem('museflow_language', lang);
    
    // Update voice recognition language if available
    if (this.recognition) {
      this.recognition.lang = lang === 'ko' ? 'ko-KR' : 
                              lang === 'ja' ? 'ja-JP' :
                              lang === 'zh-CN' ? 'zh-CN' :
                              lang === 'zh-TW' ? 'zh-TW' : 'en-US';
    }
    
    this.applyTranslations();
    this.showToast('Language changed successfully', 'success');
  },

  applyTranslations() {
    // This function would apply translations from the i18n system
    // The landing.html already has comprehensive translations built-in
    // This is a hook for dynamic content translation
    
    console.log('🌐 Applying translations for:', this.currentLanguage);
    
    // Update dynamic content if needed
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      // Translation logic would go here
    });
  },

  showToast(message, type = 'info') {
    // Use global Toast system if available
    if (typeof Toast !== 'undefined') {
      Toast.show(message, type);
    } else {
      // Fallback to console
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Landing.init());
} else {
  Landing.init();
}

// Expose globally
window.Landing = Landing;
console.log('✅ Landing page script loaded');
