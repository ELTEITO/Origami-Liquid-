// ==================== ORDERS CONTROLLER ====================

class OrdersController {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentFilter = {
      status: '',
      search: '',
      date: ''
    };
    this.currentOrderId = null;

    this.init();
  }

  init() {
    this.loadOrders();
    this.updateOrderStats();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Filters
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.currentFilter.status = e.target.value;
      this.currentPage = 1;
      this.loadOrders();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.currentFilter.search = e.target.value;
      this.currentPage = 1;
      this.loadOrders();
    });

    document.getElementById('dateFilter').addEventListener('change', (e) => {
      this.currentFilter.date = e.target.value;
      this.currentPage = 1;
      this.loadOrders();
    });

    // Status form
    document.getElementById('statusForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateOrderStatus();
    });

    // Global functions
    window.refreshOrders = () => this.loadOrders();
    window.createSampleOrder = () => this.createSampleOrder();
    window.viewOrder = (id) => this.viewOrder(id);
    window.updateStatus = (id) => this.openStatusModal(id);
    window.closeOrderModal = () => this.closeOrderModal();
    window.closeStatusModal = () => this.closeStatusModal();
  }

  loadOrders() {
    try {
      let orders = storageManager.getOrders();

      // Apply filters
      if (this.currentFilter.status) {
        orders = orders.filter(order => order.status === this.currentFilter.status);
      }

      if (this.currentFilter.search) {
        const search = this.currentFilter.search.toLowerCase();
        orders = orders.filter(order =>
          order.id.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.customerEmail.toLowerCase().includes(search)
        );
      }

      if (this.currentFilter.date) {
        const filterDate = new Date(this.currentFilter.date).toDateString();
        orders = orders.filter(order =>
          new Date(order.createdAt).toDateString() === filterDate
        );
      }

      // Sort by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calculate pagination
      const totalOrders = orders.length;
      const totalPages = Math.ceil(totalOrders / this.itemsPerPage);
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      this.renderOrders(paginatedOrders);
      this.renderPagination(totalPages, totalOrders);
      this.updateOrderStats();

    } catch (error) {
      console.error('Error loading orders:', error);
      this.showError('Error al cargar los pedidos');
    }
  }

  renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fa-solid fa-shopping-cart"></i>
            <p>No se encontraron pedidos</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const itemCount = order.items ? order.items.length : 0;
      const firstItem = order.items && order.items[0];

      return `
        <tr>
          <td>
            <code class="order-id">#${order.id.slice(-8).toUpperCase()}</code>
          </td>
          <td>
            <div class="customer-info">
              <div class="customer-name">${order.customerName}</div>
              <div class="customer-email">${order.customerEmail}</div>
            </div>
          </td>
          <td>
            <div class="order-items">
              ${firstItem ? `
                <div class="first-item">${firstItem.name}</div>
                ${itemCount > 1 ? `<div class="item-count">+${itemCount - 1} más</div>` : ''}
              ` : 'Sin productos'}
            </div>
          </td>
          <td>
            <span class="order-total">$${order.total.toLocaleString()}</span>
          </td>
          <td>
            <span class="status-badge status-${order.status}">
              ${this.getStatusLabel(order.status)}
            </span>
          </td>
          <td>
            <div class="date-info">
              <div>${new Date(order.createdAt).toLocaleDateString()}</div>
              <div class="date-time">${new Date(order.createdAt).toLocaleTimeString()}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-small btn-secondary" onclick="viewOrder('${order.id}')" title="Ver detalles">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn btn-small btn-primary" onclick="updateStatus('${order.id}')" title="Cambiar estado">
                <i class="fa-solid fa-edit"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.addOrderTableStyles();
  }

  renderPagination(totalPages, totalOrders) {
    const pagination = document.getElementById('pagination');
    const orderCount = document.getElementById('orderCount');

    orderCount.textContent = `${totalOrders} pedido${totalOrders !== 1 ? 's' : ''}`;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="ordersController.goToPage(${this.currentPage - 1})">
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
      } else if (i <= 2 || i >= totalPages - 1 || Math.abs(i - this.currentPage) <= 1) {
        paginationHTML += `
          <button class="btn btn-secondary btn-small" onclick="ordersController.goToPage(${i})">${i}</button>
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
        <button class="btn btn-secondary btn-small" onclick="ordersController.goToPage(${this.currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;
    }

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadOrders();
  }

  updateOrderStats() {
    const orders = storageManager.getOrders();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
  }

  viewOrder(orderId) {
    const order = storageManager.getOrders().find(o => o.id === orderId);
    if (!order) {
      this.showError('Pedido no encontrado');
      return;
    }

    const modal = document.getElementById('orderModal');
    const detailsContainer = document.getElementById('orderDetails');

    detailsContainer.innerHTML = this.renderOrderDetails(order);
    modal.classList.add('active');
  }

  renderOrderDetails(order) {
    return `
      <div class="order-header">
        <div class="order-info">
          <h3>Pedido #${order.id.slice(-8).toUpperCase()}</h3>
          <div class="order-meta">
            <span class="status-badge status-${order.status}">
              ${this.getStatusLabel(order.status)}
            </span>
            <span class="order-date">${new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div class="order-total-large">
          <div class="total-label">Total</div>
          <div class="total-amount">$${order.total.toLocaleString()}</div>
        </div>
      </div>

      <div class="order-sections">
        <div class="order-section">
          <h4>Información del Cliente</h4>
          <div class="customer-details">
            <div class="detail-row">
              <span class="label">Nombre:</span>
              <span class="value">${order.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${order.customerEmail}</span>
            </div>
            ${order.customerPhone ? `
              <div class="detail-row">
                <span class="label">Teléfono:</span>
                <span class="value">${order.customerPhone}</span>
              </div>
            ` : ''}
            ${order.shippingAddress ? `
              <div class="detail-row">
                <span class="label">Dirección:</span>
                <span class="value">${order.shippingAddress}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="order-section">
          <h4>Productos Pedidos</h4>
          <div class="order-items-detail">
            ${order.items.map(item => `
              <div class="item-detail">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-specs">
                    ${item.color ? `Color: ${item.color}` : ''}
                    ${item.storage ? ` • Almacenamiento: ${item.storage}` : ''}
                  </div>
                </div>
                <div class="item-quantity">x${item.quantity}</div>
                <div class="item-price">$${item.price.toLocaleString()}</div>
                <div class="item-subtotal">$${(item.price * item.quantity).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        </div>

        ${order.notes ? `
          <div class="order-section">
            <h4>Notas</h4>
            <div class="order-notes">${order.notes}</div>
          </div>
        ` : ''}

        <div class="order-section">
          <h4>Historial de Estados</h4>
          <div class="status-history">
            <div class="status-entry">
              <div class="status-date">${new Date(order.createdAt).toLocaleString()}</div>
              <div class="status-action">Pedido creado</div>
            </div>
            ${order.statusHistory ? order.statusHistory.map(entry => `
              <div class="status-entry">
                <div class="status-date">${new Date(entry.date).toLocaleString()}</div>
                <div class="status-action">Estado cambiado a: ${this.getStatusLabel(entry.status)}</div>
                ${entry.notes ? `<div class="status-notes">${entry.notes}</div>` : ''}
              </div>
            `).join('') : ''}
          </div>
        </div>
      </div>

      <div class="order-actions">
        <button class="btn btn-primary" onclick="updateStatus('${order.id}')">
          <i class="fa-solid fa-edit"></i> Cambiar Estado
        </button>
        <button class="btn btn-secondary" onclick="closeOrderModal()">Cerrar</button>
      </div>
    `;
  }

  closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
  }

  openStatusModal(orderId) {
    const order = storageManager.getOrders().find(o => o.id === orderId);
    if (!order) {
      this.showError('Pedido no encontrado');
      return;
    }

    this.currentOrderId = orderId;
    document.getElementById('statusOrderId').value = orderId;
    document.getElementById('newStatus').value = order.status;
    document.getElementById('statusNotes').value = '';

    const modal = document.getElementById('statusModal');
    modal.classList.add('active');
  }

  closeStatusModal() {
    const modal = document.getElementById('statusModal');
    modal.classList.remove('active');
    this.currentOrderId = null;
  }

  updateOrderStatus() {
    try {
      const orderId = document.getElementById('statusOrderId').value;
      const newStatus = document.getElementById('newStatus').value;
      const notes = document.getElementById('statusNotes').value;

      if (!orderId || !newStatus) {
        this.showError('Datos incompletos');
        return;
      }

      // Get the order
      const orders = storageManager.getOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        this.showError('Pedido no encontrado');
        return;
      }

      // Update the order
      const order = orders[orderIndex];
      const oldStatus = order.status;
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        date: new Date().toISOString(),
        status: newStatus,
        previousStatus: oldStatus,
        notes: notes || undefined
      });

      // Save the updated orders
      const success = storageManager.saveOrders(orders);

      if (success) {
        this.showSuccess('Estado del pedido actualizado correctamente');
        this.closeStatusModal();
        this.closeOrderModal(); // Close order details modal if open
        this.loadOrders();
      } else {
        this.showError('Error al actualizar el estado del pedido');
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      this.showError('Error al actualizar el estado del pedido');
    }
  }

  createSampleOrder() {
    try {
      const products = storageManager.getProducts();
      if (products.length === 0) {
        this.showError('No hay productos disponibles para crear un pedido de prueba');
        return;
      }

      // Create a sample order with random products
      const sampleProducts = products.slice(0, Math.min(3, products.length));
      const items = sampleProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.basePrice,
        quantity: Math.floor(Math.random() * 3) + 1,
        color: 'Blanco',
        storage: '256GB'
      }));

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const sampleOrder = {
        customerName: 'Cliente de Prueba',
        customerEmail: 'cliente@ejemplo.com',
        customerPhone: '+1234567890',
        shippingAddress: 'Calle Falsa 123, Ciudad, País',
        items: items,
        total: total,
        status: 'pending',
        notes: 'Este es un pedido de prueba generado automáticamente'
      };

      const newOrder = storageManager.addOrder(sampleOrder);

      if (newOrder) {
        this.showSuccess('Pedido de prueba creado correctamente');
        this.loadOrders();
      } else {
        this.showError('Error al crear el pedido de prueba');
      }

    } catch (error) {
      console.error('Error creating sample order:', error);
      this.showError('Error al crear el pedido de prueba');
    }
  }

  getStatusLabel(status) {
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  addOrderTableStyles() {
    if (document.querySelector('#order-table-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'order-table-styles';
    styles.textContent = `
      .order-stats {
        grid-template-columns: repeat(4, 1fr);
        margin-bottom: 2rem;
      }

      .order-id {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: var(--text-color);
      }

      .customer-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .customer-name {
        font-weight: 600;
        color: var(--text-color);
      }

      .customer-email {
        font-size: 0.85rem;
        color: var(--text-muted-color);
      }

      .order-items {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .first-item {
        font-weight: 500;
        color: var(--text-color);
      }

      .item-count {
        font-size: 0.85rem;
        color: var(--text-muted-color);
      }

      .order-total {
        font-weight: 600;
        color: var(--active-text-color);
        font-size: 1.1rem;
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .status-pending {
        background: rgba(255, 152, 0, 0.2);
        color: #FF9800;
        border: 1px solid rgba(255, 152, 0, 0.3);
      }

      .status-processing {
        background: rgba(33, 150, 243, 0.2);
        color: #2196F3;
        border: 1px solid rgba(33, 150, 243, 0.3);
      }

      .status-shipped {
        background: rgba(156, 39, 176, 0.2);
        color: #9C27B0;
        border: 1px solid rgba(156, 39, 176, 0.3);
      }

      .status-delivered {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      .status-cancelled {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }

      .large-modal .modal-content {
        max-width: 800px;
        width: 95%;
      }

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      .order-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
      }

      .order-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .order-date {
        color: var(--text-muted-color);
        font-size: 0.9rem;
      }

      .order-total-large {
        text-align: right;
      }

      .total-label {
        color: var(--text-muted-color);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .total-amount {
        font-size: 2rem;
        font-weight: 700;
        color: var(--active-text-color);
      }

      .order-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .order-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--nav-item-radius);
        padding: 1.5rem;
        border: 1px solid var(--border-color);
      }

      .order-section h4 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
        font-size: 1.2rem;
      }

      .customer-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .detail-row .label {
        color: var(--text-muted-color);
        font-weight: 600;
      }

      .detail-row .value {
        color: var(--text-color);
      }

      .order-items-detail {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .item-detail {
        display: grid;
        grid-template-columns: 2fr auto auto auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .item-name {
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .item-specs {
        font-size: 0.85rem;
        color: var(--text-muted-color);
      }

      .item-quantity {
        color: var(--text-muted-color);
        text-align: center;
      }

      .item-price {
        color: var(--text-color);
        text-align: right;
      }

      .item-subtotal {
        font-weight: 600;
        color: var(--active-text-color);
        text-align: right;
      }

      .order-notes {
        color: var(--text-color);
        line-height: 1.6;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .status-history {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .status-entry {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .status-date {
        font-size: 0.85rem;
        color: var(--text-muted-color);
        margin-bottom: 0.25rem;
      }

      .status-action {
        color: var(--text-color);
        font-weight: 600;
      }

      .status-notes {
        margin-top: 0.5rem;
        color: var(--text-muted-color);
        font-style: italic;
      }

      .order-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .order-stats {
          grid-template-columns: repeat(2, 1fr);
        }

        .order-header {
          flex-direction: column;
          gap: 1rem;
        }

        .order-total-large {
          text-align: left;
        }

        .item-detail {
          grid-template-columns: 1fr;
          text-align: left;
        }

        .detail-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
      }
    `;

    document.head.appendChild(styles);
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

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize orders controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.ordersController = new OrdersController();
});