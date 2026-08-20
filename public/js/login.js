// Base de datos simulada
let usuarios = [
  { id: 1, nombre: "Carlos Admin", correo: "admin@arenal.com", pass: "1234", rol: "Administrador", permiso: "Acceso Total" },
  { id: 2, nombre: "Ana Empleada", correo: "empleado@arenal.com", pass: "1234", rol: "Empleado", permiso: "Lectura y Escritura" }
];

function mostrarSeccion(id) {
  document.getElementById('sec-login').style.display = 'none';
  document.getElementById('sec-recuperar').style.display = 'none';
  document.getElementById('sec-admin').style.display = 'none';

  document.getElementById(id).style.display = 'block';

  if (id === 'sec-admin') {
    actualizarTabla();
  }
}

// 1 y 2. Verificar acceso (Empleados/Administradores) y validar inicio seguro
function validarLogin(e) {
  e.preventDefault();
  const tipo = document.getElementById('login-tipo').value;
  const correo = document.getElementById('login-correo').value;
  const pass = document.getElementById('login-password').value;

  const usuario = usuarios.find(u => u.correo === correo && u.pass === pass);

  if (!usuario) {
    alert("Credenciales incorrectas.");
    return;
  }

  if (usuario.rol !== tipo) {
    alert(`Acceso denegado. No tienes permisos de ${tipo}.`);
    return;
  }

  alert(`Bienvenido ${usuario.nombre}. Acceso concedido como ${usuario.rol}. Permisos: [${usuario.permiso}]`);
}

// 3. Recuperar credenciales
function recuperarCredenciales(e) {
  e.preventDefault();
  const correo = document.getElementById('recuperar-correo').value;
  const existe = usuarios.some(u => u.correo === correo);

  if (existe) {
    alert("Se ha enviado un enlace para restablecer tus credenciales al correo: " + correo);
  } else {
    alert("El correo ingresado no existe en el sistema.");
  }
}

// 4. Dar de alta usuarios
function darDeAltaUsuario(e) {
  e.preventDefault();
  const nombre = document.getElementById('alta-nombre').value;
  const correo = document.getElementById('alta-correo').value;
  const rol = document.getElementById('alta-rol').value;
  const permiso = document.getElementById('alta-permiso').value;

  if (usuarios.some(u => u.correo === correo)) {
    alert("El correo ya está registrado.");
    return;
  }

  const nuevoUsuario = {
    id: usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1,
    nombre,
    correo,
    pass: "1234",
    rol,
    permiso
  };

  usuarios.push(nuevoUsuario);
  alert("Usuario registrado con éxito.");
  actualizarTabla();
  e.target.reset();
}

// 5. Dar de baja usuarios
function darDeBajaUsuario(id) {
  usuarios = usuarios.filter(u => u.id !== id);
  alert("Usuario dado de baja.");
  actualizarTabla();
}

// 6. Gestionar roles
function cambiarRol(id, nuevoRol) {
  const u = usuarios.find(user => user.id === id);
  if (u) {
    u.rol = nuevoRol;
    alert(`Rol cambiado a ${nuevoRol}`);
  }
}

// 7. Gestionar permisos
function cambiarPermiso(id, nuevoPermiso) {
  const u = usuarios.find(user => user.id === id);
  if (u) {
    u.permiso = nuevoPermiso;
    alert(`Permiso cambiado a ${nuevoPermiso}`);
  }
}

function actualizarTabla() {
  const tbody = document.getElementById('tabla-usuarios');
  tbody.innerHTML = '';

  usuarios.forEach(u => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nombre}</td>
      <td>${u.correo}</td>
      <td>
        <select onchange="cambiarRol(${u.id}, this.value)">
          <option value="Empleado" ${u.rol === 'Empleado' ? 'selected' : ''}>Empleado</option>
          <option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
        </select>
      </td>
      <td>
        <select onchange="cambiarPermiso(${u.id}, this.value)">
          <option value="Lectura" ${u.permiso === 'Lectura' ? 'selected' : ''}>Lectura</option>
          <option value="Lectura y Escritura" ${u.permiso === 'Lectura y Escritura' ? 'selected' : ''}>Lectura y Escritura</option>
          <option value="Acceso Total" ${u.permiso === 'Acceso Total' ? 'selected' : ''}>Acceso Total</option>
        </select>
      </td>
      <td>
        <button onclick="darDeBajaUsuario(${u.id})">Eliminar (Baja)</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}