import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ticket-view-toggle',
  imports: [],
  templateUrl: './ticket-view-toggle.html',
  styleUrl: './ticket-view-toggle.scss',
})
export class TicketViewToggle {
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Output() viewModeChange = new EventEmitter<'list' | 'grid'>();
}
