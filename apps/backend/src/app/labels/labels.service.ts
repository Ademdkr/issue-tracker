import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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

    // 2. Prüfe ob Label-Name bereits existiert im Projekt
    const existingLabel = await this.prisma.label.findFirst({
      where: {
        projectId,
        name: createLabelDto.name,
      },
    });

    if (existingLabel) {
      throw new ConflictException(
        `Label "${createLabelDto.name}" already exists in this project`
      );
    }

    // 3. Erstelle Label
    const label = await this.prisma.label.create({
      data: {
        name: createLabelDto.name,
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

    // 2. Bei Namenänderung: Prüfe ob neuer Name bereits existiert
    if (updateLabelDto.name && updateLabelDto.name !== label.name) {
      const existingLabel = await this.prisma.label.findFirst({
        where: {
          projectId,
          name: updateLabelDto.name,
          NOT: { id: labelId },
        },
      });

      if (existingLabel) {
        throw new ConflictException(
          `Label "${updateLabelDto.name}" already exists in this project`
        );
      }
    }

    // 3. Update nur wenn es Änderungen gibt
    const updateData: { name?: string; color?: string; updatedAt?: Date } = {};
    let hasChanges = false;

    if (
      updateLabelDto.name !== undefined &&
      updateLabelDto.name !== label.name
    ) {
      updateData.name = updateLabelDto.name;
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
