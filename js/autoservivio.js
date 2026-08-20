"use strict";

/*
 * AUTOSERVICIO DE NÓMINA
 * JavaScript Vanilla
 * Sin librerías externas
 */

// ==========================================
// DATOS DE DEMOSTRACIÓN
// ==========================================

const usuarios = [
    {
        id: "EMP001",
        password: "123456",
        nombre: "Juan Pérez",
        puesto: "Analista",
        departamento: "Recursos Humanos",
        permisos: [
            "recibo",
            "salario"
        ]
    },
    {
        id: "EMP002",
        password: "abc123",
        nombre: "María González",
        puesto: "Asistente",
        departamento: "Administración",
        permisos: [
            "recibo"
        ]
    }
];

const documentos = [
    {
        id: "NOM-2026-01",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "01",
        tipo: "recibo",
        nombreTipo: "Recibo de Nómina",
        fecha: "2026-01-30",
        formato: "txt"
    },
    {
        id: "SAL-2026-01",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "01",
        tipo: "salario",
        nombreTipo: "Comprobante de Salario",
        fecha: "2026-01-30",
        formato: "txt"
    },
    {
        id: "NOM-2026-02",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "02",
        tipo: "recibo",
        nombreTipo: "Recibo de Nómina",
        fecha: "2026-02-28",
        formato: "txt"
    },
    {
        id: "SAL-2026-02",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "02",
        tipo: "salario",
        nombreTipo: "Comprobante de Salario",
        fecha: "2026-02-28",
        formato: "txt"
    },
    {
        id: "NOM-2026-03",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "03",
        tipo: "recibo",
        nombreTipo: "Recibo de Nómina",
        fecha: "2026-03-30",
        formato: "txt"
    },
    {
        id: "SAL-2026-03",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "03",
        tipo: "salario",
        nombreTipo: "Comprobante de Salario",
        fecha: "2026-03-30",
        formato: "txt"
    },
    {
        id: "NOM-2026-04",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "04",
        tipo: "recibo",
        nombreTipo: "Recibo de Nómina",
        fecha: "2026-04-30",
        formato: "txt"
    },
    {
        id: "SAL-2026-04",
        empleadoId: "EMP001",
        anio: "2026",
        mes: "04",
        tipo: "salario",
        nombreTipo: "Comprobante de Salario",
        fecha: "2026-04-30",
        formato: "txt"
    },
    {
        id: "NOM-2025-12",
        empleadoId: "EMP001",
        anio: "2025",
        mes: "12",
        tipo: "recibo",
        nombreTipo: "Recibo de Nómina",
        fecha: "2025-12-31",
        formato: "txt"
    }
];


// ==========================================
// VARIABLES DE SESIÓN
// ==========================================

let usuarioActual = null;


// ==========================================
// ELEMENTOS DEL DOM
// ==========================================

const formLogin = document.getElementById("formLogin");
const empleadoIdInput = document.getElementById("empleadoId");
const passwordInput = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword");
const recordarSesion = document.getElementById("recordarSesion");

const mensajeLogin = document.getElementById("mensajeLogin");
const areaProtegida = document.getElementById("areaProtegida");

const datosEmpleado = document.getElementById("datosEmpleado");
const empleadoNombre = document.getElementById("empleadoNombre");
const empleadoCodigo = document.getElementById("empleadoCodigo");
const empleadoPuesto = document.getElementById("empleadoPuesto");
const empleadoDepartamento = document.getElementById("empleadoDepartamento");

const formFiltros = document.getElementById("formFiltros");
const filtroAnio = document.getElementById("filtroAnio");
const filtroMes = document.getElementById("filtroMes");
const filtroTipo = document.getElementById("filtroTipo");

const tablaDocumentos = document.getElementById("tablaDocumentos");
const contadorDocumentos = document.getElementById("contadorDocumentos");
const mensajeDocumentos = document.getElementById("mensajeDocumentos");

const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");


// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    cargarAnios();

    const sesionGuardada = localStorage.getItem("sesionNomina");

    if (sesionGuardada) {

        try {

            const sesion = JSON.parse(sesionGuardada);

            const usuario = usuarios.find(
                user => user.id === sesion.usuarioId
            );

            if (usuario) {
                iniciarSesion(usuario, false);
            }

        } catch (error) {

            localStorage.removeItem("sesionNomina");

        }
    }

});


// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener("submit", (event) => {

    event.preventDefault();

    const empleadoId = empleadoIdInput.value.trim().toUpperCase();
    const password = passwordInput.value;

    if (!empleadoId || !password) {

        mostrarMensajeLogin(
            "Debe completar todos los campos.",
            true
        );

        return;
    }

    const usuario = usuarios.find(
        user =>
            user.id === empleadoId &&
            user.password === password
    );

    if (!usuario) {

        mostrarMensajeLogin(
            "ID de empleado o contraseña incorrectos.",
            true
        );

        return;
    }

    iniciarSesion(usuario, recordarSesion.checked);

});


// ==========================================
// INICIAR SESIÓN
// ==========================================

function iniciarSesion(usuario, guardarSesion = false) {

    usuarioActual = usuario;

    if (guardarSesion) {

        localStorage.setItem(
            "sesionNomina",
            JSON.stringify({
                usuarioId: usuario.id
            })
        );

    }

    mostrarMensajeLogin(
        "Acceso autorizado correctamente.",
        false
    );

    areaProtegida.hidden = false;

    formLogin.hidden = true;

    cargarDatosEmpleado();

    cargarDocumentos();

}


// ==========================================
// CARGAR INFORMACIÓN DEL EMPLEADO
// ==========================================

function cargarDatosEmpleado() {

    if (!usuarioActual) {
        return;
    }

    datosEmpleado.textContent =
        `Sesión activa: ${usuarioActual.nombre} (${usuarioActual.id})`;

    empleadoNombre.textContent =
        usuarioActual.nombre;

    empleadoCodigo.textContent =
        usuarioActual.id;

    empleadoPuesto.textContent =
        usuarioActual.puesto;

    empleadoDepartamento.textContent =
        usuarioActual.departamento;

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

btnCerrarSesion.addEventListener("click", () => {

    usuarioActual = null;

    localStorage.removeItem("sesionNomina");

    areaProtegida.hidden = true;

    formLogin.hidden = false;

    formLogin.reset();

    tablaDocumentos.innerHTML = "";

    contadorDocumentos.textContent = "";

    mensajeDocumentos.textContent = "";

    mostrarMensajeLogin(
        "La sesión ha sido cerrada.",
        false
    );

});


// ==========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================

mostrarPassword.addEventListener("change", () => {

    if (mostrarPassword.checked) {

        passwordInput.type = "text";

    } else {

        passwordInput.type = "password";

    }

});


// ==========================================
// CARGAR AÑOS
// ==========================================

function cargarAnios() {

    const anios = [
        ...new Set(
            documentos.map(documento => documento.anio)
        )
    ];

    anios.sort((a, b) => b - a);

    anios.forEach(anio => {

        const option = document.createElement("option");

        option.value = anio;
        option.textContent = anio;

        filtroAnio.appendChild(option);

    });

}


// ==========================================
// CONSULTAR DOCUMENTOS
// ==========================================

formFiltros.addEventListener("submit", (event) => {

    event.preventDefault();

    cargarDocumentos();

});


// ==========================================
// CARGAR DOCUMENTOS
// ==========================================

function cargarDocumentos() {

    if (!usuarioActual) {

        mostrarMensajeDocumentos(
            "Debe iniciar sesión para consultar documentos."
        );

        return;

    }

    const anio = filtroAnio.value;
    const mes = filtroMes.value;
    const tipo = filtroTipo.value;

    const documentosUsuario = documentos.filter(
        documento =>
            documento.empleadoId === usuarioActual.id
    );

    const resultados = documentosUsuario.filter(documento => {

        const coincideAnio =
            !anio || documento.anio === anio;

        const coincideMes =
            !mes || documento.mes === mes;

        const coincideTipo =
            !tipo || documento.tipo === tipo;

        return coincideAnio &&
               coincideMes &&
               coincideTipo;

    });

    renderizarDocumentos(resultados);

}


// ==========================================
// RENDERIZAR TABLA
// ==========================================

function renderizarDocumentos(resultados) {

    tablaDocumentos.innerHTML = "";

    contadorDocumentos.textContent =
        `Documentos encontrados: ${resultados.length}`;

    if (resultados.length === 0) {

        mostrarMensajeDocumentos(
            "No se encontraron documentos con los filtros seleccionados."
        );

        return;

    }

    mostrarMensajeDocumentos("");

    resultados.forEach(documento => {

        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = documento.id;

        const celdaAnio = document.createElement("td");
        celdaAnio.textContent = documento.anio;

        const celdaMes = document.createElement("td");
        celdaMes.textContent = obtenerNombreMes(documento.mes);

        const celdaTipo = document.createElement("td");
        celdaTipo.textContent = documento.nombreTipo;

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = documento.fecha;

        const celdaFormato = document.createElement("td");
        celdaFormato.textContent =
            documento.formato.toUpperCase();

        const celdaAccion = document.createElement("td");

        const botonDescarga =
            document.createElement("button");

        botonDescarga.type = "button";
        botonDescarga.textContent = "Descargar";

        botonDescarga.addEventListener(
            "click",
            () => descargarDocumento(documento)
        );

        celdaAccion.appendChild(botonDescarga);

        fila.appendChild(celdaId);
        fila.appendChild(celdaAnio);
        fila.appendChild(celdaMes);
        fila.appendChild(celdaTipo);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaFormato);
        fila.appendChild(celdaAccion);

        tablaDocumentos.appendChild(fila);

    });

}


// ==========================================
// VALIDACIÓN DE PERMISOS
// ==========================================

function validarPermisoDocumento(documento) {

    if (!usuarioActual) {

        return {
            permitido: false,
            mensaje: "No existe una sesión activa."
        };

    }

    if (documento.empleadoId !== usuarioActual.id) {

        return {
            permitido: false,
            mensaje: "No tiene permiso para acceder a este documento."
        };

    }

    if (!usuarioActual.permisos.includes(documento.tipo)) {

        return {
            permitido: false,
            mensaje:
                "Su usuario no tiene permisos para descargar este tipo de documento."
        };

    }

    return {
        permitido: true,
        mensaje: "Permiso autorizado."
    };

}


// ==========================================
// VALIDAR FORMATO
// ==========================================

function validarFormatoDocumento(documento) {

    const formatosPermitidos = [
        "txt"
    ];

    return formatosPermitidos.includes(
        documento.formato.toLowerCase()
    );

}


// ==========================================
// DESCARGAR DOCUMENTO
// ==========================================

function descargarDocumento(documento) {

    const validacion =
        validarPermisoDocumento(documento);

    if (!validacion.permitido) {

        mostrarMensajeDocumentos(
            validacion.mensaje
        );

        return;

    }

    if (!validarFormatoDocumento(documento)) {

        mostrarMensajeDocumentos(
            "El formato del documento no es válido."
        );

        return;

    }

    const contenido =
        generarContenidoDocumento(documento);

    const blob = new Blob(
        [contenido],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const enlace =
        document.createElement("a");

    enlace.href = url;

    enlace.download =
        generarNombreArchivo(documento);

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

    mostrarMensajeDocumentos(
        `Documento ${documento.id} descargado correctamente.`
    );

}


// ==========================================
// GENERAR CONTENIDO DEL DOCUMENTO
// ==========================================

function generarContenidoDocumento(documento) {

    const salarioBase = 1250000;
    const deducciones = 175000;
    const salarioNeto = salarioBase - deducciones;

    let contenido = "";

    contenido += "====================================\n";
    contenido += "       DOCUMENTO DE NÓMINA\n";
    contenido += "====================================\n\n";

    contenido += `Empleado: ${usuarioActual.nombre}\n`;
    contenido += `ID empleado: ${usuarioActual.id}\n`;
    contenido += `Departamento: ${usuarioActual.departamento}\n`;
    contenido += `Puesto: ${usuarioActual.puesto}\n\n`;

    contenido += `Documento: ${documento.nombreTipo}\n`;
    contenido += `Código: ${documento.id}\n`;
    contenido += `Periodo: ${obtenerNombreMes(documento.mes)} ${documento.anio}\n`;
    contenido += `Fecha: ${documento.fecha}\n\n`;

    contenido += "------------------------------------\n";

    contenido += `Salario base: ₡${salarioBase.toLocaleString("es-CR")}\n`;
    contenido += `Deducciones: ₡${deducciones.toLocaleString("es-CR")}\n`;
    contenido += `Salario neto: ₡${salarioNeto.toLocaleString("es-CR")}\n`;

    contenido += "------------------------------------\n\n";

    contenido +=
        "Este documento es una representación digital\n";
    contenido +=
        "generada por el sistema de Autoservicio de Nómina.\n";

    return contenido;

}


// ==========================================
// GENERAR NOMBRE DEL ARCHIVO
// ==========================================

function generarNombreArchivo(documento) {

    const nombreUsuario =
        usuarioActual.nombre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");

    return `${documento.tipo}_${usuarioActual.id}_${nombreUsuario}_${documento.anio}_${documento.mes}.txt`;

}


// ==========================================
// LIMPIAR FILTROS
// ==========================================

btnLimpiarFiltros.addEventListener("click", () => {

    filtroAnio.value = "";
    filtroMes.value = "";
    filtroTipo.value = "";

    cargarDocumentos();

});


// ==========================================
// UTILIDADES
// ==========================================

function obtenerNombreMes(numeroMes) {

    const meses = {
        "01": "Enero",
        "02": "Febrero",
        "03": "Marzo",
        "04": "Abril",
        "05": "Mayo",
        "06": "Junio",
        "07": "Julio",
        "08": "Agosto",
        "09": "Septiembre",
        "10": "Octubre",
        "11": "Noviembre",
        "12": "Diciembre"
    };

    return meses[numeroMes] || "Desconocido";

}


function mostrarMensajeLogin(mensaje, esError) {

    mensajeLogin.textContent = mensaje;

    if (esError) {
        mensajeLogin.setAttribute(
            "aria-live",
            "assertive"
        );
    } else {
        mensajeLogin.setAttribute(
            "aria-live",
            "polite"
        );
    }

}


function mostrarMensajeDocumentos(mensaje) {

    mensajeDocumentos.textContent = mensaje;

}