/**
 * Safely formats a date string or Date object for display in tables (e.g., "January 15, 2024").
 * This function is timezone-safe and works by extracting UTC date parts to avoid "off-by-one-day" errors.
 * @param date - The date to format.
 * @returns The formatted date string or 'N/A' if the input is invalid.
 */
export const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        // By using UTC methods, we ignore the local timezone offset which causes the date to shift.
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth(); // 0-11
        const day = d.getUTCDate();
        
        // Create a new date object using the extracted UTC parts.
        // This effectively treats the UTC date as a local date for formatting.
        const localDate = new Date(year, month, day);

        return localDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.error("Failed to format date for display:", e);
        return 'Invalid Date';
    }
};

export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
};

/**
 * Safely converts a Date object or a date string into 'YYYY-MM-DD' format for HTML date inputs.
 * This function is timezone-safe and works by extracting UTC date parts.
 * @param date - The date to format.
 * @returns The formatted date string or an empty string if the input is invalid.
 */
export const toInputDateString = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    try {
        const dateObj = new Date(date);
        // Using UTC methods ensures we get the correct date parts regardless of the user's timezone.
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth is 0-indexed
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Failed to format date for input:", e);
        return '';
    }
};


export const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value).replace(/"/g, '""');
                } else {
                    value = String(value).replace(/"/g, '""');
                }
                return `"${value}"`;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const copyToClipboard = (text: string): Promise<void> => {
  if (!navigator.clipboard) {
    // Fallback for older browsers or insecure contexts (http)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error('Fallback copy failed'));
    } finally {
      document.body.removeChild(textArea);
    }
  }
  return navigator.clipboard.writeText(text);
};