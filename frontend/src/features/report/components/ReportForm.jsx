import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, User, Mail, Loader2, ImagePlus, X, FileImage, Sparkles, Phone, MessageSquare, PenTool, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';

const COUNTRIES = [
  { code: '+84', name: 'Việt Nam', flag: '🇻🇳' },
  { code: '+1', name: 'Mỹ / Canada', flag: '🇺🇸' },
  { code: '+44', name: 'Vương Quốc Anh', flag: '🇬🇧' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+81', name: 'Nhật Bản', flag: '🇯🇵' },
  { code: '+82', name: 'Hàn Quốc', flag: '🇰🇷' },
  { code: '+61', name: 'Úc', flag: '🇦🇺' },
  { code: '+86', name: 'Trung Quốc', flag: '🇨🇳' },
  { code: '+886', name: 'Đài Loan', flag: '🇹🇼' },
  { code: '+33', name: 'Pháp', flag: '🇫🇷' },
  { code: '+49', name: 'Đức', flag: '🇩🇪' },
  { code: '+7', name: 'Nga', flag: '🇷🇺' },
  { code: '+66', name: 'Thái Lan', flag: '🇹🇭' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+855', name: 'Campuchia', flag: '🇰🇭' },
  { code: '+856', name: 'Lào', flag: '🇱🇦' },
  { code: '+91', name: 'Ấn Độ', flag: '🇮🇳' }
];

export default function ReportForm({ addToast, setActiveTab, onLoginToggle }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState('url'); // 'url' or 'scam'
  const [reportUrl, setReportUrl] = useState('');
  const [scamCategory, setScamCategory] = useState('phishing');

  // Auth synchronization state
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const isLoggedIn = !!token;

  // Form fields
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [submitterName, setSubmitterName] = useState(() => localStorage.getItem('userName') || '');
  const [submitterEmail, setSubmitterEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [submitterPhoneCode, setSubmitterPhoneCode] = useState('+84');
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [submitterContactOther, setSubmitterContactOther] = useState('');
  const [reportRole, setReportRole] = useState('victim'); // 'victim' or 'visitor'
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync token state if the user registers/logs in while on the page
  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken = localStorage.getItem('token');
      setToken(currentToken);
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Close country code dropdown on outside click
  useEffect(() => {
    if (!isPhoneDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.phone-code-dropdown-container')) {
        setIsPhoneDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isPhoneDropdownOpen]);

  // Auto pre-fill if logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        const storedName = localStorage.getItem('userName') || '';
        const storedEmail = localStorage.getItem('userEmail') || '';
        const storedPhone = localStorage.getItem('userPhone') || '';

        setSubmitterName(prev => prev || storedName);
        setSubmitterEmail(prev => prev || storedEmail);
        if (storedPhone) {
          setSubmitterPhone(prev => {
            if (prev) return prev;
            if (storedPhone.startsWith('+84')) {
              setSubmitterPhoneCode('+84');
              return storedPhone.substring(3);
            } else if (storedPhone.startsWith('0')) {
              setSubmitterPhoneCode('+84');
              return storedPhone.substring(1);
            } else {
              setSubmitterPhoneCode('+84');
              return storedPhone;
            }
          });
        }
      } else {
        setSubmitterName('');
        setSubmitterEmail('');
        setSubmitterPhone('');
        setSubmitterPhoneCode('+84');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // Signature States
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef(null);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [successReportId, setSuccessReportId] = useState('');

  const fileInputRef = useRef(null);

  const handleNext = () => {
    if (step === 3) {
      if (reportType === 'url') {
        if (!reportUrl.trim()) {
          addToast('Vui lòng nhập địa chỉ URL độc hại', 'error');
          return;
        }
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
        if (!urlPattern.test(reportUrl.trim())) {
          addToast('Địa chỉ URL không hợp lệ (Ví dụ: example.com hoặc https://example.com)', 'error');
          return;
        }
      }
      else {
        if (!description.trim()) {
          addToast('Vui lòng nhập nội dung tố cáo lừa đảo', 'error');
          return;
        }
        if (description.trim().length < 15) {
          addToast('Nội dung quá ngắn. Vui lòng nhập tối thiểu 15 ký tự để đội ngũ xử lý tốt hơn', 'error');
          return;
        }
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      addToast('Chỉ hỗ trợ file hình ảnh (JPG, PNG, GIF...)', 'error');
      return;
    }
    const newFiles = imageFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size
    }));
    setEvidenceFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => {
    setEvidenceFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].url);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a'; // Navy/Dark Slate
        ctx.lineWidth = 3.5;

        setHasSigned(false);
      };

      // Delay initialization slightly to let the CSS scalePopIn modal transition complete!
      const timer = setTimeout(initCanvas, 350);
      return () => clearTimeout(timer);
    }
  }, [showSignatureModal]);

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Self-healing check: resize drawing buffer to match layout scale if different
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
    }

    const ctx = canvas.getContext('2d');
    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn && !submitterEmail.trim()) {
      addToast('Vui lòng nhập email liên lạc', 'error');
      return;
    }
    if (!agreeTerms) {
      addToast('Bạn cần cam kết tính chính xác của thông tin', 'error');
      return;
    }
    setShowSignatureModal(true);
  };

  const executeSubmit = async () => {
    if (!hasSigned) {
      addToast('Vui lòng ký tên xác thực trước khi gửi', 'error');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    setSubmitting(true);
    setShowSignatureModal(false);

    try {
      const phoneRegex = /(?:(?:\+84|84|0)[35789])\d{8}\b/;
      const phoneMatch = description.match(phoneRegex);
      const phoneNumber = phoneMatch ? phoneMatch[0] : '';

      const bankRegex = /\b\d{8,16}\b/g;
      const bankMatches = description.match(bankRegex) || [];
      const bankAccountNumber = bankMatches.find(num => num !== phoneNumber) || '';

      let cleanedPhone = submitterPhone.trim().replace(/\s+/g, '');
      if (cleanedPhone.startsWith(submitterPhoneCode)) {
        cleanedPhone = cleanedPhone.substring(submitterPhoneCode.length);
      } else if (cleanedPhone.startsWith(submitterPhoneCode.substring(1))) {
        cleanedPhone = cleanedPhone.substring(submitterPhoneCode.length - 1);
      }
      cleanedPhone = cleanedPhone.replace(/^0+/, '');
      const fullPhone = cleanedPhone ? `${submitterPhoneCode}${cleanedPhone}` : '';

      let res;
      const finalName = submitterName.trim() || localStorage.getItem('userName') || 'anonymous';
      const finalEmail = submitterEmail.trim() || localStorage.getItem('userEmail') || 'anonymous@gmail.com';

      const submitterInfo = {
        name: finalName,
        email: finalEmail,
        phone: fullPhone,
        otherContact: submitterContactOther,
        signature: signatureDataUrl,
        role: reportRole
      };

      if (reportType === 'url') {
        const finalUrl = reportUrl.trim();
        const categoryLabels = {
          phishing: 'Giả mạo thương hiệu (Phishing)',
          malware: 'Mã độc / Cài đặt phần mềm độc hại',
          financial: 'Đầu tư lừa đảo / Việc làm giả',
          romance: 'Lừa đảo tình cảm / Mạng xã hội',
          prize: 'Lừa đảo trúng thưởng / Quà tặng',
          other: 'Khác'
        };
        const finalDescription = `Thể loại lừa đảo: ${categoryLabels[scamCategory] || scamCategory}`;
        res = await api.reportURL(finalUrl, 'scam', finalDescription, submitterInfo);
      } else {
        // reportType === 'scam' (type 0)
        if (bankAccountNumber) {
          res = await api.reportScammer({
            target: bankAccountNumber, type: 'bank_account',
            name: 'Báo cáo bóc tách', bankName: 'Phát hiện từ nội dung',
            description, evidenceUrl: evidenceFiles.length > 0 ? evidenceFiles[0].url : '',
            submitter: submitterInfo
          });
        } else if (phoneNumber) {
          res = await api.reportScammer({
            target: phoneNumber, type: 'phone',
            name: 'Báo cáo bóc tách', description,
            evidenceUrl: evidenceFiles.length > 0 ? evidenceFiles[0].url : '',
            submitter: submitterInfo
          });
        } else {
          res = await api.reportScammer({
            target: 'general', type: 'general',
            name: 'Báo cáo bóc tách', description,
            evidenceUrl: evidenceFiles.length > 0 ? evidenceFiles[0].url : '',
            submitter: submitterInfo
          });
        }
      }

      const reportId = res.data?.id || res.id || res.reportId || ('REP' + Math.floor(100000 + Math.random() * 900000));
      setSuccessReportId(reportId);
      addToast('Đã gửi báo cáo lừa đảo và chữ ký xác thực!', 'success');

      // Save report to local storage for logged-in users so they can manage it in Dashboard
      if (isLoggedIn) {
        try {
          const storedReports = JSON.parse(localStorage.getItem('user_reports') || '[]');
          const today = new Date();
          const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

          let targetText = reportType === 'url' ? (reportUrl || 'Báo cáo URL') : (bankAccountNumber || phoneNumber || 'Đối tượng lừa đảo');
          let typeText = reportType === 'url' ? 'Website độc hại' : 'Đối tượng lừa đảo';

          const newReportRecord = {
            id: reportId,
            target: targetText,
            type: typeText,
            date: formattedDate,
            status: 'pending'
          };

          storedReports.unshift(newReportRecord);
          localStorage.setItem('user_reports', JSON.stringify(storedReports));
        } catch (e) {
          console.error('Failed to save report to dashboard reports:', e);
        }
      }

      setStep(5);
    } catch (err) {
      console.error(err);
      addToast('Không thể gửi báo cáo, vui lòng thử lại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setReportRole('victim');
    setReportType('url');
    setReportUrl('');
    setScamCategory('phishing');
    setDescription('');
    setEvidenceFiles([]);
    setSubmitterName('');
    setSubmitterEmail('');
    setSubmitterPhone('');
    setSubmitterContactOther('');
    setAgreeTerms(false);
    setSuccessReportId('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="report-page">
      {/* Hero Section */}
      <div className="report-hero">
        <h1 className="report-hero-title">
          Báo Cáo <span className="gradient-text-danger">Lừa Đảo</span>
        </h1>
      </div>

      {/* Stepper */}
      {step < 5 && (
        <div className="report-stepper">
          <div className={`report-step ${step >= 1 ? 'active' : ''}`}>
            <div className="report-step-num">1</div>
            <span className="report-step-label">Vai trò</span>
          </div>
          <div className="report-step-line"></div>
          <div className={`report-step ${step >= 2 ? 'active' : ''}`}>
            <div className="report-step-num">2</div>
            <span className="report-step-label">Dạng báo cáo</span>
          </div>
          <div className="report-step-line"></div>
          <div className={`report-step ${step >= 3 ? 'active' : ''}`}>
            <div className="report-step-num">3</div>
            <span className="report-step-label">Nội dung & Bằng chứng</span>
          </div>
          <div className="report-step-line"></div>
          <div className={`report-step ${step >= 4 ? 'active' : ''}`}>
            <div className="report-step-num">4</div>
            <span className="report-step-label">Xác thực & Gửi</span>
          </div>
        </div>
      )}

      {/* Step 1: Submitter Role */}
      {step === 1 && (
        <div className="report-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="report-section-header" style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="report-section-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 62, 108, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} />
            </div>
            <div>
              <h3 className="report-section-title" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Bạn là ai trong vụ việc này?</h3>
              <p className="report-section-subtitle">Chọn vai trò phù hợp để chúng tôi hỗ trợ xử lý thông tin chính xác hơn</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Card 1: Victim */}
            <div
              onClick={() => setReportRole('victim')}
              style={{
                border: reportRole === 'victim' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: reportRole === 'victim' ? 'rgba(255, 62, 108, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: reportRole === 'victim' ? '0 8px 20px rgba(255, 62, 108, 0.08)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (reportRole !== 'victim') {
                  e.currentTarget.style.background = 'rgba(255, 62, 108, 0.01)';
                  e.currentTarget.style.borderColor = 'rgba(255, 62, 108, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (reportRole !== 'victim') {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: reportRole === 'victim' ? 'var(--primary)' : 'rgba(0, 0, 0, 0.05)',
                color: reportRole === 'victim' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease'
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tôi là nạn nhân</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Tôi là người trực tiếp bị lừa tiền, chiếm đoạt thông tin hoặc tài sản cá nhân.
                </p>
              </div>
            </div>

            {/* Card 2: Bystander/Helper */}
            <div
              onClick={() => setReportRole('visitor')}
              style={{
                border: reportRole === 'visitor' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                background: reportRole === 'visitor' ? 'rgba(0, 180, 216, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: reportRole === 'visitor' ? '0 8px 20px rgba(0, 180, 216, 0.08)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (reportRole !== 'visitor') {
                  e.currentTarget.style.background = 'rgba(0, 180, 216, 0.01)';
                  e.currentTarget.style.borderColor = 'rgba(0, 180, 216, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (reportRole !== 'visitor') {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: reportRole === 'visitor' ? 'var(--secondary)' : 'rgba(0, 0, 0, 0.05)',
                color: reportRole === 'visitor' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease'
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tôi báo cáo hộ</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Tôi phát hiện hành vi lừa đảo hoặc báo cáo hộ người thân, bạn bè bị hại.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button
              type="button"
              className="btn danger-btn"
              style={{ padding: '0.85rem 2rem', fontSize: '0.92rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setStep(2)}
            >
              <span>Tiếp tục</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Report Type */}
      {step === 2 && (
        <div className="report-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="report-section-header" style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="report-section-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 180, 216, 0.08)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="report-section-title" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Dạng báo cáo là gì?</h3>
              <p className="report-section-subtitle">Chọn dạng báo cáo phù hợp để phân loại và xử lý nhanh chóng hơn</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Card 1: URL Report */}
            <div
              onClick={() => setReportType('url')}
              style={{
                border: reportType === 'url' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                background: reportType === 'url' ? 'rgba(0, 180, 216, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: reportType === 'url' ? '0 8px 20px rgba(0, 180, 216, 0.08)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (reportType !== 'url') {
                  e.currentTarget.style.background = 'rgba(0, 180, 216, 0.01)';
                  e.currentTarget.style.borderColor = 'rgba(0, 180, 216, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (reportType !== 'url') {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: reportType === 'url' ? 'var(--secondary)' : 'rgba(0, 0, 0, 0.05)',
                color: reportType === 'url' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease'
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Báo cáo URL</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Báo cáo website giả mạo, trang web lừa đảo, hoặc chứa mã độc độc hại.
                </p>
              </div>
            </div>

            {/* Card 2: Scam Report */}
            <div
              onClick={() => setReportType('scam')}
              style={{
                border: reportType === 'scam' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: reportType === 'scam' ? 'rgba(255, 62, 108, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: reportType === 'scam' ? '0 8px 20px rgba(255, 62, 108, 0.08)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (reportType !== 'scam') {
                  e.currentTarget.style.background = 'rgba(255, 62, 108, 0.01)';
                  e.currentTarget.style.borderColor = 'rgba(255, 62, 108, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (reportType !== 'scam') {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: reportType === 'scam' ? 'var(--primary)' : 'rgba(0, 0, 0, 0.05)',
                color: reportType === 'scam' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease'
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Báo cáo lừa đảo</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Báo cáo số điện thoại lừa đảo, tài khoản ngân hàng, hoặc đối tượng lừa đảo.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleBack}
            >
              <ChevronLeft size={18} />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              className="btn danger-btn"
              style={{ padding: '0.85rem 2rem', fontSize: '0.92rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setStep(3)}
            >
              <span>Tiếp tục</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Content & Evidence */}
      {step === 3 && (
        <div className="report-card">
          <div className="report-grid">
            {reportType === 'url' ? (
              /* Left: URL Input for URL Report */
              <div className="report-col-main" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="report-section-header">
                  <div className="report-section-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="report-section-title">Thông tin URL</h3>
                    <p className="report-section-subtitle">Nhập địa chỉ website độc hại cần báo cáo</p>
                  </div>
                </div>

                <div className="report-field">
                  <label className="report-field-label">Địa chỉ URL / Website *</label>
                  <div className="report-input-wrap">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="report-input-icon" style={{ opacity: 0.6 }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <input
                      type="text"
                      className="report-input"
                      placeholder="Ví dụ: shopee-triankhachhang.net hoặc http://momo-nhan-loc.xyz"
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      style={{ height: '54px' }}
                    />
                  </div>
                </div>

                <div className="report-field">
                  <label className="report-field-label">Thể loại lừa đảo *</label>
                  <div className="report-input-wrap">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="report-input-icon" style={{ opacity: 0.6 }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <select
                      className="report-input"
                      value={scamCategory}
                      onChange={(e) => setScamCategory(e.target.value)}
                      style={{
                        height: '54px',
                        background: 'rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="phishing">Giả mạo thương hiệu (Phishing)</option>
                      <option value="malware">Mã độc / Cài đặt phần mềm độc hại</option>
                      <option value="financial">Đầu tư lừa đảo / Việc làm giả</option>
                      <option value="romance">Lừa đảo tình cảm / Mạng xã hội</option>
                      <option value="prize">Lừa đảo trúng thưởng / Quà tặng</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* Left: Description textarea for Scam Report */
              <div className="report-col-main">
                <div className="report-section-header">
                  <div className="report-section-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="report-section-title">Chi tiết sự việc</h3>
                    <p className="report-section-subtitle">Mô tả đầy đủ vụ lừa đảo bạn gặp phải</p>
                  </div>
                </div>
                <textarea
                  className="report-textarea"
                  placeholder={"Ví dụ: Kẻ lừa đảo dùng số điện thoại 0987654321 nhắn tin qua Zalo dụ dỗ em vào trang shopee-triankhachhang.net để làm nhiệm vụ trúng thưởng.\n\nHãy cung cấp: link website, số điện thoại, số tài khoản ngân hàng, tên kẻ lừa đảo, mạng xã hội liên quan, và mọi chi tiết bạn nhớ được.\n\nNhững thiệt hại mà kẻ scam gây ra cho bạn"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="report-textarea-footer">
                  <span className="report-textarea-hint">
                    💡 Gợi ý: Cung cấp thông tin chi tiết về vụ việc lừa đảo. Hệ thống sẽ tự động bóc tách URL, số tài khoản ngân hàng và số điện thoại từ nội dung bạn nhập.
                  </span>
                  <span className={`report-char-count ${description.length >= 15 ? 'valid' : ''}`}>
                    {description.length}/15
                  </span>
                </div>
              </div>
            )}

            {/* Right: Upload area */}
            <div className="report-col-side">
              <div className="report-section-header">
                <div className="report-section-icon upload-icon-badge">
                  <FileImage size={18} />
                </div>
                <div>
                  <h3 className="report-section-title">Hình ảnh bằng chứng</h3>
                  <p className="report-section-subtitle">Ảnh chụp màn hình, tin nhắn lừa đảo...</p>
                </div>
              </div>

              <div
                className={`report-upload-zone ${isDragOver ? 'drag-over' : ''} ${evidenceFiles.length > 0 ? 'has-files' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="report-upload-inner">
                  <div className="report-upload-icon-wrap">
                    <ImagePlus size={28} />
                  </div>
                  <p className="report-upload-title">Kéo thả ảnh vào đây</p>
                  <p className="report-upload-subtitle">
                    hoặc <span className="report-upload-browse">bấm để chọn file</span>
                  </p>
                  <p className="report-upload-formats">JPG, PNG, GIF, WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {/* File previews */}
              {evidenceFiles.length > 0 && (
                <div className="report-files">
                  <div className="report-files-header">
                    <span className="report-files-count">
                      <FileImage size={14} />
                      {evidenceFiles.length} ảnh đính kèm
                    </span>
                    <button
                      className="report-files-clear"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        evidenceFiles.forEach(f => URL.revokeObjectURL(f.url));
                        setEvidenceFiles([]);
                      }}
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="report-files-grid">
                    {evidenceFiles.map((file, idx) => (
                      <div key={idx} className="report-file-thumb">
                        <img src={file.url} alt={file.name} />
                        <div className="report-file-overlay">
                          <span className="report-file-name">{file.name}</span>
                          <span className="report-file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          className="report-file-remove"
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="report-nav">
            <button className="btn btn-ghost report-nav-btn" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronLeft size={18} />
              <span>Quay lại</span>
            </button>
            <button className="btn btn-primary report-nav-btn" onClick={handleNext}>
              Tiếp Theo
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm & Submit */}
      {step === 4 && (
        <div className="report-card">
          <form onSubmit={handleSubmit}>
            <div className="report-confirm-grid">
              {/* Preview summary */}
              <div className="report-preview">
                <div className="report-section-header">
                  <div className="report-section-icon">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="report-section-title">Tóm tắt báo cáo</h3>
                    <p className="report-section-subtitle">Xem lại nội dung trước khi gửi</p>
                  </div>
                </div>
                <div className="report-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {reportType === 'url' ? (
                    <>
                      <p style={{ margin: 0 }}><strong>Địa chỉ URL:</strong> <span style={{ color: 'var(--secondary)', wordBreak: 'break-all' }}>{reportUrl}</span></p>
                      <p style={{ margin: 0 }}><strong>Thể loại lừa đảo:</strong> {
                        scamCategory === 'phishing' ? 'Giả mạo thương hiệu (Phishing)' :
                          scamCategory === 'malware' ? 'Mã độc / Cài đặt phần mềm độc hại' :
                            scamCategory === 'financial' ? 'Đầu tư lừa đảo / Việc làm giả' :
                              scamCategory === 'romance' ? 'Lừa đảo tình cảm / Mạng xã hội' :
                                scamCategory === 'prize' ? 'Lừa đảo trúng thưởng / Quà tặng' : 'Khác'
                      }</p>
                    </>
                  ) : (
                    <p style={{ margin: 0 }}>{description}</p>
                  )}
                </div>
                {evidenceFiles.length > 0 && (
                  <div className="report-preview-images">
                    {evidenceFiles.map((file, idx) => (
                      <div key={idx} className="report-preview-img-wrap">
                        <img src={file.url} alt={file.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="report-contact">
                <div className="report-section-header">
                  <div className="report-section-icon">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="report-section-title">Thông tin liên hệ</h3>
                    <p className="report-section-subtitle">Để nhận cập nhật xử lý</p>
                  </div>
                </div>

                {isLoggedIn ? (
                  <div style={{
                    background: 'rgba(35, 181, 108, 0.08)',
                    border: '1px solid rgba(35, 181, 108, 0.2)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#23b56c'
                  }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      Đang báo cáo với vai trò: <strong>{localStorage.getItem('userName') || 'Thành viên'}</strong> (Thông tin đã được tự động điền).
                    </span>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(0, 180, 216, 0.08)',
                    border: '1px solid rgba(0, 180, 216, 0.2)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    color: '#00b4d8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Bạn chưa đăng nhập. Đăng nhập để lưu lịch sử và theo dõi trạng thái báo cáo.
                      </span>
                    </div>
                    {onLoginToggle && (
                      <button
                        type="button"
                        onClick={onLoginToggle}
                        style={{
                          background: '#00b4d8',
                          color: '#fff',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Đăng nhập ngay
                      </button>
                    )}
                  </div>
                )}

                {!isLoggedIn && (
                  <>
                    <div className="report-field">
                      <label className="report-field-label">Địa chỉ Email *</label>
                      <div className="report-input-wrap">
                        <Mail size={16} className="report-input-icon" />
                        <input
                          type="email"
                          className="report-input"
                          placeholder="email@example.com"
                          required
                          value={submitterEmail}
                          onChange={(e) => setSubmitterEmail(e.target.value)}
                        />
                      </div>
                      <span className="report-field-hint">Dùng để xác thực và cập nhật trạng thái xử lý</span>
                    </div>

                    <div className="report-field">
                      <label className="report-field-label">Họ tên (Tùy chọn)</label>
                      <div className="report-input-wrap">
                        <User size={16} className="report-input-icon" />
                        <input
                          type="text"
                          className="report-input"
                          placeholder="Nhập họ và tên..."
                          value={submitterName}
                          onChange={(e) => setSubmitterName(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="report-field">
                  <label className="report-field-label">Số điện thoại (Tùy chọn)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="phone-code-dropdown-container" style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="report-input"
                        style={{
                          width: '115px',
                          height: '54px',
                          padding: '0 0.5rem 0 1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(0, 0, 0, 0.02)',
                          boxSizing: 'border-box',
                          gap: '0.25rem',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.95rem'
                        }}
                        onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          fontSize: '1.25rem',
                          lineHeight: 1
                        }}>
                          {COUNTRIES.find(c => c.code === submitterPhoneCode)?.flag || '🇻🇳'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {submitterPhoneCode}
                        </span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7, transform: isPhoneDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {isPhoneDropdownOpen && (
                        <div className="glass-card" style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '6px',
                          width: '280px',
                          maxHeight: '320px',
                          overflow: 'hidden',
                          zIndex: 1000,
                          background: 'var(--bg-card, #ffffff)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)'
                        }}>
                          <div style={{ padding: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                            <input
                              type="text"
                              placeholder="Tìm quốc gia, mã số..."
                              style={{
                                width: '100%',
                                padding: '0.6rem 0.85rem',
                                fontSize: '0.85rem',
                                background: 'rgba(0, 0, 0, 0.02)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontFamily: 'var(--font-sans)'
                              }}
                              value={phoneSearchQuery}
                              onChange={(e) => setPhoneSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }}>
                            {COUNTRIES.filter(c =>
                              c.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
                              c.code.includes(phoneSearchQuery)
                            ).length > 0 ? (
                              COUNTRIES.filter(c =>
                                c.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
                                c.code.includes(phoneSearchQuery)
                              ).map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: c.code === submitterPhoneCode ? 'rgba(0, 150, 190, 0.06)' : 'transparent',
                                    border: 'none',
                                    color: c.code === submitterPhoneCode ? 'var(--secondary)' : 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    gap: '0.5rem',
                                    fontFamily: 'var(--font-sans)'
                                  }}
                                  onClick={() => {
                                    setSubmitterPhoneCode(c.code);
                                    setIsPhoneDropdownOpen(false);
                                    setPhoneSearchQuery('');
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 150, 190, 0.04)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = c.code === submitterPhoneCode ? 'rgba(0, 150, 190, 0.06)' : 'transparent'}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      fontSize: '1.25rem',
                                      lineHeight: 1
                                    }}>
                                      {c.flag}
                                    </span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{c.name}</span>
                                  </div>
                                  <span style={{ fontSize: '0.88rem', fontWeight: 700, opacity: 0.8, fontFamily: 'monospace' }}>{c.code}</span>
                                </button>
                              ))
                            ) : (
                              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Không tìm thấy quốc gia
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="report-input-wrap" style={{ flexGrow: 1 }}>
                      <Phone size={16} className="report-input-icon" />
                      <input
                        type="tel"
                        className="report-input"
                        placeholder="Nhập số điện thoại..."
                        value={submitterPhone}
                        onChange={(e) => setSubmitterPhone(e.target.value)}
                        style={{
                          height: '54px',
                          paddingTop: 0,
                          paddingBottom: 0,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="report-field">
                  <label className="report-field-label">Hình thức liên hệ khác (Tùy chọn)</label>
                  <div className="report-input-wrap">
                    <MessageSquare size={16} className="report-input-icon" />
                    <input
                      type="text"
                      className="report-input"
                      placeholder="Zalo, Telegram, Facebook..."
                      value={submitterContactOther}
                      onChange={(e) => setSubmitterContactOther(e.target.value)}
                    />
                  </div>
                </div>

                <div className="report-terms">
                  <label className="report-terms-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="report-checkbox"
                    />
                    <span>
                      Tôi cam kết các thông tin và bằng chứng khai báo trên đây là hoàn toàn chính xác. Tôi đồng ý chịu trách nhiệm pháp lý nếu có hành vi cố tình bôi nhọ, khai báo sai sự thật.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="report-nav">
              <button type="button" className="btn btn-secondary report-nav-btn" onClick={handleBack} disabled={submitting}>
                <ChevronLeft size={18} />
                Quay Lại
              </button>
              <button type="submit" className="btn btn-primary report-nav-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi Báo Cáo
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="report-card report-success-card">
          <div className="report-success">
            <div className="report-success-icon">
              <CheckCircle2 size={44} />
              <div className="report-success-ring"></div>
              <div className="report-success-ring ring-2"></div>
            </div>
            <h2 className="report-success-title">
              Gửi Báo Cáo <span className="gradient-text">Thành Công!</span>
            </h2>
            <p className="report-success-desc">
              Hệ thống đã ghi nhận báo cáo của bạn. Các chuyên viên an ninh mạng sẽ kiểm duyệt bằng chứng trước khi đồng bộ lên danh sách đen.
            </p>

            <div className="report-success-id">
              <span className="report-success-id-label">Mã số báo cáo</span>
              <div className="report-id-badge">{successReportId}</div>
            </div>

            <div className="report-success-actions">
              <button className="btn btn-primary report-nav-btn" onClick={handleResetForm}>
                <Sparkles size={16} />
                Tạo Báo Cáo Mới
              </button>
              <button className="btn btn-secondary report-nav-btn" onClick={() => setActiveTab('checker')}>
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Verification Modal Overlay */}
      {showSignatureModal && (
        <div className="signature-modal-overlay">
          <div className="signature-modal">
            <h3 className="signature-modal-title">
              <PenTool size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Ký Tên Xác Thực Báo Cáo
            </h3>
            <p className="signature-modal-desc">
              Vui lòng ký tên của bạn vào khung bên dưới để xác thực tính cam kết của báo cáo này. Bản vẽ chữ ký sẽ được lưu cùng hồ sơ gửi.
            </p>

            <div className={`signature-canvas-wrap ${isDrawing ? 'is-drawing' : ''}`}>
              <canvas
                ref={canvasRef}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <span className="signature-canvas-hint">Ký tên tại đây</span>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setShowSignatureModal(false)}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <div className="signature-btn-left">
                <button
                  type="button"
                  className="btn btn-secondary report-nav-btn"
                  onClick={clearSignature}
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Trash2 size={16} />
                  Ký lại
                </button>
                <button
                  type="button"
                  className="btn btn-primary report-nav-btn"
                  onClick={executeSubmit}
                  disabled={submitting}
                >
                  Xác nhận & Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
