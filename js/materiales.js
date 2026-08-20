

const STORAGE_RECURSOS = "erp_modulo3_recursos";
const STORAGE_UNIDADES = "erp_modulo3_unidades";

let recursos = cargarDatos(STORAGE_RECURSOS, []);
let unidades = cargarDatos(STORAGE_UNIDADES, []);


/* ============================================================
   UTILIDADES
   ============================================================ */

function cargarDatos(clave, valorInicial) {
    try {
        const datos = localStorage.getItem(clave);

        if (!datos) {
            return valorInicial;
        }

        const datosParseados = JSON.parse(datos);

        return Array.isArray(datosParseados)
            ? datosParseados
            : valorInicial;

    } catch (error) {
        console.error("Error al cargar datos:", error);
        return valorInicial;
    }
}


function guardarDatos() {
    localStorage.setItem(
        STORAGE_RECURSOS,
        JSON.stringify(recursos)
    );

    localStorage.setItem(
        STORAGE_UNIDADES,
        JSON.stringify(unidades)
    );
}


function generarId(prefijo) {
    return `${prefijo}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
}


function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-CR");
}


function formatearCosto(valor) {
    return Number(valor).toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


/* ============================================================
   REFERENCIAS DOM
   ============================================================ */

const recursoForm = document.getElementById("recursoForm");

const recursoId = document.getElementById("recursoId");
const skuInput = document.getElementById("sku");
const nombreInput = document.getElementById("nombre");
const descripcionInput = document.getElementById("descripcion");
const tipoInput = document.getElementById("tipo");
const unidadInput = document.getElementById("unidad");
const costoInput = document.getElementById("costoUnitario");
const stockMinimoInput = document.getElementById("stockMinimo");
const estadoInput = document.getElementById("estado");

const tablaRecursos = document.getElementById("tablaRecursos");
const totalRecursos = document.getElementById("totalRecursos");

const buscarRecurso = document.getElementById("buscarRecurso");
const filtroTipo = document.getElementById("filtroTipo");
const filtroEstado = document.getElementById("filtroEstado");

const unidadForm = document.getElementById("unidadForm");

const unidadId = document.getElementById("unidadId");
const codigoUnidad = document.getElementById("codigoUnidad");
const nombreUnidad = document.getElementById("nombreUnidad");
const descripcionUnidad = document.getElementById("descripcionUnidad");
const estadoUnidad = document.getElementById("estadoUnidad");

const tablaUnidades = document.getElementById("tablaUnidades");

const recursoHistorial = document.getElementById("recursoHistorial");
const tablaHistorial = document.getElementById("tablaHistorial");


/* ============================================================
   VALIDACIONES
   ============================================================ */

function validarRecurso(datos) {

    if (!datos.sku.trim()) {
        throw new Error("El SKU es obligatorio.");
    }

    if (!datos.nombre.trim()) {
        throw new Error("El nombre es obligatorio.");
    }

    if (!datos.tipo) {
        throw new Error("Debe seleccionar el tipo de recurso.");
    }

    if (!datos.unidad) {
        throw new Error("Debe seleccionar una unidad de medida.");
    }

    if (Number.isNaN(datos.costoUnitario) || datos.costoUnitario < 0) {
        throw new Error("El costo unitario no es válido.");
    }

    if (Number.isNaN(datos.stockMinimo) || datos.stockMinimo < 0) {
        throw new Error("El stock mínimo no es válido.");
    }
}


function skuExiste(sku, idActual = null) {
    return recursos.some(recurso =>
        recurso.sku.toLowerCase() === sku.toLowerCase() &&
        recurso.id !== idActual
    );
}


function codigoUnidadExiste(codigo, idActual = null) {
    return unidades.some(unidad =>
        unidad.codigo.toLowerCase() === codigo.toLowerCase() &&
        unidad.id !== idActual
    );
}


/* ============================================================
   RECURSOS
   ============================================================ */

function registrarRecurso(evento) {

    evento.preventDefault();

    try {

        const idActual = recursoId.value || null;

        const datos = {
            id: idActual || generarId("REC"),
            sku: skuInput.value.trim(),
            nombre: nombreInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            tipo: tipoInput.value,
            unidad: unidadInput.value,
            costoUnitario: Number(costoInput.value),
            stockMinimo: Number(stockMinimoInput.value),
            estado: estadoInput.value
        };

        validarRecurso(datos);

        if (skuExiste(datos.sku, idActual)) {
            throw new Error(
                "Ya existe un recurso con ese SKU."
            );
        }

        const unidadValida = unidades.find(
            unidad =>
                unidad.nombre === datos.unidad &&
                unidad.estado === "Activo"
        );

        if (!unidadValida) {
            throw new Error(
                "La unidad seleccionada no está disponible."
            );
        }


        if (idActual) {

            const recurso = recursos.find(
                item => item.id === idActual
            );

            if (!recurso) {
                throw new Error(
                    "No se encontró el recurso que intenta editar."
                );
            }

            const costoAnterior = recurso.costoUnitario;

            recurso.sku = datos.sku;
            recurso.nombre = datos.nombre;
            recurso.descripcion = datos.descripcion;
            recurso.tipo = datos.tipo;
            recurso.unidad = datos.unidad;
            recurso.costoUnitario = datos.costoUnitario;
            recurso.stockMinimo = datos.stockMinimo;
            recurso.estado = datos.estado;

            if (costoAnterior !== datos.costoUnitario) {

                recurso.historialCostos.push({
                    fecha: new Date().toISOString(),
                    costoAnterior,
                    costoNuevo: datos.costoUnitario
                });
            }

            alert("Recurso actualizado correctamente.");

        } else {

            datos.historialCostos = [];

            recursos.push(datos);

            alert("Recurso registrado correctamente.");
        }

        guardarDatos();
        renderizarTodo();
        limpiarFormularioRecurso();

    } catch (error) {

        alert(error.message);
    }
}


function editarRecurso(id) {

    const recurso = recursos.find(
        item => item.id === id
    );

    if (!recurso) {
        alert("Recurso no encontrado.");
        return;
    }

    recursoId.value = recurso.id;
    skuInput.value = recurso.sku;
    nombreInput.value = recurso.nombre;
    descripcionInput.value = recurso.descripcion;
    tipoInput.value = recurso.tipo;
    unidadInput.value = recurso.unidad;
    costoInput.value = recurso.costoUnitario;
    stockMinimoInput.value = recurso.stockMinimo;
    estadoInput.value = recurso.estado;

    document.getElementById("guardarRecurso").textContent =
        "Actualizar recurso";

    window.location.hash = "recursos";
}


function cambiarEstadoRecurso(id) {

    const recurso = recursos.find(
        item => item.id === id
    );

    if (!recurso) {
        return;
    }

    recurso.estado =
        recurso.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    guardarDatos();
    renderizarTodo();
}


function eliminarRecurso(id) {

    const recurso = recursos.find(
        item => item.id === id
    );

    if (!recurso) {
        return;
    }

    const confirmar = confirm(
        `¿Desea eliminar el recurso "${recurso.nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    recursos = recursos.filter(
        item => item.id !== id
    );

    guardarDatos();
    renderizarTodo();
}


function limpiarFormularioRecurso() {

    recursoForm.reset();

    recursoId.value = "";

    estadoInput.value = "Activo";

    document.getElementById("guardarRecurso").textContent =
        "Registrar recurso";
}


/* ============================================================
   RENDERIZADO DE RECURSOS
   ============================================================ */

function obtenerRecursosFiltrados() {

    const texto = buscarRecurso.value
        .trim()
        .toLowerCase();

    const tipo = filtroTipo.value;
    const estado = filtroEstado.value;

    return recursos.filter(recurso => {

        const coincideTexto =
            !texto ||
            recurso.sku.toLowerCase().includes(texto) ||
            recurso.nombre.toLowerCase().includes(texto) ||
            recurso.descripcion.toLowerCase().includes(texto);

        const coincideTipo =
            tipo === "Todos" ||
            recurso.tipo === tipo;

        const coincideEstado =
            estado === "Todos" ||
            recurso.estado === estado;

        return (
            coincideTexto &&
            coincideTipo &&
            coincideEstado
        );
    });
}


function renderizarRecursos() {

    const lista = obtenerRecursosFiltrados();

    tablaRecursos.innerHTML = "";

    totalRecursos.textContent = lista.length;

    if (lista.length === 0) {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td colspan="9">
                No existen recursos que coincidan con los filtros.
            </td>
        `;

        tablaRecursos.appendChild(fila);

        return;
    }


    lista.forEach(recurso => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${escaparHTML(recurso.sku)}</td>

            <td>${escaparHTML(recurso.nombre)}</td>

            <td>${escaparHTML(recurso.descripcion)}</td>

            <td>${escaparHTML(recurso.tipo)}</td>

            <td>${escaparHTML(recurso.unidad)}</td>

            <td>
                ${formatearCosto(recurso.costoUnitario)}
            </td>

            <td>
                ${recurso.stockMinimo}
            </td>

            <td>
                ${escaparHTML(recurso.estado)}
            </td>

            <td>

                <button
                    type="button"
                    data-accion="editar"
                    data-id="${recurso.id}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    data-accion="estado"
                    data-id="${recurso.id}"
                >
                    ${
                        recurso.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"
                    }
                </button>

                <button
                    type="button"
                    data-accion="historial"
                    data-id="${recurso.id}"
                >
                    Ver costos
                </button>

                <button
                    type="button"
                    data-accion="eliminar"
                    data-id="${recurso.id}"
                >
                    Eliminar
                </button>

            </td>
        `;

        tablaRecursos.appendChild(fila);
    });
}


/* ============================================================
   EVENTOS TABLA RECURSOS
   ============================================================ */

tablaRecursos.addEventListener("click", evento => {

    const boton = evento.target.closest("button");

    if (!boton) {
        return;
    }

    const accion = boton.dataset.accion;
    const id = boton.dataset.id;

    switch (accion) {

        case "editar":
            editarRecurso(id);
            break;

        case "estado":
            cambiarEstadoRecurso(id);
            break;

        case "historial":
            seleccionarHistorial(id);
            break;

        case "eliminar":
            eliminarRecurso(id);
            break;
    }
});


/* ============================================================
   UNIDADES DE MEDIDA
   ============================================================ */

function registrarUnidad(evento) {

    evento.preventDefault();

    try {

        const idActual = unidadId.value || null;

        const datos = {
            id: idActual || generarId("UND"),
            codigo: codigoUnidad.value.trim().toUpperCase(),
            nombre: nombreUnidad.value.trim(),
            descripcion: descripcionUnidad.value.trim(),
            estado: estadoUnidad.value
        };

        if (!datos.codigo) {
            throw new Error(
                "El código de unidad es obligatorio."
            );
        }

        if (!datos.nombre) {
            throw new Error(
                "El nombre de unidad es obligatorio."
            );
        }

        if (codigoUnidadExiste(datos.codigo, idActual)) {
            throw new Error(
                "Ya existe una unidad con ese código."
            );
        }


        if (idActual) {

            const unidad = unidades.find(
                item => item.id === idActual
            );

            if (!unidad) {
                throw new Error(
                    "No se encontró la unidad."
                );
            }

            unidad.codigo = datos.codigo;
            unidad.nombre = datos.nombre;
            unidad.descripcion = datos.descripcion;
            unidad.estado = datos.estado;

            alert("Unidad actualizada correctamente.");

        } else {

            unidades.push(datos);

            alert("Unidad registrada correctamente.");
        }

        guardarDatos();
        renderizarTodo();
        limpiarFormularioUnidad();

    } catch (error) {

        alert(error.message);
    }
}


function editarUnidad(id) {

    const unidad = unidades.find(
        item => item.id === id
    );

    if (!unidad) {
        return;
    }

    unidadId.value = unidad.id;
    codigoUnidad.value = unidad.codigo;
    nombreUnidad.value = unidad.nombre;
    descripcionUnidad.value = unidad.descripcion;
    estadoUnidad.value = unidad.estado;

    window.location.hash = "unidades";
}


function cambiarEstadoUnidad(id) {

    const unidad = unidades.find(
        item => item.id === id
    );

    if (!unidad) {
        return;
    }

    const recursosAsociados = recursos.filter(
        recurso => recurso.unidad === unidad.nombre
    );

    if (
        unidad.estado === "Activo" &&
        recursosAsociados.length > 0
    ) {

        const confirmar = confirm(
            `Existen ${recursosAsociados.length} recurso(s) ` +
            `que utilizan esta unidad. ¿Desea desactivarla?`
        );

        if (!confirmar) {
            return;
        }
    }

    unidad.estado =
        unidad.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    guardarDatos();
    renderizarTodo();
}


function eliminarUnidad(id) {

    const unidad = unidades.find(
        item => item.id === id
    );

    if (!unidad) {
        return;
    }

    const estaEnUso = recursos.some(
        recurso => recurso.unidad === unidad.nombre
    );

    if (estaEnUso) {

        alert(
            "No puede eliminar esta unidad porque está siendo utilizada por uno o más recursos."
        );

        return;
    }

    const confirmar = confirm(
        `¿Desea eliminar la unidad "${unidad.nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    unidades = unidades.filter(
        item => item.id !== id
    );

    guardarDatos();
    renderizarTodo();
}


function limpiarFormularioUnidad() {

    unidadForm.reset();

    unidadId.value = "";

    estadoUnidad.value = "Activo";
}


/* ============================================================
   RENDERIZADO DE UNIDADES
   ============================================================ */

function renderizarUnidades() {

    tablaUnidades.innerHTML = "";

    if (unidades.length === 0) {

        tablaUnidades.innerHTML = `
            <tr>
                <td colspan="5">
                    No existen unidades registradas.
                </td>
            </tr>
        `;

    } else {

        unidades.forEach(unidad => {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${escaparHTML(unidad.codigo)}</td>

                <td>${escaparHTML(unidad.nombre)}</td>

                <td>${escaparHTML(unidad.descripcion)}</td>

                <td>${escaparHTML(unidad.estado)}</td>

                <td>

                    <button
                        type="button"
                        data-accion="editar"
                        data-id="${unidad.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        data-accion="estado"
                        data-id="${unidad.id}"
                    >
                        ${
                            unidad.estado === "Activo"
                                ? "Desactivar"
                                : "Activar"
                        }
                    </button>

                    <button
                        type="button"
                        data-accion="eliminar"
                        data-id="${unidad.id}"
                    >
                        Eliminar
                    </button>

                </td>
            `;

            tablaUnidades.appendChild(fila);
        });
    }


    actualizarSelectUnidades();
}


tablaUnidades.addEventListener("click", evento => {

    const boton = evento.target.closest("button");

    if (!boton) {
        return;
    }

    const accion = boton.dataset.accion;
    const id = boton.dataset.id;

    switch (accion) {

        case "editar":
            editarUnidad(id);
            break;

        case "estado":
            cambiarEstadoUnidad(id);
            break;

        case "eliminar":
            eliminarUnidad(id);
            break;
    }
});


function actualizarSelectUnidades() {

    const valorActual = unidadInput.value;

    unidadInput.innerHTML = `
        <option value="">
            Seleccione...
        </option>
    `;

    unidades
        .filter(unidad => unidad.estado === "Activo")
        .forEach(unidad => {

            const opcion = document.createElement("option");

            opcion.value = unidad.nombre;
            opcion.textContent =
                `${unidad.codigo} - ${unidad.nombre}`;

            unidadInput.appendChild(opcion);
        });


    const sigueDisponible = [
        ...unidadInput.options
    ].some(
        opcion => opcion.value === valorActual
    );

    if (sigueDisponible) {
        unidadInput.value = valorActual;
    }
}


/* ============================================================
   HISTORIAL DE COSTOS
   ============================================================ */

function actualizarSelectHistorial() {

    const valorActual =
        recursoHistorial.value;

    recursoHistorial.innerHTML = `
        <option value="">
            Seleccione un recurso...
        </option>
    `;

    recursos.forEach(recurso => {

        const opcion =
            document.createElement("option");

        opcion.value = recurso.id;

        opcion.textContent =
            `${recurso.sku} - ${recurso.nombre}`;

        recursoHistorial.appendChild(opcion);
    });

    recursoHistorial.value = valorActual;
}


function seleccionarHistorial(id) {

    recursoHistorial.value = id;

    renderizarHistorial();

    window.location.hash = "historial";
}


function renderizarHistorial() {

    tablaHistorial.innerHTML = "";

    const id = recursoHistorial.value;

    if (!id) {

        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="6">
                    Seleccione un recurso.
                </td>
            </tr>
        `;

        return;
    }

    const recurso = recursos.find(
        item => item.id === id
    );

    if (!recurso) {
        return;
    }

    if (
        !recurso.historialCostos ||
        recurso.historialCostos.length === 0
    ) {

        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="6">
                    Este recurso todavía no tiene cambios de costo registrados.
                </td>
            </tr>
        `;

        return;
    }


    recurso.historialCostos
        .slice()
        .reverse()
        .forEach(cambio => {

            const diferencia =
                cambio.costoNuevo -
                cambio.costoAnterior;

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    ${formatearFecha(cambio.fecha)}
                </td>

                <td>
                    ${escaparHTML(recurso.sku)}
                </td>

                <td>
                    ${escaparHTML(recurso.nombre)}
                </td>

                <td>
                    ${formatearCosto(cambio.costoAnterior)}
                </td>

                <td>
                    ${formatearCosto(cambio.costoNuevo)}
                </td>

                <td>
                    ${formatearCosto(diferencia)}
                </td>
            `;

            tablaHistorial.appendChild(fila);
        });
}


/* ============================================================
   FILTROS
   ============================================================ */

buscarRecurso.addEventListener(
    "input",
    renderizarRecursos
);

filtroTipo.addEventListener(
    "change",
    renderizarRecursos
);

filtroEstado.addEventListener(
    "change",
    renderizarRecursos
);


document
    .getElementById("limpiarFiltros")
    .addEventListener("click", () => {

        buscarRecurso.value = "";
        filtroTipo.value = "Todos";
        filtroEstado.value = "Todos";

        renderizarRecursos();
    });


/* ============================================================
   EVENTOS DE FORMULARIOS
   ============================================================ */

recursoForm.addEventListener(
    "submit",
    registrarRecurso
);

unidadForm.addEventListener(
    "submit",
    registrarUnidad
);


document
    .getElementById("cancelarEdicion")
    .addEventListener(
        "click",
        limpiarFormularioRecurso
    );


document
    .getElementById("cancelarUnidad")
    .addEventListener(
        "click",
        limpiarFormularioUnidad
    );


recursoHistorial.addEventListener(
    "change",
    renderizarHistorial
);


/* ============================================================
   EXPORTACIÓN DE DATOS
   ============================================================ */

document
    .getElementById("exportarDatos")
    .addEventListener("click", () => {

        const respaldo = {
            fechaExportacion:
                new Date().toISOString(),

            recursos,

            unidades
        };

        const contenido =
            JSON.stringify(
                respaldo,
                null,
                4
            );

        const blob = new Blob(
            [contenido],
            {
                type: "application/json"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const enlace =
            document.createElement("a");

        enlace.href = url;

        enlace.download =
            `respaldo-erp-modulo3-${Date.now()}.json`;

        enlace.click();

        URL.revokeObjectURL(url);
    });


/* ============================================================
   IMPORTACIÓN DE DATOS
   ============================================================ */

document
    .getElementById("importarDatos")
    .addEventListener("change", evento => {

        const archivo =
            evento.target.files[0];

        if (!archivo) {
            return;
        }

        const lector =
            new FileReader();

        lector.onload = () => {

            try {

                const datos =
                    JSON.parse(
                        lector.result
                    );

                if (
                    !Array.isArray(datos.recursos) ||
                    !Array.isArray(datos.unidades)
                ) {
                    throw new Error(
                        "El archivo no tiene un formato válido."
                    );
                }

                const confirmar =
                    confirm(
                        "La importación reemplazará los datos actuales. ¿Desea continuar?"
                    );

                if (!confirmar) {
                    return;
                }

                recursos = datos.recursos;
                unidades = datos.unidades;

                guardarDatos();
                renderizarTodo();

                alert(
                    "Datos importados correctamente."
                );

            } catch (error) {

                alert(
                    `No fue posible importar el archivo: ${error.message}`
                );
            }
        };

        lector.readAsText(archivo);

        evento.target.value = "";
    });


/* ============================================================
   ELIMINAR TODOS LOS DATOS
   ============================================================ */

document
    .getElementById("eliminarDatos")
    .addEventListener("click", () => {

        if (
            recursos.length === 0 &&
            unidades.length === 0
        ) {

            alert(
                "No existen datos para eliminar."
            );

            return;
        }

        const confirmar =
            confirm(
                "Esta acción eliminará todos los recursos y unidades almacenados localmente. ¿Desea continuar?"
            );

        if (!confirmar) {
            return;
        }

        recursos = [];
        unidades = [];

        guardarDatos();
        renderizarTodo();

        limpiarFormularioRecurso();
        limpiarFormularioUnidad();

        alert(
            "Todos los datos fueron eliminados."
        );
    });


/* ============================================================
   DATOS INICIALES
   ============================================================ */

function crearDatosIniciales() {

    if (unidades.length === 0) {

        unidades = [
            {
                id: generarId("UND"),
                codigo: "KG",
                nombre: "Kilogramo",
                descripcion: "Unidad de masa.",
                estado: "Activo"
            },
            {
                id: generarId("UND"),
                codigo: "L",
                nombre: "Litro",
                descripcion: "Unidad de volumen.",
                estado: "Activo"
            },
            {
                id: generarId("UND"),
                codigo: "M",
                nombre: "Metro",
                descripcion: "Unidad de longitud.",
                estado: "Activo"
            },
            {
                id: generarId("UND"),
                codigo: "UND",
                nombre: "Pieza",
                descripcion: "Unidad individual.",
                estado: "Activo"
            }
        ];

        guardarDatos();
    }
}


/* ============================================================
   RENDERIZADO GENERAL
   ============================================================ */

function renderizarTodo() {

    renderizarUnidades();

    renderizarRecursos();

    actualizarSelectHistorial();

    renderizarHistorial();
}


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

crearDatosIniciales();

renderizarTodo();
