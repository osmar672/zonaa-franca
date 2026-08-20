"use strict";

/* =========================================
   CONFIGURACIÓN
========================================= */

const IVA = 0.16;

let folioActual = 1000;

let cotizacion = [];

let inventario = [
    {
        id: 1,
        nombre: "Laptop Lenovo",
        precio: 850,
        stock: 10
    },
    {
        id: 2,
        nombre: "Mouse inalámbrico",
        precio: 25,
        stock: 30
    },
    {
        id: 3,
        nombre: "Teclado mecánico",
        precio: 65,
        stock: 20
    },
    {
        id: 4,
        nombre: "Monitor 24 pulgadas",
        precio: 180,
        stock: 15
    },
    {
        id: 5,
        nombre: "Audífonos Bluetooth",
        precio: 75,
        stock: 12
    },
    {
        id: 6,
        nombre: "Memoria USB 64GB",
        precio: 15,
        stock: 40
    }
];


/* =========================================
   ELEMENTOS DEL DOM
========================================= */

const tablaInventario =
    document.getElementById("tablaInventario");

const productoSelect =
    document.getElementById("producto");

const cantidadInput =
    document.getElementById("cantidad");

const stockDisponible =
    document.getElementById("stockDisponible");

const stockRestante =
    document.getElementById("stockRestante");

const tablaCotizacion =
    document.getElementById("tablaCotizacion");

const subtotalElemento =
    document.getElementById("subtotal");

const impuestosElemento =
    document.getElementById("impuestos");

const totalElemento =
    document.getElementById("total");

const totalVentaElemento =
    document.getElementById("totalVenta");

const ticketContenido =
    document.getElementById("ticketContenido");

const logOperaciones =
    document.getElementById("logOperaciones");

const formProducto =
    document.getElementById("formProducto");

const formVenta =
    document.getElementById("formVenta");

const vaciarCotizacion =
    document.getElementById("vaciarCotizacion");

const limpiarLog =
    document.getElementById("limpiarLog");

const reiniciarSistema =
    document.getElementById("reiniciarSistema");

const imprimirTicket =
    document.getElementById("imprimirTicket");


/* =========================================
   FUNCIONES GENERALES
========================================= */

function dinero(valor) {

    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "USD"
    }).format(valor);

}


function obtenerProducto(id) {

    return inventario.find(
        producto => producto.id === Number(id)
    );

}


function registrarOperacion(mensaje) {

    const elemento = document.createElement("li");

    const fecha = new Date();

    elemento.textContent =
        `[${fecha.toLocaleString("es-CR")}] ${mensaje}`;

    logOperaciones.prepend(elemento);

}


function calcularSubtotal() {

    return cotizacion.reduce(
        (total, item) => {
            return total + item.precio * item.cantidad;
        },
        0
    );

}


function calcularImpuesto() {

    return calcularSubtotal() * IVA;

}


function calcularTotal() {

    return calcularSubtotal() + calcularImpuesto();

}


/* =========================================
   INVENTARIO
========================================= */

function renderizarInventario() {

    tablaInventario.innerHTML = "";

    productoSelect.innerHTML = "";

    const opcionInicial =
        document.createElement("option");

    opcionInicial.value = "";

    opcionInicial.textContent =
        "Seleccione un producto";

    productoSelect.appendChild(opcionInicial);


    inventario.forEach(producto => {

        const fila =
            document.createElement("tr");

        const celdaId =
            document.createElement("td");

        celdaId.textContent =
            producto.id;

        const celdaNombre =
            document.createElement("td");

        celdaNombre.textContent =
            producto.nombre;

        const celdaPrecio =
            document.createElement("td");

        celdaPrecio.textContent =
            dinero(producto.precio);

        const celdaStock =
            document.createElement("td");

        celdaStock.textContent =
            producto.stock;


        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);

        tablaInventario.appendChild(fila);


        const opcion =
            document.createElement("option");

        opcion.value =
            producto.id;

        opcion.textContent =
            `${producto.nombre} - ${dinero(producto.precio)} - Stock: ${producto.stock}`;

        productoSelect.appendChild(opcion);

    });

}


/* =========================================
   STOCK DISPONIBLE
========================================= */

function actualizarStockVisual() {

    const id =
        Number(productoSelect.value);

    const producto =
        obtenerProducto(id);

    if (!producto) {

        stockDisponible.textContent = "-";
        stockRestante.textContent = "-";

        return;
    }


    const itemCotizacion =
        cotizacion.find(
            item => item.id === producto.id
        );


    const cantidadYaAgregada =
        itemCotizacion
            ? itemCotizacion.cantidad
            : 0;


    const disponible =
        producto.stock - cantidadYaAgregada;


    stockDisponible.textContent =
        disponible;


    const cantidad =
        Number(cantidadInput.value);


    if (
        Number.isInteger(cantidad) &&
        cantidad > 0 &&
        cantidad <= disponible
    ) {

        stockRestante.textContent =
            disponible - cantidad;

    } else {

        stockRestante.textContent =
            "Cantidad inválida";

    }

}


/* =========================================
   AGREGAR PRODUCTO
========================================= */

formProducto.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            Number(productoSelect.value);

        const cantidad =
            Number(cantidadInput.value);


        const producto =
            obtenerProducto(id);


        if (!producto) {

            alert(
                "Debe seleccionar un producto."
            );

            return;
        }


        if (
            !Number.isInteger(cantidad) ||
            cantidad <= 0
        ) {

            alert(
                "La cantidad debe ser un número entero mayor que cero."
            );

            return;
        }


        const itemExistente =
            cotizacion.find(
                item => item.id === producto.id
            );


        const cantidadActual =
            itemExistente
                ? itemExistente.cantidad
                : 0;


        if (
            cantidadActual + cantidad >
            producto.stock
        ) {

            alert(
                `Stock insuficiente. Disponible: ${producto.stock - cantidadActual}`
            );

            return;
        }


        if (itemExistente) {

            itemExistente.cantidad += cantidad;

            registrarOperacion(
                `${producto.nombre} actualizado en la cotización. Cantidad: ${itemExistente.cantidad}`
            );

        } else {

            cotizacion.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });

            registrarOperacion(
                `${producto.nombre} agregado a cotización.`
            );

        }


        renderizarCotizacion();

        cantidadInput.value = 1;

        actualizarStockVisual();

    }
);


/* =========================================
   CAMBIOS EN PRODUCTO Y CANTIDAD
========================================= */

productoSelect.addEventListener(
    "change",
    actualizarStockVisual
);

cantidadInput.addEventListener(
    "input",
    actualizarStockVisual
);


/* =========================================
   RENDERIZAR COTIZACIÓN
========================================= */

function renderizarCotizacion() {

    tablaCotizacion.innerHTML = "";


    cotizacion.forEach(item => {

        const fila =
            document.createElement("tr");


        const nombre =
            document.createElement("td");

        nombre.textContent =
            item.nombre;


        const precio =
            document.createElement("td");

        precio.textContent =
            dinero(item.precio);


        const cantidad =
            document.createElement("td");


        const input =
            document.createElement("input");

        input.type = "number";

        input.min = "1";

        input.step = "1";

        input.value =
            item.cantidad;


        input.addEventListener(
            "change",
            function() {

                modificarCantidad(
                    item.id,
                    Number(input.value)
                );

            }
        );


        cantidad.appendChild(input);


        const subtotal =
            document.createElement("td");

        subtotal.textContent =
            dinero(
                item.precio * item.cantidad
            );


        const acciones =
            document.createElement("td");


        const botonEliminar =
            document.createElement("button");

        botonEliminar.type = "button";

        botonEliminar.textContent =
            "Eliminar";


        botonEliminar.addEventListener(
            "click",
            function() {

                eliminarProducto(item.id);

            }
        );


        acciones.appendChild(
            botonEliminar
        );


        fila.appendChild(nombre);
        fila.appendChild(precio);
        fila.appendChild(cantidad);
        fila.appendChild(subtotal);
        fila.appendChild(acciones);


        tablaCotizacion.appendChild(fila);

    });


    actualizarTotales();

}


/* =========================================
   MODIFICAR CANTIDAD
========================================= */

function modificarCantidad(
    id,
    nuevaCantidad
) {

    const producto =
        obtenerProducto(id);

    const item =
        cotizacion.find(
            elemento => elemento.id === id
        );


    if (!producto || !item) {

        return;
    }


    if (
        !Number.isInteger(nuevaCantidad) ||
        nuevaCantidad <= 0
    ) {

        alert(
            "La cantidad debe ser mayor que cero."
        );

        renderizarCotizacion();

        return;
    }


    if (
        nuevaCantidad >
        producto.stock
    ) {

        alert(
            `No hay suficiente stock. Disponible: ${producto.stock}`
        );

        renderizarCotizacion();

        return;
    }


    item.cantidad =
        nuevaCantidad;


    registrarOperacion(
        `${producto.nombre}: cantidad modificada a ${nuevaCantidad}.`
    );


    renderizarCotizacion();

    actualizarStockVisual();

}


/* =========================================
   ELIMINAR PRODUCTO
========================================= */

function eliminarProducto(id) {

    const item =
        cotizacion.find(
            producto => producto.id === id
        );


    if (!item) {

        return;
    }


    cotizacion =
        cotizacion.filter(
            producto => producto.id !== id
        );


    registrarOperacion(
        `${item.nombre} eliminado de la cotización.`
    );


    renderizarCotizacion();

    actualizarStockVisual();

}


/* =========================================
   TOTALES
========================================= */

function actualizarTotales() {

    const subtotal =
        calcularSubtotal();

    const impuestos =
        subtotal * IVA;

    const total =
        subtotal + impuestos;


    subtotalElemento.textContent =
        dinero(subtotal);

    impuestosElemento.textContent =
        dinero(impuestos);

    totalElemento.textContent =
        dinero(total);

    totalVentaElemento.textContent =
        dinero(total);

}


/* =========================================
   VACIAR COTIZACIÓN
========================================= */

vaciarCotizacion.addEventListener(
    "click",
    function() {

        if (cotizacion.length === 0) {

            return;
        }


        cotizacion = [];


        renderizarCotizacion();

        actualizarStockVisual();


        registrarOperacion(
            "Cotización vaciada."
        );

    }
);


/* =========================================
   PROCESAR VENTA
========================================= */

formVenta.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (cotizacion.length === 0) {

            alert(
                "No se puede procesar una venta sin productos."
            );

            return;
        }


        const metodoPago =
            document.querySelector(
                'input[name="metodoPago"]:checked'
            );


        if (!metodoPago) {

            alert(
                "Debe seleccionar un método de pago."
            );

            return;
        }


        /*
         * Comprobación final de inventario
         */

        for (const item of cotizacion) {

            const producto =
                obtenerProducto(item.id);


            if (
                !producto ||
                item.cantidad > producto.stock
            ) {

                alert(
                    `Stock insuficiente para ${item.nombre}.`
                );

                return;
            }

        }


        /*
         * Descontar stock
         */

        cotizacion.forEach(item => {

            const producto =
                obtenerProducto(item.id);

            producto.stock -=
                item.cantidad;

        });


        const folio =
            ++folioActual;

        const fecha =
            new Date();


        const subtotal =
            calcularSubtotal();

        const impuestos =
            subtotal * IVA;

        const total =
            subtotal + impuestos;


        generarTicket({

            folio: folio,

            fecha: fecha,

            productos: [...cotizacion],

            subtotal: subtotal,

            impuestos: impuestos,

            total: total,

            metodoPago: metodoPago.value

        });


        registrarOperacion(
            `Venta #${folio} procesada con éxito. Total: ${dinero(total)}.`
        );


        cotizacion = [];


        formVenta.reset();


        renderizarInventario();

        renderizarCotizacion();

        actualizarStockVisual();

    }
);


/* =========================================
   GENERAR TICKET
========================================= */

function generarTicket(venta) {

    let ticket = "";


    ticket +=
        "==========================================\n";

    ticket +=
        "       TICKET DE VENTA - MOSTRADOR\n";

    ticket +=
        "==========================================\n";


    ticket +=
        `Folio: ${venta.folio}\n`;


    ticket +=
        `Fecha: ${venta.fecha.toLocaleDateString("es-CR")}\n`;


    ticket +=
        `Hora: ${venta.fecha.toLocaleTimeString("es-CR")}\n`;


    ticket +=
        "------------------------------------------\n";


    venta.productos.forEach(item => {

        const subtotalItem =
            item.precio * item.cantidad;


        ticket +=
            `${item.nombre}\n`;


        ticket +=
            `  ${item.cantidad} x ${dinero(item.precio)} = ${dinero(subtotalItem)}\n`;

    });


    ticket +=
        "------------------------------------------\n";


    ticket +=
        `Subtotal:       ${dinero(venta.subtotal)}\n`;


    ticket +=
        `IVA 16%:        ${dinero(venta.impuestos)}\n`;


    ticket +=
        `TOTAL:          ${dinero(venta.total)}\n`;


    ticket +=
        "------------------------------------------\n";


    ticket +=
        `Método de pago: ${venta.metodoPago}\n`;


    ticket +=
        "==========================================\n";


    ticket +=
        "        GRACIAS POR SU COMPRA\n";


    ticket +=
        "==========================================\n";


    ticketContenido.textContent =
        ticket;

}


/* =========================================
   IMPRIMIR TICKET
========================================= */

imprimirTicket.addEventListener(
    "click",
    function() {

        if (
            ticketContenido.textContent ===
            "No hay ningún ticket generado."
        ) {

            alert(
                "Primero debe generar una venta."
            );

            return;
        }


        window.print();

    }
);


/* =========================================
   LIMPIAR LOG
========================================= */

limpiarLog.addEventListener(
    "click",
    function() {

        logOperaciones.innerHTML = "";

        registrarOperacion(
            "Log de operaciones limpiado."
        );

    }
);


/* =========================================
   REINICIAR SISTEMA
========================================= */

reiniciarSistema.addEventListener(
    "click",
    function() {

        const confirmar =
            confirm(
                "¿Desea reiniciar el sistema? Se restaurará el inventario y se eliminará la cotización actual."
            );


        if (!confirmar) {

            return;
        }


        inventario = [

            {
                id: 1,
                nombre: "Laptop Lenovo",
                precio: 850,
                stock: 10
            },

            {
                id: 2,
                nombre: "Mouse inalámbrico",
                precio: 25,
                stock: 30
            },

            {
                id: 3,
                nombre: "Teclado mecánico",
                precio: 65,
                stock: 20
            },

            {
                id: 4,
                nombre: "Monitor 24 pulgadas",
                precio: 180,
                stock: 15
            },

            {
                id: 5,
                nombre: "Audífonos Bluetooth",
                precio: 75,
                stock: 12
            },

            {
                id: 6,
                nombre: "Memoria USB 64GB",
                precio: 15,
                stock: 40
            }

        ];


        cotizacion = [];

        folioActual = 1000;


        ticketContenido.textContent =
            "No hay ningún ticket generado.";


        logOperaciones.innerHTML = "";


        renderizarInventario();

        renderizarCotizacion();

        actualizarStockVisual();


        registrarOperacion(
            "Sistema reiniciado correctamente."
        );

    }
);


/* =========================================
   INICIALIZAR SISTEMA
========================================= */

renderizarInventario();

renderizarCotizacion();

actualizarStockVisual();

registrarOperacion(
    "Sistema iniciado correctamente."
);