import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsHexColor,
  IsObject,
} from 'class-validator';
import { TicketStatus, TicketPriority, TicketActivityType } from '../enums';
import { VALIDATION_LIMITS } from '../constants';

/**
 * DTO für Ticket-Erstellung
 */
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  projectId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.TICKET_TITLE_MAX)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsOptional()
  @IsString()
  @IsUUID(4)
  assigneeId?: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  reporterId: string;
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
}

/**
 * DTO für Label-Erstellung
 */
export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  projectId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.LABEL_NAME_MAX)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;
}

/**
 * DTO für Label-Update
 */
export class UpdateLabelDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.LABEL_NAME_MAX)
  name?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}

/**
 * DTO für Kommentar-Erstellung
 */
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  authorId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.COMMENT_MAX)
  content: string;
}

/**
 * DTO für Kommentar-Update
 */
export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.COMMENT_MAX)
  content: string;
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
