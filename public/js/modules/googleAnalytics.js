// googleAnalytics.js
(function loadGoogleAnalytics() {
    const script = document.createElement('script');
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-40S1WGF525";
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-40S1WGF525');
})();
