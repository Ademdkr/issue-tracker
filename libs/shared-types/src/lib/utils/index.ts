// Slug Generation Utility
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Full Name Generation
export function getFullName(user: { name: string; surname: string }): string {
  return `${user.name} ${user.surname}`.trim();
}

// Date Formatting Utilities
export function formatDate(date: Date | string, locale = 'de-DE'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

export function formatDateTime(date: Date | string, locale = 'de-DE'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

// Priority & Status Utilities
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'low':
      return '#28a745';
    case 'medium':
      return '#ffc107';
    case 'high':
      return '#fd7e14';
    case 'critical':
      return '#dc3545';
    default:
      return '#6c757d';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return '#007bff';
    case 'in_progress':
      return '#ffc107';
    case 'resolved':
      return '#28a745';
    case 'closed':
      return '#6c757d';
    default:
      return '#6c757d';
  }
}

// Validation Utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
}
