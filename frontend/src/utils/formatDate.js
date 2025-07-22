export function formatDate(date, format) {
    // Set the default format if none is provided.
    format = format || "DD-MM-YYYY";
  
    // Create a new Date object from the given date.
    const dateObj = new Date(date);

  
    // Pad the day, month, and year with zeroes if necessary.
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear().toString();
  
    // Replace the placeholder strings in the format string with the actual values.
    return format
      .replace(/YYYY/, year)
      .replace(/MM/, month)
      .replace(/DD/, day);
  }

