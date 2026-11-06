<template>
  <div id="terms-overlay" class="terms-overlay">
    <div class="terms-unified-container">
      
      <!-- Top Header -->
      <div class="terms-header">
        <div class="terms-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <h2 class="terms-title">{{ t('terms.title') }}</h2>
      </div>

      <!-- Scrollable Content Box -->
      <div class="terms-content-box" ref="contentRef" @scroll="handleScroll">
        <div class="terms-intro-text" v-html="t('terms.intro')"></div>
        <ul class="terms-list">
          <li><strong>{{ t('terms.point_1_title') }}</strong> {{ t('terms.point_1_desc') }}</li>
          <li><strong>{{ t('terms.point_2_title') }}</strong> {{ t('terms.point_2_desc') }}</li>
          <li><strong>{{ t('terms.point_3_title') }}</strong> {{ t('terms.point_3_desc') }}</li>
        </ul>
        <div class="terms-outro-text">{{ t('terms.outro') }}</div>
      </div>

      <!-- Sticky Footer / Action -->
      <div class="terms-footer">
        <div class="scroll-notice" :class="{ active: hasScrolledToBottom }">
          <span v-if="!hasScrolledToBottom">
            {{ t('terms.scroll_notice_scroll') || 'Vui lòng cuộn xuống cuối trang và đọc hết tài liệu để đồng ý với chính sách của chúng tôi' }}
          </span>
          <span v-else>
            {{ t('terms.scroll_notice_ready') || '✅ Bạn đã sẵn sàng để đồng ý' }}
          </span>
        </div>
        <button 
          class="terms-btn" 
          :disabled="!hasScrolledToBottom"
          @click="$emit('accept')"
        >
          {{ t('terms.btn_accept') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'TermsOverlay',
  emits: ['accept'],
  setup() {
    const { t } = useI18n();
    const contentRef = ref(null);
    const hasScrolledToBottom = ref(false);

    const handleScroll = (e) => {
      const el = e.target;
      // Cho phép sai số 8px để dễ đạt được đáy trên mọi thiết bị
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 8) {
        hasScrolledToBottom.value = true;
      }
    };

    onMounted(() => {
      // Đợi DOM cập nhật rồi kiểm tra xem nội dung có ngắn đến mức không cần cuộn không
      setTimeout(() => {
        if (contentRef.value) {
          const el = contentRef.value;
          if (el.scrollHeight <= el.clientHeight) {
            hasScrolledToBottom.value = true;
          }
        }
      }, 300);
    });

    return { 
      t, 
      contentRef, 
      hasScrolledToBottom, 
      handleScroll 
    };
  }
};
</script>

<style scoped>
.terms-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-app) !important;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 16px 24px;
  width: 100%;
  height: 100%;
}

.terms-unified-container {
  width: 100%;
  max-width: 500px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 12px 0 6px 0;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.terms-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.terms-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 158, 247, 0.15) 0%, rgba(137, 80, 252, 0.15) 100%);
  border: 1px solid rgba(0, 158, 247, 0.25);
  color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 158, 247, 0.15);
}

.terms-logo svg {
  width: 22px;
  height: 22px;
}

.terms-title {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.terms-content-box {
  flex-grow: 1;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 14px 16px;
  box-sizing: border-box;
  overflow-y: auto;
  margin-bottom: 12px;
  text-align: left;
  line-height: 1.6;
}

.terms-intro-text {
  font-size: 11.5px;
  color: #ffffff;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.terms-list {
  margin: 0 0 12px 0;
  padding-left: 16px;
  font-size: 11px;
  color: var(--text-desc);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terms-list strong {
  color: var(--primary-blue);
  font-weight: 700;
}

.terms-outro-text {
  font-size: 11px;
  color: var(--text-desc);
  margin: 0;
}

/* Custom Scrollbar */
.terms-content-box::-webkit-scrollbar {
  width: 4px;
}

.terms-content-box::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

.terms-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.scroll-notice {
  font-size: 10px;
  font-weight: 700;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  letter-spacing: 0.2px;
}

.scroll-notice.active {
  color: #50cd89;
}

.terms-btn {
  width: 100%;
  height: 38px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, #0080cf 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 158, 247, 0.2);
}

.terms-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00b4db 0%, var(--primary-blue) 100%);
  box-shadow: 0 6px 16px rgba(0, 158, 247, 0.35);
  transform: translateY(-1px);
}

.terms-btn:disabled {
  background: #1e1e2d !important;
  color: var(--text-muted) !important;
  border: 1px solid var(--border-light) !important;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
