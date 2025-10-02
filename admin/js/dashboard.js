// ==================== DASHBOARD CONTROLLER ====================

class DashboardController {
  constructor() {
    this.init();
  }

  init() {
    this.loadDashboardData();
    this.updateUserInfo();
    this.setupEventListeners();
    this.initializeChart();

    // Auto-refresh every 30 seconds
    setInterval(() => this.loadDashboardData(), 30000);
  }

  setupEventListeners() {
    // Global functions for buttons
    window.refreshData = () => this.loadDashboardData();
    window.exportData = () => this.exportAllData();
  }

  async loadDashboardData() {
    try {
      // Obtener datos desde la API
      const [productsRaw, categoriesRaw, marcasRaw] = await Promise.all([
        window.apiService.getProducts(),
        window.apiService.getCategories(),
        window.apiService.getBrands(),
      ]);

      const products = Array.isArray(productsRaw)
        ? productsRaw
        : productsRaw?.items || [];
      const categories = Array.isArray(categoriesRaw)
        ? categoriesRaw
        : categoriesRaw?.items || [];
      const marcas = Array.isArray(marcasRaw)
        ? marcasRaw
        : marcasRaw?.items || [];

      // Obtener variantes de todos los productos
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
      const variants = variantsArrays.flat();

      // Calcular estadísticas
      const stats = {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalVariants: variants.length,
        totalMarcas: marcas.length,
        recentActivity: this.generateRecentActivity(
          products,
          categories,
          variants
        ),
        topCategories: this.calculateTopCategories(products, categories),
      };

      this.renderStats(stats);
      this.renderRecentActivity(stats.recentActivity);
      // this.renderTopCategories(stats.topCategories);
      // this.updateSystemInfo();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.showError("Error al cargar los datos del dashboard");
    }
  }

  generateRecentActivity(products, categories, variants) {
    const activities = [];

    if (products.length > 0) {
      activities.push({
        entity: "products",
        timeAgo: "Actualizado recientemente",
      });
    }

    if (categories.length > 0) {
      activities.push({
        entity: "categories",
        timeAgo: "Actualizado recientemente",
      });
    }

    if (variants.length > 0) {
      activities.push({
        entity: "variants",
        timeAgo: "Actualizado recientemente",
      });
    }

    return activities;
  }

  calculateTopCategories(products, categories) {
    const categoryCounts = {};

    products.forEach((p) => {
      const categoria = p.categoria || p.Categoria || "Sin categoría";
      categoryCounts[categoria] = (categoryCounts[categoria] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  renderStats(stats) {
    const statsGrid = document.getElementById("statsGrid");

    const statsCards = [
      {
        title: "Total Productos",
        value: stats.totalProducts,
        icon: "fa-box",
        color: "#2196F3",
        trend: "+12%",
      },
      {
        title: "Categorías",
        value: stats.totalCategories,
        icon: "fa-tags",
        color: "#FF9800",
        trend: "+5%",
      },
      {
        title: "Variantes",
        value: stats.totalVariants,
        icon: "fa-palette",
        color: "#9C27B0",
        trend: "+8%",
      },
      /*  {
        title: 'Pedidos Pendientes',
        value: stats.pendingOrders,
        icon: 'fa-clock',
        color: '#FF5722',
        trend: '-3%'
      },
      {
        title: 'Pedidos Completados',
        value: stats.completedOrders,
        icon: 'fa-check-circle',
        color: '#4CAF50',
        trend: '+15%'
      },
      {
        title: 'Ingresos Totales',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        icon: 'fa-dollar-sign',
        color: '#00BCD4',
        trend: '+22%'
      },
      {
        title: 'Valor Promedio',
        value: `$${stats.averageOrderValue.toLocaleString()}`,
        icon: 'fa-chart-bar',
        color: '#607D8B',
        trend: '+7%'
      },
      {
        title: 'Total Pedidos',
        value: stats.totalOrders,
        icon: 'fa-shopping-cart',
        color: '#795548',
        trend: '+18%'
      } */
    ];

    // Filtro defensivo: ocultar cualquier tarjeta relacionada a pedidos/ingresos
    const filteredCards = statsCards.filter(
      (c) => !/pedido|ingreso|total pedido|valor promedio/i.test(c.title)
    );

    statsGrid.innerHTML = filteredCards
      .map(
        (stat) => `
      <div class="stat-card glass-effect">
        <div class="stat-header">
          <i class="fa-solid ${stat.icon}" style="color: ${stat.color}"></i>
          <span class="stat-trend ${
            stat.trend.startsWith("+") ? "positive" : "negative"
          }">
            ${stat.trend}
          </span>
        </div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.title}</div>
      </div>
    `
      )
      .join("");

    // Add trend styles
    if (!document.querySelector("#trend-styles")) {
      const styles = document.createElement("style");
      styles.id = "trend-styles";
      styles.textContent = `
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .stat-trend {
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          font-weight: 600;
        }
        .stat-trend.positive {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
        }
        .stat-trend.negative {
          background: rgba(244, 67, 54, 0.2);
          color: #0b64a1;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  renderRecentActivity(activities) {
    const container = document.getElementById("recentActivity");

    // Filtrar actividades relacionadas a pedidos
    activities = Array.isArray(activities)
      ? activities.filter((a) => a.entity !== "orders")
      : activities;

    if (!activities || activities.length === 0) {
      container.innerHTML =
        '<p class="empty-state">No hay actividad reciente</p>';
      return;
    }

    const activityIcons = {
      products: "fa-box",
      categories: "fa-tags",
      variants: "fa-palette",
      // orders: 'fa-shopping-cart' // pedidos deshabilitados
    };

    container.innerHTML = `
      <div class="activity-list">
        ${activities
          .map(
            (activity) => `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fa-solid ${
                activityIcons[activity.entity] || "fa-info"
              }"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">
                Actualización en <strong>${activity.entity}</strong>
              </div>
              <div class="activity-time">${activity.timeAgo}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Add activity styles
    if (!document.querySelector("#activity-styles")) {
      const styles = document.createElement("style");
      styles.id = "activity-styles";
      styles.textContent = `
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--nav-item-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--active-text-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .activity-content {
          flex: 1;
        }
        .activity-text {
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }
        .activity-time {
          color: var(--text-muted-color);
          font-size: 0.85rem;
        }
        .empty-state {
          text-align: center;
          color: var(--text-muted-color);
          padding: 2rem;
          font-style: italic;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  renderTopCategories(categories) {
    const container = document.getElementById("topCategories");
    if (!container) return; // El contenedor está comentado en el HTML

    if (!categories || categories.length === 0) {
      container.innerHTML =
        '<p class="empty-state">No hay datos de categorías</p>';
      return;
    }

    const maxCount = Math.max(...categories.map((c) => c.count));

    container.innerHTML = `
      <div class="categories-list">
        ${categories
          .map((category) => {
            const percentage = (category.count / maxCount) * 100;
            return `
            <div class="category-item">
              <div class="category-info">
                <span class="category-name">${category.name}</span>
                <span class="category-count">${category.count} producto${
              category.count !== 1 ? "s" : ""
            }</span>
              </div>
              <div class="category-bar">
                <div class="category-progress" style="width: ${percentage}%"></div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;

    // Add category styles
    if (!document.querySelector("#category-styles")) {
      const styles = document.createElement("style");
      styles.id = "category-styles";
      styles.textContent = `
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .category-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .category-name {
          font-weight: 600;
          color: var(--text-color);
        }
        .category-count {
          color: var(--text-muted-color);
          font-size: 0.9rem;
        }
        .category-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .category-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--active-text-color), #ff6b6b);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  updateUserInfo() {
    // const user = getCurrentUser();
    // if (user) {
    //   const userElement = document.getElementById('currentUser');
    //   if (userElement) {
    //     userElement.textContent = user.username;
    //   }
    // }
  }

  updateSystemInfo() {
    // const now = new Date();
    // const lastUpdateElement = document.getElementById('lastUpdate');
    // if (lastUpdateElement) {
    //   lastUpdateElement.textContent = now.toLocaleTimeString();
    // }
    // // Calculate storage usage (rough estimate)
    // let storageSize = 0;
    // for (let key in localStorage) {
    //   if (localStorage.hasOwnProperty(key) && key.startsWith('admin_')) {
    //     storageSize += localStorage[key].length;
    //   }
    // }
    // const sizeKB = Math.round(storageSize / 1024);
    // const storageElement = document.getElementById('storageUsage');
    // if (storageElement) {
    //   storageElement.textContent = `${sizeKB} KB`;
    // }
  }

  initializeChart() {
    // Simple chart implementation without external libraries
    const canvas = document.getElementById("salesChart");
    if (!canvas) return; // El canvas está comentado en el HTML

    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Sample data for the last 7 days
    const data = [120, 150, 180, 200, 160, 220, 250];
    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    this.drawChart(ctx, data, labels, canvas.width, canvas.height);
  }

  drawChart(ctx, data, labels, width, height) {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set styles
    ctx.strokeStyle = "#0b64a1";
    ctx.fillStyle = "#0b64a1";
    ctx.lineWidth = 3;
    ctx.font = "12px Arial";

    // Find min and max values
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = "#0b64a1";
    ctx.fillStyle = "#0b64a1";
    ctx.lineWidth = 3;

    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y =
        padding + chartHeight - ((value - minValue) / range) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y =
        padding + chartHeight - ((value - minValue) / range) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "center";

    labels.forEach((label, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      ctx.fillText(label, x, height - 10);
    });

    // Draw values
    ctx.textAlign = "left";
    for (let i = 0; i <= 5; i++) {
      const value = Math.round(minValue + (range / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(value.toString(), 5, y);
    }
  }

  async exportAllData() {
    try {
      // Obtener todos los datos desde la API
      const [productsRaw, categoriesRaw, marcasRaw] = await Promise.all([
        window.apiService.getProducts(),
        window.apiService.getCategories(),
        window.apiService.getBrands(),
      ]);

      const products = Array.isArray(productsRaw)
        ? productsRaw
        : productsRaw?.items || [];
      const categories = Array.isArray(categoriesRaw)
        ? categoriesRaw
        : categoriesRaw?.items || [];
      const marcas = Array.isArray(marcasRaw)
        ? marcasRaw
        : marcasRaw?.items || [];

      // Obtener variantes de todos los productos
      const variantPromises = products.map(async (p) => {
        const productId = p.id ?? p.Id;
        try {
          const variantesRaw = await window.apiService.getVariants(productId);
          return Array.isArray(variantesRaw)
            ? variantesRaw
            : variantesRaw?.items || [];
        } catch (error) {
          return [];
        }
      });

      const variantsArrays = await Promise.all(variantPromises);
      const variants = variantsArrays.flat();

      const exportData = {
        products,
        categories,
        marcas,
        variants,
        exportDate: new Date().toISOString(),
      };

      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `origami-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      this.showSuccess("Datos exportados correctamente");
    } catch (error) {
      console.error("Error exporting data:", error);
      this.showError("Error al exportar los datos");
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

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DashboardController();
});
