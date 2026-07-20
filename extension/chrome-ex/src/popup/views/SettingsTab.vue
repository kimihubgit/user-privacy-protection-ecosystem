<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <h2 class="title" data-i18n="settings.title" style="margin-bottom: 0;">{{ t('settings.title') }}</h2>
      
      <!-- Theme Accent Selector next to Title -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="display: flex; gap: 6px;">
          <button 
            v-for="color in ['blue', 'indigo', 'teal', 'danger']" 
            :key="color"
            :class="['accent-color-btn', { active: activeAccentColor === color }]"
            :style="{
              backgroundColor: getAccentColorHex(color)
            }"
            @click="setAccentColor(color)"
          ></button>
        </div>
      </div>
    </div>
    
    <!-- Sub Navigation -->
    <div class="sub-nav" id="settings-sub-nav" style="margin-bottom: 14px;">
      <button 
        v-for="tab in ['security', 'social', 'others']" 
        :key="tab"
        :class="['sub-nav-item', { active: activeSettingsTab === tab }]" 
        @click="setSettingsTab(tab)"
      >
        {{ t(`settings.tab_${tab}`) }}
      </button>
    </div>
    
    <div class="settings-scroll-container">
      <!-- Settings Panel: Security -->
      <div v-show="activeSettingsTab === 'security'" class="settings-sub-panel active" id="settings-panel-security">
        <div class="settings-form">
          <!-- Real-Time Protection -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.realtime_title') }}</span>
              <span class="card-desc">{{ t('settings.realtime_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.webShieldActive" @change="onToggleChange('webShieldActive', 'realtime', true)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Anti-Clickjacking -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.clickjacking_title') }}</span>
              <span class="card-desc">{{ t('settings.clickjacking_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.anti_clickjacking" @change="onToggleChange('anti_clickjacking', 'anti_clickjacking', true)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Unlock Right-Click & Copy -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.rightclick_title') }}</span>
              <span class="card-desc">{{ t('settings.rightclick_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.enable_right_click" @change="onToggleChange('enable_right_click', 'enable_right_click', false)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Remove Tracking Parameters -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.remove_tracking_params_title') }}</span>
              <span class="card-desc">{{ t('settings.remove_tracking_params_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.removeTrackingParams" @change="onToggleChange('removeTrackingParams', 'remove_tracking_params', false)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Global Privacy Control -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.gpc_title') }}</span>
              <span class="card-desc">{{ t('settings.gpc_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.gpcEnabled" @change="onToggleChange('gpcEnabled', null, true)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Canvas Fingerprint Spoofing -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.canvas_fingerprint_title') }}</span>
              <span class="card-desc">{{ t('settings.canvas_fingerprint_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.canvasFingerprintActive" @change="onToggleChange('canvasFingerprintActive', 'canvasFingerprintActive', false)">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Settings Panel: Social Networks -->
      <div v-show="activeSettingsTab === 'social'" class="settings-sub-panel active" id="settings-panel-social" style="display: flex; flex-direction: column; gap: 8px;">
        
        <!-- Collapsible Section: Facebook -->
        <div class="social-collapse-group" :class="{ open: expandedSocial.facebook }">
          <div class="social-collapse-header" @click="toggleSocialSection('facebook')">
            <span class="social-platform-title">Facebook</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="social-collapse-chevron-svg">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div v-show="expandedSocial.facebook" class="social-collapse-body">
            <!-- Block "Seen" in Chat -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_seen_chat_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_seen_chat_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_seen_chat" @change="onToggleChange('block_seen_chat', 'block_seen_chat', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Block "Seen" in Stories -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_seen_story_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_seen_story_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_seen_story_facebook" @change="onToggleChange('block_seen_story_facebook', 'block_seen_story_facebook', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Block "Typing..." in Chat -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_typing_chat_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_typing_chat_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_typing_chat" @change="onToggleChange('block_typing_chat', 'block_typing_chat', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Prevent Feed Auto-Reload -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_prevent_reload_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_prevent_reload_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.prevent_facebook_feed_reload" @change="onToggleChange('prevent_facebook_feed_reload', 'prevent_facebook_feed_reload', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Block Suggested Posts -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_suggested_posts_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_suggested_posts_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_suggested_posts" @change="onToggleChange('block_suggested_posts', 'block_suggested_posts', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Facebook Time Counter -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.fb_timer_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.fb_timer_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.show_facebook_time_counter" @change="onToggleChange('show_facebook_time_counter', 'show_facebook_time_counter', false)">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Collapsible Section: Instagram -->
        <div class="social-collapse-group" :class="{ open: expandedSocial.instagram }">
          <div class="social-collapse-header" @click="toggleSocialSection('instagram')">
            <span class="social-platform-title">Instagram</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="social-collapse-chevron-svg">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div v-show="expandedSocial.instagram" class="social-collapse-body">
            <!-- Block "Seen" in Stories -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.ig_seen_story_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.ig_seen_story_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_seen_story_instagram" @change="onToggleChange('block_seen_story_instagram', 'block_seen_story_instagram', false)">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Collapsible Section: Zalo -->
        <div class="social-collapse-group" :class="{ open: expandedSocial.zalo }">
          <div class="social-collapse-header" @click="toggleSocialSection('zalo')">
            <span class="social-platform-title">Zalo</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="social-collapse-chevron-svg">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div v-show="expandedSocial.zalo" class="social-collapse-body">
            <!-- Block "Seen" in Chat -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.zalo_seen_chat_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.zalo_seen_chat_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_seen_zalo" @change="onToggleChange('block_seen_zalo', 'block_seen_zalo', false)">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Block "Typing..." -->
            <div class="social-setting-row">
              <div class="social-setting-info">
                <span class="social-setting-title">{{ t('settings.zalo_typing_chat_title') }}</span>
                <span class="social-setting-desc">{{ t('settings.zalo_typing_chat_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.block_typing_zalo" @change="onToggleChange('block_typing_zalo', 'block_typing_zalo', false)">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <!-- Settings Panel: Others -->
      <div v-show="activeSettingsTab === 'others'" class="settings-sub-panel active" id="settings-panel-others">
        <div class="settings-form">
          <!-- Language Selection -->
          <div class="form-group">
            <label class="form-label">{{ t('settings.language_label') }}</label>
            <select class="form-control" v-model="currentLang" @change="changeLanguage">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <!-- Auto Translate -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.auto_translate_title') }}</span>
              <span class="card-desc">{{ t('settings.auto_translate_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.autoTranslateActive" @change="onToggleChange('autoTranslateActive', null, false)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Share Usage Data -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.usage_title') }}</span>
              <span class="card-desc" @click="handlePolicyClick" v-html="t('settings.usage_desc')"></span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.shareUsageData" @change="onToggleChange('shareUsageData', null, true)">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Dark Mode -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('settings.dark_mode_title') }}</span>
              <span class="card-desc">{{ t('settings.dark_mode_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode">
              <span class="slider round"></span>
            </label>
          </div>


        </div>
      </div>
    </div>

    <!-- Sticky Footer -->
    <div class="sync-row">
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span class="last-sync-text">
          <span>{{ t('settings.update_label') }} </span>
          <strong>{{ formattedLastSync }}</strong>
        </span>
        <span style="font-size: 10px; color: var(--text-muted);">
          <span>{{ appName }}</span> v<span>{{ appVersion }}</span> 
          (<a href="https://blog.kimidev.net/changelog" target="_blank" style="color: var(--primary-blue); text-decoration: none; font-weight: 500;">Changelog</a>) | 
          <span>{{ t('settings.credit_by') }} </span> 
          <a href="https://blog.kimidev.net" target="_blank" style="color: var(--primary-blue); text-decoration: none; font-weight: 500;">{{ authorName }}</a>
        </span>
      </div>
      <div style="display: flex; gap: 6px;">
        <!-- About Button -->
        <button @click="$emit('show-about')" class="btn-sync-action" style="background-color: rgba(255, 255, 255, 0.05); color: var(--text-desc); border: none; cursor: pointer;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; color: var(--text-desc);">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>{{ t('settings.about_btn') }}</span>
        </button>
        <button @click="$emit('show-feedback')" class="btn-sync-action" style="background-color: var(--primary-light); color: var(--primary-blue); border: none; cursor: pointer;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; color: var(--primary-blue);">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{{ t('settings.feedback_btn') || 'Góp ý' }}</span>
        </button>
        <button @click="openDonate" class="btn-sync-action" style="background-color: var(--danger-light); color: var(--danger); border: none; cursor: pointer;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; color: var(--danger);">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{{ t('settings.donate_btn') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from '../composables/useI18n.js';
import { CONFIG } from '../../config.js';

export default {
  name: 'SettingsTab',
  emits: ['recheck-domain', 'update-tracker-ui', 'update-ad-ui', 'show-feedback'],
  setup(props, { emit }) {
    const { t, currentLang, setLanguage } = useI18n();
    const activeSettingsTab = ref('security');
    const isDarkMode = ref(true);
    const activeAccentColor = ref('blue');
    const lastSyncTime = ref(null);

    const expandedSocial = reactive({
      facebook: true,
      instagram: false,
      zalo: false
    });

    const toggleSocialSection = (platform) => {
      expandedSocial[platform] = !expandedSocial[platform];
    };

    const settings = reactive({
      webShieldActive: true,
      anti_clickjacking: true,
      enable_right_click: false,
      removeTrackingParams: false,
      gpcEnabled: true,
      canvasFingerprintActive: false,
      block_seen_chat: false,
      block_seen_story_facebook: false,
      block_typing_chat: false,
      prevent_facebook_feed_reload: false,
      block_suggested_posts: false,
      show_facebook_time_counter: false,
      block_seen_story_instagram: false,
      block_seen_zalo: false,
      block_typing_zalo: false,
      autoTranslateActive: false,
      shareUsageData: true,
    });

    const accentColors = {
      blue: '#009ef7',
      indigo: '#8950fc',
      teal: '#50cd89',
      danger: '#f1416c'
    };

    onMounted(() => {
      // Restore settings tab
      chrome.storage.local.get(['activeSettingsTab'], (res) => {
        if (res.activeSettingsTab) {
          activeSettingsTab.value = res.activeSettingsTab;
        }
      });

      // Restore toggles
      const keys = Object.keys(settings);
      chrome.storage.local.get(keys, (stored) => {
        keys.forEach(key => {
          // Default checks matching ToggleRegistry
          const defaultsOn = [
            'webShieldActive', 'anti_clickjacking', 'gpcEnabled', 
            'canvasFingerprintActive', 'shareUsageData'
          ];
          if (defaultsOn.includes(key)) {
            settings[key] = stored[key] !== false;
          } else {
            settings[key] = stored[key] === true;
          }
        });
      });

      // Restore dark mode
      chrome.storage.local.get(['themeMode'], (res) => {
        isDarkMode.value = res.themeMode !== 'light';
        applyDarkModeUI(isDarkMode.value);
      });

      // Restore accent color
      chrome.storage.local.get(['accentColor'], (res) => {
        activeAccentColor.value = res.accentColor || 'blue';
        applyAccentColorUI(activeAccentColor.value);
      });

      // Restore sync time
      chrome.storage.local.get(['lastUpdated'], (res) => {
        if (res.lastUpdated) {
          lastSyncTime.value = res.lastUpdated;
        }
      });
    });

    const setSettingsTab = (tab) => {
      activeSettingsTab.value = tab;
      chrome.storage.local.set({ activeSettingsTab: tab });
    };

    const changeLanguage = () => {
      setLanguage(currentLang.value);
    };

    const onToggleChange = (storageKey, syncKey, defaultVal) => {
      const val = settings[storageKey];
      chrome.storage.local.set({ [storageKey]: val });
      if (syncKey) {
        chrome.storage.sync.set({ [syncKey]: val });
      }

      // Handle callbacks / side effects
      if (storageKey === 'webShieldActive') {
        emit('recheck-domain');
      } else if (storageKey === 'trackerActive') {
        emit('update-tracker-ui');
      } else if (storageKey === 'adActive') {
        emit('update-ad-ui');
      }
    };

    // Dark Mode
    const applyDarkModeUI = (dark) => {
      if (dark) {
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
      }
    };

    const toggleDarkMode = () => {
      const dark = isDarkMode.value;
      applyDarkModeUI(dark);
      chrome.storage.local.set({ themeMode: dark ? 'dark' : 'light' });
    };

    // Accent Colors
    const getAccentColorHex = (color) => accentColors[color] || accentColors.blue;

    const applyAccentColorUI = (colorName) => {
      const hex = getAccentColorHex(colorName);
      document.documentElement.style.setProperty('--primary-blue', hex);
    };

    const setAccentColor = (color) => {
      activeAccentColor.value = color;
      chrome.storage.local.set({ accentColor: color });
      applyAccentColorUI(color);
    };

    // Actions
    const openProductPolicy = () => {
      chrome.tabs.create({ url: 'https://www.avast.com/product-policy' });
    };

    const openDonate = () => {
      chrome.tabs.create({ url: 'https://blog.kimidev.net/donate' });
    };

    const handlePolicyClick = (e) => {
      if (e.target && e.target.id === 'product-policy-link') {
        e.preventDefault();
        openProductPolicy();
      }
    };

    // Computed values for Footer credits
    const appName = computed(() => CONFIG.APP_NAME);
    const appVersion = computed(() => CONFIG.VERSION);
    const authorName = computed(() => CONFIG.AUTHOR);

    const formattedLastSync = computed(() => {
      if (!lastSyncTime.value) {
        return t('settings.not_synced');
      }
      const date = new Date(lastSyncTime.value);
      const localeCode = currentLang.value === 'vi' ? 'vi-VN' : 'en-US';
      return date.toLocaleDateString(localeCode) + ' ' + date.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    return {
      t,
      currentLang,
      activeSettingsTab,
      isDarkMode,
      activeAccentColor,
      settings,
      formattedLastSync,
      appName,
      appVersion,
      authorName,
      setSettingsTab,
      changeLanguage,
      onToggleChange,
      toggleDarkMode,
      getAccentColorHex,
      setAccentColor,
      openProductPolicy,
      openDonate,
      handlePolicyClick,
      expandedSocial,
      toggleSocialSection
    };
  }
};
</script>
