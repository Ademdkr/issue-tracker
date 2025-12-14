import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { MembersTable } from './components/members-table/members-table';
import { User } from '@issue-tracker/shared-types';
import { ProjectsService } from 'apps/frontend/src/app/core/services/projects.service';

@Component({
  selector: 'app-manage-members',
  imports: [
    CommonModule,
    MembersTable,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './manage-members.html',
  styleUrl: './manage-members.scss',
})
export class ManageMembers {
  @Input() projectId!: string;

  @ViewChild('availableUsersTable') availableUsersTable!: MembersTable;
  @ViewChild('projectMembersTable') projectMembersTable!: MembersTable;

  selectedAvailableUsers: User[] = [];
  selectedProjectMembers: User[] = [];
  isLoading = false;
  searchQuery = '';

  constructor(private projectsService: ProjectsService) {}

  onAvailableUsersSelectionChange(users: User[]): void {
    this.selectedAvailableUsers = users;
  }

  onProjectMembersSelectionChange(users: User[]): void {
    this.selectedProjectMembers = users;
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (this.availableUsersTable) {
      this.availableUsersTable.applyFilter(value);
    }
    if (this.projectMembersTable) {
      this.projectMembersTable.applyFilter(value);
    }
  }

  async addMembers(): Promise<void> {
    if (this.selectedAvailableUsers.length === 0) return;

    this.isLoading = true;
    try {
      // Füge alle ausgewählten User hinzu
      await Promise.all(
        this.selectedAvailableUsers.map((user) =>
          this.projectsService
            .addProjectMember(this.projectId, user.id)
            .toPromise()
        )
      );

      // Refresh beide Tabellen
      this.availableUsersTable.loadData();
      this.projectMembersTable.loadData();

      // Clear selections
      this.availableUsersTable.clearSelection();
      this.selectedAvailableUsers = [];
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async removeMembers(): Promise<void> {
    if (this.selectedProjectMembers.length === 0) return;

    this.isLoading = true;
    try {
      // Entferne alle ausgewählten User
      await Promise.all(
        this.selectedProjectMembers.map((user) =>
          this.projectsService
            .removeProjectMember(this.projectId, user.id)
            .toPromise()
        )
      );

      // Refresh beide Tabellen
      this.availableUsersTable.loadData();
      this.projectMembersTable.loadData();

      // Clear selections
      this.projectMembersTable.clearSelection();
      this.selectedProjectMembers = [];
    } catch (error) {
      console.error('Error removing members:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
