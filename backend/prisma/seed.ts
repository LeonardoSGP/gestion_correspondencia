import prisma from '../src/prisma.config';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed...');

  // -- Roles (Tarjeta CRC: Rol) --
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN', descripcion: 'Administrador de plataforma' },
  });

  const rolOperadorUCC = await prisma.rol.upsert({
    where: { nombre: 'OPERADOR_UCC' },
    update: {},
    create: { nombre: 'OPERADOR_UCC', descripcion: 'Operador de la Unidad Central de Correspondencia' },
  });

  const rolMensajero = await prisma.rol.upsert({
    where: { nombre: 'MENSAJERO' },
    update: {},
    create: { nombre: 'MENSAJERO', descripcion: 'Personal de mensajeria interna/externa' },
  });

  const rolAreaAdmin = await prisma.rol.upsert({
    where: { nombre: 'AREA_ADMINISTRATIVA' },
    update: {},
    create: { nombre: 'AREA_ADMINISTRATIVA', descripcion: 'Usuario de un area administrativa (UA/AA)' },
  });

  // -- Permisos (Tarjeta CRC: Permiso) --
  const permisosData = [
    // Gestion de Accesos
    { nombre: 'auth.login', modulo: 'Gestion de Accesos', descripcion: 'Iniciar sesion' },
    { nombre: 'auth.logout', modulo: 'Gestion de Accesos', descripcion: 'Cerrar sesion' },
    { nombre: 'auth.recuperar', modulo: 'Gestion de Accesos', descripcion: 'Recuperar contrasena' },
    { nombre: 'usuarios.listar', modulo: 'Gestion de Accesos', descripcion: 'Listar usuarios' },
    { nombre: 'usuarios.crear', modulo: 'Gestion de Accesos', descripcion: 'Crear usuarios' },
    { nombre: 'usuarios.editar', modulo: 'Gestion de Accesos', descripcion: 'Editar usuarios' },
    { nombre: 'usuarios.deshabilitar', modulo: 'Gestion de Accesos', descripcion: 'Deshabilitar usuarios' },
    { nombre: 'roles.gestionar', modulo: 'Gestion de Accesos', descripcion: 'Gestionar roles y permisos' },
    // Recepcion
    { nombre: 'recepcion.registrar', modulo: 'Recepcion de Correspondencia', descripcion: 'Registrar correspondencia de entrada' },
    { nombre: 'recepcion.consultar', modulo: 'Recepcion de Correspondencia', descripcion: 'Consultar correspondencia de entrada' },
    // Distribucion Interna
    { nombre: 'distribucion.registrar', modulo: 'Recepcion de Correspondencia', descripcion: 'Registrar distribucion interna' },
    { nombre: 'distribucion.confirmar', modulo: 'Recepcion de Correspondencia', descripcion: 'Confirmar entrega en area' },
    // Despacho
    { nombre: 'despacho.registrar', modulo: 'Despacho de Correspondencia', descripcion: 'Registrar correspondencia de salida' },
    { nombre: 'despacho.consultar', modulo: 'Despacho de Correspondencia', descripcion: 'Consultar correspondencia de salida' },
    // Enrutamiento
    { nombre: 'enrutamiento.asignar', modulo: 'Enrutamiento y Mensajeria', descripcion: 'Asignar ruta y metodo de envio' },
    { nombre: 'enrutamiento.consultar', modulo: 'Enrutamiento y Mensajeria', descripcion: 'Consultar rutas' },
    // Archivo
    { nombre: 'archivo.cargarAcuse', modulo: 'Archivo y Trazabilidad', descripcion: 'Cargar acuse digitalizado' },
    { nombre: 'archivo.cerrar', modulo: 'Archivo y Trazabilidad', descripcion: 'Cerrar ciclo documental' },
    { nombre: 'archivo.consultar', modulo: 'Archivo y Trazabilidad', descripcion: 'Consultar expedientes y trazabilidad' },
  ];

  const permisos: Record<string, any> = {};
  for (const p of permisosData) {
    permisos[p.nombre] = await prisma.permiso.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: p,
    });
  }

  // -- Asignar permisos a roles --
  // ADMIN: todos los permisos
  for (const key of Object.keys(permisos)) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rolAdmin.id, permisoId: permisos[key].id } },
      update: {},
      create: { rolId: rolAdmin.id, permisoId: permisos[key].id },
    });
  }

  // OPERADOR_UCC: recepcion, distribucion, despacho, enrutamiento, archivo, login, logout
  const permisosUCC = [
    'auth.login', 'auth.logout', 'auth.recuperar',
    'recepcion.registrar', 'recepcion.consultar',
    'distribucion.registrar',
    'despacho.registrar', 'despacho.consultar',
    'enrutamiento.asignar', 'enrutamiento.consultar',
    'archivo.cargarAcuse', 'archivo.cerrar', 'archivo.consultar',
  ];
  for (const key of permisosUCC) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rolOperadorUCC.id, permisoId: permisos[key].id } },
      update: {},
      create: { rolId: rolOperadorUCC.id, permisoId: permisos[key].id },
    });
  }

  // MENSAJERO: login, logout, enrutamiento consultar
  const permisosMensajero = ['auth.login', 'auth.logout', 'auth.recuperar', 'enrutamiento.consultar'];
  for (const key of permisosMensajero) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rolMensajero.id, permisoId: permisos[key].id } },
      update: {},
      create: { rolId: rolMensajero.id, permisoId: permisos[key].id },
    });
  }

  // AREA_ADMINISTRATIVA: login, logout, recepcion consultar, distribucion confirmar, despacho, archivo consultar
  const permisosArea = [
    'auth.login', 'auth.logout', 'auth.recuperar',
    'recepcion.consultar',
    'distribucion.confirmar',
    'despacho.registrar', 'despacho.consultar',
    'archivo.consultar',
  ];
  for (const key of permisosArea) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rolAreaAdmin.id, permisoId: permisos[key].id } },
      update: {},
      create: { rolId: rolAreaAdmin.id, permisoId: permisos[key].id },
    });
  }

  // -- Areas Administrativas --
  const areas = [
    { nombre: 'Direccion General', clave: 'DG', responsable: 'Director General' },
    { nombre: 'Subdireccion Academica', clave: 'SA', responsable: 'Subdirector Academico' },
    { nombre: 'Subdireccion de Planeacion', clave: 'SP', responsable: 'Subdirector de Planeacion' },
    { nombre: 'Subdireccion Administrativa', clave: 'SAD', responsable: 'Subdirector Administrativo' },
    { nombre: 'Unidad Central de Correspondencia', clave: 'UCC', responsable: 'Jefe de la UCC' },
  ];

  for (const a of areas) {
    await prisma.areaAdministrativa.upsert({
      where: { clave: a.clave },
      update: {},
      create: a,
    });
  }

  // -- Metodos de Envio (Tarjeta CRC: MetodoEnvio) --
  const metodos = [
    { nombre: 'Mensajeria Interna', tipo: 'MENSAJERIA_INTERNA' as const, descripcion: 'Entrega por mensajero interno de la institucion' },
    { nombre: 'Correos de Mexico', tipo: 'SERVICIO_POSTAL' as const, descripcion: 'Servicio postal nacional' },
    { nombre: 'DHL', tipo: 'PAQUETERIA' as const, descripcion: 'Paqueteria especializada DHL' },
    { nombre: 'FedEx', tipo: 'PAQUETERIA' as const, descripcion: 'Paqueteria especializada FedEx' },
    { nombre: 'Estafeta', tipo: 'PAQUETERIA' as const, descripcion: 'Paqueteria especializada Estafeta' },
  ];

  for (const m of metodos) {
    await prisma.metodoEnvio.upsert({
      where: { nombre: m.nombre },
      update: {},
      create: m,
    });
  }

  // -- Usuario Administrador --
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@correspondencia.gob.mx' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        nombre: 'Administrador del Sistema',
        email: 'admin@correspondencia.gob.mx',
        password: hashedPassword,
        rolId: rolAdmin.id,
      },
    });
  }

  // -- Usuario Operador UCC de prueba --
  const operadorExists = await prisma.user.findUnique({ where: { email: 'operador@correspondencia.gob.mx' } });
  if (!operadorExists) {
    const ucc = await prisma.areaAdministrativa.findUnique({ where: { clave: 'UCC' } });
    await prisma.user.create({
      data: {
        nombre: 'Operador UCC',
        email: 'operador@correspondencia.gob.mx',
        password: hashedPassword,
        rolId: rolOperadorUCC.id,
        areaId: ucc?.id,
      },
    });
  }

  // -- Usuario Mensajero de prueba --
  const mensajeroExists = await prisma.user.findUnique({ where: { email: 'mensajero@correspondencia.gob.mx' } });
  if (!mensajeroExists) {
    await prisma.user.create({
      data: {
        nombre: 'Mensajero Interno',
        email: 'mensajero@correspondencia.gob.mx',
        password: hashedPassword,
        rolId: rolMensajero.id,
      },
    });
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
