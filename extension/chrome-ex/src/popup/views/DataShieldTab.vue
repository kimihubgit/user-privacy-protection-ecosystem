<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 100%;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
      <h2 class="title" style="margin: 0;">{{ t('tracking.data_blur_title') }}</h2>
      <button 
        v-if="dataBlurActive"
        @click="toggleToolbarVisibility"
        :class="['toolbar-toggle-btn', { active: kiguardToolbarVisible }]"
        :title="kiguardToolbarVisible ? 'Ẩn thanh điều khiển' : 'Hiện thanh điều khiển (Alt+Shift+T)'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width: 13px; height: 13px;">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;">Toolbar</span>
      </button>
    </div>
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


      </div>
      
      <!-- Interactive Blur Guidelines info-card -->
      <div class="card" style="padding: 14px; background: rgba(0, 158, 247, 0.03); border: 1px solid rgba(0, 158, 247, 0.15); border-radius: 10px; display: flex; gap: 12px; align-items: flex-start;">
        <div style="color: var(--primary-blue); flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 16px; height: 16px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-title);">Mẹo bảo mật tương tác nâng cao</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'DataShieldTab',
  setup() {
    const { t } = useI18n();
    const dataBlurActive = ref(false);
    const kiguardToolbarVisible = ref(false);
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

    const loadState = () => {
      chrome.storage.local.get(['dataBlurActive', 'dataBlurOptions', 'kiguardToolbarVisible'], (res) => {
        dataBlurActive.value = res.dataBlurActive === true;
        kiguardToolbarVisible.value = res.kiguardToolbarVisible === true;
        if (res.dataBlurOptions) {
          const opt = { ...res.dataBlurOptions };
          if (opt.creditCard === undefined && opt.credentials !== undefined) {
            opt.creditCard = opt.credentials;
          }
          dataBlurOptions.value = { ...dataBlurOptions.value, ...opt };
        }
      });
    };

    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        if (changes.dataBlurActive) dataBlurActive.value = changes.dataBlurActive.newValue === true;
      }
    };

    onMounted(() => {
      loadState();
      chrome.storage.onChanged.addListener(handleStorageChange);
    });

    onUnmounted(() => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
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

    const toggleToolbarVisibility = () => {
      kiguardToolbarVisible.value = !kiguardToolbarVisible.value;
      updateToolbarVisibility();
    };

    return {
      t,
      dataBlurActive,
      kiguardToolbarVisible,
      dataBlurOptions,
      updateDataBlurStorage,
      updateDataBlurStorageWithDebounce,
      updateToolbarVisibility,
      toggleToolbarVisibility
    };
  }
};
</script>

<style scoped>
.toolbar-toggle-btn {
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
  outline: none;
}
.toolbar-toggle-btn:hover {
  color: var(--text-title);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}
.toolbar-toggle-btn.active {
  color: var(--primary-blue);
  background: rgba(0, 158, 247, 0.08);
  border-color: rgba(0, 158, 247, 0.25);
}
</style>
