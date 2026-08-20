"use strict";

/*
 * ================================================================
 * SISTEMA DE GESTIÓN B2B
 * ================================================================
 *
 * Arquitectura:
 *
 * StateManager
 *      |
 *      +---- TieredPricingEngine
 *      |
 *      +---- CreditApprovalSystem
 *      |
 *      +---- QuoteManager
 *      |
 *      +---- ProgressTracker
 *      |
 *      +---- UIController
 *
 * La lógica de negocio permanece separada de la manipulación DOM.
 * No se utilizan frameworks ni dependencias externas.
 */


/* ================================================================
   1. STATE MANAGER
   ================================================================ */

/**
 * Centraliza el estado de la aplicación.
 */
class StateManager {

    constructor() {

        this.state = {
            currentQuote: null,
            currentQuoteTotal: 0,
            checklist: {},
            lastCreditEvaluation: null
        };
    }

    /**
     * Actualiza una propiedad del estado.
     */
    set(key, value) {

        this.state[key] = value;
    }

    /**
     * Obtiene una propiedad del estado.
     */
    get(key) {

        return this.state[key];
    }

    /**
     * Obtiene una copia del estado completo.
     */
    getAll() {

        return { ...this.state };
    }
}


/* ================================================================
   2. MOTOR DE PRECIOS ESCALONADOS
   ================================================================ */

class TieredPricingEngine {

    constructor() {

        /*
         * Catálogo de productos.
         *
         * tiers:
         * quantity = cantidad mínima para activar el nivel.
         * discount = descuento decimal.
         */

        this.products = {

            PROD001: {
                id: "PROD001",
                name: "Laptop Corporativa",
                basePrice: 850,
                tiers: [
                    { quantity: 1, discount: 0 },
                    { quantity: 10, discount: 0.05 },
                    { quantity: 25, discount: 0.10 },
                    { quantity: 50, discount: 0.15 },
                    { quantity: 100, discount: 0.20 }
                ]
            },

            PROD002: {
                id: "PROD002",
                name: "Monitor Profesional 24 pulgadas",
                basePrice: 220,
                tiers: [
                    { quantity: 1, discount: 0 },
                    { quantity: 10, discount: 0.04 },
                    { quantity: 25, discount: 0.08 },
                    { quantity: 50, discount: 0.12 },
                    { quantity: 100, discount: 0.18 }
                ]
            },

            PROD003: {
                id: "PROD003",
                name: "Teclado Empresarial",
                basePrice: 45,
                tiers: [
                    { quantity: 1, discount: 0 },
                    { quantity: 10, discount: 0.03 },
                    { quantity: 25, discount: 0.07 },
                    { quantity: 50, discount: 0.10 },
                    { quantity: 100, discount: 0.15 }
                ]
            },

            PROD004: {
                id: "PROD004",
                name: "Mouse Empresarial",
                basePrice: 30,
                tiers: [
                    { quantity: 1, discount: 0 },
                    { quantity: 10, discount: 0.03 },
                    { quantity: 25, discount: 0.06 },
                    { quantity: 50, discount: 0.10 },
                    { quantity: 100, discount: 0.14 }
                ]
            },

            PROD005: {
                id: "PROD005",
                name: "Docking Station USB-C",
                basePrice: 160,
                tiers: [
                    { quantity: 1, discount: 0 },
                    { quantity: 10, discount: 0.05 },
                    { quantity: 25, discount: 0.09 },
                    { quantity: 50, discount: 0.14 },
                    { quantity: 100, discount: 0.20 }
                ]
            }
        };
    }

    /**
     * Busca un producto.
     */
    getProduct(productId) {

        return this.products[productId] || null;
    }

    /**
     * Devuelve todos los productos.
     */
    getProducts() {

        return Object.values(this.products);
    }

    /**
     * Determina el nivel de descuento correspondiente.
     */
    getTier(product, quantity) {

        let selectedTier = product.tiers[0];

        for (const tier of product.tiers) {

            if (quantity >= tier.quantity) {
                selectedTier = tier;
            }
        }

        return selectedTier;
    }

    /**
     * Calcula el precio escalonado.
     *
     * Retorna una matriz:
     *
     * [
     *   precioBase,
     *   porcentajeDescuento,
     *   precioUnitarioFinal,
     *   subtotal
     * ]
     */
    calculate(productId, quantity) {

        const product = this.getProduct(productId);

        if (!product) {
            throw new Error("Producto no encontrado.");
        }

        const safeQuantity = Math.max(
            0,
            Number.parseInt(quantity, 10) || 0
        );

        const tier = this.getTier(product, safeQuantity);

        const basePrice = product.basePrice;

        const discountPercentage = tier.discount * 100;

        const finalUnitPrice =
            basePrice * (1 - tier.discount);

        const subtotal =
            finalUnitPrice * safeQuantity;

        return [
            Number(basePrice.toFixed(2)),
            Number(discountPercentage.toFixed(2)),
            Number(finalUnitPrice.toFixed(2)),
            Number(subtotal.toFixed(2))
        ];
    }

    /**
     * Devuelve un objeto más descriptivo para la aplicación.
     */
    calculateDetailed(productId, quantity) {

        const result = this.calculate(productId, quantity);

        return {
            productId,
            quantity: Number(quantity) || 0,
            basePrice: result[0],
            discountPercentage: result[1],
            unitPrice: result[2],
            subtotal: result[3],
            discountAmount:
                Number(
                    (
                        result[0] * (Number(quantity) || 0) -
                        result[3]
                    ).toFixed(2)
                )
        };
    }
}


/* ================================================================
   3. SISTEMA DE CRÉDITO
   ================================================================ */

class CreditApprovalSystem {

    constructor() {

        /*
         * Simulación de base de datos de clientes corporativos.
         */

        this.clients = [

            {
                id: "CLI001",
                razonSocial: "Corporación Alpha S.A.",
                lineaCreditoAprobada: 50000,
                saldoUtilizado: 12000,
                estadoCuenta: "Activo"
            },

            {
                id: "CLI002",
                razonSocial: "Distribuidora Central Ltda.",
                lineaCreditoAprobada: 25000,
                saldoUtilizado: 18000,
                estadoCuenta: "Activo"
            },

            {
                id: "CLI003",
                razonSocial: "Grupo Empresarial Nova",
                lineaCreditoAprobada: 100000,
                saldoUtilizado: 30000,
                estadoCuenta: "Activo"
            },

            {
                id: "CLI004",
                razonSocial: "Distribuciones del Pacífico",
                lineaCreditoAprobada: 15000,
                saldoUtilizado: 14500,
                estadoCuenta: "Activo"
            },

            {
                id: "CLI005",
                razonSocial: "Comercializadora Global S.A.",
                lineaCreditoAprobada: 8000,
                saldoUtilizado: 8000,
                estadoCuenta: "Bloqueado"
            }
        ];
    }

    /**
     * Obtiene todos los clientes.
     */
    getClients() {

        return [...this.clients];
    }

    /**
     * Busca un cliente.
     */
    getClient(clientId) {

        return this.clients.find(
            client => client.id === clientId
        ) || null;
    }

    /**
     * Obtiene el crédito disponible.
     */
    getAvailableCredit(client) {

        return Math.max(
            0,
            client.lineaCreditoAprobada - client.saldoUtilizado
        );
    }

    /**
     * Evalúa una cotización.
     *
     * Reglas:
     *
     * - Cuenta bloqueada -> Rechazado.
     * - Exceso de línea -> Rechazado.
     * - Uso superior al 80% de crédito disponible -> Manual.
     * - Caso normal -> Aprobado.
     */
    evaluate(clientId, quoteAmount) {

        const client = this.getClient(clientId);

        if (!client) {

            return {
                decision: "Requiere Autorización Manual",
                message: "No existe información crediticia del cliente.",
                availableCredit: 0,
                quoteAmount
            };
        }

        const availableCredit =
            this.getAvailableCredit(client);

        if (client.estadoCuenta !== "Activo") {

            return {
                client,
                decision: "Rechazado por Exceso de Línea de Crédito",
                message: "La cuenta del cliente no se encuentra activa.",
                availableCredit,
                quoteAmount
            };
        }

        if (quoteAmount > availableCredit) {

            return {
                client,
                decision: "Rechazado por Exceso de Línea de Crédito",
                message:
                    "El monto de la cotización supera el crédito disponible.",
                availableCredit,
                quoteAmount
            };
        }

        /*
         * Si la cotización consume más del 80% del crédito disponible,
         * se requiere una revisión manual.
         */
        if (quoteAmount >= availableCredit * 0.8) {

            return {
                client,
                decision: "Requiere Autorización Manual",
                message:
                    "La operación se encuentra dentro del límite, " +
                    "pero requiere autorización manual por nivel de exposición.",
                availableCredit,
                quoteAmount
            };
        }

        return {
            client,
            decision: "Aprobado",
            message:
                "La cotización se encuentra dentro de la capacidad crediticia.",
            availableCredit,
            quoteAmount
        };
    }
}


/* ================================================================
   4. QUOTE MANAGER
   ================================================================ */

class QuoteManager {

    constructor(pricingEngine, creditSystem, stateManager) {

        this.pricingEngine = pricingEngine;
        this.creditSystem = creditSystem;
        this.stateManager = stateManager;

        /*
         * Impuesto configurable.
         * Se utiliza 13% como ejemplo.
         */
        this.taxRate = 0.13;
    }

    /**
     * Genera un ID único de cotización.
     */
    generateQuoteId() {

        const timestamp = Date.now();

        const random =
            Math.floor(Math.random() * 9000) + 1000;

        return `COT-${timestamp}-${random}`;
    }

    /**
     * Genera la fecha de emisión.
     */
    generateDate() {

        return new Intl.DateTimeFormat(
            "es-CR",
            {
                dateStyle: "full",
                timeStyle: "medium"
            }
        ).format(new Date());
    }

    /**
     * Calcula todos los elementos financieros.
     */
    calculateFinancials(items) {

        let grossSubtotal = 0;
        let totalDiscount = 0;

        const detailedItems = [];

        for (const item of items) {

            const result =
                this.pricingEngine.calculateDetailed(
                    item.productId,
                    item.quantity
                );

            if (result.quantity <= 0) {
                continue;
            }

            grossSubtotal +=
                result.basePrice * result.quantity;

            totalDiscount += result.discountAmount;

            detailedItems.push(result);
        }

        const netSubtotal =
            grossSubtotal - totalDiscount;

        const taxes =
            netSubtotal * this.taxRate;

        const total =
            netSubtotal + taxes;

        return {
            grossSubtotal: Number(grossSubtotal.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2)),
            netSubtotal: Number(netSubtotal.toFixed(2)),
            taxes: Number(taxes.toFixed(2)),
            total: Number(total.toFixed(2)),
            items: detailedItems
        };
    }

    /**
     * Valida los datos principales de la cotización.
     */
    validateQuote(data) {

        if (!data.razonSocial.trim()) {

            throw new Error(
                "La Razón Social es obligatoria."
            );
        }

        if (!data.rucNit.trim()) {

            throw new Error(
                "El RUC/NIT es obligatorio."
            );
        }

        if (!data.tipoDistribuidor) {

            throw new Error(
                "Debe seleccionar el tipo de distribuidor."
            );
        }

        if (!data.items || data.items.length === 0) {

            throw new Error(
                "Debe ingresar al menos un producto."
            );
        }

        const hasQuantity =
            data.items.some(
                item => Number(item.quantity) > 0
            );

        if (!hasQuantity) {

            throw new Error(
                "Debe seleccionar una cantidad mayor que cero."
            );
        }

        return true;
    }

    /**
     * Procesa una cotización completa.
     */
    createQuote(data) {

        this.validateQuote(data);

        const financials =
            this.calculateFinancials(data.items);

        const quote = {

            id: this.generateQuoteId(),

            date: this.generateDate(),

            razonSocial:
                data.razonSocial.trim(),

            rucNit:
                data.rucNit.trim(),

            tipoDistribuidor:
                data.tipoDistribuidor,

            clienteCredito:
                data.clienteCredito || null,

            terminosComerciales:
                data.terminosComerciales.trim(),

            financials
        };

        /*
         * Evaluación crediticia automática.
         */
        if (quote.clienteCredito) {

            quote.creditEvaluation =
                this.creditSystem.evaluate(
                    quote.clienteCredito,
                    financials.total
                );

        } else {

            quote.creditEvaluation = {
                decision:
                    "Requiere Autorización Manual",
                message:
                    "No se seleccionó un cliente con información crediticia."
            };
        }

        this.stateManager.set(
            "currentQuote",
            quote
        );

        this.stateManager.set(
            "currentQuoteTotal",
            financials.total
        );

        this.stateManager.set(
            "lastCreditEvaluation",
            quote.creditEvaluation
        );

        return quote;
    }
}


/* ================================================================
   5. PROGRESS TRACKER
   ================================================================ */

class ProgressTracker {

    constructor(stateManager) {

        this.stateManager = stateManager;

        this.items = [

            {
                id: "volumenes",
                label: "Definir volúmenes altos"
            },

            {
                id: "precios",
                label: "Establecer precios escalonados"
            },

            {
                id: "cotizaciones",
                label: "Configurar cotizaciones personalizadas"
            },

            {
                id: "creditos",
                label: "Habilitar créditos"
            },

            {
                id: "documentacion",
                label: "Documentar el canal corporativo"
            }
        ];

        /*
         * Inicializa todas las tareas como pendientes.
         */
        for (const item of this.items) {

            this.stateManager.state.checklist[item.id] =
                false;
        }
    }

    /**
     * Cambia el estado de una tarea.
     */
    setItem(id, completed) {

        if (!(id in this.stateManager.state.checklist)) {
            return;
        }

        this.stateManager.state.checklist[id] =
            Boolean(completed);
    }

    /**
     * Calcula el porcentaje de avance.
     */
    calculateProgress() {

        const total = this.items.length;

        if (total === 0) {
            return 0;
        }

        const completed =
            this.items.filter(
                item =>
                    this.stateManager.state.checklist[item.id]
            ).length;

        return Math.round(
            (completed / total) * 100
        );
    }

    /**
     * Devuelve las tareas.
     */
    getItems() {

        return [...this.items];
    }
}


/* ================================================================
   6. UI CONTROLLER
   ================================================================ */

class UIController {

    constructor(
        pricingEngine,
        quoteManager,
        creditSystem,
        progressTracker
    ) {

        this.pricingEngine = pricingEngine;
        this.quoteManager = quoteManager;
        this.creditSystem = creditSystem;
        this.progressTracker = progressTracker;

        this.elements = {};

        this.cacheDOM();

        this.initialize();
    }

    /**
     * Guarda referencias a los elementos DOM.
     */
    cacheDOM() {

        this.elements.form =
            document.getElementById("quoteForm");

        this.elements.productsBody =
            document.getElementById("productsBody");

        this.elements.subtotalGeneral =
            document.getElementById("subtotalGeneral");

        this.elements.descuentoGeneral =
            document.getElementById("descuentoGeneral");

        this.elements.subtotalNeto =
            document.getElementById("subtotalNeto");

        this.elements.impuestos =
            document.getElementById("impuestos");

        this.elements.totalDefinitivo =
            document.getElementById("totalDefinitivo");

        this.elements.quoteResult =
            document.getElementById("quoteResult");

        this.elements.clienteCredito =
            document.getElementById("clienteCredito");

        this.elements.checklistContainer =
            document.getElementById("checklistContainer");

        this.elements.progressPercentage =
            document.getElementById("progressPercentage");

        this.elements.progressBar =
            document.getElementById("progressBar");
    }

    /**
     * Inicializa todos los componentes.
     */
    initialize() {

        this.renderProducts();

        this.renderCreditClients();

        this.renderChecklist();

        this.bindEvents();

        this.updateFinancialSummary();
    }

    /**
     * Formatea cantidades monetarias.
     */
    formatMoney(value) {

        return new Intl.NumberFormat(
            "es-CR",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format(Number(value) || 0);
    }

    /**
     * Crea la tabla de productos.
     */
    renderProducts() {

        this.elements.productsBody.innerHTML = "";

        const products =
            this.pricingEngine.getProducts();

        for (const product of products) {

            const row =
                document.createElement("tr");

            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                product.name;

            const priceCell =
                document.createElement("td");

            priceCell.textContent =
                this.formatMoney(
                    product.basePrice
                );

            const quantityCell =
                document.createElement("td");

            const quantityInput =
                document.createElement("input");

            quantityInput.type = "number";
            quantityInput.min = "0";
            quantityInput.step = "1";
            quantityInput.value = "0";

            quantityInput.dataset.productId =
                product.id;

            quantityInput.setAttribute(
                "aria-label",
                `Cantidad de ${product.name}`
            );

            const discountCell =
                document.createElement("td");

            discountCell.textContent = "0%";

            const unitPriceCell =
                document.createElement("td");

            unitPriceCell.textContent =
                this.formatMoney(
                    product.basePrice
                );

            const subtotalCell =
                document.createElement("td");

            subtotalCell.textContent =
                this.formatMoney(0);

            /*
             * Guardamos referencias para actualizar
             * únicamente la fila modificada.
             */
            quantityInput.addEventListener(
                "input",
                () => {

                    const result =
                        this.pricingEngine.calculateDetailed(
                            product.id,
                            quantityInput.value
                        );

                    discountCell.textContent =
                        `${result.discountPercentage}%`;

                    unitPriceCell.textContent =
                        this.formatMoney(
                            result.unitPrice
                        );

                    subtotalCell.textContent =
                        this.formatMoney(
                            result.subtotal
                        );

                    /*
                     * Actualiza el resumen global
                     * en tiempo real.
                     */
                    this.updateFinancialSummary();
                }
            );

            quantityCell.appendChild(
                quantityInput
            );

            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.appendChild(quantityCell);
            row.appendChild(discountCell);
            row.appendChild(unitPriceCell);
            row.appendChild(subtotalCell);

            this.elements.productsBody.appendChild(
                row
            );
        }
    }

    /**
     * Renderiza los clientes disponibles para crédito.
     */
    renderCreditClients() {

        const clients =
            this.creditSystem.getClients();

        for (const client of clients) {

            const option =
                document.createElement("option");

            option.value = client.id;

            option.textContent =
                `${client.razonSocial} — Crédito disponible: ` +
                this.formatMoney(
                    this.creditSystem.getAvailableCredit(
                        client
                    )
                );

            this.elements.clienteCredito.appendChild(
                option
            );
        }
    }

    /**
     * Recopila los productos introducidos en el formulario.
     */
    collectItems() {

        const inputs =
            this.elements.productsBody.querySelectorAll(
                "input[data-product-id]"
            );

        return Array.from(inputs).map(
            input => ({

                productId:
                    input.dataset.productId,

                quantity:
                    Number(input.value) || 0
            })
        );
    }

    /**
     * Actualiza el resumen financiero.
     */
    updateFinancialSummary() {

        const items =
            this.collectItems();

        const financials =
            this.quoteManager.calculateFinancials(
                items
            );

        this.elements.subtotalGeneral.textContent =
            this.formatMoney(
                financials.grossSubtotal
            );

        this.elements.descuentoGeneral.textContent =
            this.formatMoney(
                financials.totalDiscount
            );

        this.elements.subtotalNeto.textContent =
            this.formatMoney(
                financials.netSubtotal
            );

        this.elements.impuestos.textContent =
            this.formatMoney(
                financials.taxes
            );

        this.elements.totalDefinitivo.textContent =
            this.formatMoney(
                financials.total
            );
    }

    /**
     * Captura los datos del formulario.
     */
    collectFormData() {

        return {

            razonSocial:
                document.getElementById(
                    "razonSocial"
                ).value,

            rucNit:
                document.getElementById(
                    "rucNit"
                ).value,

            tipoDistribuidor:
                document.getElementById(
                    "tipoDistribuidor"
                ).value,

            clienteCredito:
                document.getElementById(
                    "clienteCredito"
                ).value,

            items:
                this.collectItems(),

            terminosComerciales:
                document.getElementById(
                    "terminosComerciales"
                ).value
        };
    }

    /**
     * Procesa el formulario de cotización.
     */
    handleQuoteSubmit(event) {

        event.preventDefault();

        try {

            const data =
                this.collectFormData();

            const quote =
                this.quoteManager.createQuote(
                    data
                );

            this.renderQuote(quote);

            this.renderCreditEvaluation(
                quote.creditEvaluation
            );

            this.elements.quoteResult.hidden =
                false;

            /*
             * Desplaza la vista hasta el resultado.
             */
            this.elements.quoteResult.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            window.alert(
                `No se pudo generar la cotización:\n\n${error.message}`
            );
        }
    }

    /**
     * Renderiza el resultado de la cotización.
     */
    renderQuote(quote) {

        document.getElementById(
            "quoteId"
        ).textContent = quote.id;

        document.getElementById(
            "quoteDate"
        ).textContent = quote.date;

        document.getElementById(
            "resultRazonSocial"
        ).textContent = quote.razonSocial;

        document.getElementById(
            "resultRucNit"
        ).textContent = quote.rucNit;

        document.getElementById(
            "resultTipoDistribuidor"
        ).textContent =
            quote.tipoDistribuidor;

        document.getElementById(
            "resultSubtotal"
        ).textContent =
            this.formatMoney(
                quote.financials.grossSubtotal
            );

        document.getElementById(
            "resultDescuento"
        ).textContent =
            this.formatMoney(
                quote.financials.totalDiscount
            );

        document.getElementById(
            "resultNeto"
        ).textContent =
            this.formatMoney(
                quote.financials.netSubtotal
            );

        document.getElementById(
            "resultImpuestos"
        ).textContent =
            this.formatMoney(
                quote.financials.taxes
            );

        document.getElementById(
            "resultTotal"
        ).textContent =
            this.formatMoney(
                quote.financials.total
            );

        document.getElementById(
            "resultTerminos"
        ).textContent =
            quote.terminosComerciales ||
            "Sin términos comerciales especiales.";

        this.renderQuoteItems(
            quote.financials.items
        );
    }

    /**
     * Renderiza el desglose de productos.
     */
    renderQuoteItems(items) {

        const tbody =
            document.getElementById(
                "quoteItemsResult"
            );

        tbody.innerHTML = "";

        for (const item of items) {

            const product =
                this.pricingEngine.getProduct(
                    item.productId
                );

            const row =
                document.createElement("tr");

            const values = [

                product
                    ? product.name
                    : item.productId,

                item.quantity,

                this.formatMoney(
                    item.basePrice
                ),

                `${item.discountPercentage}%`,

                this.formatMoney(
                    item.unitPrice
                ),

                this.formatMoney(
                    item.subtotal
                )
            ];

            for (const value of values) {

                const cell =
                    document.createElement("td");

                cell.textContent =
                    String(value);

                row.appendChild(cell);
            }

            tbody.appendChild(row);
        }
    }

    /**
     * Renderiza la evaluación crediticia.
     */
    renderCreditEvaluation(evaluation) {

        const client =
            evaluation.client;

        document.getElementById(
            "creditClient"
        ).textContent =
            client
                ? client.razonSocial
                : "No registrado";

        document.getElementById(
            "creditLimit"
        ).textContent =
            client
                ? this.formatMoney(
                    client.lineaCreditoAprobada
                )
                : this.formatMoney(0);

        document.getElementById(
            "creditUsed"
        ).textContent =
            client
                ? this.formatMoney(
                    client.saldoUtilizado
                )
                : this.formatMoney(0);

        document.getElementById(
            "creditAvailable"
        ).textContent =
            this.formatMoney(
                evaluation.availableCredit || 0
            );

        document.getElementById(
            "creditQuoteAmount"
        ).textContent =
            this.formatMoney(
                evaluation.quoteAmount || 0
            );

        document.getElementById(
            "creditDecision"
        ).textContent =
            evaluation.decision;

        document.getElementById(
            "creditMessage"
        ).textContent =
            evaluation.message;
    }

    /**
     * Renderiza el checklist.
     */
    renderChecklist() {

        const legend =
            this.elements.checklistContainer.querySelector(
                "legend"
            );

        /*
         * Eliminamos los elementos anteriores sin eliminar
         * el legend.
         */
        const existing =
            this.elements.checklistContainer.querySelectorAll(
                "p"
            );

        existing.forEach(
            element => element.remove()
        );

        const items =
            this.progressTracker.getItems();

        for (const item of items) {

            const paragraph =
                document.createElement("p");

            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.id =
                `check-${item.id}`;

            checkbox.dataset.checkId =
                item.id;

            checkbox.checked =
                this.progressTracker
                    .stateManager
                    .state
                    .checklist[item.id];

            const label =
                document.createElement("label");

            label.htmlFor =
                checkbox.id;

            label.textContent =
                item.label;

            checkbox.addEventListener(
                "change",
                () => {

                    this.progressTracker.setItem(
                        item.id,
                        checkbox.checked
                    );

                    this.updateProgress();
                }
            );

            paragraph.appendChild(checkbox);
            paragraph.appendChild(
                document.createTextNode(" ")
            );
            paragraph.appendChild(label);

            this.elements.checklistContainer.appendChild(
                paragraph
            );
        }

        /*
         * Evita que la variable quede sin uso en entornos
         * que realizan análisis estático.
         */
        void legend;

        this.updateProgress();
    }

    /**
     * Actualiza el KPI global.
     */
    updateProgress() {

        const percentage =
            this.progressTracker.calculateProgress();

        this.elements.progressPercentage.textContent =
            `${percentage}%`;

        this.elements.progressBar.value =
            percentage;

        this.elements.progressBar.textContent =
            `${percentage}%`;
    }

    /**
     * Conecta todos los eventos globales.
     */
    bindEvents() {

        /*
         * Generación de cotización.
         */
        this.elements.form.addEventListener(
            "submit",
            event => this.handleQuoteSubmit(event)
        );

        /*
         * Cambio de cliente crediticio.
         *
         * Si ya existe una cotización, se vuelve a evaluar
         * automáticamente con el nuevo cliente.
         */
        this.elements.clienteCredito.addEventListener(
            "change",
            () => {

                const currentQuote =
                    this.quoteManager
                        .stateManager
                        .get("currentQuote");

                if (!currentQuote) {
                    return;
                }

                const clientId =
                    this.elements.clienteCredito.value;

                if (!clientId) {
                    return;
                }

                const evaluation =
                    this.creditSystem.evaluate(
                        clientId,
                        currentQuote.financials.total
                    );

                currentQuote.creditEvaluation =
                    evaluation;

                this.renderCreditEvaluation(
                    evaluation
                );
            }
        );

        /*
         * Reset del formulario.
         */
        document.getElementById(
            "resetQuote"
        ).addEventListener(
            "click",
            () => {

                setTimeout(
                    () => {

                        this.elements.quoteResult.hidden =
                            true;

                        this.updateFinancialSummary();

                        document.getElementById(
                            "creditClient"
                        ).textContent =
                            "Sin evaluar";

                        document.getElementById(
                            "creditDecision"
                        ).textContent =
                            "Pendiente";

                        document.getElementById(
                            "creditMessage"
                        ).textContent =
                            "";

                    },
                    0
                );
            }
        );
    }
}


/* ================================================================
   7. INICIALIZACIÓN DE LA APLICACIÓN
   ================================================================ */

/**
 * Punto de entrada principal.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Instancia del estado global.
         */
        const stateManager =
            new StateManager();

        /*
         * Motor de precios.
         */
        const pricingEngine =
            new TieredPricingEngine();

        /*
         * Sistema de evaluación crediticia.
         */
        const creditSystem =
            new CreditApprovalSystem();

        /*
         * Gestor de cotizaciones.
         */
        const quoteManager =
            new QuoteManager(
                pricingEngine,
                creditSystem,
                stateManager
            );

        /*
         * Controlador del checklist.
         */
        const progressTracker =
            new ProgressTracker(
                stateManager
            );

        /*
         * Controlador de interfaz.
         */
        new UIController(
            pricingEngine,
            quoteManager,
            creditSystem,
            progressTracker
        );

        console.log(
            "Sistema B2B inicializado correctamente."
        );
    }
);