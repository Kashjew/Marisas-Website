document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('cookieConsentBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
  
    // Check if consent has already been given
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      console.log(`User has already given consent: ${consent}`);
      banner.style.display = 'none'; // Hide the banner if consent is already set
      applyConsentSettings(consent === 'accepted'); // Apply settings based on saved consent
      return; // Exit the function if consent exists
    }
  
    // Show the banner if no consent is found
    banner.style.display = 'block';
  
    // Handle "Accept" button click
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted'); // Save consent as accepted
      banner.style.display = 'none'; // Hide the banner
      applyConsentSettings(true);
    });
  
    // Handle "Decline" button click
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined'); // Save consent as declined
      banner.style.display = 'none'; // Hide the banner
      applyConsentSettings(false);
    });
  
    /**
     * Apply cookie consent settings to Google tags and other trackers.
     * @param {boolean} consent - Whether the user has accepted cookies.
     */
    function applyConsentSettings(consent) {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': consent ? 'granted' : 'denied',
          'analytics_storage': consent ? 'granted' : 'denied',
        });
      } else {
        console.warn('Google Analytics not detected. Make sure gtag is initialized.');
      }
    }
  });
  