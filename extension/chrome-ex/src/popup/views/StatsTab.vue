<template>
  <div class="stats-tab-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
      <div>
        <h2 class="title" style="margin: 0;">{{ t('stats.title') || 'Thống Kê Hoạt Động' }}</h2>
        <p class="subtitle" style="margin: 2px 0 0 0;">{{ t('stats.subtitle') || 'Theo dõi thời gian sử dụng mạng xã hội và hoạt động của lá chắn bảo mật.' }}</p>
      </div>
      <button v-if="sortedTopSites.length > 0" @click="clearHistory" class="clear-btn" :title="t('stats.btn_clear') || 'Xóa lịch sử'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="margin-right: 4px;">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        {{ t('stats.btn_clear') || 'Xóa lịch sử' }}
      </button>
    </div>

    <!-- Main scrollable layout -->
    <div class="stats-scroll-area">
      <!-- Section 1: Facebook Screen Time Widget -->
      <div class="card fb-time-widget">
        <div class="fb-time-left">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div class="fb-icon-bg">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span style="font-weight: 700; font-size: 13px; color: var(--text-title);">{{ t('stats.fb_screentime') || 'Thời gian lướt Facebook hôm nay' }}</span>
          </div>
          <div class="time-formatted">{{ formatTime(fbSeconds) }}</div>
          <div style="font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-top: 4px;">
            <span class="pulse-dot" :class="{ inactive: fbSeconds === 0 }"></span>
            <span>{{ fbSeconds > 0 ? (t('stats.fb_limit') || 'Khuyên dùng dưới 60 phút') : (t('stats.fb_no_data') || 'Không có dữ liệu hôm nay') }}</span>
          </div>
        </div>

        <div class="fb-time-right">
          <!-- Circular progress ring -->
          <div class="progress-ring-container">
            <svg class="progress-ring" viewBox="0 0 100 100">
              <circle class="progress-ring-bg" cx="50" cy="50" r="42" stroke-width="8" fill="none" />
              <circle 
                class="progress-ring-bar" 
                cx="50" 
                cy="50" 
                r="42" 
                stroke-width="8" 
                fill="none" 
                :stroke-dasharray="263.89" 
                :stroke-dashoffset="ringOffset"
                :stroke="ringColor"
              />
            </svg>
            <div class="progress-percentage">{{ Math.min(Math.round((fbSeconds / 3600) * 100), 100) }}%</div>
          </div>
        </div>
      </div>

      <!-- Section: Visual Bar Chart (Ads, Trackers, Phishing) -->
      <div class="card chart-card">
        <h3 class="chart-title">{{ t('stats.chart_title') || 'BIỂU ĐỒ HOẠT ĐỘNG BẢO VỆ' }}</h3>
        
        <div class="bar-chart-container">
          <div 
            v-for="(bar, idx) in chartData" 
            :key="idx" 
            class="chart-bar-col"
          >
            <div class="chart-bar-wrapper">
              <!-- Tooltip on hover -->
              <div class="chart-tooltip">
                <span class="tooltip-value">{{ bar.value }}</span>
                <span class="tooltip-label">{{ bar.label }}</span>
              </div>
              
              <!-- Color column -->
              <div 
                class="chart-bar-fill"
                :style="{ 
                  height: `${bar.percentage}%`,
                  background: bar.gradient
                }"
              ></div>
            </div>
            
            <!-- Label below the bar -->
            <div class="chart-bar-label-group">
              <span class="chart-bar-icon" :style="{ color: bar.color }" v-html="bar.icon"></span>
              <span class="chart-bar-text-abbr">{{ bar.abbr }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Shield Statistics Grid -->
      <div class="stats-grid">
        <!-- Card 1: Ads Blocked -->
        <div class="card stat-item-card">
          <div class="stat-icon-wrapper ad-color">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-val">{{ stats.adsBlocked }}</span>
            <span class="stat-lbl">{{ t('stats.ads_blocked') || 'Quảng cáo đã chặn' }}</span>
          </div>
        </div>

        <!-- Card 2: Trackers Blocked -->
        <div class="card stat-item-card">
          <div class="stat-icon-wrapper tracker-color">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <circle cx="12" cy="11" r="3" stroke-linecap="round" stroke-linejoin="round"></circle>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-val">{{ stats.trackersBlocked }}</span>
            <span class="stat-lbl">{{ t('stats.trackers_blocked') || 'Trackers đã chặn' }}</span>
          </div>
        </div>

        <!-- Card 3: Scam checked -->
        <div class="card stat-item-card">
          <div class="stat-icon-wrapper checked-color">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8"></path>
              <path d="M12 8v8"></path>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-val">{{ stats.scamChecked }}</span>
            <span class="stat-lbl">{{ t('stats.scam_checked') || 'Websites đã kiểm tra' }}</span>
          </div>
        </div>

        <!-- Card 4: Scam blocked -->
        <div class="card stat-item-card">
          <div class="stat-icon-wrapper blocked-color" :class="{ 'warning-pulse': stats.scamBlocked > 0 }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-val">{{ stats.scamBlocked }}</span>
            <span class="stat-lbl">{{ t('stats.scam_blocked') || 'Web độc hại đã chặn' }}</span>
          </div>
        </div>
      </div>

      <!-- Section 3: Top Visited Sites (Biểu đồ cột đứng với favicon của Website) -->
      <div class="card chart-card">
        <div class="chart-header-row">
          <h3 class="chart-title">{{ t('stats.top_visited_title') || 'CÁC TRANG TRUY CẬP NHIỀU NHẤT' }}</h3>
          <span class="badge badge-light-blue" style="font-size: 8px; font-weight: 700; padding: 2px 5px;">Top {{ sortedTopSites.length }}</span>
        </div>
        
        <div class="bar-chart-container">
          <div v-if="sortedTopSites.length === 0" class="empty-state" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px 0;">
            {{ t('stats.history_empty') || 'Chưa ghi nhận lịch sử duyệt web.' }}
          </div>
          <div 
            v-else
            v-for="(site, idx) in sortedTopSites" 
            :key="idx" 
            class="chart-bar-col"
          >
            <div class="chart-bar-wrapper">
              <!-- Tooltip on hover -->
              <div class="chart-tooltip">
                <span class="tooltip-value">{{ site.count }} {{ t('stats.visits_count') || 'lần' }}</span>
                <span class="tooltip-label" style="text-transform: none; font-size: 8px;">{{ site.domain }}</span>
              </div>
              
              <!-- Color column proportional to visit counts -->
              <div 
                class="chart-bar-fill"
                :style="{ 
                  height: `${(site.count / maxVisitCount) * 100}%`,
                  background: getStatusBarGradient(site.status)
                }"
              ></div>
            </div>
            
            <!-- Favicon below the bar -->
            <div class="chart-bar-label-group">
              <img 
                :src="`https://www.google.com/s2/favicons?sz=32&domain=${site.domain}`"
                @error="handleFaviconError"
                class="site-favicon-img"
                :title="site.domain"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'StatsTab',
  setup() {
    const { t } = useI18n();

    // Stats variables
    const fbSeconds = ref(0);
    const stats = ref({
      adsBlocked: 0,
      trackersBlocked: 0,
      scamChecked: 0,
      scamBlocked: 0
    });
    const topSitesData = ref({});

    const loadStats = () => {
      // 1. Get Facebook timer
      const todayStr = getTodayString();
      chrome.storage.local.get([
        'fb_timer_second', 
        'fb_timer_date',
        'stats_total_ads_blocked',
        'stats_total_trackers_blocked',
        'stats_total_scam_checked',
        'stats_total_scam_blocked',
        'topVisitedSites'
      ], (res) => {
        if (res.fb_timer_date === todayStr) {
          fbSeconds.value = parseInt(res.fb_timer_second || '0');
        } else {
          fbSeconds.value = 0;
        }

        // 2. Fetch shield accumulators
        stats.value.adsBlocked = res.stats_total_ads_blocked || 0;
        stats.value.trackersBlocked = res.stats_total_trackers_blocked || 0;
        stats.value.scamChecked = res.stats_total_scam_checked || 0;
        stats.value.scamBlocked = res.stats_total_scam_blocked || 0;

        // 3. Fetch top sites
        topSitesData.value = res.topVisitedSites || {};
      });
    };

    onMounted(() => {
      loadStats();

      // Listen for local storage modifications to update values in real time
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
          loadStats();
        }
      });
    });

    // Computeds for Top Sites
    const sortedTopSites = computed(() => {
      const list = Object.keys(topSitesData.value).map(domain => ({
        domain,
        count: topSitesData.value[domain].count || 0,
        status: topSitesData.value[domain].status || 'safe'
      }));
      // Sắp xếp giảm dần theo lượt truy cập và lấy Top 5
      return list.sort((a, b) => b.count - a.count).slice(0, 5);
    });

    const maxVisitCount = computed(() => {
      if (sortedTopSites.value.length === 0) return 1;
      return Math.max(...sortedTopSites.value.map(s => s.count), 1);
    });

    // Computed for Bar Chart (Ads, Trackers, etc.)
    const chartData = computed(() => {
      const maxVal = Math.max(
        stats.value.adsBlocked,
        stats.value.trackersBlocked,
        stats.value.scamChecked,
        stats.value.scamBlocked,
        1 // Tránh chia cho 0
      );

      return [
        {
          label: t('stats.ads_blocked') || 'Quảng cáo đã chặn',
          abbr: t('stats.chart_ads') || 'Quảng cáo',
          value: stats.value.adsBlocked,
          percentage: (stats.value.adsBlocked / maxVal) * 100,
          color: 'var(--warning)',
          gradient: 'linear-gradient(to top, rgba(241, 188, 25, 0.15), var(--warning))',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`
        },
        {
          label: t('stats.trackers_blocked') || 'Trackers đã chặn',
          abbr: 'Trackers',
          value: stats.value.trackersBlocked,
          percentage: (stats.value.trackersBlocked / maxVal) * 100,
          color: 'var(--primary-blue)',
          gradient: 'linear-gradient(to top, rgba(62, 151, 255, 0.15), var(--primary-blue))',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        },
        {
          label: t('stats.scam_checked') || 'Websites đã kiểm tra',
          abbr: 'Kiểm tra',
          value: stats.value.scamChecked,
          percentage: (stats.value.scamChecked / maxVal) * 100,
          color: 'var(--accent-teal)',
          gradient: 'linear-gradient(to top, rgba(80, 205, 137, 0.15), var(--accent-teal))',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`
        },
        {
          label: t('stats.scam_blocked') || 'Web độc hại đã chặn',
          abbr: 'Độc hại',
          value: stats.value.scamBlocked,
          percentage: (stats.value.scamBlocked / maxVal) * 100,
          color: 'var(--danger)',
          gradient: 'linear-gradient(to top, rgba(241, 65, 108, 0.15), var(--danger))',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>`
        }
      ];
    });

    // Helper functions
    const getTodayString = () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}${mm}${dd}`;
    };

    const formatTime = (totalSec) => {
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
      }
      if (mins > 0) {
        return `${mins}m ${secs}s`;
      }
      return `${secs} giây`;
    };

    const getStatusBarGradient = (status) => {
      if (status === 'unsafe') return 'linear-gradient(to top, rgba(241, 65, 108, 0.15), var(--danger))';
      if (status === 'not_found') return 'linear-gradient(to top, rgba(241, 188, 25, 0.15), var(--warning))';
      return 'linear-gradient(to top, rgba(80, 205, 137, 0.15), var(--accent-teal))';
    };

    const handleFaviconError = (event) => {
      event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    };

    const clearHistory = () => {
      chrome.storage.local.set({ navHistory: [], topVisitedSites: {} }, () => {
        topSitesData.value = {};
        showToast(t('stats.toast_clear_success') || 'Đã xóa lịch sử thành công!');
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

    // Computeds for Progress ring
    const ringOffset = computed(() => {
      const percent = Math.min(fbSeconds.value / 3600, 1); // 1 hour is 100%
      return 263.89 - (percent * 263.89);
    });

    const ringColor = computed(() => {
      const minutes = fbSeconds.value / 60;
      if (minutes >= 60) return '#f1416c'; // red/danger
      if (minutes >= 45) return '#f1bc19'; // yellow/warning
      return '#3e97ff'; // blue/safe
    });

    return {
      t,
      fbSeconds,
      stats,
      sortedTopSites,
      maxVisitCount,
      chartData,
      ringOffset,
      ringColor,
      formatTime,
      getStatusBarGradient,
      handleFaviconError,
      clearHistory
    };
  }
};
</script>

<style scoped>
.stats-tab-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.stats-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-desc);
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  outline: none;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(241, 65, 108, 0.1);
  color: var(--danger);
  border-color: rgba(241, 65, 108, 0.2);
  transform: translateY(-1px);
}

.fb-time-widget {
  background: linear-gradient(135deg, rgba(24, 119, 242, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
  border: 1px solid rgba(24, 119, 242, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.fb-time-left {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.fb-icon-bg {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #1877f2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-formatted {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-title);
  line-height: 1.2;
  margin-top: 2px;
  letter-spacing: -0.5px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #50cd89;
  box-shadow: 0 0 8px #50cd89;
  animation: pulse-ring 1.5s infinite;
}

.pulse-dot.inactive {
  background-color: var(--text-muted);
  box-shadow: none;
  animation: none;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 10px 2px rgba(80, 205, 137, 0.4); }
  100% { transform: scale(0.9); opacity: 0.8; }
}

.progress-ring-container {
  position: relative;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
  width: 68px;
  height: 68px;
}

.progress-ring-bg {
  stroke: rgba(255, 255, 255, 0.05);
}

.progress-ring-bar {
  transition: stroke-dashoffset 0.35s;
}

.progress-percentage {
  position: absolute;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-title);
}

/* Visual Bar Chart Card */
.chart-card {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  text-align: left;
  flex-shrink: 0;
  box-sizing: border-box;
}

.chart-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-header-row .chart-title {
  margin: 0;
}

.chart-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
}

.bar-chart-container {
  display: flex;
  height: 110px;
  align-items: flex-end;
  justify-content: space-around;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 8px;
  margin-top: 4px;
  box-sizing: border-box;
}

.chart-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
  justify-content: flex-end;
  flex: 1;
}

.chart-bar-wrapper {
  position: relative;
  width: 22px;
  height: calc(100% - 22px);
  display: flex;
  align-items: flex-end;
  cursor: pointer;
}

.chart-bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.chart-bar-wrapper:hover .chart-bar-fill {
  filter: brightness(1.2);
}

/* Custom Tooltip */
.chart-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 5px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.chart-bar-wrapper:hover .chart-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

.chart-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: var(--bg-card) transparent transparent transparent;
}

.tooltip-value {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-title);
  line-height: 1.1;
}

.tooltip-label {
  font-size: 8px;
  color: var(--text-desc);
  font-weight: 600;
  margin-top: 1px;
}

.chart-bar-label-group {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 6px;
  justify-content: center;
}

.chart-bar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chart-bar-icon svg {
  display: block;
}

.chart-bar-text-abbr {
  font-size: 9px;
  color: var(--text-desc);
  font-weight: 700;
}

/* Favicon specific styles */
.site-favicon-img {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.5px;
  border: 1px solid var(--border-light);
  display: block;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex-shrink: 0;
}

.stat-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

.stat-item-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.stat-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ad-color {
  background-color: rgba(241, 188, 25, 0.1);
  color: var(--warning);
}

.tracker-color {
  background-color: rgba(62, 151, 255, 0.1);
  color: var(--primary-blue);
}

.checked-color {
  background-color: rgba(80, 205, 137, 0.1);
  color: var(--accent-teal);
}

.blocked-color {
  background-color: rgba(241, 65, 108, 0.1);
  color: var(--danger);
}

.warning-pulse {
  animation: danger-pulse 2s infinite;
}

@keyframes danger-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(241, 65, 108, 0.3); }
  50% { box-shadow: 0 0 8px 2px rgba(241, 65, 108, 0.4); }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-val {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-title);
  line-height: 1.1;
}

.stat-lbl {
  font-size: 9.5px;
  color: var(--text-desc);
  font-weight: 600;
}

.empty-state {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}
</style>
