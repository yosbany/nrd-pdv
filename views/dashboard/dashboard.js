// Dashboard - Grid de tiles estilo PDV
const logger = window.logger || console;

const TILES = [
  {
    id: 'punto-venta',
    label: 'Punto de venta',
    icon: 'cart', // carrito con flecha
    color: 'bg-[#581E50]',
    large: true,
    action: 'punto-venta'
  },
  { id: 'control-caja', label: 'Control de caja', icon: 'doc', color: 'bg-orange-600', action: 'pronto' },
  { id: 'movimientos', label: 'Movimientos', icon: 'resize', color: 'bg-slate-700', action: 'pronto' },
  { id: 'configuraciones', label: 'Configuraciones', icon: 'gear', color: 'bg-cyan-500', action: 'pronto' },
  { id: 'datos-acceso', label: 'Datos de acceso', icon: 'lock', color: 'bg-lime-500', action: 'pronto' },
  { id: 'orden-compra', label: 'Orden de compra', icon: 'receipt', color: 'bg-slate-700', action: 'pronto' },
  { id: 'facturar-servicios', label: 'Facturar servicios', icon: 'coins', color: 'bg-lime-500', action: 'pronto' },
  { id: 'devolucion-libre', label: 'Devolución libre', icon: 'dollar-doc', color: 'bg-orange-600', action: 'pronto' },
  { id: 'devolucion-ticket', label: 'Devolución de ticket', icon: 'cart', color: 'bg-[#581E50]', action: 'pronto' }
];

function getIconSvg(icon) {
  const icons = {
    cart: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-12 h-12 md:w-14 md:h-14"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    doc: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    resize: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>',
    gear: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
    receipt: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
    coins: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    'dollar-doc': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>'
  };
  return icons[icon] || icons.cart;
}

export function initializeDashboard() {
  logger.debug('Initializing dashboard view');
  renderTiles();
}

function renderTiles() {
  const grid = document.getElementById('pdv-tiles-grid');
  if (!grid) return;

  const escapeHtml = window.escapeHtml || ((t) => {
    if (!t) return '';
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  });

  const largeTile = TILES.find(t => t.large);
  const restTiles = TILES.filter(t => !t.large);

  let html = '';
  if (largeTile) {
    html += `
      <button type="button" class="pdv-tile ${largeTile.color} text-white flex flex-col items-center justify-center p-4 md:p-6 hover:opacity-95 focus:outline focus:ring-2 focus:ring-white/50 col-span-1 row-span-2 min-h-[140px] md:min-h-[200px]" data-action="${escapeHtml(largeTile.action)}">
        <span class="mb-2 text-white">${getIconSvg(largeTile.icon)}</span>
        <span class="text-sm md:text-base font-light text-center">${escapeHtml(largeTile.label)}</span>
      </button>
    `;
  }
  restTiles.forEach(t => {
    html += `
      <button type="button" class="pdv-tile ${t.color} text-white flex flex-col items-center justify-center p-3 md:p-4 hover:opacity-95 focus:outline focus:ring-2 focus:ring-white/50 min-h-[100px] md:min-h-[120px]" data-action="${escapeHtml(t.action)}">
        <span class="mb-1 text-white">${getIconSvg(t.icon)}</span>
        <span class="text-xs md:text-sm font-light text-center">${escapeHtml(t.label)}</span>
      </button>
    `;
  });

  grid.innerHTML = html;

  grid.querySelectorAll('.pdv-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'punto-venta' && window.pdvSwitchView) {
        window.pdvSwitchView('punto-venta');
      } else if (action === 'pronto') {
        if (window.showInfo) window.showInfo('Próximamente');
      }
    });
  });
}
