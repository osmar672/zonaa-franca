// ======================================================
// ARENAL TRADE ZONE
// SISTEMA DE GESTIÓN DE PROVEEDORES
// ======================================================


// ======================================================
// 1. DATOS INICIALES
// ======================================================

const proveedoresIniciales = [
    {
        id: 1,
        nombre: "Distribuidora Central",
        categoria: "Alimentos",
        contacto: "Carlos Méndez",
        email: "carlos@distribuidora.com",
        estado: "activo"
    },

    {
        id: 2,
        nombre: "Tecnología Global",
        categoria: "Tecnología",
        contacto: "Laura Rodríguez",
        email: "laura@tecnologiaglobal.com",
        estado: "activo"
    },

    {
        id: 3,
        nombre: "Logística Express",
        categoria: "Logística",
        contacto: "Andrés Vargas",
        email: "andres@logistica.com",
        estado: "inactivo"
    },

    {
        id: 4,
        nombre: "Suministros del Norte",
        categoria: "Suministros",
        contacto: "María López",
        email: "maria@suministros.com",
        estado: "activo"
    }
];


// ======================================================
// 2. ELEMENTOS DEL DOM
// ======================================================

const buscador = document.querySelector("#buscador");

const filtroCategoria =
    document.querySelector("#filtroCategoria");

const filtroEstado =
    document.querySelector("#filtroEstado");

const listaProveedores =
    document.querySelector("#listaProveedores");

const formFiltros =
    document.querySelector("#formFiltros");

const formProveedor =
    document.querySelector("#formProveedor");

const btnLimpiarFiltros =
    document.querySelector("#btnLimpiarFiltros");


// Campos del formulario

const nombreProveedor =
    document.querySelector("#nombreProveedor");

const categoriaProveedor =
    document.querySelector("#categoriaProveedor");

const contactoProveedor =
    document.querySelector("#contactoProveedor");

const emailProveedor =
    document.querySelector("#emailProveedor");

const estadoProveedor =
    document.querySelector("#estadoProveedor");


// ======================================================
// 3. CARGAR PROVEEDORES
// ======================================================

function obtenerProveedores() {

    const datosGuardados =
        localStorage.getItem("arenalTradeZoneProveedores");

    if (datosGuardados) {
        return JSON.parse(datosGuardados);
    }

    localStorage.setItem(
        "arenalTradeZoneProveedores",
        JSON.stringify(proveedoresIniciales)
    );

    return proveedoresIniciales;
}


let proveedores = obtenerProveedores();


// ======================================================
// 4. GUARDAR PROVEEDORES
// ======================================================

function guardarProveedores() {

    localStorage.setItem(
        "arenalTradeZoneProveedores",
        JSON.stringify(proveedores)
    );
}


// ======================================================
// 5. CARGAR CATEGORÍAS
// ======================================================

function cargarCategorias() {

    const categorias = [
        ...new Set(
            proveedores.map(
                proveedor => proveedor.categoria
            )
        )
    ];

    categorias.sort();

    filtroCategoria.innerHTML = `
        <option value="">
            Todas las categorías
        </option>
    `;

    categorias.forEach(categoria => {

        const option =
            document.createElement("option");

        option.value = categoria;
        option.textContent = categoria;

        filtroCategoria.appendChild(option);
    });
}


// ======================================================
// 6. FILTRAR PROVEEDORES
// ======================================================

function filtrarProveedores() {

    const texto =
        buscador.value
            .toLowerCase()
            .trim();

    const categoria =
        filtroCategoria.value;

    const estado =
        filtroEstado.value;


    const resultados =
        proveedores.filter(proveedor => {

            const coincideTexto =
                proveedor.nombre
                    .toLowerCase()
                    .includes(texto) ||

                proveedor.categoria
                    .toLowerCase()
                    .includes(texto) ||

                proveedor.contacto
                    .toLowerCase()
                    .includes(texto) ||

                proveedor.email
                    .toLowerCase()
                    .includes(texto);


            const coincideCategoria =
                categoria === "" ||
                proveedor.categoria === categoria;


            const coincideEstado =
                estado === "" ||
                proveedor.estado === estado;


            return (
                coincideTexto &&
                coincideCategoria &&
                coincideEstado
            );
        });


    mostrarProveedores(resultados);
}


// ======================================================
// 7. MOSTRAR PROVEEDORES
// ======================================================

function mostrarProveedores(lista) {

    listaProveedores.innerHTML = "";


    if (lista.length === 0) {

        listaProveedores.innerHTML = `
            <article>
                <h3>No se encontraron proveedores</h3>

                <p>
                    Intenta modificar los criterios
                    de búsqueda.
                </p>
            </article>
        `;

        return;
    }


    lista.forEach(proveedor => {

        const article =
            document.createElement("article");


        article.className = "proveedor";


        article.innerHTML = `
            <h3>${proveedor.nombre}</h3>

            <p>
                <strong>Categoría:</strong>
                ${proveedor.categoria}
            </p>

            <p>
                <strong>Contacto:</strong>
                ${proveedor.contacto}
            </p>

            <p>
                <strong>Email:</strong>
                ${proveedor.email}
            </p>

            <p>
                <strong>Estado:</strong>
                ${capitalizar(proveedor.estado)}
            </p>
        `;


        listaProveedores.appendChild(article);
    });
}


// ======================================================
// 8. REGISTRAR PROVEEDOR
// ======================================================

function registrarProveedor(event) {

    event.preventDefault();


    const nuevoProveedor = {

        id: Date.now(),

        nombre:
            nombreProveedor.value.trim(),

        categoria:
            categoriaProveedor.value.trim(),

        contacto:
            contactoProveedor.value.trim(),

        email:
            emailProveedor.value.trim(),

        estado:
            estadoProveedor.value
    };


    // Validación básica

    if (
        !nuevoProveedor.nombre ||
        !nuevoProveedor.categoria ||
        !nuevoProveedor.contacto ||
        !nuevoProveedor.email
    ) {

        alert(
            "Por favor, completa todos los campos."
        );

        return;
    }


    // Agregar proveedor

    proveedores.push(nuevoProveedor);


    // Guardar en localStorage

    guardarProveedores();


    // Actualizar categorías

    cargarCategorias();


    // Actualizar listado

    mostrarProveedores(proveedores);


    // Limpiar formulario

    formProveedor.reset();


    alert(
        "Proveedor registrado correctamente."
    );
}


// ======================================================
// 9. LIMPIAR FILTROS
// ======================================================

function limpiarFiltros() {

    buscador.value = "";

    filtroCategoria.value = "";

    filtroEstado.value = "";

    mostrarProveedores(proveedores);
}


// ======================================================
// 10. CAPITALIZAR TEXTO
// ======================================================

function capitalizar(texto) {

    if (!texto) {
        return "";
    }

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}


// ======================================================
// 11. EVENTOS
// ======================================================


// Buscar mientras el usuario escribe

buscador.addEventListener(
    "input",
    filtrarProveedores
);


// Filtrar por categoría

filtroCategoria.addEventListener(
    "change",
    filtrarProveedores
);


// Filtrar por estado

filtroEstado.addEventListener(
    "change",
    filtrarProveedores
);


// Registrar proveedor

formProveedor.addEventListener(
    "submit",
    registrarProveedor
);


// Limpiar filtros

formFiltros.addEventListener(
    "reset",
    () => {

        setTimeout(() => {
            mostrarProveedores(proveedores);
        }, 0);

    }
);


// También funciona con el botón

btnLimpiarFiltros.addEventListener(
    "click",
    limpiarFiltros
);


// ======================================================
// 12. INICIALIZAR APLICACIÓN
// ======================================================

function iniciarAplicacion() {

    cargarCategorias();

    mostrarProveedores(proveedores);
}


iniciarAplicacion();