// ==================== API CONFIGURATION ====================

class ApiConfig {
  constructor() {
    // Detectar ambiente automáticamente
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
  }

  detectEnvironment() {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }

    return 'production';
  }

  getConfig() {
    const configs = {
      development: {
        apiUrl: 'http://localhost:5015', // Backend API URL
        apiTimeout: 30000, // 30 segundos
        enableLogging: true
      },
      production: {
        apiUrl: 'https://api.origamiliquid.com', // Cambiar por tu URL de producción
        apiTimeout: 30000,
        enableLogging: false
      }
    };

    return configs[this.environment];
  }

  get apiUrl() {
    return this.config.apiUrl;
  }

  get apiTimeout() {
    return this.config.apiTimeout;
  }

  get enableLogging() {
    return this.config.enableLogging;
  }

  log(...args) {
    if (this.enableLogging) {
      console.log('[API]', ...args);
    }
  }

  error(...args) {
    if (this.enableLogging) {
      console.error('[API ERROR]', ...args);
    }
  }
}

// Exportar instancia global
window.apiConfig = new ApiConfig();