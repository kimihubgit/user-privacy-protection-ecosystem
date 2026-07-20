


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
          :class="['nav-item', { active: activeTab === 'tracking' }]" 
          @click="setActiveTab('tracking')"
          :title="t('nav.tracking')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
            <path d="M12 6v6l4 2"></path>
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
          <span class="proxy-dot" :class="{ active: proxyActive }" style="display: none;"></span>
        </button>
        <!-- 2FA Authenticator Button (Hidden for future development)
        <button 
          :class="['nav-item', { active: activeTab === 'authenticator' }]" 
          @click="setActiveTab('authenticator')"
          :title="t('nav.authenticator')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 21 1.726-2.761a8 8 0 0 0 1.06-2.671l.059-.291a8.002 8.002 0 0 0 .155-1.57V12m-9 3.5c.5-1 1-2.043 1-3.5 0-1.74.556-3.352 1.5-4.665m0 11.165c2-2 2.5-5.237 2.5-6.5a4 4 0 0 1 7.954-.61M19.5 17.5c.5-2 .5-4 .5-5.5A8 8 0 0 0 8 5.07M15.954 15c-.174 1.393-.666 3.181-1.954 5.5"/>
          </svg>
        </button>
        -->
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
        @click="toggleGlobalPower" 
        :title="globalEnabled ? t('settings.power_btn_tooltip_on') : t('settings.power_btn_tooltip_off')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px;">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
      </button>

      <!-- Tab Pane: Dashboard -->
      <div :class="['tab-pane', { active: activeTab === 'dashboard' }]" id="tab-dashboard" style="height: 100%;">
        <DashboardTab 
          :globalEnabled="globalEnabled"
          :domainReputation="domainReputation"
          :displayDomainText="displayDomainText"
          :reputationBadgeColor="reputationBadgeColor"
          :reputationBadgeText="reputationBadgeText"
        />
      </div>

      <!-- Tab Pane: Anti-Tracking -->
      <div :class="['tab-pane', { active: activeTab === 'tracking' }]" id="tab-tracking" style="height: 100%;">
        <TrackingTab :currentDomain="currentDomain" :domainReputation="domainReputation" />
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

      <!-- Tab Pane: Authenticator (Hidden for future development)
      <div :class="['tab-pane', { active: activeTab === 'authenticator' }]" id="tab-authenticator" style="height: 100%;">
        <AuthenticatorTab />
      </div>
      -->

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
    <CwsOverlay 
      v-else-if="isLoaded && isCwsPage" 
      :cwsDownloading="cwsDownloading"
      :cwsDownloadingZip="cwsDownloadingZip"
      :cwsDownloadingCrx="cwsDownloadingCrx"
      @view-source="triggerViewSource"
      @download-zip="triggerDownloadZip"
      @download-crx="triggerDownloadCrx"
    />
  </div>
</template>

<script>


import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18nProvider } from './composables/useI18n.js';
import { cwsViewSource, cwsDownloadZip, cwsDownloadCrx } from './utils/cwsHelper.js';

// Import child components
import DashboardTab from './views/DashboardTab.vue';
import TrackingTab from './views/TrackingTab.vue';
import DataShieldTab from './views/DataShieldTab.vue';
import AdblockTab from './views/AdblockTab.vue';
import AdvisorTab from './views/AdvisorTab.vue';
import ProxyTab from './views/ProxyTab.vue';
import AuthenticatorTab from './views/AuthenticatorTab.vue';
import StatsTab from './views/StatsTab.vue';
import SettingsTab from './views/SettingsTab.vue';
import TermsOverlay from './components/TermsOverlay.vue';
import FeedbackOverlay from './components/FeedbackOverlay.vue';
import AboutOverlay from './components/AboutOverlay.vue';
import CwsOverlay from './components/CwsOverlay.vue';

export default {
  name: 'App',
  components: {
    DashboardTab,
    TrackingTab,
    DataShieldTab,
    AdblockTab,
    AdvisorTab,
    ProxyTab,
    AuthenticatorTab,
    StatsTab,
    SettingsTab,
    TermsOverlay,
    FeedbackOverlay,
    AboutOverlay,
    CwsOverlay
  },
  setup() {
    // Init i18n
    const i18n = useI18nProvider();
    const { t, isLoaded } = i18n;

    // States
    const activeTab = ref('dashboard');
    const globalEnabled = ref(true);
    const showFeedbackOverlay = ref(false);
    const showAboutOverlay = ref(false);
    const trackerActive = ref(true);
    const adActive = ref(true);

    const currentUrl = ref('');
    const currentDomain = ref('');
    const isSystemPage = ref(false);
    const domainReputation = ref('safe'); // 'safe', 'danger', 'system'

    const trackersCount = ref(0);
    const adsCount = ref(0);
    const proxyActive = ref(false);

    // Overlays state
    const termsAccepted = ref(true);
    const isCwsPage = ref(false);
    const cwsExtId = ref('');
    const cwsDownloadingZip = ref(false);
    const cwsDownloadingCrx = ref(false);
    const cwsDownloading = computed(() => cwsDownloadingZip.value || cwsDownloadingCrx.value);

    // Load active tab domain, check CWS details & scam status
    const checkActiveTabDomain = () => {
      if (!globalEnabled.value) {
        domainReputation.value = 'safe';
        trackersCount.value = 0;
        adsCount.value = 0;
        return;
      }

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

          // Check Chrome Web Store details page
          const isCwsHost = domain.includes('chromewebstore.google.com') || domain.includes('chrome.google.com');
          const isDetailPath = urlObj.pathname.includes('/detail/') || urlObj.pathname.match(/\/([a-p]{32})(?:\/|\?|$)/);
          
          if (isCwsHost && isDetailPath) {
            isCwsPage.value = true;
            const idMatch = urlObj.pathname.match(/\/detail\/.*?\/([a-p]{32})/) || urlObj.pathname.match(/\/([a-p]{32})(?:\/|\?|$)/);
            cwsExtId.value = idMatch ? idMatch[1] : '';
          } else {
            isCwsPage.value = false;
            cwsExtId.value = '';
          }

          // Check system page
          if (urlObj.protocol === 'chrome:' || urlObj.protocol === 'chrome-extension:') {
            isSystemPage.value = true;
            domainReputation.value = 'system';
            trackersCount.value = 0;
            adsCount.value = 0;
            return;
          }

          isSystemPage.value = false;

          // Check blacklisted domains
          chrome.runtime.sendMessage({ action: "checkDomain", domain }, (response) => {
            const status = response ? response.status : 'safe';
            chrome.storage.local.get('webShieldActive', (resShield) => {
              const isShieldActive = resShield.webShieldActive !== false;
              if (isShieldActive) {
                if (status === 'unsafe') {
                  domainReputation.value = 'danger';
                  trackersCount.value = 0;
                  adsCount.value = 0;
                } else if (status === 'not_found') {
                  domainReputation.value = 'not_found';
                  calculateTrackersAndAds(domain);
                } else {
                  domainReputation.value = 'safe';
                  calculateTrackersAndAds(domain);
                }
              } else {
                domainReputation.value = 'safe';
                calculateTrackersAndAds(domain);
              }
            });
          });

        } catch (e) {
          isSystemPage.value = true;
          domainReputation.value = 'safe';
          trackersCount.value = 0;
          adsCount.value = 0;
        }
      });
    };

    const acceptTerms = () => {
      chrome.storage.local.set({ termsAccepted: true }, () => {
        termsAccepted.value = true;
      });
    };

    const triggerViewSource = () => {
      cwsViewSource(cwsExtId.value);
    };

    const triggerDownloadZip = () => {
      cwsDownloadZip(cwsExtId.value, cwsDownloadingZip, cwsDownloading.value);
    };

    const triggerDownloadCrx = () => {
      cwsDownloadCrx(cwsExtId.value, cwsDownloadingCrx, cwsDownloading.value);
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

      trackersCount.value = trackerActive.value ? trCount : 0;

      if (adActive.value && trackerActive.value && trCount > 0) {
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
    watch([trackerActive, adActive], () => {
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
        if (changes.trackerActive) {
          trackerActive.value = changes.trackerActive.newValue !== false;
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
        'trackerActive', 
        'adActive', 
        'termsAccepted',
        'proxyActive'
      ], (res) => {
        termsAccepted.value = res.termsAccepted === true;

        if (res.activeTab) activeTab.value = res.activeTab;
        globalEnabled.value = res.globalEnabled !== false;
        trackerActive.value = res.trackerActive !== false;
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
      if (domainReputation.value === 'danger') return t('dashboard.reputation_danger');
      if (domainReputation.value === 'not_found') return t('dashboard.reputation_not_found') || 'Chưa đánh giá';
      return t('dashboard.reputation_safe');
    });

    const reputationBadgeColor = computed(() => {
      if (!globalEnabled.value) return 'var(--danger)';
      if (isSystemPage.value) return 'var(--accent-indigo)';
      if (domainReputation.value === 'danger') return 'var(--danger)';
      if (domainReputation.value === 'not_found') return 'var(--warning)';
      return 'var(--accent-teal)';
    });

    return {
      t,
      isLoaded,
      activeTab,
      globalEnabled,
      trackerActive,
      adActive,

      currentDomain,
      currentUrl,
      isSystemPage,
      domainReputation,
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
      isCwsPage,
      cwsDownloadingZip,
      cwsDownloadingCrx,
      cwsDownloading,
      acceptTerms,
      triggerViewSource,
      triggerDownloadZip,
      triggerDownloadCrx,
      showFeedbackOverlay,
      showAboutOverlay
    };
  }
};
</script>
