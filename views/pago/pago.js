// Vista Pago - Medios de pago y total a cobrar
const logger = window.logger || console;

import * as cartState from '../../modules/cart-state.js';

let pagoResolve = null;

export function initializePago(options = {}) {
  logger.debug('Initializing pago view');
  const container = document.getElementById('pago-view');
  if (!container) return;
  container.innerHTML = getPagoHTML();
  setupPagoHandlers();
  renderPagoSummary();
  setupModalEfectivo();
}

function getPagoHTML() {
  return `
    <div class="flex flex-1 min-h-0">
      <!-- Left: sale summary -->
      <div class="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white overflow-auto">
        <div class="p-4 border-b border-gray-200 flex items-center gap-2">
          <span class="text-gray-500">👤</span>
          <p id="pago-client-label" class="font-medium">Sin cliente</p>
        </div>
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <p class="font-medium text-gray-800">Venta Contado Offl...</p>
          <button type="button" id="pago-edit-ticket" class="text-blue-600 text-sm hover:underline flex items-center gap-1">Editar ticket ✎</button>
        </div>
        <p class="px-4 py-2 text-sm text-gray-600">Artículos (<span id="pago-cart-count">0</span>)</p>
        <div id="pago-items-list" class="flex-1 overflow-auto px-4 pb-4"></div>
        <div class="p-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
          <span>Dto. %</span>
          <span id="pago-discount-value">0,0000</span>
        </div>
      </div>
      <!-- Right: payment methods -->
      <div class="w-full md:w-96 flex flex-col bg-gray-50 border-l border-gray-200 flex-shrink-0">
        <div class="p-4 border-b border-gray-200">
          <p class="text-sm font-medium text-gray-700 mb-2">Medios de Pago</p>
          <div class="flex justify-between items-center py-2 px-3 bg-gray-200">
            <span class="text-gray-700">Total a cobrar</span>
            <span id="pago-total-label" class="font-bold text-gray-900">$ 0,00</span>
          </div>
        </div>
        <div id="pago-methods-list" class="flex-1 overflow-auto p-4 space-y-2">
          <div class="pago-method flex items-center justify-between p-3 bg-white border border-gray-200" data-method="efectivo">
            <div class="flex items-center gap-2">
              <span class="text-2xl">💵</span>
              <div>
                <p class="font-medium text-gray-800">Pesos Uruguayos</p>
                <p class="text-xs text-gray-500">Caja mostrador $</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="pago-method-amount font-bold text-blue-600" data-method="efectivo">$ 0,00</span>
              <button type="button" class="pago-method-set text-green-600 hover:underline text-sm">Cobrar</button>
            </div>
          </div>
          <div class="pago-method flex items-center justify-between p-3 bg-white border border-gray-200" data-method="tarjeta">
            <div class="flex items-center gap-2">
              <span class="text-2xl">💳</span>
              <div>
                <p class="font-medium text-gray-800">Tarjeta POS</p>
              </div>
            </div>
            <span class="pago-method-amount font-bold text-blue-600" data-method="tarjeta">$ 0,00</span>
          </div>
          <div class="pago-method flex items-center justify-between p-3 bg-white border border-gray-200" data-method="pedido-ya">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🚚</span>
              <div>
                <p class="font-medium text-gray-800">Pedido ya $</p>
              </div>
            </div>
            <span class="pago-method-amount font-bold text-blue-600" data-method="pedido-ya">$ 0,00</span>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex gap-2">
          <button type="button" id="pago-add-payment" class="text-green-600 hover:underline font-medium text-sm">AGREGAR PAGO</button>
          <button type="button" id="pago-cobrar-btn" class="flex-1 py-3 bg-green-600 text-white font-medium hover:bg-green-700 uppercase tracking-wider text-sm">
            Cobrar
          </button>
        </div>
      </div>
    </div>
  `;
}

const payments = { efectivo: 0, tarjeta: 0, 'pedido-ya': 0 };

function renderPagoSummary() {
  const items = cartState.getCartItems();
  const total = cartState.getCartTotal();
  const discount = cartState.getCartDiscountPercent();
  const clientName = (() => {
    const c = cartState.getCart();
    return c.clientName || 'Sin cliente';
  })();
  const formatCurrency = window.formatCurrency || (n => '$ ' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  document.getElementById('pago-client-label').textContent = clientName;
  document.getElementById('pago-cart-count').textContent = items.length;
  document.getElementById('pago-total-label').textContent = formatCurrency(total);
  document.getElementById('pago-discount-value').textContent = discount ? discount.toFixed(4) : '0,0000';

  const listEl = document.getElementById('pago-items-list');
  if (!listEl) return;
  if (items.length === 0) {
    listEl.innerHTML = '';
    return;
  }
  listEl.innerHTML = items.map(it => {
    const lineTotal = Math.round(it.quantity * (it.price || 0));
    const name = (it.productName || '').toUpperCase();
    const code = it.productCode ? `Cod. ${it.productCode}` : '';
    return `
      <div class="border-b border-gray-100 py-2 flex justify-between items-start">
        <div>
          <p class="font-semibold text-sm">${it.quantity}x ${(window.escapeHtml && window.escapeHtml(name)) || name}</p>
          <p class="text-xs text-gray-500">${(window.escapeHtml && window.escapeHtml(code)) || code}</p>
        </div>
        <p class="font-medium text-sm">${(lineTotal || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    `;
  }).join('');

  payments.efectivo = total;
  payments.tarjeta = 0;
  payments['pedido-ya'] = 0;
  updatePaymentAmounts();
}

function updatePaymentAmounts() {
  const formatCurrency = window.formatCurrency || (n => '$ ' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  document.querySelectorAll('.pago-method-amount').forEach(el => {
    const method = el.dataset.method;
    if (method && payments[method] != null) {
      el.textContent = formatCurrency(payments[method]);
    }
  });
}

function setupPagoHandlers() {
  document.getElementById('pago-edit-ticket')?.addEventListener('click', () => {
    if (window.pdvSwitchView) window.pdvSwitchView('punto-venta');
  });
  document.querySelectorAll('.pago-method-set').forEach(btn => {
    const method = btn.closest('.pago-method')?.dataset.method;
    if (method === 'efectivo') {
      btn.addEventListener('click', () => openModalEfectivo());
    }
  });
  document.getElementById('pago-cobrar-btn')?.addEventListener('click', () => {
    const total = cartState.getCartTotal();
    const paid = payments.efectivo + payments.tarjeta + payments['pedido-ya'];
    if (paid < total && payments.efectivo < total) {
      openModalEfectivo();
      return;
    }
    confirmarCobro();
  });
}

function openModalEfectivo() {
  const total = cartState.getCartTotal();
  const modal = document.getElementById('modal-pago-efectivo');
  const totalEl = document.getElementById('modal-pago-total');
  const cajaEl = document.getElementById('modal-pago-caja');
  const inputEl = document.getElementById('modal-pago-input');
  const formatCurrency = window.formatCurrency || (n => '$ ' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  if (totalEl) totalEl.textContent = formatCurrency(total);
  if (cajaEl) cajaEl.textContent = formatCurrency(total);
  if (inputEl) {
    inputEl.value = formatCurrency(payments.efectivo || 0);
    inputEl.dataset.value = String(payments.efectivo || 0);
  }
  if (modal) modal.classList.remove('hidden');
  if (modal) modal.classList.add('flex');
}

function setupModalEfectivo() {
  const modal = document.getElementById('modal-pago-efectivo');
  const inputEl = document.getElementById('modal-pago-input');
  const total = () => cartState.getCartTotal();
  const formatCurrency = window.formatCurrency || (n => '$ ' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  document.querySelectorAll('.pdv-quick-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount || '0', 10);
      const current = parseFloat(inputEl?.dataset.value || '0') || 0;
      const next = current + amount;
      payments.efectivo = next;
      if (inputEl) {
        inputEl.value = formatCurrency(next);
        inputEl.dataset.value = String(next);
      }
    });
  });
  document.getElementById('modal-pago-cancelar')?.addEventListener('click', () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
  document.getElementById('modal-pago-aceptar')?.addEventListener('click', () => {
    const paid = parseFloat(inputEl?.dataset.value || '0') || 0;
    const tot = total();
    if (paid < tot) {
      if (window.showWarning) window.showWarning('El monto ingresado es menor al total a cobrar.');
      return;
    }
    payments.efectivo = paid;
    updatePaymentAmounts();
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (paid > tot && window.showInfo) {
      window.showInfo('Vuelto: ' + formatCurrency(paid - tot));
    }
  });
}

function confirmarCobro() {
  const nrd = window.nrd;
  const items = cartState.getCartItems();
  const total = cartState.getCartTotal();
  const cart = cartState.getCart();
  if (!items.length) {
    if (window.showWarning) window.showWarning('No hay artículos.');
    return;
  }
  showSpinner('Guardando venta...');
  const orderPayload = {
    clientId: cart.clientId || 'sin-cliente',
    clientName: cart.clientName || 'Sin cliente',
    status: 'completada',
    total: total,
    createdAt: Date.now(),
    items: items.map(it => ({
      productId: it.productId,
      variantId: it.variantId,
      productName: it.productName,
      quantity: it.quantity,
      price: it.price
    }))
  };
  (async () => {
    try {
      if (nrd && nrd.orders) {
        await nrd.orders.create(orderPayload);
      }
      cartState.clearCart();
      if (window.showSuccess) window.showSuccess('Venta registrada.');
      if (window.pdvSwitchView) window.pdvSwitchView('punto-venta');
    } catch (e) {
      logger.error('Error guardando venta', e);
      if (window.showError) window.showError('Error al guardar la venta.');
    } finally {
      hideSpinner();
    }
  })();
}

export function cleanupPago() {
  // no listeners to clean
}
