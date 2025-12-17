export interface DashboardStats {
  ticketCounts: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
  projectsWithOpenTickets: ProjectWithOpenTickets[];
  recentTickets: RecentTicket[];
}

export interface ProjectWithOpenTickets {
  id: string;
  name: string;
  slug: string;
  description: string;
  ticketCounts: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
  memberCount: number;
  createdBy: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface RecentTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  reporter: {
    id: string;
    name: string;
    surname: string;
  };
  assignee?: {
    id: string;
    name: string;
    surname: string;
  };
}
