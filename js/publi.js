// ==================== PUBLI.JS - Product Detail Page ====================

// Obtener el ID del producto desde la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let BASE = 0; // precio base (se actualizará con datos reales)
const fmt = (v) => "$" + v.toLocaleString("en-US");

// Variables que se inicializarán cuando el DOM esté listo
let img, priceEl, sumModel, sumRam, sumColor, sumCap, sumQty;

let colorDelta = 0,
  capDelta = 0,
  ramDelta = 0,
  qty = 1;

// Variables globales para variantes
let allVariants = [];

// Función de cálculo de precio
function calc() {
  const variant = getCurrentVariant();
  const unitPrice = variant ? variant.Precio || variant.precio || 0 : BASE;
  const total = unitPrice * qty;
  priceEl.textContent = fmt(total);

  // Mostrar stock si existe
  const stock = variant ? variant.Stock || variant.stock || 0 : 0;
  console.log("Precio:", unitPrice, "Stock:", stock);
}

// Obtener variante actual según selección
function getCurrentVariant() {
  const selectedRam = document.querySelector("#ramRow .publi-opt.is-active")
    ?.dataset.ram;
  const selectedColor = document.querySelector(".publi-swatch.is-active")
    ?.dataset.color;
  const selectedStorage = document.querySelector("#capRow .publi-opt.is-active")
    ?.dataset.cap;

  console.log("Buscando variante:", {
    selectedRam,
    selectedColor,
    selectedStorage,
  });

  const found = allVariants.find((v) => {
    const vRam = v.Ram || v.ram;
    const vColor = v.Color || v.color;
    const vStorage = v.Almacenamiento || v.almacenamiento;

    return (
      vRam === selectedRam &&
      vColor === selectedColor &&
      vStorage === selectedStorage
    );
  });

  console.log("Variante encontrada:", found);
  return found;
}

// Filtrar opciones disponibles según selección
function filterAvailableOptions() {
  const selectedRam = document.querySelector("#ramRow .publi-opt.is-active")?.dataset.ram;
  const selectedStorage = document.querySelector("#capRow .publi-opt.is-active")?.dataset.cap;

  console.log('Filtering options. Selected:', { selectedRam, selectedStorage });

  // Filtrar almacenamientos disponibles según RAM seleccionada
  if (selectedRam) {
    const availableStorages = [...new Set(
      allVariants
        .filter(v => (v.Ram || v.ram) === selectedRam)
        .map(v => v.Almacenamiento || v.almacenamiento)
    )].filter(Boolean);

    console.log('Available storages for RAM', selectedRam, ':', availableStorages);

    document.querySelectorAll("#capRow .publi-opt").forEach(btn => {
      if (availableStorages.includes(btn.dataset.cap)) {
        btn.disabled = false;
        btn.style.opacity = "1";
      } else {
        btn.disabled = true;
        btn.style.opacity = "0.3";
      }
    });

    // Si el almacenamiento actual no está disponible, seleccionar el primero disponible
    if (selectedStorage && !availableStorages.includes(selectedStorage)) {
      const firstAvailable = document.querySelector("#capRow .publi-opt:not([disabled])");
      if (firstAvailable) {
        document.querySelectorAll("#capRow .publi-opt").forEach(x => x.classList.remove("is-active"));
        firstAvailable.classList.add("is-active");
        sumCap.textContent = firstAvailable.dataset.cap;
      }
    }
  }

  // Filtrar colores disponibles según RAM y Almacenamiento
  // IMPORTANTE: Solo filtrar si AMBOS están seleccionados
  if (selectedRam && selectedStorage) {
    const availableColors = [...new Set(
      allVariants
        .filter(v =>
          (v.Ram || v.ram) === selectedRam &&
          (v.Almacenamiento || v.almacenamiento) === selectedStorage
        )
        .map(v => v.Color || v.color)
    )].filter(Boolean);

    console.log('Available colors for', selectedRam, '+', selectedStorage, ':', availableColors);

    document.querySelectorAll(".publi-swatch").forEach(btn => {
      if (availableColors.includes(btn.dataset.color)) {
        btn.disabled = false;
        btn.style.opacity = "1";
      } else {
        btn.disabled = true;
        btn.style.opacity = "0.3";
      }
    });

    // Si el color actual no está disponible, seleccionar el primero disponible
    const selectedColor = document.querySelector(".publi-swatch.is-active")?.dataset.color;
    if (selectedColor && !availableColors.includes(selectedColor)) {
      const firstAvailable = document.querySelector(".publi-swatch:not([disabled])");
      if (firstAvailable) {
        document.querySelectorAll(".publi-swatch").forEach(x => x.classList.remove("is-active"));
        firstAvailable.classList.add("is-active");
        sumColor.textContent = firstAvailable.dataset.color;
      }
    }
  } else {
    // Si no hay RAM y almacenamiento seleccionados, habilitar todos los colores
    console.log('Not filtering colors - waiting for RAM and storage selection');
    document.querySelectorAll(".publi-swatch").forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = "1";
    });
  }
}

// Event Listeners
function setupEventListeners() {
  // Colores
  document.getElementById("colorRow").addEventListener("click", (e) => {
    const b = e.target.closest(".publi-swatch");
    if (!b || b.disabled) return;
    document
      .querySelectorAll(".publi-swatch")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    colorDelta = +b.dataset.delta || 0;
    sumColor.textContent = b.dataset.color;
    if (b.dataset.img) img.src = b.dataset.img;
    calc();
  });

  // RAM
  document.getElementById("ramRow").addEventListener("click", (e) => {
    const b = e.target.closest(".publi-opt");
    if (!b) return;
    document
      .querySelectorAll("#ramRow .publi-opt")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    ramDelta = +b.dataset.delta || 0;
    sumRam.textContent = b.dataset.ram;

    // Filtrar opciones disponibles
    filterAvailableOptions();
    calc();
  });

  // Capacidad
  document.getElementById("capRow").addEventListener("click", (e) => {
    const b = e.target.closest(".publi-opt");
    if (!b || b.disabled) return;
    document
      .querySelectorAll("#capRow .publi-opt")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    capDelta = +b.dataset.delta || 0;
    sumCap.textContent = b.dataset.cap;

    // Filtrar opciones disponibles
    filterAvailableOptions();
    calc();
  });

  // Cantidad 1..5
  document.getElementById("qtyRow").addEventListener("click", (e) => {
    const b = e.target.closest(".publi-opt");
    if (!b) return;
    const op = b.dataset.q;
    if (op === "+1") qty = Math.min(5, qty + 1);
    if (op === "-1") qty = Math.max(1, qty - 1);
    document.getElementById("qty").textContent = qty;
    sumQty.textContent = qty;
    calc();
  });

  // Botón de compra
  document.getElementById("buyBtn").addEventListener("click", (e) => {
    const url = e.currentTarget.dataset.redirect;
    if (url) {
      window.location.href = url;
    } else {
      alert(
        "Compra: " +
          document.getElementById("summary").textContent +
          " · Total " +
          priceEl.textContent
      );
    }
  });

  // Fallback para imagen
  img.addEventListener(
    "error",
    () => {
      img.src = "https://via.placeholder.com/600x600?text=Producto";
    },
    { once: true }
  );
}

// Helper para obtener color hex aproximado
function getColorHex(colorName) {
  const colors = {
    blanco: "#f2f2f2",
    negro: "#0b0b0c",
    azul: "#3b82f6",
    rosa: "#ff80ab",
    verde: "#22c55e",
    rojo: "#ef4444",
    amarillo: "#fbbf24",
    purpura: "#a855f7",
    gris: "#6b7280",
    naranja: "#f97316",
  };
  return colors[colorName.toLowerCase()] || "#9ca3af";
}

// Cargar datos del producto desde la API
async function loadProductData() {
  if (!productId) {
    console.warn("No se especificó ID de producto");
    alert("No se especificó un producto válido");
    window.location.href = "Tienda.html";
    return;
  }

  try {
    // Cargar axios si no está disponible
    if (typeof axios === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Obtener producto
    console.log("Fetching product with ID:", productId);
    const res = await axios.get(`/api/Producto/${productId}`);
    const product = res.data;

    if (!product) {
      alert("Producto no encontrado");
      window.location.href = "Tienda.html";
      return;
    }

    console.log("Product loaded:", product);

    // Actualizar título y modelo
    const modelo = `${product.Marca || product.marca || ""} ${
      product.Modelo || product.modelo || ""
    }`.trim();
    document.getElementById("publiModel").textContent = modelo;
    sumModel.textContent = modelo;
    document.title = `${modelo} - Origami`;

    // Actualizar imagen principal
    const imgBase64 = product.Img || product.img;
    if (imgBase64) {
      img.src = `data:image/png;base64,${imgBase64}`;
    }

    // Obtener variantes
    console.log("Fetching variants for product ID:", productId);
    const variantesRes = await axios.get(
      `/api/Producto/${productId}/variantes`
    );
    console.log("Variants API response:", variantesRes);
    const variantes = Array.isArray(variantesRes.data) ? variantesRes.data : [];

    console.log("Variantes cargadas:", variantes);

    if (variantes.length === 0) {
      document.getElementById("colorRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No hay variantes disponibles</p>';
      document.getElementById("ramRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No disponible</p>';
      document.getElementById("capRow").innerHTML =
        '<p style="color: var(--text-muted-color);">No disponible</p>';
      document.getElementById("buyBtn").disabled = true;
      return;
    }

    // Guardar variantes globalmente
    allVariants = variantes;

    // Obtener opciones únicas de RAM, Almacenamiento y Color
    const ramOptions = [...new Set(variantes.map((v) => v.Ram || v.ram))]
      .filter(Boolean)
      .sort();
    const storageOptions = [
      ...new Set(variantes.map((v) => v.Almacenamiento || v.almacenamiento)),
    ]
      .filter(Boolean)
      .sort();
    const colorOptions = [
      ...new Set(variantes.map((v) => v.Color || v.color)),
    ].filter(Boolean);

    console.log("Opciones:", {
      ramOptions,
      storageOptions,
      colorOptions,
    });

    // Construir botones de RAM
    const ramRow = document.getElementById("ramRow");
    ramRow.innerHTML = "";
    ramOptions.forEach((ram, idx) => {
      const btn = document.createElement("button");
      btn.className = "publi-opt" + (idx === 0 ? " is-active" : "");
      btn.dataset.ram = ram;
      btn.dataset.delta = 0;
      btn.textContent = ram;
      ramRow.appendChild(btn);
    });

    // Construir botones de color (círculos con color)
    const colorRow = document.getElementById("colorRow");
    colorRow.innerHTML = "";
    colorOptions.forEach((color, idx) => {
      const btn = document.createElement("button");
      btn.className = "publi-swatch" + (idx === 0 ? " is-active" : "");
      btn.title = color;
      btn.dataset.color = color;
      btn.dataset.delta = 0;
      btn.dataset.img = imgBase64 ? `data:image/png;base64,${imgBase64}` : "";
      btn.style.setProperty("--c", getColorHex(color));

      // Agregar texto del color dentro del círculo
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.bottom = "-20px";
      span.style.left = "50%";
      span.style.transform = "translateX(-50%)";
      span.style.fontSize = "0.7rem";
      span.style.whiteSpace = "nowrap";
      span.textContent = color;
      btn.appendChild(span);

      colorRow.appendChild(btn);
    });

    // Construir botones de almacenamiento
    const capRow = document.getElementById("capRow");
    capRow.innerHTML = "";
    storageOptions.forEach((storage, idx) => {
      const btn = document.createElement("button");
      btn.className = "publi-opt" + (idx === 0 ? " is-active" : "");
      btn.dataset.cap = storage;
      btn.dataset.delta = 0;
      btn.textContent = storage;
      capRow.appendChild(btn);
    });

    // Actualizar precio base con la primera variante
    const firstVariant = variantes[0];
    BASE = firstVariant ? firstVariant.Precio || firstVariant.precio || 0 : 0;

    // Actualizar summary inicial
    sumRam.textContent = ramOptions[0] || "N/A";
    sumColor.textContent = colorOptions[0] || "N/A";
    sumCap.textContent = storageOptions[0] || "N/A";

    // Aplicar filtros iniciales según la primera RAM seleccionada
    filterAvailableOptions();

    // Calcular precio inicial
    calc();
  } catch (error) {
    console.error("Error cargando producto:", error);
    console.error("Error details:", error.response?.data || error.message);
    alert(
      "Error al cargar el producto: " +
        (error.response?.data?.message || error.message)
    );
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar referencias a elementos DOM
  img = document.getElementById("publiImg");
  priceEl = document.getElementById("price");
  sumModel = document.getElementById("sumModel");
  sumRam = document.getElementById("sumRam");
  sumColor = document.getElementById("sumColor");
  sumCap = document.getElementById("sumCap");
  sumQty = document.getElementById("sumQty");

  console.log("DOM loaded. Product ID:", productId);
  console.log("Elements initialized:", { img, priceEl, sumModel });

  setupEventListeners();
  loadProductData();
});
