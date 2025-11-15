import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  // IsHexColor,
  IsObject,
} from 'class-validator';
import { TicketStatus, TicketPriority, TicketActivityType } from '../enums';
import { VALIDATION_LIMITS } from '../constants';

/**
 * DTO für Ticket-Erstellung
 *
 * projectId kommt aus dem Route-Parameter: POST /api/projects/:projectId/tickets
 * reporterId wird automatisch aus dem angemeldeten User gesetzt
 *
 * Berechtigungen:
 * - Reporter: Kann nur title und description setzen (priority=MEDIUM, assignee=null)
 * - Developer: Kann zusätzlich priority und assigneeId (nur sich selbst) setzen
 * - Manager/Admin: Können alles setzen
 */
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.TICKET_TITLE_MAX)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  @IsUUID(4)
  assigneeId?: string;

  @IsOptional()
  @IsUUID(4, { each: true })
  labelIds?: string[];
}

/**
 * DTO für Ticket-Update
 */
export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.TICKET_TITLE_MAX)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  @IsUUID(4)
  assigneeId?: string;

  @IsOptional()
  @IsUUID(4, { each: true })
  labelIds?: string[];
}

/**
 * DTO zum Hinzufügen eines Labels zu einem Ticket
 */
export class AddLabelToTicketDto {
  @IsUUID()
  @IsNotEmpty()
  labelId!: string;
}

/**
 * DTO für Ticket-Activity (wird meist automatisch erstellt)
 */
export class CreateTicketActivityDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  actorId: string;

  @IsEnum(TicketActivityType)
  activityType: TicketActivityType;

  @IsObject()
  detail: {
    oldValue?: string | null;
    newValue?: string | null;
    labelName?: string;
    [key: string]: unknown;
  };
}
