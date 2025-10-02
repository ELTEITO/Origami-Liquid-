// ==================== PRODUCTS CONTROLLER ====================

class ProductsController {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentFilter = {
      search: '',
      category: '',
      status: ''
    };
    this.productToDelete = null;

    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Wait for DOM elements to be available
    setTimeout(() => {
      // Search and filters
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.currentFilter.search = e.target.value;
          this.currentPage = 1;
          this.loadProducts();
        });
      }

      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
          this.currentFilter.category = e.target.value;
          this.currentPage = 1;
          this.loadProducts();
        });
      }

      const statusFilter = document.getElementById('statusFilter');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          this.currentFilter.status = e.target.value;
          this.currentPage = 1;
          this.loadProducts();
        });
      }

      // Load categories for filter dropdown
      this.loadCategoriesFilter();
    }, 100);

    // Global functions
    window.refreshProducts = () => this.loadProducts();
    window.editProduct = (id) => window.openProductModal(id);
    window.deleteProduct = (id) => this.deleteProduct(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();
  }


  async loadCategoriesFilter() {
    try {
      const raw = await window.apiService.getProducts();
      const products = Array.isArray(raw) ? raw : (raw?.items || []);
      const normalized = products.map(p => ({
        id: p.id ?? p.Id,
        marca: p.marca || p.Marca || '',
        modelo: p.modelo || p.Modelo || '',
        categoria: p.categoria || p.Categoria || '',
        imgBase64: p.img || p.Img || null
      }));
      const uniqueCategories = [...new Set(normalized.map(p => p.categoria))].filter(Boolean);

      const categoryFilter = document.getElementById('categoryFilter');

      if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        uniqueCategories.forEach(category => {
          const option = new Option(category, category);
          categoryFilter.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadProducts() {
    try {
      // Mostrar loading
      const tbody = document.getElementById('productsTableBody');
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p>Cargando productos...</p>
          </td>
        </tr>
      `;

      // Obtener productos del backend
      const raw = await window.apiService.getProducts();
      console.log('[Products] RAW:', raw);
      let products = Array.isArray(raw) ? raw : (raw?.items || []);

      // Normalizar campos
      products = products.map(p => ({
        id: p.id ?? p.Id,
        marca: p.marca || p.Marca || '',
        modelo: p.modelo || p.Modelo || '',
        categoria: p.categoria || p.Categoria || '',
        imagenUrl: (p.img || p.Img) ? `data:image/png;base64,${p.img || p.Img}` : ''
      }));
      console.log('[Products] NORMALIZED:', products.length, products);

      // Apply filters
      if (this.currentFilter.search) {
        const search = this.currentFilter.search.toLowerCase();
        products = products.filter(product =>
          (product.modelo || '').toLowerCase().includes(search) ||
          (product.marca || '').toLowerCase().includes(search)
        );
      }

      if (this.currentFilter.category) {
        products = products.filter(product => product.categoria === this.currentFilter.category);
      }

      // Sort by ID (newest first assuming incremental IDs)
      products.sort((a, b) => (b.id || 0) - (a.id || 0));

      // Calculate pagination
      const totalProducts = products.length;
      const totalPages = Math.ceil(totalProducts / this.itemsPerPage);
      console.log('[Products] total:', totalProducts, 'pages:', totalPages);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const paginatedProducts = products.slice(startIndex, endIndex);

      this.renderProducts(paginatedProducts);
      this.renderPagination(totalPages, totalProducts);

    } catch (error) {
      console.error('Error loading products:', error);

      const tbody = document.getElementById('productsTableBody');
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fa-solid fa-exclamation-circle"></i>
            <p>Error al cargar los productos</p>
            <button class="btn btn-primary" onclick="productsController.loadProducts()">
              <i class="fa-solid fa-refresh"></i> Reintentar
            </button>
          </td>
        </tr>
      `;

      this.showError('Error al cargar los productos');
    }
  }

  renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            <p>No se encontraron productos</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => {
      const categoryName = product.categoria || 'Sin categoría';
      const fechaCreacion = product.fechaCreacion || new Date().toISOString();

      return `
        <tr>
          <td>
            <div class="product-image">
              ${product.imagenUrl ?
                `<img src="${product.imagenUrl}" alt="${product.modelo}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="image-placeholder" style="display: none;">
                   <i class="fa-solid fa-image"></i>
                 </div>` :
                `<div class="image-placeholder">
                   <i class="fa-solid fa-image"></i>
                 </div>`
              }
            </div>
          </td>
          <td>
            <div class="product-info">
              <div class="product-name">${product.modelo}</div>
              <div class="product-details">${product.marca}</div>
            </div>
          </td>
          <td>
            <span class="category-badge">${categoryName}</span>
          </td>
         
          <td>
            <span class="status-badge status-active">
              Activo
            </span>
          </td>
          <td>
            <div class="date-info">
              <div>${new Date(fechaCreacion).toLocaleDateString()}</div>
              <div class="date-time">${new Date(fechaCreacion).toLocaleTimeString()}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-small btn-secondary" onclick="editProduct('${product.id}')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Add product table styles
    this.addProductTableStyles();
  }

  renderPagination(totalPages, totalProducts) {
    const pagination = document.getElementById('pagination');
    const productCount = document.getElementById('productCount');

    productCount.textContent = `${totalProducts} producto${totalProducts !== 1 ? 's' : ''}`;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="productsController.goToPage(${this.currentPage - 1})">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `
          <button class="btn btn-primary btn-small">${i}</button>
        `;
      } else if (i <= 2 || i >= totalPages - 1 || Math.abs(i - this.currentPage) <= 1) {
        paginationHTML += `
          <button class="btn btn-secondary btn-small" onclick="productsController.goToPage(${i})">${i}</button>
        `;
      } else if (i === 3 && this.currentPage > 4) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      } else if (i === totalPages - 2 && this.currentPage < totalPages - 3) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="productsController.goToPage(${this.currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
    }

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadProducts();
  }

  // Method to refresh products list from FormProducto component
  refreshProductsList() {
    this.loadProducts();
  }

  deleteProduct(productId) {
    this.productToDelete = productId;
    const modal = document.getElementById('deleteModal');
    modal.classList.add('active');
  }

  closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
    this.productToDelete = null;
  }

  async confirmDelete() {
    if (!this.productToDelete) return;

    // Loading state
    const confirmBtn = document.querySelector('#deleteModal .btn-danger');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';
    confirmBtn.disabled = true;

    try {
      await window.apiService.deleteProduct(this.productToDelete);
      this.showSuccess('Producto eliminado correctamente');
      this.closeDeleteModal();
      this.loadProducts();

    } catch (error) {
      console.error('Error deleting product:', error);

      let errorMessage = 'Error al eliminar el producto';
      if (error instanceof window.ApiError) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);
    } finally {
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
    }
  }

  getStatusLabel(status) {
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      draft: 'Borrador'
    };
    return labels[status] || status;
  }

  addProductTableStyles() {
    if (document.querySelector('#product-table-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'product-table-styles';
    styles.textContent = `
      .filters-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 1rem;
        align-items: end;
      }

      .product-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }

      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
      }

      .product-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .product-name {
        font-weight: 600;
        color: var(--text-color);
      }

      .product-details {
        font-size: 0.85rem;
        color: var(--text-muted-color);
      }

      .category-badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        border: 1px solid var(--border-color);
      }

      .price {
        font-weight: 600;
        color: var(--active-text-color);
        font-size: 1.1rem;
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .status-active {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      .status-inactive {
        background: rgba(158, 158, 158, 0.2);
        color: #9E9E9E;
        border: 1px solid rgba(158, 158, 158, 0.3);
      }

      .status-draft {
        background: rgba(255, 152, 0, 0.2);
        color: #FF9800;
        border: 1px solid rgba(255, 152, 0, 0.3);
      }

      .date-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .date-time {
        font-size: 0.8rem;
        color: var(--text-muted-color);
      }

      .table-container {
        overflow-x: auto;
        margin: 1rem 0;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 0;
      }

      .pagination-ellipsis {
        color: var(--text-muted-color);
        padding: 0 0.5rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted-color);
      }

      .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }

      .image-preview-container {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .no-image-placeholder {
        width: 200px;
        height: 150px;
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-muted-color);
        gap: 0.5rem;
      }

      .no-image-placeholder i {
        font-size: 2rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .filters-row {
          grid-template-columns: 1fr;
        }

        .admin-table {
          font-size: 0.85rem;
        }

        .product-image {
          width: 40px;
          height: 40px;
        }

        .table-actions {
          flex-direction: column;
          gap: 0.25rem;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      ${message}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize products controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.productsController = new ProductsController();
});