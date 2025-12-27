import { PrismaClient } from '@prisma/client';
import { Logger } from './logger';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
    },
  },
});

const logger = new Logger('Export');

async function exportData() {
  logger.log('📊 Exporting current database state...\n');

  // Users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });
  logger.log('=== USERS ===');
  users.forEach((u) => {
    logger.log(`{
  email: '${u.email}',
  name: '${u.name}',
  surname: '${u.surname}',
  role: UserRole.${u.role},
  id: '${u.id}'
}`);
  });

  // Projects
  const projects = await prisma.project.findMany({
    include: { members: true },
    orderBy: { createdAt: 'asc' },
  });
  logger.log('\n=== PROJECTS ===');
  projects.forEach((p) => {
    logger.log(`{
  name: '${p.name}',
  description: '${p.description}',
  slug: '${p.slug}',
  status: ProjectStatus.${p.status},
  createdBy: '${p.createdBy}', // ${
      users.find((u) => u.id === p.createdBy)?.email
    }
  id: '${p.id}',
  members: ${JSON.stringify(
    p.members.map((m) => ({ userId: m.userId, addedBy: m.addedBy }))
  )}
}`);
  });

  // Labels
  const labels = await prisma.label.findMany({
    orderBy: { createdAt: 'asc' },
  });
  logger.log('\n=== LABELS ===');
  labels.forEach((l) => {
    logger.log(`{
  name: '${l.name}',
  color: '${l.color}',
  projectId: '${l.projectId}', // ${
      projects.find((p) => p.id === l.projectId)?.name
    }
  id: '${l.id}'
}`);
  });

  // Tickets
  const tickets = await prisma.ticket.findMany({
    include: { ticketLabels: true },
    orderBy: { createdAt: 'asc' },
  });
  logger.log('\n=== TICKETS ===');
  tickets.forEach((t) => {
    logger.log(`{
  title: '${t.title}',
  description: '${t.description}',
  status: TicketStatus.${t.status},
  priority: TicketPriority.${t.priority},
  projectId: '${t.projectId}', // ${
      projects.find((p) => p.id === t.projectId)?.name
    }
  reporterId: '${t.reporterId}', // ${
      users.find((u) => u.id === t.reporterId)?.email
    }
  assigneeId: ${t.assigneeId ? `'${t.assigneeId}'` : 'null'}, // ${
      t.assigneeId ? users.find((u) => u.id === t.assigneeId)?.email : 'none'
    }
  id: '${t.id}',
  labelIds: ${JSON.stringify(t.ticketLabels.map((tl) => tl.labelId))}
}`);
  });

  // Comments
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'asc' },
  });
  logger.log('\n=== COMMENTS ===');
  comments.forEach((c) => {
    logger.log(`{
  content: '${c.content.replace(/'/g, "\\'")}',
  ticketId: '${c.ticketId}',
  authorId: '${c.authorId}', // ${users.find((u) => u.id === c.authorId)?.email}
  id: '${c.id}'
}`);
  });

  // Ticket Activities
  const activities = await prisma.ticketActivity.findMany({
    orderBy: { createdAt: 'asc' },
  });
  logger.log('\n=== TICKET ACTIVITIES ===');
  activities.forEach((a) => {
    logger.log(`{
  ticketId: '${a.ticketId}',
  actorId: '${a.actorId}', // ${users.find((u) => u.id === a.actorId)?.email}
  activityType: TicketActivityType.${a.activityType},
  detail: ${JSON.stringify(a.detail)},
  id: '${a.id}'
}`);
  });

  logger.success('Export complete! \n');
  await prisma.$disconnect();
}

exportData();
