// Estado del carrito actual (ticket de venta)
const logger = window.logger || console;

let cart = {
  clientId: '',
  clientName: '',
  items: [],
  discountPercent: 0
};

export function getCart() {
  return { ...cart, items: [...cart.items] };
}

export function getCartItems() {
  return [...cart.items];
}

export function getCartTotal() {
  const subtotal = cart.items.reduce((sum, it) => sum + (it.quantity * (it.price || 0)), 0);
  const discount = cart.discountPercent ? (subtotal * cart.discountPercent / 100) : 0;
  return Math.round(subtotal - discount);
}

export function getCartSubtotal() {
  return Math.round(cart.items.reduce((sum, it) => sum + (it.quantity * (it.price || 0)), 0));
}

export function setCartClient(clientId, clientName) {
  cart.clientId = clientId || '';
  cart.clientName = clientName || '';
}

export function setCartDiscountPercent(value) {
  cart.discountPercent = parseFloat(value) || 0;
}

export function addCartItem(product, quantity = 1, variantId = null, variantName = null) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const price = parseFloat(product.price) || 0;
  const id = product.id || product.productId;
  const name = product.name || product.productName || '';
  const sku = product.sku || product.code || '';
  const existing = cart.items.find(
    it => (it.productId === id && (variantId == null ? !it.variantId : it.variantId === variantId))
  );
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({
      productId: id,
      variantId: variantId || undefined,
      productName: name,
      variantName: variantName || undefined,
      productCode: sku,
      quantity: qty,
      price: price
    });
  }
}

export function removeCartItem(index) {
  if (index >= 0 && index < cart.items.length) {
    cart.items.splice(index, 1);
  }
}

export function updateCartItemQuantity(index, quantity) {
  if (index >= 0 && index < cart.items.length) {
    const q = parseInt(quantity, 10);
    if (q < 1) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = q;
    }
  }
}

export function clearCart() {
  cart = {
    clientId: '',
    clientName: '',
    items: [],
    discountPercent: 0
  };
}

export function getCartDiscountPercent() {
  return cart.discountPercent;
}
