<template>
  <div style="height: 100%; display: flex; flex-direction: column; gap: 12px;">
    <!-- Top Section: Integrated Status Card -->
    <div class="card" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 16px; margin-bottom: 0; box-sizing: border-box; height: 64px; flex-shrink: 0; position: relative;">
      <!-- Left Part: Website Status -->
      <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
        <div :class="['shield-graphic', shieldClass]" id="dashboard-shield" style="width: 32px; height: 32px; margin-bottom: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <!-- Disabled SVG -->
          <svg v-if="!globalEnabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-width="2.5"></line>
          </svg>
          <!-- Safe SVG -->
          <svg v-else-if="domainReputation === 'safe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 11 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <!-- Danger SVG -->
          <svg v-else-if="domainReputation === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></line>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></line>
          </svg>
          <!-- Not Found SVG -->
          <svg v-else-if="domainReputation === 'not_found'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"></circle>
          </svg>
          <!-- System SVG (default shield) -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0;">
          <span id="current-domain-dashboard" style="font-size: 12px; font-weight: 700; color: var(--text-title); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ displayDomainText }}
          </span>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 2px;">
            <span style="font-size: 9.5px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
              <span>{{ t('dashboard.community_rating') }}</span> 
              <strong :style="{ color: reputationBadgeColor }">{{ reputationBadgeText }}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Right Part: AI Analyze Button -->
      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
        <button 
          @click="startAiAnalysis"
          :disabled="isAnalyzing"
          class="ai-analyze-btn"
        >
          <!-- Robot Icon (AI) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14" class="robot-icon" :class="{ 'scanning': isAnalyzing }">
            <!-- Signal waves (only visible/animating when scanning) -->
            <path v-if="isAnalyzing" class="signal-wave w1" d="M10 2.5a3 3 0 0 1 4 0" stroke-linecap="round" />
            <path v-if="isAnalyzing" class="signal-wave w2" d="M8 1a6 6 0 0 1 8 0" stroke-linecap="round" />
            
            <!-- Antenna -->
            <line x1="12" y1="6" x2="12" y2="3" stroke-linecap="round"/>
            <circle cx="12" cy="2" r="1" fill="currentColor"/>
            
            <!-- Head -->
            <rect x="5" y="6" width="14" height="11" rx="3" stroke-linejoin="round"/>
            
            <!-- Eyes (glowing) -->
            <circle cx="9" cy="11" r="1.2" fill="currentColor" class="robot-eye"/>
            <circle cx="15" cy="11" r="1.2" fill="currentColor" class="robot-eye"/>
            
            <!-- Mouth -->
            <path d="M9 14.5h6" stroke-linecap="round"/>
            
            <!-- Ears -->
            <path d="M5 10.5H3.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H5M19 10.5h1.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H19" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ isAnalyzing ? 'Đang quét...' : 'Phân tích AI' }}</span>
        </button>
      </div>
    </div>

    <!-- AI Fullscreen Analysis Overlay -->
    <div v-if="isAnalyzing || showAiReport" class="ai-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 15, 25, 0.96); backdrop-filter: blur(12px); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; color: #ffffff;">
      
      <!-- Close Button (only when finished) -->
      <button 
        v-if="!isAnalyzing" 
        @click="showAiReport = false"
        class="ai-close-btn"
        style="position: absolute; top: 20px; right: 24px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; outline: none;"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Scanning View -->
      <div v-if="isAnalyzing" class="ai-scan-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;">
        <!-- Glowing center logo wrapper -->
        <div class="ai-logo-container" style="position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;">
          <!-- Concentric Cyber Rings -->
          <svg class="cyber-ring ring-outer" viewBox="0 0 100 100" style="position: absolute; width: 130px; height: 130px; z-index: 2; pointer-events: none;">
            <circle cx="50" cy="50" r="46" stroke="rgba(99, 102, 241, 0.12)" stroke-width="1" fill="none"/>
            <circle cx="50" cy="50" r="46" stroke="var(--primary-blue)" stroke-width="2.2" stroke-dasharray="15 25 5 10 20 15" fill="none"/>
          </svg>
          <svg class="cyber-ring ring-inner" viewBox="0 0 100 100" style="position: absolute; width: 105px; height: 105px; z-index: 2; pointer-events: none;">
            <circle cx="50" cy="50" r="42" stroke="rgba(124, 58, 237, 0.12)" stroke-width="1" fill="none"/>
            <circle cx="50" cy="50" r="42" stroke="var(--accent-indigo)" stroke-width="2.2" stroke-dasharray="35 15 8 12" fill="none"/>
          </svg>

          <!-- Sweeping Laser Scan Line -->
          <div style="position: absolute; top: 0; left: 0; width: 140px; height: 140px; overflow: hidden; border-radius: 50%; z-index: 3; pointer-events: none;">
            <div class="laser-bar"></div>
          </div>

          <!-- Radar Rings -->
          <div class="radar-ring r1"></div>
          <div class="radar-ring r2"></div>
          <div class="radar-ring r3"></div>

          <!-- Logo Sphere -->
          <div class="ai-logo-sphere" style="width: 70px; height: 70px; background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); z-index: 5;">
            <!-- Shield SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 24px; height: 24px; color: #ffffff; margin-top: 4px; z-index: 6;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <!-- Percentage Text -->
            <span style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 800; color: #ffffff; margin-top: -1px; z-index: 6;">{{ scanPercentage }}%</span>
          </div>
        </div>

        <!-- Scanning Text details -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: 0.5px;">{{ scanStatusText }}</h3>
          <span style="font-size: 11px; color: var(--text-muted); tracking: 0.5px;">Trí tuệ nhân tạo đang kiểm tra an ninh website...</span>
        </div>
      </div>

      <!-- Error View -->
      <div v-else-if="apiError" class="ai-error-content" style="width: 100%; max-width: 500px; display: flex; flex-direction: column; align-items: center; gap: 16px; animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
        <div style="width: 54px; height: 54px; border-radius: 50%; background: var(--danger-light); color: var(--danger); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(241, 65, 108, 0.2);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div style="text-align: center; display: flex; flex-direction: column; gap: 6px;">
          <h2 style="font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 800; margin: 0; color: #ffffff;">LỖI PHÂN TÍCH HỆ THỐNG AI</h2>
          <p style="font-size: 11.5px; color: var(--text-desc); line-height: 1.5; margin: 0; padding: 0 16px;">
            {{ apiError }}
          </p>
        </div>
        <div style="display: flex; gap: 12px; width: 100%; justify-content: center; margin-top: 8px;">
          <button @click="showAiReport = false" class="ai-action-btn secondary" style="height: 32px; padding: 0 16px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid var(--border-light); background: transparent; color: var(--text-title); cursor: pointer; transition: all 0.2s;">
            Quay lại
          </button>
          <button @click="startAiAnalysis" class="ai-action-btn primary" style="height: 32px; padding: 0 16px; font-size: 11px; font-weight: 700; border-radius: 8px; border: none; background: linear-gradient(135deg, #4f46e5, #2563eb); color: white; cursor: pointer; transition: all 0.2s;">
            🔄 Thử lại
          </button>
        </div>
      </div>

      <!-- Results View -->
      <div v-else class="ai-results-content" style="width: 100%; max-width: 620px; height: 100%; max-height: 360px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; overflow: hidden; animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
        <!-- Header Info -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; flex-shrink: 0; text-align: left;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(99, 102, 241, 0.15); color: var(--primary-blue);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h2 style="font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: 0.5px;">BÁO CÁO PHÂN TÍCH AI</h2>
          </div>
          <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; color: var(--primary-blue); background: rgba(0, 158, 247, 0.08); padding: 2px 10px; border-radius: 20px; border: 1px solid rgba(0, 158, 247, 0.15); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="aiResponse ? aiResponse.checks?.collector?.url : displayDomainText">
            {{ aiResponse ? aiResponse.checks?.collector?.hostname : displayDomainText }}
          </span>
        </div>

        <!-- Scrollable content area -->
        <div style="flex-grow: 1; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 8px;">
          
          <template v-if="aiResponse">
            <!-- Row 1: Risk Gauge & Overview -->
            <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px; align-items: center;">
              <!-- Left: Risk Score Gauge -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid var(--border-light); padding-right: 10px;">
                <span style="font-size: 8.5px; color: var(--text-desc); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Điểm Rủi Ro</span>
                
                <!-- Circular Progress bar / Big Score -->
                <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 36 36" style="width: 68px; height: 68px; transform: rotate(-90deg);">
                    <!-- Background Circle -->
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      stroke-width="3.5"
                    />
                    <!-- Colored Risk Circle -->
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      :stroke="getRiskColor(aiResponse.risk_score)"
                      stroke-width="3.5"
                      :stroke-dasharray="aiResponse.risk_score + ', 100'"
                      style="transition: stroke-dasharray 1s ease-in-out;"
                    />
                  </svg>
                  <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1;">{{ aiResponse.risk_score }}</span>
                    <span style="font-size: 8px; color: var(--text-muted); font-weight: 600; margin-top: -2px;">/100</span>
                  </div>
                </div>
              </div>

              <!-- Right: Status / Details -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 8px; text-align: left;">
                <div style="display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 8px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Trạng thái</span>
                  <span :style="{ color: getRiskColor(aiResponse.risk_score) }" style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;" :style="{ backgroundColor: getRiskColor(aiResponse.risk_score) }"></span>
                    {{ getStatusText(aiResponse.status) }}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 8px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Mức độ rủi ro</span>
                  <span :style="{ color: getRiskColor(aiResponse.risk_score) }" style="font-size: 11.5px; font-weight: 800; text-transform: uppercase;">
                    {{ aiResponse.level || 'N/A' }}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 8px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Độ tin cậy AI</span>
                  <span style="font-size: 11.5px; font-weight: 800; color: #ffffff;">
                    {{ Math.round((aiResponse.confidence || 0) * 100) }}%
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 8px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Phân tích bởi</span>
                  <span style="font-size: 11.5px; font-weight: 800; color: var(--primary-blue);">
                    {{ aiResponse.source || 'AI Analysis' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Row 2: AI Reasoning (Lý do cụ thể) -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 10px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11" style="color: var(--primary-blue);">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <strong style="color: var(--primary-blue); font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">Phân tích & Nhận định từ AI</strong>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div v-for="(reasonText, idx) in aiResponse.reason" :key="idx" style="font-size: 11px; color: #ffffff; font-weight: 500; line-height: 1.4; padding-left: 6px; border-left: 2px solid var(--primary-blue);">
                  {{ reasonText }}
                </div>
              </div>
            </div>

            <!-- Row 3: Indicators (Dấu hiệu nguy cơ) -->
            <div v-if="(aiResponse.indicators && aiResponse.indicators.length > 0) || (aiResponse.categories && aiResponse.categories.length > 0)" style="text-align: left; background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11" style="color: var(--danger);">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <strong style="color: var(--text-title); font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">Các dấu hiệu phát hiện</strong>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                <span
                  v-for="(ind, idx) in aiResponse.indicators"
                  :key="idx"
                  style="font-size: 9px; font-weight: 700; background: rgba(241, 65, 108, 0.08); color: var(--danger); border: 1px solid rgba(241, 65, 108, 0.2); padding: 1.5px 6px; border-radius: 4px; text-transform: uppercase;"
                >
                  {{ ind }}
                </span>
                <span
                  v-for="(cat, idx) in aiResponse.categories"
                  :key="'cat-'+idx"
                  v-if="cat !== 'Unknown'"
                  style="font-size: 9px; font-weight: 700; background: rgba(241, 188, 25, 0.08); color: var(--warning); border: 1px solid rgba(241, 188, 25, 0.2); padding: 1.5px 6px; border-radius: 4px; text-transform: uppercase;"
                >
                  {{ cat }}
                </span>
              </div>
            </div>

            <!-- Row 4: Collector Details (Thông tin thu thập kỹ thuật) -->
            <div v-if="aiResponse.checks?.collector" style="text-align: left; background: rgba(255,255,255,0.01); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11" style="color: var(--text-desc);">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
                <strong style="color: var(--text-desc); font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">Dữ liệu kỹ thuật của Website</strong>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; font-size: 10px;">
                <div style="display: flex; flex-direction: column; overflow: hidden;">
                  <span style="color: var(--text-muted); font-size: 8px; font-weight: 600;">Tiêu đề (Title)</span>
                  <span style="color: #ffffff; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" :title="aiResponse.checks.collector.title || 'N/A'">
                    {{ aiResponse.checks.collector.title || 'N/A' }}
                  </span>
                </div>
                
                <div style="display: flex; flex-direction: column;">
                  <span style="color: var(--text-muted); font-size: 8px; font-weight: 600;">IP Máy chủ (IPv4)</span>
                  <span style="color: #ffffff; font-weight: 600; font-family: monospace;">
                    {{ (aiResponse.checks.collector.ipv4 && aiResponse.checks.collector.ipv4.length > 0) ? aiResponse.checks.collector.ipv4[0] : 'N/A' }}
                  </span>
                </div>

                <div style="display: flex; flex-direction: column;">
                  <span style="color: var(--text-muted); font-size: 8px; font-weight: 600;">Web Server</span>
                  <span style="color: #ffffff; font-weight: 600;">
                    {{ aiResponse.checks.collector.response_headers?.Server || 'N/A' }}
                  </span>
                </div>

                <div style="display: flex; flex-direction: column;">
                  <span style="color: var(--text-muted); font-size: 8px; font-weight: 600;">HTTP Code / Content-Type</span>
                  <span style="color: #ffffff; font-weight: 600; display: flex; align-items: center; gap: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="aiResponse.checks.collector.content_type">
                    <span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%;" :style="{ backgroundColor: aiResponse.checks.collector.status_code === 200 ? 'var(--accent-teal)' : 'var(--warning)' }"></span>
                    {{ aiResponse.checks.collector.status_code }} ({{ aiResponse.checks.collector.content_type?.split(';')[0] }})
                  </span>
                </div>
              </div>
            </div>
          </template>

        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; flex-shrink: 0; margin-top: 2px;">
          <button 
            @click="showAiReport = false"
            style="flex: 1; height: 28px; font-size: 10.5px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-light); background: transparent; color: var(--text-title); cursor: pointer; transition: all 0.2s;"
            class="ai-action-btn secondary"
          >
            Quay lại Dashboard
          </button>
          <button 
            @click="startAiAnalysis"
            style="flex: 1; height: 28px; font-size: 10.5px; font-weight: 700; border-radius: 6px; border: none; background: linear-gradient(135deg, #4f46e5, #2563eb); color: white; cursor: pointer; transition: all 0.2s;"
            class="ai-action-btn primary"
          >
            🔄 Phân tích lại
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Cookie Manager (Full Width) -->
    <div class="cookie-card-container" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background-color: transparent; border: none; padding: 0; box-sizing: border-box;">
      <CookieManager />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n.js';
import CookieManager from './CookieManager.vue';

export default {
  name: 'DashboardTab',
  components: {
    CookieManager
  },
  props: {
    globalEnabled: {
      type: Boolean,
      required: true
    },
    domainReputation: {
      type: String,
      required: true
    },
    displayDomainText: {
      type: String,
      required: true
    },
    reputationBadgeColor: {
      type: String,
      required: true
    },
    reputationBadgeText: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n();

    // AI Analysis states
    const isAnalyzing = ref(false);
    const showAiReport = ref(false);
    const scanStatusText = ref('');
    const scanPercentage = ref(0);
    const aiResponse = ref(null);
    const apiError = ref(null);

    const shieldClass = computed(() => {
      if (!props.globalEnabled) return 'danger';
      if (props.domainReputation === 'safe') return 'safe';
      if (props.domainReputation === 'danger') return 'danger';
      if (props.domainReputation === 'not_found') return 'warning';
      return 'safe';
    });

    const getRiskColor = (score) => {
      if (score === undefined || score === null) return 'var(--text-muted)';
      if (score >= 70) return 'var(--danger)';
      if (score >= 30) return 'var(--warning)';
      return 'var(--accent-teal)';
    };

    const getStatusText = (status) => {
      if (!status) return 'Chưa xác định';
      const low = status.toLowerCase();
      if (low === 'malicious') return 'Độc hại';
      if (low === 'safe') return 'An toàn';
      if (low === 'suspicious') return 'Nghi vấn';
      return status;
    };

    const startAiAnalysis = () => {
      if (isAnalyzing.value) return;
      isAnalyzing.value = true;
      showAiReport.value = false;
      scanPercentage.value = 0;
      apiError.value = null;
      aiResponse.value = null;

      // 1. Get active tab URL
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let activeUrl = '';
        if (tabs && tabs.length > 0) {
          activeUrl = tabs[0].url || '';
        }

        if (!activeUrl || activeUrl.startsWith('chrome:') || activeUrl.startsWith('chrome-extension:')) {
          isAnalyzing.value = false;
          apiError.value = 'Không thể chạy phân tích AI trên các trang hệ thống của trình duyệt.';
          showAiReport.value = true;
          return;
        }

        // Setup progress bar animation
        let percent = 0;
        const percentTimer = setInterval(() => {
          if (percent < 95) {
            percent += Math.floor(Math.random() * 3) + 1;
            if (percent > 95) percent = 95;
            scanPercentage.value = percent;
          }
        }, 80);

        // Status phases simulating scanning
        scanStatusText.value = 'Đang kết nối tới máy chủ phân tích AI...';

        setTimeout(() => {
          if (isAnalyzing.value) scanStatusText.value = 'Đang trích xuất mã nguồn và phân tích cấu trúc DOM...';
        }, 800);

        setTimeout(() => {
          if (isAnalyzing.value) scanStatusText.value = 'AI đang đánh giá các dấu hiệu và yếu tố giả mạo...';
        }, 1800);

        setTimeout(() => {
          if (isAnalyzing.value) scanStatusText.value = 'Đang tổng hợp báo cáo an ninh mạng...';
        }, 2800);

        // Call real API
        try {
          const response = await fetch('http://localhost:8000/api/v1/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: activeUrl })
          });

          if (!response.ok) {
            throw new Error(`Máy chủ phản hồi lỗi HTTP ${response.status}`);
          }

          const data = await response.json();
          
          // Complete animation smoothly
          clearInterval(percentTimer);
          scanPercentage.value = 100;

          setTimeout(() => {
            aiResponse.value = data;
            isAnalyzing.value = false;
            showAiReport.value = true;
          }, 300);

        } catch (error) {
          clearInterval(percentTimer);
          console.error('[AI Analysis Error]', error);
          isAnalyzing.value = false;
          apiError.value = 'Không thể kết nối đến hệ thống phân tích AI tại địa chỉ http://localhost:8000/api/v1/analyze. Hãy đảm bảo rằng bạn đã khởi động máy chủ phân tích (port 8000) và thử lại.';
          showAiReport.value = true;
        }
      });
    };

    return {
      t,
      shieldClass,
      isAnalyzing,
      showAiReport,
      scanStatusText,
      scanPercentage,
      aiResponse,
      apiError,
      getRiskColor,
      getStatusText,
      startAiAnalysis
    };
  }
};
</script>

<style scoped>
.ai-analyze-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, #7239ea 0%, #3e97ff 50%, #00d182 100%);
  background-size: 200% auto;
  cursor: pointer;
  outline: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4), 0 4px 12px rgba(37, 99, 235, 0.2);
  animation: shimmer 4s infinite linear, pulse-glow 2.5s infinite ease-in-out;
  letter-spacing: -0.2px;
}

.ai-analyze-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 0 15px 3px rgba(62, 151, 255, 0.4), 0 6px 18px rgba(114, 57, 234, 0.3);
  border-color: rgba(255, 255, 255, 0.35);
  background-position: right center;
}

.ai-analyze-btn:active {
  transform: translateY(0) scale(0.98);
}

.ai-analyze-btn:disabled {
  background: #1e1e2d;
  color: var(--text-muted);
  border-color: var(--border-light);
  cursor: not-allowed;
  animation: none;
  box-shadow: none;
}

/* Robot Icon Animations */
.robot-icon {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ai-analyze-btn:hover .robot-icon:not(.scanning) {
  transform: translateY(-1px) rotate(8deg) scale(1.1);
}

.robot-eye {
  transform-origin: center;
  animation: eye-blink 4s infinite ease-in-out;
}

@keyframes eye-blink {
  0%, 96%, 100% { opacity: 1; }
  98% { opacity: 0.15; }
}

.signal-wave {
  transform-origin: bottom center;
  animation: pulse-wave 1s infinite ease-in-out;
}

.signal-wave.w1 {
  animation-delay: 0.15s;
}

.signal-wave.w2 {
  animation-delay: 0.4s;
}

@keyframes pulse-wave {
  0% { opacity: 0; transform: translateY(1px) scale(0.8); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-2px) scale(1.1); }
}

.scanning {
  animation: scanning-bounce 1s infinite ease-in-out;
}

@keyframes scanning-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4), 0 4px 12px rgba(37, 99, 235, 0.2); }
  50% { box-shadow: 0 0 10px 1px rgba(124, 58, 237, 0.35), 0 4px 16px rgba(37, 99, 235, 0.25); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4), 0 4px 12px rgba(37, 99, 235, 0.2); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-scanner-spinner {
  border-top-color: var(--primary-blue) !important;
}

/* Fullscreen Overlay Styling */
.ai-overlay {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Concentric Cyber Rings Animation */
.cyber-ring {
  transform-origin: center;
}

.ring-outer {
  animation: rotate-clockwise 10s infinite linear;
}

.ring-inner {
  animation: rotate-counter-clockwise 7s infinite linear;
}

@keyframes rotate-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes rotate-counter-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}

/* Laser sweep animation */
.laser-bar {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0) 0%, #3b82f6 50%, rgba(99, 102, 241, 0) 100%);
  box-shadow: 0 0 10px 1px #3b82f6;
  animation: laser-sweep 2s infinite ease-in-out;
}

@keyframes laser-sweep {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}

/* Radar rings scanning circles */
.radar-ring {
  position: absolute;
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  animation: radar-pulse 3s infinite linear;
  opacity: 0;
  z-index: 1;
}

.radar-ring.r1 {
  width: 70px;
  height: 70px;
  animation-delay: 0s;
}

.radar-ring.r2 {
  width: 70px;
  height: 70px;
  animation-delay: 1s;
}

.radar-ring.r3 {
  width: 70px;
  height: 70px;
  animation-delay: 2s;
}

@keyframes radar-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.ai-logo-sphere {
  animation: logo-pulsate 2s infinite ease-in-out;
}

@keyframes logo-pulsate {
  0% { transform: scale(1); box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
  50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(99, 102, 241, 0.8), 0 0 20px rgba(124, 58, 237, 0.4); }
  100% { transform: scale(1); box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
}

@keyframes scaleIn {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.ai-close-btn:hover {
  background: rgba(255,255,255,0.1) !important;
  color: #ffffff !important;
  transform: rotate(90deg);
}

.ai-action-btn.secondary:hover {
  background: rgba(255,255,255,0.05) !important;
  border-color: rgba(255,255,255,0.2) !important;
}

.ai-action-btn.primary:hover {
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
}
</style>
