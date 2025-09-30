// ==================== FORM PRODUCTO COMPONENT ====================

class FormProducto {
  constructor() {
    this.isEditMode = false;
    this.currentProductId = null;
    this.formBound = false;
    this.previewBound = false;
    this.init();
  }

  init() {
    this.loadCategories();
    this.setupEventListeners();
    this.setupImagePreview();
  }

  setupEventListeners() {
    this.bindFormHandlers();

    // Global functions for external access
    window.openProductModal = (id = null) => this.openModal(id);
    window.closeProductModal = () => this.closeModal();
  }

  bindFormHandlers() {
    const form = document.getElementById('productForm');
    if (form && !this.formBound) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProduct();
      });
      this.formBound = true;
    }
  }

  setupImagePreview() {
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('noImagePlaceholder');

    if (imageInput && !this.previewBound) {
      imageInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
          imagePreview.src = url;
          imagePreview.style.display = 'block';
          placeholder.style.display = 'none';

          imagePreview.onerror = () => {
            imagePreview.style.display = 'none';
            placeholder.style.display = 'flex';
          };
        } else {
          imagePreview.style.display = 'none';
          placeholder.style.display = 'flex';
        }
      });
      this.previewBound = true;
    }
  }

  loadCategories() {
    const categories = storageManager.getCategories();
    const categorySelect = document.getElementById('productCategory');

    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
      categories.forEach(category => {
        const option = new Option(category.name, category.id);
        categorySelect.appendChild(option);
      });
    }
  }

  openModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');
    const additionalInfo = document.getElementById('additionalInfo');
    const isEditModeInput = document.getElementById('isEditMode');

    // Ensure DOM bindings and data are ready even if component was injected later
    this.bindFormHandlers();
    this.setupImagePreview();
    this.loadCategories();

    if (productId) {
      // EDIT MODE
      this.isEditMode = true;
      this.currentProductId = productId;

      const product = storageManager.getProduct(productId);
      if (!product) {
        this.showError('Producto no encontrado');
        return;
      }

      // Update UI for edit mode
      modalTitle.innerHTML = '<i class="fa-solid fa-edit"></i> Editar Producto';
      submitText.textContent = 'Actualizar Producto';
      additionalInfo.style.display = 'block';
      isEditModeInput.value = 'true';

      // Load product data
      this.loadProductData(product);
    } else {
      // CREATE MODE
      this.isEditMode = false;
      this.currentProductId = null;

      // Update UI for create mode
      modalTitle.innerHTML = '<i class="fa-solid fa-plus"></i> Nuevo Producto';
      submitText.textContent = 'Crear Producto';
      additionalInfo.style.display = 'none';
      isEditModeInput.value = 'false';

      // Reset form
      this.resetForm();
    }

    // Show modal
    modal.classList.add('active');
  }

  loadProductData(product) {
    // Basic information
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productModel').value = product.model || '';
    document.getElementById('productCategory').value = product.categoryId || '';
    document.getElementById('productDescription').value = product.description || '';

    // Price and status
    document.getElementById('productBasePrice').value = product.basePrice || '';
    document.getElementById('productStatus').value = product.status || 'active';

    // Image
    document.getElementById('productImage').value = product.image || '';

    // System information
    if (product.createdAt) {
      document.getElementById('createdAt').value = new Date(product.createdAt).toLocaleString();
    }
    if (product.updatedAt) {
      document.getElementById('updatedAt').value = new Date(product.updatedAt).toLocaleString();
    }

    // Trigger image preview
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
      imageInput.dispatchEvent(new Event('input'));
    }
  }

  resetForm() {
    const form = document.getElementById('productForm');
    if (form) {
      form.reset();
    }

    // Reset additional fields
    document.getElementById('productId').value = '';
    document.getElementById('createdAt').value = '';
    document.getElementById('updatedAt').value = '';

    // Reset image preview
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('noImagePlaceholder').style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');

    // Reset state
    this.isEditMode = false;
    this.currentProductId = null;
  }

  saveProduct() {
    try {
      const formData = new FormData(document.getElementById('productForm'));

      const productData = {
        name: formData.get('name').trim(),
        brand: formData.get('brand').trim(),
        model: formData.get('model').trim(),
        categoryId: formData.get('categoryId'),
        description: formData.get('description').trim(),
        basePrice: parseFloat(formData.get('basePrice')),
        status: formData.get('status'),
        image: formData.get('image').trim()
      };

      // Validation
      if (!this.validateProductData(productData)) {
        return;
      }

      let success = false;
      let message = '';

      if (this.isEditMode && this.currentProductId) {
        // UPDATE EXISTING PRODUCT
        success = storageManager.updateProduct(this.currentProductId, productData);
        message = success ? 'Producto actualizado correctamente' : 'Error al actualizar el producto';
      } else {
        // CREATE NEW PRODUCT
        const newProduct = storageManager.addProduct(productData);
        success = !!newProduct;
        message = success ? 'Producto creado correctamente' : 'Error al crear el producto';
      }

      if (success) {
        this.showSuccess(message);
        this.closeModal();

        // Notify parent to refresh list
        if (window.productsController) {
          window.productsController.refreshProductsList();
        }

        // Update store integration
        if (window.storeIntegration) {
          window.storeIntegration.refreshFromAdmin();
        }
      } else {
        this.showError(message);
      }

    } catch (error) {
      console.error('Error saving product:', error);
      this.showError('Error al guardar el producto');
    }
  }

  validateProductData(data) {
    // Required fields validation
    if (!data.name) {
      this.showError('El nombre del producto es obligatorio');
      return false;
    }

    if (!data.brand) {
      this.showError('La marca es obligatoria');
      return false;
    }

    if (!data.model) {
      this.showError('El modelo es obligatorio');
      return false;
    }

    if (!data.categoryId) {
      this.showError('Debe seleccionar una categoría');
      return false;
    }

    if (!data.basePrice || data.basePrice < 0) {
      this.showError('El precio debe ser mayor a 0');
      return false;
    }

    // Image URL validation (if provided)
    if (data.image && !this.isValidUrl(data.image)) {
      this.showError('La URL de la imagen no es válida');
      return false;
    }

    return true;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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

    // Add toast styles if not exist
    if (!document.querySelector('#form-toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'form-toast-styles';
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
          max-width: 350px;
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
    }, 4000);
  }

  // Method to refresh categories dropdown
  refreshCategories() {
    this.loadCategories();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.formProducto = new FormProducto();
});