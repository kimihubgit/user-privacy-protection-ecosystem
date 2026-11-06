import { Globe, Database, FileSearch, Sparkles } from 'lucide-react';
import './FeatureSection.css';

export default function FeatureSection() {
  const steps = [
    {
      step: 1,
      icon: <Globe size={32} strokeWidth={1.8} className="process-icon" />,
      title: 'Nhập URL',
      desc: 'Dán đường link cần kiểm tra.'
    },
    {
      step: 2,
      icon: <Database size={32} strokeWidth={1.8} className="process-icon" />,
      title: 'Đối chiếu danh sách',
      desc: 'So với danh sách an toàn và cảnh báo đã biết.'
    },
    {
      step: 3,
      icon: <FileSearch size={32} strokeWidth={1.8} className="process-icon" />,
      title: 'Thu thập bằng chứng',
      desc: 'Nội dung trang, tên miền, hạ tầng, thương hiệu, từ khóa.'
    },
    {
      step: 4,
      icon: <Sparkles size={32} strokeWidth={1.8} className="process-icon" />,
      title: 'Đưa ra kết luận',
      desc: 'Điểm rủi ro, phân loại và lý do chi tiết.'
    }
  ];

  return (
    <section className="feature-section process-steps-section" id="process">
      <div className="container">
        {/* Header Block */}
        <div className="process-header">
          <span className="process-badge">QUY TRÌNH</span>
          <h2 className="process-title">Một lần quét, bốn bước kiểm tra</h2>
        </div>

        {/* Steps Horizontal Track */}
        <div className="process-track-container">
          {/* Connecting Line between step 1 and step 4 */}
          <div className="process-connecting-line" aria-hidden="true"></div>

          {/* 4 Steps Grid */}
          <div className="process-steps-grid">
            {steps.map((item) => (
              <div key={item.step} className="process-step-item">
                <div className="process-icon-box">
                  {item.icon}
                  <span className="process-step-num">{item.step}</span>
                </div>
                <h3 className="process-step-title">{item.title}</h3>
                <p className="process-step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
