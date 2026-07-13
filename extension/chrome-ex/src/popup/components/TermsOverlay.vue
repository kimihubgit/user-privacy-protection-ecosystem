<template>
  <div id="terms-overlay" class="terms-overlay" style="display: flex;">
    <div class="terms-card">
      <div class="terms-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <h2 class="terms-title">{{ t('terms.title') }}</h2>
      <div class="terms-content">
        <p v-html="t('terms.intro')"></p>
        <ul>
          <li><strong>{{ t('terms.point_1_title') }}</strong> {{ t('terms.point_1_desc') }}</li>
          <li><strong>{{ t('terms.point_2_title') }}</strong> {{ t('terms.point_2_desc') }}</li>
          <li><strong>{{ t('terms.point_3_title') }}</strong> {{ t('terms.point_3_desc') }}</li>
        </ul>
        <p style="margin-bottom: 0;">{{ t('terms.outro') }}</p>
      </div>
      <button class="terms-btn" @click="$emit('accept')">{{ t('terms.btn_accept') }}</button>
    </div>
  </div>
</template>

<script>
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'TermsOverlay',
  emits: ['accept'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>
