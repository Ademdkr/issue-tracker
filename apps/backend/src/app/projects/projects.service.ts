// NestJS Dependencies und Decorators
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
// Prisma Datenbankservice für Datenbankoperationen
import { PrismaService } from '../prisma.service';
// Prisma-generierte Typen für typsichere Datenbankoperationen
import { Project as PrismaProject } from '@prisma/client';
// Shared Types für einheitliche Typen zwischen Backend und Frontend
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UserRole,
} from '@issue-tracker/shared-types';

/**
 * ProjectsService - Hauptgeschäftslogik für Projekt-Verwaltung
 *
 * Diese Klasse behandelt alle CRUD-Operationen (Create, Read, Update, Delete)
 * für Projekte und implementiert die Geschäftsregeln wie:
 * - Automatische Slug-Generierung als Abkürzungen
 * - Eindeutigkeitsprüfungen
 * - Authorization (Manager/Admin für Erstellung)
 * - Type-Mapping zwischen Prisma und Shared-Types
 */
@Injectable()
export class ProjectsService {
  /**
   * Konstruktor - Injiziert PrismaService für Datenbankzugriff
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generiert einen intelligenten Slug aus dem Projektnamen
   *
   * Algorithmus:
   * 1. Bekannte Begriffe (Portal, CRM, Shop, etc.) → Werden als Abkürzung verwendet
   * 2. Einzelnes Wort → Erste 5 Zeichen in Großbuchstaben
   * 3. Mehrere Wörter → Akronym aus ersten Buchstaben
   *
   * Beispiele:
   * - "Logistik-Portal" → "PORTAL"
   * - "Kunden-CRM" → "CRM"
   * - "Web-Shop" → "SHOP"
   * - "Issue Tracker" → "IT"
   *
   * @param name - Der Projektname
   * @returns Generierter Slug in Großbuchstaben
   */
  private generateSlug(name: string): string {
    // Liste bekannter Begriffe, die als direkte Abkürzung verwendet werden
    const knownTerms = [
      'portal',
      'crm',
      'shop',
      'app',
      'system',
      'tool',
      'platform',
      'dashboard',
      'api',
      'web',
      'mobile',
      'admin',
      'manager',
      'tracker',
      'monitor',
      'analytics',
      'cms',
      'erp',
      'hr',
      'pos',
      'blog',
      'forum',
      'chat',
      'mail',
      'calendar',
      'todo',
      'task',
      'project',
    ];

    // Projektname normalisieren und in Wörter aufteilen
    const words = name
      .toLowerCase() // Kleinschreibung für einheitliche Verarbeitung
      .trim() // Leerzeichen am Anfang/Ende entfernen
      .replace(/[^a-z0-9\s-]/g, '') // Sonderzeichen entfernen (nur Buchstaben, Zahlen, Leerzeichen, Bindestriche)
      .split(/[-\s]+/); // Nach Leerzeichen und Bindestrichen in Wörter aufteilen

    // Fallback wenn keine gültigen Wörter gefunden wurden
    if (words.length === 0) return 'project';

    // Letztes Wort extrahieren für Begriff-Prüfung
    const lastWord = words[words.length - 1];

    // Prüfung: Ist das letzte Wort ein bekannter Begriff?
    // Beispiel: "Logistik-Portal" → "portal" ist bekannt → "PORTAL"
    if (knownTerms.includes(lastWord)) {
      return lastWord.toUpperCase();
    }

    // Spezialfall: Nur ein Wort vorhanden
    // Beispiel: "Dashboard" → "DASHB" (erste 5 Zeichen)
    if (words.length === 1) {
      return words[0].substring(0, 5).toUpperCase();
    }

    // Standardfall: Akronym aus ersten Buchstaben aller Wörter
    // Beispiel: "Issue Tracker" → "IT", "Customer Management" → "CM"
    return words
      .map((word) => word.charAt(0)) // Ersten Buchstaben jedes Wortes
      .join('') // Zusammenfügen
      .toUpperCase(); // In Großbuchstaben
  }

  /**
   * Konvertiert Prisma-Projekt-Objekt zu Shared-Types-Projekt
   *
   * @param prismaProject - Projekt-Objekt aus der Datenbank
   * @returns Typsicheres Projekt-Objekt für API-Response
   */
  private mapPrismaToProject(prismaProject: PrismaProject): Project {
    return {
      ...prismaProject, // Alle Felder übernehmen
      status: prismaProject.status as Project['status'], // Status-Enum type-cast
    };
  }

  /**
   * Stellt sicher, dass der generierte Slug eindeutig ist
   *
   * Falls ein Slug bereits existiert, wird eine Nummer angehängt:
   * - "PORTAL" → "PORTAL1" → "PORTAL2" usw.
   *
   * @param baseSlug - Der ursprünglich generierte Slug
   * @returns Eindeutiger Slug
   */
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    // Solange der Slug bereits existiert, füge eine Nummer hinzu
    while (await this.prisma.project.findFirst({ where: { slug } })) {
      slug = `${baseSlug}${counter}`; // PORTAL → PORTAL1 → PORTAL2
      counter++;
    }

    return slug;
  }

  /**
   * Erstellt ein neues Projekt in der Datenbank
   *
   * Geschäftsregeln:
   * - Nur Manager und Admins dürfen Projekte erstellen
   * - Automatische Slug-Generierung mit Eindeutigkeitsprüfung
   * - Validierung der Benutzer-Existenz und -Berechtigung
   *
   * @param createProjectDto - Projektdaten aus API-Request
   * @returns Erstelltes Projekt-Objekt
   * @throws Error bei Validierungsfehlern oder fehlenden Berechtigungen
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // 1. Slug aus Projektname generieren
    const baseSlug = this.generateSlug(createProjectDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // 2. Benutzer-Validierung: Existenz und Berechtigung prüfen
    const creator = await this.prisma.user.findUnique({
      where: { id: createProjectDto.createdBy },
      select: { id: true, role: true }, // Nur benötigte Felder für Performance
    });

    if (!creator) {
      throw new NotFoundException('Creator user not found');
    }

    // 3. Authorization: Nur Manager und Admins erlaubt
    if (creator.role !== UserRole.MANAGER && creator.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Only managers and admins can create projects'
      );
    }

    // Hinweis: Slug-Eindeutigkeitsprüfung erfolgt bereits in ensureUniqueSlug()
    // Daher ist diese Prüfung nicht mehr notwendig:
    // const existingProject = await this.prisma.project.findUnique({
    //   where: { slug },
    // });

    // 4. Projekt in Datenbank erstellen
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        slug, // Generierter eindeutiger Slug
        createdBy: createProjectDto.createdBy,
      },
    });

    // 5. Prisma-Objekt zu Shared-Types konvertieren für API-Response
    return this.mapPrismaToProject(project);
  }

  /**
   * Ruft alle Projekte aus der Datenbank ab
   *
   * @returns Array aller Projekte, sortiert nach Erstellungsdatum (neueste zuerst)
   */
  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' }, // Neueste Projekte zuerst
    });

    // Alle Prisma-Objekte zu Shared-Types konvertieren
    return projects.map((project) => this.mapPrismaToProject(project));
  }

  /**
   * Ruft ein einzelnes Projekt anhand der ID ab
   *
   * @param id - UUID des Projekts
   * @returns Projekt-Objekt oder null falls nicht gefunden
   */
  async findOne(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    // Null-Check und Type-Conversion
    return project ? this.mapPrismaToProject(project) : null;
  }

  /**
   * Aktualisiert ein bestehendes Projekt (Manager/Admin)
   *
   * Authorization:
   * - Nur Manager und Admins können Projekte bearbeiten
   *
   * Editierbare Felder:
   * - name: Projektname (max. 100 Zeichen)
   * - description: Projektbeschreibung
   *
   * Features:
   * - Selective Updates: Nur geänderte Felder werden aktualisiert
   * - Automatische Slug-Regenerierung bei Namensänderung
   * - Konfliktbehandlung für neue Slugs
   * - Automatisches updatedAt-Timestamp
   *
   * @param id - UUID des zu aktualisierenden Projekts
   * @param updateProjectDto - Teilweise Projektdaten (name, description)
   * @returns Aktualisiertes Projekt-Objekt
   */
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    // Hole aktuelles Projekt für Vergleich
    const currentProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!currentProject) {
      throw new Error('Project not found');
    }

    const updateData: {
      name?: string;
      description?: string;
      slug?: string;
      updatedAt?: Date;
    } = {};

    let hasChanges = false;

    // Nur erlaubte Felder übernehmen
    if (
      updateProjectDto.name !== undefined &&
      updateProjectDto.name !== currentProject.name
    ) {
      updateData.name = updateProjectDto.name;
      // Bei Namensänderung neuen Slug generieren
      const newSlug = await this.ensureUniqueSlug(
        this.generateSlug(updateProjectDto.name)
      );
      updateData.slug = newSlug;
      hasChanges = true;
    }

    if (
      updateProjectDto.description !== undefined &&
      updateProjectDto.description !== currentProject.description
    ) {
      updateData.description = updateProjectDto.description;
      hasChanges = true;
    }

    // updatedAt nur setzen wenn es echte Änderungen gibt
    if (hasChanges) {
      updateData.updatedAt = new Date();
    } else {
      // Keine Änderungen - gib aktuelles Projekt zurück
      return this.mapPrismaToProject(currentProject);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
      },
    });

    return this.mapPrismaToProject(updatedProject);
  }

  /**
   * Aktualisiert ein Projekt mit Admin-Rechten
   *
   * Authorization:
   * - Nur Admins können Slugs manuell ändern
   *
   * Editierbare Felder:
   * - name: Projektname (max. 100 Zeichen)
   * - description: Projektbeschreibung
   * - slug: URL-freundlicher Identifier (nur Admin)
   *
   * Logik:
   * - Admin kann name, description UND slug ändern
   * - Wenn slug manuell gesetzt wird, wird KEIN automatischer Slug generiert
   * - Wenn nur der Name geändert wird, wird wie bei normalem Update ein Slug generiert
   * - Manuelle Slugs müssen eindeutig sein
   *
   * @param id - UUID des Projekts
   * @param adminUpdateDto - Zu aktualisierende Felder inkl. slug
   * @returns Das aktualisierte Projekt
   */
  async adminUpdate(
    id: string,
    adminUpdateDto: { name?: string; description?: string; slug?: string }
  ): Promise<Project> {
    // Hole aktuelles Projekt für Vergleich
    const currentProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!currentProject) {
      throw new NotFoundException('Project not found');
    }

    const updateData: {
      name?: string;
      description?: string;
      slug?: string;
      updatedAt?: Date;
    } = {};

    let hasChanges = false;

    if (
      adminUpdateDto.name !== undefined &&
      adminUpdateDto.name !== currentProject.name
    ) {
      updateData.name = adminUpdateDto.name;
      hasChanges = true;
      // Nur neuen Slug generieren, wenn nicht manuell gesetzt
      if (!adminUpdateDto.slug) {
        const newSlug = await this.ensureUniqueSlug(
          this.generateSlug(adminUpdateDto.name)
        );
        updateData.slug = newSlug;
      }
    }

    if (
      adminUpdateDto.description !== undefined &&
      adminUpdateDto.description !== currentProject.description
    ) {
      updateData.description = adminUpdateDto.description;
      hasChanges = true;
    }

    // Admin kann Slug manuell setzen
    if (
      adminUpdateDto.slug !== undefined &&
      adminUpdateDto.slug !== currentProject.slug
    ) {
      // Prüfe Eindeutigkeit des manuellen Slugs
      const existingProject = await this.prisma.project.findFirst({
        where: {
          slug: adminUpdateDto.slug,
          NOT: { id },
        },
      });

      if (existingProject) {
        throw new ConflictException(
          `Slug "${adminUpdateDto.slug}" wird bereits verwendet`
        );
      }

      updateData.slug = adminUpdateDto.slug;
      hasChanges = true;
    }

    // updatedAt nur setzen wenn es echte Änderungen gibt
    if (hasChanges) {
      updateData.updatedAt = new Date();
    } else {
      // Keine Änderungen - gib aktuelles Projekt zurück
      return this.mapPrismaToProject(currentProject);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
      },
    });

    return this.mapPrismaToProject(updatedProject);
  }

  /**
   * Löscht ein Projekt aus der Datenbank
   *
   * Hinweis: Diese Methode ist durch RoleGuard geschützt (nur Admins)
   *
   * @param id - UUID des zu löschenden Projekts
   * @returns Das gelöschte Projekt-Objekt
   * @throws Prisma-Fehler falls Projekt nicht existiert
   */
  async remove(id: string): Promise<Project> {
    // Projekt löschen (wirft automatisch Fehler falls nicht gefunden)
    const project = await this.prisma.project.delete({
      where: { id },
    });

    // Gelöschtes Projekt als Response zurückgeben
    return this.mapPrismaToProject(project);
  }

  /**
   * Fügt einen Benutzer als Mitglied zu einem Projekt hinzu
   *
   * Authorization:
   * - Nur Manager und Admins können Mitglieder hinzufügen
   *
   * Validierung:
   * - Projekt muss existieren
   * - Benutzer muss existieren
   * - Benutzer darf nicht bereits Mitglied sein
   *
   * @param projectId - UUID des Projekts
   * @param addMemberDto - DTO mit userId und addedBy
   * @returns Bestätigungsmeldung
   */
  async addMember(
    projectId: string,
    addMemberDto: AddProjectMemberDto
  ): Promise<{ message: string }> {
    // 1. Projekt existiert?
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Benutzer existiert?
    const user = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Bereits Mitglied?
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: addMemberDto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    // 4. Mitglied hinzufügen
    await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: addMemberDto.userId,
        addedBy: addMemberDto.addedBy,
      },
    });

    return {
      message: `User ${user.name} ${user.surname} added to project ${project.name}`,
    };
  }

  /**
   * Entfernt einen Benutzer aus einem Projekt
   *
   * Authorization:
   * - Nur Manager und Admins können Mitglieder entfernen
   *
   * Validierung:
   * - Projekt muss existieren
   * - Benutzer muss Mitglied sein
   *
   * @param projectId - UUID des Projekts
   * @param userId - UUID des zu entfernenden Benutzers
   * @returns Bestätigungsmeldung
   */
  async removeMember(
    projectId: string,
    userId: string
  ): Promise<{ message: string }> {
    // 1. Mitgliedschaft existiert?
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: true,
        project: true,
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this project');
    }

    // 2. Mitglied entfernen
    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return {
      message: `User ${member.user.name} ${member.user.surname} removed from project ${member.project.name}`,
    };
  }

  /**
   * Prüft ob ein Benutzer Zugriff auf ein Projekt hat
   *
   * Zugriff haben:
   * - Admins (immer)
   * - Manager (immer)
   * - Projektmitglieder
   *
   * @param projectId - UUID des Projekts
   * @param userId - UUID des Benutzers
   * @returns true wenn Zugriff erlaubt, sonst false
   */
  async hasProjectAccess(projectId: string, userId: string): Promise<boolean> {
    // 1. Benutzer-Rolle abrufen
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    // 2. Admins und Manager haben immer Zugriff
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // 3. Prüfe ob Benutzer Projektmitglied ist
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Ruft alle Mitglieder eines Projekts ab
   *
   * @param projectId - UUID des Projekts
   * @returns Array von Projektmitgliedern mit User-Informationen
   */
  async getProjectMembers(projectId: string) {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
          },
        },
        adder: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return members.map((member) => ({
      userId: member.userId,
      user: {
        id: member.user.id,
        name: member.user.name,
        surname: member.user.surname,
        email: member.user.email,
        role: member.user.role as UserRole,
      },
      addedBy: {
        id: member.adder.id,
        name: member.adder.name,
        surname: member.adder.surname,
      },
      addedAt: member.addedAt.toISOString(),
    }));
  }

  /**
   * Ruft alle verfügbaren Benutzer ab, die zu einem Projekt hinzugefügt werden können
   * (ohne Suchfilter)
   *
   * @param projectId - UUID des Projekts
   * @returns Array von Benutzern die noch keine Mitglieder sind
   */
  async getAvailableMembers(projectId: string) {
    // 1. Hole alle aktuellen Mitglieder-IDs
    const currentMembers = await this.prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    const memberIds = currentMembers.map((m) => m.userId);

    // 2. Hole alle Benutzer die noch KEINE Mitglieder sind
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: memberIds,
        },
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
      },
      orderBy: [{ name: 'asc' }, { surname: 'asc' }],
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role as UserRole,
    }));
  }

  /**
   * Sucht nach verfügbaren Benutzern, die zu einem Projekt hinzugefügt werden können
   *
   * @param projectId - UUID des Projekts
   * @param searchQuery - Suchbegriff (Name, Vorname oder Email)
   * @returns Array von Benutzern die noch keine Mitglieder sind
   */
  async searchAvailableMembers(projectId: string, searchQuery: string) {
    // Mindestens 2 Zeichen für Suche erforderlich
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const search = searchQuery.trim();

    // 1. Hole alle aktuellen Mitglieder-IDs
    const currentMembers = await this.prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    const memberIds = currentMembers.map((m) => m.userId);

    // 2. Suche nach Benutzern die noch KEINE Mitglieder sind
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { surname: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          {
            id: {
              notIn: memberIds,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
      },
      orderBy: [{ name: 'asc' }, { surname: 'asc' }],
      take: 20, // Maximal 20 Ergebnisse
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role as UserRole,
    }));
  }
}
