// Base de datos de productos en Zona Franca Arenal Trade Zone
const catalogData = [
  { id: 'PROD-01', name: 'Lote Microprocesadores Industrial X1', price: 1200.00, origin: 'Bodega Central ZF' },
  { id: 'PROD-02', name: 'Bobina de Cable de Fibra Óptica 1km', price: 450.00, origin: 'Bodega B-12' },
  { id: 'PROD-03', name: 'Módulo Solar Fotovoltaico 500W', price: 280.00, origin: 'Bodega C-05' }
];

// Estado de la aplicación
let shoppingCart = [];
let ordersDatabase = {
  'ATZ-ORDER-101': { client: 'Mundo Digital SRL', status: 'En Tránsito Aduanero (Salida ZF)', total: 2400.00 }
};

// Logger interno
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// 1. Explorar productos (Carga inicial)
function renderCatalog() {
  const container = document.getElementById('productCatalog');
  container.innerHTML = '';

  catalogData.forEach(prod => {
    const card = document.createElement('div');
    card.innerHTML = `
      <h3>${prod.name}</h3>
      <p>Ubicación: ${prod.origin}</p>
      <p>Precio ZF: $${prod.price.toFixed(2)}</p>
      <button onclick="addToCart('${prod.id}')">Agregar al Carrito</button>
      <hr>
    `;
    container.appendChild(card);
  });
}

// 2. Agregar al Carrito
function addToCart(productId) {
  const product = catalogData.find(p => p.id === productId);
  if (product) {
    shoppingCart.push(product);
    updateCartUI();
    log(`Producto '${product.name}' agregado al carrito.`);
  }
}

function updateCartUI() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');

  cartItemsEl.innerHTML = '';
  let total = 0;

  if (shoppingCart.length === 0) {
    cartItemsEl.innerHTML = '<li>El carrito está vacío.</li>';
  } else {
    shoppingCart.forEach((item, index) => {
      total += item.price;
      const li = document.createElement('li');
      li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
      cartItemsEl.appendChild(li);
    });
  }

  cartTotalEl.textContent = total.toFixed(2);
}

// 3. Pagar en Línea
function processOnlinePayment() {
  if (shoppingCart.length === 0) {
    log('ERROR: No se puede procesar el pago porque el carrito está vacío.');
    return;
  }

  const clientName = document.getElementById('clientName').value;
  const cardNumber = document.getElementById('cardNumber').value;

  if (!cardNumber || cardNumber.length < 12) {
    log('ERROR: Número de tarjeta inválido.');
    return;
  }

  // Generar pedido
  const totalAmount = shoppingCart.reduce((sum, item) => sum + item.price, 0);
  const orderId = 'ATZ-ORDER-' + Math.floor(100 + Math.random() * 900);

  ordersDatabase[orderId] = {
    client: clientName,
    status: 'Pago Confirmado - Preparando Despacho en Arenal Trade Zone',
    total: totalAmount
  };

  log(`PAGO ÉXITOSO: Procesados $${totalAmount.toFixed(2)} para ${clientName}. Su número de orden es: ${orderId}`);

  // Vaciar carrito
  shoppingCart = [];
  updateCartUI();

  // Autocompletar el campo de seguimiento con la nueva orden
  document.getElementById('trackingInput').value = orderId;
}

// 4. Dar seguimiento a las compras
function trackOrder() {
  const trackingCode = document.getElementById('trackingInput').value.trim();
  const trackingDiv = document.getElementById('trackingStatus');

  log(`Consultando el estado del pedido: '${trackingCode}'...`);

  if (ordersDatabase[trackingCode]) {
    const order = ordersDatabase[trackingCode];
    trackingDiv.innerHTML = `
      <p><strong>Pedido:</strong> ${trackingCode}</p>
      <p><strong>Cliente:</strong> ${order.client}</p>
      <p><strong>Monto Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Estado Actual:</strong> ${order.status}</p>
    `;
    log(`Estado encontrado: ${order.status}`);
  } else {
    trackingDiv.textContent = 'No se encontró información para el código de pedido ingresado.';
    log('ERROR: Código de pedido no encontrado en Arenal Trade Zone.');
  }
}

// Inicialización de la vista catálogo al cargar
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
});