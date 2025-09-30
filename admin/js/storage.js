// ==================== LOCAL STORAGE SYSTEM ====================

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    // Initialize storage with default data if empty
    this.initializeDefaultData();
  }

  // ==================== PRODUCTS ====================

  getProducts() {
    try {
      return JSON.parse(localStorage.getItem('admin_products') || '[]');
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  saveProducts(products) {
    try {
      localStorage.setItem('admin_products', JSON.stringify(products));
      this.updateTimestamp('products');
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  addProduct(product) {
    const products = this.getProducts();
    product.id = this.generateId();
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    products.push(product);
    return this.saveProducts(products) ? product : null;
  }

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return false;

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveProducts(products);
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    return this.saveProducts(filtered);
  }

  getProduct(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  // ==================== CATEGORIES ====================

  getCategories() {
    try {
      return JSON.parse(localStorage.getItem('admin_categories') || '[]');
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  saveCategories(categories) {
    try {
      localStorage.setItem('admin_categories', JSON.stringify(categories));
      this.updateTimestamp('categories');
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  }

  addCategory(category) {
    const categories = this.getCategories();
    category.id = this.generateId();
    category.createdAt = new Date().toISOString();
    category.updatedAt = new Date().toISOString();
    categories.push(category);
    return this.saveCategories(categories) ? category : null;
  }

  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) return false;

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveCategories(categories);
  }

  deleteCategory(id) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    return this.saveCategories(filtered);
  }

  getCategory(id) {
    const categories = this.getCategories();
    return categories.find(c => c.id === id) || null;
  }

  // ==================== VARIANTS ====================

  getVariants() {
    try {
      return JSON.parse(localStorage.getItem('admin_variants') || '[]');
    } catch (error) {
      console.error('Error loading variants:', error);
      return [];
    }
  }

  saveVariants(variants) {
    try {
      localStorage.setItem('admin_variants', JSON.stringify(variants));
      this.updateTimestamp('variants');
      return true;
    } catch (error) {
      console.error('Error saving variants:', error);
      return false;
    }
  }

  addVariant(variant) {
    const variants = this.getVariants();
    variant.id = this.generateId();
    variant.createdAt = new Date().toISOString();
    variant.updatedAt = new Date().toISOString();
    variants.push(variant);
    return this.saveVariants(variants) ? variant : null;
  }

  updateVariant(id, updates) {
    const variants = this.getVariants();
    const index = variants.findIndex(v => v.id === id);

    if (index === -1) return false;

    variants[index] = {
      ...variants[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveVariants(variants);
  }

  deleteVariant(id) {
    const variants = this.getVariants();
    const filtered = variants.filter(v => v.id !== id);
    return this.saveVariants(variants);
  }

  getVariant(id) {
    const variants = this.getVariants();
    return variants.find(v => v.id === id) || null;
  }

  getVariantsByProduct(productId) {
    const variants = this.getVariants();
    return variants.filter(v => v.productId === productId);
  }

  // ==================== ORDERS ====================

  getOrders() {
    try {
      return JSON.parse(localStorage.getItem('admin_orders') || '[]');
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  saveOrders(orders) {
    try {
      localStorage.setItem('admin_orders', JSON.stringify(orders));
      this.updateTimestamp('orders');
      return true;
    } catch (error) {
      console.error('Error saving orders:', error);
      return false;
    }
  }

  addOrder(order) {
    const orders = this.getOrders();
    order.id = this.generateId();
    order.createdAt = new Date().toISOString();
    order.status = order.status || 'pending';
    orders.push(order);
    return this.saveOrders(orders) ? order : null;
  }

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) return false;

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();

    return this.saveOrders(orders);
  }

  // ==================== UTILITY METHODS ====================

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  updateTimestamp(entity) {
    const timestamps = this.getTimestamps();
    timestamps[entity] = new Date().toISOString();
    localStorage.setItem('admin_timestamps', JSON.stringify(timestamps));
  }

  getTimestamps() {
    try {
      return JSON.parse(localStorage.getItem('admin_timestamps') || '{}');
    } catch (error) {
      return {};
    }
  }

  // ==================== ANALYTICS & STATS ====================

  getStats() {
    const products = this.getProducts();
    const categories = this.getCategories();
    const variants = this.getVariants();
    const orders = this.getOrders();

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalVariants: variants.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0),
      averageOrderValue: this.calculateAverageOrderValue(orders),
      topCategories: this.getTopCategories(products, categories),
      recentActivity: this.getRecentActivity()
    };
  }

  calculateAverageOrderValue(orders) {
    const completedOrders = orders.filter(o => o.status === 'completed');
    if (completedOrders.length === 0) return 0;

    const total = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    return Math.round(total / completedOrders.length);
  }

  getTopCategories(products, categories) {
    const categoryCounts = {};

    products.forEach(product => {
      const categoryId = product.categoryId;
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([id, count]) => {
        const category = categories.find(c => c.id === id);
        return {
          name: category ? category.name : 'Sin categoría',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getRecentActivity() {
    const timestamps = this.getTimestamps();
    return Object.entries(timestamps)
      .map(([entity, timestamp]) => ({
        entity,
        timestamp,
        timeAgo: this.getTimeAgo(timestamp)
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    return 'hace un momento';
  }

  // ==================== DATA EXPORT/IMPORT ====================

  exportData() {
    const data = {
      products: this.getProducts(),
      categories: this.getCategories(),
      variants: this.getVariants(),
      orders: this.getOrders(),
      timestamps: this.getTimestamps(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (data.products) this.saveProducts(data.products);
      if (data.categories) this.saveCategories(data.categories);
      if (data.variants) this.saveVariants(data.variants);
      if (data.orders) this.saveOrders(data.orders);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData() {
    localStorage.removeItem('admin_products');
    localStorage.removeItem('admin_categories');
    localStorage.removeItem('admin_variants');
    localStorage.removeItem('admin_orders');
    localStorage.removeItem('admin_timestamps');
  }

  // ==================== INITIALIZATION ====================

  initializeDefaultData() {
    // Initialize with sample data if empty
    if (this.getCategories().length === 0) {
      this.initializeDefaultCategories();
    }

    if (this.getProducts().length === 0) {
      this.initializeDefaultProducts();
    }
  }

  initializeDefaultCategories() {
    const defaultCategories = [
      { name: 'Smartphones', description: 'Teléfonos móviles inteligentes', slug: 'smartphones' },
      { name: 'Tablets', description: 'Tablets y dispositivos móviles', slug: 'tablets' },
      { name: 'Accesorios', description: 'Accesorios para dispositivos', slug: 'accesorios' },
      { name: 'Audio', description: 'Auriculares y dispositivos de audio', slug: 'audio' }
    ];

    defaultCategories.forEach(category => this.addCategory(category));
  }

  initializeDefaultProducts() {
    const categories = this.getCategories();
    const smartphoneCategory = categories.find(c => c.slug === 'smartphones');

    if (smartphoneCategory) {
      const defaultProducts = [
        {
          name: 'iPhone 17',
          description: 'El último iPhone con tecnología de vanguardia',
          categoryId: smartphoneCategory.id,
          basePrice: 1299,
          image: 'https://media.bananacomputer.com/iPhone_17_White_2-up_Screen__USEN.png',
          brand: 'Apple',
          model: 'iPhone 17',
          status: 'active'
        },
        {
          name: 'Samsung Galaxy S25',
          description: 'El flagship de Samsung más avanzado',
          categoryId: smartphoneCategory.id,
          basePrice: 1099,
          image: 'https://images.samsung.com/is/image/samsung/assets/global/galaxy-s23/galaxy-s23_highlights_kv_mo.jpg',
          brand: 'Samsung',
          model: 'Galaxy S25',
          status: 'active'
        }
      ];

      defaultProducts.forEach(product => this.addProduct(product));
    }
  }
}

// Initialize storage manager
const storageManager = new StorageManager();

// Export for global use
window.storageManager = storageManager;