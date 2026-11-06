import { useState } from 'react';
import { Shield, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import './FeatureSection.css';

export default function FeatureSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'Tiện ích miễn phí',
      highlightTitle: 'AN TOÀN TRONG TẦM TAY',
      desc: 'Cốt lõi của hệ thống danh sách chặn shield là bảo vệ người dùng Internet một cách tự động và âm thầm khi bạn sử dụng các trình duyệt sau: Microsoft Edge, Chrome, Opera, Brave, Firefox và Cốc Cốc. Ngoài ra, dữ liệu danh sách chặn của chúng tôi được tích hợp vào OpenDNS, NextDNS, Twitter và nhiều nhà cung cấp phần mềm diệt virus phổ biến.',
      graphic: (
        <div className="laptop-screen-slide slide-security">
          {/* Animated safe browser mockup */}
          <div className="browser-mockup">
            <div className="browser-header">
              <div className="browser-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="browser-address">
                <Shield size={10} color="#23b56c" fill="#23b56c" />
                <span>shield.vn/checker</span>
              </div>
            </div>
            <div className="browser-body">
              <div className="security-status-box">
                <div className="globe-graphic-wrapper">
                  <div className="globe-glow-circle"></div>
                  <Globe size={44} className="globe-icon-spin" />
                  <div className="globe-shield-badge">
                    <Shield size={14} fill="#23b56c" color="#fff" />
                  </div>
                </div>
                <div className="status-text">
                  <h3>ĐÃ ĐƯỢC BẢO VỆ</h3>
                  <p>Tiện ích mở rộng đang bảo vệ bạn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: 'Bảo mật đa nền tảng',
      highlightTitle: 'CHẶN CẢNH BÁO TỨC THÌ',
      desc: 'Hệ thống rà quét tự động đối soát hàng triệu tên miền độc hại trong thời gian thực. Tích hợp trực tiếp dữ liệu chặn vào các máy chủ phân phối mạng DNS và các chương trình chống virus giúp ngăn chặn hành vi lừa đảo ngay lập tức.',
      graphic: (
        <div className="laptop-screen-slide slide-dns">
          {/* Dynamic DNS Dashboard mockup */}
          <div className="dns-mockup">
            <div className="dns-header">
              <span>NextDNS & OpenDNS Threat Feed</span>
              <span className="status-badge">ACTIVE</span>
            </div>
            <div className="dns-body">
              <div className="dns-radar">
                <div className="radar-circle circle-1"></div>
                <div className="radar-circle circle-2"></div>
                <div className="radar-sweep"></div>
                <Shield size={28} color="var(--secondary)" className="dns-shield" />
              </div>
              <div className="dns-logs">
                <div className="log-line text-green">&gt; NextDNS feed synced.</div>
                <div className="log-line text-green">&gt; Guarding active gateway.</div>
                <div className="log-line text-yellow">&gt; Blocked: fakebank-signin.vn</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[activeSlide];

  return (
    <section className="feature-section">
      <div className="container" style={{ position: 'relative', width: '100%' }}>

        {/* Slider Container */}
        <div className="slider-container-box">
          {/* Grid Layout: Text on Left, Laptop frame on Right */}
          <div className="feature-grid">

            {/* Left Column: Text Titles & Description */}
            <div className="feature-text-content">
              <span className="feature-small-title">{current.title}</span>
              <h2 className="feature-main-title">
                {current.highlightTitle.split(' ').slice(0, 2).join(' ')}<br />
                <span>{current.highlightTitle.split(' ').slice(2).join(' ')}</span>
              </h2>

              <p className="feature-footer-desc">{current.desc}</p>

            </div>

            {/* Right Column: Visual Laptop mockup */}
            <div className="feature-visuals-laptop">
              <div className="laptop-mockup-wrapper">
                {/* Navigation Arrows positioned on the laptop mockup */}
                <button className="slider-arrow arrow-left" onClick={handlePrev} aria-label="Previous Slide">
                  <ChevronLeft size={22} />
                </button>

                <button className="slider-arrow arrow-right" onClick={handleNext} aria-label="Next Slide">
                  <ChevronRight size={22} />
                </button>

                {/* Laptop base SVG */}
                <svg className="laptop-svg-frame" viewBox="0 0 949.69 519.4" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path fill="#4C4A4B" d="M850.6,0H99.09c-8.04,0-14.55,6.52-14.55,14.55v465.59h780.62V14.55C865.15,6.52,858.64,0,850.6,0z M855.74,461.79c0,5.37-4.35,9.72-9.72,9.72H103.67c-5.37,0-9.72-4.35-9.72-9.72V18.35c0-5.37,4.35-9.72,9.72-9.72h742.35c5.37,0,9.72,4.35,9.72,9.72V461.79z"></path>
                    <g>
                      <path fill="#B7B7B7" d="M924.13,519.4H25.55C11.44,519.4,0,507.96,0,493.85l0-13.71h949.69v13.71C949.69,507.96,938.25,519.4,924.13,519.4z"></path>
                      <path fill="#C5C5C5" d="M560.37,499.86H389.32c-7.09,0-12.84-5.75-12.84-12.84v-6.88h196.72v6.88C573.21,494.11,567.46,499.86,560.37,499.86z"></path>
                    </g>
                  </g>
                </svg>
                {/* Inner Screen overlay clipping viewport */}
                <div className="laptop-screen-content">
                  <div
                    className="screen-slider-track"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {slides.map((slide) => (
                      <div key={slide.id} className="screen-slide-item">
                        {slide.graphic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Indicators dots */}
          <div className="slider-dots">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`dot-indicator ${activeSlide === idx ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
              ></span>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
