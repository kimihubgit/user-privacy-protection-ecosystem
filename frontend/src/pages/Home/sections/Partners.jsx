import { useState, useEffect } from 'react';
import '../../../features/scan/components/Checker.css';

const PARTNERS = [
  {
    name: "NCSC Việt Nam",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <path d="M12 8 L24 13 V22 C24 29 19 33 12 35 C5 33 0 29 0 22 V13 Z" fill="#DA251D" />
        <text x="32" y="24" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">NCSC</text>
        <text x="32" y="33" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="1.2">VIETNAM</text>
      </svg>
    )
  },
  {
    name: "Cục An toàn thông tin",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <circle cx="15" cy="20" r="12" fill="#005A9E" />
        <path d="M11 20 L14 23 L19 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="36" y="23" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="17" fill="#0b1a30" letterSpacing="0.5">AIS</text>
        <text x="36" y="32" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.5">AN TOÀN THÔNG TIN</text>
      </svg>
    )
  },
  {
    name: "Hiệp hội VNISA",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <circle cx="16" cy="20" r="12" fill="none" stroke="#007ACC" strokeWidth="2" />
        <ellipse cx="16" cy="20" rx="5" ry="12" fill="none" stroke="#007ACC" strokeWidth="1.5" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="#007ACC" strokeWidth="1.5" />
        <text x="36" y="23" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">VNISA</text>
        <text x="36" y="32" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.5">HIỆP HỘI AN TOÀN</text>
      </svg>
    )
  },
  {
    name: "shield",
    logo: (
      <svg viewBox="0 0 130 40" width="130" height="40" style={{ display: 'block' }}>
        <path d="M15 6 L30 12 V22 C30 31 24 36 15 38 C6 36 0 31 0 22 V12 Z" fill="#23b56c" />
        <polygon points="15,14 17,19 22.5,19 18,23 20,28.5 15,25 10,28.5 12,23 7.5,19 13,19" fill="#FFFF00" />
        <text x="36" y="21" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="12" fill="#0b1a30">shield</text>
        <text x="36" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.5">shield.VN</text>
      </svg>
    )
  },
  {
    name: "Viettel Cyber Security",
    logo: (
      <svg viewBox="0 0 130 40" width="130" height="40" style={{ display: 'block' }}>
        <path d="M8 8 L24 8 L24 16 L16 24 L8 16 Z" fill="#EE0000" />
        <text x="34" y="20" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="14" fill="#0b1a30">VIETTEL</text>
        <text x="34" y="30" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.8">CYBER SECURITY</text>
      </svg>
    )
  },
  {
    name: "Google Security",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <path d="M18 20c0-4.4 3.6-8 8-8 2.2 0 4.2.9 5.7 2.4l-2.8 2.8C27.9 16.3 27 16 26 16c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.8 0 3-.9 3.5-2.2H26v-3.5h7.3c.1.4.2.8.2 1.3 0 4.4-3.6 8.4-7.5 8.4-4.4 0-8-3.6-8-8z" fill="#4285F4" />
        <text x="42" y="22" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">Google</text>
        <text x="42" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="1">SECURITY</text>
      </svg>
    )
  },
  {
    name: "BKAV Security",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <path d="M15 6 L27 12 V22 C27 29 22 34 15 36 C8 34 3 29 3 22 V12 Z" fill="#E65100" />
        <text x="15" y="24" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="12" fill="#fff" textAnchor="middle">B</text>
        <text x="34" y="22" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">Bkav</text>
        <text x="34" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.8">SECURITY</text>
      </svg>
    )
  },
  {
    name: "CMC Cyber Security",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <path d="M15 8 L27 20 L15 32 L3 20 Z" fill="#0288D1" />
        <text x="34" y="21" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">CMC</text>
        <text x="34" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.5">CYBER SECURITY</text>
      </svg>
    )
  },
  {
    name: "FPT Information System",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <circle cx="15" cy="20" r="10" fill="none" stroke="#F57C00" strokeWidth="2.5" />
        <path d="M15 10 A 10 10 0 0 1 25 20" stroke="#0288D1" strokeWidth="2.5" fill="none" />
        <path d="M15 30 A 10 10 0 0 1 5 20" stroke="#388E3C" strokeWidth="2.5" fill="none" />
        <text x="32" y="22" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">FPT IS</text>
        <text x="32" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.8">SECURITY</text>
      </svg>
    )
  },
  {
    name: "Microsoft Security",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <rect x="2" y="10" width="10" height="10" fill="#F25022" />
        <rect x="14" y="10" width="10" height="10" fill="#7FBA00" />
        <rect x="2" y="22" width="10" height="10" fill="#01A6F0" />
        <rect x="14" y="22" width="10" height="10" fill="#FFB900" />
        <text x="32" y="21" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="12" fill="#0b1a30">Microsoft</text>
        <text x="32" y="30" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.5">SECURITY</text>
      </svg>
    )
  },
  {
    name: "Cloudflare",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <path d="M22 17.5c0-2.5-2-4.5-4.5-4.5H17c-.5-3.3-3.3-5.8-6.8-5.8-2.6 0-4.9 1.4-6 3.6C1.8 11.2 0 13.4 0 16c0 3.3 2.7 6 6 6h11.5c2.5 0 4.5-2 4.5-4.5z" fill="#F38020" />
        <text x="30" y="23" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="14" fill="#0b1a30">Cloudflare</text>
        <text x="30" y="32" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="0.8">SECURITY</text>
      </svg>
    )
  },
  {
    name: "VNG Cloud",
    logo: (
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ display: 'block' }}>
        <rect x="3" y="10" width="22" height="22" rx="4" fill="#00BCD4" />
        <text x="14" y="26" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="16" fill="#fff" textAnchor="middle">V</text>
        <text x="32" y="22" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="15" fill="#0b1a30">VNG</text>
        <text x="32" y="31" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="7" fill="#64748b" letterSpacing="1">SECURITY</text>
      </svg>
    )
  }
];

export default function Partners() {
  const [visiblePartners, setVisiblePartners] = useState(PARTNERS.slice(0, 6));
  const [transitioningSlots, setTransitioningSlots] = useState([false, false, false, false, false, false]);

  useEffect(() => {
    const rotateLogo = () => {
      // Pick a random grid slot index to swap (0 to 5)
      const slotIndex = Math.floor(Math.random() * 6);

      // Identify currently hidden partners from the pool
      const visibleNames = visiblePartners.map(p => p.name);
      const hiddenPartners = PARTNERS.filter(p => !visibleNames.includes(p.name));

      if (hiddenPartners.length === 0) return;

      // Select a random next partner
      const nextPartner = hiddenPartners[Math.floor(Math.random() * hiddenPartners.length)];

      // Trigger fade out transition on the selected slot
      setTransitioningSlots(prev => {
        const next = [...prev];
        next[slotIndex] = true;
        return next;
      });

      // After fade-out duration (400ms), swap partner logo and fade back in
      setTimeout(() => {
        setVisiblePartners(prev => {
          const next = [...prev];
          next[slotIndex] = nextPartner;
          return next;
        });

        // Trigger fade in
        setTransitioningSlots(prev => {
          const next = [...prev];
          next[slotIndex] = false;
          return next;
        });
      }, 400);
    };

    // Cycle one random logo spot every 4 seconds
    const interval = setInterval(rotateLogo, 4000);
    return () => clearInterval(interval);
  }, [visiblePartners]);

  return (
    <section className="partners-global-section">
      <div className="container">

        {/* Left Column: Heading */}
        <div className="partners-left-content">
          <span className="partners-sub-label">Đối tác chiến lược</span>
          <h2 className="partners-main-title">
            Đồng hành bởi các<br />
            <span>Đơn vị An ninh mạng</span>
          </h2>
        </div>

        {/* Right Column: Logo Grid Wrapper */}
        <div className="partners-grid-wrapper">
          <div className="partners-grid">
            {visiblePartners.map((partner, index) => (
              <div
                key={index}
                className={`partner-logo-item ${transitioningSlots[index] ? 'slot-fade' : ''}`}
                title={partner.name}
              >
                {partner.logo}
              </div>
            ))}
          </div>

          {/* Hover Overlay with Central Cooperation CTA Button */}
          <div className="partners-grid-overlay">
            <a
              href="https://shield.vn/lien-he"
              target="_blank"
              rel="noreferrer"
              className="partners-cta-button"
            >
              Hợp tác cùng chúng tôi
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
