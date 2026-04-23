/**
 * LocationService - Handles geolocation functionality
 */

/**
 * Get user's current location with browser geolocation API
 * @returns {Promise<Object>} Location object with coordinates and address info
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    // Request location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Try to get address from reverse geocoding
          const address = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            ...address
          });
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          console.warn('Reverse geocoding failed:', error);
          resolve({
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            address: '',
            city: '',
            state: '',
            country: ''
          });
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Reverse geocode coordinates to get address
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Address components
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgriChain-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    return {
      address: data.display_name || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || '',
      country: data.address?.country || ''
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
};

/**
 * Request location permission without actually getting the location
 * @returns {Promise<string>} Permission state: 'granted', 'denied', or 'prompt'
 */
export const checkLocationPermission = async () => {
  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    }
    // If Permissions API not available, return 'prompt'
    return 'prompt';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return 'prompt';
  }
};

/**
 * Show a custom location permission dialog
 * @param {Function} onAllow - Callback when user allows
 * @param {Function} onDeny - Callback when user denies
 */
export const showLocationDialog = (onAllow, onDeny) => {
  // This will trigger the browser's native location permission dialog
  getUserLocation()
    .then(location => onAllow(location))
    .catch(error => onDeny(error));
};
