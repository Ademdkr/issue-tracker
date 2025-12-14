import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

/**
 * DTO für Label-Erstellung
 * Nur Manager und Admins können Labels erstellen
 *
 * projectId kommt aus dem Route-Parameter: POST /api/projects/:projectId/labels
 */
export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF0000)',
  })
  color!: string;
}

/**
 * DTO für Label-Aktualisierung
 * Nur Manager und Admins können Labels bearbeiten
 *
 * Alle Felder sind optional
 */
export class UpdateLabelDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF0000)',
  })
  color?: string;
}
