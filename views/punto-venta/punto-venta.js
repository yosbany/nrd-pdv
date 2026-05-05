// Vista Punto de venta - Catálogo de productos + carrito
const logger = window.logger || console;

import * as cartState from '../../modules/cart-state.js';

let productsListener = null;
let clientsListener = null;

function bindProductCardClicks() {
  const grid = document.getElementById('pdv-products-grid');
  if (!grid) return;
  grid.querySelectorAll('.pdv-product-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const qtyEl = document.getElementById('pdv-qty');
      const qty = Math.max(1, parseInt(qtyEl?.value || '1', 10));
      cartState.addCartItem({
        id: btn.dataset.productId,
        name: btn.dataset.name,
        price: btn.dataset.price,
        sku: btn.dataset.sku || ''
      }, qty);
      renderCart();
    });
  });
}

export function initializePuntoVenta() {
  try {
    logger.debug('Initializing punto de venta view');
    const container = document.getElementById('punto-venta-view');
    if (!container) {
      logger.error('punto-venta-view container not found');
      return;
    }
    container.innerHTML = getPuntoVentaHTML();
    const grid = document.getElementById('pdv-products-grid');
    if (!grid) {
      logger.error('pdv-products-grid not found after render');
      return;
    }
    bindProductCardClicks();
    loadProducts();
    setupHandlers();
    renderCart();
  } catch (err) {
    logger.error('initializePuntoVenta error', err);
    const container = document.getElementById('punto-venta-view');
    if (container) {
      container.innerHTML = '<div style="padding:20px; color:red;">Error al cargar Punto de venta. Consulte la consola (F12).</div>';
    }
  }
}

function getInitialProductCardsHTML() {
  const demos = [
    { id: 'demo-1', name: 'Ejemplo - Pan', price: 50, sku: 'DEMO01' },
    { id: 'demo-2', name: 'Ejemplo - Leche', price: 45, sku: 'DEMO02' },
    { id: 'demo-3', name: 'Ejemplo - Café', price: 120, sku: 'DEMO03' },
    { id: 'demo-4', name: 'Ejemplo - Aceite', price: 200, sku: 'DEMO04' },
    { id: 'demo-5', name: 'Ejemplo - Arroz', price: 95, sku: 'DEMO05' },
    { id: 'demo-6', name: 'Ejemplo - Azúcar', price: 80, sku: 'DEMO06' }
  ];
  return demos.map(p => {
    const name = p.name.toUpperCase();
    const code = 'Cod. ' + p.sku;
    const priceStr = '$ ' + p.price;
    return `<button type="button" class="pdv-product-card" data-product-id="${p.id}" data-price="${p.price}" data-name="${name}" data-sku="${p.sku}" style="display:block; width:100%; min-height:200px; text-align:left; border:2px solid #d1d5db; background:#fff; padding:0; overflow:hidden; cursor:pointer;">
          <div style="height:120px; min-height:120px; background:#e5e7eb; display:flex; align-items:center; justify-content:center; position:relative; font-size:2rem;">📦<span style="position:absolute; bottom:8px; right:8px; background:#16a34a; color:#fff; padding:4px 8px; font-size:14px; font-weight:bold;">${priceStr}</span></div>
          <div style="padding:12px; background:#fff; min-height:70px;">
            <p style="margin:0; font-size:14px; font-weight:600; color:#111;">${name}</p>
            <p style="margin:4px 0 0 0; font-size:12px; color:#666;">${code}</p>
            <p style="margin:2px 0 0 0; font-size:12px; color:#666;">Stock: 0,00 Uds</p>
          </div>
        </button>`;
  }).join('');
}

function getPuntoVentaHTML() {
  return `
    <div class="flex flex-col flex-1 min-h-0 min-w-0" style="min-height:60vh;">
      <div class="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <button type="button" id="pdv-cerrar-btn" class="pdv-touch flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-100 font-medium" title="Volver al inicio">← Cerrar</button>
        <span class="text-gray-600 font-medium">Punto de venta</span>
        <span class="w-20"></span>
      </div>
      <div class="flex flex-1 min-h-0 min-w-0" style="min-height:50vh;">
      <!-- Left: products (altura fija para que no se contraiga) -->
      <div class="flex-1 flex flex-col min-w-0 border-r border-gray-200" style="min-width:0; min-height:400px;">
        <div class="flex items-center gap-3 p-3 border-b border-gray-200 bg-white flex-shrink-0">
          <input type="number" id="pdv-qty" min="1" value="1" class="pdv-touch w-20 px-3 py-3 border-b border-gray-300 text-center text-base focus:outline-none focus:border-green-600">
          <div class="flex-1 flex items-center border border-gray-300 bg-white min-h-[48px]">
            <span class="pl-3 text-gray-400 text-lg">🔍</span>
            <input type="text" id="pdv-search" placeholder="Escriba aquí para buscar el producto" class="flex-1 px-3 py-3 text-base focus:outline-none min-h-[48px]">
          </div>
        </div>
        <div id="pdv-products-grid" class="overflow-auto p-3" style="flex:1 1 0; min-height:50vh; height:0; display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); grid-auto-rows: minmax(200px, auto); gap:12px; align-content:start;">
          ${getInitialProductCardsHTML()}
        </div>
      </div>
      <!-- Right: cart (scroll solo en la lista; Cobrar siempre visible abajo) -->
      <div class="w-full md:w-80 lg:w-[28rem] flex flex-col min-h-0 bg-white border-l border-gray-200 flex-shrink-0">
        <div class="p-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
          <input type="text" id="pdv-client-search" placeholder="Buscar cliente" class="flex-1 px-3 py-3 border border-gray-300 text-base focus:outline-none focus:border-green-600 min-h-[48px]">
          <button type="button" id="pdv-client-add" class="pdv-touch p-3 border border-gray-300 hover:bg-gray-50 flex items-center justify-center" title="Agregar cliente">👤+</button>
        </div>
        <div class="p-3 border-b border-gray-200 flex-shrink-0">
          <p id="pdv-sale-type" class="font-medium text-gray-800 text-base">Venta Contado Offl...</p>
          <button type="button" id="pdv-delete-ticket" class="pdv-touch mt-2 text-blue-600 text-base font-medium py-2 px-3 -mx-1 hover:bg-blue-50 flex items-center gap-2">Eliminar ticket 🗑</button>
        </div>
        <p class="px-3 py-2 text-base text-gray-600 flex-shrink-0">Artículos (<span id="pdv-cart-count">0</span>)</p>
        <div id="pdv-cart-items" class="flex-1 min-h-0 overflow-auto p-3 border-b border-gray-200">
          <p class="text-center text-gray-400 py-6 text-base">← Seleccione artículos</p>
        </div>
        <div class="flex flex-col flex-shrink-0">
          <div class="p-3 border-b border-gray-200 flex items-center justify-between text-base">
            <span class="text-gray-600">Dto. %</span>
            <input type="text" id="pdv-discount" value="0" class="pdv-touch w-24 text-right border-b border-gray-300 px-2 py-2 text-base focus:outline-none focus:border-green-600">
          </div>
          <div class="p-3">
            <button type="button" id="pdv-cobrar-btn" class="pdv-touch-lg w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white text-lg font-semibold hover:bg-green-700 active:bg-green-800 touch-manipulation">
              <span>$</span>
              <span>Cobrar</span>
              <span id="pdv-cobrar-total" class="font-bold text-xl">0,00</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
}

function loadProducts() {
  const grid = document.getElementById('pdv-products-grid');
  if (!grid) return;
  const nrd = window.nrd;
  if (!nrd || !nrd.products) {
    grid.innerHTML = '<p style="text-align:center; color:#dc2626; padding:24px;">No hay conexión a datos.</p>';
    return;
  }
  if (productsListener) {
    productsListener();
    productsListener = null;
  }
  function getDemoProducts() {
    return [
      { id: 'demo-1', name: 'Ejemplo - Pan', price: 50, sku: 'DEMO01' },
      { id: 'demo-2', name: 'Ejemplo - Leche', price: 45, sku: 'DEMO02' },
      { id: 'demo-3', name: 'Ejemplo - Café', price: 120, sku: 'DEMO03' },
      { id: 'demo-4', name: 'Ejemplo - Azúcar', price: 80, sku: 'DEMO04' },
      { id: 'demo-5', name: 'Ejemplo - Aceite', price: 200, sku: 'DEMO05' },
      { id: 'demo-6', name: 'Ejemplo - Arroz', price: 95, sku: 'DEMO06' }
    ];
  }

  function normalizeProduct(p) {
    const name = (p.name ?? p.nombre ?? '').toString().trim();
    const price = Number(p.price ?? p.precio ?? 0) || 0;
    const sku = (p.sku ?? p.codigo ?? '').toString().trim();
    return { id: p.id, name, price, sku, variants: p.variants };
  }

  function flattenProducts(raw) {
    const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw) : []);
    const out = [];
    for (const p of list) {
      const base = normalizeProduct(p);
      const variants = p.variants != null
        ? (Array.isArray(p.variants) ? p.variants : Object.values(p.variants))
        : [];
      if (variants.length) {
        variants.forEach((v, idx) => {
          out.push({
            id: v.id ?? v.sku ?? (p.id + '_' + idx),
            name: (v.name ?? v.nombre ?? base.name).toString().trim() || base.name,
            price: Number(v.price ?? v.precio ?? base.price) || 0,
            sku: (v.sku ?? v.codigo ?? base.sku).toString().trim()
          });
        });
      } else {
        out.push({ id: base.id, name: base.name, price: base.price, sku: base.sku });
      }
    }
    return out;
  }

  function renderProductsGrid(products) {
    const grid = document.getElementById('pdv-products-grid');
    if (!grid) {
      logger.warn('renderProductsGrid: pdv-products-grid not found');
      return;
    }
    const flat = flattenProducts(products);
    const search = (document.getElementById('pdv-search') || {}).value || '';
    const term = search.trim().toLowerCase();
    const filtered = term
      ? flat.filter(p => (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term))
      : flat;

    logger.debug('PDV products', { raw: Array.isArray(products) ? products.length : (products ? 'object' : 'null'), flat: flat.length, filtered: filtered.length });

    const esc = (t) => {
      if (t == null) return '';
      const d = document.createElement('div');
      d.textContent = String(t);
      return d.innerHTML;
    };

    const isDemo = filtered.length === 0;
    const listToShow = filtered.length > 0 ? filtered : getDemoProducts();
    if (listToShow.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:#666; padding:24px;">No hay productos.</p>';
      return;
    }

    /* Si solo vamos a mostrar demo otra vez, no reemplazar: así no se contrae el layout */
    if (isDemo && grid.querySelectorAll('.pdv-product-card').length >= 6) {
      return;
    }

    const demoBanner = isDemo
      ? '<p style="grid-column:1/-1; background:#fef3c7; color:#92400e; font-size:14px; padding:8px 12px; margin-bottom:8px; border:1px solid #f59e0b;">Modo demo: no hay productos en Firebase. Agregue productos en /products para ver el catálogo real.</p>'
      : '';
    grid.innerHTML = demoBanner + listToShow.map(p => {
      const price = Math.round(parseFloat(p.price) || 0);
      const name = (p.name || 'Sin nombre').toUpperCase();
      const code = p.sku ? 'Cod. ' + p.sku : '';
      const priceStr = '$ ' + price;
      return `<button type="button" class="pdv-product-card" data-product-id="${esc(p.id)}" data-price="${price}" data-name="${esc(name)}" data-sku="${esc(p.sku || '')}" style="display:block; width:100%; min-height:200px; text-align:left; border:2px solid #d1d5db; background:#fff; padding:0; overflow:hidden; cursor:pointer;">
          <div style="height:120px; min-height:120px; background:#e5e7eb; display:flex; align-items:center; justify-content:center; position:relative; font-size:2rem;">📦<span style="position:absolute; bottom:8px; right:8px; background:#16a34a; color:#fff; padding:4px 8px; font-size:14px; font-weight:bold;">${esc(priceStr)}</span></div>
          <div style="padding:12px; background:#fff; min-height:70px;">
            <p style="margin:0; font-size:14px; font-weight:600; color:#111;">${esc(name)}</p>
            <p style="margin:4px 0 0 0; font-size:12px; color:#666;">${esc(code)}</p>
            <p style="margin:2px 0 0 0; font-size:12px; color:#666;">Stock: 0,00 Uds</p>
          </div>
        </button>`;
    }).join('');

    bindProductCardClicks();
  }

  productsListener = nrd.products.onValue((data) => {
    renderProductsGrid(data);
  });

  if (typeof nrd.products.getAll === 'function') {
    nrd.products.getAll().then((list) => {
      if (list && list.length) {
        renderProductsGrid(list);
      }
    }).catch((err) => {
      logger.warn('getAll products failed', err);
      renderProductsGrid([]);
    });
  }
}

function setupHandlers() {
  document.getElementById('pdv-cerrar-btn')?.addEventListener('click', () => {
    if (window.pdvSwitchView) window.pdvSwitchView('dashboard');
  });
  const searchEl = document.getElementById('pdv-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => loadProducts());
    searchEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
  }
  document.getElementById('pdv-delete-ticket')?.addEventListener('click', () => {
    if (window.showConfirm && !window.showConfirm('¿Eliminar ticket y vaciar carrito?')) return;
    cartState.clearCart();
    renderCart();
  });
  document.getElementById('pdv-discount')?.addEventListener('input', () => {
    const v = document.getElementById('pdv-discount')?.value || '0';
    cartState.setCartDiscountPercent(v);
    renderCart();
  });
  document.getElementById('pdv-cobrar-btn')?.addEventListener('click', () => {
    const items = cartState.getCartItems();
    if (!items.length) {
      if (window.showWarning) window.showWarning('Agregue artículos al carrito.');
      return;
    }
    if (window.pdvSwitchView) {
      window.pdvSwitchView('pago', { hideNav: true });
    }
  });
}

function renderCart() {
  const items = cartState.getCartItems();
  const total = cartState.getCartTotal();
  const formatCurrency = window.formatCurrency || (n => '$ ' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const countEl = document.getElementById('pdv-cart-count');
  const listEl = document.getElementById('pdv-cart-items');
  const totalEl = document.getElementById('pdv-cobrar-total');
  if (countEl) countEl.textContent = items.length;
  if (totalEl) totalEl.textContent = formatCurrency(total).replace(/[^\d,]/g, '').trim() || '0,00';
  if (!listEl) return;
  if (items.length === 0) {
    listEl.innerHTML = '<p class="text-center text-gray-400 py-6">← Seleccione artículos</p>';
    return;
  }
  listEl.innerHTML = items.map((it, i) => {
    const lineTotal = Math.round(it.quantity * (it.price || 0));
    const name = (it.productName || '').toUpperCase();
    const code = it.productCode ? `Cod. ${it.productCode}` : '';
    return `
      <div class="border-b border-gray-100 py-3 flex justify-between items-start gap-2" data-index="${i}">
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-base">${it.quantity}x ${(window.escapeHtml && window.escapeHtml(name)) || name}</p>
          <p class="text-sm text-gray-500">${(window.escapeHtml && window.escapeHtml(code)) || code}</p>
        </div>
        <p class="font-semibold text-base whitespace-nowrap">${(lineTotal || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    `;
  }).join('');
}

export function cleanupPuntoVenta() {
  if (productsListener) {
    productsListener();
    productsListener = null;
  }
  if (clientsListener) {
    clientsListener();
    clientsListener = null;
  }
}
