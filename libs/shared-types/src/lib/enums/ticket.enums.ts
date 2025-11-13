export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketActivityType {
  STATUS_CHANGE = 'status_change',
  ASSIGNEE_CHANGE = 'assignee_change',
  LABEL_ADDED = 'label_added',
  LABEL_REMOVED = 'label_removed',
}
