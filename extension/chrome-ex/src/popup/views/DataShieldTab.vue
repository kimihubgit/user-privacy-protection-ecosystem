<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 100%;">
    <h2 class="title">{{ t('tracking.data_blur_title') }}</h2>
    <p class="subtitle">{{ t('tracking.data_blur_desc') }}</p>
    
    <!-- Scrollable container for Data Shield options -->
    <div class="settings-scroll-container" style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0; margin-bottom: 0; padding-right: 4px; overflow-x: hidden;">
      
      <!-- Enable Shield Card -->
      <div class="card card-toggle">
        <div class="card-info">
          <span class="card-title">Kích hoạt Lá chắn Dữ liệu</span>
          <span class="card-desc">Tự động che mờ các thông tin nhạy cảm khi hiển thị trên màn hình</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="dataBlurActive" @change="updateDataBlurStorage">
          <span class="slider round"></span>
        </label>
      </div>

      <!-- Data Blur Options Panel (Expandable) -->
      <div v-show="dataBlurActive" class="blur-options-panel" style="padding: 14px 18px; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-light); border-radius: 10px; display: flex; flex-direction: column; gap: 12px; animation: kiguard-fade-in 0.25s ease;">
        
        <span style="font-size: 10.5px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.5px;">Các loại dữ liệu cần bảo vệ</span>
        
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.emails" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_emails') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.phones" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_phones') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.creditCard" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_credentials') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.ssn" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_ssn') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.password" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_password') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.secretKeys" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_secretKeys') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.money" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_money') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none;">
            <input type="checkbox" v-model="dataBlurOptions.cryptoWallet" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_cryptoWallet') }}
          </label>
          <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-title); cursor: pointer; user-select: none; grid-column: span 2;">
            <input type="checkbox" v-model="dataBlurOptions.highEntropy" @change="updateDataBlurStorage" style="cursor: pointer;">
            {{ t('tracking.data_blur_highEntropy') }}
          </label>
        </div>

        <!-- Keywords blocklist input -->
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
          <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">{{ t('tracking.data_blur_keywords') }}</span>
          <input 
            type="text" 
            v-model="dataBlurOptions.keywords" 
            @input="updateDataBlurStorageWithDebounce" 
            :placeholder="t('tracking.data_blur_keywords_placeholder')" 
            style="width: 100%; padding: 6px 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-light); border-radius: 4px; color: var(--text-title); font-size: 11px; outline: none; box-sizing: border-box;"
          >
        </div>

        <!-- Toggle Screen Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.08); margin-top: 4px;">
          <div style="display: flex; flex-direction: column; gap: 1px;">
            <span style="font-size: 11.5px; color: var(--text-title); font-weight: 600;">Hiện thanh điều khiển (Toolbar)</span>
            <span style="font-size: 9.5px; color: var(--text-muted);">Hiển thị thanh công cụ làm mờ trên trang (Alt+Shift+T)</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="kiguardToolbarVisible" @change="updateToolbarVisibility">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      
      <!-- Interactive Blur Guidelines info-card -->
      <div class="card" style="padding: 14px; background: rgba(0, 158, 247, 0.03); border: 1px solid rgba(0, 158, 247, 0.15); border-radius: 10px; display: flex; gap: 12px; align-items: flex-start;">
        <div style="color: var(--primary-blue); font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">ℹ️</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: #ffffff;">Mẹo bảo mật tương tác nâng cao</span>
          <p style="font-size: 10.5px; line-height: 1.5; color: var(--text-desc); margin: 0;">
            Khi thanh công cụ làm mờ (Toolbar) được bật trên trang, bạn có thể click chọn chế độ làm mờ riêng lẻ từng phần tử 
            (<strong>Element Mode</strong>) hoặc vẽ bao phủ vùng chọn bất kỳ (<strong>Area Mode</strong>) để ẩn nhanh thông tin thừa.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'DataShieldTab',
  setup() {
    const { t } = useI18n();
    const dataBlurActive = ref(false);
    const kiguardToolbarVisible = ref(true);
    const dataBlurOptions = ref({
      phones: true,
      emails: true,
      creditCard: true,
      ssn: false,
      password: false,
      secretKeys: false,
      money: false,
      cryptoWallet: false,
      highEntropy: false,
      keywords: ''
    });

    // Load states on mount
    onMounted(() => {
      chrome.storage.local.get(['dataBlurActive', 'dataBlurOptions', 'kiguardToolbarVisible'], (res) => {
        dataBlurActive.value = res.dataBlurActive === true;
        kiguardToolbarVisible.value = res.kiguardToolbarVisible !== false;
        if (res.dataBlurOptions) {
          const opt = { ...res.dataBlurOptions };
          if (opt.creditCard === undefined && opt.credentials !== undefined) {
            opt.creditCard = opt.credentials;
          }
          dataBlurOptions.value = { ...dataBlurOptions.value, ...opt };
        }
      });
    });

    const updateDataBlurStorage = () => {
      chrome.storage.local.set({
        dataBlurActive: dataBlurActive.value,
        dataBlurOptions: JSON.parse(JSON.stringify(dataBlurOptions.value))
      });
    };

    let debounceTimer = null;
    const updateDataBlurStorageWithDebounce = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        updateDataBlurStorage();
      }, 500);
    };

    const updateToolbarVisibility = () => {
      chrome.storage.local.set({ kiguardToolbarVisible: kiguardToolbarVisible.value });
    };

    return {
      t,
      dataBlurActive,
      kiguardToolbarVisible,
      dataBlurOptions,
      updateDataBlurStorage,
      updateDataBlurStorageWithDebounce,
      updateToolbarVisibility
    };
  }
};
</script>
