/*
==================================================
DIRECTORIO DE PROVEEDORES
JavaScript Vanilla ES6+
==================================================
*/


/*
==================================================
CONFIGURACIÓN
==================================================
*/

const STORAGE_KEY = "proveedoresERP";


/*
==================================================
REFERENCIAS AL DOM
==================================================
*/

const formProveedor =
    document.querySelector("#formProveedor");

const listaProveedores =
    document.querySelector("#listaProveedores");

const contador =
    document.querySelector("#contador");

const buscar =
    document.querySelector("#buscar");

const filtroCategoria =
    document.querySelector("#filtroCategoria");

const filtroCiudad =
    document.querySelector("#filtroCiudad");

const filtroEstado =
    document.querySelector("#filtroEstado");

const limpiarFiltros =
    document.querySelector("#limpiarFiltros");


/*
==================================================
CARGAR PROVEEDORES
==================================================
*/

let proveedores = cargarProveedores();


/*
==================================================
DATOS DE DEMOSTRACIÓN
==================================================
*/

if (proveedores.length === 0) {

    proveedores = [

        {
            id: generarId(),
            nombre: "Distribuidora Central",
            categoria: "Materias primas",
            ciudad: "San José",
            correo: "ventas@distribuidoracentral.com",
            telefono: "2222-1111",
            estado: "Activo"
        },

        {
            id: generarId(),
            nombre: "Componentes Industriales CR",
            categoria: "Componentes",
            ciudad: "Alajuela",
            correo: "contacto@componentescr.com",
            telefono: "2444-5555",
            estado: "Activo"
        },

        {
            id: generarId(),
            nombre: "Insumos del Pacífico",
            categoria: "Insumos",
            ciudad: "Puntarenas",
            correo: "info@insumospacifico.com",
            telefono: "2661-7890",
            estado: "Suspendido"
        }

    ];

    guardarProveedores();
}


/*
==================================================
CARGAR DATOS DESDE LOCALSTORAGE
==================================================
*/

function cargarProveedores() {

    const datos =
        localStorage.getItem(STORAGE_KEY);

    if (!datos) {
        return [];
    }

    try {

        return JSON.parse(datos);

    } catch (error) {

        console.error(
            "Error al cargar proveedores:",
            error
        );

        return [];
    }
}


/*
==================================================
GUARDAR DATOS
==================================================
*/

function guardarProveedores() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(proveedores)
    );
}


/*
==================================================
GENERAR ID
==================================================
*/

function generarId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


/*
==================================================
REGISTRAR PROVEEDOR
==================================================
*/

formProveedor.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const proveedor = {

            id: generarId(),

            nombre:
                document
                    .querySelector("#nombre")
                    .value
                    .trim(),

            categoria:
                document
                    .querySelector("#categoria")
                    .value
                    .trim(),

            ciudad:
                document
                    .querySelector("#ciudad")
                    .value
                    .trim(),

            correo:
                document
                    .querySelector("#correo")
                    .value
                    .trim(),

            telefono:
                document
                    .querySelector("#telefono")
                    .value
                    .trim(),

            estado:
                document
                    .querySelector("#estado")
                    .value
        };


        proveedores.push(proveedor);


        guardarProveedores();


        formProveedor.reset();


        renderizarProveedores();

    }
);


/*
==================================================
OBTENER PROVEEDORES FILTRADOS
==================================================
*/

function obtenerProveedoresFiltrados() {

    const texto =
        buscar.value
            .toLowerCase()
            .trim();


    const categoria =
        filtroCategoria.value
            .toLowerCase()
            .trim();


    const ciudad =
        filtroCiudad.value
            .toLowerCase()
            .trim();


    const estado =
        filtroEstado.value;


    return proveedores.filter(
        function (proveedor) {

            const coincideTexto =

                proveedor.nombre
                    .toLowerCase()
                    .includes(texto)

                ||

                proveedor.correo
                    .toLowerCase()
                    .includes(texto)

                ||

                proveedor.telefono
                    .toLowerCase()
                    .includes(texto);


            const coincideCategoria =

                proveedor.categoria
                    .toLowerCase()
                    .includes(categoria);


            const coincideCiudad =

                proveedor.ciudad
                    .toLowerCase()
                    .includes(ciudad);


            const coincideEstado =

                estado === "" ||
                proveedor.estado === estado;


            return (

                coincideTexto &&
                coincideCategoria &&
                coincideCiudad &&
                coincideEstado

            );

        }
    );
}


/*
==================================================
MOSTRAR PROVEEDORES
==================================================
*/

function renderizarProveedores() {

    const resultados =
        obtenerProveedoresFiltrados();


    listaProveedores.innerHTML = "";


    contador.textContent =
        `${resultados.length} proveedor(es) encontrado(s)`;


    if (resultados.length === 0) {

        listaProveedores.innerHTML = `
            <p>
                No se encontraron proveedores.
            </p>
        `;

        return;
    }


    resultados.forEach(
        function (proveedor) {

            const elemento =
                document.createElement("article");


            elemento.innerHTML = `

                <hr>

                <h3>
                    ${escaparHTML(proveedor.nombre)}
                </h3>

                <p>
                    <strong>Categoría:</strong>
                    ${escaparHTML(proveedor.categoria)}
                </p>

                <p>
                    <strong>Ciudad:</strong>
                    ${escaparHTML(proveedor.ciudad)}
                </p>

                <p>
                    <strong>Correo:</strong>
                    ${escaparHTML(proveedor.correo)}
                </p>

                <p>
                    <strong>Teléfono:</strong>
                    ${escaparHTML(proveedor.telefono)}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${escaparHTML(proveedor.estado)}
                </p>

                <button
                    type="button"
                    class="editar"
                    data-id="${proveedor.id}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="eliminar"
                    data-id="${proveedor.id}"
                >
                    Eliminar
                </button>

                <hr>

            `;


            listaProveedores.appendChild(
                elemento
            );

        }
    );
}


/*
==================================================
EDITAR / ELIMINAR
==================================================
*/

listaProveedores.addEventListener(
    "click",
    function (event) {

        const id =
            event.target.dataset.id;


        if (!id) {
            return;
        }


        /*
        ------------------------------------------
        ELIMINAR
        ------------------------------------------
        */

        if (
            event.target.classList
                .contains("eliminar")
        ) {

            const confirmar =
                confirm(
                    "¿Desea eliminar este proveedor?"
                );


            if (!confirmar) {
                return;
            }


            proveedores =
                proveedores.filter(
                    function (proveedor) {

                        return proveedor.id !== id;

                    }
                );


            guardarProveedores();

            renderizarProveedores();

        }


        /*
        ------------------------------------------
        EDITAR
        ------------------------------------------
        */

        if (
            event.target.classList
                .contains("editar")
        ) {

            editarProveedor(id);

        }

    }
);


/*
==================================================
EDITAR PROVEEDOR
==================================================
*/

function editarProveedor(id) {

    const proveedor =
        proveedores.find(
            function (proveedor) {

                return proveedor.id === id;

            }
        );


    if (!proveedor) {
        return;
    }


    const nuevoNombre =
        prompt(
            "Nombre del proveedor:",
            proveedor.nombre
        );


    if (nuevoNombre === null) {
        return;
    }


    const nuevaCategoria =
        prompt(
            "Categoría:",
            proveedor.categoria
        );


    if (nuevaCategoria === null) {
        return;
    }


    const nuevaCiudad =
        prompt(
            "Ciudad:",
            proveedor.ciudad
        );


    if (nuevaCiudad === null) {
        return;
    }


    const nuevoCorreo =
        prompt(
            "Correo electrónico:",
            proveedor.correo
        );


    if (nuevoCorreo === null) {
        return;
    }


    const nuevoTelefono =
        prompt(
            "Teléfono:",
            proveedor.telefono
        );


    if (nuevoTelefono === null) {
        return;
    }


    proveedor.nombre =
        nuevoNombre.trim();

    proveedor.categoria =
        nuevaCategoria.trim();

    proveedor.ciudad =
        nuevaCiudad.trim();

    proveedor.correo =
        nuevoCorreo.trim();

    proveedor.telefono =
        nuevoTelefono.trim();


    guardarProveedores();

    renderizarProveedores();
}


/*
==================================================
ESCAPAR HTML
==================================================
*/

function escaparHTML(texto) {

    const elemento =
        document.createElement("div");


    elemento.textContent = texto;


    return elemento.innerHTML;
}


/*
==================================================
FILTROS EN TIEMPO REAL
==================================================
*/

buscar.addEventListener(
    "input",
    renderizarProveedores
);


filtroCategoria.addEventListener(
    "input",
    renderizarProveedores
);


filtroCiudad.addEventListener(
    "input",
    renderizarProveedores
);


filtroEstado.addEventListener(
    "change",
    renderizarProveedores
);


/*
==================================================
LIMPIAR FILTROS
==================================================
*/

limpiarFiltros.addEventListener(
    "click",
    function () {

        buscar.value = "";

        filtroCategoria.value = "";

        filtroCiudad.value = "";

        filtroEstado.value = "";


        renderizarProveedores();

    }
);


/*
==================================================
INICIALIZAR SISTEMA
==================================================
*/

renderizarProveedores();