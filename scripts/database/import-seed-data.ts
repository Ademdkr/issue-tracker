import './environment';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Importiert Daten aus seed-data.json
 * Falls seed-data.json nicht existiert, werden Standard-Testdaten angelegt
 *
 * Ausführung:
 * $env:DATABASE_URL = "postgresql://postgres:1234@localhost:5435/issue_tracker_db"
 * npm run db:import
 *
 * Oder mit Prisma CLI:
 * npx prisma db seed
 */
async function main() {
  console.log('🌱 Seeding database...\n');

  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const hasSeedData = fs.existsSync(seedDataPath);

  if (hasSeedData) {
    console.log('📂 Lade Daten aus seed-data.json...\n');
    await importFromJson(seedDataPath);
  } else {
    console.log('⚠️  seed-data.json nicht gefunden');
    console.log('💡 Verwende Standard-Testdaten\n');
    await createDefaultData();
  }
}

async function importFromJson(filePath: string) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`📊 Exportiert am: ${data.exportedAt}\n`);

    // Datenbank leeren (in der richtigen Reihenfolge wegen Foreign Keys)
    console.log('🗑️  Lösche bestehende Daten...');
    await prisma.ticketActivity.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.ticketLabel.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.label.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Daten gelöscht\n');

    // Importiere in der richtigen Reihenfolge
    console.log('📥 Importiere Daten...');

    // Users (ohne passwordHash ändern - behalte bestehende Hashes)
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
    console.log(`✅ ${data.users.length} Users`);

    // Projects
    for (const project of data.projects) {
      await prisma.project.create({ data: project });
    }
    console.log(`✅ ${data.projects.length} Projects`);

    // Project Members
    for (const member of data.projectMembers) {
      await prisma.projectMember.create({ data: member });
    }
    console.log(`✅ ${data.projectMembers.length} Project Members`);

    // Labels
    for (const label of data.labels) {
      await prisma.label.create({ data: label });
    }
    console.log(`✅ ${data.labels.length} Labels`);

    // Tickets
    for (const ticket of data.tickets) {
      await prisma.ticket.create({ data: ticket });
    }
    console.log(`✅ ${data.tickets.length} Tickets`);

    // Ticket Labels
    for (const ticketLabel of data.ticketLabels) {
      await prisma.ticketLabel.create({ data: ticketLabel });
    }
    console.log(`✅ ${data.ticketLabels.length} Ticket Labels`);

    // Comments
    for (const comment of data.comments) {
      await prisma.comment.create({ data: comment });
    }
    console.log(`✅ ${data.comments.length} Comments`);

    // Activities
    for (const activity of data.activities) {
      await prisma.ticketActivity.create({ data: activity });
    }
    console.log(`✅ ${data.activities.length} Ticket Activities`);

    console.log('\n✅ Import erfolgreich abgeschlossen! 🎉\n');
  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
    throw error;
  }
}

async function createDefaultData() {
  // Hash Funktion
  const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  };

  // Standard-Benutzer
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await hashPassword('Admin123!'),
      name: 'Admin',
      surname: 'User',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      passwordHash: await hashPassword('Manager123!'),
      name: 'Manager',
      surname: 'User',
      role: 'MANAGER',
    },
  });

  const developer = await prisma.user.create({
    data: {
      email: 'developer@example.com',
      passwordHash: await hashPassword('Developer123!'),
      name: 'Developer',
      surname: 'User',
      role: 'DEVELOPER',
    },
  });

  const reporter = await prisma.user.create({
    data: {
      email: 'reporter@example.com',
      passwordHash: await hashPassword('Reporter123!'),
      name: 'Reporter',
      surname: 'User',
      role: 'REPORTER',
    },
  });

  console.log('✅ 4 Test-Benutzer erstellt');

  // Standard-Projekt
  const project = await prisma.project.create({
    data: {
      name: 'Test Projekt',
      slug: 'test-projekt',
      description: 'Ein Test-Projekt für die Entwicklung',
      status: 'OPEN',
      createdBy: admin.id,
    },
  });

  console.log('✅ 1 Test-Projekt erstellt');

  // Projekt-Mitglieder
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: developer.id, addedBy: admin.id },
      { projectId: project.id, userId: reporter.id, addedBy: admin.id },
    ],
  });

  console.log('✅ 2 Projekt-Mitglieder hinzugefügt');

  // Labels
  const bugLabel = await prisma.label.create({
    data: {
      name: 'Bug',
      color: '#f44336',
      projectId: project.id,
    },
  });

  const featureLabel = await prisma.label.create({
    data: {
      name: 'Feature',
      color: '#2196f3',
      projectId: project.id,
    },
  });

  console.log('✅ 2 Labels erstellt');

  // Tickets
  const ticket = await prisma.ticket.create({
    data: {
      title: 'Beispiel-Ticket',
      description: 'Dies ist ein Beispiel-Ticket',
      status: 'OPEN',
      priority: 'MEDIUM',
      projectId: project.id,
      reporterId: reporter.id,
      assigneeId: developer.id,
    },
  });

  console.log('✅ 1 Ticket erstellt');

  // Ticket Label zuweisen
  await prisma.ticketLabel.create({
    data: {
      ticketId: ticket.id,
      labelId: bugLabel.id,
    },
  });

  console.log('\n🔐 Test-Zugangsdaten:');
  console.log('  📧 admin@example.com      → Password: Admin123!');
  console.log('  📧 manager@example.com    → Password: Manager123!');
  console.log('  📧 developer@example.com  → Password: Developer123!');
  console.log('  📧 reporter@example.com   → Password: Reporter123!\n');
  console.log('✅ Standard-Daten erfolgreich erstellt! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding fehlgeschlagen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
