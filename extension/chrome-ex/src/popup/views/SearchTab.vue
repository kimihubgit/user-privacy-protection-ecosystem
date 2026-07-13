<template>
  <div class="h-full flex flex-col p-4 justify-between">
    <div>
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-base font-bold text-gray-200">{{ t('search.title') }}</h3>
        <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ t('search.subtitle') }}</p>
      </div>

      <!-- Search Input Box -->
      <div class="relative flex items-center mb-3">
        <input 
          v-model="query" 
          @focus="isFocused = true" 
          @keydown.enter="triggerSearch" 
          type="text" 
          class="w-full bg-[#1b1b28] border border-[#2b2b40] focus:border-accent-blue focus:outline-none text-xs text-gray-200 rounded-lg pl-9 pr-8 py-2.5 transition duration-200"
          :placeholder="t('search.placeholder')"
        >
        <!-- Search Glass Icon -->
        <svg class="absolute left-3 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <!-- Clear Text Button -->
        <button 
          v-if="query" 
          @click="clearQuery" 
          class="absolute right-3 w-4 h-4 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition duration-200"
        >
          <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Match Info Status -->
      <div class="flex items-center justify-between mb-3 text-xs">
        <span class="text-gray-500">{{ t('search.results_header') }}</span>
        <span class="px-2 py-0.5 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-[10px] font-bold">
          {{ t('search.results_count', results.length) }}
        </span>
      </div>

      <!-- Result Cards Container -->
      <div class="overflow-y-auto max-h-[300px] pr-1 space-y-3">
        <!-- Input Empty State -->
        <div v-if="!query" class="text-center py-8 text-xs text-gray-600">
          {{ t('search.please_input') }}
        </div>

        <!-- Searching State -->
        <div v-else-if="isLoading" class="text-center py-8 text-xs text-gray-500 flex flex-col items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-accent-blue" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ t('search.loading') }}
        </div>

        <!-- Safe Output Card -->
        <div v-else-if="query && results.length === 0" class="bg-[#152a2d] border border-[#1d4d42] rounded-xl p-3 shadow">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] text-success font-bold tracking-wide uppercase">{{ t('search.result_safe_title') }}</span>
            <span class="px-1.5 py-0.5 bg-success/20 text-success rounded text-[8px] font-bold uppercase">{{ t('search.result_safe_badge') }}</span>
          </div>
          <p class="text-xs text-gray-300 font-medium leading-relaxed">{{ t('search.result_safe_desc') }}</p>
          <div class="text-[9px] text-gray-500 mt-2 font-mono italic">
            {{ t('search.result_query') }} "{{ query }}"
          </div>
        </div>

        <!-- Scam Matches List -->
        <div v-else-if="results.length > 0" class="space-y-2.5">
          <div v-for="(item, idx) in results" :key="idx" class="bg-[#3b1322] border border-[#5a1b32] rounded-xl p-3 shadow">
            <div class="flex items-center justify-between border-b border-[#5a1b32] pb-2 mb-2">
              <span class="text-[10px] text-danger font-bold uppercase tracking-wider">{{ item.type }}</span>
              <span class="px-1.5 py-0.5 bg-danger/20 text-danger rounded text-[8px] font-bold uppercase">{{ t('search.result_scam_badge') }}</span>
            </div>
            <div class="flex flex-col gap-1 mb-2">
              <span class="text-[9px] text-gray-500 uppercase tracking-wide">{{ t('search.result_scam_label') }}</span>
              <span class="text-xs font-semibold text-gray-200 break-all">{{ item.value }}</span>
            </div>
            <div class="bg-[#2c131d] border border-[#5a1b32]/50 text-xs text-gray-300 rounded px-2.5 py-1.5 leading-relaxed">
              <strong class="text-danger font-bold mr-1">{{ t('search.result_scam_reason') }}</strong>
              {{ item.reason }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Action button -->
    <div class="pt-3 border-t border-[#2b2b40]/50 mt-4">
      <button 
        @click="openSearchPage" 
        class="w-full bg-[#2a2a3f] hover:bg-[#32324e] text-xs font-semibold text-gray-300 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1.5"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {{ t('search.open_page') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';
import { searchScammer } from '../utils/scamDb.js';

export default {
  name: 'SearchTab',
  setup() {
    const { t } = useI18n();
    const query = ref('');
    const isLoading = ref(false);
    const isFocused = ref(false);
    const results = ref([]);
    
    let debounceTimeout = null;

    const performSearch = () => {
      const text = query.value.trim();
      if (!text) {
        results.value = [];
        isLoading.value = false;
        return;
      }

      isLoading.value = true;
      // Fast simulation of local lookups
      setTimeout(() => {
        results.value = searchScammer(text, t);
        isLoading.value = false;
      }, 150);
    };

    watch(query, () => {
      clearTimeout(debounceTimeout);
      if (!query.value.trim()) {
        results.value = [];
        isLoading.value = false;
        return;
      }
      debounceTimeout = setTimeout(performSearch, 150);
    });

    const triggerSearch = () => {
      clearTimeout(debounceTimeout);
      performSearch();
    };

    const clearQuery = () => {
      query.value = '';
      results.value = [];
      isLoading.value = false;
    };

    const openSearchPage = () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/popup.html') });
    };

    onUnmounted(() => {
      clearTimeout(debounceTimeout);
    });

    return {
      t,
      query,
      isLoading,
      isFocused,
      results,
      clearQuery,
      triggerSearch,
      openSearchPage
    };
  }
};
</script>
