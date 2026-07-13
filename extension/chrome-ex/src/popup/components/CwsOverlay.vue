<template>
  <div id="cws-overlay" class="cws-overlay" style="display: flex;">
    <div style="width: 72px; height: 72px; border-radius: 50%; background-color: rgba(54, 153, 255, 0.08); color: var(--primary-blue); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 0 20px rgba(54, 153, 255, 0.15); flex-shrink: 0;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 32px; height: 32px;">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    </div>
    
    <h2 style="font-size: 19px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; text-align: center; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">{{ t('cws.title') }}</h2>
    <p style="font-size: 12px; color: var(--text-desc); line-height: 1.6; margin: 0 0 32px 0; text-align: center; max-width: 440px;">
      {{ t('cws.desc') }}
    </p>
    
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; align-items: center;">
      <button @click="$emit('view-source')" class="cookie-btn save" style="height: 40px; width: 100%; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; margin: 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(54, 153, 255, 0.2);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        {{ t('cws.btn_view_source') }}
      </button>
      <div style="display: flex; gap: 12px; width: 100%;">
        <button @click="$emit('download-zip')" :disabled="cwsDownloading" class="cookie-btn copy" style="flex: 1; height: 40px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; margin: 0; border-radius: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ cwsDownloadingZip ? t('cws.loading') : t('cws.btn_download_zip') }}
        </button>
        <button @click="$emit('download-crx')" :disabled="cwsDownloading" class="cookie-btn cancel" style="flex: 1; height: 40px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; margin: 0; border-radius: 8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {{ cwsDownloadingCrx ? t('cws.loading') : t('cws.btn_download_crx') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'CwsOverlay',
  props: {
    cwsDownloading: { type: Boolean, default: false },
    cwsDownloadingZip: { type: Boolean, default: false },
    cwsDownloadingCrx: { type: Boolean, default: false }
  },
  emits: ['view-source', 'download-zip', 'download-crx'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>
