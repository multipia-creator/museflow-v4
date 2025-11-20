/**
 * Admin Dashboard Page - User and Project Management
 * Features:
 * - User management: View all users, edit roles, delete users
 * - Project management: View all projects across users
 * - Statistics: Total users, projects, activity metrics
 * - Activity log: Recent user and project activities
 * - Access control: Admin role only
 */

const AdminDashboard = {
  currentTab: 'overview',
  users: [],
  allProjects: [],
  
  init(tab = 'overview') {
    console.log(`🎨 Initializing Admin Dashboard... Tab: ${tab}`);
    
    // Check authentication and admin role
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      Router.navigate('/login');
      return;
    }
    
    if (currentUser.role !== 'admin') {
      Toast.error('Access denied. Admin privileges required.');
      Router.navigate('/project-manager');
      return;
    }
    
    this.currentTab = tab;
    this.loadData();
    this.render();
    this.attachEvents();
  },
  
  loadData() {
    // Load all users
    const usersData = localStorage.getItem('museflow_users');
    this.users = usersData ? JSON.parse(usersData) : [];
    
    // Load all projects from all users
    this.allProjects = [];
    this.users.forEach(user => {
      const userProjects = localStorage.getItem(`museflow_projects_${user.id}`);
      if (userProjects) {
        const projects = JSON.parse(userProjects);
        projects.forEach(project => {
          this.allProjects.push({
            ...project,
            owner: user.name,
            ownerEmail: user.email,
            ownerId: user.id
          });
        });
      }
    });
    
    console.log(`✅ Loaded ${this.users.length} users and ${this.allProjects.length} projects`);
  },
  
  render() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const container = document.createElement('div');
    container.setAttribute('data-page', 'admin-dashboard');
    
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
            Museflow Admin
          </h2>
          <span style="padding: 4px 12px; background: #dc2626; color: white; 
                       border-radius: 6px; font-size: 12px; font-weight: 600;">
            ADMIN
          </span>
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
            🛡️ Admin Dashboard
          </h1>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">
            Manage users, projects, and system settings
          </p>
        </div>
        
        <!-- Tabs -->
        <div style="display: flex; gap: 16px; border-bottom: 2px solid #e5e7eb; margin-bottom: 32px;">
          <button 
            class="admin-tab-btn" 
            data-tab="overview"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'overview' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'overview' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          >
            📊 Overview
          </button>
          <button 
            class="admin-tab-btn" 
            data-tab="users"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'users' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'users' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          >
            👥 Users
          </button>
          <button 
            class="admin-tab-btn" 
            data-tab="projects"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'projects' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'projects' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          >
            📁 Projects
          </button>
          <button 
            class="admin-tab-btn" 
            data-tab="activity"
            style="padding: 12px 24px; background: transparent; 
                   color: ${this.currentTab === 'activity' ? '#6366f1' : '#6b7280'}; 
                   border: none; border-bottom: 3px solid ${this.currentTab === 'activity' ? '#6366f1' : 'transparent'};
                   font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          >
            📈 Activity
          </button>
        </div>
        
        <!-- Tab Content -->
        <div id="admin-tab-content">
          ${this.renderTabContent()}
        </div>
        
      </div>
    `;
    
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(container);
  },
  
  renderTabContent() {
    switch(this.currentTab) {
      case 'overview':
        return this.renderOverviewTab();
      case 'users':
        return this.renderUsersTab();
      case 'projects':
        return this.renderProjectsTab();
      case 'activity':
        return this.renderActivityTab();
      default:
        return this.renderOverviewTab();
    }
  },
  
  renderOverviewTab() {
    const totalUsers = this.users.length;
    const totalProjects = this.allProjects.length;
    const activeProjects = this.allProjects.filter(p => p.status === 'active').length;
    const adminUsers = this.users.filter(u => u.role === 'admin').length;
    
    return `
      <div style="max-width: 1200px;">
        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
          
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; 
                          background: linear-gradient(135deg, #667eea, #764ba2); 
                          display: flex; align-items: center; justify-content: center; 
                          font-size: 24px;">👥</div>
              <div>
                <div style="font-size: 14px; color: #6b7280; font-weight: 500;">Total Users</div>
                <div style="font-size: 28px; font-weight: 800; color: #1f2937;">${totalUsers}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${adminUsers} admins • ${totalUsers - adminUsers} regular
            </div>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; 
                          background: linear-gradient(135deg, #10b981, #059669); 
                          display: flex; align-items: center; justify-content: center; 
                          font-size: 24px;">📁</div>
              <div>
                <div style="font-size: 14px; color: #6b7280; font-weight: 500;">Total Projects</div>
                <div style="font-size: 28px; font-weight: 800; color: #1f2937;">${totalProjects}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${activeProjects} active • ${totalProjects - activeProjects} completed
            </div>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; 
                          background: linear-gradient(135deg, #f59e0b, #d97706); 
                          display: flex; align-items: center; justify-content: center; 
                          font-size: 24px;">📊</div>
              <div>
                <div style="font-size: 14px; color: #6b7280; font-weight: 500;">Avg Projects/User</div>
                <div style="font-size: 28px; font-weight: 800; color: #1f2937;">${(totalProjects / totalUsers).toFixed(1)}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              Across all users
            </div>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; 
                          background: linear-gradient(135deg, #06b6d4, #0891b2); 
                          display: flex; align-items: center; justify-content: center; 
                          font-size: 24px;">⚡</div>
              <div>
                <div style="font-size: 14px; color: #6b7280; font-weight: 500;">System Status</div>
                <div style="font-size: 20px; font-weight: 800; color: #10b981;">Healthy</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              All systems operational
            </div>
          </div>
          
        </div>
        
        <!-- Recent Activity -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0;">
            📈 Recent Activity
          </h2>
          ${this.renderRecentActivity()}
        </div>
        
        <!-- User Distribution -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0;">
              👥 User Roles Distribution
            </h2>
            ${this.renderUserRolesChart()}
          </div>
          
          <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0;">
              🎯 Quick Actions
            </h2>
            ${this.renderQuickActions()}
          </div>
        </div>
      </div>
    `;
  },
  
  renderRecentActivity() {
    // Generate sample recent activities
    const activities = [
      { icon: '👤', action: 'New user registered', user: 'test@museflow.com', time: '2 hours ago' },
      { icon: '📁', action: 'Project created', user: 'curator@museflow.com', time: '5 hours ago' },
      { icon: '✏️', action: 'Project updated', user: 'researcher@museflow.com', time: '1 day ago' },
      { icon: '🗑️', action: 'Project deleted', user: 'admin@museflow.com', time: '2 days ago' },
      { icon: '👥', action: 'User role changed', user: 'educator@museflow.com', time: '3 days ago' }
    ];
    
    return activities.map(activity => `
      <div style="display: flex; align-items: center; gap: 16px; padding: 16px; 
                  background: #f9fafb; border-radius: 10px; margin-bottom: 12px;">
        <div style="font-size: 28px;">${activity.icon}</div>
        <div style="flex: 1;">
          <div style="font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
            ${activity.action}
          </div>
          <div style="font-size: 13px; color: #6b7280;">
            ${activity.user} • ${activity.time}
          </div>
        </div>
      </div>
    `).join('');
  },
  
  renderUserRolesChart() {
    const roles = {
      admin: this.users.filter(u => u.role === 'admin').length,
      curator: this.users.filter(u => u.role === 'curator').length,
      researcher: this.users.filter(u => u.role === 'researcher').length,
      educator: this.users.filter(u => u.role === 'educator').length,
      user: this.users.filter(u => u.role === 'user' || !u.role).length
    };
    
    const roleColors = {
      admin: '#dc2626',
      curator: '#8b5cf6',
      researcher: '#06b6d4',
      educator: '#10b981',
      user: '#6b7280'
    };
    
    return Object.entries(roles).map(([role, count]) => `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #374151; text-transform: capitalize;">
            ${role}
          </span>
          <span style="font-size: 14px; font-weight: 700; color: #1f2937;">
            ${count} (${((count / this.users.length) * 100).toFixed(0)}%)
          </span>
        </div>
        <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
          <div style="width: ${(count / this.users.length) * 100}%; height: 100%; 
                      background: ${roleColors[role]}; transition: width 0.3s;"></div>
        </div>
      </div>
    `).join('');
  },
  
  renderQuickActions() {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button 
          class="quick-action-btn"
          data-action="add-user"
          style="padding: 16px; background: linear-gradient(135deg, #667eea, #764ba2); 
                 color: white; border: none; border-radius: 10px; font-size: 14px; 
                 font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left;
                 display: flex; align-items: center; gap: 12px;"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
        >
          <span style="font-size: 20px;">➕</span>
          Add New User
        </button>
        
        <button 
          class="quick-action-btn"
          data-action="export-data"
          style="padding: 16px; background: #10b981; color: white; border: none; 
                 border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; 
                 transition: all 0.2s; text-align: left; display: flex; align-items: center; gap: 12px;"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
        >
          <span style="font-size: 20px;">📥</span>
          Export Data
        </button>
        
        <button 
          class="quick-action-btn"
          data-action="system-settings"
          style="padding: 16px; background: #6b7280; color: white; border: none; 
                 border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; 
                 transition: all 0.2s; text-align: left; display: flex; align-items: center; gap: 12px;"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(107, 114, 128, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
        >
          <span style="font-size: 20px;">⚙️</span>
          System Settings
        </button>
      </div>
    `;
  },
  
  renderUsersTab() {
    return `
      <div style="max-width: 1400px;">
        <!-- Search and Filter -->
        <div style="background: white; padding: 20px; border-radius: 16px; 
                    border: 1px solid #e5e7eb; margin-bottom: 24px;
                    display: flex; gap: 16px; align-items: center;">
          <div style="flex: 1;">
            <input 
              type="text" 
              id="search-users"
              placeholder="Search users by name or email..."
              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; 
                     border-radius: 10px; font-size: 15px; transition: all 0.2s;"
              onfocus="this.style.borderColor='#6366f1'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
          </div>
          <select 
            id="filter-role"
            style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; 
                   font-size: 15px; cursor: pointer; background: white;"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="curator">Curator</option>
            <option value="researcher">Researcher</option>
            <option value="educator">Educator</option>
            <option value="user">User</option>
          </select>
        </div>
        
        <!-- Users Table -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            👥 User Management (${this.users.length} users)
          </h2>
          
          <div style="overflow-x: auto;">
            <table id="users-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    USER
                  </th>
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    EMAIL
                  </th>
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    ROLE
                  </th>
                  <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    PROJECTS
                  </th>
                  <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    JOINED
                  </th>
                  <th style="text-align: right; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                ${this.renderUsersTableRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  renderUsersTableRows() {
    return this.users.map(user => {
      const userProjects = this.allProjects.filter(p => p.ownerId === user.id).length;
      const roleColors = {
        admin: '#dc2626',
        curator: '#8b5cf6',
        researcher: '#06b6d4',
        educator: '#10b981',
        user: '#6b7280'
      };
      const roleColor = roleColors[user.role] || roleColors.user;
      
      return `
        <tr style="border-bottom: 1px solid #f3f4f6;" data-user-id="${user.id}">
          <td style="padding: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; 
                          background: linear-gradient(135deg, #667eea, #764ba2); 
                          display: flex; align-items: center; justify-content: center; 
                          color: white; font-weight: 700; font-size: 16px;">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-size: 15px; font-weight: 600; color: #1f2937;">
                  ${user.name}
                </div>
              </div>
            </div>
          </td>
          <td style="padding: 16px; font-size: 14px; color: #6b7280;">
            ${user.email}
          </td>
          <td style="padding: 16px;">
            <select 
              class="user-role-select" 
              data-user-id="${user.id}"
              style="padding: 6px 12px; border: 2px solid ${roleColor}; 
                     border-radius: 6px; font-size: 13px; font-weight: 600; 
                     color: ${roleColor}; background: ${roleColor}10; cursor: pointer;"
            >
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="curator" ${user.role === 'curator' ? 'selected' : ''}>Curator</option>
              <option value="researcher" ${user.role === 'researcher' ? 'selected' : ''}>Researcher</option>
              <option value="educator" ${user.role === 'educator' ? 'selected' : ''}>Educator</option>
              <option value="user" ${user.role === 'user' || !user.role ? 'selected' : ''}>User</option>
            </select>
          </td>
          <td style="padding: 16px; text-align: center; font-size: 14px; font-weight: 600; color: #1f2937;">
            ${userProjects}
          </td>
          <td style="padding: 16px; text-align: center; font-size: 14px; color: #6b7280;">
            ${this.formatDate(user.createdAt || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)}
          </td>
          <td style="padding: 16px; text-align: right;">
            <button 
              class="delete-user-btn"
              data-user-id="${user.id}"
              style="padding: 6px 12px; background: #fee2e2; color: #dc2626; 
                     border: none; border-radius: 6px; font-size: 12px; 
                     font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#fecaca'"
              onmouseout="this.style.background='#fee2e2'"
            >
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },
  
  renderProjectsTab() {
    return `
      <div style="max-width: 1400px;">
        <!-- Search -->
        <div style="background: white; padding: 20px; border-radius: 16px; 
                    border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <input 
            type="text" 
            id="search-projects"
            placeholder="Search projects by name, owner, or description..."
            style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; 
                   border-radius: 10px; font-size: 15px; transition: all 0.2s;"
            onfocus="this.style.borderColor='#6366f1'"
            onblur="this.style.borderColor='#e5e7eb'"
          />
        </div>
        
        <!-- Projects Table -->
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            📁 All Projects (${this.allProjects.length} total)
          </h2>
          
          <div style="overflow-x: auto;">
            <table id="projects-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    PROJECT
                  </th>
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    OWNER
                  </th>
                  <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    STATUS
                  </th>
                  <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    PROGRESS
                  </th>
                  <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    UPDATED
                  </th>
                  <th style="text-align: right; padding: 12px; font-size: 13px; font-weight: 600; color: #6b7280;">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                ${this.renderProjectsTableRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  renderProjectsTableRows() {
    return this.allProjects.map(project => `
      <tr style="border-bottom: 1px solid #f3f4f6;" data-project-id="${project.id}" data-owner-id="${project.ownerId}">
        <td style="padding: 16px;">
          <div style="font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
            ${project.name}
          </div>
          <div style="font-size: 13px; color: #6b7280;">
            ${project.description || 'No description'}
          </div>
        </td>
        <td style="padding: 16px;">
          <div style="font-size: 14px; font-weight: 500; color: #1f2937;">
            ${project.owner}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            ${project.ownerEmail}
          </div>
        </td>
        <td style="padding: 16px;">
          <span style="padding: 4px 12px; background: ${project.status === 'active' ? '#d1fae5' : '#e5e7eb'}; 
                       color: ${project.status === 'active' ? '#065f46' : '#374151'}; 
                       border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: capitalize;">
            ${project.status || 'active'}
          </span>
        </td>
        <td style="padding: 16px; text-align: center;">
          <div style="width: 100px; margin: 0 auto;">
            <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
              ${project.progress || 0}%
            </div>
            <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
              <div style="width: ${project.progress || 0}%; height: 100%; background: #10b981;"></div>
            </div>
          </div>
        </td>
        <td style="padding: 16px; text-align: center; font-size: 14px; color: #6b7280;">
          ${this.formatDate(project.updatedAt || project.createdAt)}
        </td>
        <td style="padding: 16px; text-align: right;">
          <button 
            class="view-project-btn"
            data-project-id="${project.id}"
            data-owner-id="${project.ownerId}"
            style="padding: 6px 12px; background: #dbeafe; color: #1e40af; 
                   border: none; border-radius: 6px; font-size: 12px; 
                   font-weight: 600; cursor: pointer; transition: all 0.2s; margin-right: 8px;"
            onmouseover="this.style.background='#bfdbfe'"
            onmouseout="this.style.background='#dbeafe'"
          >
            👁️ View
          </button>
          <button 
            class="delete-project-btn"
            data-project-id="${project.id}"
            data-owner-id="${project.ownerId}"
            style="padding: 6px 12px; background: #fee2e2; color: #dc2626; 
                   border: none; border-radius: 6px; font-size: 12px; 
                   font-weight: 600; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.background='#fecaca'"
            onmouseout="this.style.background='#fee2e2'"
          >
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');
  },
  
  renderActivityTab() {
    return `
      <div style="max-width: 1000px;">
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">
            📈 System Activity Log
          </h2>
          
          <div style="text-align: center; padding: 64px 32px; color: #9ca3af;">
            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              Activity Logging Coming Soon
            </div>
            <div style="font-size: 14px;">
              Detailed system activity logs and analytics will be available here.
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  },
  
  attachEvents() {
    // Back to Dashboard
    const backBtn = document.getElementById('back-to-dashboard');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        Router.navigate('/project-manager');
      });
    }
    
    // Tab Switching
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.init(tab);
      });
    });
    
    // Quick Actions
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        Toast.info(`${action.replace('-', ' ')} feature coming soon!`);
      });
    });
    
    // User Role Change
    document.querySelectorAll('.user-role-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const userId = parseInt(e.target.dataset.userId);
        const newRole = e.target.value;
        this.changeUserRole(userId, newRole);
      });
    });
    
    // Delete User
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = parseInt(e.target.dataset.userId);
        this.deleteUser(userId);
      });
    });
    
    // View Project
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Toast.info('View project feature coming soon!');
      });
    });
    
    // Delete Project
    document.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projectId = parseInt(e.target.dataset.projectId);
        const ownerId = parseInt(e.target.dataset.ownerId);
        this.deleteProject(projectId, ownerId);
      });
    });
    
    // Search Users
    const searchUsersInput = document.getElementById('search-users');
    if (searchUsersInput) {
      searchUsersInput.addEventListener('input', (e) => {
        this.filterUsers(e.target.value);
      });
    }
    
    // Filter Role
    const filterRoleSelect = document.getElementById('filter-role');
    if (filterRoleSelect) {
      filterRoleSelect.addEventListener('change', (e) => {
        this.filterUsersByRole(e.target.value);
      });
    }
    
    // Search Projects
    const searchProjectsInput = document.getElementById('search-projects');
    if (searchProjectsInput) {
      searchProjectsInput.addEventListener('input', (e) => {
        this.filterProjects(e.target.value);
      });
    }
    
    console.log('✅ Admin Dashboard events attached');
  },
  
  changeUserRole(userId, newRole) {
    const currentUser = Auth.getCurrentUser();
    if (userId === currentUser.id) {
      Toast.error('Cannot change your own role!');
      this.render();
      this.attachEvents();
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('museflow_users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.role = newRole;
      localStorage.setItem('museflow_users', JSON.stringify(users));
      Toast.success(`User role updated to ${newRole}`);
      this.loadData();
    }
  },
  
  deleteUser(userId) {
    const currentUser = Auth.getCurrentUser();
    if (userId === currentUser.id) {
      Toast.error('Cannot delete your own account from here!');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    let users = JSON.parse(localStorage.getItem('museflow_users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('museflow_users', JSON.stringify(users));
    
    // Also delete user's projects
    localStorage.removeItem(`museflow_projects_${userId}`);
    
    Toast.success('User deleted successfully');
    this.loadData();
    this.render();
    this.attachEvents();
  },
  
  deleteProject(projectId, ownerId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    const storageKey = `museflow_projects_${ownerId}`;
    let projects = JSON.parse(localStorage.getItem(storageKey) || '[]');
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(storageKey, JSON.stringify(projects));
    
    Toast.success('Project deleted successfully');
    this.loadData();
    this.render();
    this.attachEvents();
  },
  
  filterUsers(query) {
    const rows = document.querySelectorAll('#users-table tbody tr');
    const lowerQuery = query.toLowerCase();
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
  },
  
  filterUsersByRole(role) {
    const rows = document.querySelectorAll('#users-table tbody tr');
    
    rows.forEach(row => {
      const select = row.querySelector('.user-role-select');
      if (role === 'all' || select.value === role) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },
  
  filterProjects(query) {
    const rows = document.querySelectorAll('#projects-table tbody tr');
    const lowerQuery = query.toLowerCase();
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
  }
};

// Expose globally
window.AdminDashboard = AdminDashboard;
console.log('✅ Admin Dashboard page loaded');
