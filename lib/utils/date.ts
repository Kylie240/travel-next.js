/**
 * Formats a date string (YYYY-MM-DD) into a readable text format
 * Example: "2025-11-09" -> "November 9, 2025"
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateToText(dateString: string | null | undefined): string {
  if (!dateString || dateString === '') {
    return '';
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format the date as "Month Day, Year"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

