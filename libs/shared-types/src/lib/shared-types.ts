// Legacy file - All types have been moved to structured modules
// This file is kept for backward compatibility

// Re-export commonly used types
export type { Project, ProjectWithCreator } from './models/project.model';
export type { CreateProjectDto, UpdateProjectDto } from './dtos/project.dto';
export { ProjectStatus } from './enums/project.enums';

// Utility function type for slug generation (legacy)
export type SlugGenerator = (name: string) => string;
