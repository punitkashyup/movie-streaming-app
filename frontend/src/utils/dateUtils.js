/**
 * Format a date string to a readable date format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date string to a readable date and time format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time string (e.g., "Jan 1, 2023, 12:00 PM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate time remaining from now until a future date
 * @param {string} endDateString - ISO date string for the end date
 * @returns {Object} Object containing days, hours, minutes remaining
 */
export const getTimeRemaining = (endDateString) => {
  if (!endDateString) return { days: 0, hours: 0, minutes: 0 };

  const now = new Date();
  const endDate = new Date(endDateString);

  if (endDate <= now) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const diffMs = endDate - now;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

/**
 * Format a price in Indian Rupees
 * @param {number} price - The price to format
 * @returns {string} Formatted price with Indian Rupee symbol
 */
export const formatIndianRupees = (price) => {
  if (price === undefined || price === null) return '';

  // Format with Indian numbering system (e.g., 1,00,000 instead of 100,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.format(price);
};
