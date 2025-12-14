import { Component, Input } from '@angular/core';

import { ManageMembers } from './components/manage-members/manage-members';
import { ManageLabels } from './components/manage-labels/manage-labels';

@Component({
  selector: 'app-management-tab',
  imports: [ManageMembers, ManageLabels],
  templateUrl: './management-tab.html',
  styleUrl: './management-tab.scss',
})
export class ManagementTab {
  @Input() projectId!: string;
}
