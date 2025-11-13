import { Project, ProjectStatus } from './shared-types';

describe('shared-types', () => {
  it('should export Project interface', () => {
    const project: Project = {
      id: 'test-id',
      name: 'Test Project',
      description: 'Test Description',
      slug: 'test-project',
      status: ProjectStatus.OPEN,
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: null,
    };

    expect(project.name).toEqual('Test Project');
    expect(project.status).toEqual(ProjectStatus.OPEN);
  });
});
