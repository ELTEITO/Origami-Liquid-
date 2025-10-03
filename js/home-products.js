// Home products loader - Carga productos desde el backend
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.bottom-nav__item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.classList.contains('bottom-nav__search-icon')) {
                navItems.forEach(nav => {
                    if (!nav.classList.contains('bottom-nav__search-icon')) {
                        nav.classList.remove('active');
                    }
                });
                this.classList.add('active');
            }
        });
    });

    const backgroundImages = [
        'https://assets.codepen.io/252820/unsplash-mountain3.webp',
    ];

    let currentImageIndex = 0;
    const body = document.body;

    function changeBackground() {
        const nextImage = new Image();
        const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
        nextImage.src = backgroundImages[nextImageIndex];

        body.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;

        currentImageIndex = nextImageIndex;
    }

    changeBackground();

    // Render dinámico de productos desde backend
    (async function loadHomeProducts(){
      try {
        if (typeof axios === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
          await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
        }
        const res = await axios.get('/api/Producto');
        const products = Array.isArray(res.data) ? res.data : [];
        const container = document.getElementById('home-products');
        const iphoneContainer = document.getElementById('home-iphone');
        container.innerHTML = '';
        iphoneContainer.innerHTML = '<h2 style="flex-basis:100%; margin:0 0 1rem 0;">Ultimos IPhone</h2>';

        const cards = products.slice(0, 12).map(p => {
          const basePrice = (p.variantes && p.variantes.length) ? Math.min(...p.variantes.map(v => v.precio)) : null;
          const priceText = basePrice != null ? `$${basePrice}` : '';
          const imgBase64 = p.img || p.Img;
          const img = imgBase64 ? `data:image/png;base64,${imgBase64}` : 'img/CanvaLogoWeb.webp';
          const productId = p.id ?? p.Id;

          const a = document.createElement('a');
          a.href = `Publi.html?id=${productId}`;
          a.style.textDecoration = 'none';
          a.style.color = 'inherit';

          const card = document.createElement('div');
          card.className = 'glass-effect card';
          card.style.flex = '0 0 260px';
          card.style.minHeight = '200px';
          card.style.padding = '1.5rem';
          card.style.borderRadius = 'var(--medium-radius)';

          const h3 = document.createElement('h3');
          h3.textContent = `${p.Marca || p.marca || ''} ${p.Modelo || p.modelo || ''}`.trim() || (p.Modelo || p.modelo || 'Producto');

          const fig = document.createElement('figure');
          fig.className = 'card__media';
          const image = document.createElement('img');
          image.src = img;
          image.alt = 'Producto';
          image.loading = 'lazy';
          fig.appendChild(image);

          const pDesc = document.createElement('p');
          pDesc.textContent = p.Categoria || p.categoria || '';

          const price = document.createElement('div');
          price.className = 'card__price';
          price.textContent = priceText;

          card.appendChild(h3);
          card.appendChild(fig);
          card.appendChild(pDesc);
          card.appendChild(price);
          a.appendChild(card);
          return a;
        });

        if (cards.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'glass-effect';
          empty.style.padding = '1rem';
          empty.textContent = 'No hay productos disponibles.';
          container.appendChild(empty);
        } else {
          cards.forEach(c => container.appendChild(c));
        }

        // iPhone (Apple) únicamente
        const appleCards = products.filter(p => (p.Marca || p.marca || '').toLowerCase() === 'apple')
          .slice(0, 12)
          .map(p => {
            const basePrice = (p.variantes && p.variantes.length) ? Math.min(...p.variantes.map(v => v.precio)) : null;
            const priceText = basePrice != null ? `$${basePrice}` : '';
            const imgBase64 = p.img || p.Img;
            const img = imgBase64 ? `data:image/png;base64,${imgBase64}` : 'img/CanvaLogoWeb.webp';
            const productId = p.id ?? p.Id;

            const a = document.createElement('a');
            a.href = `Publi.html?id=${productId}`;
            a.style.textDecoding = 'none';
            a.style.color = 'inherit';

            const card = document.createElement('div');
            card.className = 'glass-effect card';
            card.style.flex = '0 0 260px';
            card.style.minHeight = '200px';
            card.style.padding = '1.5rem';
            card.style.borderRadius = 'var(--medium-radius)';

            const h3 = document.createElement('h3');
            h3.textContent = `${p.Marca || p.marca || ''} ${p.Modelo || p.modelo || ''}`.trim() || (p.Modelo || p.modelo || 'Producto');

            const fig = document.createElement('figure');
            fig.className = 'card__media';
            const image = document.createElement('img');
            image.src = img; image.alt = 'Producto'; image.loading = 'lazy';
            fig.appendChild(image);

            const pDesc = document.createElement('p');
            pDesc.textContent = p.Categoria || p.categoria || '';

            const price = document.createElement('div');
            price.className = 'card__price';
            price.textContent = priceText;

            card.appendChild(h3);
            card.appendChild(fig);
            card.appendChild(pDesc);
            card.appendChild(price);
            a.appendChild(card);
            return a;
          });
        if (appleCards.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'glass-effect';
          empty.style.padding = '1rem';
          empty.textContent = 'No hay productos Apple disponibles.';
          iphoneContainer.appendChild(empty);
        } else {
          appleCards.forEach(c => iphoneContainer.appendChild(c));
        }
      } catch (e) {
        console.error('Error cargando productos del backend:', e);
      }
    })();
});
