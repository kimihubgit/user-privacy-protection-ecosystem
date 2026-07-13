<template>
  <div id="feedback-overlay" class="feedback-overlay">
    
    <!-- Floating Close Button (Matches AI Close style) -->
    <button class="feedback-close-btn" @click="$emit('close')" :aria-label="t('feedback.btn_close') || 'Đóng'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Unified wider container -->
    <div class="feedback-unified-container">
      
      <!-- Content Header (Full width style) -->
      <div class="feedback-header" style="flex-shrink: 0;">
        <div class="feedback-logo-title">
          <div class="feedback-logo-mini">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2 class="feedback-title-mini">{{ t('feedback.title') || 'Góp Ý & Báo Lỗi' }}</h2>
        </div>
        <p class="feedback-subtitle-mini">{{ t('feedback.subtitle') || 'Ý kiến đóng góp của bạn giúp chúng tôi hoàn thiện và cung cấp trải nghiệm bảo mật tốt nhất.' }}</p>
      </div>

      <!-- Success State -->
      <div v-if="submitted" class="success-state">
        <div class="success-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="checkmark-svg">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 class="success-title">{{ t('feedback.success_title') || 'Gửi góp ý thành công!' }}</h3>
        <p class="success-desc">{{ t('feedback.success_desc') || 'Cảm ơn bạn đã đóng góp phản hồi giúp hoàn thiện sản phẩm.' }}</p>
        <button @click="$emit('close')" class="btn-done">
          {{ t('feedback.btn_done') || 'Đóng cửa sổ' }}
        </button>
      </div>

      <!-- Form State -->
      <div v-else class="feedback-form">
        
        <!-- Row 1: Rating (Left) & Category (Right) -->
        <div class="form-row-2col">
          <div class="form-group">
            <label class="form-label">{{ t('feedback.rate_title') || 'Đánh giá tiện ích' }}</label>
            <div class="rating-stars">
              <button 
                v-for="star in 5" 
                :key="star"
                type="button"
                class="star-btn"
                :class="{ active: star <= hoverRating || star <= rating }"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="rating = star"
              >
                <svg viewBox="0 0 24 24" :fill="star <= hoverRating || star <= rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('feedback.category_title') || 'Phân loại ý kiến' }}</label>
            <select v-model="selectedCategory" class="form-select">
              <option value="bug">🐛 {{ t('feedback.cat_bug') || 'Báo lỗi' }}</option>
              <option value="feature">✨ {{ t('feedback.cat_feature') || 'Tính năng' }}</option>
              <option value="general">💬 {{ t('feedback.cat_general') || 'Góp ý' }}</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Subject (Left) & Email (Right) -->
        <div class="form-row-2col-equal">
          <div class="form-group">
            <label class="form-label">{{ t('feedback.subject_label') || 'Tiêu đề góp ý' }}</label>
            <input 
              type="text" 
              v-model="subject" 
              class="form-input" 
              :placeholder="t('feedback.subject_placeholder') || 'Nhập tiêu đề phản hồi...'"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('feedback.email_label') || 'Email liên hệ (Tùy chọn)' }}</label>
            <input 
              type="email" 
              v-model="email" 
              class="form-input" 
              :placeholder="t('feedback.email_placeholder') || 'Nhập địa chỉ email của bạn...'"
            />
          </div>
        </div>

        <!-- Row 3: Description -->
        <div class="form-group">
          <label class="form-label">{{ t('feedback.desc_label') || 'Nội dung chi tiết' }}</label>
          <div class="textarea-wrapper">
            <textarea 
              v-model="description" 
              class="form-textarea" 
              rows="3" 
              maxlength="500"
              :placeholder="t('feedback.desc_placeholder') || 'Nội dung góp ý chi tiết của bạn (tối thiểu 10 ký tự)...'"
            ></textarea>
            <span class="char-counter">{{ description.length }}/500</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          class="submit-btn" 
          :disabled="!isFormValid || loading" 
          @click="submitFeedback"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm" style="margin-right: 6px;"></span>
          {{ loading ? (t('feedback.btn_sending') || 'Đang gửi...') : (t('feedback.btn_submit') || 'Gửi Phản Hồi') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'FeedbackOverlay',
  emits: ['close'],
  setup() {
    const { t } = useI18n();

    const rating = ref(0);
    const hoverRating = ref(0);
    const selectedCategory = ref('general');
    const subject = ref('');
    const description = ref('');
    const email = ref('');

    const loading = ref(false);
    const submitted = ref(false);

    const isFormValid = computed(() => {
      return selectedCategory.value && description.value.trim().length >= 10;
    });

    const submitFeedback = () => {
      if (!isFormValid.value) return;

      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        submitted.value = true;
      }, 1500);
    };

    return {
      t,
      rating,
      hoverRating,
      selectedCategory,
      subject,
      description,
      email,
      loading,
      submitted,
      isFormValid,
      submitFeedback
    };
  }
};
</script>

<style scoped>
.feedback-overlay {
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
  padding: 16px 40px;
  width: 100%;
  height: 100%;
}

.feedback-unified-container {
  width: 100%;
  max-width: 660px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 12px 0 6px 0;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  position: relative;
}

.feedback-close-btn {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  z-index: 10000;
}

.feedback-close-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg) scale(1.05);
}

/* Header */
.feedback-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 8px;
}

.feedback-logo-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-logo-mini {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(0, 158, 247, 0.15) 0%, rgba(137, 80, 252, 0.15) 100%);
  border: 1px solid rgba(0, 158, 247, 0.25);
  color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-title-mini {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.feedback-subtitle-mini {
  font-size: 10.5px;
  color: var(--text-desc);
  margin: 4px 0 0 0;
  text-align: left;
}

/* Form Grid */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 16px;
  width: 100%;
}

.form-row-2col-equal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-label {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-desc);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Rating Stars */
.rating-stars {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 30px;
}

.star-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--border-light);
  transition: transform 0.15s, color 0.15s;
  outline: none;
  display: flex;
  align-items: center;
}

.star-btn svg {
  width: 22px;
  height: 22px;
}

.star-btn.active {
  color: var(--warning);
}

.star-btn:hover {
  transform: scale(1.15);
}

/* Custom Select */
.form-select {
  width: 100%;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 0 8px;
  color: #ffffff;
  font-size: 11px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-select:focus {
  border-color: var(--primary-blue);
  background-color: rgba(255, 255, 255, 0.04);
}

.form-select option {
  background-color: #1e1e2d;
  color: #ffffff;
}

/* Input Fields */
.form-input {
  width: 100%;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 0 10px;
  color: #ffffff;
  font-size: 11px;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--primary-blue);
  background-color: rgba(255, 255, 255, 0.04);
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

.form-textarea {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 8px 10px 20px 10px;
  color: #ffffff;
  font-size: 11px;
  box-sizing: border-box;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.2s;
  line-height: 1.5;
}

.form-textarea:focus {
  border-color: var(--primary-blue);
  background-color: rgba(255, 255, 255, 0.04);
}

.char-counter {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 8px;
  color: var(--text-muted);
  font-weight: 700;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  height: 34px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, #0080cf 100%);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
  box-shadow: 0 4px 10px rgba(0, 158, 247, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00b4db 0%, var(--primary-blue) 100%);
  box-shadow: 0 5px 14px rgba(0, 158, 247, 0.25);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #1e1e2d !important;
  color: var(--text-muted) !important;
  border: 1px solid var(--border-light) !important;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

.spinner-border-sm {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success State */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 10px 4px;
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.success-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(80, 205, 137, 0.1);
  color: var(--accent-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px solid rgba(80, 205, 137, 0.25);
  box-shadow: 0 4px 10px rgba(80, 205, 137, 0.1);
}

.checkmark-svg {
  width: 18px;
  height: 18px;
  animation: strokeDraw 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes strokeDraw {
  from { stroke-dasharray: 50; stroke-dashoffset: 50; }
  to { stroke-dasharray: 50; stroke-dashoffset: 0; }
}

.success-title {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.success-desc {
  font-size: 10.5px;
  color: var(--text-desc);
  line-height: 1.6;
  text-align: center;
  margin: 0 0 16px 0;
}

.btn-done {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 20px;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  width: 100%;
}

.btn-done:hover {
  background-color: var(--primary-light);
  color: var(--primary-blue);
  border-color: var(--primary-blue);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
