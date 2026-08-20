/* =========================================================
   SISTEMA DE GESTIÓN DE ZONAS FRANCAS
   JavaScript Vanilla
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const STORAGE_PARAMETROS = "zonas_francas_parametros";
const STORAGE_POSTULACIONES = "zonas_francas_postulaciones";

const ESTADOS = [
    "Recibida",
    "En evaluación IA",
    "Recomendada",
    "Revisar",
    "Rechazada"
];


/* =========================================================
   DATOS LOCALES
   ========================================================= */

let parametros = JSON.parse(
    localStorage.getItem(STORAGE_PARAMETROS)
) || [];

let postulaciones = JSON.parse(
    localStorage.getItem(STORAGE_POSTULACIONES)
) || [];


/* =========================================================
   MÓDULO 1
   PARÁMETROS DE ADMINISTRACIÓN
   ========================================================= */

const formParametro =
    document.getElementById("formParametro");


formParametro.addEventListener("submit", function(event) {

    event.preventDefault();

    const id =
        document.getElementById("parametroId").value;

    const nombreZona =
        document.getElementById("nombreZona").value.trim();

    const inversionMinima =
        Number(
            document.getElementById("inversionMinima").value
        );

    const empleosMinimos =
        Number(
            document.getElementById("empleosMinimos").value
        );

    const sectoresTexto =
        document
            .getElementById("sectoresAutorizados")
            .value;


    const sectores = sectoresTexto
        .split(",")
        .map(function(sector) {
            return sector.trim();
        })
        .filter(function(sector) {
            return sector !== "";
        });


    if (sectores.length === 0) {

        alert(
            "Debe registrar al menos un sector autorizado."
        );

        return;
    }


    /* Editar registro existente */

    if (id) {

        const parametro =
            parametros.find(function(item) {
                return item.id === id;
            });


        if (parametro) {

            parametro.nombreZona =
                nombreZona;

            parametro.inversionMinima =
                inversionMinima;

            parametro.empleosMinimos =
                empleosMinimos;

            parametro.sectores =
                sectores;
        }


    } else {

        /* Crear nuevo registro */

        const nuevoParametro = {

            id: generarId(),

            nombreZona: nombreZona,

            inversionMinima: inversionMinima,

            empleosMinimos: empleosMinimos,

            sectores: sectores

        };


        parametros.push(nuevoParametro);

    }


    guardarParametros();

    renderizarParametros();

    cargarZonasPostulacion();

    limpiarFormularioParametro();

    alert(
        "Parámetro guardado correctamente."
    );

});


/* =========================================================
   GUARDAR PARÁMETROS
   ========================================================= */

function guardarParametros() {

    localStorage.setItem(
        STORAGE_PARAMETROS,
        JSON.stringify(parametros)
    );

}


/* =========================================================
   MOSTRAR PARÁMETROS EN TABLA
   ========================================================= */

function renderizarParametros() {

    const tbody =
        document.getElementById("tablaParametros");

    tbody.innerHTML = "";


    if (parametros.length === 0) {

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="5">
                No existen parámetros registrados.
            </td>
        `;

        tbody.appendChild(fila);

        return;
    }


    parametros.forEach(function(parametro) {

        const fila =
            document.createElement("tr");


        const sectores =
            parametro.sectores
                .map(escaparHTML)
                .join(", ");


        fila.innerHTML = `

            <td>
                ${escaparHTML(parametro.nombreZona)}
            </td>

            <td>
                ${parametro.inversionMinima.toLocaleString()}
            </td>

            <td>
                ${parametro.empleosMinimos}
            </td>

            <td>
                ${sectores}
            </td>

            <td>

                <button
                    type="button"
                    onclick="editarParametro('${parametro.id}')"
                >
                    Editar
                </button>

                <button
                    type="button"
                    onclick="eliminarParametro('${parametro.id}')"
                >
                    Eliminar
                </button>

            </td>

        `;


        tbody.appendChild(fila);

    });

}


/* =========================================================
   EDITAR PARÁMETRO
   ========================================================= */

function editarParametro(id) {

    const parametro =
        parametros.find(function(item) {
            return item.id === id;
        });


    if (!parametro) {
        return;
    }


    document.getElementById("parametroId").value =
        parametro.id;

    document.getElementById("nombreZona").value =
        parametro.nombreZona;

    document.getElementById("inversionMinima").value =
        parametro.inversionMinima;

    document.getElementById("empleosMinimos").value =
        parametro.empleosMinimos;

    document.getElementById("sectoresAutorizados").value =
        parametro.sectores.join(", ");


    mostrarVista("parametros");

}


/* =========================================================
   ELIMINAR PARÁMETRO
   ========================================================= */

function eliminarParametro(id) {

    const parametro =
        parametros.find(function(item) {
            return item.id === id;
        });


    if (!parametro) {
        return;
    }


    const confirmar =
        confirm(
            "¿Desea eliminar la zona franca " +
            parametro.nombreZona +
            "?"
        );


    if (!confirmar) {
        return;
    }


    parametros =
        parametros.filter(function(item) {
            return item.id !== id;
        });


    guardarParametros();

    renderizarParametros();

    cargarZonasPostulacion();

}


/* =========================================================
   LIMPIAR FORMULARIO DE PARÁMETROS
   ========================================================= */

function limpiarFormularioParametro() {

    document
        .getElementById("formParametro")
        .reset();


    document
        .getElementById("parametroId")
        .value = "";

}


/* =========================================================
   CARGAR ZONAS EN FORMULARIO DE POSTULACIÓN
   ========================================================= */

function cargarZonasPostulacion() {

    const select =
        document.getElementById("zonaPostulacion");


    select.innerHTML = `
        <option value="">
            Seleccione una zona
        </option>
    `;


    parametros.forEach(function(parametro) {

        const option =
            document.createElement("option");


        option.value =
            parametro.id;


        option.textContent =
            parametro.nombreZona;


        select.appendChild(option);

    });

}


/* =========================================================
   CARGAR SECTORES DINÁMICAMENTE
   ========================================================= */

document
    .getElementById("zonaPostulacion")
    .addEventListener("change", function() {

        const zonaId =
            this.value;


        const selectSector =
            document.getElementById(
                "sectorPostulacion"
            );


        selectSector.innerHTML = `
            <option value="">
                Seleccione un sector
            </option>
        `;


        const zona =
            parametros.find(function(parametro) {

                return parametro.id === zonaId;

            });


        if (!zona) {
            return;
        }


        zona.sectores.forEach(function(sector) {

            const option =
                document.createElement("option");


            option.value =
                sector;


            option.textContent =
                sector;


            selectSector.appendChild(option);

        });

    });


/* =========================================================
   MÓDULO 3
   VALIDACIÓN DE ARCHIVOS
   ========================================================= */

document
    .getElementById("documento")
    .addEventListener(
        "change",
        validarArchivo
    );


function validarArchivo() {

    const input =
        document.getElementById("documento");


    const mensaje =
        document.getElementById(
            "mensajeArchivo"
        );


    mensaje.textContent = "";


    if (
        !input.files ||
        input.files.length === 0
    ) {

        return true;

    }


    const archivo =
        input.files[0];


    const maximoBytes =
        5 * 1024 * 1024;


    /* Validar PDF */

    const esPDF =
        archivo.type === "application/pdf" ||
        archivo.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!esPDF) {

        mensaje.textContent =
            "Error: únicamente se permiten archivos PDF.";


        input.value = "";


        return false;

    }


    /* Validar tamaño */

    if (archivo.size > maximoBytes) {

        mensaje.textContent =
            "Error: el archivo supera el tamaño máximo de 5 MB.";


        input.value = "";


        return false;

    }


    mensaje.textContent =
        "Archivo válido: " +
        archivo.name +
        " (" +
        convertirMB(archivo.size) +
        " MB)";


    return true;

}


/* =========================================================
   MÓDULO 2
   REGISTRAR POSTULACIÓN
   ========================================================= */

document
    .getElementById("formPostulacion")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        /* Validar archivo */

        if (!validarArchivo()) {
            return;
        }


        const zonaId =
            document.getElementById(
                "zonaPostulacion"
            ).value;


        const nombreEmpresa =
            document.getElementById(
                "nombreEmpresa"
            ).value.trim();


        const montoInvertir =
            Number(
                document.getElementById(
                    "montoInvertir"
                ).value
            );


        const empleosProyectados =
            Number(
                document.getElementById(
                    "empleosProyectados"
                ).value
            );


        const sector =
            document.getElementById(
                "sectorPostulacion"
            ).value;


        const zona =
            parametros.find(function(parametro) {

                return parametro.id === zonaId;

            });


        if (!zona) {

            alert(
                "Debe seleccionar una Zona Franca."
            );

            return;

        }


        /* Validar sector */

        if (!zona.sectores.includes(sector)) {

            alert(
                "El sector seleccionado no está autorizado."
            );

            return;

        }


        /* Comprobar inversión mínima */

        if (
            montoInvertir <
            zona.inversionMinima
        ) {

            const continuar =
                confirm(
                    "El monto de inversión está por debajo " +
                    "del mínimo configurado. ¿Desea continuar?"
                );


            if (!continuar) {
                return;
            }

        }


        /* Comprobar empleos mínimos */

        if (
            empleosProyectados <
            zona.empleosMinimos
        ) {

            const continuar =
                confirm(
                    "Los empleos proyectados están por debajo " +
                    "del mínimo configurado. ¿Desea continuar?"
                );


            if (!continuar) {
                return;
            }

        }


        /* Obtener información del archivo */

        const inputArchivo =
            document.getElementById("documento");


        let documento = null;


        if (
            inputArchivo.files &&
            inputArchivo.files.length > 0
        ) {

            const archivo =
                inputArchivo.files[0];


            documento = {

                nombre: archivo.name,

                tipo: archivo.type,

                tamaño: archivo.size

            };

        }


        /* Crear postulación */

        const nuevaPostulacion = {

            id: generarId(),

            fecha: new Date().toISOString(),

            nombreEmpresa: nombreEmpresa,

            zonaId: zona.id,

            zona: zona.nombreZona,

            montoInvertir: montoInvertir,

            empleosProyectados: empleosProyectados,

            sector: sector,

            documento: documento,

            estado: "Recibida"

        };


        postulaciones.push(
            nuevaPostulacion
        );


        guardarPostulaciones();

        renderizarPostulaciones();


        document
            .getElementById(
                "mensajePostulacion"
            )
            .textContent =
            "Postulación registrada correctamente. " +
            "Estado inicial: Recibida.";


        limpiarFormularioPostulacion();


        mostrarVista("seguimiento");

    });


/* =========================================================
   GUARDAR POSTULACIONES
   ========================================================= */

function guardarPostulaciones() {

    localStorage.setItem(
        STORAGE_POSTULACIONES,
        JSON.stringify(postulaciones)
    );

}


/* =========================================================
   MÓDULO 4
   MOSTRAR POSTULACIONES
   ========================================================= */

function renderizarPostulaciones() {

    const tbody =
        document.getElementById(
            "tablaPostulaciones"
        );


    tbody.innerHTML = "";


    if (postulaciones.length === 0) {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `
            <td colspan="9">
                No existen postulaciones registradas.
            </td>
        `;


        tbody.appendChild(fila);

        return;

    }


    postulaciones.forEach(function(postulacion) {

        const fila =
            document.createElement("tr");


        let nombreDocumento =
            "Sin documento";


        if (postulacion.documento) {

            nombreDocumento =
                postulacion.documento.nombre;

        }


        const opcionesEstados =
            ESTADOS.map(function(estado) {

                return `
                    <option
                        value="${escaparAtributo(estado)}"
                        ${estado === postulacion.estado
                            ? "selected"
                            : ""}
                    >
                        ${escaparHTML(estado)}
                    </option>
                `;

            }).join("");


        fila.innerHTML = `

            <td>
                ${escaparHTML(postulacion.id)}
            </td>

            <td>
                ${escaparHTML(
                    postulacion.nombreEmpresa
                )}
            </td>

            <td>
                ${escaparHTML(
                    postulacion.zona
                )}
            </td>

            <td>
                ${postulacion.montoInvertir.toLocaleString()}
            </td>

            <td>
                ${postulacion.empleosProyectados}
            </td>

            <td>
                ${escaparHTML(
                    postulacion.sector
                )}
            </td>

            <td>
                ${escaparHTML(
                    nombreDocumento
                )}
            </td>

            <td>
                <strong>
                    ${escaparHTML(
                        postulacion.estado
                    )}
                </strong>
            </td>

            <td>

                <select
                    onchange="
                        cambiarEstado(
                            '${postulacion.id}',
                            this.value
                        )
                    "
                >

                    ${opcionesEstados}

                </select>

            </td>

        `;


        tbody.appendChild(fila);

    });

}


/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

function cambiarEstado(id, nuevoEstado) {

    const postulacion =
        postulaciones.find(function(item) {

            return item.id === id;

        });


    if (!postulacion) {
        return;
    }


    if (!ESTADOS.includes(nuevoEstado)) {

        alert(
            "Estado no válido."
        );

        return;

    }


    postulacion.estado =
        nuevoEstado;


    guardarPostulaciones();

    renderizarPostulaciones();

}


/* =========================================================
   LIMPIAR FORMULARIO DE POSTULACIÓN
   ========================================================= */

function limpiarFormularioPostulacion() {

    document
        .getElementById("formPostulacion")
        .reset();


    document
        .getElementById(
            "sectorPostulacion"
        )
        .innerHTML = `
            <option value="">
                Primero seleccione una zona
            </option>
        `;


    document
        .getElementById(
            "mensajeArchivo"
        )
        .textContent = "";

}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function mostrarVista(vista) {

    const secciones = [
        "parametros",
        "postulacion",
        "seguimiento"
    ];


    secciones.forEach(function(nombre) {

        document.getElementById(nombre).hidden =
            nombre !== vista;

    });


    if (vista === "parametros") {

        renderizarParametros();

    }


    if (vista === "postulacion") {

        cargarZonasPostulacion();

    }


    if (vista === "seguimiento") {

        renderizarPostulaciones();

    }

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function generarId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function convertirMB(bytes) {

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2);

}


/* =========================================================
   SEGURIDAD BÁSICA
   ========================================================= */

function escaparHTML(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escaparAtributo(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function inicializarSistema() {

    renderizarParametros();

    renderizarPostulaciones();

    cargarZonasPostulacion();

    mostrarVista("parametros");

}


inicializarSistema();