<template>
  <div class="power-menu-backdrop" @click.self="$emit('close')">
    <div class="power-menu-dropdown" :class="{ 'dropdown-master-off': !globalEnabled }">
      
      <!-- Header / Master Power Switch Banner -->
      <div class="power-menu-header" :class="{ 'master-off-banner': !globalEnabled }">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="power-status-icon" :class="globalEnabled ? 'active' : 'master-off-icon'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div class="power-menu-title" :style="{ color: globalEnabled ? 'var(--text-title)' : '#ffffff' }">
              {{ globalEnabled ? (t('power_menu.title') || 'Trung Tâm Điều Khiển Lá Chắn') : 'Ngưng hoạt động' }}
            </div>
            <div class="power-menu-sub" :style="{ color: globalEnabled ? 'var(--text-desc)' : 'rgba(255, 255, 255, 0.9)', fontWeight: globalEnabled ? 'normal' : '600' }">
              <template v-if="globalEnabled">
                {{ activeFeaturesCount }} / {{ featuresList.length }} {{ t('power_menu.active_count') || 'tính năng đang hoạt động' }}
              </template>
              
            </div>
          </div>
        </div>

        <!-- Master Global Power Switch -->
        <div style="display: flex; align-items: center; gap: 6px;">
          
          <label class="switch switch-md">
            <input type="checkbox" :checked="globalEnabled" @change="toggleGlobalMaster">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div class="power-divider"></div>

      <!-- Active Features List -->
      <div class="power-features-scroll" :class="{ 'global-disabled-list': !globalEnabled }">
        
        <!-- Prominent Warning Notice when Master Power is OFF -->
        <div v-if="!globalEnabled" class="global-disabled-notice">
          🚫 <strong>Nguồn tổng đang TẮT:</strong> Tất cả tính năng bảo vệ bên dưới tạm thời dừng hoạt động.
        </div>

        <div v-if="featuresList.length === 0" class="power-empty-notice">
          {{ t('power_menu.empty') || 'Tất cả các lá chắn bảo vệ đang tắt.' }}
        </div>

        <div 
          v-else 
          v-for="feat in featuresList" 
          :key="feat.key" 
          class="power-feature-row"
          :class="{ disabled: !feat.enabled || !globalEnabled }"
        >
          <div class="feature-icon-box" :style="{ color: feat.color, backgroundColor: feat.bgColor }">
            <span v-html="feat.icon"></span>
          </div>

          <div class="feature-text-info">
            <span class="feature-name">{{ feat.title }}</span>
            <span class="feature-desc">{{ feat.desc }}</span>
          </div>

          <label class="switch switch-sm">
            <input type="checkbox" :checked="feat.enabled && globalEnabled" :disabled="!globalEnabled" @change="toggleFeature(feat)">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- Footer Quick Status -->
      <div class="power-menu-footer">
        <button @click="turnOffAllActive" v-if="activeFeaturesCount > 0 && globalEnabled" class="btn-power-action danger">
          ⚡ {{ t('power_menu.btn_disable_all') || 'Tắt tất cả tính năng đang bật' }}
        </button>
        <button @click="$emit('close')" class="btn-power-action close">
          {{ t('power_menu.btn_close') || 'Đóng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'PowerMenuOverlay',
  props: {
    globalEnabled: { type: Boolean, default: true },
    adActive: { type: Boolean, default: true }
  },
  emits: ['close', 'toggle-global', 'refresh-states'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const featureStates = ref({
      webShieldActive: true,
      dataBlurActive: false,
      adActive: props.adActive !== false,
      cad_enabled: false
    });

    const loadStates = () => {
      chrome.storage.local.get([
        'webShieldActive',
        'dataBlurActive',
        'adActive',
        'cad_enabled'
      ], (res) => {
        featureStates.value.webShieldActive = res.webShieldActive !== false;
        featureStates.value.dataBlurActive = res.dataBlurActive === true;
        featureStates.value.adActive = res.adActive !== false;
        featureStates.value.cad_enabled = res.cad_enabled === true;
      });
    };

    // Load storage states immediately in setup
    loadStates();

    const handleStorageChange = (changes) => {
      loadStates();
    };

    onMounted(() => {
      loadStates();
      chrome.storage.onChanged.addListener(handleStorageChange);
    });

    onUnmounted(() => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    });

    const featuresList = computed(() => {
      return [
        {
          key: 'webShieldActive',
          title: t('settings.web_shield_title') || 'Web Shield Anti-Scam (Dashboard)',
          desc: t('settings.web_shield_desc') || 'Bảo vệ thời gian thực chống web lừa đảo.',
          enabled: featureStates.value.webShieldActive,
          color: 'var(--accent-teal)',
          bgColor: 'var(--accent-teal-light)',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        },
        {
          key: 'dataBlurActive',
          title: t('tracking.data_blur_title') || 'Lá Chắn Dữ Liệu (Data Shield)',
          desc: 'Che mờ thông tin nhạy cảm trên trang web.',
          enabled: featureStates.value.dataBlurActive,
          color: '#00c5dc',
          bgColor: 'rgba(0, 197, 220, 0.1)',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path></svg>`
        },
        {
          key: 'adActive',
          title: t('adblock.toggle_title') || 'Bộ Lọc Quảng Cáo (Adblocker)',
          desc: t('adblock.toggle_desc') || 'Chặn biểu ngữ, quảng cáo video và popups.',
          enabled: featureStates.value.adActive,
          color: 'var(--warning)',
          bgColor: 'rgba(241, 188, 25, 0.1)',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
        },
        {
          key: 'cad_enabled',
          title: t('cookiecleaner.master_enable') || 'Vệ Sĩ Tự Động Xóa Cookie',
          desc: t('cookiecleaner.master_desc') || 'Tự động xóa cookie rác khi đóng tab/đổi trang.',
          enabled: featureStates.value.cad_enabled,
          color: 'var(--accent-indigo)',
          bgColor: 'rgba(137, 80, 252, 0.1)',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>`
        }
      ];
    });

    const activeFeaturesCount = computed(() => {
      return featuresList.value.filter(f => f.enabled).length;
    });

    const toggleFeature = (feat) => {
      if (!props.globalEnabled) return;
      const nextVal = !feat.enabled;
      featureStates.value[feat.key] = nextVal;

      const obj = {};
      obj[feat.key] = nextVal;
      chrome.storage.local.set(obj, () => {
        emit('refresh-states');
        showToast(`Đã ${nextVal ? 'BẬT' : 'TẮT'} ${feat.title}`);
      });
    };

    const toggleGlobalMaster = () => {
      emit('toggle-global');
    };

    const turnOffAllActive = () => {
      if (!props.globalEnabled) return;
      const updates = {};

      featuresList.value.forEach(feat => {
        if (feat.enabled) {
          updates[feat.key] = false;
          featureStates.value[feat.key] = false;
        }
      });

      chrome.storage.local.set(updates, () => {
        emit('refresh-states');
        showToast('Đã tắt tất cả các tính năng đang bật!');
      });
    };

    const showToast = (msg) => {
      const toastEl = document.getElementById('cookie-toast');
      if (toastEl) {
        toastEl.textContent = msg;
        toastEl.style.display = 'block';
        toastEl.style.animation = 'fadeIn 0.2s, fadeOut 0.2s 2.3s forwards';
        setTimeout(() => {
          toastEl.style.display = 'none';
        }, 2500);
      }
    };

    return {
      t,
      featureStates,
      featuresList,
      activeFeaturesCount,
      toggleFeature,
      toggleGlobalMaster,
      turnOffAllActive
    };
  }
};
</script>

<style scoped>
.power-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 20, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 12px 18px 0 0;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
}

.power-menu-dropdown {
  width: 320px;
  max-height: 440px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.power-menu-dropdown.dropdown-master-off {
  border-color: rgba(230, 25, 75, 0.5);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.power-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
}

body.light-theme .power-menu-header {
  background-color: #f8fafc;
}

/* Outstanding Red Warning Banner when Master Power is OFF */
.power-menu-header.master-off-banner {
  background: linear-gradient(135deg, #d90429 0%, #ef233c 100%) !important;
  color: #ffffff !important;
  border-bottom: 2px solid #ff4d6d;
  box-shadow: 0 4px 15px rgba(217, 4, 41, 0.4);
  animation: pulseWarning 2.2s infinite ease-in-out;
}

@keyframes pulseWarning {
  0% { box-shadow: 0 4px 12px rgba(217, 4, 41, 0.35); }
  50% { box-shadow: 0 4px 22px rgba(255, 77, 109, 0.65); }
  100% { box-shadow: 0 4px 12px rgba(217, 4, 41, 0.35); }
}

.power-status-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: var(--danger-light);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.power-status-icon.active {
  background-color: var(--accent-teal-light);
  color: var(--accent-teal);
}

.power-status-icon.master-off-icon {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: bounceAlert 1s ease infinite alternate;
}

@keyframes bounceAlert {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}


.power-menu-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-title);
  line-height: 1.2;
}

.power-menu-sub {
  font-size: 10px;
  color: var(--text-desc);
}

.power-divider {
  height: 1px;
  background-color: var(--border-light);
}

.power-features-scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
}

.global-disabled-notice {
  background: rgba(241, 65, 108, 0.12);
  border: 1px dashed rgba(241, 65, 108, 0.4);
  color: var(--danger);
  font-size: 10px;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 4px;
}

.power-features-scroll.global-disabled-list .power-feature-row {
  opacity: 0.45;
  filter: grayscale(0.5);
}

.power-empty-notice {
  padding: 24px;
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
}

.power-feature-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background-color: rgba(255, 255, 255, 0.015);
  transition: all 0.2s ease;
}

body.light-theme .power-feature-row {
  background-color: #ffffff;
}

.power-feature-row:hover {
  border-color: rgba(0, 158, 247, 0.3);
  transform: translateX(2px);
}

.power-feature-row.disabled {
  opacity: 0.55;
}

.feature-icon-box {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-text-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.feature-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-title);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-desc {
  font-size: 9.5px;
  color: var(--text-desc);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-menu-footer {
  display: flex;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--border-light);
  background-color: rgba(255, 255, 255, 0.02);
}

body.light-theme .power-menu-footer {
  background-color: #f8fafc;
}

.btn-power-action {
  flex: 1;
  height: 28px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-power-action.danger {
  background-color: var(--danger-light);
  color: var(--danger);
  border-color: rgba(241, 65, 108, 0.2);
}

.btn-power-action.danger:hover {
  background-color: var(--danger);
  color: #ffffff;
}

.btn-power-action.close {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-desc);
  border-color: var(--border-light);
  flex: 0 0 60px;
}

.btn-power-action.close:hover {
  background-color: var(--border-light);
  color: var(--text-title);
}

.switch-sm {
  width: 30px;
  height: 16px;
}

.switch-sm .slider:before {
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
}

.switch-sm input:checked + .slider:before {
  transform: translateX(14px);
}
</style>
