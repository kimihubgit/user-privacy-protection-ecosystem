<template>
  <div style="display: flex; flex-direction: column; gap: 12px; height: 100%;">
    <h2 class="title">{{ t('tracking.title') }}</h2>
    <p class="subtitle">{{ t('tracking.subtitle') }}</p>
    
    <!-- Scrollable container to prevent content from cutting off when options are expanded -->
    <div class="settings-scroll-container" style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0; margin-bottom: 0; padding-right: 4px; overflow-x: hidden;">
      <!-- Anti-Tracking Card -->
      <div class="card card-toggle">
        <div class="card-info">
          <span class="card-title">{{ t('tracking.toggle_title') }}</span>
          <span class="card-desc">{{ t('tracking.toggle_desc') }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="trackerActive" @change="updateTrackerStorage">
          <span class="slider round"></span>
        </label>
      </div>



      <!-- Tracker List Section -->
      <div class="tracker-section" style="display: flex; flex-direction: column; min-height: 180px; flex-shrink: 0; margin-bottom: 8px;">
        <div class="section-header">
          <span>{{ t('tracking.list_header') }}</span>
          <span class="badge badge-light-blue" id="tracker-count-badge">{{ t('tracking.count_badge', displayTrackers.length) }}</span>
        </div>
        <div class="tracker-list" id="tracker-list-box" style="flex: 1; max-height: 180px; overflow-y: auto;">
          <!-- Disabled State -->
          <div v-if="!trackerActive" class="empty-state">
            {{ t('tracking.disabled_status') || 'Vui lòng kích hoạt bộ lọc.' }}
          </div>
          <!-- Empty State -->
          <div v-else-if="displayTrackers.length === 0" class="empty-state">
            {{ t('tracking.empty') }}
          </div>
          <!-- Render list -->
          <template v-else>
            <div 
              v-for="(tracker, idx) in displayTrackers" 
              :key="idx" 
              class="tracker-item"
              style="display: flex; justify-content: space-between; align-items: center;"
            >
              <span class="tracker-name" style="font-family: monospace; select-all: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; padding-right: 8px;">{{ tracker }}</span>
              <span class="badge-light-blue" style="background-color: var(--danger-light); color: var(--danger); font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">
                {{ t('tracking.blocked_badge') || 'Blocked' }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'TrackingTab',
  props: {
    currentDomain: { type: String, default: '' },
    domainReputation: { type: String, default: 'safe' }
  },
  setup(props) {
    const { t } = useI18n();
    const trackerActive = ref(true);

    // Load states on mount
    onMounted(() => {
      chrome.storage.local.get(['trackerActive'], (res) => {
        trackerActive.value = res.trackerActive !== false;
      });
    });

    const updateTrackerStorage = () => {
      chrome.storage.local.set({ trackerActive: trackerActive.value });
    };

    // Calculate trackers list based on active domain
    const displayTrackers = computed(() => {
      if (!trackerActive.value || !props.currentDomain) return [];
      const domain = props.currentDomain.toLowerCase();

      if (domain.includes('google.com') || domain.includes('github.com')) {
        return [];
      } else if (domain.includes('facebook.com')) {
        return ['facebook.com (Audience Network)', 'connect.facebook.net'];
      } else if (domain.includes('news') || domain.includes('vnexpress') || domain.includes('dantri')) {
        return ['google-analytics.com', 'doubleclick.net', 'hotjar.com', 'criteo.com'];
      } else {
        return ['google-analytics.com', 'doubleclick.net', 'facebook-pixel'];
      }
    });

    return {
      t,
      trackerActive,
      displayTrackers,
      updateTrackerStorage
    };
  }
};
</script>

