import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { ErrorService } from '../../core/services/error.service';
import {
  DashboardStats,
  ProjectWithOpenTickets,
  RecentTicket,
} from '@issue-tracker/shared-types';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  displayedColumns: string[] = [
    'project',
    'title',
    'status',
    'priority',
    'assignee',
    'reporter',
    'createdAt',
  ];

  // Pie Chart für Projekte
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3f51b5',
          '#f44336',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#00bcd4',
          '#795548',
          '#607d8b',
          '#e91e63',
          '#cddc39',
        ],
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Projekte nach Ticket-Anzahl',
      },
    },
  };

  // Bar Chart für Tickets
  barChartData: ChartData<'bar'> = {
    labels: ['Offen', 'In Bearbeitung', 'Gelöst', 'Abgeschlossen'],
    datasets: [
      {
        label: 'Anzahl Tickets',
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(63, 81, 181, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(158, 158, 158, 0.8)',
        ],
      },
    ],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tickets nach Status',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts();
        this.cdr.markForCheck();
      },
      error: (error) => {
        inject(ErrorService).handleHttpError(
          error,
          'Fehler beim Laden der Dashboard-Daten'
        );
      },
    });
  }

  private updateCharts(): void {
    if (!this.stats) return;

    // Update Pie Chart - Projekte
    this.pieChartData = {
      labels: this.stats.projectsWithOpenTickets.map((p) => p.name),
      datasets: [
        {
          data: this.stats.projectsWithOpenTickets.map(
            (p) => p.ticketCounts.total
          ),
          backgroundColor: [
            '#3f51b5',
            '#f44336',
            '#4caf50',
            '#ff9800',
            '#9c27b0',
            '#00bcd4',
            '#795548',
            '#607d8b',
            '#e91e63',
            '#cddc39',
          ],
        },
      ],
    };

    // Update Bar Chart - Tickets nach Status
    this.barChartData = {
      labels: ['Offen', 'In Bearbeitung', 'Gelöst', 'Abgeschlossen'],
      datasets: [
        {
          label: 'Anzahl Tickets',
          data: [
            this.stats.ticketCounts.open,
            this.stats.ticketCounts.inProgress,
            this.stats.ticketCounts.resolved,
            this.stats.ticketCounts.closed,
          ],
          backgroundColor: [
            'rgba(63, 81, 181, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(158, 158, 158, 0.8)',
          ],
        },
      ],
    };
  }

  onProjectClick(project: ProjectWithOpenTickets): void {
    this.router.navigate(['/projects', project.slug]);
  }

  onTicketClick(ticket: RecentTicket): void {
    this.router.navigate([
      '/projects',
      ticket.project.slug,
      'tickets',
      ticket.id,
    ]);
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      OPEN: 'primary',
      IN_PROGRESS: 'accent',
      RESOLVED: 'warn',
      CLOSED: '',
    };
    return colorMap[status] || '';
  }

  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      LOW: '',
      MEDIUM: 'primary',
      HIGH: 'accent',
      CRITICAL: 'warn',
    };
    return colorMap[priority] || '';
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      OPEN: 'Offen',
      IN_PROGRESS: 'In Bearbeitung',
      RESOLVED: 'Gelöst',
      CLOSED: 'Abgeschlossen',
    };
    return labelMap[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labelMap: Record<string, string> = {
      LOW: 'Niedrig',
      MEDIUM: 'Mittel',
      HIGH: 'Hoch',
      CRITICAL: 'Kritisch',
    };
    return labelMap[priority] || priority;
  }
}
