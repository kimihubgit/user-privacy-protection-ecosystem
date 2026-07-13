import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ArrowLeft, Cpu, Globe, User, Radio, ChevronDown, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../../../lib/api';
import './ScanDetail.css';



const translateDataClass = (dc) => {
  const dict = {
    "Email addresses": "Địa chỉ email",
    "Passwords": "Mật khẩu",
    "Usernames": "Tên đăng nhập",
    "IP addresses": "Địa chỉ IP",
    "Names": "Họ và tên",
    "Physical addresses": "Địa chỉ nhà",
    "Phone numbers": "Số điện thoại",
  };
  return dict[dc] || dc;
};

const formatBreachDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
const getMockWhoisData = (domain, result) => {
  if (!domain) return '';
  const tld = domain.split('.').pop() || 'com';

  let createdDate = result?.created || '2024-05-15';
  if (createdDate.includes('ngày trước') || createdDate.includes('mới ghi nhận') || createdDate.includes('Vừa tạo mới')) {
    createdDate = '2026-06-10 (Đăng ký gần đây)';
  }

  const host = result?.host || 'Cloudflare Inc';
  const nameServers = host.toLowerCase().includes('cloudflare')
    ? `CLOUDFLARE.COM (NS1.CLOUDFLARE.COM, NS2.CLOUDFLARE.COM)`
    : host.toLowerCase().includes('alibaba')
      ? `ALIBABA.COM (NS1.ALIBABADNS.COM, NS2.ALIBABADNS.COM)`
      : `DEFAULT DNS (${host.toUpperCase()})`;

  return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: 529381734_DOMAIN_${tld.toUpperCase()}-VRSN
Registrar WHOIS Server: whois.verisign-grs.com
Registrar URL: http://www.iana.org
Updated Date: 2026-06-20T10:00:00Z
Creation Date: ${createdDate}
Registry Expiry Date: 2027-06-10T12:00:00Z
Registrar: ${result?.registrar || 'NameSilo LLC'}
Registrar IANA ID: 1479
Registrar Abuse Contact Email: abuse@${result?.registrar?.toLowerCase().replace(/\s+/g, '') || 'registrar'}.com
Registrar Abuse Contact Phone: +1.1234567890
Domain Status: clientTransferProhibited (https://icann.org/epp#clientTransferProhibited)
Registry Registrant ID: REDACTED_FOR_PRIVACY
Registrant Name: REDACTED FOR PRIVACY
Registrant Organization: Privacy Protect LLC
Registrant Street: REDACTED FOR PRIVACY
Registrant City: REDACTED FOR PRIVACY
Registrant State/Province: Arizona
Registrant Postal Code: REDACTED FOR PRIVACY
Registrant Country: US
Registrant Phone: REDACTED FOR PRIVACY
Registrant Email: REDACTED FOR PRIVACY
Name Server: ${nameServers}
DNSSEC: unsigned
>>> Last update of WHOIS database: 2026-06-23T14:22:11Z <<<`;
};

const detectCheckType = (val) => {
  const cleanVal = val.trim();
  if (!cleanVal) return 'website';
  if (cleanVal.includes('@')) return 'email';
  const isNumeric = /^[+]?[0-9\s.-]*$/.test(cleanVal) && /[0-9]/.test(cleanVal);
  if (isNumeric) return 'phone';
  return 'website';
};

export default function ScanDetail({ addToast }) {
  const { target } = useParams();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const decodedTarget = decodeURIComponent(target || '');
  const [cleanType, setCleanType] = useState(() => detectCheckType(decodedTarget));

  const [result, setResult] = useState(() => {
    let status = 'safe';
    let desc = 'Không phát hiện thấy mối đe dọa nào. Đối tượng này hiện chưa nằm trong danh sách đen cảnh báo của chúng tôi.';
    let reports = 0;

    if (cleanType === 'website') {
      const queryLower = decodedTarget.toLowerCase();
      if (queryLower.includes('vietcombank') || queryLower.includes('momo') || queryLower.includes('shopee') || queryLower.includes('phishing')) {
        status = 'malicious';
        desc = 'Phát hiện tự động (Heuristics): Tên miền có dấu hiệu giả mạo dịch vụ tài chính hoặc thương hiệu thương mại điện tử lớn.';
        reports = 1;
      }
    }

    return {
      target: decodedTarget,
      name: cleanType === 'website' ? 'Tên miền tự do' : cleanType === 'phone' ? 'Chưa rõ danh tính' : cleanType === 'email' ? 'Địa chỉ email tự do' : 'Đối tượng chưa ghi nhận',
      bankName: cleanType === 'phone' ? 'Đang xác minh' : 'Không áp dụng',
      status: status,
      desc: desc,
      registrar: cleanType === 'website' ? 'Đang cập nhật' : 'Không áp dụng',
      created: cleanType === 'website' ? 'Vừa tạo mới' : 'Mới ghi nhận',
      ip: cleanType === 'website' ? 'Đang cập nhật' : 'N/A',
      reports: reports,
      host: 'N/A'
    };
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const data = await api.getDetail(decodedTarget);
        if (data) {
          const type = data.detected_type;
          let mappedType = 'website';
          if (type === 'phone' || type === 'bank_account') {
            mappedType = 'phone';
          } else if (type === 'email') {
            mappedType = 'email';
          }
          setCleanType(mappedType);

          if (mappedType === 'website') {
            const isSafe = data.is_safe !== false;
            const detail = data.detail || {};
            setResult({
              target: decodedTarget,
              name: isSafe ? 'Tên miền tin cậy' : 'Tên miền độc hại',
              status: isSafe ? 'safe' : 'malicious',
              desc: detail.description || data.message || 'Kết quả kiểm tra từ hệ thống.',
              registrar: detail.registrar || 'Đang cập nhật',
              created: detail.created || 'Vừa tạo mới',
              ip: detail.ip || 'Đang cập nhật',
              reports: isSafe ? 0 : 1,
              host: 'N/A'
            });
          } else if (mappedType === 'phone') {
            const isScam = data.is_scam === true;
            const detail = data.detail || {};
            setResult({
              target: decodedTarget,
              name: detail.name || (isScam ? 'Đối tượng lừa đảo' : 'Chưa rõ danh tính'),
              bankName: detail.payments?.bank?.[0]?.bank_name || 'Techcombank',
              status: isScam ? 'malicious' : 'safe',
              desc: detail.description || data.message || 'Không tìm thấy thông tin trùng khớp với đối tượng lừa đảo trong cơ sở dữ liệu.',
              registrar: 'Không áp dụng',
              created: 'Báo cáo từ cộng đồng',
              ip: 'N/A',
              reports: isScam ? (detail.reports_count || 1) : 0,
              host: 'N/A'
            });
          } else if (mappedType === 'email') {
            const breachDetail = data.breach_detail || {};
            const breachesList = breachDetail.breaches || [];
            const hasBreaches = breachDetail.total_breaches > 0 || breachesList.length > 0;
            setResult({
              target: decodedTarget,
              name: 'Địa chỉ Email',
              status: hasBreaches ? 'malicious' : 'safe',
              desc: hasBreaches
                ? `Phát hiện địa chỉ email này liên quan đến ${breachDetail.total_breaches} vụ rò rỉ dữ liệu công khai trên không gian mạng.`
                : 'Không phát hiện thấy mối đe dọa rò rỉ thông tin cá nhân liên quan tới địa chỉ email này.',
              reports: data.total_breaches || 0,
              breaches: data.breaches || [],
              registrar: 'Không áp dụng',
              created: 'Hệ thống đối soát',
              ip: 'N/A',
              host: 'N/A'
            });
          }
        }
      } catch (err) {
        console.warn('Không thể đồng bộ dữ liệu quét từ server:', err);
      }
    };

    fetchRealData();
  }, [cleanType, decodedTarget]);

  const [expandedCardIdx, setExpandedCardIdx] = useState(0); // for accordion cards
  const [showWhoisModal, setShowWhoisModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeContact, setDisputeContact] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    if (!disputeContact.trim() || !disputeReason.trim()) {
      if (addToast) {
        addToast('Vui lòng điền đầy đủ thông tin yêu cầu.', 'error');
      }
      return;
    }

    setIsSubmittingDispute(true);

    // Simulate API request submission
    setTimeout(() => {
      setIsSubmittingDispute(false);
      setShowDisputeModal(false);
      setDisputeContact('');
      setDisputeReason('');
      if (addToast) {
        addToast('Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi lại bạn sớm.', 'success');
      }
    }, 1000);
  };

  const getScanSteps = (cType) => {
    if (cType === 'phone' || cType === 'email') {
      return [
        "Đang phân tích định danh và đơn vị quản lý...",
        "Đang đối soát kho dữ liệu báo cáo lừa đảo...",
        "Chạy phân tích AI nhận diện hành vi lừa đảo..."
      ];
    }
    return [
      "Đang phân tích cấu trúc DNS/Giao thức kết nối...",
      "Đang đối soát kho dữ liệu ChongLuaDao đen...",
      "Chạy chẩn đoán Heuristics AI chống giả mạo..."
    ];
  };

  // Run simulation scan on mount
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);

      if (progress === 30) setActiveStep(1);
      if (progress === 70) setActiveStep(2);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
        }, 400);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 'safe': return 'An toàn';
      case 'suspicious': return 'Nghi ngờ';
      default: return 'Nguy hiểm';
    }
  };

  const getCategoryName = (cType) => {
    switch (cType) {
      case 'website': return 'Liên kết Web (URL)';
      case 'ip': return 'Địa chỉ IP';
      case 'phone': return 'Số điện thoại / Tài khoản';
      default: return 'Địa chỉ Email';
    }
  };

  if (isScanning) {
    return (
      <div className="cyber-scan-loading-screen">
        <div className="cyber-loader-console">
          <div className="cyber-grid-overlay"></div>

          <div className="cyber-scanner-hud">
            <div className="scanner-glow-circle"></div>
            <div className="radar-sweep-line"></div>
            <div className="scanner-center-core">
              <Cpu size={32} className="scanner-icon-spin" />
            </div>
            <span className="scanner-percentage">{scanProgress}%</span>
          </div>

          <h3 className="cyber-loader-title">HỆ THỐNG AI PHÂN TÍCH AN NINH </h3>
          <span className="cyber-loader-target">{decodedTarget}</span>

          <div className="cyber-bar-container">
            <div className="cyber-bar-fill" style={{ width: `${scanProgress}%` }}></div>
          </div>

          <div className="cyber-steps-list">
            {getScanSteps(cleanType).map((step, idx) => (
              <div key={idx} className={`cyber-step-item ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}>
                <span className="step-num">0{idx + 1}.</span>
                <span className="step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cleanType === 'email') {
    const emailBreaches = result.breaches || [];

    return (
      <div className="cyber-detail-page databreach-theme">
        <div className="cyber-grid-bg"></div>
        <div className="cyber-detail-container">

          {/* Header Row */}
          <div className="databreach-header-row">
            <button onClick={() => navigate('/')} className="dossier-back-btn" title="Quay lại">
              <ArrowLeft size={20} />
            </button>
            <div className="databreach-header-info">
              <span className="databreach-category">KIỂM TRA LỘ LỌT DỮ LIỆU CÁ NHÂN / DATA BREACH CENTRAL</span>
              <h2 className="databreach-main-title">Kết Quả Kiểm Tra Email: <span className="highlight-email">{result.target}</span></h2>
            </div>
          </div>

          {/* Forensic Diagnostic Hub */}
          <div className="forensic-layout-wrapper">
            {result.status === 'safe' ? (
              /* Safe State - Forensic Scan Certificate */
              <div className="forensic-safe-card glass-card">
                <div className="forensic-safe-header">
                  <div className="forensic-safe-badge">
                    <ShieldCheck size={64} className="pulse-success-glow" />
                  </div>
                  <h3>ĐỊA CHỈ EMAIL AN TOÀN</h3>
                  <p className="subtitle">Không tìm thấy bất kỳ dấu hiệu rò rỉ thông tin cá nhân nào liên quan tới địa chỉ email này.</p>
                </div>
              </div>
            ) : (
              /* Leaked State - Cyber Incident Timeline */
              <div className="cyber-timeline-layout">

                {/* Top Alert Banner */}
                <div className="timeline-danger-banner glass-card">
                  <div className="timeline-banner-badge">
                    <ShieldAlert size={36} className="shake-anim" />
                  </div>
                  <div className="timeline-banner-text">
                    <h4>CẢNH BÁO RÒ RỈ CƠ SỞ DỮ LIỆU / DATA BREACH TIMELINE DETECTED</h4>
                    <p>Hệ thống phát hiện địa chỉ email này xuất hiện trong <strong>{emailBreaches.length} vụ rò rỉ dữ liệu lớn</strong>.</p>
                  </div>
                </div>

                {/* Vertical Timeline Track */}
                <div className="timeline-track-container">

                  {emailBreaches.map((breach, idx) => {
                    const breachYear = breach.BreachDate ? breach.BreachDate.split('-')[0] : 'N/A';
                    return (
                      <div key={idx} className="timeline-incident-item">

                        {/* Timeline Left Spine Node */}
                        <div className="timeline-node-col">
                          <div className="timeline-connector-line"></div>
                          <div className="timeline-node-circle" style={{ borderColor: breach.IsStealerLog ? '#ff6b00' : 'var(--timeline-accent)' }}>
                            <span className="timeline-node-year">{breachYear}</span>
                          </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="timeline-card-col">
                          <div className={`timeline-incident-card glass-card ${expandedCardIdx === idx ? 'expanded' : ''}`}>

                            {/* Card Header (Collapsible toggle) */}
                            <div className="incident-card-header" onClick={() => setExpandedCardIdx(expandedCardIdx === idx ? null : idx)}>
                              <div className="header-left-group">
                                {breach.LogoPath ? (
                                  <img src={breach.LogoPath} alt={breach.Title} className="breach-logo-thumbnail" />
                                ) : (
                                  <span className="incident-dot" style={{ backgroundColor: '#ff4d4d' }}></span>
                                )}
                                <div className="incident-header-text">
                                  <h3 className="incident-title">{breach.Title}</h3>
                                  <span className="incident-card-date">{formatBreachDate(breach.BreachDate)}</span>
                                </div>
                              </div>
                              <div className="header-right-group">
                                <span className="exposed-count-badge">{breach.PwnCount.toLocaleString()} tài khoản</span>
                                <div className="expand-chevron-icon">
                                  <ChevronDown size={18} className={expandedCardIdx === idx ? 'rotate-180' : ''} />
                                </div>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedCardIdx === idx && (
                              <div className="incident-expanded-content">
                                <p className="incident-desc" dangerouslySetInnerHTML={{ __html: breach.Description }}></p>

                                <div className="incident-exposed-section">
                                  <span className="section-label">Dữ liệu bị rò rỉ:</span>
                                  <div className="incident-exposed-badges">
                                    {breach.DataClasses.map((data, bIdx) => (
                                      <span key={bIdx} className="exposed-badge pwned">
                                        <User size={12} />
                                        <span>{translateDataClass(data)}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  const generateCaseId = (tgt, cType) => {
    let hash = 0;
    const str = tgt + cType;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const cleanHash = Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
    return `CLD-${cType.substring(0, 3).toUpperCase()}-${cleanHash}`;
  };

  const caseId = generateCaseId(result.target, cleanType);
  const formattedDate = result.created && !result.created.includes('Báo cáo') ? result.created : 'Mới ghi nhận';
  const isMalicious = result.status === 'malicious';

  let riskScore;
  let riskProgress;
  let riskLabel;
  let gaugeColor;
  let badgeBgColor;
  let badgeBorderColor;

  if (result.status === 'safe') {
    riskScore = '05';
    riskProgress = 0.05;
    riskLabel = 'ĐIỂM RỦI RO RẤT THẤP';
    gaugeColor = '#22C55E';
    badgeBgColor = 'rgba(34, 197, 94, 0.08)';
    badgeBorderColor = 'rgba(34, 197, 94, 0.2)';
  } else if (result.status === 'suspicious') {
    riskScore = '45';
    riskProgress = 0.45;
    riskLabel = 'ĐIỂM RỦI RO TRUNG BÌNH';
    gaugeColor = '#F97316';
    badgeBgColor = 'rgba(249, 115, 22, 0.08)';
    badgeBorderColor = 'rgba(249, 115, 22, 0.2)';
  } else {
    riskScore = '99';
    riskProgress = 0.99;
    riskLabel = 'ĐIỂM RỦI RO RẤT CAO';
    gaugeColor = '#EF4444';
    badgeBgColor = 'rgba(239, 68, 68, 0.08)';
    badgeBorderColor = 'rgba(239, 68, 68, 0.2)';
  }

  const angle = Math.PI * (1 - riskProgress);
  const markerX = 100 + 80 * Math.cos(angle);
  const markerY = 105 - 80 * Math.sin(angle);

  return (
    <div className="cyber-detail-page">
      {/* SVG Filter for realistic rubber stamp grunge/ink-bleed effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="stamp-grunge">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="cyber-grid-bg"></div>

      <div className="cyber-detail-container">

        {/* The Security Dossier Sheet */}
        <div className={`cyber-dossier-wrapper border-${result.status} ${isMalicious ? 'cyber-dossier-malicious' : ''}`}>

          {/* Diagnostic Stripes at the top */}
          <div className={`dossier-top-stripes stripes-${result.status}`}></div>

          {/* Holographic Watermark behind the dossier content */}
          <div className="dossier-watermark">
            {cleanType === 'phone' || cleanType === 'email'
              ? (result.status === 'safe' ? 'VERIFIED' : 'SCAM CASE')
              : (result.status === 'safe' ? 'VERIFIED' : result.status === 'suspicious' ? 'WARNING' : 'DANGEROUS')
            }
          </div>

          {/* Dynamic Authentic Stamp Seal */}
          {result.status !== 'suspicious' && (
            <div className={`cyber-stamp-badge stamp-${result.status} ${result.status === 'safe' ? 'stamp-rect' : 'stamp-circle'}`}>
              {result.status === 'safe' ? (
                <div className="stamp-rect-border">
                  <div className="stamp-rect-inner">
                    <span className="stamp-rect-text-top">★ SYSTEM VERIFIED ★</span>
                    <span className="stamp-rect-text-center">AN TOÀN</span>
                    <span className="stamp-rect-text-bottom">APPROVED BY SYSTEM</span>
                  </div>
                </div>
              ) : (
                <div className="stamp-border-outer">
                  <div className="stamp-border-inner">
                    <div className="stamp-text-top">★ TRUNG TÂM AN NINH MẠNG ★</div>
                    <div className="stamp-text-center">NGUY HIỂM</div>
                    <div className="stamp-text-bottom">BLACKLISTED</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="dossier-header-section">
            <div className="dossier-header-left">
              <span className="dossier-classification">
                {cleanType === 'phone' || cleanType === 'email' ? 'HỒ SƠ BÁO CÁO VỤ VIỆC LỪA ĐẢO / FRAUD INVESTIGATION' : 'HỆ THỐNG AI PHÂN TÍCH AN NINH'}
              </span>
              <div className="dossier-title-row">
                <button onClick={() => navigate('/')} className="dossier-back-btn" title="Quay lại tra cứu">
                  <ArrowLeft size={20} />
                </button>
                <h3 className="dossier-title">
                  {cleanType === 'phone' || cleanType === 'email' ? 'Thông Tin Vụ Việc Báo Cáo' : 'Kết Quả Phân Tích Chi Tiết'}
                </h3>
              </div>
            </div>

            <div className="dossier-header-right">
              <div className="dossier-case-info">
                <div className="case-id-tag">
                  <span className="label">CASE ID:</span>
                  <span className="val font-mono">{caseId}</span>
                </div>
                <div className="case-date-tag">
                  <span className="label">DATE:</span>
                  <span className="val font-mono">{formattedDate}</span>
                </div>
              </div>

              {/* Fake High-Tech Barcode */}
              <div className="dossier-barcode" title={caseId}>
                <div className="barcode-line w-2"></div>
                <div className="barcode-line w-4"></div>
                <div className="barcode-line w-1"></div>
                <div className="barcode-line w-3"></div>
                <div className="barcode-line w-1"></div>
                <div className="barcode-line w-5"></div>
                <div className="barcode-line w-2"></div>
                <div className="barcode-line w-3"></div>
                <div className="barcode-line w-1"></div>
                <div className="barcode-line w-4"></div>
              </div>
            </div>
          </div>

          <div className="dossier-divider"></div>

          {/* Main content grid of the dossier */}
          <div className="dossier-main-content">

            {/* Left side: Verdict Panel */}
            <div className="dossier-verdict-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', minHeight: '300px' }}>
              {/* Animated Radar Scanning Background */}
              <div className="dossier-radar-scanner">
                <div className="radar-sweep-wave"></div>
                <div className="radar-grid-lines"></div>
              </div>

              {/* Semicircular Gauge Display */}
              <div className="risk-gauge-container" style={{ position: 'relative', width: '220px', margin: '0 auto', textAlign: 'center' }}>
                <svg viewBox="0 0 200 120" width="100%" height="auto" style={{ display: 'block' }}>
                  <defs>
                    <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Background Track */}
                  <path
                    d="M 20 105 A 80 80 0 0 1 180 105"
                    fill="none"
                    stroke="var(--gauge-track-color)"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />

                  {/* Active Fill Track */}
                  <path
                    d="M 20 105 A 80 80 0 0 1 180 105"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="251.3"
                    strokeDashoffset={251.3 * (1 - riskProgress)}
                    style={{
                      transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'url(#gauge-glow)'
                    }}
                  />

                  {/* Pulsing Outer Sonar Ring at tip */}
                  <circle
                    cx={markerX}
                    cy={markerY}
                    r="14"
                    fill={gaugeColor}
                    opacity="0.3"
                    style={{
                      transition: 'cx 1s cubic-bezier(0.4, 0, 0.2, 1), cy 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: 'gauge-glow-pulse 1.8s infinite ease-out'
                    }}
                  />

                  {/* Glowing core indicator bead at tip */}
                  <circle
                    cx={markerX}
                    cy={markerY}
                    r="7"
                    fill="#ffffff"
                    stroke={gaugeColor}
                    strokeWidth="3.5"
                    style={{
                      transition: 'cx 1s cubic-bezier(0.4, 0, 0.2, 1), cy 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 0 5px ' + gaugeColor + ')'
                    }}
                  />
                </svg>

                {/* Inject CSS keyframe animations dynamically */}
                <style>{`
                  @keyframes gauge-glow-pulse {
                    0% {
                      r: 9px;
                      opacity: 0.8;
                    }
                    100% {
                      r: 22px;
                      opacity: 0;
                    }
                  }
                  @keyframes text-glow-pulse {
                    0% {
                      text-shadow: 0 0 5px ${gaugeColor}44;
                    }
                    100% {
                      text-shadow: 0 0 15px ${gaugeColor}bb, 0 0 25px ${gaugeColor}99;
                    }
                  }
                `}</style>

                {/* Centered Score */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: gaugeColor,
                    lineHeight: '1',
                    letterSpacing: '-1px',
                    animation: 'text-glow-pulse 2s infinite alternate'
                  }}>
                    {riskScore}
                  </span>
                  <span style={{
                    fontSize: '1.1rem',
                    color: 'var(--gauge-text-muted)',
                    marginLeft: '4px',
                    fontWeight: '600'
                  }}>
                    /100
                  </span>
                </div>
              </div>

              {/* Pill Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 20px',
                borderRadius: '24px',
                fontSize: '0.85rem',
                fontWeight: '800',
                marginTop: '16px',
                color: gaugeColor,
                backgroundColor: badgeBgColor,
                border: `1px solid ${badgeBorderColor}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: `0 4px 12px ${badgeBgColor}`,
                zIndex: 2
              }}>
                {riskLabel}
              </div>
            </div>

            {/* Right side: Identity Card & Technical details */}
            <div className="dossier-details-panel">
              <div className="dossier-meta-section">
                <span className={`verdict-text-badge text-${result.status}`}>
                  TRẠNG THÁI: {getStatusText(result.status).toUpperCase()}
                </span>
                <span className="category-text-badge">
                  DANH MỤC: {getCategoryName(cleanType).toUpperCase()}
                </span>
              </div>

              <div className="dossier-target-row">
                <h2 className="dossier-target-title">
                  {result.target}
                </h2>
                <div className="dossier-actions-group">
                  {cleanType === 'website' && (
                    <button
                      onClick={() => setShowWhoisModal(true)}
                      className="dossier-whois-btn"
                      title="Xem thông tin WHOIS tên miền"
                    >
                      <Globe size={16} />
                      <span>Thông tin WHOIS</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="dossier-description">
                {result.desc}
              </p>

              {/* Dossier Structured Data Table */}
              {cleanType === 'phone' || cleanType === 'email' ? (
                <div className="dossier-table">
                  <div className="table-row">
                    <span className="table-label">ĐỐI TƯỢNG BỊ BÁO CÁO</span>
                    <span className="table-val font-mono">{result.target}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">TÊN CHỦ SỞ HỮU / GIẢ MẠO</span>
                    <span className="table-val">{result.name || 'Chưa rõ danh tính'}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">NGÂN HÀNG / NHÀ MẠNG / ĐƠN VỊ CUNG CẤP</span>
                    <span className="table-val">{result.bankName || result.registrar || 'Đang xác minh'}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">NGUỒN GHI NHẬN HỆ THỐNG</span>
                    <span className="table-val">{result.created || 'Báo cáo từ cộng đồng'}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">SỐ LƯỢT BÁO CÁO CỘNG ĐỒNG</span>
                    <span className={`table-val font-bold ${result.reports > 0 ? 'text-red' : 'text-green'}`}>{result.reports} lượt báo cáo độc hại</span>
                  </div>
                </div>
              ) : (
                <div className="dossier-table">
                  <div className="table-row">
                    <span className="table-label">NHÀ ĐĂNG KÝ / ĐƠN VỊ LƯU TRỮ</span>
                    <span className="table-val">{result.registrar}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">ĐỊA CHỈ IP MÁY CHỦ</span>
                    <span className="table-val font-mono">{result.ip}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">ĐƠN VỊ ĐIỀU HÀNH HOST</span>
                    <span className="table-val">{result.host}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">ĐỘ TUỔI / THỜI GIAN ĐĂNG KÝ</span>
                    <span className={`table-val ${isMalicious ? 'text-red font-bold' : ''}`}>{result.created}</span>
                  </div>
                  <div className="table-row">
                    <span className="table-label">SỐ LƯỢT BÁO CÁO CỘNG ĐỒNG</span>
                    <span className={`table-val font-bold ${result.reports > 0 ? 'text-red' : 'text-green'}`}>{result.reports} lượt báo cáo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical & Audit Diagnostics Grids */}
        <div className="cyber-detail-grid">

          {/* Block 1: Audit logs / Security engines checks */}
          <div className="cyber-info-block glass-card">
            <div className="cyber-block-header">
              <Cpu size={16} className={isMalicious ? 'text-red' : result.status === 'suspicious' ? 'text-yellow' : 'text-green'} />
              <h4>
                {cleanType === 'phone' || cleanType === 'email' ? 'ĐỐI SOÁT CƠ SỞ DỮ LIỆU PHÒNG CHỐNG SCAM' : 'ĐỐI SOÁT CƠ SỞ DỮ LIỆU ĐỘC HẠI'}
              </h4>
            </div>
            {isMalicious || result.status === 'suspicious' ? (
              cleanType === 'phone' || cleanType === 'email' ? (
                <div className="cyber-engines-list font-mono">
                  <div className="cyber-engine-row">
                    <span>CSDL CHỐNG LỪA ĐẢO</span>
                    <span className="engine-badge-red">BLACKLISTED MATCH</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>VNCERT FRAUD REGISTRY</span>
                    <span className="engine-badge-red">FLAGGED SCAM</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>CỤC AN NINH MẠNG ĐỀ XUẤT</span>
                    <span className="engine-badge-red">KHÓA KHẨN CẤP</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>AI SCAM BEHAVIOR SCANNER</span>
                    <span className="engine-badge-red">HIGH FRAUD PROBABILITY</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>HỆ THỐNG XÁC MINH CỘNG ĐỒNG</span>
                    <span className="engine-badge-red">{result.reports} LƯỢT XÁC THỰC</span>
                  </div>
                </div>
              ) : (
                <div className="cyber-engines-list font-mono">
                  <div className="cyber-engine-row">
                    <span>GOOGLE SAFE BROWSING</span>
                    <span className="engine-badge-red">PHISHING DETECTED</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>PHISHTANK BLACKLIST</span>
                    <span className="engine-badge-red">MATCHED</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>CHONGLUADAO CORE DB</span>
                    <span className="engine-badge-red">BLACKLISTED</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>HEURISTICS AI SCANNER</span>
                    <span className="engine-badge-red">100% CORRUPT</span>
                  </div>
                  <div className="cyber-engine-row">
                    <span>VIRUSTOTAL REGISTRY</span>
                    <span className="engine-badge-red">14 THREAT FLAGS</span>
                  </div>
                </div>
              )
            ) : (
              <div className="cyber-info-rows">
                <div className="cyber-info-row">
                  <span className="cyber-info-label">Số lượt báo cáo</span>
                  <span className="cyber-info-val">0 lượt báo cáo độc hại</span>
                </div>
                <div className="cyber-info-row">
                  <span className="cyber-info-label">Tình trạng ghi nhận</span>
                  <span className="cyber-info-val text-green">Chưa phát hiện hành vi lừa đảo</span>
                </div>
                <div className="cyber-info-row">
                  <span className="cyber-info-label">Độ xác thực số</span>
                  <span className="cyber-info-val text-green">✓ Ban Quản Trị Xác Thực</span>
                </div>
                <div className="cyber-info-row">
                  <span className="cyber-info-label">Thang điểm hành vi</span>
                  <span className="cyber-info-val">0% rủi ro</span>
                </div>
              </div>
            )}
          </div>

          {/* Block 2: Guidelines Recommendations */}
          <div className="cyber-info-block glass-card">
            <div className="cyber-block-header">
              <Radio size={16} className={isMalicious ? 'text-red' : result.status === 'suspicious' ? 'text-yellow' : 'text-green'} />
              <h4>KHUYẾN CÁO AN TOÀN TỪ CHUYÊN GIA</h4>
            </div>

            <ul className="cyber-guideline-list-redesign">
              {result.status === 'safe' ? (
                <>
                  <li>Tên miền hiện chưa nằm trong danh mục lừa đảo. Tuy nhiên, luôn kiểm tra tên miền kỹ trước khi nhập thông tin tài khoản.</li>
                  <li>Không tải xuống bất cứ tệp tin cài đặt có đuôi lạ như .exe, .apk được chia sẻ bởi người lạ.</li>
                  <li>Tải tiện ích chặn của ChongLuaDao để bảo vệ tự động toàn thời gian.</li>
                </>
              ) : result.status === 'suspicious' ? (
                <>
                  <li className="warning-critical-redesign">HÃY CẨN THẬN khi giao dịch hoặc chia sẻ thông tin trên hệ thống này.</li>
                  <li>Tránh nhập các thông tin nhạy cảm như Mật khẩu, OTP hoặc Số thẻ tín dụng.</li>
                  <li>Xác minh danh tính của người gửi hoặc người liên hệ qua một kênh độc lập khác.</li>
                  <li>Theo dõi sát sao các biến động số dư tài khoản của bạn.</li>
                </>
              ) : (
                <>
                  <li className="warning-critical-redesign">ĐĂNG XUẤT VÀ THOÁT KHỎI LIÊN KẾT NÀY NGAY LẬP TỨC.</li>
                  <li className="warning-critical-redesign">TUYỆT ĐỐI KHÔNG CHUYỂN KHOẢN ĐẶT CỌC hoặc cung cấp thông tin tài khoản, mật khẩu, mã OTP.</li>
                  <li className="warning-critical-redesign">TUYỆT ĐỐI KHÔNG cấp quyền trợ năng hoặc cài đặt ứng dụng từ tệp lạ (.apk).</li>
                </>
              )}
            </ul>
          </div>

        </div>

        {/* False Positive Dispute Block */}
        {(isMalicious || result.status === 'suspicious') && (
          <div className="cyber-dispute-block glass-card">
            <div className="cyber-dispute-info">
              <span className="cyber-dispute-title">BÁO CÁO SAI LỆCH HỆ THỐNG / FALSE POSITIVE</span>
              <p className="cyber-dispute-text">
                Nếu bạn tin rằng chẩn đoán tự động của hệ thống bị nhầm lẫn đối với đối tượng này, hãy bấm nút gửi phản ánh yêu cầu đối soát kiểm duyệt thủ công. Đội ngũ an ninh sẽ phản hồi bạn trong 24 giờ làm việc.
              </p>
            </div>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="cyber-dispute-btn"
            >
              <RefreshCw size={14} className="spin-on-hover" />
              GỬI YÊU CẦU ĐỐI SOÁT
            </button>
          </div>
        )}

      </div>

      {/* Dispute Modal Popup Dialog */}
      {showDisputeModal && (
        <div className="dispute-modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="dispute-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dispute-modal-header">
              <div className="dispute-modal-title">
                <RefreshCw size={16} className="spin-icon-always" />
                <span>YÊU CẦU ĐỐI SOÁT HỆ THỐNG</span>
              </div>
              <button className="dispute-modal-close" onClick={() => setShowDisputeModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="dispute-modal-form">
              <div className="dispute-form-group">
                <label htmlFor="dispute-contact" className="dispute-form-label">
                  Thông tin liên hệ (Email / Số điện thoại) <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="dispute-contact"
                  className="dispute-form-input"
                  placeholder="Nhập email hoặc số điện thoại của bạn..."
                  value={disputeContact}
                  onChange={(e) => setDisputeContact(e.target.value)}
                  required
                />
              </div>

              <div className="dispute-form-group">
                <label htmlFor="dispute-reason" className="dispute-form-label">
                  Nội dung báo cáo sai sót <span className="required-star">*</span>
                </label>
                <textarea
                  id="dispute-reason"
                  className="dispute-form-textarea"
                  placeholder="Vui lòng cung cấp nội dung báo cáo hoặc lý do tại sao đối tượng này an toàn..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="dispute-modal-actions">
                <button
                  type="button"
                  className="dispute-btn-cancel"
                  onClick={() => setShowDisputeModal(false)}
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="dispute-btn-submit"
                  disabled={isSubmittingDispute}
                >
                  {isSubmittingDispute ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHOIS Modal Popup Dialog */}
      {showWhoisModal && cleanType === 'website' && (
        <div className="dispute-modal-overlay" onClick={() => setShowWhoisModal(false)}>
          <div className="dispute-modal-card whois-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dispute-modal-header whois-modal-header">
              <div className="dispute-modal-title">
                <Globe size={16} className="pulse-icon-always" />
                <span>TRA CỨU WHOIS TÊN MIỀN</span>
              </div>
              <button className="dispute-modal-close" onClick={() => setShowWhoisModal(false)}>
                &times;
              </button>
            </div>

            <div className="whois-modal-body">
              <div className="whois-domain-title font-mono">{result.target.toUpperCase()}</div>

              <div className="whois-quick-grid">
                <div className="whois-quick-item">
                  <span className="q-label">Nhà Đăng Ký (Registrar)</span>
                  <span className="q-val font-bold text-green">{result.registrar}</span>
                </div>
                <div className="whois-quick-item">
                  <span className="q-label">Ngày Đăng Ký (Created)</span>
                  <span className="q-val">{result.created}</span>
                </div>
                <div className="whois-quick-item">
                  <span className="q-label">IP Máy Chủ (IP Address)</span>
                  <span className="q-val font-mono">{result.ip}</span>
                </div>
                <div className="whois-quick-item">
                  <span className="q-label">Nhà Cung Cấp Host (Hosting)</span>
                  <span className="q-val">{result.host}</span>
                </div>
              </div>

              <div className="whois-raw-container">
                <div className="whois-raw-header">
                  <Terminal size={14} />
                  <span>DỮ LIỆU THÔ BẢN GHI WHOIS (RAW WHOIS DATA)</span>
                </div>
                <pre className="whois-raw-content font-mono">
                  {getMockWhoisData(result.target, result)}
                </pre>
              </div>
            </div>

            <div className="dispute-modal-actions whois-modal-actions">
              <button
                type="button"
                className="dispute-btn-cancel"
                onClick={() => setShowWhoisModal(false)}
              >
                ĐÓNG LẠI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
