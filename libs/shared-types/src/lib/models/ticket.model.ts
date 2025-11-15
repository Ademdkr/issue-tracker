import { TicketStatus, TicketPriority, TicketActivityType } from '../enums';

export interface Ticket {
  id: string;
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date | null;
  labelIds?: string[];
}

// Ticket with related data for frontend
export interface TicketWithDetails extends Ticket {
  project?: {
    id: string;
    name: string;
    slug: string;
  };
  reporter?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  // labels?: Label[];
  commentCount?: number;
}

// Project Member Interface
export interface ProjectMember {
  projectId: string;
  userId: string;
  addedBy: string;
  addedAt: Date;
}

// Project Member with user details
export interface ProjectMemberWithUser extends ProjectMember {
  user?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
  };
}

// Ticket Activity Interface
export interface TicketActivity {
  id: string;
  ticketId: string;
  actorId: string;
  activityType: TicketActivityType;
  detail: {
    oldValue?: string | null;
    newValue?: string | null;
    // labelName?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
}

// Ticket Activity with actor info
export interface TicketActivityWithActor extends TicketActivity {
  actor?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
}
