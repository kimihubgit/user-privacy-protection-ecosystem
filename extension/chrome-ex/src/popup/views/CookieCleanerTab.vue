<template>
  <div class="cleaner-panel-wrapper">
    <!-- Top Master Switch & Status Bar -->
    <div class="card master-card">
      <div class="master-info">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="master-title">{{ t('cookiecleaner.master_enable') || 'Kích hoạt Vệ sĩ Auto-Delete' }}</span>
          <span class="badge" :class="settings.enabled ? 'badge-light-teal' : 'badge-light-danger'">
            {{ settings.enabled ? 'ACTIVE' : 'OFF' }}
          </span>
        </div>
        <span class="master-desc">{{ t('cookiecleaner.master_desc') || 'Tự động dọn dẹp cookie nền bảo vệ quyền riêng tư người dùng.' }}</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="stat-badge-pill" title="Tổng số cookie đã tự động xóa">
          ⚡ <strong>{{ totalDeletedCount }}</strong> {{ t('cookiecleaner.deleted_count') || 'đã xóa' }}
        </span>
        <label class="switch">
          <input type="checkbox" v-model="settings.enabled" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <!-- Segmented Navigation Pills -->
    <div class="segmented-nav">
      <button 
        v-for="seg in ['rules', 'whitelist', 'logs']" 
        :key="seg"
        :class="['seg-btn', { active: activeSubTab === seg }]"
        @click="activeSubTab = seg"
      >
        <span v-if="seg === 'rules'">⚡ {{ t('cookiecleaner.tab_config') || 'Cấu hình' }}</span>
        <span v-else-if="seg === 'whitelist'">🛡️ {{ t('cookiecleaner.tab_whitelist') || 'Danh sách Ngoại lệ' }} ({{ whitelist.length }})</span>
        <span v-else>📋 {{ t('cookiecleaner.tab_logs') || 'Nhật ký' }}</span>
      </button>
    </div>

    <!-- Section 1: Auto-Delete Rules & Actions -->
    <div v-show="activeSubTab === 'rules'" class="cleaner-section">
      <!-- Quick Action Buttons -->
      <div class="action-buttons-row">
        <button @click="cleanCurrentSite" class="cleaner-action-btn primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>{{ t('cookiecleaner.btn_clean_current') || 'Xóa Cookie trang hiện tại' }}</span>
        </button>

        <button @click="cleanAllNonWhitelisted" class="cleaner-action-btn danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>{{ t('cookiecleaner.btn_clean_all') || 'Xóa tất cả ngoại trừ Whitelist' }}</span>
        </button>
      </div>

      <!-- Group 1: Trình dọn dẹp theo hành vi -->
      <div class="group-header">{{ t('cookiecleaner.group_behavior') || 'QUY TẮC DỌN DẸP THEO HÀNH VI' }}</div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.tab_close_title') || 'Xóa Cookie khi đóng Tab' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.tab_close_desc') || 'Tự động dọn dẹp toàn bộ cookie của website ngay khi tắt tab cuối cùng.' }}</span>
          
          <div v-if="settings.deleteOnTabClose" class="inline-setting-row">
            <span class="inline-label">{{ t('cookiecleaner.delay_label') || 'Độ trễ khi xóa:' }}</span>
            <select v-model="settings.cleanDelaySeconds" @change="saveSettings" class="cleaner-select">
              <option :value="0">{{ t('cookiecleaner.delay_instant') || 'Ngay lập tức (0s)' }}</option>
              <option :value="5">5 {{ t('cookiecleaner.seconds') || 'giây' }}</option>
              <option :value="10">10 {{ t('cookiecleaner.seconds') || 'giây' }}</option>
              <option :value="30">30 {{ t('cookiecleaner.seconds') || 'giây' }}</option>
              <option :value="60">60 {{ t('cookiecleaner.seconds') || 'giây' }}</option>
            </select>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.deleteOnTabClose" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.domain_change_title') || 'Xóa Cookie khi đổi Trang (Domain Change)' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.domain_change_desc') || 'Xóa cookie của trang web cũ khi bạn điều hướng sang website khác.' }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.deleteOnDomainChange" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.keep_session_title') || 'Bảo vệ Cookie phiên làm việc (Session Cookies)' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.keep_session_desc') || 'Chỉ xóa persistent cookie dài hạn và giữ lại cookie phiên để tránh mất đăng nhập tạm thời.' }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.keepSessionCookies" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>

      <!-- Group 2: Dọn dẹp định kỳ & Khởi động -->
      <div class="group-header">{{ t('cookiecleaner.group_schedule') || 'LÊN LỊCH & LÃO HÓA COOKIE' }}</div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.aging_title') || 'Lão hóa Cookie (Cookie Aging)' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.aging_desc') || 'Tự động hủy bỏ các cookie tồn tại lâu hơn số giờ quy định.' }}</span>
          
          <div v-if="settings.enableCookieAging" class="inline-setting-row">
            <span class="inline-label">{{ t('cookiecleaner.max_age_label') || 'Thời gian sống tối đa:' }}</span>
            <input type="number" v-model.number="settings.cookieMaxAgeHours" @change="saveSettings" min="1" max="720" class="cleaner-input-num" />
            <span class="inline-unit">{{ t('cookiecleaner.hours') || 'giờ' }}</span>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.enableCookieAging" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.scheduled_title') || 'Dọn dẹp theo định kỳ' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.scheduled_desc') || 'Tự động chạy quy trình dọn dẹp cookie nền theo thời gian cài đặt.' }}</span>
          
          <div v-if="settings.enableScheduledCleanup" class="inline-setting-row">
            <span class="inline-label">{{ t('cookiecleaner.interval_label') || 'Chu kỳ lặp lại:' }}</span>
            <select v-model="settings.scheduledCleanupInterval" @change="saveSettings" class="cleaner-select">
              <option :value="15">15 {{ t('cookiecleaner.minutes') || 'phút' }}</option>
              <option :value="30">30 {{ t('cookiecleaner.minutes') || 'phút' }}</option>
              <option :value="60">1 {{ t('cookiecleaner.hour') || 'giờ' }}</option>
              <option :value="120">2 {{ t('cookiecleaner.hours') || 'giờ' }}</option>
            </select>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.enableScheduledCleanup" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="card rule-card">
        <div class="rule-info">
          <span class="card-title">{{ t('cookiecleaner.startup_title') || 'Xóa Cookie khi mở trình duyệt' }}</span>
          <span class="card-desc">{{ t('cookiecleaner.startup_desc') || 'Xóa sạch tất cả cookie rác ngay khi vừa khởi động trình duyệt.' }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.deleteOnStartup" @change="saveSettings">
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <!-- Section 2: Whitelist & Greylist Management -->
    <div v-show="activeSubTab === 'whitelist'" class="cleaner-section">
      <!-- Form thêm Domain ngoại lệ -->
      <div class="card add-domain-card">
        <div class="card-title" style="margin-bottom: 6px;">{{ t('cookiecleaner.add_domain_title') || 'Thêm Domain Ngoại Lệ' }}</div>
        <div class="add-domain-row">
          <input 
            type="text" 
            v-model="newDomainInput" 
            :placeholder="t('cookiecleaner.domain_placeholder') || 'Ví dụ: facebook.com, google.com'"
            class="form-control domain-input"
            @keyup.enter="addDomain"
          />
          <select v-model="newDomainType" class="cleaner-select type-select">
            <option value="whitelist">Whitelist</option>
            <option value="greylist">Greylist</option>
          </select>
          <button @click="addDomain" class="btn-add-domain">
            + {{ t('cookiecleaner.btn_add') || 'Thêm' }}
          </button>
        </div>
        <div class="checkbox-row">
          <input type="checkbox" id="chk-subdomain" v-model="newIncludeSubdomains" />
          <label for="chk-subdomain">{{ t('cookiecleaner.include_subdomains') || 'Bao gồm tất cả domain con (Subdomains)' }}</label>
        </div>
      </div>

      <!-- Danh sách Whitelist -->
      <div class="card list-box-card">
        <div class="list-box-header">
          <span class="list-title primary-color">🛡️ Whitelist ({{ whitelist.length }})</span>
          <span class="list-desc">{{ t('cookiecleaner.whitelist_desc') || 'Không bao giờ xóa cookie' }}</span>
        </div>

        <div v-if="whitelist.length === 0" class="empty-list-notice">
          {{ t('cookiecleaner.empty_whitelist') || 'Chưa có domain nào trong Whitelist.' }}
        </div>

        <div v-else class="domain-items-container">
          <div v-for="(item, idx) in whitelist" :key="idx" class="domain-item-row">
            <div class="domain-info-left">
              <span class="dot-indicator blue"></span>
              <span class="domain-text">{{ item.domain }}</span>
              <span v-if="item.includeSubdomains" class="subdomain-tag">+SUBDOMAINS</span>
            </div>
            <button @click="removeDomain('whitelist', item.domain)" class="btn-remove-domain" title="Xóa domain">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Danh sách Greylist -->
      <div class="card list-box-card">
        <div class="list-box-header">
          <span class="list-title warning-color">⏳ Greylist ({{ greylist.length }})</span>
          <span class="list-desc">{{ t('cookiecleaner.greylist_desc') || 'Bảo vệ tạm thời trong phiên' }}</span>
        </div>

        <div v-if="greylist.length === 0" class="empty-list-notice">
          {{ t('cookiecleaner.empty_greylist') || 'Chưa có domain nào trong Greylist.' }}
        </div>

        <div v-else class="domain-items-container">
          <div v-for="(item, idx) in greylist" :key="idx" class="domain-item-row">
            <div class="domain-info-left">
              <span class="dot-indicator yellow"></span>
              <span class="domain-text">{{ item.domain }}</span>
              <span v-if="item.includeSubdomains" class="subdomain-tag">+SUBDOMAINS</span>
            </div>
            <button @click="removeDomain('greylist', item.domain)" class="btn-remove-domain" title="Xóa domain">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Deletion Logs -->
    <div v-show="activeSubTab === 'logs'" class="cleaner-section">
      <div class="logs-header-row">
        <span class="logs-title">📋 {{ t('cookiecleaner.logs_title') || 'Nhật Ký Auto-Delete Mới Nhất' }}</span>
        <button v-if="deletionLogs.length > 0" @click="clearLogs" class="clear-btn">
          {{ t('cookiecleaner.btn_clear_logs') || 'Xóa nhật ký' }}
        </button>
      </div>

      <div v-if="deletionLogs.length === 0" class="card empty-logs-card">
        {{ t('cookiecleaner.no_logs') || 'Chưa ghi nhận hoạt động tự động xóa cookie nào.' }}
      </div>

      <div v-else class="logs-container">
        <div v-for="(log, idx) in deletionLogs" :key="idx" class="card log-item-card">
          <div class="log-info-left">
            <div class="log-domain-row">
              <span class="log-domain-text">{{ log.domain }}</span>
              <span class="cookie-flag-badge" :class="getReasonBadgeClass(log.reason)">
                {{ formatReason(log.reason) }}
              </span>
            </div>
            <span class="log-cookie-name">Cookie: {{ log.cookieName }}</span>
          </div>

          <span class="log-time-text">{{ formatLogTime(log.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'CookieCleanerTab',
  setup() {
    const { t } = useI18n();
    const activeSubTab = ref('rules');

    const totalDeletedCount = ref(0);
    const settings = ref({
      enabled: false,
      deleteOnTabClose: false,
      cleanDelaySeconds: 0,
      deleteOnDomainChange: false,
      keepSessionCookies: false,
      enableCookieAging: false,
      cookieMaxAgeHours: 24,
      enableScheduledCleanup: false,
      scheduledCleanupInterval: 60,
      deleteOnStartup: false
    });

    const whitelist = ref([]);
    const greylist = ref([]);
    const deletionLogs = ref([]);

    const newDomainInput = ref('');
    const newDomainType = ref('whitelist');
    const newIncludeSubdomains = ref(true);

    const loadData = () => {
      chrome.storage.local.get([
        'cad_enabled',
        'cad_deleteOnTabClose',
        'cad_cleanDelaySeconds',
        'cad_deleteOnDomainChange',
        'cad_keepSessionCookies',
        'cad_enableCookieAging',
        'cad_cookieMaxAgeHours',
        'cad_enableScheduledCleanup',
        'cad_scheduledCleanupInterval',
        'cad_deleteOnStartup',
        'cad_whitelist',
        'cad_greylist',
        'cad_deletionLogs',
        'cad_totalDeletedCount'
      ], (res) => {
        settings.value.enabled = res.cad_enabled === true;
        settings.value.deleteOnTabClose = res.cad_deleteOnTabClose === true;
        settings.value.cleanDelaySeconds = res.cad_cleanDelaySeconds || 0;
        settings.value.deleteOnDomainChange = res.cad_deleteOnDomainChange === true;
        settings.value.keepSessionCookies = res.cad_keepSessionCookies === true;
        settings.value.enableCookieAging = res.cad_enableCookieAging === true;
        settings.value.cookieMaxAgeHours = res.cad_cookieMaxAgeHours || 24;
        settings.value.enableScheduledCleanup = res.cad_enableScheduledCleanup === true;
        settings.value.scheduledCleanupInterval = res.cad_scheduledCleanupInterval || 60;
        settings.value.deleteOnStartup = res.cad_deleteOnStartup === true;

        whitelist.value = res.cad_whitelist || [];
        greylist.value = res.cad_greylist || [];
        deletionLogs.value = res.cad_deletionLogs || [];
        totalDeletedCount.value = res.cad_totalDeletedCount || 0;
      });
    };

    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes.cad_enabled) {
        settings.value.enabled = changes.cad_enabled.newValue === true;
      }
    };

    onMounted(() => {
      loadData();
      chrome.storage.onChanged.addListener(handleStorageChange);
    });

    onUnmounted(() => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    });

    const saveSettings = () => {
      chrome.storage.local.set({
        cad_enabled: settings.value.enabled,
        cad_deleteOnTabClose: settings.value.deleteOnTabClose,
        cad_cleanDelaySeconds: settings.value.cleanDelaySeconds,
        cad_deleteOnDomainChange: settings.value.deleteOnDomainChange,
        cad_keepSessionCookies: settings.value.keepSessionCookies,
        cad_enableCookieAging: settings.value.enableCookieAging,
        cad_cookieMaxAgeHours: settings.value.cookieMaxAgeHours,
        cad_enableScheduledCleanup: settings.value.enableScheduledCleanup,
        cad_scheduledCleanupInterval: settings.value.scheduledCleanupInterval,
        cad_deleteOnStartup: settings.value.deleteOnStartup
      }, () => {
        chrome.runtime.sendMessage({ action: 'cad_setupAlarms' });
        showToast(t('cookiecleaner.toast_saved') || 'Đã lưu cài đặt!');
      });
    };

    const addDomain = () => {
      if (!newDomainInput.value.trim()) return;
      let domain = newDomainInput.value.trim().toLowerCase();
      domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

      const newEntry = {
        domain: domain,
        includeSubdomains: newIncludeSubdomains.value
      };

      if (newDomainType.value === 'whitelist') {
        const exists = whitelist.value.some(item => item.domain === domain);
        if (!exists) {
          whitelist.value.push(newEntry);
          chrome.storage.local.set({ cad_whitelist: JSON.parse(JSON.stringify(whitelist.value)) });
        }
      } else {
        const exists = greylist.value.some(item => item.domain === domain);
        if (!exists) {
          greylist.value.push(newEntry);
          chrome.storage.local.set({ cad_greylist: JSON.parse(JSON.stringify(greylist.value)) });
        }
      }

      newDomainInput.value = '';
      showToast(t('cookiecleaner.toast_domain_added') || 'Đã thêm domain!');
    };

    const removeDomain = (type, domainStr) => {
      if (type === 'whitelist') {
        whitelist.value = whitelist.value.filter(item => item.domain !== domainStr);
        chrome.storage.local.set({ cad_whitelist: JSON.parse(JSON.stringify(whitelist.value)) });
      } else {
        greylist.value = greylist.value.filter(item => item.domain !== domainStr);
        chrome.storage.local.set({ cad_greylist: JSON.parse(JSON.stringify(greylist.value)) });
      }
      showToast(t('cookiecleaner.toast_domain_removed') || 'Đã xóa domain!');
    };

    const cleanCurrentSite = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0] || !tabs[0].url) return;
        try {
          const urlObj = new URL(tabs[0].url);
          const domain = urlObj.hostname.toLowerCase();

          chrome.runtime.sendMessage({ action: 'cad_cleanCurrentSite', domain }, (res) => {
            if (res && res.success) {
              const count = res.count || 0;
              showToast(`Đã xóa ${count} cookie cho ${domain}`);
              loadData();
            }
          });
        } catch {
          showToast('Không thể xác định domain của trang hiện tại');
        }
      });
    };

    const cleanAllNonWhitelisted = () => {
      chrome.runtime.sendMessage({ action: 'cad_cleanAllNonWhitelisted' }, (res) => {
        if (res && res.success) {
          const count = res.count || 0;
          showToast(`Đã xóa sạch ${count} cookie rác!`);
          loadData();
        }
      });
    };

    const clearLogs = () => {
      deletionLogs.value = [];
      chrome.storage.local.set({ cad_deletionLogs: [] });
      showToast('Đã xóa lịch sử nhật ký!');
    };

    const getReasonBadgeClass = (reason) => {
      if (reason === 'tab_close') return 'http';
      if (reason === 'domain_change') return 'session';
      if (reason === 'cookie_aging') return 'expiry';
      return 'host';
    };

    const formatReason = (reason) => {
      if (reason === 'tab_close') return 'Tắt tab';
      if (reason === 'domain_change') return 'Đổi trang';
      if (reason === 'cookie_aging') return 'Lão hóa';
      if (reason === 'scheduled_cleanup') return 'Định kỳ';
      return 'Thủ công';
    };

    const formatLogTime = (ts) => {
      if (!ts) return '';
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
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
      activeSubTab,
      totalDeletedCount,
      settings,
      whitelist,
      greylist,
      deletionLogs,
      newDomainInput,
      newDomainType,
      newIncludeSubdomains,
      saveSettings,
      addDomain,
      removeDomain,
      cleanCurrentSite,
      cleanAllNonWhitelisted,
      clearLogs,
      getReasonBadgeClass,
      formatReason,
      formatLogTime
    };
  }
};
</script>

<style scoped>
.cleaner-panel-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
}

/* Master Card Header */
.master-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(0, 158, 247, 0.08) 0%, rgba(137, 80, 252, 0.05) 100%);
  border: 1px solid rgba(0, 158, 247, 0.2);
}

.master-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.master-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-title);
}

.master-desc {
  font-size: 10.5px;
  color: var(--text-desc);
}

.stat-badge-pill {
  font-size: 10px;
  font-weight: 600;
  color: var(--primary-blue);
  background-color: var(--primary-light);
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 158, 247, 0.2);
}

/* Segmented Navigation Pills */
.segmented-nav {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

body.light-theme .segmented-nav {
  background: #eff2f5;
}

.seg-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.seg-btn:hover {
  color: var(--text-title);
}

.seg-btn.active {
  background: var(--bg-card);
  color: var(--primary-blue);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

body.light-theme .seg-btn.active {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Section Wrapper */
.cleaner-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Quick Action Buttons */
.action-buttons-row {
  display: flex;
  gap: 8px;
}

.cleaner-action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.cleaner-action-btn.primary {
  background-color: var(--primary-light);
  color: var(--primary-blue);
  border-color: rgba(0, 158, 247, 0.25);
}

.cleaner-action-btn.primary:hover {
  background-color: var(--primary-blue);
  color: #ffffff;
}

.cleaner-action-btn.danger {
  background-color: var(--danger-light);
  color: var(--danger);
  border-color: rgba(241, 65, 108, 0.25);
}

.cleaner-action-btn.danger:hover {
  background-color: var(--danger);
  color: #ffffff;
}

/* Group Headers */
.group-header {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin: 6px 0 2px 0;
}

/* Rule Cards */
.rule-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}

.rule-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  padding-right: 12px;
}

.inline-setting-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.inline-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 600;
}

.inline-unit {
  font-size: 10px;
  color: var(--text-muted);
}

.cleaner-select {
  height: 24px;
  background-color: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-input);
  outline: none;
  padding: 0 4px;
}

.cleaner-input-num {
  width: 44px;
  height: 24px;
  background-color: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-input);
  outline: none;
  padding: 0 4px;
  text-align: center;
}

/* Whitelist Add Card */
.add-domain-card {
  padding: 10px 12px;
}

.add-domain-row {
  display: flex;
  gap: 6px;
}

.domain-input {
  flex: 1;
  height: 30px;
  font-size: 11px;
}

.type-select {
  height: 30px;
}

.btn-add-domain {
  height: 30px;
  padding: 0 14px;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-add-domain:hover {
  opacity: 0.9;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.checkbox-row label {
  font-size: 10px;
  color: var(--text-desc);
  cursor: pointer;
}

/* List Box Card */
.list-box-card {
  padding: 10px 12px;
}

.list-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.list-title {
  font-size: 11px;
  font-weight: 700;
}

.list-title.primary-color { color: var(--primary-blue); }
.list-title.warning-color { color: var(--warning); }

.list-desc {
  font-size: 9.5px;
  color: var(--text-muted);
}

.empty-list-notice {
  font-size: 10.5px;
  color: var(--text-muted);
  text-align: center;
  padding: 8px 0;
}

.domain-items-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 130px;
  overflow-y: auto;
}

.domain-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

body.light-theme .domain-item-row {
  background-color: #f8fafc;
}

.domain-info-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-indicator.blue { background-color: var(--primary-blue); }
.dot-indicator.yellow { background-color: var(--warning); }

.domain-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-title);
}

.subdomain-tag {
  font-size: 7.5px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--primary-light);
  color: var(--primary-blue);
}

.btn-remove-domain {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove-domain:hover {
  color: var(--danger);
  background: var(--danger-light);
}

/* Logs Section */
.logs-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-title);
}

.empty-logs-card {
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 11px;
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.log-item-card {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-info-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-domain-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-domain-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-title);
}

.log-cookie-name {
  font-size: 9.5px;
  color: var(--text-muted);
  font-family: monospace;
}

.log-time-text {
  font-size: 9px;
  color: var(--text-desc);
}
</style>
