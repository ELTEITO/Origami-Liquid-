// ==================== MARCAS CONTROLLER ====================

class MarcasController {
  constructor() {
    this.marcas = [];
    this.filteredMarcas = [];
    this.marcaToDelete = null;

    this.init();
  }

  init() {
    this.loadMarcas();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterMarcas(e.target.value);
    });

    // Marca form
    document.getElementById("marcaForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveMarca();
    });

    // Global functions
    window.refreshMarcas = () => this.loadMarcas();
    window.openMarcaModal = (id = null) => this.openMarcaModal(id);
    window.closeMarcaModal = () => this.closeMarcaModal();
    window.editMarca = (id) => this.openMarcaModal(id);
    window.deleteMarca = (id) => this.deleteMarca(id);
    window.closeDeleteModal = () => this.closeDeleteModal();
    window.confirmDelete = () => this.confirmDelete();
    window.viewMarcaProducts = (id) => this.viewMarcaProducts(id);
  }

  loadMarcas() {
    try {
      // Preferir API si está disponible
      if (window.apiService) {
        window.apiService
          .getBrands()
          .then((data) => {
            const list = Array.isArray(data) ? data : data?.items || [];
            // Normalizar a formato UI esperado
            this.marcas = list.map((m) => ({
              id: m.id ?? m.Id,
              name: m.nombre || m.Nombre || m.name || "",
              createdAt: m.createdAt || m.CreatedAt || new Date().toISOString(),
            }));
            this.filteredMarcas = [...this.marcas];
            this.renderMarcas();
          })
          .catch((err) => {
            console.error("API getBrands error:", err);
            // Fallback a localStorage
            this.marcas = storageManager.getMarcas();
            this.filteredMarcas = [...this.marcas];
            this.renderMarcas();
          });
      } else {
        this.marcas = storageManager.getMarcas();
        this.filteredMarcas = [...this.marcas];
        this.renderMarcas();
      }
    } catch (error) {
      console.error("Error loading marcas:", error);
      this.showError("Error al cargar las marcas");
    }
  }

  filterMarcas(searchTerm) {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredMarcas = [...this.marcas];
    } else {
      this.filteredMarcas = this.marcas.filter((marca) =>
        marca.name.toLowerCase().includes(search)
      );
    }

    this.renderMarcas();
  }

  renderMarcas() {
    const grid = document.getElementById("marcasGrid");
    const emptyState = document.getElementById("emptyState");

    if (this.filteredMarcas.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // Get product counts for each category
    const products = storageManager.getProducts();
    const productCounts = {};

    products.forEach((product) => {
      const marcaId = product.marcaId;
      productCounts[marcaId] = (productCounts[marcaId] || 0) + 1;
    });

    grid.innerHTML = this.filteredMarcas
      .map((marca) => {
        const productCount = productCounts[marca.id] || 0;

        return `
        <div class="marca-card glass-effect">
          <div class="marca-header">
           <div class="marca-name">${marca.name}</div>
            <div class="marca-actions">
              <button class="btn btn-small btn-secondary" onclick="editMarca('${
                marca.id
              }')" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="btn btn-small btn-danger" onclick="deleteMarca('${
                marca.id
              }')" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

         

          <div class="marca-footer">
            <div class="marca-stats">
              <span class="product-count">
                <i class="fa-solid fa-box"></i>
                ${productCount} producto${productCount !== 1 ? "s" : ""}
              </span>
            </div>
            ${
              productCount > 0
                ? `
              <button class="btn btn-small btn-primary" onclick="viewMarcaProducts('${marca.id}')">
                Ver productos
              </button>
            `
                : ""
            }
          </div>

          <div class="marca-meta">
            <small>Creada: ${new Date(
              marca.createdAt
            ).toLocaleDateString()}</small>
          </div>
        </div>
      `;
      })
      .join("");

    this.addMarcaGridStyles();
  }

  openMarcaModal(marcaId = null) {
    const modal = document.getElementById("marcaModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("marcaForm");

    if (marcaId) {
      // Edit mode: buscar en memoria, luego API, luego localStorage
      const fillForm = (m) => {
        if (!m) return;
        modalTitle.textContent = "Editar Marca";
        document.getElementById("marcaId").value = m.id ?? m.Id;
        document.getElementById("marcaName").value =
          m.nombre || m.Nombre || m.name || "";
        modal.classList.add("active");
      };

      // 1) Buscar en la lista ya cargada
      const inMemory = (this.marcas || []).find(
        (x) =>
          String(x.id) === String(marcaId) || String(x.Id) === String(marcaId)
      );
      if (inMemory) {
        fillForm(inMemory);
      } else if (
        window.apiService &&
        typeof window.apiService.getBrand === "function"
      ) {
        // 2) Intentar API
        window.apiService
          .getBrand(marcaId)
          .then((data) => fillForm(data))
          .catch(() => {
            // 3) Fallback localStorage
            const local = storageManager.getMarca(marcaId);
            if (local) fillForm(local);
            else this.showError("Marca no encontrada");
          });
      } else {
        // Fallback directo a localStorage
        const local = storageManager.getMarca(marcaId);
        if (local) fillForm(local);
        else {
          this.showError("Marca no encontrada");
          return;
        }
      }
    } else {
      // Create mode
      modalTitle.textContent = "Nueva Marca";
      form.reset();
      document.getElementById("marcaId").value = "";
      modal.classList.add("active");
    }
  }

  closeMarcaModal() {
    const modal = document.getElementById("marcaModal");
    modal.classList.remove("active");
  }

  async saveMarca() {
    try {
      const formData = new FormData(document.getElementById("marcaForm"));
      const marcaId = document.getElementById("marcaId").value;

      const marcaData = {
        name: formData.get("name").trim(),
      };

      // Validation
      if (!marcaData.name) {
        this.showError("El nombre de la marca es obligatorio");
        return;
      }

      const doAfter = () => {
        this.showSuccess(
          marcaId
            ? "Marca actualizada correctamente"
            : "Marca creada correctamente"
        );
        this.closeMarcaModal();
        this.loadMarcas();
      };

      if (window.apiService) {
        // Usar nombres de propiedades alineados con MarcaDto (Id, Nombre)
        const payload = marcaId
          ? { Id: parseInt(marcaId), Nombre: marcaData.name }
          : { Nombre: marcaData.name };
        if (marcaId) {
          await window.apiService.updateBrand(marcaId, payload);
        } else {
          await window.apiService.createBrand(payload);
        }
        doAfter();
      } else {
        // Fallback local
        let success = false;
        if (marcaId) {
          success = storageManager.updateMarca(marcaId, marcaData);
        } else {
          const newMarca = storageManager.addMarca(marcaData);
          success = !!newMarca;
        }
        if (success) doAfter();
        else this.showError("Error al guardar la marca");
      }
    } catch (error) {
      console.error("Error saving marca:", error);
      this.showError("Error al guardar la marca");
    }
  }

  deleteMarca(marcaId) {
    // Check if category has products
    const products = storageManager.getProducts();
    const hasProducts = products.some((product) => product.marcaId === marcaId);

    if (hasProducts) {
      this.showError(
        "No se puede eliminar una marca que tiene productos asociados"
      );
      return;
    }

    this.marcaToDelete = marcaId;
    const modal = document.getElementById("deleteModal");
    modal.classList.add("active");
  }

  closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("active");
    this.marcaToDelete = null;
  }

  confirmDelete() {
    if (!this.marcaToDelete) return;

    try {
      const after = () => {
        this.showSuccess("Marca eliminada correctamente");
        this.closeDeleteModal();
        this.loadMarcas();
      };

      if (window.apiService) {
        window.apiService
          .deleteBrand(this.marcaToDelete)
          .then(after)
          .catch((err) => {
            console.error("API deleteBrand error:", err);
            this.showError("Error al eliminar la marca");
          });
      } else {
        const success = storageManager.deleteMarca(this.marcaToDelete);
        if (success) after();
        else this.showError("Error al eliminar la marca");
      }
    } catch (error) {
      console.error("Error deleting marca:", error);
      this.showError("Error al eliminar la marca");
    }
  }

  viewMarcaProducts(marcaId) {
    // Redirect to products page with category filter
    window.location.href = `products.html?marca=${marcaId}`;
  }

  addMarcaGridStyles() {
    if (document.querySelector("#marca-grid-styles")) return;

    const styles = document.createElement("style");
    styles.id = "marca-grid-styles";
    styles.textContent = `
      .marcas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .marca-card {
        padding: 1.5rem;
        border-radius: var(--medium-radius);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .marca-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 48px rgba(0,0,0,.42);
        background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08));
        border-color: rgba(255,255,255,.34);
      }

      .marca-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

     
      .marca-actions {
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .marca-card:hover .marca-actions {
        opacity: 1;
      }

      .marca-content {
        flex: 1;
      }

      .marca-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

     

      .marca-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .marca-stats {
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

      .marca-meta {
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
        .marcas-grid {
          grid-template-columns: 1fr;
        }

        .marca-actions {
          opacity: 1;
        }

        .marca-footer {
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

// Initialize marcas controller when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.marcasController = new MarcasController();
});
