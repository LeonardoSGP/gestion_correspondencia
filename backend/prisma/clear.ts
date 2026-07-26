import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log("Iniciando limpieza de la base de datos (conservando usuarios y roles)...");

  try {
    // 1. Borrar datos que dependen de la correspondencia o de otros registros transaccionales
    await prisma.historialCorrespondencia.deleteMany({});
    console.log("- Historial borrado");
    
    await prisma.expediente.deleteMany({});
    console.log("- Expedientes borrados");
    
    await prisma.selloDigital.deleteMany({});
    console.log("- Sellos Digitales borrados");
    
    await prisma.acuse.deleteMany({});
    console.log("- Acuses borrados");
    
    await prisma.firmaRecepcion.deleteMany({});
    console.log("- Firmas de Recepción borradas");
    
    await prisma.distribucionInterna.deleteMany({});
    console.log("- Distribuciones Internas borradas");
    
    await prisma.ruta.deleteMany({});
    console.log("- Rutas borradas");
    
    await prisma.anexo.deleteMany({});
    console.log("- Anexos borrados");

    // 2. Borrar la tabla central de correspondencias
    await prisma.correspondencia.deleteMany({});
    console.log("- Correspondencias borradas");

    // 3. Limpiar sesiones y recuperaciones de contraseñas por si acaso
    await prisma.sesion.deleteMany({});
    console.log("- Sesiones cerradas");
    
    await prisma.solicitudRecuperacion.deleteMany({});
    console.log("- Tokens de recuperación borrados");

    console.log("\n¡Limpieza completada con éxito! 🎉");
    console.log("Usuarios, Roles, Permisos, y Áreas Administrativas se mantienen intactos.");
  } catch (error) {
    console.error("Error durante la limpieza:", error);
  }
}

clearData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
