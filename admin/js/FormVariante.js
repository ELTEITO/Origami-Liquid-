// ==================== FORM VARIANTE COMPONENT ====================

class FormVariante {
  constructor() {
    this.isEditMode = false;
    this.currentVariantId = null;
    this.formBound = false;
    this.typeBound = false;
    this.previewBound = false;
    this.init();
  }

  init() {
    this.loadProducts();
    this.bindFormHandlers();
    this.setupTypeFields();
    this.setupPreview();
    // Global functions
    window.openVariantModal = (id = null) => this.openModal(id);
    window.closeVariantModal = () => this.closeModal();
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

  setupTypeFields() {
    const typeSelect = document.getElementById('variantType');
    const colorFields = document.getElementById('colorFields');
    if (typeSelect && colorFields && !this.typeBound) {
      typeSelect.addEventListener('change', (e) => {
        colorFields.style.display = (e.target.value === 'color') ? 'block' : 'none';
        this.updatePreview();
      });
      this.typeBound = true;
    }
  }

  setupPreview() {
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

    ['variantName', 'variantType', 'variantImage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updatePreview());
    });

    this.previewBound = true;
  }

  updatePreview() {
    const type = document.getElementById('variantType').value;
    const name = document.getElementById('variantName').value;
    const colorHex = document.getElementById('variantColorHex')?.value || '';
    const image = document.getElementById('variantImage').value;

    const previewColor = document.getElementById('previewColor');
    const previewText = document.getElementById('previewText');
    const previewImage = document.getElementById('previewImage');

    if (!previewText) return;

    // Reset
    if (previewColor) previewColor.style.display = 'none';
    if (previewImage) previewImage.style.display = 'none';
    previewText.textContent = name || 'Sin vista previa';

    if (type === 'color' && colorHex && previewColor) {
      previewColor.style.backgroundColor = colorHex;
      previewColor.style.display = 'block';
      previewText.textContent = `${name} (${colorHex})`;
    }

    if (image && previewImage) {
      previewImage.src = image;
      previewImage.style.display = 'block';
      previewImage.onerror = () => { previewImage.style.display = 'none'; };
    }
  }

  loadProducts() {
    const products = storageManager.getProducts();
    const variantProduct = document.getElementById('variantProduct');
    if (variantProduct) {
      variantProduct.innerHTML = '<option value="">Seleccionar producto</option>';
      products.forEach(p => {
        const option = new Option(`${p.name} (${p.brand} ${p.model})`, p.id);
        variantProduct.appendChild(option);
      });
    }
  }

  openModal(variantId = null) {
    const modal = document.getElementById('variantModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('variantForm');

    // Ensure bindings
    this.bindFormHandlers();
    this.setupTypeFields();
    this.setupPreview();
    this.loadProducts();

    if (variantId) {
      this.isEditMode = true;
      this.currentVariantId = variantId;
      const variant = storageManager.getVariant(variantId);
      if (!variant) return this.showError('Variante no encontrada');

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
      document.getElementById('variantType').dispatchEvent(new Event('change'));
    } else {
      this.isEditMode = false;
      this.currentVariantId = null;
      modalTitle.textContent = 'Nueva Variante';
      form.reset();
      document.getElementById('variantId').value = '';
      document.getElementById('variantPriceAdjustment').value = '0';
      document.getElementById('variantSortOrder').value = '0';
      const colorFields = document.getElementById('colorFields');
      if (colorFields) colorFields.style.display = 'none';
    }

    this.updatePreview();
    modal.classList.add('active');
  }

  closeModal() {
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

      if (variantData.type === 'color') {
        variantData.colorHex = formData.get('colorHex');
      }

      if (!variantData.productId || !variantData.type || !variantData.name || !variantData.value) {
        this.showError('Por favor completa todos los campos obligatorios');
        return;
      }

      let success = false;
      if (variantId) {
        success = storageManager.updateVariant(variantId, variantData);
      } else {
        const newVariant = storageManager.addVariant(variantData);
        success = !!newVariant;
      }

      if (success) {
        this.showSuccess(variantId ? 'Variante actualizada correctamente' : 'Variante creada correctamente');
        this.closeModal();
        if (window.variantsController) {
          window.variantsController.loadVariants();
        }
        // Also refresh if using variants page
        if (window.refreshVariants) {
          window.refreshVariants();
        }
      } else {
        this.showError('Error al guardar la variante');
      }
    } catch (err) {
      console.error('Error saving variant:', err);
      this.showError('Error al guardar la variante');
    }
  }

  showSuccess(message) { this.showToast(message, 'success'); }
  showError(message) { this.showToast(message, 'error'); }
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

// Initialize after DOM and component load if present
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el DOM del componente está disponible
  const checkAndInit = () => {
    if (document.getElementById('variantForm')) {
      console.log('Initializing FormVariante component...');
      window.formVariante = new FormVariante();
      console.log('FormVariante initialized:', !!window.formVariante);
    } else {
      // Si no está disponible, intentar de nuevo en breve
      setTimeout(checkAndInit, 100);
    }
  };

  checkAndInit();
});


