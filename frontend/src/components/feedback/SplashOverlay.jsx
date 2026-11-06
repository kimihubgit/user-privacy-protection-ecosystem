import { useState, useEffect } from 'react';
import './SplashOverlay.css';

export default function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(() => {
    const isShown = sessionStorage.getItem('splash_shown');
    return isShown !== 'true';
  });

  useEffect(() => {
    // Check if the splash screen has already been shown in this session
    const isShown = sessionStorage.getItem('splash_shown');
    if (isShown === 'true') {
      return;
    }

    // Keep the overlay active for 1.3 seconds, then start the slide-down animation
    const slideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('splash_shown', 'true');
      
      // Wait for the slide-down CSS transition (800ms) to complete before unmounting
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 800);
      
      return () => clearTimeout(unmountTimer);
    }, 1300);

    return () => clearTimeout(slideTimer);
  }, []);


  if (!shouldRender) return null;

  return (
    <div className={`splash-overlay ${visible ? 'active' : 'slide-down'}`}>
      <div className="splash-logo-container">
        <svg className="splash-svg-logo" viewBox="0 0 64 64" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="splashShieldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
          </defs>

          {/* Green Shield */}
          <path
            d="M32 4 L56 13 V30 C56 48 45 58 32 62 C19 58 8 48 8 30 V13 Z"
            fill="url(#splashShieldGradient)"
          />

          {/* Inner Light Overlay */}
          <path
            d="M32 11 L49 17 V30 C49 43 42 50 32 54 C22 50 15 43 15 30 V17 Z"
            fill="#FFFFFF"
            fillOpacity="0.2"
          />

          {/* Yellow Star */}
          <path
            d="M32 20 L35 27 L43 28 L37 33 L39 41 L32 37 L25 41 L27 33 L21 28 L29 27 Z"
            fill="#FACC15"
          />
        </svg>
      </div>
    </div>
  );
}
