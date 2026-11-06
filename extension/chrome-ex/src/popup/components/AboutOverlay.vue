<template>
  <div id="about-overlay" class="about-overlay">
    <!-- Glowing background effects -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    
    <!-- Floating Close Button -->
    <button class="about-close-btn" @click="$emit('close')" :aria-label="t('cookie.btn_close') || 'Đóng'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Unified container -->
    <div class="about-unified-container">
      
      <!-- Content Header -->
      <div class="about-header">
        <div class="about-brand-header">
          <div class="shield-badge-glowing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shield-svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div class="shield-pulse-ring"></div>
          </div>
          <div class="brand-text-block">
            <h2 class="brand-name-glow">Giới Thiệu KiGuard Privacy</h2>
            <div class="brand-subtitle-tech">
              <span>HỆ THỐNG BẢO VỆ QUYỀN RIÊNG TƯ & AN NINH MẠNG TOÀN DIỆN</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="about-grid">
        <!-- Left Panel: Product Overview & Privacy Focus -->
        <div class="about-left-panel">
          <div class="glass-card main-summary">
            <div class="card-glow-border"></div>
            
            <h3 class="panel-section-title" style="margin-bottom: 8px;">Mục Tiêu Bảo Vệ</h3>
            <p class="summary-paragraph">
              <strong>KiGuard</strong> là giải pháp bảo vệ quyền riêng tư và an toàn thông tin cá nhân hàng đầu khi bạn duyệt web hằng ngày.
            </p>
            <p class="summary-paragraph">
              Tiện ích hoạt động xử lý trực tiếp tại thiết bị cục bộ, tự động ngăn chặn nguy cơ lừa đảo trực tuyến, làm mờ dữ liệu cá nhân nhạy cảm, chặn sạch quảng cáo phiền phức và ngăn các công ty quảng cáo theo dõi hành vi của bạn.
            </p>

            <div class="privacy-note-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="#50cd89" stroke-width="2" width="16" height="16" style="flex-shrink: 0; margin-top: 1px;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <span>100% Bảo mật dữ liệu nội bộ. Không thu thập, lưu trữ hay chia sẻ lịch sử duyệt web của bạn ra máy chủ bên ngoài.</span>
            </div>
          </div>
        </div>

        <!-- Right Panel: Key Features List -->
        <div class="about-right-panel">
          <h3 class="panel-section-title">Danh Sách Tính Năng Bảo Vệ</h3>
          <div class="features-scrollable-area">
            
            <!-- Feature 1 -->
            <div class="shield-card-premium block-glow-blue">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Lá Chắn Chống Lừa Đảo (Web Shield)</span>
                </div>
                <p class="shield-desc">Tự động phát hiện và cảnh báo chặn truy cập các trang web giả mạo ngân hàng, độc hại, lừa đảo trực tuyến.</p>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="shield-card-premium block-glow-teal">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Bộ Lọc Quảng Cáo (Adblocker)</span>
                </div>
                <p class="shield-desc">Chặn sạch quảng cáo phiền phức, banner, video ads và cửa sổ tự động mở (popups).</p>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="shield-card-premium block-glow-indigo">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Lá Chắn Che Mờ Dữ Liệu (DataBlur)</span>
                </div>
                <p class="shield-desc">Tự động nhận diện và làm mờ Email, SĐT, Thẻ tín dụng, Mật khẩu hiển thị trên trang web tránh lộ thông tin.</p>
              </div>
            </div>

            <!-- Feature 4 -->
            <div class="shield-card-premium block-glow-danger">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6" y2="6.01"></line>
                  <line x1="6" y1="18" x2="6" y2="18.01"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Kết Nối Proxy & Fake GPS Vị Trí</span>
                </div>
                <p class="shield-desc">Tạo kết nối Proxy ẩn danh mã hóa, đồng thời tự động giả lập GPS, Timezone và User-Agent đồng bộ theo IP Proxy.</p>
              </div>
            </div>


            <!-- Feature 6 -->
            <div class="shield-card-premium block-glow-blue">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Vệ Sĩ Tự Động Xóa Cookie</span>
                </div>
                <p class="shield-desc">Tự động dọn dẹp Cookie và bộ nhớ đệm khi đóng tab hoặc đổi trang web để ngăn chặn bám vết hành vi.</p>
              </div>
            </div>

            <!-- Feature 7 -->
            <div class="shield-card-premium block-glow-indigo">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Két Sắt Mã Hóa 2FA Vault</span>
                </div>
                <p class="shield-desc">Lưu trữ và quản lý mã OTP xác thực 2 lớp an toàn, mã hóa đầu cuối với PIN chủ cá nhân bảo vệ tối đa.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'AboutOverlay',
  emits: ['close'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
.about-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0b0c13 !important;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 16px 24px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* Background Glowing Orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.15;
  z-index: 0;
}

.orb-1 {
  top: -10%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--primary-blue, #009ef7) 0%, rgba(0,0,0,0) 70%);
}

.orb-2 {
  bottom: -10%;
  right: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--accent-indigo, #8950fc) 0%, rgba(0,0,0,0) 70%);
}

.about-close-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #5e6278);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  z-index: 10;
}

.about-close-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg) scale(1.05);
}

.about-unified-container {
  width: 100%;
  max-width: 680px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px 0;
  position: relative;
  z-index: 1;
  animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header Section */
.about-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 10px;
  margin-bottom: 14px;
}

.about-brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shield-badge-glowing {
  position: relative;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(0, 158, 247, 0.2) 0%, rgba(137, 80, 252, 0.2) 100%);
  border: 1px solid rgba(0, 158, 247, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #009ef7;
}

.shield-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 4px #009ef7);
  animation: shieldPulse 2.5s infinite ease-in-out;
}

@keyframes shieldPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.9; }
}

.shield-pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 12px;
  border: 1px solid rgba(0, 158, 247, 0.25);
  animation: pulseRing 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
  pointer-events: none;
}

@keyframes pulseRing {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0; }
}

.brand-text-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-name-glow {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.3px;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 30%, #a1a5b7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle-tech {
  font-size: 8.5px;
  font-weight: 700;
  color: var(--text-muted, #5e6278);
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot-separator {
  color: rgba(255, 255, 255, 0.15);
}

.status-online-text {
  color: #50cd89;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-online-text::before {
  content: '';
  width: 4.5px;
  height: 4.5px;
  background-color: #50cd89;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px #50cd89;
}

/* Grid System */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 16px;
  flex-grow: 1;
  min-height: 0;
}

/* Glass Cards styling */
.glass-card {
  position: relative;
  background: rgba(30, 30, 45, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.card-glow-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #009ef7, #8950fc);
  opacity: 0.6;
}

.about-left-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

.main-summary {
  padding: 14px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.summary-paragraph {
  font-size: 10.5px;
  line-height: 1.55;
  color: #a1a5b7;
  margin: 0 0 14px 0;
}

.privacy-note-box {
  margin-top: auto;
  background: rgba(80, 205, 137, 0.06);
  border: 1px solid rgba(80, 205, 137, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 10px;
  line-height: 1.45;
  color: #50cd89;
  font-weight: 500;
}

/* Right Panel: Feature list styling */
.about-right-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

.panel-section-title {
  font-size: 10.5px;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-section-title::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.06);
}

.features-scrollable-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 6px;
}

/* Custom premium scrollbar */
.features-scrollable-area::-webkit-scrollbar {
  width: 4px;
}

.features-scrollable-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.01);
}

.features-scrollable-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}

.features-scrollable-area::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 158, 247, 0.3);
}

/* Premium Shield Card Styling */
.shield-card-premium {
  position: relative;
  display: flex;
  gap: 10px;
  background: rgba(30, 30, 45, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px 12px;
  align-items: flex-start;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  flex-shrink: 0; /* CRITICAL: Prevent cards from shrinking/collapsing into each other */
  box-sizing: border-box;
}

.shield-card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: transparent;
  transition: background-color 0.3s;
}

.shield-card-premium:hover {
  transform: translateX(4px);
  background: rgba(30, 30, 45, 0.6);
}

/* Color codes */
.block-glow-blue:hover { border-color: rgba(0, 158, 247, 0.25); }
.block-glow-blue:hover .shield-card-border { background-color: #009ef7; }
.block-glow-teal:hover { border-color: rgba(80, 205, 137, 0.25); }
.block-glow-teal:hover .shield-card-border { background-color: #50cd89; }
.block-glow-indigo:hover { border-color: rgba(137, 80, 252, 0.25); }
.block-glow-indigo:hover .shield-card-border { background-color: #8950fc; }
.block-glow-danger:hover { border-color: rgba(241, 65, 108, 0.25); }
.block-glow-danger:hover .shield-card-border { background-color: #f1416c; }
.block-glow-warning:hover { border-color: rgba(241, 188, 25, 0.25); }
.block-glow-warning:hover .shield-card-border { background-color: #f1bc19; }

.shield-icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.shield-icon-wrapper.b-blue { background-color: rgba(0, 158, 247, 0.1); color: #009ef7; }
.shield-icon-wrapper.b-teal { background-color: rgba(80, 205, 137, 0.1); color: #50cd89; }
.shield-icon-wrapper.b-indigo { background-color: rgba(137, 80, 252, 0.1); color: #8950fc; }
.shield-icon-wrapper.b-danger { background-color: rgba(241, 65, 108, 0.1); color: #f1416c; }
.shield-icon-wrapper.b-warning { background-color: rgba(241, 188, 25, 0.1); color: #f1bc19; }

.shield-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.shield-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.shield-title {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.shield-status-active {
  font-size: 7.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #50cd89;
  background-color: rgba(80, 205, 137, 0.08);
  padding: 0.5px 3.5px;
  border-radius: 3px;
}

.shield-desc {
  font-size: 9.5px;
  line-height: 1.4;
  color: #a1a5b7;
  margin: 0;
  word-break: break-word;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
