// helpers.js - Simple utility functions

// Format phone number (remove non-digits, limit to 10)
export const formatPhone = (phone) => {
  return phone.replace(/\D/g, "").slice(0, 10);
};

// Format Aadhaar number (remove non-digits, limit to 12)
export const formatAadhaar = (aadhaar) => {
  return aadhaar.replace(/\D/g, "").slice(0, 12);
};

// Format Aadhaar for display (with spaces)
export const formatAadhaarDisplay = (aadhaar) => {
  const cleaned = aadhaar.replace(/\D/g, "");
  return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
};

// Format phone for display
export const formatPhoneDisplay = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return cleaned;
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Generate random string for IDs
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Debounce function for API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};
