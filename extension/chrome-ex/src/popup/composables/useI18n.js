import { ref, reactive, provide, inject } from 'vue';

export const I18nSymbol = Symbol('i18n');

export function useI18nProvider() {
  const currentLang = ref('vi');
  const translations = reactive({});
  const isLoaded = ref(false);

  async function loadLanguageData(lang) {
    if (translations[lang]) return;
    try {
      const url = chrome.runtime.getURL(`src/_locales/${lang}.json`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      translations[lang] = await response.json();
    } catch (e) {
      console.error(`[I18n] Error loading language ${lang}:`, e);
      translations[lang] = {};
    }
  }

  async function setLanguage(lang) {
    currentLang.value = lang;
    await loadLanguageData(lang);
    chrome.storage.local.set({ language: lang });
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }

  function t(key, ...args) {
    let text = (translations[currentLang.value] && translations[currentLang.value][key]) || key;
    if (args.length > 0) {
      args.forEach(arg => {
        text = text.toString().replace('%s', arg);
      });
    }
    return text;
  }

  // Initial load
  chrome.storage.local.get(['language'], async (res) => {
    const lang = res.language || 'vi';
    await setLanguage(lang);
    isLoaded.value = true;
  });

  const i18n = {
    currentLang,
    t,
    setLanguage,
    isLoaded
  };

  provide(I18nSymbol, i18n);
  return i18n;
}

export function useI18n() {
  const i18n = inject(I18nSymbol);
  if (!i18n) {
    // Fallback if not provided (e.g. testing)
    return {
      currentLang: ref('vi'),
      t: (key) => key,
      setLanguage: async () => {},
      isLoaded: ref(true)
    };
  }
  return i18n;
}
