// ==================== STORE INTEGRATION ====================

class StoreIntegration {
  constructor() {
    this.init();
  }

  init() {
    this.loadProductsFromAdmin();
    this.setupProductInteractions();
    // this.updateProductDisplay();
  }

  // Load products from admin storage
  loadProductsFromAdmin() {
    try {
      // Check if admin storage exists
      const adminProducts = localStorage.getItem('admin_products');
      const adminCategories = localStorage.getItem('admin_categories');

      if (adminProducts && adminCategories) {
        this.products = JSON.parse(adminProducts);
        this.categories = JSON.parse(adminCategories);
        this.updateStoreDisplay();
      } else {
        // Fallback to hardcoded products if no admin data
        this.loadDefaultProducts();
      }
    } catch (error) {
      console.error('Error loading admin products:', error);
      this.loadDefaultProducts();
    }
  }

  loadDefaultProducts() {
    // Default products that match the existing HTML structure
    this.products = [
      {
        id: 'iphone-17-256',
        name: 'iPhone 17',
        brand: 'Apple',
        model: 'iPhone 17',
        basePrice: 1299,
        image: 'https://media.bananacomputer.com/iPhone_17_White_2-up_Screen__USEN.png',
        status: 'active',
        description: 'El último iPhone con tecnología de vanguardia'
      },
      {
        id: 'samsung-s25',
        name: 'Samsung Galaxy S25',
        brand: 'Samsung',
        model: 'Galaxy S25',
        basePrice: 1099,
        image: 'https://images.samsung.com/is/image/samsung/assets/global/galaxy-s23/galaxy-s23_highlights_kv_mo.jpg',
        status: 'active',
        description: 'El flagship de Samsung más avanzado'
      }
    ];
  }

  updateStoreDisplay() {
    // Update homepage products
    this.updateHomepageProducts();

    // Update store page if exists
    this.updateStorePage();
  }

  updateHomepageProducts() {
    const cardsSection = document.getElementById('cards');
    if (!cardsSection) return;

    // Get active products
    const activeProducts = this.products.filter(p => p.status === 'active').slice(0, 6);

    // Update existing cards or create new ones
    const existingCards = cardsSection.querySelectorAll('.card');

    activeProducts.forEach((product, index) => {
      let cardElement = existingCards[index];

      if (cardElement) {
        // Update existing card
        this.updateProductCard(cardElement, product);
      } else {
        // Create new card
        this.createProductCard(cardsSection, product);
      }
    });

    // Remove excess cards
    for (let i = activeProducts.length; i < existingCards.length; i++) {
      existingCards[i].remove();
    }
  }

  updateProductCard(cardElement, product) {
    const nameElement = cardElement.querySelector('h3');
    const imageElement = cardElement.querySelector('img');
    const descElement = cardElement.querySelector('p');
    const priceElement = cardElement.querySelector('.card__price');
    const linkElement = cardElement.closest('a');

    if (nameElement) nameElement.textContent = product.name;
    if (imageElement) {
      imageElement.src = product.image;
      imageElement.alt = product.name;
    }
    if (descElement) descElement.textContent = product.description || `${product.brand} ${product.model}`;
    if (priceElement) priceElement.textContent = `$${product.basePrice.toLocaleString()}`;
    if (linkElement) linkElement.href = this.getProductUrl(product);
  }

  createProductCard(container, product) {
    const cardHTML = `
      <a href="${this.getProductUrl(product)}" target="_blank" style="text-decoration:none; color:inherit;">
        <div class="glass-effect card" style="flex:0 0 260px; min-height:200px; padding:1.5rem; border-radius:var(--medium-radius);">
          <h3>${product.name}</h3>
          <figure class="card__media">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </figure>
          <p>${product.description || `${product.brand} ${product.model}`}</p>
          <div class="card__price">$${product.basePrice.toLocaleString()}</div>
        </div>
      </a>
    `;

    container.insertAdjacentHTML('beforeend', cardHTML);
  }

  updateStorePage() {
    const storeGrid = document.getElementById('grid');
    if (!storeGrid) return;

    // Clear existing products
    storeGrid.innerHTML = '';

    // Get active products
    const activeProducts = this.products.filter(p => p.status === 'active');

    activeProducts.forEach(product => {
      const category = this.categories ?
        this.categories.find(c => c.id === product.categoryId) : null;

      const cardHTML = `
        <article class="card glass-effect"
                 data-model="${product.name}"
                 data-capacity="256GB"
                 data-cat="${product.brand.toLowerCase()}"
                 data-type="celulares"
                 onclick="window.location.href='${this.getProductUrl(product)}'">
          <h3 class="card__title">${product.name}</h3>
          <figure class="card__media">
            <img src="${product.image}" alt="${product.name}">
          </figure>
          <p class="card__desc">${product.description || `${product.brand} ${product.model}`}</p>
          <div class="card__price">$${product.basePrice.toLocaleString()}</div>
        </article>
      `;

      storeGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
  }

  getProductUrl(product) {
    // For now, redirect to the generic product page
    // In the future, this could be dynamic based on product ID
    return 'Publi.html';
  }

  setupProductInteractions() {
    // Listen for admin data changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'admin_products' || e.key === 'admin_categories') {
        this.loadProductsFromAdmin();
      }
    });

    // Refresh data periodically (in case of same-tab admin changes)
    setInterval(() => {
      this.loadProductsFromAdmin();
    }, 30000); // Every 30 seconds
  }

  // Method to manually refresh from admin panel
  refreshFromAdmin() {
    this.loadProductsFromAdmin();
    this.showNotification('Productos actualizados desde el panel de administración');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'store-notification';
    notification.innerHTML = `
      <i class="fa-solid fa-check-circle"></i>
      ${message}
    `;

    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .store-notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background: rgba(76, 175, 80, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 15px;
          padding: 1rem 1.5rem;
          color: white;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideInRight 0.3s ease;
          max-width: 300px;
          font-size: 0.9rem;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  updateProductDisplay() {
    // Method for updating product display - can be expanded as needed
    console.log('Product display updated');
  }
}

// Initialize store integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.storeIntegration = new StoreIntegration();
});

// Global function to refresh from admin
window.refreshStoreFromAdmin = () => {
  if (window.storeIntegration) {
    window.storeIntegration.refreshFromAdmin();
  }
};