// ==================== API SERVICE WITH AXIOS ====================

class ApiService {
  constructor() {
    this.config = window.apiConfig;

    // Configurar instancia de axios
    this.axios = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.apiTimeout,
      withCredentials: true, // Incluir cookies
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  // ==================== INTERCEPTORS ====================

  setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        this.config.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.config.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        this.config.log(`Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        this.config.error('Response error:', error);

        if (error.response) {
          // Error con respuesta del servidor
          const apiError = new ApiError(
            error.response.data?.message || `HTTP Error ${error.response.status}`,
            error.response.status,
            error.response.data
          );

          // Si es error de autenticación, redirigir al login
          if (apiError.isAuthError() && !window.location.pathname.includes('login.html')) {
            this.handleAuthError();
          }

          return Promise.reject(apiError);
        } else if (error.request) {
          // Request enviado pero sin respuesta
          return Promise.reject(new ApiError('No response from server', 0));
        } else {
          // Error al configurar el request
          return Promise.reject(new ApiError(error.message, 0));
        }
      }
    );
  }

  handleAuthError() {
    localStorage.removeItem('adminSession');
    window.location.href = '../auth/login.html';
  }

  // ==================== AUTHENTICATION ====================

  async login(email, password) {
    const response = await this.axios.post('/Admin/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.axios.post('/Admin/logout');
    return response.data;
  }

  async verifySession() {
    const response = await this.axios.get('/Admin/verify');
    return response.data;
  }

  // ==================== PRODUCTS ====================

  async getProducts() {
    const response = await this.axios.get('/api/Producto');
    return response.data;
  }

  // ==================== MARCAS ====================
  async getBrands() {
    const response = await this.axios.get('/api/Marca');
    return response.data;
  }

  async getBrand(id) {
    const response = await this.axios.get(`/api/Marca/${id}`);
    return response.data;
  }

  async createBrand(data) {
    const response = await this.axios.post('/api/Marca', data);
    return response.data;
  }

  async updateBrand(id, data) {
    const response = await this.axios.put(`/api/Marca/${id}`, data);
    return response.data;
  }

  async deleteBrand(id) {
    const response = await this.axios.delete(`/api/Marca/${id}`);
    return response.data;
  }

  async getProduct(id) {
    const response = await this.axios.get(`/api/Producto/${id}`);
    return response.data;
  }

  async createProduct(productData) {
    const response = await this.axios.post('/api/Producto', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await this.axios.put(`/api/Producto/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await this.axios.delete(`/api/Producto/${id}`);
    return response.data;
  }

  // ==================== VARIANTS ====================

  async getVariants(productId) {
    const response = await this.axios.get(`/api/Producto/${productId}/variantes`);
    return response.data;
  }

  async getVariant(variantId) {
    const response = await this.axios.get(`/api/Producto/variante/${variantId}`);
    return response.data;
  }

  async createVariant(variantData) {
    const response = await this.axios.post('/api/Producto/variante', variantData);
    return response.data;
  }

  async updateVariant(variantId, variantData) {
    const response = await this.axios.put(`/api/Producto/variante/${variantId}`, variantData);
    return response.data;
  }

  async deleteVariant(variantId) {
    const response = await this.axios.delete(`/api/Producto/variante/${variantId}`);
    return response.data;
  }

  // ==================== VARIANT OPTIONS ====================

  async getRamOptions(productId) {
    const response = await this.axios.get(`/api/Producto/${productId}/Ram-Opciones`);
    return response.data;
  }

  async getStorageOptions(productId, ram) {
    const response = await this.axios.get(`/api/Producto/${productId}/Almacenamiento-Opciones`, {
      params: { ram }
    });
    return response.data;
  }

  async getColorOptions(productId, ram, storage) {
    const response = await this.axios.get(`/api/Producto/${productId}/Color-Opciones`, {
      params: { ram, almacenamiento: storage }
    });
    return response.data;
  }

  async getVariantBySpec(productId, ram, storage, color) {
    const response = await this.axios.get(`/api/Producto/${productId}/variante`, {
      params: { ram, storage, color }
    });
    return response.data;
  }

  // ==================== CATEGORIES ====================
  async getCategories() {
    const response = await this.axios.get('/api/Categoria');
    return response.data;
  }

  async getCategory(id) {
    const response = await this.axios.get(`/api/Categoria/${id}`);
    return response.data;
  }

  async createCategory(data) {
    const response = await this.axios.post('/api/Categoria', data);
    return response.data;
  }

  async updateCategory(id, data) {
    const response = await this.axios.put(`/api/Categoria/${id}`, data);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await this.axios.delete(`/api/Categoria/${id}`);
    return response.data;
  }
}

// ==================== CUSTOM ERROR CLASS ====================

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  isNotFound() {
    return this.status === 404;
  }

  isValidationError() {
    return this.status === 400;
  }

  isServerError() {
    return this.status >= 500;
  }
}

// ==================== EXPORT ====================

window.ApiService = ApiService;
window.ApiError = ApiError;
window.apiService = new ApiService();