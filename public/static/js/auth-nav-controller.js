/**
 * Authentication-based Navigation Controller
 * Conditionally shows/hides navigation buttons based on login status
 * 
 * Usage: Include this script in pages that need auth-based navigation
 */

(function() {
    'use strict';
    
    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is logged in
     */
    function isAuthenticated() {
        // Check multiple auth indicators
        const hasAuthToken = localStorage.getItem('auth_token') !== null;
        const hasUserSession = localStorage.getItem('user_session') !== null;
        const hasUserId = localStorage.getItem('user_id') !== null;
        
        // Also check sessionStorage
        const hasSessionAuth = sessionStorage.getItem('isAuthenticated') === 'true';
        
        return hasAuthToken || hasUserSession || hasUserId || hasSessionAuth;
    }
    
    /**
     * Update navigation buttons based on auth status
     */
    function updateNavigationButtons() {
        const isLoggedIn = isAuthenticated();
        
        // Get all navigation containers
        const navContainers = document.querySelectorAll('.nav-links, .unified-nav-links');
        
        navContainers.forEach(navContainer => {
            // Find buttons
            const loginBtn = navContainer.querySelector('.nav-login-btn, [href*="login"]');
            const signupBtn = navContainer.querySelector('.nav-signup-btn, [href*="signup"]');
            const dashboardBtn = navContainer.querySelector('[href*="dashboard"]');
            const canvasBtn = navContainer.querySelector('[href*="canvas"]');
            const accountBtn = navContainer.querySelector('[href*="account"]');
            
            if (isLoggedIn) {
                // User is logged in - show app buttons, hide auth buttons
                if (loginBtn) loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';
                if (dashboardBtn) dashboardBtn.style.display = 'flex';
                if (canvasBtn) canvasBtn.style.display = 'flex';
                if (accountBtn) accountBtn.style.display = 'flex';
                
                // Add logout button if it doesn't exist
                addLogoutButton(navContainer);
            } else {
                // User is NOT logged in - show auth buttons, hide app buttons
                if (loginBtn) loginBtn.style.display = 'flex';
                if (signupBtn) signupBtn.style.display = 'flex';
                if (dashboardBtn) dashboardBtn.style.display = 'none';
                if (canvasBtn) canvasBtn.style.display = 'none';
                if (accountBtn) accountBtn.style.display = 'none';
                
                // Remove logout button if exists
                const logoutBtn = navContainer.querySelector('.nav-logout-btn');
                if (logoutBtn) logoutBtn.remove();
            }
        });
        
        console.log('🔐 Navigation updated. Logged in:', isLoggedIn);
    }
    
    /**
     * Add logout button to navigation
     * @param {HTMLElement} navContainer Navigation container element
     */
    function addLogoutButton(navContainer) {
        // Check if logout button already exists
        if (navContainer.querySelector('.nav-logout-btn')) {
            return;
        }
        
        // Create logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-login-btn nav-logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> 로그아웃';
        logoutBtn.style.display = 'flex';
        
        // Add logout handler
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
        
        // Append to navigation
        navContainer.appendChild(logoutBtn);
    }
    
    /**
     * Handle user logout
     */
    function handleLogout() {
        // Clear all auth-related storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        sessionStorage.removeItem('isAuthenticated');
        
        // Clear any other user data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('user_') || key.startsWith('auth_'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('🚪 User logged out');
        
        // Show confirmation
        alert('로그아웃 되었습니다.');
        
        // Redirect to home page
        window.location.href = '/';
    }
    
    /**
     * Initialize auth navigation controller
     */
    function init() {
        // Update navigation on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateNavigationButtons);
        } else {
            updateNavigationButtons();
        }
        
        // Listen for auth state changes
        window.addEventListener('storage', function(e) {
            if (e.key && (e.key.includes('auth') || e.key.includes('user'))) {
                updateNavigationButtons();
            }
        });
        
        // Listen for custom auth events
        window.addEventListener('authStateChanged', updateNavigationButtons);
    }
    
    // Initialize
    init();
    
    // Expose functions for external use
    window.AuthNavController = {
        isAuthenticated: isAuthenticated,
        updateNavigation: updateNavigationButtons,
        logout: handleLogout
    };
    
})();
