// Tienda filters and pagination
// Carga Navbar y Footer
fetch("Navbar/navbar.html")
  .then(r=>r.text())
  .then(h=>{
    document.getElementById("navbar-placeholder").innerHTML = h;
    // Ejecutar la función de autenticación después de cargar el navbar
    setTimeout(async () => {
      if (typeof initNavbarAuth === 'function') {
        await initNavbarAuth();
      } else {
        console.error('initNavbarAuth no está disponible');
      }
    }, 100);
  });

fetch("Footer/footer.html")
  .then(r=>r.text())
  .then(h=>{ document.getElementById("footer-placeholder").innerHTML = h; });

// -------- refs ----------
const q     = document.getElementById('fSearch');
const grid  = document.getElementById('grid');
const pager = document.getElementById('pager');
let all   = [];

// -------- estado ----------
let page = 1;
const pageSize = 9;          // 4x3  (usa 9 para 3x3)
let qVal = '';
let capVal = '';
let brandVal = '';
let activeType = '';          // '', 'celulares', 'accesorios', 'notebooks', 'productos'

// -------- dropdown glass ----------
function wireDropdown(id, onSelect){
  const dd  = document.getElementById(id);
  const btn = dd.querySelector('.dropdown-btn');
  const list= dd.querySelector('.dropdown-list');
  btn.addEventListener('click', ()=> dd.classList.toggle('open'));
  list.addEventListener('click', e=>{
    const it = e.target.closest('.dropdown-item'); if(!it) return;
    btn.innerHTML = `${it.textContent} <span>▾</span>`;
    dd.classList.remove('open');
    onSelect(it.dataset.val || "");
    page = 1; render();
  });
  document.addEventListener('click', e=>{ if(!dd.contains(e.target)) dd.classList.remove('open'); });
}
wireDropdown('capDD',   v => capVal   = v);
wireDropdown('brandDD', v => brandVal = v);

// -------- chips ----------
function ensureTypeDataset(){ all.forEach(el => { if(!el.dataset.type) el.dataset.type = 'celulares'; }); }
document.querySelectorAll('.quickcats .chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    document.querySelectorAll('.quickcats .chip').forEach(x=>x.classList.remove('is-active'));
    ch.classList.add('is-active');
    activeType = ch.dataset.type || '';
    page = 1; render();
  });
});

// -------- texto ----------
q?.addEventListener('input', ()=>{
  qVal = q.value.trim().toLowerCase();
  page = 1; render();
});

// -------- filtros ----------
function applyFilters(){
  return all.filter(el=>{
    const model = (el.dataset.model    || '').toLowerCase();
    const cap   = (el.dataset.capacity || '');
    const brand = (el.dataset.cat      || '').toLowerCase();
    const type  = (el.dataset.type     || 'celulares');

    const okText  = !qVal      || model.includes(qVal);
    const okCap   = !capVal    || cap === capVal;
    const okBrand = !brandVal  || brand === brandVal;
    const okType  = !activeType|| type === activeType;

    return okText && okCap && okBrand && okType;
  });
}

// -------- render + paginación ----------
function render(){
  const items = applyFilters();
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  page = Math.min(page, pages);

  all.forEach(el => el.style.display = 'none');
  items.slice((page-1)*pageSize, page*pageSize).forEach(el => el.style.display = '');

  pager.innerHTML = '';
  const mk = (lbl, p, dis=false)=>{
    const b = document.createElement('button');
    b.className = 'pager__btn glass-circle' + (p===page ? ' is-active' : '');
    b.textContent = lbl; if(dis) b.disabled = true;
    b.onclick = ()=>{ page = p; render(); };
    return b;
  };
  pager.appendChild(mk('‹', Math.max(1, page-1), page===1));
  for(let i=1;i<=pages;i++) pager.appendChild(mk(i, i));
  pager.appendChild(mk('›', Math.min(pages, page+1), page===pages));
  pager.style.display = (pages > 1) ? 'flex' : 'none';
}

async function loadProductsFromApi(){
  try {
    if (typeof axios === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
    }
    const res = await axios.get('/api/Producto');
    const products = Array.isArray(res.data) ? res.data : [];
    grid.innerHTML = '';
    all = products.map(p => {
      const basePrice = (p.variantes && p.variantes.length) ? Math.min(...p.variantes.map(v => v.precio)) : null;
      const priceText = basePrice != null ? `$${basePrice}` : '';
      const imgBase64 = p.img || p.Img;
      const img = imgBase64 ? `data:image/png;base64,${imgBase64}` : 'img/CanvaLogoWeb.webp';

      const article = document.createElement('article');
      article.className = 'card glass-effect';
      article.dataset.model = `${p.Marca || p.marca || ''} ${p.Modelo || p.modelo || ''}`.trim();
      article.dataset.capacity = '';
      article.dataset.cat = (p.Categoria || p.categoria || '').toLowerCase();
      article.dataset.type = 'celulares';
      const productId = p.id ?? p.Id;
      article.onclick = () => { window.location.href = `Publi.html?id=${productId}`; };

      const h3 = document.createElement('h3');
      h3.className = 'card__title';
      h3.textContent = article.dataset.model || 'Producto';

      const fig = document.createElement('figure');
      fig.className = 'card__media';
      const image = document.createElement('img');
      image.src = img; image.alt = '';
      fig.appendChild(image);

      const pDesc = document.createElement('p');
      pDesc.className = 'card__desc';
      pDesc.textContent = p.Categoria || p.categoria || '';

      const price = document.createElement('div');
      price.className = 'card__price';
      price.textContent = priceText;

      article.appendChild(h3);
      article.appendChild(fig);
      article.appendChild(pDesc);
      article.appendChild(price);
      grid.appendChild(article);
      return article;
    });
    ensureTypeDataset();
    render();
  } catch (e) {
    console.error('Error cargando productos de la API:', e);
  }
}

loadProductsFromApi();
