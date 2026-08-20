// Historial de transacciones para conciliación de pagos
let transactionLedger = [];

// Función para imprimir eventos en la interfaz
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// Validar cobros con tarjetas
function validateCardPayment(amount, ref) {
  if (!ref.startsWith('REF-') || amount <= 0) {
    return { valid: false, reason: 'Autorización denegada por el emisor o código de referencia inválido.' };
  }
  return { valid: true, approvalCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000) };
}

// Validar cobros con transferencias
function validateTransferPayment(amount, ref) {
  if (ref.length < 5) {
    return { valid: false, reason: 'Comprobante de transferencia no localizado en la cuenta bancaria de Arenal Trade Zone.' };
  }
  return { valid: true, bankTrace: 'TRX-BANK-' + Date.now() };
}

// Validar cobros en efectivo
function validateCashPayment(amount) {
  if (amount > 10000) {
    return { valid: false, reason: 'Monto excede el límite permitido para pagos en efectivo en ventanilla ZF.' };
  }
  return { valid: true, receiptNo: 'REC-CASH-' + Math.floor(Math.random() * 1000) };
}

// Validar cobros a crédito
function validateCreditPayment(amount, creditDays) {
  const maxCreditDays = 90;
  if (creditDays > maxCreditDays) {
    return { valid: false, reason: `El plazo excede el máximo permitido de ${maxCreditDays} días de crédito comercial.` };
  }
  return { valid: true, creditLineStatus: 'APROBADO', terms: `${creditDays} días` };
}

// Probar transacciones físicas y digitales
function processTransaction() {
  const gateway = document.getElementById('gatewaySelect').value;
  const channel = document.getElementById('channelSelect').value;
  const method = document.getElementById('paymentMethod').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const ref = document.getElementById('referenceCode').value;
  const creditDays = parseInt(document.getElementById('creditDays').value, 10);

  log(`--- Procesando transacción (${channel}) mediante pasarela: ${gateway} ---`);

  let validationResult = { valid: false, reason: 'Método no soportado' };

  // Ejecución según método de pago
  switch (method) {
    case 'TARJETA':
      validationResult = validateCardPayment(amount, ref);
      break;
    case 'TRANSFERENCIA':
      validationResult = validateTransferPayment(amount, ref);
      break;
    case 'EFECTIVO':
      validationResult = validateCashPayment(amount);
      break;
    case 'CREDITO':
      validationResult = validateCreditPayment(amount, creditDays);
      break;
  }

  if (validationResult.valid) {
    const record = {
      id: 'ATZ-' + Date.now(),
      gateway,
      channel,
      method,
      amount,
      ref,
      status: 'PROCESADO',
      details: validationResult
    };
    transactionLedger.push(record);
    log(`ÉXITO: Transacción ${record.id} aprobada (${method} - ${channel}). Monto: $${amount}`);
  } else {
    log(`ERROR EN COBRO: ${validationResult.reason}`);
  }
}

// Verificar conciliación de pagos
function verifyConciliation() {
  log('--- Iniciando Auditoría y Conciliación de Pagos ---');
  if (transactionLedger.length === 0) {
    log('CONCILIACIÓN: No existen registros en el libro diario para conciliar.');
    return;
  }

  let totalConciliated = 0;
  transactionLedger.forEach((tx, index) => {
    totalConciliated += tx.amount;
    log(`Fila ${index + 1}: ID ${tx.id} | Canal: ${tx.channel} | Método: ${tx.method} | Estado: CONCILIADO | Monto: $${tx.amount}`);
  });

  log(`TOTAL CONCILIADO EN ARENAL TRADE ZONE: $${totalConciliated.toFixed(2)} (${transactionLedger.length} transacciones verficadas).`);
}

// Documentar flujo de integración
function showDocumentation() {
  const docText = `
=== FLUJO DE INTEGRACIÓN DE PAGOS - ARENAL TRADE ZONE ===

1. CAPTURA DE DATOS:
   - Selección del Canal (Físico en POS/Ventanilla o Digital en Portal Web).
   - Selección de la Pasarela (Stripe, BAC Credomatic, PayPal).

2. VALIDACIÓN DE REGLAS SEGÚN MÉTODO:
   - Tarjetas: Verificación de tokenización y código de autorización emisor.
   - Transferencias: Verificación de IBAN/SINPE y número de comprobante bancario.
   - Efectivo: Control de arqueo en caja y límites máximos de caja chica ZF.
   - Crédito Comercial: Evaluación de días plazo (máx 90 días) y límite crediticio.

3. EJECUCIÓN Y REGISTRO:
   - Emisión de respuesta JSON con estado de la transacción.
   - Almacenamiento en el libro auxiliar de auditoría (transactionLedger).

4. CONCILIACIÓN AUTOMÁTICA:
   - Cierre de lote y cruce de montos cobrados contra los estados de cuenta y sistema ERP.
  `;

  document.getElementById('docContainer').textContent = docText;
  log('DOCUMENTACIÓN: Flujo de integración desplegado en pantalla.');
}