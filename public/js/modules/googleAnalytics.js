// googleAnalytics.js
export function initGoogleAnalytics(callback) {
  const script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-40S1WGF525";
  script.async = true;

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-40S1WGF525');

    console.log("Google Analytics initialized.");
    if (callback) callback(); // Notify that gtag is ready
  };

  script.onerror = () => {
    console.error("Failed to load Google Analytics.");
  };

  document.head.appendChild(script);
}

export function initCookieBanner() {
  const banner = document.getElementById('cookieConsentBanner');
  const acceptBtn = document.getElementById('acceptCookies');
  const declineBtn = document.getElementById('declineCookies');

  if (!banner || !acceptBtn || !declineBtn) {
    console.error("Cookie consent banner or buttons not found in the DOM.");
    return;
  }

  const consent = localStorage.getItem('cookieConsent');
  if (consent) {
    console.log(`User has already given consent: ${consent}`);
    banner.style.display = 'none';
    applyConsentSettings(consent === 'accepted'); // Apply settings based on saved consent
    return;
  }

  banner.style.display = 'block';

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.style.display = 'none';
    applyConsentSettings(true);
    console.log("User accepted cookies.");
  });

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
