import { Component, Input } from '@angular/core';

import { ManageMembers } from '../manage-members/manage-members';
import { ManageLabels } from '../manage-labels/manage-labels';

@Component({
  selector: 'app-management-tab',
  imports: [ManageMembers, ManageLabels],
  templateUrl: './management-tab.html',
  styleUrl: './management-tab.scss',
})
export class ManagementTab {
  @Input() projectId!: string;
}
