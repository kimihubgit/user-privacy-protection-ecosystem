<template>
  <div>
    <h2 class="title">{{ t('adblock.title') }}</h2>
    <p class="subtitle">{{ t('adblock.subtitle') }}</p>
    
    <div class="card card-toggle">
      <div class="card-info">
        <span class="card-title">{{ t('adblock.toggle_title') }}</span>
        <span class="card-desc">{{ t('adblock.toggle_desc') }}</span>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="adActive" @change="updateAdStorage">
        <span class="slider round"></span>
      </label>
    </div>

    <div class="counter-display">
      <div class="counter-value" id="ad-count-val">{{ displayCount }}</div>
      <div class="counter-label">{{ t('adblock.counter_label') }}</div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'AdblockTab',
  props: {
    blockedCount: { type: [Number, String], default: 0 }
  },
  setup(props) {
    const { t } = useI18n();
    const adActive = ref(true);

    onMounted(() => {
      chrome.storage.local.get(['adActive'], (res) => {
        adActive.value = res.adActive !== false;
      });
    });

    const updateAdStorage = () => {
      chrome.storage.local.set({ adActive: adActive.value });
      // Dispatch an event to update counts
      window.dispatchEvent(new Event('adActiveChanged'));
    };

    const displayCount = computed(() => {
      if (!adActive.value) return '--';
      return props.blockedCount;
    });

    return {
      t,
      adActive,
      displayCount,
      updateAdStorage
    };
  }
};
</script>
