// ==================== AUTHENTICATION SYSTEM ====================

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    // Admin credentials (en producción esto vendría de una API)
    this.adminCredentials = {
      username: 'admin',
      password: 'origami2025'
    };

    this.setupLoginForm();
    this.checkAuthStatus();
  }

  setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get('username').trim();
    const password = formData.get('password');

    // Loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (this.validateCredentials(username, password)) {
        // Create session
        const sessionData = {
          username: username,
          loginTime: new Date().toISOString(),
          token: this.generateToken(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));

        // Success feedback
        this.showMessage('¡Inicio de sesión exitoso!', 'success');

        // Redirect to dashboard - handle both paths
        setTimeout(() => {
          if (window.location.pathname.includes('/auth/')) {
            window.location.href = '../admin/dashboard.html';
          } else {
            window.location.href = '/admin/dashboard.html';
          }
        }, 1000);

      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  validateCredentials(username, password) {
    return username === this.adminCredentials.username &&
           password === this.adminCredentials.password;
  }

  generateToken() {
    return 'admin_' + Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
  }

  checkAuthStatus() {
    const session = this.getSession();

    // If we're on login page and already authenticated, redirect to dashboard
    if (session && window.location.pathname.includes('login.html')) {
      if (window.location.pathname.includes('/auth/')) {
        window.location.href = '../admin/dashboard.html';
      } else {
        window.location.href = '/admin/dashboard.html';
      }
      return;
    }

    // If we're on admin pages and not authenticated, redirect to login
    if (!session && window.location.pathname.includes('/admin/') &&
        !window.location.pathname.includes('login.html')) {
      window.location.href = '../auth/login.html';
      return;
    }

    return session;
  }

  getSession() {
    try {
      const sessionData = localStorage.getItem('adminSession');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('adminSession');
    if (window.location.pathname.includes('/admin/') &&
        !window.location.pathname.includes('login.html')) {
      window.location.href = '/admin/login.html';
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';

      // Auto hide after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      ${message}
    `;

    // Add toast styles if not exist
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1rem 1.5rem;
          color: white;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideIn 0.3s ease;
        }
        .toast-success { border-left: 4px solid #4caf50; }
        .toast-error { border-left: 4px solid #f44336; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Method to get current user info
  getCurrentUser() {
    const session = this.getSession();
    return session ? {
      username: session.username,
      loginTime: session.loginTime
    } : null;
  }

  // Method to extend session
  extendSession() {
    const session = this.getSession();
    if (session) {
      session.expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('adminSession', JSON.stringify(session));
    }
  }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global auth functions
window.logout = () => authManager.logout();
window.getCurrentUser = () => authManager.getCurrentUser();
window.extendSession = () => authManager.extendSession();

// Activity tracking to extend session
let activityTimer;
function resetActivityTimer() {
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    authManager.extendSession();
  }, 60000); // Extend session every minute of activity
}

// Listen for user activity
if (typeof window !== 'undefined') {
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
  });
}