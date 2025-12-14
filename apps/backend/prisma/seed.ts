import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  TicketStatus,
  TicketPriority,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
    },
  },
});

/**
 * Seed Script
 *
 * Erstellt Test-Daten mit gehashten Passwörtern basierend auf dem aktuellen Datenbank-Zustand.
 *
 * Ausführen:
 * npx prisma db seed
 */
async function main() {
  console.log('🌱 Seeding database...\n');

  // Passwort-Hash-Funktion
  const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10); // 10 = Salt Rounds
  };

  // ============================================================
  // USERS
  // ============================================================
  console.log('👥 Creating users...');

  const reporter = await prisma.user.upsert({
    where: { email: 'reporter@example.com' },
    update: {
      passwordHash: await hashPassword('Reporter123!'),
    },
    create: {
      id: '9f9c9832-86a8-4db9-9ece-4f1c27287cd3',
      email: 'reporter@example.com',
      passwordHash: await hashPassword('Reporter123!'),
      name: 'Test',
      surname: 'Reporter',
      role: UserRole.REPORTER,
    },
  });

  const developer = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {
      passwordHash: await hashPassword('Developer123!'),
    },
    create: {
      id: '3e1d532d-5ae7-4a32-99ca-0b9b2f383777',
      email: 'developer@example.com',
      passwordHash: await hashPassword('Developer123!'),
      name: 'Test',
      surname: 'Developer',
      role: UserRole.DEVELOPER,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {
      passwordHash: await hashPassword('Manager123!'),
    },
    create: {
      id: 'f1c1ab7c-6a76-4586-9f92-2e017f1da18e',
      email: 'manager@example.com',
      passwordHash: await hashPassword('Manager123!'),
      name: 'Test',
      surname: 'Manager',
      role: UserRole.MANAGER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: await hashPassword('Admin123!'),
    },
    create: {
      id: '0ecc9001-254b-4058-8455-f0fc61e531da',
      email: 'admin@example.com',
      passwordHash: await hashPassword('Admin123!'),
      name: 'Test',
      surname: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log(`  ✓ ${reporter.email} (Reporter)`);
  console.log(`  ✓ ${developer.email} (Developer)`);
  console.log(`  ✓ ${manager.email} (Manager)`);
  console.log(`  ✓ ${admin.email} (Admin)`);

  // ============================================================
  // PROJECTS
  // ============================================================
  console.log('\n📁 Creating projects...');

  const logistikPortal = await prisma.project.upsert({
    where: { id: 'c92a74df-2828-4974-91c2-25258d01e715' },
    update: {},
    create: {
      id: 'c92a74df-2828-4974-91c2-25258d01e715',
      name: 'Logistik-Portal',
      description: 'Portal für Logistik',
      slug: 'PORTAL',
      status: ProjectStatus.OPEN,
      createdBy: manager.id,
    },
  });

  const webShop = await prisma.project.upsert({
    where: { id: '4aa67272-da6f-42ad-ac6c-33d9a61d8f4a' },
    update: {},
    create: {
      id: '4aa67272-da6f-42ad-ac6c-33d9a61d8f4a',
      name: 'Web-Shop',
      description: 'Web-Shop für Elektronik-Handel',
      slug: 'WSHOP',
      status: ProjectStatus.OPEN,
      createdBy: admin.id,
    },
  });

  const kiSystem = await prisma.project.upsert({
    where: { id: 'f01e22d8-e9c3-4f9d-9998-a2abbe222d83' },
    update: {},
    create: {
      id: 'f01e22d8-e9c3-4f9d-9998-a2abbe222d83',
      name: 'Internes KI-System',
      description: 'Internes KI-System zur Automatisierung von Routinearbeiten',
      slug: 'SYSTEM',
      status: ProjectStatus.OPEN,
      createdBy: admin.id,
    },
  });

  const crmSystem = await prisma.project.upsert({
    where: { id: 'a4be7982-1bf0-452b-acf3-0bf13f7cba4a' },
    update: {},
    create: {
      id: 'a4be7982-1bf0-452b-acf3-0bf13f7cba4a',
      name: 'CRM-System',
      description: 'Internes CRM-System für Kundenbeziehungen',
      slug: 'CRM',
      status: ProjectStatus.OPEN,
      createdBy: admin.id,
    },
  });

  const erpSystem = await prisma.project.upsert({
    where: { id: '6c9bdff1-ab38-4141-8718-eea5a3049d6f' },
    update: {},
    create: {
      id: '6c9bdff1-ab38-4141-8718-eea5a3049d6f',
      name: 'ERP-System',
      description: 'ERP-System für Logistik-Unternehmen',
      slug: 'ERP',
      status: ProjectStatus.OPEN,
      createdBy: admin.id,
    },
  });

  console.log(`  ✓ ${logistikPortal.name} (${logistikPortal.slug})`);
  console.log(`  ✓ ${webShop.name} (${webShop.slug})`);
  console.log(`  ✓ ${kiSystem.name} (${kiSystem.slug})`);
  console.log(`  ✓ ${crmSystem.name} (${crmSystem.slug})`);
  console.log(`  ✓ ${erpSystem.name} (${erpSystem.slug})`);

  // ============================================================
  // PROJECT MEMBERS
  // ============================================================
  console.log('\n👨‍💼 Adding project members...');

  // Logistik-Portal: Reporter + Developer
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: logistikPortal.id,
        userId: reporter.id,
      },
    },
    update: {},
    create: {
      projectId: logistikPortal.id,
      userId: reporter.id,
      addedBy: manager.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: logistikPortal.id,
        userId: developer.id,
      },
    },
    update: {},
    create: {
      projectId: logistikPortal.id,
      userId: developer.id,
      addedBy: manager.id,
    },
  });

  // Web-Shop: Developer
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: webShop.id,
        userId: developer.id,
      },
    },
    update: {},
    create: {
      projectId: webShop.id,
      userId: developer.id,
      addedBy: manager.id,
    },
  });

  // ERP-System: Reporter
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: erpSystem.id,
        userId: reporter.id,
      },
    },
    update: {},
    create: {
      projectId: erpSystem.id,
      userId: reporter.id,
      addedBy: admin.id,
    },
  });

  console.log(`  ✓ Logistik-Portal: Reporter, Developer`);
  console.log(`  ✓ Web-Shop: Developer`);
  console.log(`  ✓ ERP-System: Reporter`);

  // ============================================================
  // LABELS
  // ============================================================
  console.log('\n🏷️  Creating labels...');

  const bugLabel = await prisma.label.upsert({
    where: { id: '76ec7f99-a754-4411-80a2-3703065863cb' },
    update: {},
    create: {
      id: '76ec7f99-a754-4411-80a2-3703065863cb',
      name: 'Bug',
      color: '#FF0000',
      projectId: logistikPortal.id,
    },
  });

  const featureLabel = await prisma.label.upsert({
    where: { id: '428ad2bd-e180-45ff-9bb1-591dded0dede' },
    update: {},
    create: {
      id: '428ad2bd-e180-45ff-9bb1-591dded0dede',
      name: 'Feature',
      color: '#0000FF',
      projectId: logistikPortal.id,
    },
  });

  console.log(`  ✓ ${bugLabel.name} (${logistikPortal.name})`);
  console.log(`  ✓ ${featureLabel.name} (${logistikPortal.name})`);

  // ============================================================
  // TICKETS
  // ============================================================
  console.log('\n🎫 Creating tickets...');

  const ticket1 = await prisma.ticket.upsert({
    where: { id: 'ba0981a7-1829-487c-97f4-f2fc58eb1049' },
    update: {},
    create: {
      id: 'ba0981a7-1829-487c-97f4-f2fc58eb1049',
      title: 'Backend-Implementierung',
      description: 'API für die Benutzer-Registrierung',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      projectId: logistikPortal.id,
      reporterId: admin.id,
      assigneeId: developer.id,
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { id: 'd4079387-d0e4-4192-b07b-bf30f057af3c' },
    update: {},
    create: {
      id: 'd4079387-d0e4-4192-b07b-bf30f057af3c',
      title: 'Frontend-Implementierung',
      description: 'Formular für die Benutzer-Registrierung',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      projectId: webShop.id,
      reporterId: admin.id,
      assigneeId: null,
    },
  });

  console.log(`  ✓ ${ticket1.title} (${logistikPortal.name})`);
  console.log(`  ✓ ${ticket2.title} (${webShop.name})`);

  // ============================================================
  // ZUSAMMENFASSUNG
  // ============================================================
  console.log('\n📊 Summary:');
  console.log('============================================================');
  console.log('  Users:           4 (Reporter, Developer, Manager, Admin)');
  console.log('  Projects:        5');
  console.log('  Project Members: 4');
  console.log('  Labels:          2');
  console.log('  Tickets:         2');
  console.log('============================================================\n');

  console.log('🔐 Test Credentials:');
  console.log('  📧 reporter@example.com   → Password: Reporter123!');
  console.log('  📧 developer@example.com  → Password: Developer123!');
  console.log('  📧 manager@example.com    → Password: Manager123!');
  console.log('  📧 admin@example.com      → Password: Admin123!\n');

  console.log('💡 Alle Passwörter wurden mit bcrypt gehasht!');
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
