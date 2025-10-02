// ==================== AUTHENTICATION SYSTEM ====================

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupLoginForm();
        this.checkAuthStatus();
      });
    } else {
      this.setupLoginForm();
      this.checkAuthStatus();
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    console.log("[Auth] DOM readyState:", document.readyState);
    console.log("[Auth] Buscando inputs...");

    // Usar el formulario que disparó el submit para mayor robustez
    const form = event.currentTarget || document.getElementById("loginForm");

    // Obtener referencias a los inputs (por id, name o tipo)
    const emailInput =
      form?.querySelector('input[name="email"], #email, input[type="email"]') ||
      document.querySelector("#email") ||
      document.querySelector('input[name="email"]');
    const passwordInput =
      form?.querySelector(
        'input[name="password"], #password, input[type="password"]'
      ) ||
      document.querySelector("#password") ||
      document.querySelector('input[name="password"]');

    console.log("[Auth] Inputs encontrados:", {
      emailInput: !!emailInput,
      passwordInput: !!passwordInput,
    });

    console.log("[Auth] Email input element:", emailInput);
    console.log("[Auth] Password input element:", passwordInput);

    if (!emailInput || !passwordInput) {
      this.showError("Error: No se encontraron los campos del formulario");
      return;
    }

    // Obtener valores
    const email = emailInput.value?.trim() || "";
    const password = passwordInput.value || "";

    console.log("[Auth] Valores:", {
      emailLength: email.length,
      passwordLength: password.length,
      emailValue: email,
    });

    // Validación básica
    if (!email || !password) {
      this.showError("Por favor ingresa email y contraseña");
      return;
    }

    // Loading state
    const submitBtn =
      (form && form.querySelector('button[type="submit"]')) ||
      document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;

    try {
      // Llamar al backend
      const response = await window.apiService.login(email, password);

      // Guardar sesión localmente
      const sessionData = {
        email: response.usuario.email,
        rol: response.usuario.rol,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("adminSession", JSON.stringify(sessionData));

      // Success feedback
      this.showMessage("¡Inicio de sesión exitoso!", "success");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/admin/dashboard.html";
      }, 1000);
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";

      if (error instanceof window.ApiError) {
        if (error.isAuthError()) {
          errorMessage = "Credenciales incorrectas";
        } else if (error.isServerError()) {
          errorMessage = "Error del servidor. Intenta nuevamente.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "No se pudo conectar con el servidor";
      }

      this.showError(errorMessage);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async checkAuthStatus() {
    // If we're on login page, check if already authenticated
    if (window.location.pathname.includes("login.html")) {
      try {
        const response = await window.apiService.verifySession();
        if (response.isAuthenticated) {
          // Already authenticated, redirect to dashboard
          window.location.href = "/admin/dashboard.html";
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
      return;
    }

    // If we're on admin pages, verify authentication
    if (
      window.location.pathname.includes("/admin/") &&
      !window.location.pathname.includes("login.html")
    ) {
      try {
        console.log("[Auth] Verificando sesión...");
        const response = await window.apiService.verifySession();
        console.log("[Auth] Respuesta de verify:", response);

        if (!response.isAuthenticated) {
          console.error("[Auth] No autenticado según response");
          throw new Error("Not authenticated");
        }

        // Update local session
        const sessionData = {
          email: response.usuario.email,
          rol: response.usuario.rol,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));

        console.log("[Auth] Sesión válida:", sessionData);
        return sessionData;
      } catch (error) {
        // Not authenticated, redirect to login
        console.error("[Auth] Error verificando sesión:", error);
        this.logout();
      }
    }
  }

  getSession() {
    try {
      const sessionData = localStorage.getItem("adminSession");
      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } catch (error) {
      console.error("Error reading session:", error);
      this.logout();
      return null;
    }
  }

  async logout() {
    try {
      await window.apiService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("adminSession");
      if (
        window.location.pathname.includes("/admin/") &&
        !window.location.pathname.includes("login.html")
      ) {
        window.location.href = "/admin/auth/login.html";
      }
    }
  }

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";

      // Auto hide after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 5000);
    }
  }

  showMessage(message, type = "info") {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${
        type === "success" ? "check-circle" : "info-circle"
      }"></i>
      ${message}
    `;

    // Add toast styles if not exist
    if (!document.querySelector("#toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "toast-styles";
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
        .toast-error { border-left: 4px solid #0b64a1; }
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
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Method to get current user info
  getCurrentUser() {
    const session = this.getSession();
    return session
      ? {
          email: session.email,
          rol: session.rol,
          loginTime: session.loginTime,
        }
      : null;
  }
}

// Initialize auth manager when DOM is ready
let authManager;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    authManager = new AuthManager();
  });
} else {
  authManager = new AuthManager();
}

// Global auth functions
window.logout = () => authManager?.logout();
window.getCurrentUser = () => authManager?.getCurrentUser();
