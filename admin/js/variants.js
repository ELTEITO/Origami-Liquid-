// ==================== VARIANTS CONTROLLER ====================

class VariantsController {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentFilter = {
      product: '',
      type: '',
      search: ''
    };
    this.variantToDelete = null;
    // Flags para enlaces idempotentes del modal cargado dinámicamente
    this.formBound = false;
    this.typeFieldsBound = false;
    this.previewBound = false;

    this.init();
  }

  init() {
    this.loadProducts();
    this.loadVariants();
    this.setupEventListeners();
    this.setupVariantTypeFields();
    this.setupPreviewUpdates();
  }

  setupEventListeners() {
    // Filters
    document.getElementById('productFilter').addEventListener('change', (e) => {
      this.currentFilter.product = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    document.getElementById('typeFilter').addEventListener('change', (e) => {
      this.currentFilter.type = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.currentFilter.search = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    // Variant form (puede no existir aún si el componente se carga por fetch)
    this.bindFormHandlers();

    // Global functions
    window.refreshVariants = () => this.loadVariants();
    window.openVariantModal = (id = null) => this.openVariantModal(id);
    window.closeVariantModal = () => this.closeVariantModal();
    window.editVariant = (id) => this.openVariantModal(id);
    window.deleteVariant = (id) => this.deleteVariant(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();
  }

  bindFormHandlers() {
    const form = document.getElementById('variantForm');
    if (form && !this.formBound) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveVariant();
      });
      this.formBound = true;
    }
  }

  setupVariantTypeFields() {
    const typeSelect = document.getElementById('variantType');
    const colorFields = document.getElementById('colorFields');
    if (!typeSelect || !colorFields || this.typeFieldsBound) return;

    typeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      colorFields.style.display = (type === 'color') ? 'block' : 'none';
      this.updatePreview();
    });
    this.typeFieldsBound = true;
  }

  setupPreviewUpdates() {
    // Color picker synchronization
    const colorPicker = document.getElementById('variantColorHex');
    const colorText = document.getElementById('variantColorText');
    if (!colorPicker || !colorText || this.previewBound) return;

    colorPicker.addEventListener('input', (e) => {
      colorText.value = e.target.value;
      this.updatePreview();
    });

    colorText.addEventListener('input', (e) => {
      const color = e.target.value;
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        colorPicker.value = color;
      }
      this.updatePreview();
    });

    // Other preview updates
    ['variantName', 'variantType', 'variantImage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updatePreview());
      }
    });

    this.previewBound = true;
  }

  updatePreview() {
    const type = document.getElementById('variantType').value;
    const name = document.getElementById('variantName').value;
    const colorHex = document.getElementById('variantColorHex').value;
    const image = document.getElementById('variantImage').value;

    const previewColor = document.getElementById('previewColor');
    const previewText = document.getElementById('previewText');
    const previewImage = document.getElementById('previewImage');

    // Reset preview
    previewColor.style.display = 'none';
    previewImage.style.display = 'none';
    previewText.textContent = name || 'Sin vista previa';

    if (type === 'color' && colorHex) {
      previewColor.style.backgroundColor = colorHex;
      previewColor.style.display = 'block';
      previewText.textContent = `${name} (${colorHex})`;
    }

    if (image) {
      previewImage.src = image;
      previewImage.style.display = 'block';
      previewImage.onerror = () => {
        previewImage.style.display = 'none';
      };
    }
  }

  loadProducts() {
    const products = storageManager.getProducts();

    // Populate product filter
    const productFilter = document.getElementById('productFilter');
    productFilter.innerHTML = '<option value="">Todos los productos</option>';

    // Populate variant form product select
    const variantProduct = document.getElementById('variantProduct');
    variantProduct.innerHTML = '<option value="">Seleccionar producto</option>';

    products.forEach(product => {
      const option1 = new Option(`${product.name} (${product.brand} ${product.model})`, product.id);
      const option2 = new Option(`${product.name} (${product.brand} ${product.model})`, product.id);
      productFilter.appendChild(option1);
      variantProduct.appendChild(option2);
    });
  }

  loadVariants() {
    try {
      let variants = storageManager.getVariants();
      const products = storageManager.getProducts();

      // Apply filters
      if (this.currentFilter.product) {
        variants = variants.filter(variant => variant.productId === this.currentFilter.product);
      }

      if (this.currentFilter.type) {
        variants = variants.filter(variant => variant.type === this.currentFilter.type);
      }

      if (this.currentFilter.search) {
        const search = this.currentFilter.search.toLowerCase();
        variants = variants.filter(variant =>
          variant.name.toLowerCase().includes(search) ||
          variant.value.toLowerCase().includes(search)
        );
      }

      // Sort by product name, then by sort order, then by creation date
      variants.sort((a, b) => {
        const productA = products.find(p => p.id === a.productId);
        const productB = products.find(p => p.id === b.productId);

        if (productA && productB && productA.name !== productB.name) {
          return productA.name.localeCompare(productB.name);
        }

        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Calculate pagination
      const totalVariants = variants.length;
      const totalPages = Math.ceil(totalVariants / this.itemsPerPage);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const paginatedVariants = variants.slice(startIndex, endIndex);

      this.renderVariants(paginatedVariants);
      this.renderPagination(totalPages, totalVariants);

    } catch (error) {
      console.error('Error loading variants:', error);
      this.showError('Error al cargar las variantes');
    }
  }

  renderVariants(variants) {
    const tbody = document.getElementById('variantsTableBody');
    const products = storageManager.getProducts();

    if (variants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <i class="fa-solid fa-palette"></i>
            <p>No se encontraron variantes</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = variants.map(variant => {
      const product = products.find(p => p.id === variant.productId);
      const productName = product ? `${product.name}` : 'Producto eliminado';

      return `
        <tr>
          <td>
            <div class="product-info">
              <div class="product-name">${productName}</div>
              ${product ? `<div class="product-details">${product.brand} ${product.model}</div>` : ''}
            </div>
          </td>
          <td>
            <span class="type-badge type-${variant.type}">
              ${this.getTypeLabel(variant.type)}
            </span>
          </td>
          <td>
            <strong>${variant.name}</strong>
          </td>
          <td>
            <code class="variant-value">${variant.value}</code>
          </td>
          <td>
            <span class="price-adjustment ${variant.priceAdjustment >= 0 ? 'positive' : 'negative'}">
              ${variant.priceAdjustment >= 0 ? '+' : ''}$${variant.priceAdjustment.toLocaleString()}
            </span>
          </td>
          <td>
            <div class="variant-preview-cell">
              ${this.renderVariantPreview(variant)}
            </div>
          </td>
          <td>
            <div class="date-info">
              <div>${new Date(variant.createdAt).toLocaleDateString()}</div>
              <div class="date-time">${new Date(variant.createdAt).toLocaleTimeString()}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-small btn-secondary" onclick="editVariant('${variant.id}')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteVariant('${variant.id}')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.addVariantTableStyles();
  }

  renderVariantPreview(variant) {
    let preview = '';

    if (variant.type === 'color' && variant.colorHex) {
      preview += `<div class="color-swatch" style="background-color: ${variant.colorHex}" title="${variant.colorHex}"></div>`;
    }

    if (variant.image) {
      preview += `<img src="${variant.image}" alt="${variant.name}" class="variant-image" onerror="this.style.display='none'">`;
    }

    if (!preview) {
      preview = `<span class="no-preview">${variant.name}</span>`;
    }

    return preview;
  }

  renderPagination(totalPages, totalVariants) {
    const pagination = document.getElementById('pagination');
    const variantCount = document.getElementById('variantCount');

    variantCount.textContent = `${totalVariants} variante${totalVariants !== 1 ? 's' : ''}`;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="variantsController.goToPage(${this.currentPage - 1})">
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
          <button class="btn btn-secondary btn-small" onclick="variantsController.goToPage(${i})">${i}</button>
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
        <button class="btn btn-secondary btn-small" onclick="variantsController.goToPage(${this.currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
    }

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadVariants();
  }

  openVariantModal(variantId = null) {
    const modal = document.getElementById('variantModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('variantForm');

    // Asegurar enlaces del modal cargado dinámicamente
    this.bindFormHandlers();
    this.setupVariantTypeFields();
    this.setupPreviewUpdates();
    this.loadProducts();

    if (variantId) {
      // Edit mode
      const variant = storageManager.getVariant(variantId);
      if (!variant) {
        this.showError('Variante no encontrada');
        return;
      }

      modalTitle.textContent = 'Editar Variante';
      document.getElementById('variantId').value = variant.id;
      document.getElementById('variantProduct').value = variant.productId;
      document.getElementById('variantType').value = variant.type;
      document.getElementById('variantName').value = variant.name;
      document.getElementById('variantValue').value = variant.value;
      document.getElementById('variantPriceAdjustment').value = variant.priceAdjustment || 0;
      document.getElementById('variantSortOrder').value = variant.sortOrder || 0;
      document.getElementById('variantImage').value = variant.image || '';

      if (variant.type === 'color' && variant.colorHex) {
        document.getElementById('variantColorHex').value = variant.colorHex;
        document.getElementById('variantColorText').value = variant.colorHex;
      }

      // Trigger type change to show/hide color fields
      document.getElementById('variantType').dispatchEvent(new Event('change'));

    } else {
      // Create mode
      modalTitle.textContent = 'Nueva Variante';
      form.reset();
      document.getElementById('variantId').value = '';
      document.getElementById('variantPriceAdjustment').value = '0';
      document.getElementById('variantSortOrder').value = '0';

      // Hide color fields by default
      document.getElementById('colorFields').style.display = 'none';
    }

    this.updatePreview();
    modal.classList.add('active');
  }

  closeVariantModal() {
    const modal = document.getElementById('variantModal');
    modal.classList.remove('active');
  }

  saveVariant() {
    try {
      const formData = new FormData(document.getElementById('variantForm'));
      const variantId = document.getElementById('variantId').value;

      const variantData = {
        productId: formData.get('productId'),
        type: formData.get('type'),
        name: formData.get('name'),
        value: formData.get('value'),
        priceAdjustment: parseFloat(formData.get('priceAdjustment')) || 0,
        sortOrder: parseInt(formData.get('sortOrder')) || 0,
        image: formData.get('image')
      };

      // Add color-specific data
      if (variantData.type === 'color') {
        variantData.colorHex = formData.get('colorHex');
      }

      // Validation
      if (!variantData.productId || !variantData.type || !variantData.name || !variantData.value) {
        this.showError('Por favor completa todos los campos obligatorios');
        return;
      }

      let success = false;

      if (variantId) {
        // Update existing variant
        success = storageManager.updateVariant(variantId, variantData);
      } else {
        // Create new variant
        const newVariant = storageManager.addVariant(variantData);
        success = !!newVariant;
      }

      if (success) {
        this.showSuccess(variantId ? 'Variante actualizada correctamente' : 'Variante creada correctamente');
        this.closeVariantModal();
        this.loadVariants();
      } else {
        this.showError('Error al guardar la variante');
      }

    } catch (error) {
      console.error('Error saving variant:', error);
      this.showError('Error al guardar la variante');
    }
  }

  deleteVariant(variantId) {
    this.variantToDelete = variantId;
    const modal = document.getElementById('deleteModal');
    modal.classList.add('active');
  }

  closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
    this.variantToDelete = null;
  }

  confirmDelete() {
    if (!this.variantToDelete) return;

    try {
      const success = storageManager.deleteVariant(this.variantToDelete);

      if (success) {
        this.showSuccess('Variante eliminada correctamente');
        this.closeDeleteModal();
        this.loadVariants();
      } else {
        this.showError('Error al eliminar la variante');
      }

    } catch (error) {
      console.error('Error deleting variant:', error);
      this.showError('Error al eliminar la variante');
    }
  }

  getTypeLabel(type) {
    const labels = {
      color: 'Color',
      storage: 'Almacenamiento',
      size: 'Tamaño',
      memory: 'Memoria RAM',
      other: 'Otro'
    };
    return labels[type] || type;
  }

  addVariantTableStyles() {
    if (document.querySelector('#variant-table-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'variant-table-styles';
    styles.textContent = `
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

      .type-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .type-color {
        background: rgba(233, 30, 99, 0.2);
        color: #E91E63;
        border: 1px solid rgba(233, 30, 99, 0.3);
      }

      .type-storage {
        background: rgba(63, 81, 181, 0.2);
        color: #3F51B5;
        border: 1px solid rgba(63, 81, 181, 0.3);
      }

      .type-size {
        background: rgba(255, 152, 0, 0.2);
        color: #FF9800;
        border: 1px solid rgba(255, 152, 0, 0.3);
      }

      .type-memory {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      .type-other {
        background: rgba(158, 158, 158, 0.2);
        color: #9E9E9E;
        border: 1px solid rgba(158, 158, 158, 0.3);
      }

      .variant-value {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: var(--text-color);
      }

      .price-adjustment {
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
        font-size: 0.9rem;
      }

      .price-adjustment.positive {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
      }

      .price-adjustment.negative {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }

      .variant-preview-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .color-swatch {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid var(--border-color);
        cursor: pointer;
      }

      .variant-image {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .no-preview {
        color: var(--text-muted-color);
        font-style: italic;
        font-size: 0.85rem;
      }

      .color-variant-fields {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--nav-item-radius);
        border: 1px solid var(--border-color);
        margin: 1rem 0;
      }

      .color-input-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .color-input-group input[type="color"] {
        width: 50px;
        height: 40px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      .variant-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--nav-item-radius);
        border: 1px solid var(--border-color);
        min-height: 60px;
      }

      .preview-color {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--border-color);
      }

      .preview-text {
        color: var(--text-color);
        font-weight: 600;
      }

      .variant-preview img {
        max-width: 60px;
        max-height: 60px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
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

      .form-help {
        color: var(--text-muted-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
      }

      @media (max-width: 768px) {
        .admin-table {
          font-size: 0.85rem;
        }

        .variant-preview-cell {
          flex-direction: column;
          gap: 0.25rem;
        }

        .color-input-group {
          flex-direction: column;
          align-items: stretch;
        }

        .variant-preview {
          flex-direction: column;
          align-items: flex-start;
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

// Initialize variants controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.variantsController = new VariantsController();
});