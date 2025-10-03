// ==================== CART UI + STATE ====================
(function(){
  const STORAGE_KEY = 'cart_items';

  function getItems(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function setItems(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

  function getCount(){ return getItems().reduce((s, it) => s + (Number(it.qty)||0), 0); }
  function getTotal(){ return getItems().reduce((s, it) => s + (Number(it.unitPrice)||0) * (Number(it.qty)||0), 0); }
  function fmt(n){ return '$' + Number(n).toLocaleString('en-US'); }

  function renderBadge(){
    const el = document.getElementById('cartCount'); if(!el) return;
    el.textContent = getCount();
  }

  function renderModal(){
    const list = document.getElementById('cartList');
    const total = document.getElementById('cartTotal');
    if(!list || !total) return;
    const items = getItems();
    list.innerHTML = '';
    if(items.length === 0){
      list.innerHTML = '<div style="padding: 24px 12px; text-align: center; opacity:.85;">Tu carrito está vacío.</div>';
    } else {
      items.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <img class="cart-item__img" src="${it.img || 'img/CanvaLogoWeb.webp'}" alt="${it.model}">
          <div class="cart-item__info">
            <div class="cart-item__title">${it.model}</div>
            <div class="cart-item__meta">${it.ram} · ${it.storage} · ${it.color || ''}</div>
            <div class="cart-item__price">${fmt(it.unitPrice)}</div>
            <div class="cart-item__qty">
              <button data-act="dec" data-idx="${idx}">−</button>
              <span>${it.qty}</span>
              <button data-act="inc" data-idx="${idx}">+</button>
              <button data-act="del" data-idx="${idx}" style="margin-left:8px">🗑️</button>
            </div>
          </div>
        `;
        list.appendChild(row);
      });
    }
    total.textContent = fmt(getTotal());
  }

  function openModal(){ const m = document.getElementById('cartModal'); if(!m) return; m.classList.add('is-open'); m.setAttribute('aria-hidden','false'); renderModal(); }
  function closeModal(){ const m = document.getElementById('cartModal'); if(!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden','true'); }

  function handleModalClicks(e){
    const btn = e.target.closest('[data-cart-close]'); if(btn){ closeModal(); return; }
    const actBtn = e.target.closest('button[data-act]');
    if(!actBtn) return;
    const idx = Number(actBtn.dataset.idx);
    const act = actBtn.dataset.act;
    const items = getItems();
    const it = items[idx]; if(!it) return;
    if(act === 'inc'){ it.qty = Math.min((it.stock || 99), (Number(it.qty)||0) + 1); }
    if(act === 'dec'){ it.qty = Math.max(1, (Number(it.qty)||0) - 1); }
    if(act === 'del'){ items.splice(idx,1); }
    setItems(items);
    renderBadge();
    renderModal();
  }

  // Función para Cotizar por WhatsApp
  function sendToWhatsApp(){
    const items = getItems();
    if(items.length === 0){
      alert('Tu carrito está vacío');
      return;
    }
    
    // Número de WhatsApp (incluir código de país sin +, ej: 5491234567890)
    const phoneNumber = '541122692061'; // CAMBIAR POR TU NÚMERO
    
    // Construir mensaje
    let message = 'Hola, quisiera hacer un pedido: 🛒 *Mi Lista de Productos*\n\n';
    items.forEach((it, idx) => {
      message += `${idx + 1}. *${it.model}*\n`;
      message += `   📱 ${it.ram} · ${it.storage}`;
      if(it.color) message += ` · ${it.color}`;
      message += `\n   💰 ${fmt(it.unitPrice)} x ${it.qty} = ${fmt(it.unitPrice * it.qty)}\n\n`;
    });
    message += `*Total: ${fmt(getTotal())}*\n\n`;
    message += '¡Espero tu respuesta! 😊';
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  }

  // Delegación de eventos para soportar navbar inyectado dinámicamente
  document.addEventListener('click', (e)=>{
    if (e.target.closest('#cartButton')) { e.preventDefault(); openModal(); }
    if (e.target.closest('[data-cart-close]')) { e.preventDefault(); closeModal(); }
    if (e.target.closest('button[data-act]')) { handleModalClicks(e); }
    if (e.target.closest('#sendWhatsAppBtn')) { e.preventDefault(); sendToWhatsApp(); }
  });

  // Carga el modal del carrito
  function loadCartModal(){
    if (document.getElementById('cartModal')) return Promise.resolve();
    return fetch('../components/cart-modal.html')
      .then(r => r.text())
      .then(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const modal = temp.querySelector('#cartModal');
        if (modal) document.body.appendChild(modal);
      })
      .catch(err => console.error('Error loading cart modal:', err));
  }

  // Render inmediato y cuando aparezca el navbar
  document.addEventListener('DOMContentLoaded', ()=>{
    loadCartModal().then(() => {
      ensureModalInBody();
      renderBadge();
    });
    // Observa el DOM hasta que exista #cartCount (navbar cargado por fetch)
    if (!document.getElementById('cartCount')){
      const obs = new MutationObserver(()=>{
        const hasCount = document.getElementById('cartCount');
        if (!document.getElementById('cartModal')) loadCartModal();
        if (hasCount){ renderBadge(); obs.disconnect(); }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
  });

  window.addEventListener('storage', (e)=>{ if(e.key === STORAGE_KEY) { renderBadge(); renderModal(); } });
  window.refreshCartBadge = renderBadge;

  function ensureModalInBody(){
    const modal = document.getElementById('cartModal');
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
  }
})();


