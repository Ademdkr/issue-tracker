export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface LabelWithProject extends Label {
  project?: {
    name: string;
    slug: string;
  };
}

export interface GroupedLabel {
  name: string;
  color: string;
  ids: string[];
  projectSlugs?: string[];
}
