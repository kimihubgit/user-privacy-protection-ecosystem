import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Globe, Phone, Mail, Shield, Lock, Key, CheckCircle, Fingerprint, Terminal, ShieldAlert, Cpu, Database, File, Unlock, Bug, Server, Search, Clipboard, X } from 'lucide-react';
import './Checker.css';
import { api } from '../../../lib/api';


const ROTATING_PHRASES = [
  {
    prefix: "truy cập ",
    highlight: "website an toàn?",
    color: "#23b56c",
    glowColor: "rgba(35, 181, 108, 0.35)"
  },
  {
    prefix: "an toàn khi ",
    highlight: "truy cập internet?",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.35)"
  },
  {
    prefix: "nghi ngờ ",
    highlight: "scam hay lừa đảo?",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.35)"
  },
  {
    prefix: "nhận ",
    highlight: "thông báo lạ?",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.35)"
  },
  {
    prefix: "bị làm phiền bởi ",
    highlight: "cuộc gọi lạ?",
    color: "#ef4444",
    glowColor: "rgba(245, 158, 11, 0.35)"
  }
];

const SAMPLES = {
  website: ['chongluadao.vn', 'vietcombank-otp-verify.com', 'shopee-khuyenmai-hot.top'],
  ip: ['8.8.8.8', '103.200.23.4', '1.1.1.1'],
  phone: ['0901234567', '0398765432', '+84912345678'],
  email: ['nhanqua-shopee@gmail.com', 'vietcombank-support@hotmail.com']
};

export default function Checker({ addToast }) {
  const navigate = useNavigate();
  const [checkType, setCheckType] = useState('website'); // 'website', 'phone', 'email'
  const [inputValue, setInputValue] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [animClass, setAnimClass] = useState('word-slide-in');
  const sideTextRef = useRef(null);
  const containerRef = useRef(null);

  const [searchResults, setSearchResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);

  const isScanning = false;
  const scanProgress = 0;
  const scanStepIndex = 0;
  const scanResult = null;
  const setScanResult = () => {};
  const scanSteps = [
    "Đang kết nối cổng giám sát trung tâm...",
    "Đang quét heuristic AI nhận diện giả mạo...",
    "Đang kiểm tra cơ sở dữ liệu danh sách chặn..."
  ];

  useEffect(() => {
    if (!inputValue.trim()) {
      const resetTimer = setTimeout(() => {
        setSearchResults([]);
        setShowAllResults(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const query = inputValue.trim();

    const fetchSuggestions = async () => {
      const data = await api.getSuggestions(query);
      if (data && data.suggestions) {
        const mappedResults = data.suggestions.map((s, idx) => ({
          id: `suggest-${idx}-${Date.now()}`,
          target: s.text.replace(/\s*\(SĐT lừa đảo\)\s*$/, ''), // clean suggestion tag for detail search
          desc: s.label || s.text,
          status: s.category === 'scam' || s.category === 'phishing' ? 'malicious' : 'safe',
          type: s.type // 'phone', 'bank_account', 'url', 'email'
        }));
        setSearchResults(mappedResults);
      } else {
        setSearchResults([]);
      }
    };

    // Simple debounce to optimize typing performance
    const delayDebounce = setTimeout(fetchSuggestions, 200);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  const handleSelectItem = (item) => {
    navigate(`/detail/${encodeURIComponent(item.target)}`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    navigate(`/detail/${encodeURIComponent(inputValue.trim())}`);
  };


  useEffect(() => {
    const sideText = sideTextRef.current;
    const handleScroll = () => {
      if (sideText) {
        sideText.style.transform = `translateY(-50%) rotate(-90deg) translateX(${-window.scrollY * 0.35}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass('word-slide-out');
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setAnimClass('word-slide-in');
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      // Mouse coordinate relative to the center of the container
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Normalize coordinates to a range of -1 to 1
      const normX = x / (rect.width / 2);
      const normY = y / (rect.height / 2);

      container.style.setProperty('--mouse-x', normX.toFixed(3));
      container.style.setProperty('--mouse-y', normY.toFixed(3));
    };

    const handleMouseLeave = () => {
      // Smoothly snap back to origin
      container.style.setProperty('--mouse-x', '0');
      container.style.setProperty('--mouse-y', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSelectInputValue = (val) => {
    setInputValue(val);
    setScanResult(null);

    const cleanVal = val.trim();
    if (cleanVal) {
      if (cleanVal.includes('@')) {
        setCheckType('email');
      } else {
        const isNumeric = /^[+]?[0-9\s.-]*$/.test(cleanVal) && /[0-9]/.test(cleanVal);
        if (isNumeric) {
          setCheckType('phone');
        } else {
          setCheckType('website');
        }
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleSelectInputValue(text);
      if (addToast) {
        addToast('Đã dán nội dung từ clipboard!', 'success');
      }
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
      if (addToast) {
        addToast('Không thể tự động đọc clipboard. Hãy nhấn Ctrl+V để dán.', 'warning');
      }
    }
  };

  const currentPhrase = ROTATING_PHRASES[phraseIndex];

  return (
    <div ref={containerRef} className="checker-page-container">
      {/* Scroll-bound Vertical Side Text */}
      <div
        ref={sideTextRef}
        className="vertical-side-text"
        style={{
          transform: 'translateY(-50%) rotate(-90deg) translateX(0px)'
        }}
      >
        • CHONGLUADAO VIETNAM • CYBER SECURITY WARNING • AN TOAN TREN KHONG GIAN MẠNG • CANH BAO SCAM NGUY HIEM • STAY SAFE ONLINE • DONG HANH CUNG CONG DONG • CHONGLUADAO VIETNAM • CYBER SECURITY WARNING • AN TOAN TREN KHONG GIAN MẠNG • CANH BAO SCAM NGUY HIEM • STAY SAFE ONLINE
      </div>
      {/* Decorative Cyber Background Waves & Grids */}
      <div className="cyber-bg-decorations">
        <svg className="cyber-wave-svg" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 C300,50 500,450 900,250 C1200,100 1300,400 1600,300" stroke="rgba(35, 181, 108, 0.08)" strokeWidth="3" fill="none" />
          <path d="M-50,250 C350,150 450,350 850,300 C1150,250 1350,300 1550,200" stroke="rgba(0, 180, 216, 0.06)" strokeWidth="2" fill="none" />
          <path d="M0,320 C400,250 600,150 1000,350 C1250,450 1300,200 1500,150" stroke="rgba(35, 181, 108, 0.04)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
        </svg>

        {/* Pulsing Radial Orbs */}
        <div className="orb orb-green"></div>
        <div className="orb orb-blue"></div>

        {/* Floating Security Icons */}
        <div className="floating-icon icon-shield">
          <Shield size={32} />
        </div>
        <div className="floating-icon icon-lock">
          <Lock size={26} />
        </div>
        <div className="floating-icon icon-key">
          <Key size={24} />
        </div>
        <div className="floating-icon icon-check">
          <CheckCircle size={28} />
        </div>
        <div className="floating-icon icon-fingerprint">
          <Fingerprint size={30} />
        </div>
        <div className="floating-icon icon-terminal">
          <Terminal size={22} />
        </div>
        <div className="floating-icon icon-shieldalert">
          <ShieldAlert size={28} />
        </div>
        <div className="floating-icon icon-globe-float">
          <Globe size={24} />
        </div>
        <div className="floating-icon icon-cpu">
          <Cpu size={26} />
        </div>
        <div className="floating-icon icon-database">
          <Database size={24} />
        </div>
        <div className="floating-icon icon-file">
          <File size={28} />
        </div>
        <div className="floating-icon icon-unlock">
          <Unlock size={22} />
        </div>
        <div className="floating-icon icon-bug">
          <Bug size={24} />
        </div>
        <div className="floating-icon icon-server">
          <Server size={26} />
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <section className="hero-sec" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '520px', paddingTop: '3.5rem' }}>

          {/* Uppercase Centered Header matching image */}
          <h1 className="hero-title">
            Bạn có đang<br />
            <span className={`hero-dynamic-text-container ${animClass}`}>
              {currentPhrase.prefix}
              <span
                className="hero-dynamic-highlight"
                style={{
                  color: currentPhrase.color,
                  textShadow: `0 0 20px ${currentPhrase.glowColor}`
                }}
              >
                {currentPhrase.highlight}
              </span>
            </span>
          </h1>

          <div className="search-wrapper" style={{ width: '100%', maxWidth: '640px' }}>
            {/* Curved Pointing Arrows */}
            <div className="pointing-arrow arrow-left">
              <svg viewBox="0 0 120 80" className="pointing-arrow-svg">
                <path
                  className="dashed-line"
                  d="M 15,10 C 65,-15 35,80 105,60"
                  fill="none"
                  stroke="#23b56c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  className="arrowhead"
                  d="M 92,54 L 105,60 L 98,71"
                  fill="none"
                  stroke="#23b56c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="arrow-label">Tra cứu tại đây!</span>
            </div>

            <div className="pointing-arrow arrow-right">
              <svg viewBox="0 0 120 80" className="pointing-arrow-svg">
                <path
                  className="dashed-line"
                  d="M 105,10 C 55,-15 85,80 15,60"
                  fill="none"
                  stroke="#23b56c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  className="arrowhead"
                  d="M 28,54 L 15,60 L 22,71"
                  fill="none"
                  stroke="#23b56c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="arrow-label">An toàn 100%</span>
            </div>

            {/* Centered Lookup Input */}
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <Search className="search-left-icon" size={20} />
              <input
                type="text"
                className="search-input"
                value={inputValue}
                onChange={(e) => handleSelectInputValue(e.target.value)}
                placeholder="Nhập Số tài khoản, SĐT hoặc Link..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {inputValue ? (
                <button type="button" className="search-paste-btn" onClick={() => handleSelectInputValue('')} title="Xóa nội dung">
                  <X size={16} />
                </button>
              ) : (
                <button type="button" className="search-paste-btn" onClick={handlePaste} title="Dán từ Clipboard">
                  <Clipboard size={16} />
                </button>
              )}
              <button type="submit" className="search-submit-btn">
                TRA CỨU
              </button>
            </form>

            {/* Dữ liệu mẫu (Sample data helper) */}
            <div className="search-samples-container">
              <span className="samples-title">Ví dụ mẫu:</span>
              <div className="samples-list">
                {SAMPLES[checkType]?.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sample-item-btn"
                    onClick={() => handleSelectInputValue(sample)}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Bảng kết quả tìm kiếm liên quan */}
            {inputValue.trim() !== '' && !isScanning && !scanResult && (
              <div className="search-results-list-container glass-card">
                <div className="results-list-header">
                  <h4 className="results-list-title">Kết quả liên quan ({searchResults.length})</h4>
                </div>
                {searchResults.length > 0 ? (
                  <>
                    <div className="results-items-list">
                      {(showAllResults ? searchResults : searchResults.slice(0, 3)).map((item) => (
                        <div key={item.id} className="results-item">
                          <div className="results-item-left">
                            <span className={`results-item-status-dot ${item.status || 'malicious'}`}></span>
                            <div className="results-item-info">
                              <span className="results-item-target">{item.target}</span>
                              <span className="results-item-desc">{item.desc}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="results-item-action-btn"
                            onClick={() => handleSelectItem(item)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-quick-results">
                    Không tìm thấy dữ liệu trùng khớp nhanh cho "<b style={{ color: '#23b56c' }}>{inputValue}</b>".
                    Bạn vẫn có thể bấm nút <b>TRA CỨU</b> để phân tích sâu hơn.
                  </div>
                )}
              </div>
            )}

            {/* Scanner Simulation */}
            {isScanning && (
              <div className="scanner-container glass-card" style={{ background: '#fff', borderRadius: '16px', padding: '2rem', marginTop: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="scan-progress">
                  <div className="scan-progress-bar" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <div className="scan-steps">
                  {scanSteps.map((step, idx) => {
                    let className = "scan-step-item";
                    if (idx < scanStepIndex) className += " completed";
                    else if (idx === scanStepIndex) className += " active";

                    return (
                      <div key={idx} className={className}>
                        {idx < scanStepIndex ? (
                          <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        ) : idx === scanStepIndex ? (
                          <div className="spinner" style={{ color: 'var(--secondary)', flexShrink: 0 }}></div>
                        ) : (
                          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.15)', borderRadius: '50%', flexShrink: 0 }}></div>
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scan Result Card */}
            {!isScanning && scanResult && (
              <div className="result-container" style={{ marginTop: '1.5rem' }}>
                <div className="result-card" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className={`result-header ${scanResult.status || 'malicious'}`} style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span className={`result-badge ${scanResult.status || 'malicious'}`}>
                        {scanResult.status === 'safe' ? 'An toàn' : scanResult.status === 'suspicious' ? 'Nghi ngờ' : 'Nguy hiểm'}
                      </span>
                      <span className="result-target" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{scanResult.target}</span>
                    </div>
                  </div>
                  <div className="result-body" style={{ padding: '1.5rem', background: '#fff' }}>
                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                      {scanResult.desc}
                    </p>
                    <div className="result-meta-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="meta-item" style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <span className="meta-label" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PHÂN LOẠI</span>
                        <span className="meta-val" style={{ color: '#0f172a', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                          {checkType === 'website' && 'Liên kết Web'}
                          {checkType === 'ip' && 'Địa chỉ IP'}
                          {checkType === 'phone' && 'Số điện thoại'}
                          {checkType === 'email' && 'Địa chỉ Email'}
                        </span>
                      </div>
                      <div className="meta-item" style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <span className="meta-label" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>ĐỘ TIN CẬY</span>
                        <span className="meta-val" style={{ color: scanResult.status === 'safe' ? '#10b981' : scanResult.status === 'suspicious' ? '#f59e0b' : '#ef4444', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                          {scanResult.status === 'safe' ? 'Tin cậy (100%)' : scanResult.status === 'suspicious' ? 'Trung bình' : 'Rất thấp (0%)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Checker Options Panel */}
            <div className="checker-options-panel">
              {/* Left Section: Kiểm tra lừa đảo */}
              <div className="checker-options-section">
                <span className="checker-options-label">Kiểm tra lừa đảo</span>
                <div className="checker-options-buttons">
                  <button
                    type="button"
                    className={`checker-pill-btn ${checkType === 'website' ? 'active' : ''}`}
                    onClick={() => setCheckType('website')}
                  >
                    <Link2 size={14} />
                    <span>Liên kết</span>
                  </button>
                  <button
                    type="button"
                    className={`checker-pill-btn ${checkType === 'phone' ? 'active' : ''}`}
                    onClick={() => setCheckType('phone')}
                  >
                    <Phone size={14} />
                    <span>SĐT</span>
                  </button>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="checker-panel-divider"></div>

              {/* Right Section: Kiểm tra lộ lọt dữ liệu */}
              <div className="checker-options-section">
                <span className="checker-options-label">Kiểm tra lộ lọt dữ liệu</span>
                <div className="checker-options-buttons">
                  <button
                    type="button"
                    className={`checker-pill-btn ${checkType === 'email' ? 'active' : ''}`}
                    onClick={() => setCheckType('email')}
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
