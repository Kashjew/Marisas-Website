import { initGoogleAnalytics } from './googleAnalytics.js';

export function initCookieBanner() {
  const banner = document.getElementById('cookieConsentBanner');
  const acceptBtn = document.getElementById('acceptCookies');
  const declineBtn = document.getElementById('declineCookies');

  if (!banner || !acceptBtn || !declineBtn) {
    console.error("Cookie consent banner or buttons not found in the DOM.");
    return;
  }

  // Check if consent has already been given
  const consent = localStorage.getItem('cookieConsent');
  if (consent) {
    console.log(`User has already given consent: ${consent}`);
    banner.style.display = 'none'; // Hide the banner if consent is already set
    applyConsentSettings(consent === 'accepted'); // Apply settings based on saved consent
    if (consent === 'accepted') {
      initGoogleAnalytics(); // Initialize Google Analytics if consent is granted
    }
    return;
  }

  // Show the banner if no consent is found
  banner.style.display = 'block';

  // Handle "Accept" button click
  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.style.display = 'none';
    applyConsentSettings(true);
    initGoogleAnalytics(); // Initialize Google Analytics upon consent
    console.log("User accepted cookies.");
  });

  // Handle "Decline" button click
  declineBtn.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    banner.style.display = 'none';
    applyConsentSettings(false);
    console.log("User declined cookies.");
  });

  function applyConsentSettings(consent) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': consent ? 'granted' : 'denied',
        'analytics_storage': consent ? 'granted' : 'denied',
      });
      console.log(`Consent settings updated: ${consent ? 'granted' : 'denied'}`);
    } else {
      console.warn('Google Analytics not initialized yet. Retrying...');
      // Retry updating consent settings once gtag is ready
      waitForGtag(() => {
        applyConsentSettings(consent);
      });
    }
  }

  function waitForGtag(callback, interval = 100, maxAttempts = 50) {
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (typeof window.gtag === 'function' || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (typeof window.gtag === 'function') {
          callback();
        } else {
          console.error("Failed to initialize Google Analytics after multiple attempts.");
        }
      }
      attempts++;
    }, interval);
  }
}
