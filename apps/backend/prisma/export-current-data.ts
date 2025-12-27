import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Exportiert den aktuellen Datenbestand in eine JSON-Datei
 * Diese Datei kann dann vom seed.ts verwendet werden
 * 
 * Ausführung:
 * $env:DATABASE_URL = "postgresql://postgres:1234@localhost:5435/issue_tracker_db"
 * npx tsx apps/backend/prisma/export-current-data.ts
 */
async function exportData() {
  console.log('📊 Exportiere aktuellen Datenbestand...\n');

  try {
    // Exportiere alle Tabellen in der richtigen Reihenfolge (wegen Foreign Keys)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${users.length} Users exportiert`);

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${projects.length} Projects exportiert`);

    const projectMembers = await prisma.projectMember.findMany({
      orderBy: { addedAt: 'asc' },
    });
    console.log(`✅ ${projectMembers.length} Project Members exportiert`);

    const labels = await prisma.label.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${labels.length} Labels exportiert`);

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${tickets.length} Tickets exportiert`);

    const ticketLabels = await prisma.ticketLabel.findMany();
    console.log(`✅ ${ticketLabels.length} Ticket Labels exportiert`);

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${comments.length} Comments exportiert`);

    const activities = await prisma.ticketActivity.findMany({
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✅ ${activities.length} Ticket Activities exportiert`);

    // Daten strukturieren
    const exportData = {
      users,
      projects,
      projectMembers,
      labels,
      tickets,
      ticketLabels,
      comments,
      activities,
      exportedAt: new Date().toISOString(),
    };

    // In JSON-Datei schreiben
    const outputPath = path.join(__dirname, 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log('\n✅ Daten erfolgreich exportiert nach:');
    console.log(`   ${outputPath}`);
    console.log('\n💡 Du kannst diese Daten mit seed.ts importieren');
  } catch (error) {
    console.error('❌ Fehler beim Export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
