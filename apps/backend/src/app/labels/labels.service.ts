import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import {
  Label,
  CreateLabelDto,
  UpdateLabelDto,
} from '@issue-tracker/shared-types';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Label für ein Projekt erstellen
   *
   * Validierung:
   * - Projekt muss existieren
   * - Label-Name darf nicht bereits im Projekt existieren (Unique Constraint)
   *
   * @param projectId - UUID des Projekts
   * @param createLabelDto - Label-Daten (name, color)
   * @returns Erstelltes Label
   */
  async create(
    projectId: string,
    createLabelDto: CreateLabelDto
  ): Promise<Label> {
    // 1. Prüfe ob Projekt existiert
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Konvertiere Namen zu Lowercase
    const normalizedName = createLabelDto.name.toLowerCase().trim();

    // 3. Prüfe ob Label-Name bereits existiert im Projekt
    const existingLabel = await this.prisma.label.findFirst({
      where: {
        projectId,
        name: normalizedName,
      },
    });

    if (existingLabel) {
      throw new ConflictException(
        `Label "${normalizedName}" already exists in this project`
      );
    }

    // 4. Erstelle Label
    const label = await this.prisma.label.create({
      data: {
        name: normalizedName,
        color: createLabelDto.color,
        projectId,
      },
    });

    return label;
  }

  /**
   * Alle Labels eines Projekts abrufen
   *
   * @param projectId - UUID des Projekts
   * @returns Array aller Labels des Projekts
   */
  async findAllByProject(projectId: string): Promise<Label[]> {
    return await this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Ein einzelnes Label abrufen
   *
   * @param labelId - UUID des Labels
   * @returns Label-Objekt oder null
   */
  async findOne(labelId: string): Promise<Label | null> {
    return await this.prisma.label.findUnique({
      where: { id: labelId },
    });
  }

  /**
   * Label aktualisieren
   *
   * Validierung:
   * - Label muss zum angegebenen Projekt gehören
   * - Bei Namenänderung: Neuer Name darf nicht bereits existieren
   *
   * @param projectId - UUID des Projekts (für Validierung)
   * @param labelId - UUID des Labels
   * @param updateLabelDto - Zu aktualisierende Felder
   * @returns Aktualisiertes Label
   */
  async update(
    projectId: string,
    labelId: string,
    updateLabelDto: UpdateLabelDto
  ): Promise<Label> {
    // 1. Prüfe ob Label zu diesem Projekt gehört
    const label = await this.prisma.label.findFirst({
      where: { id: labelId, projectId },
    });

    if (!label) {
      throw new Error('Label not found in this project');
    }

    // 2. Konvertiere Namen zu Lowercase wenn vorhanden
    const normalizedName = updateLabelDto.name
      ? updateLabelDto.name.toLowerCase().trim()
      : undefined;

    // 3. Bei Namenänderung: Prüfe ob neuer Name bereits existiert
    if (normalizedName && normalizedName !== label.name) {
      const existingLabel = await this.prisma.label.findFirst({
        where: {
          projectId,
          name: normalizedName,
          NOT: { id: labelId },
        },
      });

      if (existingLabel) {
        throw new ConflictException(
          `Label "${normalizedName}" already exists in this project`
        );
      }
    }

    // 4. Update nur wenn es Änderungen gibt
    const updateData: { name?: string; color?: string; updatedAt?: Date } = {};
    let hasChanges = false;

    if (normalizedName !== undefined && normalizedName !== label.name) {
      updateData.name = normalizedName;
      hasChanges = true;
    }

    if (
      updateLabelDto.color !== undefined &&
      updateLabelDto.color !== label.color
    ) {
      updateData.color = updateLabelDto.color;
      hasChanges = true;
    }

    if (hasChanges) {
      updateData.updatedAt = new Date();
      return await this.prisma.label.update({
        where: { id: labelId },
        data: updateData,
      });
    }

    return label;
  }

  /**
   * Alle Labels für die Projekte eines Benutzers abrufen
   * 
   * Basierend auf der Rolle des Benutzers:
   * - Admin/Manager: Alle Labels aller Projekte
   * - Reporter: Labels nur der Projekte, die er erstellt hat
   * - Developer: Labels der Projekte, in denen er Mitglied ist + eigene
   *
   * @param user - Benutzer-Objekt mit id und role
   * @returns Array aller Labels, auf die der Benutzer Zugriff hat
   */
  async findAllByUserRole(user: { id: string; role: string }): Promise<any[]> {
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      // Admin und Manager sehen alle Labels
      return await this.prisma.label.findMany({
        orderBy: { name: 'asc' },
        include: {
          project: {
            select: { name: true, slug: true },
          },
        },
      });
    } else if (user.role === 'REPORTER') {
      // Reporter sieht nur Labels seiner eigenen Projekte
      return await this.prisma.label.findMany({
        where: {
          project: {
            createdBy: user.id,
          },
        },
        orderBy: { name: 'asc' },
        include: {
          project: {
            select: { name: true, slug: true },
          },
        },
      });
    } else if (user.role === 'DEVELOPER') {
      // Developer sieht Labels der Projekte, in denen er Mitglied ist
      return await this.prisma.label.findMany({
        where: {
          OR: [
            {
              project: {
                createdBy: user.id,
              },
            },
            {
              project: {
                members: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
          ],
        },
        orderBy: { name: 'asc' },
        include: {
          project: {
            select: { name: true, slug: true },
          },
        },
      });
    }

    return [];
  }

  /**
   * Label löschen
   *
   * Validierung:
   * - Label muss zum angegebenen Projekt gehören
   *
   * @param projectId - UUID des Projekts (für Validierung)
   * @param labelId - UUID des Labels
   * @returns Gelöschtes Label
   */
  async remove(projectId: string, labelId: string): Promise<Label> {
    // 1. Prüfe ob Label zu diesem Projekt gehört
    const label = await this.prisma.label.findFirst({
      where: { id: labelId, projectId },
    });

    if (!label) {
      throw new Error('Label not found in this project');
    }

    // 2. Lösche Label (cascade löscht automatisch TicketLabel-Zuordnungen)
    return await this.prisma.label.delete({
      where: { id: labelId },
    });
  }
}
