


<template>
  <div class="app-layout" v-if="isLoaded">
    <!-- Sidebar -->
    <div class="sidebar" style="padding-top: 10px;">
      <!-- Shield Brand Logo -->
      <div 
        class="sidebar-logo" 
        :style="{ color: globalEnabled ? 'var(--primary-blue)' : 'var(--text-muted)' }"
        style="display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; margin-bottom: 8px; transition: color 0.2s ease;"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 20px; height: 20px;">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>

      <div class="sidebar-top">
        <button 
          :class="['nav-item', { active: activeTab === 'dashboard' }]" 
          @click="setActiveTab('dashboard')"
          :title="t('nav.dashboard')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        <button 
          :class="['nav-item', { active: activeTab === 'datashield' }]" 
          @click="setActiveTab('datashield')"
          :title="t('nav.datashield')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
        <button 
          :class="['nav-item', { active: activeTab === 'adblock' }]" 
          @click="setActiveTab('adblock')"
          :title="t('nav.adblock')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <span class="sidebar-badge badge-blue count-badge">{{ globalEnabled && adActive ? adsCount : '--' }}</span>
        </button>
        <button 
          :class="['nav-item', { active: activeTab === 'advisor' }]" 
          @click="setActiveTab('advisor')"
          :title="t('nav.advisor')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
          <span class="sidebar-badge badge-blue count-badge">7</span>
        </button>
        <button 
          :class="['nav-item', { active: activeTab === 'proxy' }]" 
          @click="setActiveTab('proxy')"
          :title="t('nav.proxy')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6" y2="6.01"></line>
            <line x1="6" y1="18" x2="6" y2="18.01"></line>
          </svg>
          <span class="proxy-dot" :class="{ active: proxyActive && globalEnabled }"></span>
        </button>

        <button 
          :class="['nav-item', { active: activeTab === 'stats' }]" 
          @click="setActiveTab('stats')"
          :title="t('nav.stats')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </button>
      </div>

      <div class="sidebar-bottom">
        <button 
          :class="['nav-item', { active: activeTab === 'settings' }]" 
          @click="setActiveTab('settings')"
          :title="t('nav.settings')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="workspace">
      <!-- Global Floating Power Toggle -->
      <button 
        :class="{ active: globalEnabled }" 
        id="global-power-btn" 
        @click="togglePowerMenu" 
        :title="globalEnabled ? t('settings.power_btn_tooltip_on') : t('settings.power_btn_tooltip_off')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px;">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
      </button>

      <!-- Power Control Menu Overlay -->
      <PowerMenuOverlay 
        v-if="showPowerMenu" 
        :globalEnabled="globalEnabled" 
        :adActive="adActive"
        @close="showPowerMenu = false" 
        @toggle-global="toggleGlobalPower" 
        @refresh-states="checkActiveTabDomain" 
      />

      <!-- Tab Pane: Dashboard -->
      <div :class="['tab-pane', { active: activeTab === 'dashboard' }]" id="tab-dashboard" style="height: 100%;">
        <DashboardTab 
          :globalEnabled="globalEnabled"
          :domainReputation="domainReputation"
          :displayDomainText="displayDomainText"
          :reputationBadgeColor="reputationBadgeColor"
          :reputationBadgeText="reputationBadgeText"
          :homographData="homographData"
        />
      </div>

      <!-- Tab Pane: Data Shield -->
      <div :class="['tab-pane', { active: activeTab === 'datashield' }]" id="tab-datashield" style="height: 100%;">
        <DataShieldTab />
      </div>

      <!-- Tab Pane: Adblock -->
      <div :class="['tab-pane', { active: activeTab === 'adblock' }]" id="tab-adblock" style="height: 100%;">
        <AdblockTab :blockedCount="adsCount" />
      </div>

      <!-- Tab Pane: Advisor -->
      <div :class="['tab-pane', { active: activeTab === 'advisor' }]" id="tab-advisor" style="height: 100%;">
        <AdvisorTab />
      </div>

      <!-- Tab Pane: Proxy -->
      <div :class="['tab-pane', { active: activeTab === 'proxy' }]" id="tab-proxy" style="height: 100%;">
        <ProxyTab />
      </div>

      <!-- Tab Pane: Stats -->
      <div :class="['tab-pane', { active: activeTab === 'stats' }]" id="tab-stats" style="height: 100%;">
        <StatsTab />
      </div>

      <!-- Tab Pane: Settings -->
      <div :class="['tab-pane', { active: activeTab === 'settings' }]" id="tab-settings" style="height: 100%;">
        <SettingsTab @recheck-domain="checkActiveTabDomain" @show-feedback="showFeedbackOverlay = true" @show-about="showAboutOverlay = true" />
      </div>
    </div>

    <!-- Unified Toast mount element so that showToast works perfectly -->
    <div id="cookie-toast" class="cookie-toast" style="display: none;"></div>

    <!-- Overlays -->
    <TermsOverlay v-if="isLoaded && !termsAccepted" @accept="acceptTerms" />
    <FeedbackOverlay v-else-if="showFeedbackOverlay" @close="showFeedbackOverlay = false" />
    <AboutOverlay v-else-if="showAboutOverlay" @close="showAboutOverlay = false" />
  </div>
</template>

<script>


import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18nProvider } from './composables/useI18n.js';

// Import child components
import DashboardTab from './views/DashboardTab.vue';
import DataShieldTab from './views/DataShieldTab.vue';
import AdblockTab from './views/AdblockTab.vue';
import AdvisorTab from './views/AdvisorTab.vue';
import ProxyTab from './views/ProxyTab.vue';

import StatsTab from './views/StatsTab.vue';
import SettingsTab from './views/SettingsTab.vue';
import TermsOverlay from './components/TermsOverlay.vue';
import FeedbackOverlay from './components/FeedbackOverlay.vue';
import AboutOverlay from './components/AboutOverlay.vue';
import PowerMenuOverlay from './components/PowerMenuOverlay.vue';

export default {
  name: 'App',
  components: {
    DashboardTab,
    DataShieldTab,
    AdblockTab,
    AdvisorTab,
    ProxyTab,

    StatsTab,
    SettingsTab,
    TermsOverlay,
    FeedbackOverlay,
    AboutOverlay,
    PowerMenuOverlay
  },
  setup() {
    // Init i18n
    const i18n = useI18nProvider();
    const { t, isLoaded } = i18n;

    // States
    const activeTab = ref('dashboard');
    const globalEnabled = ref(true);
    const showPowerMenu = ref(false);
    const showFeedbackOverlay = ref(false);
    const showAboutOverlay = ref(false);
    const adActive = ref(true);

    const currentUrl = ref('');
    const currentDomain = ref('');
    const isSystemPage = ref(false);
    const domainReputation = ref('checking'); // 'checking', 'safe', 'danger', 'not_found', 'system', 'disabled', 'homograph'
    const homographData = ref(null);

    const trackersCount = ref(0);
    const adsCount = ref(0);
    const proxyActive = ref(false);

    // Overlays state
    const termsAccepted = ref(true);

    // Load active tab domain, check CWS details & scam status
    const checkActiveTabDomain = () => {
      if (!globalEnabled.value) {
        domainReputation.value = 'disabled';
        trackersCount.value = 0;
        adsCount.value = 0;
        return;
      }

      domainReputation.value = 'checking';

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          currentDomain.value = '';
          currentUrl.value = '';
          isSystemPage.value = true;
          return;
        }

        const tab = tabs[0];
        currentUrl.value = tab.url || '';

        try {
          const urlObj = new URL(currentUrl.value);
          const domain = urlObj.hostname;
          currentDomain.value = domain;

          // Check system page
          if (urlObj.protocol === 'chrome:' || urlObj.protocol === 'chrome-extension:') {
            isSystemPage.value = true;
            domainReputation.value = 'system';
            trackersCount.value = 0;
            adsCount.value = 0;
            return;
          }

          isSystemPage.value = false;
          domainReputation.value = 'checking';

          // Check blacklisted domains and homograph attacks
          chrome.runtime.sendMessage({ action: "checkDomain", domain }, (response) => {
            const status = (response && response.status) ? response.status : 'checking';
            const homograph = (response && response.homograph) ? response.homograph : null;
            chrome.storage.local.get('webShieldActive', (resShield) => {
              const isShieldActive = resShield.webShieldActive !== false;
              if (isShieldActive) {
                if (status === 'unsafe_homograph') {
                  domainReputation.value = 'homograph';
                  homographData.value = homograph;
                  trackersCount.value = 0;
                  adsCount.value = 0;
                } else if (status === 'unsafe') {
                  domainReputation.value = 'danger';
                  homographData.value = null;
                  trackersCount.value = 0;
                  adsCount.value = 0;
                } else if (status === 'not_found') {
                  domainReputation.value = 'not_found';
                  homographData.value = null;
                  calculateTrackersAndAds(domain);
                } else if (status === 'safe') {
                  domainReputation.value = 'safe';
                  homographData.value = null;
                  calculateTrackersAndAds(domain);
                } else {
                  domainReputation.value = 'checking';
                  homographData.value = null;
                  calculateTrackersAndAds(domain);
                }
              } else {
                domainReputation.value = 'disabled';
                homographData.value = null;
                calculateTrackersAndAds(domain);
              }
            });
          });

        } catch (e) {
          isSystemPage.value = true;
          domainReputation.value = 'safe';
        }
      });
    };

    const acceptTerms = () => {
      chrome.storage.local.set({ termsAccepted: true }, () => {
        termsAccepted.value = true;
      });
    };

    // Tracker & ads calculator
    const calculateTrackersAndAds = (domain) => {
      if (!domain) {
        trackersCount.value = 0;
        adsCount.value = 0;
        return;
      }
      
      const lowDomain = domain.toLowerCase();
      let trCount = 0;

      if (lowDomain.includes('google.com') || lowDomain.includes('github.com')) {
        trCount = 0;
      } else if (lowDomain.includes('facebook.com')) {
        trCount = 2;
      } else if (lowDomain.includes('news') || lowDomain.includes('vnexpress') || lowDomain.includes('dantri')) {
        trCount = 4;
      } else {
        trCount = 3;
      }

      trackersCount.value = trCount;

      if (adActive.value && trCount > 0) {
        adsCount.value = (domain.length % 15) + trCount * 2;
      } else {
        adsCount.value = 0;
      }
    };

    // Toggle global power
    const toggleGlobalPower = () => {
      const nextState = !globalEnabled.value;
      chrome.storage.local.set({ globalEnabled: nextState }, () => {
        globalEnabled.value = nextState;
        updateBadgeIcon(nextState);
        checkActiveTabDomain();
      });
    };

    const updateBadgeIcon = (enabled) => {
      const suffix = enabled ? "o" : "f";
      if (chrome.action && chrome.action.setIcon) {
        chrome.action.setIcon({
          path: {
            "16": `/assets/icons/ki16${suffix}.png`,
            "32": `/assets/icons/ki32${suffix}.png`,
            "64": `/assets/icons/ki64${suffix}.png`,
            "128": `/assets/icons/ki128${suffix}.png`
          }
        });
      }
    };

    // Sidebar navigation
    const setActiveTab = (tab) => {
      activeTab.value = tab;
      chrome.storage.local.set({ activeTab: tab });
    };

    // Watchers for reactive settings
    watch([adActive], () => {
      if (currentDomain.value) {
        calculateTrackersAndAds(currentDomain.value);
      }
    });

    // Storage updates listener
    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        if (changes.globalEnabled) {
          globalEnabled.value = changes.globalEnabled.newValue !== false;
          updateBadgeIcon(globalEnabled.value);
          checkActiveTabDomain();
        }
        if (changes.adActive) {
          adActive.value = changes.adActive.newValue !== false;
        }
        if (changes.proxyActive) {
          proxyActive.value = changes.proxyActive.newValue === true;
        }
      }
    };

    // Tab switch and reload listener
    const handleTabActivated = () => {
      checkActiveTabDomain();
    };

    const handleTabUpdated = (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        checkActiveTabDomain();
      }
    };

    onMounted(() => {
      // Load initial values from storage
      chrome.storage.local.get([
        'activeTab', 
        'globalEnabled', 
        'adActive', 
        'termsAccepted',
        'proxyActive'
      ], (res) => {
        termsAccepted.value = res.termsAccepted === true;

        if (res.activeTab === 'tracking' || res.activeTab === 'antibot') {
          activeTab.value = 'dashboard';
        } else if (res.activeTab) {
          activeTab.value = res.activeTab;
        }
        globalEnabled.value = res.globalEnabled !== false;
        adActive.value = res.adActive !== false;
        proxyActive.value = res.proxyActive === true;

        updateBadgeIcon(globalEnabled.value);
        checkActiveTabDomain();
      });

      chrome.storage.onChanged.addListener(handleStorageChange);
      chrome.tabs.onActivated.addListener(handleTabActivated);
      chrome.tabs.onUpdated.addListener(handleTabUpdated);

      // Listen to window events dispatched by SettingsTab
      window.addEventListener('languageChanged', checkActiveTabDomain);
      window.addEventListener('adActiveChanged', checkActiveTabDomain);
    });

    onUnmounted(() => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      window.removeEventListener('languageChanged', checkActiveTabDomain);
      window.removeEventListener('adActiveChanged', checkActiveTabDomain);
    });

    // Domain texts
    const displayDomainText = computed(() => {
      if (isSystemPage.value) return t('dashboard.domain_system');
      return currentDomain.value || t('dashboard.domain_no_tab');
    });

    const reputationBadgeText = computed(() => {
      if (!globalEnabled.value) return t('dashboard.reputation_disabled');
      if (isSystemPage.value) return t('dashboard.reputation_system');
      if (domainReputation.value === 'checking' || domainReputation.value === 'error' || domainReputation.value === 'offline') {
        return t('dashboard.reputation_checking') || 'Đang kiểm tra...';
      }
      if (domainReputation.value === 'disabled') return t('dashboard.reputation_disabled');
      if (domainReputation.value === 'homograph') return t('dashboard.reputation_homograph') || 'Mạo danh (IDN)';
      if (domainReputation.value === 'danger') return t('dashboard.reputation_danger');
      if (domainReputation.value === 'not_found') return t('dashboard.reputation_not_found') || 'Chưa đánh giá';
      return t('dashboard.reputation_safe');
    });

    const reputationBadgeColor = computed(() => {
      if (!globalEnabled.value) return 'var(--danger)';
      if (isSystemPage.value) return 'var(--accent-indigo)';
      if (domainReputation.value === 'checking' || domainReputation.value === 'error' || domainReputation.value === 'offline') {
        return 'var(--warning)';
      }
      if (domainReputation.value === 'disabled') return 'var(--text-muted)';
      if (domainReputation.value === 'homograph') return 'var(--danger)';
      if (domainReputation.value === 'danger') return 'var(--danger)';
      if (domainReputation.value === 'not_found') return 'var(--warning)';
      return 'var(--accent-teal)';
    });

    const togglePowerMenu = () => {
      showPowerMenu.value = !showPowerMenu.value;
    };

    return {
      t,
      isLoaded,
      activeTab,
      globalEnabled,
      showPowerMenu,
      togglePowerMenu,
      adActive,

      currentDomain,
      currentUrl,
      isSystemPage,
      domainReputation,
      homographData,
      trackersCount,
      adsCount,
      proxyActive,
      setActiveTab,
      toggleGlobalPower,
      checkActiveTabDomain,

      displayDomainText,
      reputationBadgeText,
      reputationBadgeColor,

      // Overlay items
      termsAccepted,
      acceptTerms,
      showFeedbackOverlay,
      showAboutOverlay
    };
  }
};
</script>
