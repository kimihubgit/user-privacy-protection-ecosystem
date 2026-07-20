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
      
      <!-- Content Header with Futuristic Styling -->
      <div class="about-header">
        <div class="about-brand-header">
          <div class="shield-badge-glowing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shield-svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div class="shield-pulse-ring"></div>
          </div>
          <div class="brand-text-block">
            <h2 class="brand-name-glow">KiGuard Detector</h2>
            <div class="brand-subtitle-tech">
              <span>SECURITY ENGINE v1.0</span>
              <span class="dot-separator">•</span>
              <span class="status-online-text">ACTIVE PROTECTION</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="about-grid">
        <!-- Left Panel: Product details & credentials combined in a single card to optimize height -->
        <div class="about-left-panel">
          <div class="glass-card main-summary">
            <div class="card-glow-border"></div>
            
            <p class="summary-paragraph">
              KiGuard là lá chắn bảo mật hoạt động trực tiếp tại thiết bị cục bộ. 
              Hệ thống tự động phát hiện, ngăn chặn mối đe dọa trực tuyến và bảo vệ dữ liệu nhạy cảm theo thời gian thực mà không thu thập lịch sử duyệt web của bạn.
            </p>
            
            <div class="metadata-section">
              <h4 class="tech-label">System Metadata</h4>
              <div class="metadata-rows">
                <div class="metadata-row">
                  <span class="meta-lbl">Engine:</span>
                  <span class="meta-val">Vite / Vue 3 / MV3</span>
                </div>
                <div class="metadata-row">
                  <span class="meta-lbl">Developer:</span>
                  <a href="https://blog.kimidev.net" target="_blank" class="meta-val-link">Kimidev</a>
                </div>
                <div class="metadata-row">
                  <span class="meta-lbl">Official Site:</span>
                  <a href="https://blog.kimidev.net" target="_blank" class="meta-val-link">blog.kimidev.net</a>
                </div>
                <div class="metadata-row">
                  <span class="meta-lbl">License:</span>
                  <span class="meta-val-highlight">MIT License</span>
                </div>
              </div>
            </div>
            
            <div class="copyright-text">
              © 2026 KiGuard Project. Crafted with care.
            </div>
          </div>
        </div>

        <!-- Right Panel: Key Features Interactive List -->
        <div class="about-right-panel">
          <h3 class="panel-section-title">Core Security Shields</h3>
          <div class="features-scrollable-area">
            
            <!-- Shield 1 -->
            <div class="shield-card-premium block-glow-blue">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Web Threat Prevention</span>
                  <span class="shield-status-active">ONLINE</span>
                </div>
                <p class="shield-desc">Chặn đứng các trang web lừa đảo, tấn công giả mạo (phishing) dựa trên cơ sở dữ liệu thời gian thực.</p>
              </div>
            </div>

            <!-- Shield 2 -->
            <div class="shield-card-premium block-glow-teal">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">PII Data Blur Masking</span>
                  <span class="shield-status-active">ONLINE</span>
                </div>
                <p class="shield-desc">Tự động quét và làm mờ Email, SĐT, số tài khoản trên màn hình bằng công nghệ làm mờ thông minh.</p>
              </div>
            </div>

            <!-- Shield 3 -->
            <div class="shield-card-premium block-glow-indigo">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Anti-Fingerprint Spoofing</span>
                  <span class="shield-status-active">ONLINE</span>
                </div>
                <p class="shield-desc">Bảo vệ dấu vân tay Canvas, tạo nhiễu ngẫu nhiên ngăn các bên thứ ba theo dõi hành vi trực tuyến.</p>
              </div>
            </div>

            <!-- Shield 4 -->
            <div class="shield-card-premium block-glow-danger">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6" y2="6.01"></line>
                  <line x1="6" y1="18" x2="6" y2="18.01"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">Advanced Proxy Routing</span>
                  <span class="shield-status-active">ONLINE</span>
                </div>
                <p class="shield-desc">Tự động cấu hình giả lập GPS, Timezone, User-Agent đồng bộ hoàn hảo với máy chủ proxy.</p>
              </div>
            </div>

            <!-- Shield 5 -->
            <div class="shield-card-premium block-glow-warning">
              <div class="shield-card-border"></div>
              <div class="shield-icon-wrapper b-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div class="shield-content">
                <div class="shield-title-row">
                  <span class="shield-title">MFA Vault (2FA)</span>
                  <span class="shield-status-active">ONLINE</span>
                </div>
                <p class="shield-desc">Quản lý mã OTP xác thực 2 bước an toàn, mã hóa đầu cuối với khóa bảo mật PIN chủ cá nhân.</p>
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

.metadata-section {
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  padding-top: 12px;
  margin-top: 2px;
}

.tech-label {
  font-size: 9.5px;
  font-weight: 800;
  color: #009ef7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
}

.metadata-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  padding-bottom: 4px;
}

.meta-lbl {
  color: #5e6278;
  font-weight: 500;
}

.meta-val-link {
  color: #009ef7;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.meta-val-link:hover {
  color: #187de4;
  text-decoration: underline;
}

.meta-val-highlight {
  color: #ffffff;
  font-weight: 600;
  font-size: 9.5px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.meta-val {
  color: #ffffff;
  font-weight: 600;
}

.copyright-text {
  font-size: 8.5px;
  color: #5e6278;
  text-align: center;
  line-height: 1.4;
  margin-top: auto;
  padding-top: 10px;
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
  flex-grow: 1;
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
  background: rgba(30, 30, 45, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 8px 12px;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.shield-card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: transparent;
  transition: background-color 0.3s;
}

.shield-card-premium:hover {
  transform: translateX(4px);
  background: rgba(30, 30, 45, 0.5);
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
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shield-icon-wrapper.b-blue { background-color: rgba(0, 158, 247, 0.08); color: #009ef7; }
.shield-icon-wrapper.b-teal { background-color: rgba(80, 205, 137, 0.08); color: #50cd89; }
.shield-icon-wrapper.b-indigo { background-color: rgba(137, 80, 252, 0.08); color: #8950fc; }
.shield-icon-wrapper.b-danger { background-color: rgba(241, 65, 108, 0.08); color: #f1416c; }
.shield-icon-wrapper.b-warning { background-color: rgba(241, 188, 25, 0.08); color: #f1bc19; }

.shield-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-grow: 1;
}

.shield-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.shield-title {
  font-size: 10.5px;
  font-weight: 700;
  color: #ffffff;
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
  font-size: 9px;
  line-height: 1.35;
  color: #a1a5b7;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
