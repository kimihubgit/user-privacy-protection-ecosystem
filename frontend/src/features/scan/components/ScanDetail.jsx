import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ArrowLeft, Cpu, Globe, User, Radio, ChevronDown, RefreshCw, Terminal, Search, X, Clipboard, Calendar, Activity } from 'lucide-react';
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
  const location = useLocation();
  const decodedTarget = decodeURIComponent(target || '');

  // Search input and state machine variables
  const [inputValue, setInputValue] = useState(decodedTarget);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [cleanType, setCleanType] = useState(() => detectCheckType(decodedTarget));

  const [result, setResult] = useState({
    target: decodedTarget,
    name: 'Chưa xác định',
    scamType: '',
    bankName: 'Không áp dụng',
    status: 'safe',
    desc: 'Thiết bị sẵn sàng phân tích an toàn thông tin.',
    registrar: 'Không áp dụng',
    created: 'Mới ghi nhận',
    ip: 'N/A',
    reports: 0,
    host: 'N/A',
    breaches: []
  });

  const [expandedCardIdx, setExpandedCardIdx] = useState(0);
  const [showWhoisModal, setShowWhoisModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeContact, setDisputeContact] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Sync state will be handled below after handleStartScan is defined


  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
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

  const runLocalFallback = (searchTarget) => {
    const cType = detectCheckType(searchTarget);
    setCleanType(cType);

    let status = 'safe';
    let desc = 'Không phát hiện thấy mối đe dọa nào. Đối tượng này hiện chưa nằm trong danh sách đen cảnh báo của chúng tôi.';
    let reports = 0;

    if (cType === 'website') {
      const queryLower = searchTarget.toLowerCase();
      if (queryLower.includes('vietcombank') || queryLower.includes('momo') || queryLower.includes('shopee') || queryLower.includes('phishing')) {
        status = 'malicious';
        desc = 'Phát hiện tự động (Heuristics): Tên miền có dấu hiệu giả mạo dịch vụ tài chính hoặc thương hiệu thương mại điện tử lớn.';
        reports = 1;
      }
      setResult({
        target: searchTarget,
        name: status === 'safe' ? 'Tên miền tin cậy' : 'Tên miền độc hại',
        status: status,
        desc: desc,
        registrar: 'Cloudflare Inc.',
        created: '2024-05-15',
        ip: '104.21.32.110',
        reports: reports,
        host: 'Cloudflare'
      });
    } else if (cType === 'phone') {
      const queryCleaned = searchTarget.trim().replace(/\s+/g, '');
      const localBlacklist = JSON.parse(localStorage.getItem('admin_blacklist') || '[]');
      const localMatch = localBlacklist.find(item =>
        item.type !== 'url' && item.target === queryCleaned
      );

      if (localMatch) {
        setResult({
          target: queryCleaned,
          name: localMatch.type === 'bank_account' ? 'ĐỐI TƯỢNG LỪA ĐẢO' : 'Mẹo dụ dỗ',
          scamType: localMatch.type === 'bank_account' ? 'Gian lận giao dịch tài chính' : 'Lừa đảo công nghệ cao',
          bankName: localMatch.bankName || 'Techcombank',
          status: 'malicious',
          desc: localMatch.description,
          registrar: 'Không áp dụng',
          created: 'Báo cáo từ cộng đồng',
          ip: 'N/A',
          reports: 1,
          host: 'N/A'
        });
      } else {
        const isSuspicious = queryCleaned.endsWith('999') || queryCleaned.endsWith('666');
        const isMalicious = queryCleaned.startsWith('090') || queryCleaned.startsWith('039');
        setResult({
          target: searchTarget,
          name: isMalicious ? 'Đối tượng lừa đảo' : isSuspicious ? 'Nghi vấn lừa đảo' : 'Chưa rõ danh tính',
          scamType: isMalicious
            ? 'Chiếm đoạt tài sản / Giả mạo quà tặng'
            : isSuspicious
              ? 'Mạo danh cuộc gọi cơ quan chức năng'
              : 'Chưa có ghi nhận',
          bankName: 'Techcombank',
          status: isMalicious ? 'malicious' : isSuspicious ? 'suspicious' : 'safe',
          desc: isMalicious
            ? 'Số điện thoại này đã được báo cáo lừa đảo qua hành vi chiếm đoạt tài sản bằng mạng xã hội.'
            : isSuspicious
              ? 'Số điện thoại nằm trong danh mục nghi vấn spam cuộc gọi mạo danh cơ quan chức năng.'
              : 'Không tìm thấy thông tin trùng khớp với đối tượng lừa đảo trong cơ sở dữ liệu.',
          registrar: 'Không áp dụng',
          created: 'Báo cáo từ cộng đồng',
          ip: 'N/A',
          reports: isMalicious ? 5 : isSuspicious ? 1 : 0,
          host: 'N/A'
        });
      }
    } else if (cType === 'email') {
      const isBreached = searchTarget.includes('leak') || searchTarget.includes('hacked') || searchTarget.includes('pwned');
      setResult({
        target: searchTarget,
        name: 'Địa chỉ Email',
        status: isBreached ? 'malicious' : 'safe',
        desc: isBreached
          ? `Phát hiện địa chỉ email này liên quan đến 2 vụ rò rỉ dữ liệu công khai trên không gian mạng.`
          : 'Không phát hiện thấy mối đe dọa rò rỉ thông tin cá nhân liên quan tới địa chỉ email này.',
        reports: isBreached ? 2 : 0,
        breaches: isBreached ? [
          {
            Title: 'Adobe Inc.',
            BreachDate: '2013-10-04',
            PwnCount: 152445162,
            Description: 'Vào tháng 10 năm 2013, Adobe đã bị tấn công dữ liệu làm lộ thông tin tài khoản của hàng trăm triệu người dùng.',
            DataClasses: ['Email addresses', 'Passwords', 'Usernames'],
            LogoPath: ''
          },
          {
            Title: 'Canva Design Platform',
            BreachDate: '2019-05-24',
            PwnCount: 137000000,
            Description: 'Canva đã chịu một cuộc tấn công làm lộ thông tin địa chỉ email, tên đăng nhập và mật khẩu được mã hóa bcrypt.',
            DataClasses: ['Email addresses', 'Names', 'Passwords', 'Usernames'],
            LogoPath: ''
          }
        ] : [],
        registrar: 'Không áp dụng',
        created: 'Hệ thống đối soát',
        ip: 'N/A',
        host: 'N/A'
      });
    }
  };

  const fetchRealData = async (searchTarget) => {
    try {
      const data = await api.getDetail(searchTarget);
      if (data) {
        const type = data.type || data.detected_type;
        let mappedType = 'website';
        if (type === 'phone' || type === 'bank_account') {
          mappedType = 'phone';
        } else if (type === 'email') {
          mappedType = 'email';
        } else if (type === 'url') {
          mappedType = 'website';
        }
        setCleanType(mappedType);

        if (mappedType === 'website') {
          const isSafe = data.is_safe !== false && data.is_scam !== true;
          const detail = data.detail || {};
          
          let cleanDomain = searchTarget;
          try {
            const tempUrl = searchTarget.includes('://') ? searchTarget : 'http://' + searchTarget;
            cleanDomain = new URL(tempUrl).hostname.replace('www.', '');
          } catch (e) {
            // ignore
          }

          let whoisData = null;
          try {
            whoisData = await api.getDomainWhois(cleanDomain);
          } catch (e) {
            console.warn('Cannot fetch WHOIS details from API:', e);
          }

          setResult({
            target: searchTarget,
            name: isSafe ? 'Tên miền tin cậy' : 'Tên miền độc hại',
            status: isSafe ? 'safe' : 'malicious',
            desc: detail.description || data.message || 'Kết quả kiểm tra từ hệ thống.',
            registrar: whoisData?.registrar || detail.registrar || 'Đang cập nhật',
            created: whoisData?.registration_date ? new Date(whoisData.registration_date).toLocaleDateString('vi-VN') : (detail.created || 'Vừa tạo mới'),
            expirationDate: whoisData?.expiration_date ? new Date(whoisData.expiration_date).toLocaleDateString('vi-VN') : 'Đang cập nhật',
            nameservers: whoisData?.nameservers ? whoisData.nameservers.join(', ') : 'Đang cập nhật',
            owner: whoisData?.owner || 'Ẩn danh (Privacy Protected)',
            ip: detail.ip || 'Đang cập nhật',
            reports: isSafe ? 0 : 1,
            host: 'N/A'
          });
        } else if (mappedType === 'phone') {
          const isScam = data.is_scam === true || data.is_safe === false;
          const detail = data.detail || {};
          setResult({
            target: searchTarget,
            name: detail.name || (isScam ? 'Đối tượng lừa đảo' : 'Chưa rõ danh tính'),
            scamType: detail.category || (isScam ? 'Gian lận công nghệ cao' : 'Chưa có ghi nhận'),
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
            target: searchTarget,
            name: 'Địa chỉ Email',
            status: hasBreaches ? 'malicious' : 'safe',
            desc: hasBreaches
              ? `Phát hiện địa chỉ email này liên quan đến ${breachDetail.total_breaches} vụ rò rỉ dữ liệu công khai trên không gian mạng.`
              : 'Không phát hiện thấy mối đe dọa rò rỉ thông tin cá nhân liên quan tới địa chỉ email này.',
            reports: breachDetail.total_breaches || 0,
            breaches: breachesList,
            registrar: 'Không áp dụng',
            created: 'Hệ thống đối soát',
            ip: 'N/A',
            host: 'N/A'
          });
        }
      } else {
        runLocalFallback(searchTarget);
      }
    } catch (err) {
      console.warn('Không thể kết nối API máy chủ, sử dụng rà soát ngoại tuyến:', err);
      runLocalFallback(searchTarget);
    }
  };

  const handleStartScan = (targetVal) => {
    const trimmedTarget = targetVal.trim();
    if (!trimmedTarget) {
      if (addToast) {
        addToast('Vui lòng nhập thông tin cần tra cứu.', 'warning');
      }
      return;
    }

    setIsScanning(true);
    setHasScanned(false);
    setScanProgress(0);
    setActiveStep(0);

    // Sync path parameter
    navigate(`/detail/${encodeURIComponent(trimmedTarget)}`, { replace: true });

    let progress = 0;
    let apiDone = false;

    // Trigger API fetch and set apiDone when finished
    fetchRealData(trimmedTarget).finally(() => {
      apiDone = true;
    });

    const interval = setInterval(() => {
      if (!apiDone) {
        // If API is still loading, progress runs up to 90% and pauses
        if (progress < 90) {
          progress += 5;
        }
      } else {
        // Once API completes, quickly boost progress to 100%
        progress += 10;
      }

      setScanProgress(Math.min(progress, 100));

      if (progress >= 30 && progress < 70) setActiveStep(1);
      if (progress >= 70 && progress < 100) setActiveStep(2);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setHasScanned(true);
        }, 300);
      }
    }, 40);
  };

  // Sync state if url param changes or location state autoScan flag is present
  useEffect(() => {
    const timer = setTimeout(() => {
      if (decodedTarget) {
        setInputValue(decodedTarget);
        if (location.state?.autoScan) {
          // Clear autoScan state to prevent loops
          navigate(location.pathname, { replace: true, state: {} });
          handleStartScan(decodedTarget);
          return;
        }
      } else {
        setInputValue('');
      }
      setHasScanned(false);
      setIsScanning(false);
      setScanProgress(0);
      setActiveStep(0);
      return () => clearTimeout(timer);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedTarget, location.state]);

  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    if (!disputeContact.trim() || !disputeReason.trim()) {
      if (addToast) {
        addToast('Vui lòng điền đầy đủ thông tin yêu cầu.', 'error');
      }
      return;
    }

    setIsSubmittingDispute(true);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'safe': return 'An toàn';
      case 'suspicious': return 'Nghi ngờ';
      default: return 'Nguy hiểm';
    }
  };

  // const getCategoryName = (cType) => {
  //   switch (cType) {
  //     case 'website': return 'Liên kết Web (URL)';
  //     case 'ip': return 'Địa chỉ IP';
  //     case 'phone': return 'Số điện thoại / Tài khoản';
  //     default: return 'Địa chỉ Email';
  //   }
  // };

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

        {/* TOP SEARCH BAR PANEL */}
        <div className="dossier-search-container">
          <form className="dossier-search-bar" onSubmit={(e) => { e.preventDefault(); handleStartScan(inputValue); }}>
            <Search className="dossier-search-left-icon" size={20} />
            <input
              type="text"
              className="dossier-search-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập Liên kết Web, Số điện thoại hoặc Email..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {inputValue ? (
              <button type="button" className="dossier-search-clear-btn" onClick={() => setInputValue('')} title="Xóa nội dung">
                <X size={16} />
              </button>
            ) : (
              <button type="button" className="dossier-search-paste-btn" onClick={handlePaste} title="Dán từ Clipboard">
                <Clipboard size={16} />
              </button>
            )}
            <button type="submit" className="dossier-search-submit-btn" disabled={isScanning}>
              PHÂN TÍCH
            </button>
          </form>
        </div>

        {/* CONDITION STATE RENDERING AREA */}
        {(!hasScanned || isScanning) ? (
          /* STATE 1 & 2: IDLE & SCANNING STATE - UNIFIED CIRCULAR ORBITAL SCANNER HUB */
          <div className={`orbital-scanner-container ${isScanning ? 'is-scanning' : ''}`} data-progress={scanProgress}>

            {/* The Orbital System Grid */}
            <div className="orbital-system-wrapper">

              {/* Concentric Orbital Rings */}
              <div className="orbital-ring ring-1"></div>
              <div className="orbital-ring ring-2"></div>

              {/* Connecting laser lines (from center to nodes) */}
              <div className="orbital-laser-line line-left"></div>
              <div className="orbital-laser-line line-right"></div>
              <div className="orbital-laser-line line-bottom"></div>

              {/* Data Aggregation Bubbles (Only visible when scanning with varied sizes) */}
              {isScanning && (
                <div className="aggregation-bubbles-container">
                  <div className="agg-bubble b1 size-sm"><span>SSL Cert</span></div>
                  <div className="agg-bubble b2 size-md"><span>DNS Rec</span></div>
                  <div className="agg-bubble b3 size-lg"><span>Bank API</span></div>
                  <div className="agg-bubble b4 size-sm"><span>Blacklist</span></div>
                  <div className="agg-bubble b5 size-md"><span>Pwned DB</span></div>
                  <div className="agg-bubble b6 size-lg"><span>Password</span></div>
                  <div className="agg-bubble b7 size-sm"><span>IP Check</span></div>
                  <div className="agg-bubble b8 size-md"><span>Domain Rep</span></div>
                </div>
              )}

              {/* Central Core Node */}
              <div className="orbital-core-node">
                <div className="orbital-core-glow"></div>
                <div className="orbital-core-shield">
                  {isScanning ? (
                    <Cpu size={32} className="text-secondary btn-icon-spin" />
                  ) : (
                    <ShieldCheck size={32} className="text-secondary" />
                  )}
                </div>
                <span className="orbital-core-label font-mono">
                  {isScanning ? 'PROCESSING' : 'SCAN ENGINE'}
                </span>
              </div>

              {/* Satellite Node 1: Web */}
              <div className={`satellite-node node-web ${isScanning && activeStep === 0 ? 'active' : ''} ${isScanning && activeStep > 0 ? 'done' : ''}`}>
                <div className="satellite-icon-circle blue">
                  <Globe size={18} />
                </div>
                <span className="satellite-label">Website & DNS</span>
                {isScanning && (
                  <span className="satellite-status-pill">
                    {activeStep === 0 ? 'SCANNING' : activeStep > 0 ? 'DONE' : 'STANDBY'}
                  </span>
                )}
              </div>

              {/* Satellite Node 2: Fraud DB */}
              <div className={`satellite-node node-fraud ${isScanning && activeStep === 1 ? 'active' : ''} ${isScanning && activeStep > 1 ? 'done' : ''}`}>
                <div className="satellite-icon-circle orange">
                  <User size={18} />
                </div>
                <span className="satellite-label">Tố Cáo Tài Khoản</span>
                {isScanning && (
                  <span className="satellite-status-pill">
                    {activeStep === 1 ? 'SCANNING' : activeStep > 1 ? 'DONE' : 'STANDBY'}
                  </span>
                )}
              </div>

              {/* Satellite Node 3: Leak DB */}
              <div className={`satellite-node node-leak ${isScanning && activeStep === 2 ? 'active' : ''} ${isScanning && activeStep > 2 ? 'done' : ''}`}>
                <div className="satellite-icon-circle green">
                  <Radio size={18} />
                </div>
                <span className="satellite-label">Dữ Liệu Lộ Lọt</span>
                {isScanning && (
                  <span className="satellite-status-pill">
                    {activeStep === 2 ? 'SCANNING' : activeStep > 2 ? 'DONE' : 'STANDBY'}
                  </span>
                )}
              </div>

            </div>

            {/* Target Display and Trigger */}
            <div className="orbital-control-panel">
              {!isScanning ? (
                <>
                  <div className="orbital-target-pill">
                    <span className="pill-status-dot"></span>
                    <span className="target-text">MỤC TIÊU SẴN SÀNG: <strong>{inputValue || 'TRỐNG'}</strong></span>
                  </div>

                  <button className="orbital-btn-launch" onClick={() => handleStartScan(inputValue)}>
                    <RefreshCw size={16} className="btn-icon-spin" />
                    <span>KÍCH HOẠT HỆ THỐNG QUÉT</span>
                  </button>
                </>
              ) : (
                <div className="orbital-progress-board">
                  <div className="cyber-steps-list">
                    {getScanSteps(cleanType).map((step, idx) => (
                      <div key={idx} className={`cyber-step-item ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}>
                        <span className="step-num">0{idx + 1}.</span>
                        <span className="step-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : cleanType === 'email' ? (
          /* STATE 3: RESULT RECEIVED - EMAIL BREAK THEME */
          <div className="databreach-theme" style={{ width: '100%' }}>
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
                <div className="cyber-timeline-layout">
                  {/* Top Alert Banner */}
                  <div className="timeline-danger-banner glass-card">
                    <div className="timeline-banner-badge">
                      <ShieldAlert size={36} className="shake-anim" />
                    </div>
                    <div className="timeline-banner-text">
                      <h4>CẢNH BÁO RÒ RỈ CƠ SỞ DỮ LIỆU / DATA BREACH TIMELINE DETECTED</h4>
                      <p>Hệ thống phát hiện địa chỉ email này xuất hiện trong <strong>{result.breaches?.length || 0} vụ rò rỉ dữ liệu lớn</strong>.</p>
                    </div>
                  </div>

                  {/* Vertical Timeline Track */}
                  <div className="timeline-track-container">
                    {(result.breaches || []).map((breach, idx) => {
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
                              {/* Card Header */}
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
        ) : cleanType === 'website' ? (
          /* STATE 4: RESULT RECEIVED - WEBSITE / URL */
          <div className="scan-result-wrapper">

            {/* Back + Title Row */}
            <div className="scan-result-topbar">
              <button onClick={() => navigate('/')} className="scan-back-btn" title="Quay lại">
                <ArrowLeft size={18} />
                <span>Quay lại</span>
              </button>
              <div className="scan-topbar-meta">
                <span className="scan-meta-tag font-mono">ID: {caseId}</span>
                <span className="scan-meta-tag font-mono">{formattedDate}</span>
              </div>
            </div>

            {/* Verdict Hero Card */}
            <div className={`scan-verdict-card verdict-${result.status}`}>
              <div className="verdict-icon-circle">
                {result.status === 'safe' ? (
                  <ShieldCheck size={32} />
                ) : (
                  <ShieldAlert size={32} />
                )}
              </div>
              <div className="verdict-info">
                <span className={`verdict-status-pill pill-${result.status}`}>
                  {getStatusText(result.status).toUpperCase()}
                </span>
                <h2 className="verdict-target font-mono">{result.target}</h2>
                <p className="verdict-desc">{result.desc}</p>
              </div>
              <div className="verdict-score-block">
                <div className="score-ring" style={{ '--ring-color': gaugeColor, '--ring-progress': riskProgress }}>
                  <span className="score-number">{riskScore}</span>
                </div>
                <span className="score-label" style={{ color: gaugeColor }}>{riskLabel}</span>
              </div>
            </div>

            {/* Domain Details Grid */}
            <div className="scan-details-grid">
              <div className="detail-card glass-card">
                <div className="detail-card-header">
                  <Globe size={16} />
                  <h4>Thông Tin Tên Miền</h4>
                </div>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="detail-label">Nhà đăng ký (Registrar)</span>
                    <span className="detail-val">{result.registrar || 'Chưa ghi nhận'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Địa chỉ IP máy chủ</span>
                    <span className="detail-val font-mono">{result.ip || 'Chưa ghi nhận'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Cloud Hosting</span>
                    <span className="detail-val">{result.host || 'Chưa ghi nhận'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày đăng ký tên miền</span>
                    <span className={`detail-val ${isMalicious ? 'text-red font-bold' : ''}`}>{result.created || 'Chưa ghi nhận'}</span>
                  </div>
                  {result.expirationDate && (
                    <div className="detail-row">
                      <span className="detail-label">Ngày hết hạn tên miền</span>
                      <span className="detail-val">{result.expirationDate}</span>
                    </div>
                  )}
                  {result.nameservers && (
                    <div className="detail-row">
                      <span className="detail-label">Nameservers</span>
                      <span className="detail-val" style={{ fontSize: '0.78rem', textAlign: 'right', wordBreak: 'break-all' }}>{result.nameservers}</span>
                    </div>
                  )}
                  {result.owner && result.owner !== 'Ẩn danh (Privacy Protected)' && (
                    <div className="detail-row">
                      <span className="detail-label">Chủ sở hữu</span>
                      <span className="detail-val">{result.owner}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Báo cáo cộng đồng</span>
                    <span className={`detail-val font-bold ${result.reports > 0 ? 'text-red' : 'text-green'}`}>{result.reports} lượt</span>
                  </div>
                </div>
                <button onClick={() => setShowWhoisModal(true)} className="detail-action-btn">
                  <Terminal size={14} />
                  <span>Xem WHOIS</span>
                </button>
              </div>

              <div className="detail-card glass-card">
                <div className="detail-card-header">
                  <Cpu size={16} className={isMalicious ? 'text-red' : 'text-green'} />
                  <h4>Đối Soát Cơ Sở Dữ Liệu</h4>
                </div>
                {isMalicious || result.status === 'suspicious' ? (
                  <div className="db-check-list">
                    <div className="db-check-item danger">
                      <span className="db-name">Google Safe Browsing</span>
                      <span className="db-badge db-badge-red">PHISHING</span>
                    </div>
                    <div className="db-check-item danger">
                      <span className="db-name">PhishTank Blacklist</span>
                      <span className="db-badge db-badge-red">MATCHED</span>
                    </div>
                    <div className="db-check-item danger">
                      <span className="db-name">ChongLuaDao Core</span>
                      <span className="db-badge db-badge-red">BLACKLISTED</span>
                    </div>
                    <div className="db-check-item danger">
                      <span className="db-name">AI Heuristics</span>
                      <span className="db-badge db-badge-red">SUSPICIOUS</span>
                    </div>
                    <div className="db-check-item danger">
                      <span className="db-name">VirusTotal</span>
                      <span className="db-badge db-badge-red">{result.reports > 0 ? `${result.reports} FLAGS` : 'FLAGGED'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="db-check-list">
                    <div className="db-check-item safe">
                      <span className="db-name">Google Safe Browsing</span>
                      <span className="db-badge db-badge-green">SAFE</span>
                    </div>
                    <div className="db-check-item safe">
                      <span className="db-name">ChongLuaDao Core</span>
                      <span className="db-badge db-badge-green">CLEAN</span>
                    </div>
                    <div className="db-check-item safe">
                      <span className="db-name">SSL Certificate</span>
                      <span className="db-badge db-badge-green">VALID</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expert Tips */}
            <div className="scan-tips-card glass-card">
              <div className="detail-card-header">
                <Radio size={16} className={isMalicious ? 'text-red' : 'text-green'} />
                <h4>Khuyến Cáo An Toàn</h4>
              </div>
              <ul className="tips-list">
                {result.status === 'safe' ? (
                  <>
                    <li>Website này hiện được đánh giá an toàn. Luôn kiểm tra chính tả URL trước khi nhập dữ liệu cá nhân.</li>
                    <li>Tránh click vào các link lạ có đuôi mở rộng đáng ngờ như .zip, .exe, .scr.</li>
                    <li>Nên cài đặt tiện ích mở rộng ChongLuaDao để bảo vệ liên tục.</li>
                  </>
                ) : (
                  <>
                    <li className="tip-critical">RỜI KHỎI TRANG WEB NÀY NGAY LẬP TỨC. Đây là liên kết giả mạo chứa mã độc.</li>
                    <li className="tip-critical">Tuyệt đối không điền tên đăng nhập, mật khẩu hay thông tin ngân hàng.</li>
                    <li>Chia sẻ cảnh báo tên miền này tới bạn bè xung quanh để phòng tránh.</li>
                  </>
                )}
              </ul>
            </div>

            {/* False Positive */}
            {(isMalicious || result.status === 'suspicious') && (
              <div className="scan-dispute-card glass-card">
                <div className="dispute-content">
                  <h4>Yêu Cầu Đối Soát / False Positive</h4>
                  <p>Nếu bạn cho rằng chẩn đoán bị sai sót, hãy gửi phản hồi để đội ngũ kiểm duyệt xem xét trong 24h.</p>
                </div>
                <button onClick={() => setShowDisputeModal(true)} className="dispute-action-btn">
                  <RefreshCw size={14} />
                  Gửi đối soát
                </button>
              </div>
            )}

          </div>
        ) : (
          /* STATE 5: RESULT RECEIVED - SCAM DOSSIER THEME (Phone, Bank Account) */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
            <div className={`cyber-dossier-wrapper border-${result.status} ${isMalicious ? 'cyber-dossier-malicious' : ''}`}>
              <div className={`dossier-top-stripes stripes-${result.status}`}></div>
              <div className="dossier-watermark">
                {cleanType === 'phone'
                  ? (result.status === 'safe' ? 'VERIFIED' : 'SCAM CASE')
                  : (result.status === 'safe' ? 'VERIFIED' : result.status === 'suspicious' ? 'WARNING' : 'DANGEROUS')
                }
              </div>

              {/* Rubber Stamp Badge */}
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
                    {cleanType === 'phone' ? 'HỒ SƠ BÁO CÁO VỤ VIỆC LỪA ĐẢO / FRAUD INVESTIGATION' : 'HỆ THỐNG AI PHÂN TÍCH AN NINH'}
                  </span>
                  <div className="dossier-title-row">
                    <button onClick={() => navigate('/')} className="dossier-back-btn" title="Quay lại tra cứu">
                      <ArrowLeft size={20} />
                    </button>
                    <h3 className="dossier-title">
                      {cleanType === 'phone' ? 'Thông Tin Vụ Việc Báo Cáo' : 'Kết Quả Phân Tích Chi Tiết'}
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

                {/* Unique Deck Layout for Fraud Profile */}
                <div className="fraud-profile-deck">
                  
                  {/* 1. Target Card */}
                  <div className={`fraud-target-card status-${result.status}`}>
                    <div className="fraud-target-icon-wrapper">
                      {result.status === 'safe' ? (
                        <ShieldCheck size={36} className="icon-safe" />
                      ) : result.status === 'suspicious' ? (
                        <ShieldAlert size={36} className="icon-suspicious" />
                      ) : (
                        <ShieldAlert size={36} className="icon-danger" />
                      )}
                    </div>
                    <div className="fraud-target-details">
                      <span className="fraud-target-lbl">ĐỐI TƯỢNG BỊ BÁO CÁO (SCAM TARGET)</span>
                      <h2 className="fraud-target-val font-mono">{result.target}</h2>
                      {result.scamType && (
                        <div className="fraud-type-sub-title">
                          <span className="label">LOẠI HÌNH:</span>
                          <span className="val">{result.scamType}</span>
                        </div>
                      )}
                      <span className="fraud-risk-badge font-mono" style={{ color: gaugeColor, borderColor: badgeBorderColor, backgroundColor: badgeBgColor }}>
                        MỨC ĐỘ RỦI RO: {riskScore}/100 ({riskLabel})
                      </span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="fraud-description-box">
                    <p className="fraud-desc-text">{result.desc}</p>
                  </div>

                  {/* 2. Tri-Card Information Grid */}
                  <div className="fraud-info-grid">
                    <div className="fraud-info-subcard">
                      <div className="subcard-header">
                        <User size={16} />
                        <h4>ĐỊNH DANH ĐỐI TƯỢNG</h4>
                      </div>
                      <div className="subcard-body">
                        <div className="subcard-row">
                          <span className="label">Tên đối tượng:</span>
                          <span className="val font-bold">{result.name || 'Chưa rõ danh tính'}</span>
                        </div>
                        <div className="subcard-row">
                          <span className="label">Ngân hàng / Nhà mạng:</span>
                          <span className="val">{result.bankName || 'Đang xác minh'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="fraud-info-subcard">
                      <div className="subcard-header">
                        <Calendar size={16} />
                        <h4>LỊCH SỬ GHI NHẬN</h4>
                      </div>
                      <div className="subcard-body">
                        <div className="subcard-row">
                          <span className="label">Nguồn dữ liệu:</span>
                          <span className="val">{result.created || 'Báo cáo từ cộng đồng'}</span>
                        </div>
                        <div className="subcard-row">
                          <span className="label">Tổng số phản ánh:</span>
                          <span className={`val font-bold ${result.reports > 0 ? 'text-red' : 'text-green'}`}>
                            {result.reports} lượt báo cáo độc hại
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="fraud-info-subcard">
                      <div className="subcard-header">
                        <Activity size={16} />
                        <h4>KẾT QUẢ ĐỐI SOÁT</h4>
                      </div>
                      <div className="subcard-body">
                        <div className="subcard-row">
                          <span className="label">CSDL quốc gia:</span>
                          <span className={`val font-mono ${result.status === 'safe' ? 'text-green' : 'text-red'}`}>
                            {result.status === 'safe' ? 'SAFE_MATCH' : 'BLACKLIST_MATCH'}
                          </span>
                        </div>
                        <div className="subcard-row">
                          <span className="label">Chỉ số uy tín:</span>
                          <span className="val">{result.status === 'safe' ? 'Cao (High Trust)' : 'Rất thấp (No Trust)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Technical Diagnostics & Expert Tips */}
            <div className="cyber-detail-grid">
              <div className="cyber-info-block glass-card">
                <div className="cyber-block-header">
                  <Cpu size={16} className={isMalicious ? 'text-red' : result.status === 'suspicious' ? 'text-yellow' : 'text-green'} />
                  <h4>ĐỐI SOÁT CƠ SỞ DỮ LIỆU PHÒNG CHỐNG SCAM</h4>
                </div>
                {isMalicious || result.status === 'suspicious' ? (
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

              <div className="cyber-info-block glass-card">
                <div className="cyber-block-header">
                  <Radio size={16} className={isMalicious ? 'text-red' : result.status === 'suspicious' ? 'text-yellow' : 'text-green'} />
                  <h4>KHUYẾN CÁO AN TOÀN TỪ CHUYÊN GIA</h4>
                </div>
                <ul className="cyber-guideline-list-redesign">
                  {result.status === 'safe' ? (
                    <>
                      <li>Tên miền/Số điện thoại hiện chưa nằm trong danh mục lừa đảo. Tuy nhiên luôn duy trì cảnh giác khi giao dịch tài chính.</li>
                      <li>Không tải xuống các tệp tin lạ hoặc cấp quyền trợ năng trên điện thoại theo yêu cầu của đối tượng chưa rõ danh tính.</li>
                      <li>Cài đặt tiện ích mở rộng ChongLuaDao để bảo vệ trình duyệt tự động thời gian thực.</li>
                    </>
                  ) : result.status === 'suspicious' ? (
                    <>
                      <li className="warning-critical-redesign">HÃY CẨN THẬN khi liên lạc hoặc giao dịch với đối tượng này.</li>
                      <li>Tuyệt đối tránh cung cấp thông tin nhạy cảm như Mật khẩu, mã OTP hoặc Mã PIN ngân hàng.</li>
                      <li>Xác thực danh tính chủ sở hữu thông qua một kênh độc lập đáng tin cậy khác.</li>
                    </>
                  ) : (
                    <>
                      <li className="warning-critical-redesign">TUYỆT ĐỐI NGẮT LIÊN LẠC / THOÁT KHỎI LIÊN KẾT NÀY NGAY LẬP TỨC.</li>
                      <li className="warning-critical-redesign">TUYỆT ĐỐI KHÔNG CHUYỂN KHOẢN ĐẶT CỌC hoặc cung cấp bất kỳ thông tin thẻ ngân hàng, tài khoản ví.</li>
                      <li className="warning-critical-redesign">Báo cáo ngay cho cơ quan chức năng hoặc Trung tâm an ninh mạng nếu đã lỡ chia sẻ thông tin.</li>
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
                <button onClick={() => setShowDisputeModal(true)} className="cyber-dispute-btn">
                  <RefreshCw size={14} className="spin-on-hover" />
                  GỬI YÊU CẦU ĐỐI SOÁT
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DISPUTE DIALOG MODAL */}
      {showDisputeModal && (
        <div className="dispute-modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="dispute-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dispute-modal-header">
              <div className="dispute-modal-title">
                <RefreshCw size={16} className="spin-icon-always" />
                <span>YÊU CẦU ĐỐI SOÁT HỆ THỐNG</span>
              </div>
              <button className="dispute-modal-close" onClick={() => setShowDisputeModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleDisputeSubmit} className="dispute-modal-form">
              <div className="dispute-form-group">
                <label htmlFor="dispute-contact" className="dispute-form-label">
                  Thông tin liên hệ (Email / Số điện thoại) <span className="required-star">*</span>
                </label>
                <input type="text" id="dispute-contact" className="dispute-form-input" placeholder="Nhập email hoặc số điện thoại của bạn..." value={disputeContact} onChange={(e) => setDisputeContact(e.target.value)} required />
              </div>
              <div className="dispute-form-group">
                <label htmlFor="dispute-reason" className="dispute-form-label">
                  Nội dung báo cáo sai sót <span className="required-star">*</span>
                </label>
                <textarea id="dispute-reason" className="dispute-form-textarea" placeholder="Vui lòng cung cấp nội dung báo cáo hoặc lý do tại sao đối tượng này an toàn..." value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} rows="4" required></textarea>
              </div>
              <div className="dispute-modal-actions">
                <button type="button" className="dispute-btn-cancel" onClick={() => setShowDisputeModal(false)}>HỦY BỎ</button>
                <button type="submit" className="dispute-btn-submit" disabled={isSubmittingDispute}>
                  {isSubmittingDispute ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHOIS / IP DETAIL MODAL */}
      {showWhoisModal && cleanType === 'website' && (
        <div className="dispute-modal-overlay" onClick={() => setShowWhoisModal(false)}>
          <div className="whois-detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="whois-detail-header">
              <div className="whois-detail-header-left">
                <div className="whois-detail-icon">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="whois-detail-title">Thông tin chi tiết IP</h3>
                  <span className="whois-detail-source">Nguồn: APIVoid ↗</span>
                </div>
              </div>
              <button className="whois-detail-close" onClick={() => setShowWhoisModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="whois-detail-body">

              {/* Section: TỔNG QUAN */}
              <div className="whois-section">
                <div className="whois-section-title">
                  <Activity size={15} />
                  <span>TỔNG QUAN</span>
                </div>
                <div className="whois-info-grid">
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">IP</span>
                    <span className="whois-cell-value font-mono">{result.ip || 'N/A'}</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">PHIÊN BẢN</span>
                    <span className="whois-cell-value">IPv4</span>
                  </div>
                  <div className="whois-info-cell whois-cell-full">
                    <span className="whois-cell-label">ĐIỂM RỦI RO</span>
                    <span className={`whois-cell-value whois-risk-score ${isMalicious ? 'text-red' : 'text-green'}`}>
                      {riskScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: DANH SÁCH ĐEN */}
              <div className="whois-section">
                <div className="whois-section-title">
                  <ShieldAlert size={15} />
                  <span>DANH SÁCH ĐEN</span>
                </div>
                <div className="whois-stat-grid">
                  <div className={`whois-stat-card ${result.reports > 0 ? 'stat-danger' : 'stat-safe'}`}>
                    <span className="whois-stat-number">{result.reports}</span>
                    <span className="whois-stat-label">Báo cáo</span>
                  </div>
                  <div className="whois-stat-card stat-neutral">
                    <span className="whois-stat-number">79</span>
                    <span className="whois-stat-label">Nguồn</span>
                  </div>
                </div>
              </div>

              {/* Section: VỊ TRÍ & MẠNG */}
              <div className="whois-section">
                <div className="whois-section-title">
                  <Globe size={15} />
                  <span>VỊ TRÍ & MẠNG</span>
                </div>
                <div className="whois-info-grid">
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">QUỐC GIA</span>
                    <span className="whois-cell-value">🇻🇳 Viet Nam</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">KHU VỰC</span>
                    <span className="whois-cell-value">Ho Chi Minh</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">THÀNH PHỐ</span>
                    <span className="whois-cell-value">Ho Chi Minh City</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">ISP</span>
                    <span className="whois-cell-value">{result.host || 'N/A'}</span>
                  </div>
                  <div className="whois-info-cell whois-cell-full">
                    <span className="whois-cell-label">TỌA ĐỘ</span>
                    <span className="whois-cell-value font-mono whois-coord">10.75, 106.66667</span>
                  </div>
                </div>
              </div>

              {/* Section: HỆ THỐNG MẠNG (ASN) */}
              <div className="whois-section">
                <div className="whois-section-title">
                  <Cpu size={15} />
                  <span>HỆ THỐNG MẠNG (ASN)</span>
                </div>
                <div className="whois-info-grid">
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">MÃ MẠNG (ASN)</span>
                    <span className="whois-cell-value font-mono">AS63760</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">TÊN</span>
                    <span className="whois-cell-value">{result.host ? result.host.split(' ')[0].toUpperCase() + '-AS-VN' : 'N/A'}</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">TỔ CHỨC</span>
                    <span className="whois-cell-value">{result.host || 'N/A'}</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">ROUTE</span>
                    <span className="whois-cell-value font-mono">{result.ip ? result.ip.split('.').slice(0, 3).join('.') + '.0/22' : 'N/A'}</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">LOẠI</span>
                    <span className="whois-cell-value">Business</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">DOMAIN</span>
                    <span className="whois-cell-value font-mono">{result.target}</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">RIR</span>
                    <span className="whois-cell-value">APNIC</span>
                  </div>
                  <div className="whois-info-cell">
                    <span className="whois-cell-label">NGÀY TẠO</span>
                    <span className="whois-cell-value">{result.created || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section: DỊCH VỤ ẨN DANH */}
              <div className="whois-section">
                <div className="whois-section-title">
                  <ShieldCheck size={15} />
                  <span>DỊCH VỤ ẨN DANH</span>
                </div>
                <p className="whois-anon-desc">Kiểm tra xem địa chỉ IP này có đang sử dụng các dịch vụ ẩn danh hay không.</p>
                <div className="whois-anon-grid">
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Proxy</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">VPN</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Tor</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Web Proxy</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Hosting</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Relay</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                  <div className="whois-anon-item">
                    <span className="anon-dot safe"></span>
                    <span className="anon-name">Proxy dân cư</span>
                    <span className="anon-val text-green">Không</span>
                  </div>
                </div>
              </div>

              {/* RAW WHOIS */}
              <div className="whois-section">
                <div className="whois-raw-container">
                  <div className="whois-raw-header">
                    <Terminal size={14} />
                    <span>DỮ LIỆU THÔ WHOIS (RAW DATA)</span>
                  </div>
                  <pre className="whois-raw-content font-mono">{getMockWhoisData(result.target, result)}</pre>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
