// ======================================================
// BASE DE DATOS SIMULADA
// ======================================================

const empleados = [
    {
        id: 1,
        nombre: "Ana Rodríguez",
        identificacion: "1-1111-1111",
        cargo: "Supervisora"
    },
    {
        id: 2,
        nombre: "Carlos Méndez",
        identificacion: "2-2222-2222",
        cargo: "Operador"
    },
    {
        id: 3,
        nombre: "María González",
        identificacion: "3-3333-3333",
        cargo: "Asistente"
    }
];

const rotaciones = [];

const horariosFijos = [];

const permisos = [];

let siguienteEmpleadoId = 4;
let siguienteRotacionId = 1;
let siguienteHorarioId = 1;
let siguientePermisoId = 1;


// ======================================================
// ELEMENTOS DEL DOM
// ======================================================

const formEmpleado = document.getElementById("formEmpleado");
const tablaEmpleados = document.getElementById("tablaEmpleados");

const formRotacion = document.getElementById("formRotacion");
const tablaRotaciones = document.getElementById("tablaRotaciones");

const formHorarioFijo = document.getElementById("formHorarioFijo");
const tablaHorarios = document.getElementById("tablaHorarios");

const formPermiso = document.getElementById("formPermiso");
const tablaPermisos = document.getElementById("tablaPermisos");

const rotacionEmpleado = document.getElementById("rotacionEmpleado");
const horarioEmpleado = document.getElementById("horarioEmpleado");
const descansoEmpleado = document.getElementById("descansoEmpleado");
const permisoEmpleado = document.getElementById("permisoEmpleado");

const resultadoDescansos = document.getElementById("resultadoDescansos");

const progreso = document.getElementById("progreso");


// ======================================================
// FUNCIONES GENERALES
// ======================================================

function obtenerEmpleado(id) {
    return empleados.find(empleado => empleado.id === Number(id));
}


function obtenerNombreEmpleado(id) {
    const empleado = obtenerEmpleado(id);

    if (!empleado) {
        return "Empleado no encontrado";
    }

    return empleado.nombre;
}


function formatearFecha(fecha) {
    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function agregarDias(fecha, cantidad) {
    const nuevaFecha = new Date(fecha + "T00:00:00");

    nuevaFecha.setDate(nuevaFecha.getDate() + cantidad);

    const year = nuevaFecha.getFullYear();
    const month = String(nuevaFecha.getMonth() + 1).padStart(2, "0");
    const day = String(nuevaFecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ======================================================
// EMPLEADOS
// ======================================================

function renderizarEmpleados() {
    tablaEmpleados.innerHTML = "";

    empleados.forEach(empleado => {
        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = empleado.id;

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = empleado.nombre;

        const celdaIdentificacion = document.createElement("td");
        celdaIdentificacion.textContent = empleado.identificacion;

        const celdaCargo = document.createElement("td");
        celdaCargo.textContent = empleado.cargo;

        const celdaAcciones = document.createElement("td");

        const botonEliminar = document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", () => {
            eliminarEmpleado(empleado.id);
        });

        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaIdentificacion);
        fila.appendChild(celdaCargo);
        fila.appendChild(celdaAcciones);

        tablaEmpleados.appendChild(fila);
    });

    actualizarSelectsEmpleados();
}


function eliminarEmpleado(id) {
    const indice = empleados.findIndex(
        empleado => empleado.id === id
    );

    if (indice === -1) {
        return;
    }

    const confirmar = confirm(
        "¿Desea eliminar este empleado?"
    );

    if (!confirmar) {
        return;
    }

    empleados.splice(indice, 1);

    renderizarEmpleados();
    renderizarRotaciones();
    renderizarHorarios();
    renderizarPermisos();

    resultadoDescansos.innerHTML =
        "<p>Seleccione un empleado para consultar sus descansos.</p>";
}


formEmpleado.addEventListener("submit", event => {
    event.preventDefault();

    const nombre = document
        .getElementById("empleadoNombre")
        .value
        .trim();

    const identificacion = document
        .getElementById("empleadoIdentificacion")
        .value
        .trim();

    const cargo = document
        .getElementById("empleadoCargo")
        .value
        .trim();

    if (!nombre || !identificacion || !cargo) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    const empleadoExiste = empleados.some(
        empleado => empleado.identificacion === identificacion
    );

    if (empleadoExiste) {
        alert("Ya existe un empleado con esa identificación.");
        return;
    }

    empleados.push({
        id: siguienteEmpleadoId++,
        nombre,
        identificacion,
        cargo
    });

    formEmpleado.reset();

    renderizarEmpleados();

    alert("Empleado registrado correctamente.");
});


// ======================================================
// SELECTS DE EMPLEADOS
// ======================================================

function actualizarSelect(select, textoInicial) {
    const valorActual = select.value;

    select.innerHTML = "";

    const opcionInicial = document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent = textoInicial;

    select.appendChild(opcionInicial);

    empleados.forEach(empleado => {
        const opcion = document.createElement("option");

        opcion.value = empleado.id;
        opcion.textContent =
            `${empleado.nombre} - ${empleado.cargo}`;

        select.appendChild(opcion);
    });

    const existeValor = empleados.some(
        empleado => String(empleado.id) === valorActual
    );

    if (existeValor) {
        select.value = valorActual;
    }
}


function actualizarSelectsEmpleados() {
    actualizarSelect(
        rotacionEmpleado,
        "Seleccione un empleado"
    );

    actualizarSelect(
        horarioEmpleado,
        "Seleccione un empleado"
    );

    actualizarSelect(
        descansoEmpleado,
        "Seleccione un empleado"
    );

    actualizarSelect(
        permisoEmpleado,
        "Seleccione un empleado"
    );
}


// ======================================================
// TURNOS ROTATIVOS
// ======================================================

function calcularDuracionPeriodo(frecuencia) {
    if (frecuencia === "semanal") {
        return 7;
    }

    return 14;
}


function obtenerSiguienteTurno(turnoActual) {
    const turnos = [
        "Mañana",
        "Tarde",
        "Noche"
    ];

    const indice = turnos.indexOf(turnoActual);

    if (indice === -1) {
        return "Mañana";
    }

    return turnos[(indice + 1) % turnos.length];
}


formRotacion.addEventListener("submit", event => {
    event.preventDefault();

    const empleadoId = Number(
        rotacionEmpleado.value
    );

    const turnoInicial =
        document.getElementById("rotacionTurno").value;

    const fechaInicio =
        document.getElementById("rotacionFecha").value;

    const frecuencia =
        document.getElementById("rotacionFrecuencia").value;

    const cantidadPeriodos = Number(
        document.getElementById("rotacionPeriodos").value
    );

    if (!empleadoId || !fechaInicio) {
        alert("Complete todos los campos.");
        return;
    }

    if (cantidadPeriodos < 1) {
        alert("La cantidad de períodos debe ser mayor a cero.");
        return;
    }

    const empleado = obtenerEmpleado(empleadoId);

    if (!empleado) {
        alert("El empleado seleccionado no existe.");
        return;
    }

    let fechaActual = fechaInicio;
    let turnoActual = turnoInicial;

    const duracion = calcularDuracionPeriodo(
        frecuencia
    );

    for (let i = 0; i < cantidadPeriodos; i++) {
        const fechaFin = agregarDias(
            fechaActual,
            duracion - 1
        );

        rotaciones.push({
            id: siguienteRotacionId++,
            empleadoId,
            periodo: i + 1,
            fechaInicio: fechaActual,
            fechaFin,
            turno: turnoActual,
            frecuencia
        });

        fechaActual = agregarDias(
            fechaActual,
            duracion
        );

        turnoActual = obtenerSiguienteTurno(
            turnoActual
        );
    }

    renderizarRotaciones();

    formRotacion.reset();

    alert(
        `Se generaron ${cantidadPeriodos} períodos de rotación.`
    );
});


function renderizarRotaciones() {
    tablaRotaciones.innerHTML = "";

    rotaciones.forEach(rotacion => {
        const fila = document.createElement("tr");

        const empleado = obtenerEmpleado(
            rotacion.empleadoId
        );

        if (!empleado) {
            return;
        }

        const datos = [
            empleado.nombre,
            rotacion.periodo,
            formatearFecha(rotacion.fechaInicio),
            formatearFecha(rotacion.fechaFin),
            rotacion.turno
        ];

        datos.forEach(dato => {
            const celda = document.createElement("td");

            celda.textContent = dato;

            fila.appendChild(celda);
        });

        tablaRotaciones.appendChild(fila);
    });
}


// ======================================================
// HORARIOS FIJOS
// ======================================================

formHorarioFijo.addEventListener("submit", event => {
    event.preventDefault();

    const empleadoId = Number(
        horarioEmpleado.value
    );

    const horaEntrada =
        document.getElementById("horaEntrada").value;

    const horaSalida =
        document.getElementById("horaSalida").value;

    const checkboxes = document.querySelectorAll(
        'input[name="dia"]:checked'
    );

    const dias = Array.from(checkboxes).map(
        checkbox => checkbox.value
    );

    if (!empleadoId) {
        alert("Seleccione un empleado.");
        return;
    }

    if (!horaEntrada || !horaSalida) {
        alert("Seleccione la hora de entrada y salida.");
        return;
    }

    if (dias.length === 0) {
        alert("Seleccione al menos un día.");
        return;
    }

    if (horaEntrada >= horaSalida) {
        alert(
            "La hora de salida debe ser posterior a la hora de entrada."
        );
        return;
    }

    horariosFijos.push({
        id: siguienteHorarioId++,
        empleadoId,
        horaEntrada,
        horaSalida,
        dias
    });

    formHorarioFijo.reset();

    renderizarHorarios();

    alert("Horario fijo asignado correctamente.");
});


function renderizarHorarios() {
    tablaHorarios.innerHTML = "";

    horariosFijos.forEach(horario => {
        const fila = document.createElement("tr");

        const empleado = obtenerEmpleado(
            horario.empleadoId
        );

        if (!empleado) {
            return;
        }

        const celdaEmpleado = document.createElement("td");

        celdaEmpleado.textContent = empleado.nombre;

        const celdaEntrada = document.createElement("td");

        celdaEntrada.textContent =
            horario.horaEntrada;

        const celdaSalida = document.createElement("td");

        celdaSalida.textContent =
            horario.horaSalida;

        const celdaDias = document.createElement("td");

        celdaDias.textContent =
            horario.dias.join(", ");

        const celdaAccion = document.createElement("td");

        const botonEliminar =
            document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", () => {
            eliminarHorario(horario.id);
        });

        celdaAccion.appendChild(botonEliminar);

        fila.appendChild(celdaEmpleado);
        fila.appendChild(celdaEntrada);
        fila.appendChild(celdaSalida);
        fila.appendChild(celdaDias);
        fila.appendChild(celdaAccion);

        tablaHorarios.appendChild(fila);
    });
}


function eliminarHorario(id) {
    const indice = horariosFijos.findIndex(
        horario => horario.id === id
    );

    if (indice === -1) {
        return;
    }

    horariosFijos.splice(indice, 1);

    renderizarHorarios();
}


// ======================================================
// CONSULTA DE DESCANSOS
// ======================================================

document
    .getElementById("btnConsultarDescansos")
    .addEventListener("click", consultarDescansos);


function consultarDescansos() {
    const empleadoId = Number(
        descansoEmpleado.value
    );

    if (!empleadoId) {
        resultadoDescansos.innerHTML =
            "<p>Seleccione un empleado.</p>";

        return;
    }

    const empleado = obtenerEmpleado(empleadoId);

    if (!empleado) {
        resultadoDescansos.innerHTML =
            "<p>Empleado no encontrado.</p>";

        return;
    }

    const horarioEmpleadoActual =
        horariosFijos.filter(
            horario =>
                horario.empleadoId === empleadoId
        );

    const lista = document.createElement("ul");

    if (horarioEmpleadoActual.length === 0) {
        const mensaje = document.createElement("li");

        mensaje.textContent =
            "No existen horarios fijos registrados para este empleado.";

        lista.appendChild(mensaje);
    } else {
        const diasLaborales = new Set();

        horarioEmpleadoActual.forEach(horario => {
            horario.dias.forEach(dia => {
                diasLaborales.add(dia);
            });
        });

        const todosLosDias = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ];

        const diasDescanso = todosLosDias.filter(
            dia => !diasLaborales.has(dia)
        );

        if (diasDescanso.length === 0) {
            const mensaje = document.createElement("li");

            mensaje.textContent =
                "No tiene días libres definidos en su horario fijo.";

            lista.appendChild(mensaje);
        } else {
            diasDescanso.forEach(dia => {
                const elemento = document.createElement("li");

                elemento.textContent =
                    `${dia} - Día de descanso`;

                lista.appendChild(elemento);
            });
        }
    }

    resultadoDescansos.innerHTML = "";

    const titulo = document.createElement("p");

    titulo.textContent =
        `Descansos de ${empleado.nombre}:`;

    resultadoDescansos.appendChild(titulo);
    resultadoDescansos.appendChild(lista);
}


// ======================================================
// PERMISOS
// ======================================================

formPermiso.addEventListener("submit", event => {
    event.preventDefault();

    const empleadoId = Number(
        permisoEmpleado.value
    );

    const tipo =
        document.getElementById("permisoTipo").value;

    const fechaInicio =
        document.getElementById("permisoInicio").value;

    const fechaFin =
        document.getElementById("permisoFin").value;

    const estado =
        document.getElementById("permisoEstado").value;

    if (!empleadoId) {
        alert("Seleccione un empleado.");
        return;
    }

    if (!fechaInicio || !fechaFin) {
        alert("Seleccione las fechas.");
        return;
    }

    if (fechaFin < fechaInicio) {
        alert(
            "La fecha final no puede ser anterior a la fecha inicial."
        );

        return;
    }

    permisos.push({
        id: siguientePermisoId++,
        empleadoId,
        tipo,
        fechaInicio,
        fechaFin,
        estado
    });

    formPermiso.reset();

    renderizarPermisos();

    alert("Solicitud de permiso registrada.");
});


function renderizarPermisos() {
    tablaPermisos.innerHTML = "";

    permisos.forEach(permiso => {
        const fila = document.createElement("tr");

        const empleado = obtenerEmpleado(
            permiso.empleadoId
        );

        if (!empleado) {
            return;
        }

        const celdaEmpleado =
            document.createElement("td");

        celdaEmpleado.textContent =
            empleado.nombre;

        const celdaTipo =
            document.createElement("td");

        celdaTipo.textContent =
            permiso.tipo;

        const celdaInicio =
            document.createElement("td");

        celdaInicio.textContent =
            formatearFecha(permiso.fechaInicio);

        const celdaFin =
            document.createElement("td");

        celdaFin.textContent =
            formatearFecha(permiso.fechaFin);

        const celdaEstado =
            document.createElement("td");

        celdaEstado.textContent =
            permiso.estado;

        const celdaAcciones =
            document.createElement("td");

        const botonAprobar =
            document.createElement("button");

        botonAprobar.type = "button";
        botonAprobar.textContent = "Aprobar";

        botonAprobar.addEventListener(
            "click",
            () => {
                actualizarEstadoPermiso(
                    permiso.id,
                    "Aprobado"
                );
            }
        );

        const botonRechazar =
            document.createElement("button");

        botonRechazar.type = "button";
        botonRechazar.textContent = "Rechazar";

        botonRechazar.addEventListener(
            "click",
            () => {
                actualizarEstadoPermiso(
                    permiso.id,
                    "Rechazado"
                );
            }
        );

        const botonPendiente =
            document.createElement("button");

        botonPendiente.type = "button";
        botonPendiente.textContent = "Pendiente";

        botonPendiente.addEventListener(
            "click",
            () => {
                actualizarEstadoPermiso(
                    permiso.id,
                    "Pendiente"
                );
            }
        );

        celdaAcciones.appendChild(botonAprobar);
        celdaAcciones.appendChild(botonRechazar);
        celdaAcciones.appendChild(botonPendiente);

        fila.appendChild(celdaEmpleado);
        fila.appendChild(celdaTipo);
        fila.appendChild(celdaInicio);
        fila.appendChild(celdaFin);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaAcciones);

        tablaPermisos.appendChild(fila);
    });
}


function actualizarEstadoPermiso(id, nuevoEstado) {
    const permiso = permisos.find(
        permiso => permiso.id === id
    );

    if (!permiso) {
        return;
    }

    permiso.estado = nuevoEstado;

    renderizarPermisos();
}


// ======================================================
// CHECKLIST DINÁMICO
// ======================================================

const elementosChecklist =
    document.querySelectorAll(".checklist-item");


elementosChecklist.forEach(checkbox => {
    checkbox.addEventListener(
        "change",
        actualizarProgreso
    );
});


function actualizarProgreso() {
    const total =
        elementosChecklist.length;

    const completados =
        Array.from(elementosChecklist)
            .filter(checkbox => checkbox.checked)
            .length;

    const porcentaje =
        Math.round((completados / total) * 100);

    progreso.textContent =
        `Progreso: ${porcentaje}% (${completados}/${total} completados)`;
}


// ======================================================
// INICIALIZACIÓN
// ======================================================

function iniciarAplicacion() {
    renderizarEmpleados();
    renderizarRotaciones();
    renderizarHorarios();
    renderizarPermisos();
    actualizarProgreso();
}


iniciarAplicacion();