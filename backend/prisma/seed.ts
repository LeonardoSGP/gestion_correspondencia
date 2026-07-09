import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed...');

  // Crear usuario administrador por defecto
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@correspondencia.gob.mx' },
    update: {},
    create: {
      nombre: 'Administrador del Sistema',
      email: 'admin@correspondencia.gob.mx',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
