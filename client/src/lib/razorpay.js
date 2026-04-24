/**
 * Razorpay SDK Loader Utility
 * Ensures the script is only loaded once and provides a promise-based interface.
 */

let scriptLoadingPromise = null;

export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      scriptLoadingPromise = null; // Allow retrying if it failed
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
};
