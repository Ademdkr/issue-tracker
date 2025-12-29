import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { VALIDATION_LIMITS } from '../constants';
import { ProjectStatus } from '../enums';

/**
 * DTO für Projekt-Erstellung
 * Nur Manager und Admins können Projekte erstellen
 * createdBy wird automatisch vom Backend gesetzt
 */
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROJECT_NAME_MAX, {
    message: `Project name must not exceed ${VALIDATION_LIMITS.PROJECT_NAME_MAX} characters`,
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROJECT_DESCRIPTION_MAX, {
    message: `Description must not exceed ${VALIDATION_LIMITS.PROJECT_DESCRIPTION_MAX} characters`,
  })
  description!: string;

  @IsOptional()
  @IsString()
  @IsUUID(4, { message: 'Created by must be a valid UUID' })
  createdBy?: string;
}

/**
 * DTO für Projekt-Updates durch Manager und Admin
 * Nur name und description können bearbeitet werden
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.PROJECT_NAME_MAX)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

/**
 * DTO für Projekt-Updates durch Admin
 * Admin kann zusätzlich den Slug manuell ändern
 */
export class AdminUpdateProjectDto extends UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.SLUG_MAX)
  slug?: string;
}

/**
 * DTO für Projektmitglied hinzufügen
 * addedBy wird automatisch vom Backend gesetzt
 */
export class AddProjectMemberDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  userId!: string;

  @IsOptional()
  @IsString()
  @IsUUID(4)
  addedBy?: string;
}

/**
 * DTO für Projektmitglied entfernen
 */
export class RemoveProjectMemberDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  userId!: string;
}
