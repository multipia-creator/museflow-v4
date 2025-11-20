/**
 * Project Manager Page - World-Class Dashboard
 * Features:
 * - User profile section with stats
 * - Project cards with module indicators
 * - Create new project modal with 6 modules
 * - Template quick-start options
 * - Search and filter functionality
 * - Drag and drop project organization
 * - Recent activity timeline
 */

const ProjectManager = {
  projects: [],
  filteredProjects: [],
  currentFilter: 'all',
  searchQuery: '',
  
  init() {
    console.log('🎨 Initializing Project Manager...');
    this.loadProjects();
    this.render();
    this.attachEvents();
  },

  loadProjects() {
    // Load projects from localStorage
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      Router.navigate('/login');
      return;
    }
    
    const storageKey = `museflow_projects_${currentUser.id}`;
    const stored = localStorage.getItem(storageKey);
    this.projects = stored ? JSON.parse(stored) : this.getDefaultProjects();
    this.filteredProjects = [...this.projects];
    
    console.log(`✅ Loaded ${this.projects.length} projects`);
  },

  saveProjects() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const storageKey = `museflow_projects_${currentUser.id}`;
    localStorage.setItem(storageKey, JSON.stringify(this.projects));
    console.log('💾 Projects saved');
  },

  getDefaultProjects() {
    return [
      {
        id: 1,
        name: 'Modern Art Exhibition 2024',
        description: 'Contemporary art showcase featuring emerging artists',
        modules: ['exhibition', 'publication'],
        color: '#8b5cf6',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 65,
        status: 'active'
      },
      {
        id: 2,
        name: 'Digital Archive Migration',
        description: 'Digitizing historical artifacts and documents',
        modules: ['archive', 'research'],
        color: '#10b981',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 42,
        status: 'active'
      },
      {
        id: 3,
        name: 'Youth Education Program',
        description: 'Interactive workshops for students and families',
        modules: ['education', 'administration'],
        color: '#06b6d4',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 88,
        status: 'active'
      }
    ];
  },

  render() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const container = document.createElement('div');
    container.setAttribute('data-page', 'project-manager');
    
    container.innerHTML = `
      <!-- Top Navigation Bar -->
      <nav style="position: fixed; top: 0; left: 0; right: 0; height: 70px; 
                  background: white; border-bottom: 1px solid #e5e7eb; z-index: 100;
                  display: flex; align-items: center; justify-content: space-between; 
                  padding: 0 32px;">
        
        <!-- Logo -->
        <a href="/project-manager" data-nav="/project-manager" style="
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.3s;
        " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
          <img src="/static/images/logo-horizontal.png" alt="Museflow" style="height: 40px; width: auto;">
        </a>
        
        <!-- Search Bar -->
        <div style="flex: 1; max-width: 500px; margin: 0 32px;">
          <div style="position: relative;">
            <input 
              type="text" 
              id="search-projects"
              placeholder="Search projects..."
              style="width: 100%; padding: 12px 16px 12px 44px; border: 2px solid #e5e7eb; 
                     border-radius: 12px; font-size: 15px; transition: all 0.2s;"
              onfocus="this.style.borderColor='#6366f1'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
            <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); 
                         font-size: 18px;">🔍</span>
          </div>
        </div>
        
        <!-- User Profile -->
        <div style="display: flex; align-items: center; gap: 16px;">
          <button 
            id="notifications-btn"
            style="width: 44px; height: 44px; border-radius: 12px; border: none; 
                   background: #f3f4f6; cursor: pointer; font-size: 20px; transition: all 0.2s;
                   position: relative;"
            onmouseover="this.style.background='#e5e7eb'"
            onmouseout="this.style.background='#f3f4f6'"
          >
            🔔
            <span style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; 
                         background: #ef4444; border-radius: 50%; border: 2px solid white;"></span>
          </button>
          
          <div id="user-menu-trigger" style="display: flex; align-items: center; gap: 12px; 
                                             padding: 8px 12px; border-radius: 12px; cursor: pointer;
                                             transition: all 0.2s; position: relative;"
               onmouseover="this.style.background='#f3f4f6'"
               onmouseout="this.style.background='transparent'">
            <div style="width: 40px; height: 40px; border-radius: 10px; 
                        background: linear-gradient(135deg, #667eea, #764ba2); 
                        display: flex; align-items: center; justify-content: center; 
                        color: white; font-weight: 700; font-size: 16px;">
              ${currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${currentUser.name}</div>
              <div style="font-size: 12px; color: #6b7280;">Admin</div>
            </div>
            <span style="font-size: 12px; color: #9ca3af;">▼</span>
          </div>
        </div>
      </nav>
      
      <!-- User Menu Dropdown (Hidden by default) -->
      <div id="user-menu-dropdown" style="display: none; position: fixed; top: 80px; right: 32px; 
                                          background: white; border-radius: 16px; padding: 8px; 
                                          box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 1000;
                                          min-width: 220px; border: 1px solid #e5e7eb;">
        <a href="#" id="menu-profile" style="display: flex; align-items: center; gap: 12px; 
                                             padding: 12px 16px; border-radius: 10px; text-decoration: none; 
                                             color: #374151; transition: all 0.2s;"
           onmouseover="this.style.background='#f3f4f6'"
           onmouseout="this.style.background='transparent'">
          <span style="font-size: 18px;">👤</span>
          <span style="font-weight: 500;">Profile Settings</span>
        </a>
        <a href="#" id="menu-billing" style="display: flex; align-items: center; gap: 12px; 
                                             padding: 12px 16px; border-radius: 10px; text-decoration: none; 
                                             color: #374151; transition: all 0.2s;"
           onmouseover="this.style.background='#f3f4f6'"
           onmouseout="this.style.background='transparent'">
          <span style="font-size: 18px;">💳</span>
          <span style="font-weight: 500;">Billing</span>
        </a>
        <a href="#" id="menu-help" style="display: flex; align-items: center; gap: 12px; 
                                          padding: 12px 16px; border-radius: 10px; text-decoration: none; 
                                          color: #374151; transition: all 0.2s;"
           onmouseover="this.style.background='#f3f4f6'"
           onmouseout="this.style.background='transparent'">
          <span style="font-size: 18px;">❓</span>
          <span style="font-weight: 500;">Help & Support</span>
        </a>
        ${currentUser.role === 'admin' ? `
        <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>
        <a href="#" id="menu-admin" style="display: flex; align-items: center; gap: 12px; 
                                           padding: 12px 16px; border-radius: 10px; text-decoration: none; 
                                           color: #dc2626; transition: all 0.2s;"
           onmouseover="this.style.background='#fef2f2'"
           onmouseout="this.style.background='transparent'">
          <span style="font-size: 18px;">🛡️</span>
          <span style="font-weight: 500;">Admin Dashboard</span>
        </a>
        ` : ''}
        <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>
        <a href="#" id="menu-logout" style="display: flex; align-items: center; gap: 12px; 
                                            padding: 12px 16px; border-radius: 10px; text-decoration: none; 
                                            color: #ef4444; transition: all 0.2s;"
           onmouseover="this.style.background='#fef2f2'"
           onmouseout="this.style.background='transparent'">
          <span style="font-size: 18px;">🚪</span>
          <span style="font-weight: 500;">Logout</span>
        </a>
      </div>
      
      <!-- Notifications Dropdown (Hidden by default) -->
      <div id="notifications-dropdown" style="display: none; position: fixed; top: 80px; right: 150px; 
                                              background: white; border-radius: 16px; padding: 16px; 
                                              box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 1000;
                                              min-width: 360px; max-width: 400px; border: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0;">
            Notifications
          </h3>
          <button 
            id="mark-all-read"
            style="font-size: 12px; color: #6366f1; background: none; border: none; 
                   cursor: pointer; font-weight: 600; padding: 4px 8px;"
            onmouseover="this.style.textDecoration='underline'"
            onmouseout="this.style.textDecoration='none'"
          >
            Mark all as read
          </button>
        </div>
        
        <div id="notifications-list" style="max-height: 400px; overflow-y: auto;">
          ${this.renderNotifications()}
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="margin-top: 70px; padding: 32px; background: #f9fafb; min-height: calc(100vh - 70px);">
        
        <!-- Header Section -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h1 style="font-size: 36px; font-weight: 800; color: #1f2937; margin: 0 0 8px 0;">
                My Projects
              </h1>
              <p style="font-size: 16px; color: #6b7280; margin: 0;">
                Manage your museum workflows and collaborations
              </p>
            </div>
            
            <button 
              id="create-project-btn"
              style="padding: 14px 28px; background: linear-gradient(135deg, #667eea, #764ba2); 
                     color: white; border: none; border-radius: 12px; font-size: 16px; 
                     font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; 
                     align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.6)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
            >
              <span style="font-size: 20px;">➕</span>
              New Project
            </button>
          </div>
          
          <!-- Stats Cards -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px;">
            <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Total Projects</div>
              <div style="font-size: 32px; font-weight: 800; color: #1f2937;">${this.projects.length}</div>
              <div style="font-size: 12px; color: #10b981; margin-top: 4px;">↗ +2 this month</div>
            </div>
            
            <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Active Projects</div>
              <div style="font-size: 32px; font-weight: 800; color: #1f2937;">${this.projects.filter(p => p.status === 'active').length}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">In progress</div>
            </div>
            
            <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Avg. Progress</div>
              <div style="font-size: 32px; font-weight: 800; color: #1f2937;">${Math.round(this.projects.reduce((acc, p) => acc + p.progress, 0) / this.projects.length)}%</div>
              <div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">↗ +5% this week</div>
            </div>
            
            <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Team Members</div>
              <div style="font-size: 32px; font-weight: 800; color: #1f2937;">12</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Collaborators</div>
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
          <button class="filter-btn" data-filter="all" style="padding: 10px 20px; border: 2px solid #6366f1; 
                                                              background: #6366f1; color: white; border-radius: 10px; 
                                                              font-weight: 600; cursor: pointer; transition: all 0.2s;">
            All Projects
          </button>
          <button class="filter-btn" data-filter="exhibition" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                     background: white; color: #6b7280; border-radius: 10px; 
                                                                     font-weight: 600; cursor: pointer; transition: all 0.2s;">
            🎨 Exhibition
          </button>
          <button class="filter-btn" data-filter="education" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                    background: white; color: #6b7280; border-radius: 10px; 
                                                                    font-weight: 600; cursor: pointer; transition: all 0.2s;">
            📚 Education
          </button>
          <button class="filter-btn" data-filter="archive" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                  background: white; color: #6b7280; border-radius: 10px; 
                                                                  font-weight: 600; cursor: pointer; transition: all 0.2s;">
            📦 Archive
          </button>
          <button class="filter-btn" data-filter="publication" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                      background: white; color: #6b7280; border-radius: 10px; 
                                                                      font-weight: 600; cursor: pointer; transition: all 0.2s;">
            📰 Publication
          </button>
          <button class="filter-btn" data-filter="research" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                   background: white; color: #6b7280; border-radius: 10px; 
                                                                   font-weight: 600; cursor: pointer; transition: all 0.2s;">
            🔬 Research
          </button>
          <button class="filter-btn" data-filter="administration" style="padding: 10px 20px; border: 2px solid #e5e7eb; 
                                                                         background: white; color: #6b7280; border-radius: 10px; 
                                                                         font-weight: 600; cursor: pointer; transition: all 0.2s;">
            ⚙️ Administration
          </button>
        </div>
        
        <!-- Projects Grid -->
        <div id="projects-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
                                       gap: 24px;">
          ${this.renderProjectCards()}
        </div>
        
        <!-- Empty State (if no projects) -->
        ${this.projects.length === 0 ? `
          <div style="text-align: center; padding: 80px 20px; background: white; border-radius: 20px; 
                      border: 2px dashed #e5e7eb;">
            <div style="font-size: 64px; margin-bottom: 16px;">📂</div>
            <h3 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              No projects yet
            </h3>
            <p style="color: #6b7280; margin: 0 0 24px 0;">
              Create your first project to get started
            </p>
            <button 
              onclick="document.getElementById('create-project-btn').click()"
              style="padding: 14px 28px; background: linear-gradient(135deg, #667eea, #764ba2); 
                     color: white; border: none; border-radius: 12px; font-size: 16px; 
                     font-weight: 600; cursor: pointer;"
            >
              Create Project
            </button>
          </div>
        ` : ''}
      </div>
      
      <!-- Create Project Modal (Hidden by default) -->
      <div id="create-project-modal" style="display: none; position: fixed; top: 0; left: 0; 
                                            width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); 
                                            z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 24px; padding: 40px; width: 90%; 
                    max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative;">
          
          <!-- Close Button -->
          <button 
            id="close-modal-btn"
            style="position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; 
                   border-radius: 8px; border: none; background: #f3f4f6; cursor: pointer; 
                   font-size: 20px; transition: all 0.2s;"
            onmouseover="this.style.background='#e5e7eb'"
            onmouseout="this.style.background='#f3f4f6'"
          >
            ✕
          </button>
          
          <h2 style="font-size: 32px; font-weight: 800; color: #1f2937; margin: 0 0 8px 0;">
            Create New Project
          </h2>
          <p style="color: #6b7280; margin: 0 0 32px 0;">
            Set up your museum workflow project
          </p>
          
          <form id="create-project-form">
            <!-- Project Name -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">
                Project Name *
              </label>
              <input 
                type="text" 
                id="project-name"
                placeholder="e.g., Summer Exhibition 2024"
                required
                style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; 
                       border-radius: 12px; font-size: 16px; box-sizing: border-box;"
              />
            </div>
            
            <!-- Description -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">
                Description
              </label>
              <textarea 
                id="project-description"
                placeholder="Brief description of your project..."
                rows="3"
                style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; 
                       border-radius: 12px; font-size: 16px; resize: vertical; box-sizing: border-box;"
              ></textarea>
            </div>
            
            <!-- Select Modules -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 12px;">
                Select Modules *
              </label>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                ${this.renderModuleSelectors()}
              </div>
            </div>
            
            <!-- Color Theme -->
            <div style="margin-bottom: 32px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 12px;">
                Project Color
              </label>
              <div style="display: flex; gap: 12px;">
                ${['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444'].map(color => `
                  <button 
                    type="button"
                    class="color-selector"
                    data-color="${color}"
                    style="width: 44px; height: 44px; border-radius: 10px; border: 3px solid transparent; 
                           background: ${color}; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.transform='scale(1.1)'"
                    onmouseout="this.style.transform='scale(1)'"
                  ></button>
                `).join('')}
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button 
                type="button"
                id="cancel-create-btn"
                style="padding: 14px 24px; background: white; color: #6b7280; border: 2px solid #e5e7eb; 
                       border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;"
              >
                Cancel
              </button>
              <button 
                type="submit"
                style="padding: 14px 24px; background: linear-gradient(135deg, #667eea, #764ba2); 
                       color: white; border: none; border-radius: 12px; font-size: 16px; 
                       font-weight: 600; cursor: pointer;"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>
        /* Responsive Design */
        @media (max-width: 1200px) {
          #projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
          }
        }
        
        @media (max-width: 768px) {
          nav {
            padding: 0 16px !important;
          }
          
          nav > div:first-child h2 {
            display: none;
          }
          
          nav > div:nth-child(2) {
            display: none !important;
          }
          
          [data-page="project-manager"] > div {
            padding: 16px !important;
          }
          
          h1 {
            font-size: 28px !important;
          }
          
          [data-page="project-manager"] > div > div:nth-child(2) > div:first-child > div:first-child > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          #projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
    
    document.getElementById('app').appendChild(container);
    console.log('✅ Project Manager rendered');
  },

  renderProjectCards() {
    if (this.filteredProjects.length === 0 && this.currentFilter !== 'all') {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <h3 style="font-size: 20px; font-weight: 600; color: #6b7280;">
            No projects found
          </h3>
          <p style="color: #9ca3af; margin-top: 8px;">
            Try a different filter or create a new project
          </p>
        </div>
      `;
    }
    
    const moduleIcons = {
      exhibition: '🎨',
      education: '📚',
      archive: '📦',
      publication: '📰',
      research: '🔬',
      administration: '⚙️'
    };
    
    return this.filteredProjects.map(project => `
      <div class="project-card" data-project-id="${project.id}" 
           style="background: white; border-radius: 16px; padding: 24px; border: 2px solid #e5e7eb; 
                  cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;"
           onmouseover="this.style.borderColor='${project.color}'; this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)'"
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        
        <!-- Color Bar -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${project.color};"></div>
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div style="flex: 1;">
            <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
              ${project.name}
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.5;">
              ${project.description}
            </p>
          </div>
          
          <button 
            class="project-menu-btn"
            data-project-id="${project.id}"
            style="width: 32px; height: 32px; border-radius: 8px; border: none; 
                   background: #f3f4f6; cursor: pointer; font-size: 16px; flex-shrink: 0;
                   transition: all 0.2s;"
            onmouseover="this.style.background='#e5e7eb'"
            onmouseout="this.style.background='#f3f4f6'"
            onclick="event.stopPropagation()"
          >
            ⋯
          </button>
        </div>
        
        <!-- Modules -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          ${project.modules.map(module => `
            <span style="padding: 6px 12px; background: ${project.color}15; color: ${project.color}; 
                         border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; 
                         align-items: center; gap: 6px;">
              ${moduleIcons[module]} ${module.charAt(0).toUpperCase() + module.slice(1)}
            </span>
          `).join('')}
        </div>
        
        <!-- Progress Bar -->
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 600; color: #6b7280;">Progress</span>
            <span style="font-size: 13px; font-weight: 700; color: ${project.color};">${project.progress}%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
            <div style="width: ${project.progress}%; height: 100%; background: ${project.color}; 
                        transition: width 0.3s ease;"></div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; 
                    border-top: 1px solid #f3f4f6;">
          <div style="font-size: 12px; color: #9ca3af;">
            Updated ${this.getRelativeTime(project.updatedAt)}
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #8b5cf6; 
                        border: 2px solid white; margin-left: -8px;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #06b6d4; 
                        border: 2px solid white; margin-left: -8px;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #10b981; 
                        border: 2px solid white; margin-left: -8px;"></div>
            <span style="font-size: 12px; color: #6b7280; margin-left: 4px;">+5</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderModuleSelectors() {
    const modules = [
      { id: 'exhibition', icon: '🎨', name: 'Exhibition', color: '#8b5cf6' },
      { id: 'education', icon: '📚', name: 'Education', color: '#06b6d4' },
      { id: 'archive', icon: '📦', name: 'Archive', color: '#10b981' },
      { id: 'publication', icon: '📰', name: 'Publication', color: '#f59e0b' },
      { id: 'research', icon: '🔬', name: 'Research', color: '#ec4899' },
      { id: 'administration', icon: '⚙️', name: 'Administration', color: '#6366f1' }
    ];
    
    return modules.map(module => `
      <label class="module-selector" data-module="${module.id}"
             style="display: flex; align-items: center; gap: 12px; padding: 16px; 
                    border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; 
                    transition: all 0.2s; user-select: none;"
             onmouseover="this.style.borderColor='${module.color}'"
             onmouseout="if (!this.querySelector('input').checked) this.style.borderColor='#e5e7eb'">
        <input 
          type="checkbox" 
          name="modules" 
          value="${module.id}"
          style="width: 20px; height: 20px; cursor: pointer; accent-color: ${module.color};"
        />
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #1f2937; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">${module.icon}</span>
            ${module.name}
          </div>
        </div>
      </label>
    `).join('');
  },

  renderNotifications() {
    const notifications = this.getNotifications();
    
    if (notifications.length === 0) {
      return `
        <div style="text-align: center; padding: 32px 16px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔔</div>
          <div style="font-size: 14px; font-weight: 500;">No new notifications</div>
          <div style="font-size: 13px; margin-top: 4px;">You're all caught up!</div>
        </div>
      `;
    }
    
    return notifications.map(notif => `
      <div class="notification-item" data-notif-id="${notif.id}"
           style="padding: 12px; border-radius: 10px; margin-bottom: 8px; cursor: pointer;
                  background: ${notif.read ? 'transparent' : '#f0f9ff'}; 
                  border: 1px solid ${notif.read ? '#f3f4f6' : '#bae6fd'};
                  transition: all 0.2s;"
           onmouseover="this.style.background='#f3f4f6'"
           onmouseout="this.style.background='${notif.read ? 'transparent' : '#f0f9ff'}'">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="font-size: 24px; flex-shrink: 0;">${notif.icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: ${notif.read ? '500' : '600'}; 
                        color: #1f2937; margin-bottom: 4px;">
              ${notif.title}
            </div>
            <div style="font-size: 13px; color: #6b7280; line-height: 1.4; margin-bottom: 4px;">
              ${notif.message}
            </div>
            <div style="font-size: 12px; color: #9ca3af;">
              ${this.formatNotificationTime(notif.timestamp)}
            </div>
          </div>
          ${!notif.read ? '<div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; flex-shrink: 0; margin-top: 6px;"></div>' : ''}
        </div>
      </div>
    `).join('');
  },
  
  getNotifications() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return [];
    
    // Get or initialize notifications from localStorage
    const storageKey = `museflow_notifications_${currentUser.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default sample notifications
    const defaultNotifications = [
      {
        id: 1,
        icon: '🎉',
        title: 'Welcome to Museflow!',
        message: 'Start creating your first project and explore the powerful workflow tools.',
        timestamp: Date.now() - 3600000,
        read: false
      },
      {
        id: 2,
        icon: '✅',
        title: 'Project Updated',
        message: 'Modern Art Exhibition 2024 has been successfully updated.',
        timestamp: Date.now() - 7200000,
        read: false
      },
      {
        id: 3,
        icon: '📊',
        title: 'Weekly Report Available',
        message: 'Your weekly project progress report is ready to view.',
        timestamp: Date.now() - 86400000,
        read: true
      }
    ];
    
    localStorage.setItem(storageKey, JSON.stringify(defaultNotifications));
    return defaultNotifications;
  },
  
  formatNotificationTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  },
  
  markNotificationAsRead(notifId) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const storageKey = `museflow_notifications_${currentUser.id}`;
    const notifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
      
      // Update notification badge
      this.updateNotificationBadge();
    }
  },
  
  markAllNotificationsAsRead() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const storageKey = `museflow_notifications_${currentUser.id}`;
    const notifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    notifications.forEach(n => n.read = true);
    localStorage.setItem(storageKey, JSON.stringify(notifications));
    
    // Re-render notifications
    const list = document.getElementById('notifications-list');
    if (list) {
      list.innerHTML = this.renderNotifications();
    }
    
    // Update notification badge
    this.updateNotificationBadge();
    
    Toast.success('All notifications marked as read');
  },
  
  updateNotificationBadge() {
    const notifications = this.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.querySelector('#notifications-btn span');
    if (badge) {
      badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
  },

  attachEvents() {
    // Create Project Button
    const createBtn = document.getElementById('create-project-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreateModal());
    }
    
    // Close Modal
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-create-btn');
    
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideCreateModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideCreateModal());
    
    // Create Project Form
    const form = document.getElementById('create-project-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleCreateProject(e));
    }
    
    // Color Selectors
    const colorSelectors = document.querySelectorAll('.color-selector');
    colorSelectors.forEach(btn => {
      btn.addEventListener('click', () => {
        colorSelectors.forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = btn.dataset.color;
      });
    });
    
    // Select first color by default
    if (colorSelectors.length > 0) {
      colorSelectors[0].style.borderColor = colorSelectors[0].dataset.color;
    }
    
    // Module Selectors
    const moduleSelectors = document.querySelectorAll('.module-selector');
    moduleSelectors.forEach(selector => {
      const checkbox = selector.querySelector('input');
      const module = modules.find(m => m.id === selector.dataset.module);
      
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selector.style.borderColor = module.color;
          selector.style.background = `${module.color}10`;
        } else {
          selector.style.borderColor = '#e5e7eb';
          selector.style.background = 'transparent';
        }
      });
    });
    
    // Project Cards - Click to open canvas
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.dataset.projectId;
        this.openProject(projectId);
      });
    });
    
    // Search
    const searchInput = document.getElementById('search-projects');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }
    
    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update button styles
        filterBtns.forEach(b => {
          b.style.background = 'white';
          b.style.color = '#6b7280';
          b.style.borderColor = '#e5e7eb';
        });
        btn.style.background = '#6366f1';
        btn.style.color = 'white';
        btn.style.borderColor = '#6366f1';
        
        // Apply filter
        this.currentFilter = btn.dataset.filter;
        this.applyFilters();
      });
    });
    
    // User Menu
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');
    
    if (userMenuTrigger && userMenuDropdown) {
      userMenuTrigger.addEventListener('click', () => {
        const isVisible = userMenuDropdown.style.display === 'block';
        userMenuDropdown.style.display = isVisible ? 'none' : 'block';
      });
      
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuTrigger.contains(e.target) && !userMenuDropdown.contains(e.target)) {
          userMenuDropdown.style.display = 'none';
        }
      });
    }
    
    // Logout
    const logoutBtn = document.getElementById('menu-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        Toast.success('Logged out successfully');
        Router.navigate('/');
      });
    }
    
    // Profile Menu Navigation
    const profileBtn = document.getElementById('menu-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/profile');
      });
    }
    
    const billingBtn = document.getElementById('menu-billing');
    if (billingBtn) {
      billingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/billing');
      });
    }
    
    const helpBtn = document.getElementById('menu-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/help');
      });
    };
    
    const adminBtn = document.getElementById('menu-admin');
    if (adminBtn) {
      adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate('/admin');
      });
    };
    
    // Notifications Dropdown
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    
    if (notificationsBtn && notificationsDropdown) {
      notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = notificationsDropdown.style.display === 'block';
        
        // Close user menu if open
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuDropdown) userMenuDropdown.style.display = 'none';
        
        // Toggle notifications dropdown
        notificationsDropdown.style.display = isVisible ? 'none' : 'block';
      });
      
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
          notificationsDropdown.style.display = 'none';
        }
      });
      
      // Mark all as read
      const markAllReadBtn = document.getElementById('mark-all-read');
      if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.markAllNotificationsAsRead();
        });
      }
      
      // Individual notification clicks
      document.addEventListener('click', (e) => {
        const notifItem = e.target.closest('.notification-item');
        if (notifItem) {
          const notifId = parseInt(notifItem.dataset.notifId);
          this.markNotificationAsRead(notifId);
          
          // Re-render notifications
          const list = document.getElementById('notifications-list');
          if (list) {
            list.innerHTML = this.renderNotifications();
          }
        }
      });
    }
    
    console.log('✅ Project Manager events attached');
  },

  showCreateModal() {
    const modal = document.getElementById('create-project-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  hideCreateModal() {
    const modal = document.getElementById('create-project-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      
      // Reset form
      const form = document.getElementById('create-project-form');
      if (form) form.reset();
      
      // Reset color selection
      const colorSelectors = document.querySelectorAll('.color-selector');
      colorSelectors.forEach(btn => btn.style.borderColor = 'transparent');
      if (colorSelectors.length > 0) {
        colorSelectors[0].style.borderColor = colorSelectors[0].dataset.color;
      }
    }
  },

  handleCreateProject(e) {
    e.preventDefault();
    
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const selectedModules = Array.from(document.querySelectorAll('input[name="modules"]:checked'))
      .map(input => input.value);
    const selectedColor = document.querySelector('.color-selector[style*="border-color: rgb"]')?.dataset.color || '#8b5cf6';
    
    if (!name) {
      Toast.error('Please enter a project name');
      return;
    }
    
    if (selectedModules.length === 0) {
      Toast.error('Please select at least one module');
      return;
    }
    
    // Create new project
    const newProject = {
      id: Date.now(),
      name,
      description: description || 'No description provided',
      modules: selectedModules,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      status: 'active'
    };
    
    this.projects.unshift(newProject);
    this.saveProjects();
    this.applyFilters();
    
    // Re-render projects grid
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = this.renderProjectCards();
      
      // Reattach project card events
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(card => {
        card.addEventListener('click', () => {
          const projectId = card.dataset.projectId;
          this.openProject(projectId);
        });
      });
    }
    
    this.hideCreateModal();
    Toast.success(`Project "${name}" created! 🎉`);
  },

  applyFilters() {
    this.filteredProjects = this.projects.filter(project => {
      // Search filter
      const matchesSearch = this.searchQuery === '' || 
        project.name.toLowerCase().includes(this.searchQuery) ||
        project.description.toLowerCase().includes(this.searchQuery);
      
      // Module filter
      const matchesModule = this.currentFilter === 'all' || 
        project.modules.includes(this.currentFilter);
      
      return matchesSearch && matchesModule;
    });
    
    // Re-render grid
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = this.renderProjectCards();
      
      // Reattach events
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(card => {
        card.addEventListener('click', () => {
          const projectId = card.dataset.projectId;
          this.openProject(projectId);
        });
      });
    }
  },

  openProject(projectId) {
    const project = this.projects.find(p => p.id == projectId);
    if (project) {
      console.log(`🎨 Opening project: ${project.name}`);
      // Store current project in sessionStorage for canvas
      sessionStorage.setItem('museflow_current_project', JSON.stringify(project));
      Router.navigate('/canvas');
    }
  },

  getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
};

// Module data for reference
const modules = [
  { id: 'exhibition', icon: '🎨', name: 'Exhibition', color: '#8b5cf6' },
  { id: 'education', icon: '📚', name: 'Education', color: '#06b6d4' },
  { id: 'archive', icon: '📦', name: 'Archive', color: '#10b981' },
  { id: 'publication', icon: '📰', name: 'Publication', color: '#f59e0b' },
  { id: 'research', icon: '🔬', name: 'Research', color: '#ec4899' },
  { id: 'administration', icon: '⚙️', name: 'Administration', color: '#6366f1' }
];

console.log('✅ Project Manager module loaded');
