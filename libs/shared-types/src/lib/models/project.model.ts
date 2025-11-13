import { ProjectStatus } from '../enums';

export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// Project with creator info for frontend
export interface ProjectWithCreator extends Project {
  creator?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
}

// Project summary for lists
export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  createdAt: Date;
  ticketCount?: number;
  memberCount?: number;
}
