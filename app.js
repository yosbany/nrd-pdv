// Main app controller - NRD PDV
const logger = window.logger || console;

import { initializeDashboard } from './views/dashboard/dashboard.js';
import { initializePuntoVenta, cleanupPuntoVenta } from './views/punto-venta/punto-venta.js';
import { initializePago, cleanupPago } from './views/pago/pago.js';

const VIEW_INITIALIZERS = {
  'dashboard': initializeDashboard,
  'punto-venta': initializePuntoVenta,
  'pago': initializePago
};

const VIEW_CLEANUPS = {
  'punto-venta': cleanupPuntoVenta,
  'pago': cleanupPago
};

function switchView(viewName, options = {}) {
  document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

  const previousView = document.querySelector('.view:not(.hidden)');
  const prevId = previousView ? previousView.id.replace('-view', '') : null;
  if (prevId && VIEW_CLEANUPS[prevId]) {
    try {
      VIEW_CLEANUPS[prevId]();
    } catch (e) {
      logger.warn('Cleanup error', prevId, e);
    }
  }

  const selectedView = document.getElementById(`${viewName}-view`);
  if (selectedView) {
    selectedView.classList.remove('hidden');
  }

  const navContainer = document.getElementById('app-nav-container');
  if (navContainer) {
    navContainer.classList.add('hidden');
  }

  const initializer = VIEW_INITIALIZERS[viewName];
  if (initializer && typeof initializer === 'function') {
    try {
      initializer(options);
    } catch (error) {
      logger.error('Error initializing view', { viewName, error });
    }
  }
}

// Expose for views (e.g. open payment from POS)
window.pdvSwitchView = switchView;

function initializeAppForUser(user) {
  logger.info('Initializing app for user', { uid: user.uid, email: user.email });
  switchView('dashboard');
}

(window.NRDCommon?.startApp || function(fn, opts) {
  window.__nrdStartQueue = window.__nrdStartQueue || [];
  window.__nrdStartQueue.push({ onReady: fn, options: opts || {} });
})(initializeAppForUser, { initDelay: 300 });
