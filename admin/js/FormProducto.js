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
    this.loadBrands();
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
    const form = document.getElementById("productForm");
    if (form && !this.formBound) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveProduct();
      });
      this.formBound = true;
    }
  }

  setupImagePreview() {
    const fileInput = document.getElementById("productImageFile");
    const imagePreview = document.getElementById("imagePreview");
    const placeholder = document.getElementById("noImagePlaceholder");

    if (fileInput && !this.previewBound) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            imagePreview.src = reader.result;
            imagePreview.style.display = "block";
            placeholder.style.display = "none";
          };
          reader.readAsDataURL(file);
        } else {
          imagePreview.style.display = "none";
          placeholder.style.display = "flex";
        }
      });
      this.previewBound = true;
    }
  }

  loadCategories() {
    const categorySelect = document.getElementById("productCategory");
    if (!categorySelect) return;
    categorySelect.innerHTML =
      '<option value="">Seleccionar categoría</option>';

    if (
      window.apiService &&
      typeof window.apiService.getCategories === "function"
    ) {
      window.apiService
        .getCategories()
        .then((list) => {
          const categories = Array.isArray(list) ? list : list?.items || [];
          categories.forEach((c) => {
            const id = c.id ?? c.Id;
            const name = c.nombre || c.Nombre || c.name || "";
            if (id && name) {
              const option = new Option(name, id);
              categorySelect.appendChild(option);
            }
          });
        })
        .catch((err) => {
          console.error("Error cargando categorías desde API:", err);
        });
    }
  }

  async loadBrands() {
    try {
      const brandSelect = document.getElementById("productBrand");
      if (!brandSelect) return;
      brandSelect.innerHTML = '<option value="">Seleccionar marca</option>';
      const brands = await window.apiService.getBrands();
      (Array.isArray(brands) ? brands : brands?.items || []).forEach((b) => {
        const nombre = b.nombre || b.Nombre || b.name || "";
        if (!nombre) return;
        const opt = new Option(nombre, nombre);
        brandSelect.appendChild(opt);
      });
    } catch (e) {
      console.error("Error cargando marcas:", e);
    }
  }

  async openModal(productId = null) {
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const submitText = document.getElementById("submitText");
    const additionalInfo = document.getElementById("additionalInfo");
    const isEditModeInput = document.getElementById("isEditMode");
    const imageFileInput = document.getElementById("productImageFile");

    // Ensure DOM bindings and data are ready even if component was injected later
    this.bindFormHandlers();
    this.setupImagePreview();
    this.loadCategories();
    this.loadBrands();

    if (productId) {
      // EDIT MODE
      this.isEditMode = true;
      this.currentProductId = productId;

      try {
        // Obtener producto desde la API
        const product = await window.apiService.getProduct(productId);
        if (!product) {
          this.showError("Producto no encontrado");
          return;
        }

        // Update UI for edit mode
        modalTitle.innerHTML =
          '<i class="fa-solid fa-edit"></i> Editar Producto';
        submitText.textContent = "Actualizar Producto";
        additionalInfo.style.display = "block";
        isEditModeInput.value = "true";

        // Hacer que la imagen no sea requerida en modo edición
        if (imageFileInput) {
          imageFileInput.removeAttribute("required");
        }

        // Load product data
        this.loadProductData(product);
      } catch (error) {
        console.error("Error loading product:", error);
        this.showError("Error al cargar el producto");
        return;
      }
    } else {
      // CREATE MODE
      this.isEditMode = false;
      this.currentProductId = null;

      // Update UI for create mode
      modalTitle.innerHTML = '<i class="fa-solid fa-plus"></i> Nuevo Producto';
      submitText.textContent = "Crear Producto";
      additionalInfo.style.display = "none";
      isEditModeInput.value = "false";

      // Hacer que la imagen sea requerida en modo creación
      if (imageFileInput) {
        imageFileInput.setAttribute("required", "required");
      }

      // Reset form
      this.resetForm();
    }

    // Show modal
    modal.classList.add("active");
  }

  loadProductData(product) {
    // Basic information - normalizar campos de la API
    document.getElementById("productId").value = product.id || product.Id || "";
    // document.getElementById("productName").value =
    //   product.nombre || product.Nombre || product.name || "";
    document.getElementById("productBrand").value =
      product.marca || product.Marca || product.brand || "";
    document.getElementById("productModel").value =
      product.modelo || product.Modelo || product.model || "";
    document.getElementById("productCategory").value =
      product.categoriaId || product.CategoriaId || product.categoryId || "";
    document.getElementById("productDescription").value =
      product.descripcion || product.Descripcion || product.description || "";

    document.getElementById("productStatus").value =
      product.estado || product.Estado || product.status || "active";

    // Image preview - manejar imagen base64
    const imgBase64 = product.img || product.Img;
    if (imgBase64) {
      const imagePreview = document.getElementById("imagePreview");
      const placeholder = document.getElementById("noImagePlaceholder");
      imagePreview.src = `data:image/png;base64,${imgBase64}`;
      imagePreview.style.display = "block";
      placeholder.style.display = "none";
    }

    // System information
    const createdAt =
      product.createdAt ||
      product.CreatedAt ||
      product.fechaCreacion ||
      product.FechaCreacion;
    const updatedAt =
      product.updatedAt ||
      product.UpdatedAt ||
      product.fechaActualizacion ||
      product.FechaActualizacion;

    if (createdAt) {
      document.getElementById("createdAt").value = new Date(
        createdAt
      ).toLocaleString();
    }
    if (updatedAt) {
      document.getElementById("updatedAt").value = new Date(
        updatedAt
      ).toLocaleString();
    }
  }

  resetForm() {
    const form = document.getElementById("productForm");
    if (form) {
      form.reset();
    }

    // Reset additional fields
    document.getElementById("productId").value = "";
    document.getElementById("createdAt").value = "";
    document.getElementById("updatedAt").value = "";

    // Reset image preview
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("noImagePlaceholder").style.display = "flex";
  }

  closeModal() {
    const modal = document.getElementById("productModal");
    modal.classList.remove("active");

    // Reset state
    this.isEditMode = false;
    this.currentProductId = null;
  }

  async saveProduct() {
    try {
      const formData = new FormData(document.getElementById("productForm"));

      // Leer imagen local como base64
      const file = formData.get("imageFile");
      let imageBase64 = "";
      if (file && file.size > 0) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result || "").toString().split(",")[1] || "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const selectedCategoryOption = document.querySelector(
        "#productCategory option:checked"
      );
      const selectedCategoryName = selectedCategoryOption
        ? selectedCategoryOption.textContent
        : "";

      const productData = {
        brand: formData.get("brand").trim(),
        model: formData.get("model").trim(),
        categoryId: formData.get("categoryId"),
        description: formData.get("description")
          ? formData.get("description").trim()
          : "",
        status: formData.get("status"),
        image: imageBase64,
      };

      // Validation
      if (!this.validateProductData(productData)) {
        return;
      }

      // Mapear a ProductoDto para backend
      const payload = {
        Marca: productData.brand,
        Modelo: productData.model,
        Categoria: selectedCategoryName, // backend espera string
        Img: imageBase64 || null,
        Variantes: [],
      };

      let message = "";

      if (this.isEditMode && this.currentProductId) {
        payload.Id = parseInt(this.currentProductId);
        await window.apiService.updateProduct(this.currentProductId, payload);
        message = "Producto actualizado correctamente";
      } else {
        await window.apiService.createProduct(payload);
        message = "Producto creado correctamente";
      }

      this.showSuccess(message);
      this.closeModal();

      // Notify parent to refresh list
      if (
        window.productsController &&
        typeof window.productsController.refreshProductsList === "function"
      ) {
        window.productsController.refreshProductsList();
      }

      // Update store integration
      if (
        window.storeIntegration &&
        typeof window.storeIntegration.refreshFromAdmin === "function"
      ) {
        window.storeIntegration.refreshFromAdmin();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      const msg =
        error && error.message ? error.message : "Error al guardar el producto";
      this.showError(msg);
    }
  }

  validateProductData(data) {
    // Required fields validation
    if (!data.brand) {
      this.showError("La marca es obligatoria");
      return false;
    }

    if (!data.model) {
      this.showError("El modelo es obligatorio");
      return false;
    }

    if (!data.categoryId) {
      this.showError("Debe seleccionar una categoría");
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
    this.showToast(message, "success");
  }

  showError(message) {
    this.showToast(message, "error");
  }

  showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${
        type === "success" ? "check-circle" : "exclamation-circle"
      }"></i>
      ${message}
    `;

    // Add toast styles if not exist
    if (!document.querySelector("#form-toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "form-toast-styles";
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
    }, 4000);
  }

  // Method to refresh categories dropdown
  refreshCategories() {
    this.loadCategories();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.formProducto = new FormProducto();
});
