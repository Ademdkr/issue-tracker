export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketActivityType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  ASSIGNEE_CHANGE = 'ASSIGNEE_CHANGE',
  LABEL_ADDED = 'LABEL_ADDED',
  LABEL_REMOVED = 'LABEL_REMOVED',
}
