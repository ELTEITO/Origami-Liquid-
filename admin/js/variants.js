// ==================== VARIANTS CONTROLLER ====================

class VariantsController {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentFilter = {
      product: "",
      type: "",
      search: "",
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
  }

  setupEventListeners() {
    // Filters
    document.getElementById("productFilter").addEventListener("change", (e) => {
      this.currentFilter.product = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    document.getElementById("typeFilter").addEventListener("change", (e) => {
      this.currentFilter.type = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.currentFilter.search = e.target.value;
      this.currentPage = 1;
      this.loadVariants();
    });

    // Global functions - solo para refresh y delete
    window.refreshVariants = () => this.loadVariants();
    window.deleteVariant = (id) => this.deleteVariant(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();

    // editVariant y openVariantModal serán manejados por FormVariante.js
  }

  async loadProducts() {
    try {
      const raw = await window.apiService.getProducts();
      const products = Array.isArray(raw) ? raw : raw?.items || [];

      // Normalizar campos
      const normalizedProducts = products.map((p) => ({
        id: p.id ?? p.Id,
        marca: p.marca || p.Marca || "",
        modelo: p.modelo || p.Modelo || "",
        categoria: p.categoria || p.Categoria || "",
      }));

      // Populate product filter
      const productFilter = document.getElementById("productFilter");
      productFilter.innerHTML = '<option value="">Todos los productos</option>';

      // Populate variant form product select
      const variantProduct = document.getElementById("variantProduct");
      if (variantProduct) {
        variantProduct.innerHTML =
          '<option value="">Seleccionar producto</option>';
      }

      normalizedProducts.forEach((product) => {
        const displayText = `${product.marca} ${product.modelo}`;
        const option1 = new Option(displayText, product.id);
        productFilter.appendChild(option1);

        if (variantProduct) {
          const option2 = new Option(displayText, product.id);
          variantProduct.appendChild(option2);
        }
      });
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  async loadVariants() {
    try {
      // Mostrar loading
      const tbody = document.getElementById("variantsTableBody");
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p>Cargando variantes...</p>
          </td>
        </tr>
      `;

      // Obtener productos desde la API
      const productsRaw = await window.apiService.getProducts();
      const products = Array.isArray(productsRaw)
        ? productsRaw
        : productsRaw?.items || [];

      // Obtener variantes de cada producto
      const variantPromises = products.map(async (p) => {
        const productId = p.id ?? p.Id;
        try {
          const variantesRaw = await window.apiService.getVariants(productId);
          return Array.isArray(variantesRaw)
            ? variantesRaw
            : variantesRaw?.items || [];
        } catch (error) {
          console.error(
            `Error loading variants for product ${productId}:`,
            error
          );
          return [];
        }
      });

      const variantsArrays = await Promise.all(variantPromises);
      let variants = variantsArrays.flat();

      // Normalizar variantes
      variants = variants.map((v) => ({
        id: v.id ?? v.Id,
        productoId: v.productoId ?? v.ProductoId,
        ram: v.ram || v.Ram || "",
        almacenamiento: v.almacenamiento || v.Almacenamiento || "",
        color: v.color || v.Color || "",
        precio: v.precio ?? v.Precio ?? 0,
        stock: v.stock ?? v.Stock ?? 0,
        createdAt: v.createdAt || v.CreatedAt || new Date().toISOString(),
      }));

      // Normalizar productos
      const normalizedProducts = products.map((p) => ({
        id: p.id ?? p.Id,
        marca: p.marca || p.Marca || "",
        modelo: p.modelo || p.Modelo || "",
        categoria: p.categoria || p.Categoria || "",
      }));

      console.log("[Variants] Loaded:", variants.length, variants);

      // Apply filters
      if (this.currentFilter.product) {
        const productId = parseInt(this.currentFilter.product);
        variants = variants.filter(
          (variant) => variant.productoId === productId
        );
      }

      if (this.currentFilter.search) {
        const search = this.currentFilter.search.toLowerCase();
        variants = variants.filter(
          (variant) =>
            (variant.ram || "").toLowerCase().includes(search) ||
            (variant.almacenamiento || "").toLowerCase().includes(search) ||
            (variant.color || "").toLowerCase().includes(search)
        );
      }

      // Sort by product name, then by creation date
      variants.sort((a, b) => {
        const productA = normalizedProducts.find((p) => p.id === a.productoId);
        const productB = normalizedProducts.find((p) => p.id === b.productoId);

        if (productA && productB) {
          const nameA = `${productA.marca} ${productA.modelo}`;
          const nameB = `${productB.marca} ${productB.modelo}`;
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB);
          }
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Calculate pagination
      const totalVariants = variants.length;
      const totalPages = Math.ceil(totalVariants / this.itemsPerPage);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const paginatedVariants = variants.slice(startIndex, endIndex);

      this.renderVariants(paginatedVariants, normalizedProducts);
      this.renderPagination(totalPages, totalVariants);
    } catch (error) {
      console.error("Error loading variants:", error);

      const tbody = document.getElementById("variantsTableBody");
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <i class="fa-solid fa-exclamation-circle"></i>
            <p>Error al cargar las variantes</p>
            <button class="btn btn-primary" onclick="variantsController.loadVariants()">
              <i class="fa-solid fa-refresh"></i> Reintentar
            </button>
          </td>
        </tr>
      `;

      this.showError("Error al cargar las variantes");
    }
  }

  renderVariants(variants, products) {
    const tbody = document.getElementById("variantsTableBody");

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

    tbody.innerHTML = variants
      .map((variant) => {
        const product = products.find((p) => p.id === variant.productoId);
        const productName = product
          ? `${product.marca} ${product.modelo}`
          : "Producto eliminado";

        return `
        <tr>
          <td>
            <div class="product-info">
              <div class="product-name">${productName}</div>
              ${
                product
                  ? `<div class="product-details">${
                      product.categoria || ""
                    }</div>`
                  : ""
              }
            </div>
          </td>
          <td>
            <strong>${variant.ram}</strong>
          </td>
          <td>
            <strong>${variant.almacenamiento}</strong>
          </td>
          <td>
            <strong>${variant.color}</strong>
          </td>
          <td>
            <span class="price">$${variant.precio.toLocaleString()}</span>
          </td>
          <td>
            <span class="stock-badge ${
              variant.stock > 0 ? "in-stock" : "out-of-stock"
            }">
              ${variant.stock} unidades
            </span>
          </td>
          <td>
            <div class="date-info">
              <div>${new Date(variant.createdAt).toLocaleDateString()}</div>
              <div class="date-time">${new Date(
                variant.createdAt
              ).toLocaleTimeString()}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-small btn-secondary" onclick="editVariant('${
                variant.id
              }')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteVariant('${
                variant.id
              }')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    this.addVariantTableStyles();
  }

  renderVariantPreview(variant) {
    let preview = "";

    if (variant.type === "color" && variant.colorHex) {
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
    const pagination = document.getElementById("pagination");
    const variantCount = document.getElementById("variantCount");

    variantCount.textContent = `${totalVariants} variante${
      totalVariants !== 1 ? "s" : ""
    }`;

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="variantsController.goToPage(${
          this.currentPage - 1
        })">
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
      } else if (
        i <= 2 ||
        i >= totalPages - 1 ||
        Math.abs(i - this.currentPage) <= 1
      ) {
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
        <button class="btn btn-secondary btn-small" onclick="variantsController.goToPage(${
          this.currentPage + 1
        })">
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

  deleteVariant(variantId) {
    this.variantToDelete = variantId;
    const modal = document.getElementById("deleteModal");
    modal.classList.add("active");
  }

  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("active");
    this.variantToDelete = null;
  }

  async confirmDelete() {
    if (!this.variantToDelete) return;

    // Loading state
    const confirmBtn = document.querySelector("#deleteModal .btn-danger");
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';
    confirmBtn.disabled = true;

    try {
      await window.apiService.deleteVariant(this.variantToDelete);
      this.showSuccess("Variante eliminada correctamente");
      this.closeDeleteModal();
      this.loadVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);

      let errorMessage = "Error al eliminar la variante";
      if (error instanceof window.ApiError) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);
    } finally {
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
    }
  }

  getTypeLabel(type) {
    const labels = {
      color: "Color",
      storage: "Almacenamiento",
      size: "Tamaño",
      memory: "Memoria RAM",
      other: "Otro",
    };
    return labels[type] || type;
  }

  addVariantTableStyles() {
    if (document.querySelector("#variant-table-styles")) return;

    const styles = document.createElement("style");
    styles.id = "variant-table-styles";
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
        color: #0b64a1;
      }

      .stock-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .stock-badge.in-stock {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      .stock-badge.out-of-stock {
        background: rgba(244, 67, 54, 0.2);
        color: #0b64a1;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }

      .price {
        font-weight: 600;
        color: var(--active-text-color);
        font-size: 1.1rem;
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

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize variants controller when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.variantsController = new VariantsController();
});
