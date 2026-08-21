// ==========================================
// 1. LÓGICA DEL CHECKLIST Y BARRA DE PROGRESO
// ==========================================
const checkboxes = document.querySelectorAll('.chk-item');
const porcentajeText = document.getElementById('porcentaje');
const barraProgreso = document.getElementById('barra-progreso');
const btnEliminar = document.getElementById('btn-eliminar');

function actualizarProgreso() {
    const total = checkboxes.length;
    const marcados = document.querySelectorAll('.chk-item:checked').length;
    const porcentaje = Math.round((marcados / total) * 100);
    
    porcentajeText.textContent = porcentaje + '%';
    barraProgreso.value = porcentaje;
}

// Eventos para cada checkbox
checkboxes.forEach(chk => {
    chk.addEventListener('change', actualizarProgreso);
});

// Evento para desmarcar todo
btnEliminar.addEventListener('click', () => {
    checkboxes.forEach(chk => chk.checked = false);
    actualizarProgreso();
});


// ==========================================
// 2. LÓGICA DEL REGISTRO DE CONSULTAS
// ==========================================
const formConsulta = document.getElementById('form-consulta');
const tablaRegistros = document.getElementById('tabla-registros');
let contadorId = 1;

formConsulta.addEventListener('submit', (e) => {
    e.preventDefault();

    const empleado = document.getElementById('empleado').value;
    const tipo = document.getElementById('tipo').value;
    const fecha = document.getElementById('fecha').value;
    const motivo = document.getElementById('motivo').value;

    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${contadorId++}</td>
        <td>${empleado}</td>
        <td>${tipo}</td>
        <td>${fecha}</td>
        <td>${motivo}</td>
    `;

    tablaRegistros.appendChild(fila);
    formConsulta.reset();
});


// ==========================================
// 3. FUNCIÓN PARA EXPORTAR LA TABLA A CSV
// ==========================================
function exportarTablaACSV(idTabla, nombreArchivo = 'registros_salud_ocupacional.csv') {
    const tabla = document.getElementById(idTabla);
    const filas = tabla.querySelectorAll('tr');

    if (filas.length <= 1) {
        alert('No hay registros guardados para exportar.');
        return;
    }

    const lineasCsv = [];

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('th, td');
        const valoresFila = [];

        celdas.forEach(celda => {
            // Escapar comillas dobles y envolver el valor en comillas para proteger comas internas
            let texto = celda.innerText.replace(/"/g, '""');
            valoresFila.push(`"${texto}"`);
        });

        lineasCsv.push(valoresFila.join(','));
    });

    // Se agrega '\uFEFF' (BOM) para asegurar correcta codificación de acentos/caracteres especiales en Excel
    const contenidoCsv = '\uFEFF' + lineasCsv.join('\n');
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });

    // Enlace temporal para forzar descarga
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(blob);
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', nombreArchivo);
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

// Asignar el listener al botón de exportación
document.getElementById('btn-exportar-csv').addEventListener('click', () => {
    exportarTablaACSV('tabla-consultas');
});