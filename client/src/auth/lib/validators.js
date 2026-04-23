// Phone validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

// Aadhaar validation
export const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

// Basic password validation
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    error: password.length < 6 ? "Password must be at least 6 characters" : ""
  };
};
