<template>
  <div style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
    <h2 class="title">{{ t('advisor.title') }}</h2>
    <p class="subtitle">{{ t('advisor.subtitle') }}</p>
    
    <div class="sub-nav">
      <button 
        :class="['sub-nav-item', { active: activeSubTab === 'explore' }]" 
        @click="activeSubTab = 'explore'"
      >
        {{ t('advisor.tab_explore', exploreGuides.length) }}
      </button>
      <button 
        :class="['sub-nav-item', { active: activeSubTab === 'completed' }]" 
        @click="activeSubTab = 'completed'"
      >
        {{ t('advisor.tab_completed', completedGuides.length) }}
      </button>
    </div>

    <div class="guides-list">
      <!-- Explore guides -->
      <template v-if="activeSubTab === 'explore'">
        <div 
          v-for="(guide, index) in exploreGuides" 
          :key="'explore-' + index"
          class="guide-item"
          @click="runGuide(guide)"
        >
          <img :src="getIconPath(guide.brand)" :alt="guide.brand" class="guide-brand-icon">
          <div class="guide-details">
            <span class="guide-name">{{ guide.brand }}</span>
            <span class="guide-action">{{ guide.action }}</span>
          </div>
          <div class="guide-meta">
            <span class="time-badge">{{ guide.time }}</span>
            <div class="arrow-wrapper">
              <svg viewBox="-5 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-1783.000000, -158.000000)" fill="currentColor" fill-rule="nonzero">
                    <g transform="translate(1350.000000, 120.000000)">
                      <path d="M436.453517,38.569249 L447.302459,48.9938158 L447.39261,49.0748802 C447.75534,49.423454 447.968159,49.8870461 448,50.4382227 L447.998135,50.6228229 C447.968159,51.1129539 447.75534,51.576546 447.333675,51.9774469 L447.339095,51.9689832 L436.453517,62.430751 C435.663694,63.1897497 434.399001,63.1897497 433.609178,62.430751 C432.796941,61.650213 432.796941,60.3675924 433.609432,59.5868106 L443.012324,50.5572471 L433.609178,41.4129456 C432.796941,40.6324076 432.796941,39.349787 433.609178,38.569249 C434.399001,37.8102503 435.663694,37.8102503 436.453517,38.569249 Z" id="right"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </template>

      <!-- Completed guides -->
      <template v-else>
        <div 
          v-for="(guide, index) in completedGuides" 
          :key="'completed-' + index"
          class="guide-item completed"
          style="opacity: 0.6; cursor: default;"
        >
          <img :src="getIconPath(guide.brand)" :alt="guide.brand" class="guide-brand-icon">
          <div class="guide-details">
            <span class="guide-name">{{ guide.brand }}</span>
            <span class="guide-action" style="text-decoration: line-through;">{{ guide.action }}</span>
          </div>
          <div class="guide-meta">
            <span class="time-badge">{{ guide.time }}</span>
            <div class="checkmark-wrapper" style="color: var(--accent-teal); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 14px; height: 14px;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'AdvisorTab',
  setup() {
    const { t } = useI18n();
    const activeSubTab = ref('explore');

    // Guide configurations matching original backup popup.html
    const guides = computed(() => [
      { brand: 'Amazon', action: t('advisor.amazon_action'), time: t('advisor.time_2m'), isCompleted: false, url: 'https://www.amazon.com/gp/history' },
      { brand: 'Facebook', action: t('advisor.facebook_action'), time: t('advisor.time_5m'), isCompleted: false, url: 'https://www.facebook.com/settings?tab=privacy' },
      { brand: 'Google', action: t('advisor.google1_action'), time: t('advisor.time_4m'), isCompleted: false, url: 'https://myaccount.google.com/security' },
      { brand: 'Google', action: t('advisor.google2_action'), time: t('advisor.time_2m'), isCompleted: false, url: 'https://myadcenter.google.com/' },
      { brand: 'Google', action: t('advisor.google3_action'), time: t('advisor.time_1m'), isCompleted: true, url: 'chrome://settings/syncSetup' },
      { brand: 'LinkedIn', action: t('advisor.linkedin_action'), time: t('advisor.time_3m'), isCompleted: false, url: 'https://www.linkedin.com/mypreferences/d/settings/policy-and-academic-research' },
      { brand: 'Twitter', action: t('advisor.twitter1_action'), time: t('advisor.time_3m'), isCompleted: false, url: 'https://x.com/settings/audience_and_tagging' },
      { brand: 'Twitter', action: t('advisor.twitter2_action'), time: t('advisor.time_3m'), isCompleted: false, url: 'https://x.com/settings/audience_and_tagging' }
    ]);

    const exploreGuides = computed(() => guides.value.filter(g => !g.isCompleted));
    const completedGuides = computed(() => guides.value.filter(g => g.isCompleted));

    const getIconPath = (brand) => {
      // Maps to matching assets/social/*.svg names
      let name = brand;
      if (brand === 'X') name = 'Twitter';
      return chrome.runtime.getURL(`assets/social/${name}.svg`);
    };

    const runGuide = (guide) => {
      if (guide.url) {
        chrome.tabs.create({ url: guide.url });
      }
    };

    return {
      t,
      activeSubTab,
      exploreGuides,
      completedGuides,
      getIconPath,
      runGuide
    };
  }
};
</script>
