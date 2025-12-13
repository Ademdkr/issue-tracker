// Angular Modules
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Modules
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

import { ProjectsService } from 'apps/frontend/src/app/core/services/projects.service';
import { ProjectMemberWithUser, User } from '@issue-tracker/shared-types';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-members-table',
  imports: [CommonModule, MatTableModule, MatCheckboxModule],
  templateUrl: './members-table.html',
  styleUrl: './members-table.scss',
})
export class MembersTable implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() type: 'available' | 'members' = 'members';
  @Output() selectionChange = new EventEmitter<User[]>();

  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);

  displayedColumns: string[] = ['select', 'name', 'email', 'role'];

  constructor(private projectsService: ProjectsService) {
    // Setup custom filter predicate
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.name.toLowerCase().includes(searchStr) ||
        data.surname.toLowerCase().includes(searchStr) ||
        data.email.toLowerCase().includes(searchStr) ||
        data.role.toLowerCase().includes(searchStr)
      );
    };
  }

  ngOnInit(): void {
    this.loadData();

    // Emit selection changes
    this.selection.changed.subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['projectId'] && !changes['projectId'].firstChange) ||
      (changes['type'] && !changes['type'].firstChange)
    ) {
      this.loadData();
      this.selection.clear();
    }
  }

  loadData(): void {
    if (!this.projectId) {
      return;
    }

    if (this.type === 'members') {
      // Lade Projektmitglieder und extrahiere User-Objekte
      this.projectsService
        .findProjectMembers(this.projectId)
        .pipe(
          map(
            (members) =>
              members
                .map((m) => m.user)
                .filter((u) => u !== undefined) as User[]
          )
        )
        .subscribe((users) => {
          this.dataSource.data = users;
        });
    } else {
      // Lade verfügbare User
      this.projectsService
        .findAvailableUsers(this.projectId)
        .subscribe((users) => {
          this.dataSource.data = users as User[];
        });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /** Clear selection */
  clearSelection(): void {
    this.selection.clear();
  }

  /** Apply filter to table */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
