import { useState, useEffect } from 'react';
import { Globe, Phone, Mail, Database, FileSearch, Sparkles, Check } from 'lucide-react';
import './ScanFlow.css';

const STEP_AT = [0, 0, 2, 5];

const STATUS_MESSAGES = [
  'Đang tiếp nhận và phân tích dữ liệu mục tiêu…',
  'Đối chiếu với danh sách an toàn và cảnh báo đã biết…',
  'Thu thập nội dung trang, tên miền, hạ tầng & chứng chỉ…',
  'Phân tích bằng chứng và chấm điểm rủi ro tự động…'
];

function getStepForElapsed(elapsed) {
  let step = 1;
  for (let i = 2; i < STEP_AT.length; i++) {
    if (elapsed >= STEP_AT[i]) step = i;
  }
  return step;
}

export default function ScanFlow({ target = '', cleanType = 'website' }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = getStepForElapsed(elapsed);

  const Step1Icon = cleanType === 'phone' ? Phone : cleanType === 'email' ? Mail : Globe;

  const steps = [
    {
      id: 0,
      icon: Step1Icon,
      title: cleanType === 'phone' ? 'Nhập SĐT / STK' : cleanType === 'email' ? 'Nhập Email' : 'Nhập URL',
      desc: 'Dán đường link hoặc đối tượng cần kiểm tra.'
    },
    {
      id: 1,
      icon: Database,
      title: 'Đối chiếu danh sách',
      desc: 'So với danh sách an toàn và cảnh báo đã biết.'
    },
    {
      id: 2,
      icon: FileSearch,
      title: 'Thu thập bằng chứng',
      desc: 'Nội dung trang, tên miền, hạ tầng, thương hiệu, từ khóa.'
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Đưa ra kết luận',
      desc: 'Điểm rủi ro, phân loại và lý do chi tiết.'
    }
  ];

  return (
    <div className="scan-flow-wrapper" role="status" aria-live="polite">
      <div className="scan-flow-eyebrow">
        <span className="scan-flow-live-dot"></span>
        <span>Đang kiểm tra an toàn</span>
      </div>

      <h2 className="scan-flow-title">
        Một lần quét, bốn bước kiểm tra
      </h2>

      <div className="scan-flow-grid">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          const isIdle = idx > currentStep;
          const stepClass = isDone ? 'done' : isActive ? 'active' : 'idle';

          // Segment state connecting to the next item
          const segmentClass = idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'idle';

          return (
            <div key={item.id} className={`scan-flow-step-item ${stepClass}`}>
              {/* Connecting line to the right (only for steps 0, 1, 2) */}
              {idx < steps.length - 1 && (
                <div className={`scan-flow-segment ${segmentClass}`}>
                  {segmentClass === 'done' && <div className="segment-fill"></div>}
                  {segmentClass === 'active' && <div className="segment-beam"></div>}
                </div>
              )}

              <div className="scan-flow-icon-box">
                {isActive && <div className="scan-flow-pulse-ring"></div>}
                {isActive && <div className="scan-flow-laser-line"></div>}

                <Icon size={26} strokeWidth={isActive ? 2.2 : 1.8} />

                <span className="scan-flow-badge-num">
                  {isDone ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    idx + 1
                  )}
                </span>
              </div>

              <div className="scan-flow-step-text">
                <h3 className="scan-flow-step-title">{item.title}</h3>
                <p className="scan-flow-step-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="scan-flow-status-bar">
        <p className="scan-flow-status-msg" key={currentStep}>
          {STATUS_MESSAGES[currentStep]}
        </p>
        <span className="scan-flow-elapsed">
          Đã chờ {elapsed} giây · tối đa khoảng 15 giây
        </span>
      </div>
    </div>
  );
}

