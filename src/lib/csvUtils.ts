/**
 * Utility functions for CSV data handling
 */

import type { SurveyResult } from "@/components/admin/ResultsTable";

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
    'Military Status',
    'Years Since Separation',
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
    'VA Experience Description'
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
      Array.isArray(result.demographics?.race) ? result.demographics.race.join('; ') : '',
      result.demographics?.military_status || '',
      result.demographics?.years_since_separation || '',
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
      result.va_benefits?.va_experience || ''
    ].map(sanitizeForCSV);
    
    // Add this row to our rows array
    csvRows.push(row);
  });

  // Join all rows with CRLF line breaks
  return csvRows.map(row => row.join(',')).join('\r\n');
}

/**
 * Trigger CSV download in the browser
 * @param csvContent CSV content string
 * @param fileName Filename for download
 */
export function downloadCSV(csvContent: string, fileName: string = 'survey-results.csv'): void {
  // Add BOM for Excel to recognize UTF-8
  const BOM = "\uFEFF";
  
  // Create blob with CSV content and BOM for proper UTF-8 handling
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  
  // Create object URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Add to document, click to download, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
