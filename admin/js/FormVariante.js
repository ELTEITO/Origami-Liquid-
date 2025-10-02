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
    // Este método ya no es necesario ya que el formulario no tiene campo variantType
    // El formulario siempre muestra Ram, Almacenamiento y Color
    this.typeBound = true;
  }

  setupPreview() {
    const colorPicker = document.getElementById('variantColorHex');
    const colorText = document.getElementById('variantColorText');
    if (this.previewBound) return;

    if (colorPicker && colorText) {
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
    }

    const imageField = document.getElementById('variantImage');
    if (imageField) {
      imageField.addEventListener('input', () => this.updatePreview());
    }

    this.previewBound = true;
  }

  updatePreview() {
    const colorHex = document.getElementById('variantColorHex')?.value || '';
    const image = document.getElementById('variantImage')?.value || '';

    const previewColor = document.getElementById('previewColor');
    const previewText = document.getElementById('previewText');
    const previewImage = document.getElementById('previewImage');

    if (!previewText) return;

    // Reset
    if (previewColor) previewColor.style.display = 'none';
    if (previewImage) previewImage.style.display = 'none';
    previewText.textContent = 'Sin vista previa';

    if (colorHex && previewColor) {
      previewColor.style.backgroundColor = colorHex;
      previewColor.style.display = 'block';
      previewText.textContent = `Color: ${colorHex}`;
    }

    if (image && previewImage) {
      previewImage.src = image;
      previewImage.style.display = 'block';
      previewImage.onerror = () => { previewImage.style.display = 'none'; };
    }
  }

  loadProducts() {
    const variantProduct = document.getElementById('variantProduct');
    if (!variantProduct) return;
    variantProduct.innerHTML = '<option value="">Seleccionar producto</option>';
    if (window.apiService && typeof window.apiService.getProducts === 'function') {
      window.apiService.getProducts()
        .then(list => {
          const products = Array.isArray(list) ? list : (list?.items || []);
          products.forEach(p => {
            const marca = p.marca || p.Marca || '';
            const modelo = p.modelo || p.Modelo || '';
            const id = p.id ?? p.Id;
            const option = new Option(`${name || modelo || id} (${marca} ${modelo})`, id);
            variantProduct.appendChild(option);
          });
        })
        .catch(err => console.error('Error cargando productos para variantes:', err));
    }
  }

  openModal(variantId = null) {
    const modal = document.getElementById('variantModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('variantForm');

    if (!modal || !form) {
      console.error('Modal o formulario no encontrado');
      return;
    }

    // Ensure bindings
    this.bindFormHandlers();
    this.setupTypeFields();
    this.setupPreview();
    this.loadProducts();

    if (variantId) {
      this.isEditMode = true;
      this.currentVariantId = variantId;

      // Cargar variante desde API
      window.apiService.getVariant(variantId)
        .then(variant => {
          modalTitle.textContent = 'Editar Variante';
          document.getElementById('variantId').value = variant.id || variant.Id;
          document.getElementById('variantProduct').value = variant.productoId || variant.ProductoId;
          document.getElementById('variantRam').value = variant.ram || variant.Ram || '';
          document.getElementById('variantStorage').value = variant.almacenamiento || variant.Almacenamiento || '';
          document.getElementById('variantColor').value = variant.color || variant.Color || '';
          document.getElementById('productBasePrice').value = variant.precio || variant.Precio || 0;
          document.getElementById('productBaseStock').value = variant.stock || variant.Stock || 0;

          this.updatePreview();
          modal.classList.add('active');
        })
        .catch(err => {
          console.error('Error cargando variante:', err);
          this.showError('Error al cargar la variante');
        });
    } else {
      this.isEditMode = false;
      this.currentVariantId = null;
      modalTitle.textContent = 'Nueva Variante';
      form.reset();
      document.getElementById('variantId').value = '';

      this.updatePreview();
      modal.classList.add('active');
    }
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
        ram: (formData.get('ram') || '').trim(),
        storage: (formData.get('storage') || '').trim(),
        color: (formData.get('color') || '').trim(),
        price: parseFloat(formData.get('price')) || 0,
        stock: parseInt(formData.get('stock')) || 0
      };

      if (variantData.type === 'color') {
        variantData.colorHex = formData.get('colorHex');
      }

      if (!variantData.productId || !variantData.ram || !variantData.storage || !variantData.color) {
        this.showError('Por favor completa todos los campos obligatorios');
        return;
      }

      const payload = {
        ProductoId: parseInt(variantData.productId),
        Ram: variantData.ram,
        Almacenamiento: variantData.storage,
        Color: variantData.color,
        Precio: variantData.price,
        Stock: variantData.stock
      };

      const after = () => {
        this.showSuccess(variantId ? 'Variante actualizada correctamente' : 'Variante creada correctamente');
        this.closeModal();
        if (window.variantsController) {
          window.variantsController.loadVariants();
        }
        if (window.refreshVariants) {
          window.refreshVariants();
        }
      };

      if (variantId) {
        payload.Id = parseInt(variantId);
        window.apiService.updateVariant(variantId, payload).then(after).catch(err => {
          console.error('Error API al actualizar variante:', err);
          this.showError('Error al actualizar la variante');
        });
      } else {
        window.apiService.createVariant(payload).then(after).catch(err => {
          console.error('Error API al crear variante:', err);
          this.showError('Error al crear la variante');
        });
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


