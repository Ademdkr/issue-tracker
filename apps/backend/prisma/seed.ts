import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
    },
  },
});

async function main() {
  console.log('🌱 Seeding database...');

  // Erstelle einen Test-User
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      passwordHash: 'hashed_password_123',
      role: 'DEVELOPER',
    },
  });

  console.log('✅ Created user:', {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
  });

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
