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

// AuthService (nrd-common) maneja login form, showLoginScreen y showRedirectingScreen.
// app.js solo inicializa la navegación cuando el usuario está autenticado.

function waitForNRDAndInitialize() {
  const maxWait = 10000;
  const startTime = Date.now();
  const checkNRD = setInterval(() => {
    const nrd = window.nrd;
    const NRDCommon = window.NRDCommon;
    if (nrd && nrd.auth && NRDCommon) {
      clearInterval(checkNRD);
      const currentUser = nrd.auth.getCurrentUser();
      if (currentUser) {
        initializeAppForUser(currentUser);
      }
      nrd.auth.onAuthStateChanged((user) => {
        if (user) {
          initializeAppForUser(user);
        } else {
          appInitialized = false;
        }
      });
    } else if (Date.now() - startTime >= maxWait) {
      clearInterval(checkNRD);
      logger.error('NRD, auth, or NRDCommon not available after timeout');
    }
  }, 100);
}

waitForNRDAndInitialize();

let appInitialized = false;
function initializeAppForUser(user) {
  if (appInitialized) {
    logger.debug('App already initialized, skipping');
    return;
  }
  appInitialized = true;
  const appScreen = document.getElementById('app-screen');
  const loginScreen = document.getElementById('login-screen');
  const redirectingScreen = document.getElementById('redirecting-screen');
  if (appScreen) appScreen.classList.remove('hidden');
  if (loginScreen) loginScreen.classList.add('hidden');
  if (redirectingScreen) redirectingScreen.classList.add('hidden');
  setTimeout(() => {
    switchView('dashboard');
  }, 300);
}
