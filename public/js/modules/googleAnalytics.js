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
      if (callback) callback(); // Notify other modules that gtag is ready
    };
  
    script.onerror = () => {
      console.error("Failed to load Google Analytics.");
    };
  
    document.head.appendChild(script);
  }
  