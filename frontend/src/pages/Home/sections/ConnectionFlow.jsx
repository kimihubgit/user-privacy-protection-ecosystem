import { useState, useEffect } from 'react';
import './ConnectionFlow.css';

const INTEGRATIONS = [
  {
    id: 'chrome',
    name: 'Chrome / Browsers',
    role: 'Quét tiện ích mở rộng',
    side: 'left',
    icon: (
      <svg viewBox="0 0 48 48" width="24" height="24">
        <defs>
          <linearGradient id="chrome-grad-a" x1="3.2173" y1="15" x2="44.7812" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d93025" />
            <stop offset="1" stopColor="#ea4335" />
          </linearGradient>
          <linearGradient id="chrome-grad-b" x1="20.7219" y1="47.6791" x2="41.5039" y2="11.6837" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fcc934" />
            <stop offset="1" stopColor="#fbbc04" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="12" fill="#fff" />
        <path d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z" fill="url(#chrome-grad-a)" />
        <circle cx="24" cy="24" r="9.5" fill="#1a73e8" />
        <path d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z" fill="url(#chrome-grad-b)" />
        <path d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,0-10.3845,0Z" fill="#34a853" />
      </svg>
    ),
    details: 'Kiểm tra tên miền độc hại trong thời gian thực khi lướt web.'
  },
  {
    id: 'zalo',
    name: 'Zalo Official Account',
    role: 'Tra cứu tin nhắn',
    side: 'left',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.81 1.43 5.3 3.66 6.81l-.96 3.23c-.1.35.25.64.54.49l3.85-1.85C10.12 19.83 11.04 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9z" fill="#ffffff" />
        <text x="12" y="14.8" fontFamily="'Space Grotesk', -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" fill="#0068FF">Z</text>
      </svg>
    ),
    details: 'Tra cứu tài khoản lừa đảo và liên kết đáng ngờ trực tiếp qua Zalo OA.'
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    role: 'Quét nhóm tự động',
    side: 'left',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
        <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.16-.22 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.577.194l-8.536 7.705-.332 4.965c.487 0 .702-.223.974-.488l2.337-2.27 4.861 3.59c.896.494 1.54.24 1.763-.83l3.19-15.03c.327-1.31-.5-1.9-1.353-1.526z" />
      </svg>
    ),
    details: 'Tự động kiểm duyệt, quét link spam và mã độc trong nhóm chat Telegram.'
  },
  {
    id: 'discord',
    name: 'Discord Bot Security',
    role: 'Bảo vệ máy chủ',
    side: 'right',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
      </svg>
    ),
    details: 'Quét liên kết lừa đảo an toàn, phân tích tệp đính kèm chứa mã độc trên Discord.'
  },
  {
    id: 'messenger',
    name: 'Messenger Security',
    role: 'Tư vấn chatbot',
    side: 'right',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.5 3.03 7.37.16.16.25.38.23.6l-.16 2.45c-.04.6.53 1.07 1.09.84l2.76-1.15c.18-.08.38-.08.56-.02A9.9 9.9 0 0 0 12 21.4c5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.2 12.35l-2.42-2.58-4.73 2.58 5.2-5.53 2.43 2.58 4.72-2.58-5.2 5.53z" />
      </svg>
    ),
    details: 'Trò chuyện trực tiếp cùng trợ lý AI để phân tích mã độc và báo cáo giả mạo.'
  },
  {
    id: 'api',
    name: 'Public API System',
    role: 'Tích hợp Nhà phát triển',
    side: 'right',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    details: 'Kết nối ứng dụng của bạn với cơ sở dữ liệu danh sách đen uy tín nhất Việt Nam.'
  }
];

export default function ConnectionFlow({ addToast }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pulses, setPulses] = useState([]);

  // Helper to resolve coordinates for laser pulses dynamically
  const getPathD = (channelId) => {
    switch (channelId) {
      case 'chrome': return 'M 240 80 C 320 80, 340 200, 380 200 L 440 200';
      case 'zalo': return 'M 240 200 L 440 200';
      case 'telegram': return 'M 240 320 C 320 320, 340 200, 380 200 L 440 200';
      case 'discord': return 'M 560 200 L 620 200 C 660 200, 680 80, 760 80';
      case 'messenger': return 'M 560 200 L 760 200';
      case 'api': return 'M 560 200 L 620 200 C 660 200, 680 320, 760 320';
      default: return '';
    }
  };

  // Helper to classify if a path is straight or curved for custom keyframe timings
  const getPulseTypeClass = (channelId) => {
    if (channelId === 'zalo' || channelId === 'messenger') {
      return 'straight-path';
    }
    return 'curved-path';
  };

  // Periodically spawn random laser pulses to simulate organic traffic
  useEffect(() => {
    const channels = [
      { id: 'chrome', side: 'left' },
      { id: 'zalo', side: 'left' },
      { id: 'telegram', side: 'left' },
      { id: 'discord', side: 'right' },
      { id: 'messenger', side: 'right' },
      { id: 'api', side: 'right' }
    ];

    const spawnRandomPulse = () => {
      // Pick 1 or 2 random channels to transmit
      const count = Math.random() < 0.5 ? 1 : 2;
      const shuffled = [...channels].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      selected.forEach(ch => {
        const pulseId = `${ch.id}-${Date.now()}-${Math.random()}`;
        const newPulse = {
          id: pulseId,
          channel: ch.id,
          side: ch.side,
          speedClass: 'normal'
        };

        setPulses(prev => [...prev, newPulse]);

        // Clean up pulse after it completes its 3.5s normal traversal
        setTimeout(() => {
          setPulses(prev => prev.filter(p => p.id !== pulseId));
        }, 3700);
      });
    };

    spawnRandomPulse();
    const interval = setInterval(spawnRandomPulse, 6000); // Spawn every 6 seconds
    return () => clearInterval(interval);
  }, []);

  // When a card is hovered, shoot pulses in rapid succession
  useEffect(() => {
    if (!hoveredNode) return;

    const node = INTEGRATIONS.find(item => item.id === hoveredNode);
    if (!node) return;

    const spawnHoverPulse = () => {
      const pulseId = `${node.id}-hover-${Date.now()}-${Math.random()}`;
      const newPulse = {
        id: pulseId,
        channel: node.id,
        side: node.side,
        speedClass: 'fast'
      };

      setPulses(prev => [...prev, newPulse]);

      // Clean up after its 1.8s traversal
      setTimeout(() => {
        setPulses(prev => prev.filter(p => p.id !== pulseId));
      }, 2000);
    };

    // Spawn first pulse immediately
    spawnHoverPulse();

    // Repeat every 0.7 seconds for a rapid laser flow effect
    const interval = setInterval(spawnHoverPulse, 700);
    return () => clearInterval(interval);
  }, [hoveredNode]);

  const handleNodeClick = (node) => {
    if (addToast) {
      addToast(`Kết nối thông suốt: Hệ thống bảo mật đang giám sát ${node.name}`, 'success');
    }
  };



  return (
    <section className="connection-flow-section">
      <div className="container">

        {/* Section Header */}
        <div className="flow-header">
          <span className="flow-badge">Tích hợp thông minh</span>
          <h2 className="flow-title">Bảo vệ toàn diện trên mọi nền tảng</h2>
          <p className="flow-subtitle">
            Cơ sở dữ liệu danh sách đen của chúng tôi được đồng bộ tức thời qua luồng API bảo mật đến mọi nền tảng internet của bạn.
          </p>
        </div>

        {/* Interactive Diagram Canvas */}
        <div className="flow-diagram-container">

          {/* Sources and Destinations column tags */}
          {/* <div className="column-header-tag tag-sources">Sources</div>
          <div className="column-header-tag tag-destinations">Destinations</div> */}

          {/* SVG Connector Lines - Configured as a merging tube */}
          <svg className="flow-svg-canvas" viewBox="0 0 1000 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="activeGradLeft" x1="240" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(35, 181, 108, 0.05)" />
                <stop offset="100%" stopColor="rgba(35, 181, 108, 0.35)" />
              </linearGradient>
              <linearGradient id="activeGradRight" x1="560" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(0, 180, 216, 0.05)" />
                <stop offset="100%" stopColor="rgba(0, 180, 216, 0.35)" />
              </linearGradient>
            </defs>

            {/* Left side connections */}
            {/* Path L1 (Chrome) */}
            <path className="flow-tube-bg" d="M 240 80 C 320 80, 340 200, 380 200 L 440 200" />

            {/* Path L2 (Zalo) */}
            <path className="flow-tube-bg" d="M 240 200 L 440 200" />

            {/* Path L3 (Telegram) */}
            <path className="flow-tube-bg" d="M 240 320 C 320 320, 340 200, 380 200 L 440 200" />

            {/* Right side connections */}
            {/* Path R1 (Discord) */}
            <path className="flow-tube-bg" d="M 560 200 L 620 200 C 660 200, 680 80, 760 80" />

            {/* Path R2 (Messenger) */}
            <path className="flow-tube-bg" d="M 560 200 L 760 200" />

            {/* Path R3 (API) */}
            <path className="flow-tube-bg" d="M 560 200 L 620 200 C 660 200, 680 320, 760 320" />

            {/* Dynamic active laser pulses */}
            {pulses.map(pulse => {
              const pathD = getPathD(pulse.channel);
              const colorGrad = pulse.side === 'left' ? 'url(#activeGradLeft)' : 'url(#activeGradRight)';
              const typeClass = getPulseTypeClass(pulse.channel);
              return (
                <path
                  key={pulse.id}
                  className={`flow-pulse-line ${typeClass} ${pulse.speedClass}`}
                  d={pathD}
                  stroke={colorGrad}
                />
              );
            })}
          </svg>

          {/* Floating Decorator Cards along the paths */}
          <div className="flow-path-decorator left-top-decorator">
            <span className="dot dot-red"></span>
            <span className="dot dot-green"></span>
            <span className="dot dot-blue"></span>
          </div>

          <div className="flow-path-decorator left-bottom-decorator">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </svg>
          </div>

          <div className="flow-path-decorator right-mid-decorator">
            <span className="font-text">Aa</span>
            <span className="font-text font-small">Aa</span>
          </div>

          {/* Left Integration Nodes */}
          <div className="flow-nodes-column column-left">
            {INTEGRATIONS.filter(item => item.side === 'left').map(node => (
              <div
                key={node.id}
                className={`flow-node-card card-${node.id} ${hoveredNode === node.id ? 'node-highlight' : ''}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                <div className="node-icon-wrapper">{node.icon}</div>
                <div className="node-info-text">
                  <h4>{node.name}</h4>
                  <span>{node.role}</span>
                </div>

                {/* Node Tooltip Detail */}
                <div className="node-detail-popover">
                  <p>{node.details}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Center Hub Core */}
          <div className="flow-hub-core">
            <div className="hub-pulse-ring ring-1"></div>
            <div className="hub-pulse-ring ring-2"></div>
            <div className="hub-pulse-ring ring-3"></div>

            <div className="hub-center-badge">
              <div className="hub-inner-hexagon">
                <svg viewBox="0 0 100 100" className="hub-hexagon-svg">
                  <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="none" stroke="#23b56c" strokeWidth="3" />
                  {/* Glowing core symbol matching 3D visual */}
                  <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="rgba(35, 181, 108, 0.15)" stroke="#00b4d8" strokeWidth="2" className="rotating-hexa" />

                  {/* Central Star representation */}
                  <path
                    d="M 50,32 L 54,44 L 66,44 L 56,51 L 60,63 L 50,55 L 40,63 L 44,51 L 34,44 L 46,44 Z"
                    fill="#23b56c"
                    className="core-star-glow"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Integration Nodes */}
          <div className="flow-nodes-column column-right">
            {INTEGRATIONS.filter(item => item.side === 'right').map(node => (
              <div
                key={node.id}
                className={`flow-node-card card-${node.id} ${hoveredNode === node.id ? 'node-highlight' : ''}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                <div className="node-icon-wrapper">{node.icon}</div>
                <div className="node-info-text">
                  <h4>{node.name}</h4>
                  <span>{node.role}</span>
                </div>

                {/* Node Tooltip Detail */}
                <div className="node-detail-popover">
                  <p>{node.details}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Product Hunt Badge & Stats */}
        <div className="flow-footer-badges">
          <a
            href="https://www.producthunt.com"
            target="_blank"
            rel="noreferrer"
            className="product-hunt-pill"
          >
            <div className="ph-badge-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#ff6154">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 12.5H9.5V8.5H13c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="ph-badge-text">
              <span className="ph-title">Product Hunt</span>
              <span className="ph-award">#2 Product of the Day</span>
            </div>
          </a>
        </div>

      </div>
    </section>
  );
}
