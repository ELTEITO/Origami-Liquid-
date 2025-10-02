// ==================== CATEGORIES CONTROLLER ====================

class CategoriesController {
  constructor() {
    this.categories = [];
    this.filteredCategories = [];
    this.categoryToDelete = null;

    this.init();
  }

  init() {
    try {
      localStorage.removeItem("admin_categories");
    } catch (e) {
      /* ignore */
    }
    this.loadCategories();
    this.setupEventListeners();
    this.setupSlugGeneration();
    this.setupIconPreview();
  }

  setupEventListeners() {
    // Search
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterCategories(e.target.value);
    });

    // Category form
    document.getElementById("categoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    // Global functions
    window.refreshCategories = () => this.loadCategories();
    window.openCategoryModal = (id = null) => this.openCategoryModal(id);
    window.closeCategoryModal = () => this.closeCategoryModal();
    window.editCategory = (id) => this.openCategoryModal(id);
    window.deleteCategory = (id) => this.deleteCategory(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();
    window.viewCategoryProducts = (id) => this.viewCategoryProducts(id);
  }

  setupIconPreview() {
    const iconInput = document.getElementById("categoryIcon");
    const iconPreview = document.getElementById("iconPreview");
    const iconName = document.getElementById("iconName");

    iconInput.addEventListener("input", (e) => {
      const iconClass = e.target.value.trim();
      if (iconClass) {
        iconPreview.className = `fa-solid fa-${iconClass}`;
        iconName.textContent = `fa-${iconClass}`;
      } else {
        iconPreview.className = "fa-solid fa-tags";
        iconName.textContent = "fa-tags";
      }
    });
  }

  loadCategories() {
    try {
      const grid = document.getElementById("categoriesGrid");
      if (grid) grid.innerHTML = "";
      if (
        window.apiService &&
        typeof window.apiService.getCategories === "function"
      ) {
        window.apiService
          .getCategories()
          .then((data) => {
            console.log("[Categories] API data:", data);
            const list = Array.isArray(data) ? data : data?.items || [];
            this.categories = list.map((c) => ({
              id: c.id ?? c.Id,
              name: c.nombre || c.Nombre || c.name || "",
              description: c.descripcion || c.Descripcion || "",
              icon: c.icon || c.Icon || "",
              createdAt: c.createdAt || c.CreatedAt || new Date().toISOString(),
            }));
            this.filteredCategories = [...this.categories];
            this.renderCategories();
          })
          .catch((err) => {
            console.error("API getCategories error:", err);
            this.showError("Error al cargar las categorías");
            this.filteredCategories = [];
            this.renderCategories();
          });
      } else {
        console.warn(
          "[Categories] API no disponible. No se mostrarán datos locales."
        );
        this.categories = [];
        this.filteredCategories = [];
        this.renderCategories();
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      this.showError("Error al cargar las categorías");
    }
  }

  filterCategories(searchTerm) {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(
        (category) =>
          category.name.toLowerCase().includes(search) ||
          category.description.toLowerCase().includes(search)
      );
    }

    this.renderCategories();
  }

  renderCategories() {
    const grid = document.getElementById("categoriesGrid");
    const emptyState = document.getElementById("emptyState");
    if (grid) grid.innerHTML = "";

    if (this.filteredCategories.length === 0) {
      if (grid) grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // Get product counts for each category
    const productCounts = {}; // Opcional: integrar vía API en el futuro

    grid.innerHTML = this.filteredCategories
      .map((category) => {
        const productCount = productCounts[category.id] || 0;
        const iconClass = category.icon ? `fa-${category.icon}` : "fa-tags";

        return `
        <div class="category-card glass-effect">
          <div class="category-header">
            <div class="category-icon">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="category-actions">
              <button class="btn btn-small btn-secondary" onclick="editCategory('${
                category.id
              }')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteCategory('${
                category.id
              }')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="category-content">
            <h3 class="category-name">${category.name}</h3>
            <p class="category-description">${
              category.description || "Sin descripción"
            }</p>
          </div>

          <div class="category-footer">
            <div class="category-stats">
              <span class="product-count">
                <i class="fa-solid fa-box"></i>
                ${productCount} producto${productCount !== 1 ? "s" : ""}
              </span>
            </div>
            ${
              productCount > 0
                ? `
              <button class="btn btn-small btn-primary" onclick="viewCategoryProducts('${category.id}')">
                Ver productos
              </button>
            `
                : ""
            }
          </div>

          <div class="category-meta">
            <small>Creada: ${new Date(
              category.createdAt
            ).toLocaleDateString()}</small>
          </div>
        </div>
      `;
      })
      .join("");

    this.addCategoryGridStyles();
  }

  openCategoryModal(categoryId = null) {
    const modal = document.getElementById("categoryModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("categoryForm");

    if (categoryId) {
      const fillForm = (c) => {
        if (!c) return;
        modalTitle.textContent = "Editar Categoría";
        document.getElementById("categoryId").value = c.id ?? c.Id;
        document.getElementById("categoryName").value =
          c.nombre || c.Nombre || c.name || "";
        document.getElementById("categoryDescription").value =
          c.descripcion || c.Descripcion || c.description || "";
        document.getElementById("categoryIcon").value = c.icon || c.Icon || "";
        // Trigger icon preview
        const iconInput = document.getElementById("categoryIcon");
        iconInput.dispatchEvent(new Event("input"));
        modal.classList.add("active");
      };

      const inMemory = (this.categories || []).find(
        (x) =>
          String(x.id) === String(categoryId) ||
          String(x.Id) === String(categoryId)
      );
      if (inMemory) {
        fillForm(inMemory);
      } else if (
        window.apiService &&
        typeof window.apiService.getCategory === "function"
      ) {
        window.apiService
          .getCategory(categoryId)
          .then((data) => fillForm(data))
          .catch(() => {
            this.showError("Categoría no encontrada");
          });
      } else {
        this.showError("Categoría no encontrada");
      }
    } else {
      modalTitle.textContent = "Nueva Categoría";
      form.reset();
      document.getElementById("categoryId").value = "";
      document.getElementById("iconPreview").className = "fa-solid fa-tags";
      document.getElementById("iconName").textContent = "fa-tags";
      modal.classList.add("active");
    }
  }

  closeCategoryModal() {
    const modal = document.getElementById("categoryModal");
    modal.classList.remove("active");
  }

  saveCategory() {
    try {
      const formData = new FormData(document.getElementById("categoryForm"));
      const categoryId = document.getElementById("categoryId").value;

      const categoryData = {
        name: formData.get("name").trim(),
        description: formData.get("description").trim(),
        icon: formData.get("icon").trim(),
      };

      if (!categoryData.name) {
        this.showError("El nombre de la categoría es obligatorio");
        return;
      }

      const after = () => {
        this.showSuccess(
          categoryId
            ? "Categoría actualizada correctamente"
            : "Categoría creada correctamente"
        );
        this.closeCategoryModal();
        this.loadCategories();
      };

      if (
        window.apiService &&
        typeof window.apiService.createCategory === "function"
      ) {
        const payload = categoryId
          ? {
              Id: parseInt(categoryId),
              Nombre: categoryData.name,
              Descripcion: categoryData.description,
              Icon: categoryData.icon,
            }
          : {
              Nombre: categoryData.name,
              Descripcion: categoryData.description,
              Icon: categoryData.icon,
            };

        if (categoryId) {
          window.apiService
            .updateCategory(categoryId, payload)
            .then(after)
            .catch((err) => {
              console.error("API updateCategory error:", err);
              this.showError("Error al actualizar la categoría");
            });
        } else {
          window.apiService
            .createCategory(payload)
            .then(after)
            .catch((err) => {
              console.error("API createCategory error:", err);
              this.showError("Error al crear la categoría");
            });
        }
      } else {
        this.showError("API no disponible");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      this.showError("Error al guardar la categoría");
    }
  }

  deleteCategory(categoryId) {
    // Check if category has products
    const products = storageManager.getProducts();
    const hasProducts = products.some(
      (product) => product.categoryId === categoryId
    );

    if (hasProducts) {
      this.showError(
        "No se puede eliminar una categoría que tiene productos asociados"
      );
      return;
    }

    this.categoryToDelete = categoryId;
    const modal = document.getElementById("deleteModal");
    modal.classList.add("active");
  }

  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("active");
    this.categoryToDelete = null;
  }

  confirmDelete() {
    if (!this.categoryToDelete) return;

    try {
      const after = () => {
        this.showSuccess("Categoría eliminada correctamente");
        this.closeDeleteModal();
        this.loadCategories();
      };

      if (
        window.apiService &&
        typeof window.apiService.deleteCategory === "function"
      ) {
        window.apiService
          .deleteCategory(this.categoryToDelete)
          .then(after)
          .catch((err) => {
            console.error("API deleteCategory error:", err);
            this.showError("Error al eliminar la categoría");
          });
      } else {
        this.showError("API no disponible");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      this.showError("Error al eliminar la categoría");
    }
  }

  viewCategoryProducts(categoryId) {
    // Redirect to products page with category filter
    window.location.href = `products.html?category=${categoryId}`;
  }

  addCategoryGridStyles() {
    if (document.querySelector("#category-grid-styles")) return;

    const styles = document.createElement("style");
    styles.id = "category-grid-styles";
    styles.textContent = `
      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .category-card {
        padding: 1.5rem;
        border-radius: var(--medium-radius);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 48px rgba(0,0,0,.42);
        background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08));
        border-color: rgba(255,255,255,.34);
      }

      .category-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .category-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--active-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
      }

      .category-actions {
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .category-card:hover .category-actions {
        opacity: 1;
      }

      .category-content {
        flex: 1;
      }

      .category-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .category-description {
        color: var(--text-muted-color);
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 0.5rem 0;
      }

     
      .category-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .category-stats {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .product-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted-color);
        font-size: 0.85rem;
      }

      .category-meta {
        margin-top: 0.5rem;
        text-align: right;
        color: var(--text-muted-color);
        font-size: 0.75rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-muted-color);
      }

      .empty-state i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--active-text-color);
      }

      .empty-state h3 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
      }

      .empty-state p {
        margin: 0 0 2rem 0;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }

      .icon-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--nav-item-radius);
        border: 1px solid var(--border-color);
      }

      .icon-preview i {
        font-size: 2rem;
        color: var(--active-text-color);
      }

      .icon-preview span {
        font-family: 'Courier New', monospace;
        color: var(--text-muted-color);
        font-size: 0.9rem;
      }

      .form-help {
        color: var(--text-muted-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
      }

      .delete-warning {
        text-align: center;
        padding: 2rem 1rem;
      }

      .delete-warning i {
        font-size: 3rem;
        color: #0b64a1;
        margin-bottom: 1rem;
      }

      .delete-warning p {
        margin: 0.5rem 0;
        color: var(--text-color);
      }

      .warning-text {
        color: var(--text-muted-color);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .categories-grid {
          grid-template-columns: 1fr;
        }

        .category-actions {
          opacity: 1;
        }

        .category-footer {
          flex-direction: column;
          gap: 1rem;
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

// Initialize categories controller when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.categoriesController = new CategoriesController();
});
