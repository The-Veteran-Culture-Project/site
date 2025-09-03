/**
 * Utility functions for CSV data handling
 */

import type { SurveyResult } from "@/components/admin/ResultsTable";

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  source?: string;
}

/**
 * Convert survey results to CSV format
 * @param results Array of survey result objects
 * @returns CSV formatted string
 */
export function convertResultsToCSV(results: SurveyResult[]): string {
  if (!results || results.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Timestamp',
    'First Name',
    'Last Name',
    'Email',
    'Newsletter Subscription',
    'Story Sharing Permission',
    'Military Score',
    'Civilian Score',
    'Strategy',
    'Age Range',
    'Gender',
    'Gender (Self-described)',
    'Race',
    'Status/Affiliation',
    'Branch',
    'MOS/Rating/AFSC',
    'Combat Experience',
    'Applied for Benefits',
    'Benefits Used',
    'Has Disability Rating',
    'Disability Rating',
    'Comfort Delay',
    'Decision Time',
    'VA Healthcare Impact',
    'VA Experience Description',
    'Support Choice',
    'First Year Help',
    'Cash Benefits Use'
  ];

  // Create array for CSV rows, starting with headers
  const csvRows = [headers];

  // Helper function to sanitize values for CSV
  const sanitizeForCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Convert arrays to semicolon-separated strings
    if (Array.isArray(value)) {
      return '"' + value.join('; ').replace(/"/g, '""') + '"';
    }
    
    // Convert objects and other non-string types to string
    let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Replace any newlines in the text with spaces to avoid breaking CSV format
    str = str.replace(/\r?\n|\r/g, ' ');
    
    // Escape double quotes and wrap in quotes if contains commas, quotes or newlines
    if (str.includes(',') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    
    return str;
  };

  // Add data rows
  results.forEach((result) => {
    const row = [
      result.id,
      new Date(result.created_at).toISOString(),
      result.first_name,
      result.last_name,
      result.email,
      result.subscribe ? 'Yes' : 'No',
      result.story_opt_in ? 'Yes' : 'No',
      result.military_score,
      result.civilian_score,
      result.strategy,
      result.demographics?.age_range || '',
      result.demographics?.gender || '',
      result.demographics?.gender_self_described || '',
      result.demographics?.race || '',
      result.demographics?.status_affiliation || '',
      result.demographics?.branch || '',
      result.demographics?.mos || '',
      result.demographics?.combat || '',
      result.va_benefits?.has_applied || '',
      Array.isArray(result.va_benefits?.benefits_used) ? result.va_benefits.benefits_used.join('; ') : '',
      result.va_benefits?.has_disability_rating || '',
      result.va_benefits?.disability_rating || '',
      result.va_benefits?.comfort_delay || '',
      result.va_benefits?.decision_time || '',
      result.va_benefits?.va_healthcare || '',
      result.va_benefits?.va_experience || '',
      result.va_benefits?.support_choice || '',
      Array.isArray(result.va_benefits?.first_year_help) ? result.va_benefits.first_year_help.join('; ') : '',
      result.va_benefits?.cash_benefits_use || ''
    ].map(sanitizeForCSV);
    
    // Add this row to our rows array
    csvRows.push(row);
  });

  // Join all rows with CRLF line breaks
  return csvRows.map(row => row.join(',')).join('\r\n');
}

/**
 * Convert marketing subscribers to CSV format
 * @param subscribers Array of marketing subscriber objects
 * @returns CSV formatted string
 */
export function convertSubscribersToCSV(subscribers: Subscriber[]): string {
  if (!subscribers || subscribers.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Email',
    'Name',
    'Date Subscribed',
    'Source'
  ];

  // Create array for CSV rows, starting with headers
  const csvRows = [headers];

  // Add each subscriber as a row
  subscribers.forEach(subscriber => {
    const row = [
      subscriber.id,
      subscriber.email,
      subscriber.name || '',
      new Date(subscriber.created_at).toLocaleString(),
      subscriber.source || 'website'
    ];
    
    csvRows.push(row);
  });

  // Convert rows to CSV format
  // For each row, we quote all fields and join with commas
  // Then all rows are joined with line breaks
  return csvRows
    .map(row => row.map(field => 
      `"${String(field).replace(/"/g, '""')}"`
    ).join(','))
    .join('\r\n');
}

/**
 * Download CSV file
 * @param csvContent The CSV content as a string
 * @param filename The filename to download as
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a blob with UTF-8 encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
