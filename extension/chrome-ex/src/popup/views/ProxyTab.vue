<template>
  <div style="height: 100%; display: flex; flex-direction: column; gap: 8px;">
    <!-- Title Row -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
      <div style="display: flex; flex-direction: column;">
        <h2 class="title" style="margin: 0;">{{ t('proxy.title') }}</h2>
      </div>
      <button @click="openSettings" class="cookie-btn" :title="t('proxy.tooltip_settings')" style="height: 26px; padding: 0 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; border-radius: 6px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span style="font-size: 10px; font-weight: 600;">{{ t('proxy.btn_settings') }}</span>
      </button>
    </div>

    <!-- Proxy Status Card -->
    <div v-show="!isPanelOpen" class="cookie-status-card" style="background-color: var(--bg-card); border: 1px solid var(--border-light); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 4px; position: relative; flex-shrink: 0;">
      <div :style="{
        color: config.enabled ? 'var(--primary-blue)' : 'var(--text-muted)',
        backgroundColor: config.enabled ? 'var(--primary-light)' : 'var(--border-light)'
      }" style="flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0; padding-right: 70px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <h4 style="margin: 0; font-size: 12px; font-weight: 600; color: var(--text-title); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ config.enabled ? t('proxy.status_connected') : t('proxy.status_direct') }}
          </h4>
          <span :style="{
            backgroundColor: config.enabled ? 'var(--primary-light)' : 'rgba(255,255,255,0.06)',
            color: config.enabled ? 'var(--primary-blue)' : 'var(--text-desc)'
          }" style="font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 4px;">
            {{ config.enabled ? (config.scheme || 'http').toUpperCase() : 'DIRECT' }}
          </span>
        </div>
        <p style="margin: 0; font-size: 10px; color: var(--text-desc); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {{ config.enabled ? (config.scheme === 'pac' ? config.pacUrl : `${config.name ? config.name + ' - ' : ''}${config.host}:${config.port}`) : t('proxy.status_direct_desc') }}
        </p>
      </div>
      <button v-show="config.enabled" @click="disableProxy" class="cookie-btn cancel" style="height: 22px; font-size: 9px; margin: 0; padding: 0 8px; flex-shrink: 0; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);">
        {{ t('proxy.btn_disconnect') }}
      </button>
    </div>

    <!-- Main Workspace Container -->
    <div style="position: relative; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;">
      <!-- Proxy List View -->
      <div v-show="!isPanelOpen" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
        
        <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
          <div class="cookie-list" style="flex-grow: 1; overflow-y: auto;">
            <div v-if="proxies.length === 0" class="empty-state">
              {{ t('proxy.empty_state') }}
            </div>
            <div 
              v-else
              v-for="proxy in proxies" 
              :key="proxy.id" 
              :style="activeProxyId === proxy.id && config.enabled ? { borderColor: 'var(--primary-blue)', backgroundColor: 'rgba(0, 158, 247, 0.02)' } : {}"
              class="cookie-item"
            >
              <div class="cookie-item-main" @click="editProxy(proxy)">
                <div class="cookie-item-title-row">
                  <span class="cookie-item-name" :title="proxy.name || (proxy.scheme === 'pac' ? proxy.pacUrl : `${proxy.host}:${proxy.port}`)">
                    {{ proxy.name || (proxy.scheme === 'pac' ? proxy.pacUrl : `${proxy.host}:${proxy.port}`) }}
                  </span>
                  <div class="cookie-item-badges">
                    <span class="cookie-flag-badge session">{{ (proxy.scheme || 'http').toUpperCase() }}</span>
                    <span v-if="proxy.useAuth" class="cookie-flag-badge secure">AUTH</span>
                    <span v-if="activeProxyId === proxy.id && config.enabled" class="cookie-flag-badge secure" style="background-color: var(--accent-teal-light); color: var(--accent-teal);">
                      {{ t('proxy.status_active_badge') }}
                    </span>
                    <!-- Testing Badge -->
                    <span v-if="testingProxyId === proxy.id" class="cookie-flag-badge" style="background-color: var(--primary-light); color: var(--primary-blue); display: inline-flex; align-items: center;">
                      <span class="animate-spin h-2.5 w-2.5 border border-primary-blue border-t-transparent rounded-full mr-1"></span>
                      <span>Testing...</span>
                    </span>
                    <!-- Ping Result -->
                    <span v-else-if="proxy.lastPing !== undefined" class="cookie-flag-badge" :style="{
                      backgroundColor: proxy.lastPing === -1 ? 'var(--danger-light)' : 'var(--accent-teal-light)',
                      color: proxy.lastPing === -1 ? 'var(--danger)' : 'var(--accent-teal)'
                    }">
                      {{ proxy.lastPing === -1 ? 'Timeout/Error' : `${proxy.lastPing} ms` }}
                    </span>
                  </div>
                </div>
                <span class="cookie-item-value">{{ proxy.scheme === 'pac' ? proxy.pacUrl : `${proxy.host}:${proxy.port}` }}</span>
              </div>

              <div class="cookie-item-actions">
                <button 
                  :class="activeProxyId === proxy.id && config.enabled ? 'cookie-btn cancel' : 'cookie-btn save'" 
                  style="height: 24px; padding: 0 10px; font-size: 10px; margin: 0;"
                  :disabled="isTesting"
                  @click="toggleProxyConnection(proxy)"
                >
                  {{ activeProxyId === proxy.id && config.enabled ? t('proxy.btn_disconnect') : t('proxy.btn_connect') }}
                </button>
                <button class="cookie-item-btn" title="Kiểm tra" :disabled="isTesting" @click="testProxyNode(proxy)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </button>
                <button class="cookie-item-btn" :disabled="isTesting" @click="editProxy(proxy)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="cookie-item-btn danger" :disabled="isTesting" @click="deleteProxy(proxy.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Proxy Footer Actions (Custom) -->
          <div class="proxy-footer-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-light); flex-shrink: 0;">
            <span class="cookie-stats-badge" style="font-size: 9px; padding: 2px 8px; background-color: var(--border-light); color: var(--text-desc); border-radius: 6px;">
              {{ t('proxy.stats_count', proxies.length) }}
            </span>
            <div style="display: flex; gap: 6px;">
              <button class="cookie-action-btn success" :disabled="isTesting" @click="testAllProxies" :title="t('proxy.btn_test_all')" style="width: auto; padding: 0 10px; font-size: 10px; gap: 4px; display: inline-flex; align-items: center; height: 26px; cursor: pointer;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>{{ t('proxy.btn_test_all') }}</span>
              </button>
              <button class="cookie-action-btn primary" :disabled="isTesting" @click="showAddForm" :title="t('proxy.btn_add')" style="width: auto; padding: 0 10px; font-size: 10px; gap: 4px; display: inline-flex; align-items: center; height: 26px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{{ t('proxy.btn_add') }}</span>
              </button>
              <button class="cookie-action-btn" :disabled="isTesting" @click="importProxies" :title="t('proxy.btn_import')" style="width: auto; padding: 0 10px; font-size: 10px; gap: 4px; display: inline-flex; align-items: center; height: 26px; cursor: pointer; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-light); color: var(--text-title); border-radius: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ t('proxy.btn_import') }}</span>
              </button>
              <button class="cookie-action-btn" :disabled="isTesting" @click="exportProxies" :title="t('proxy.btn_export')" style="width: auto; padding: 0 10px; font-size: 10px; gap: 4px; display: inline-flex; align-items: center; height: 26px; cursor: pointer; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-light); color: var(--text-title); border-radius: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>{{ t('proxy.btn_export') }}</span>
              </button>
            </div>
          </div>
        </div>



      </div>

      <!-- Proxy Form Panel -->
      <div v-show="isPanelOpen && panelMode === 'form'" class="cookie-form-panel" style="display: flex; padding: 4px 0; height: 100%; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 6px;">
          <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">
            {{ editingProxyId ? t('proxy.form_title_edit') : t('proxy.form_title_add') }}
          </h3>
        </div>
        <div class="cookie-form-scroll" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; margin-bottom: 8px;">
          <div class="form-group">
            <label class="form-label">{{ t('proxy.form_name') }}</label>
            <input type="text" v-model="form.name" class="form-control" :placeholder="t('proxy.form_name_placeholder')" style="height: 30px; box-sizing: border-box; font-size: 11px;">
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <div class="form-group" style="flex: 1.2; min-width: 100px;">
              <label class="form-label">{{ t('proxy.form_scheme') }}</label>
              <select v-model="form.scheme" @change="onSchemeChange" class="form-control" style="height: 30px; font-size: 11px; padding: 4px 8px;">
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks4">SOCKS4</option>
                <option value="socks5">SOCKS5</option>
                <option value="quic">QUIC</option>
                <option value="pac">PAC (Auto-Config)</option>
                <option value="burp">Burp Suite</option>
                <option value="privoxy">Privoxy</option>
                <option value="psiphon">Psiphon</option>
                <option value="shadowsocks">Shadowsocks</option>
                <option value="tor">TOR</option>
                <option value="nekoray">NekoRay</option>
                <option value="v2ray">V2Ray / v2rayN</option>
              </select>
            </div>
            
            <div v-show="form.scheme !== 'pac'" style="display: flex; flex: 3; gap: 6px; min-width: 180px;">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">{{ t('proxy.form_host') }}</label>
                <input type="text" v-model="form.host" class="form-control" placeholder="127.0.0.1" style="height: 30px; box-sizing: border-box; font-size: 11px;">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">{{ t('proxy.form_port') }}</label>
                <input type="number" v-model="form.port" class="form-control" placeholder="8080" style="height: 30px; box-sizing: border-box; font-size: 11px;">
              </div>
            </div>

            <div v-show="form.scheme === 'pac'" class="form-group" style="flex: 3; min-width: 180px;">
              <label class="form-label">{{ t('proxy.form_pac_url') }}</label>
              <input type="text" v-model="form.pacUrl" class="form-control" placeholder="http://127.0.0.1:8080/proxy.pac" style="height: 30px; box-sizing: border-box; font-size: 11px;">
            </div>
          </div>

          <!-- Auth Switch -->
          <div v-show="form.scheme !== 'pac'" class="card card-toggle" style="background-color: var(--bg-card); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
            <span class="card-title" style="font-size: 11px; font-weight: 600; color: var(--text-title);">{{ t('proxy.form_auth') }}</span>
            <label class="switch" style="width: 32px; height: 18px;">
              <input type="checkbox" v-model="form.useAuth">
              <span class="slider round" style="border-radius: 18px;"></span>
            </label>
          </div>

          <!-- SOCKS Authentication Warning -->
          <div v-show="(form.scheme === 'socks5' || form.scheme === 'socks4') && form.useAuth" style="font-size: 10px; color: #ff9800; padding: 6px 10px; line-height: 1.4; background: rgba(255, 152, 0, 0.08); border: 1px solid rgba(255, 152, 0, 0.2); border-radius: 8px; margin-bottom: 0;">
            ⚠️ Trình duyệt Chrome không hỗ trợ xác thực Username/Password cho SOCKS4/SOCKS5. Hãy cấu hình IP Whitelisting trên server proxy hoặc dùng proxy HTTP/HTTPS.
          </div>

          <!-- Auth Credentials Fields -->
          <div v-show="form.scheme !== 'pac' && form.useAuth" style="display: flex; gap: 6px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">{{ t('proxy.form_username') }}</label>
              <input type="text" v-model="form.username" class="form-control" placeholder="Username" style="height: 30px; box-sizing: border-box; font-size: 11px;">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">{{ t('proxy.form_password') }}</label>
              <div style="position: relative; width: 100%;">
                <input :type="isPasswordVisible ? 'text' : 'password'" v-model="form.password" class="form-control" placeholder="Password" style="height: 30px; box-sizing: border-box; font-size: 11px; width: 100%; padding-right: 28px;">
                <button type="button" @click="isPasswordVisible = !isPasswordVisible" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 0; outline: none;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                    <path v-if="!isPasswordVisible" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle v-if="!isPasswordVisible" cx="12" cy="12" r="3"></circle>
                    <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Bypass Domain -->
          <div v-show="form.scheme !== 'pac'" class="form-group">
            <label class="form-label">{{ t('proxy.form_bypass') }}</label>
            <textarea v-model="form.bypass" class="form-control" rows="2" :placeholder="t('proxy.form_bypass_placeholder')" style="resize: none; font-family: monospace; font-size: 10px; padding: 6px 10px; box-sizing: border-box;"></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border-light); flex-shrink: 0;">
          <button class="cookie-btn" :disabled="isTesting" @click="testProxyFromForm" style="height: 24px; padding: 0 10px; font-size: 10px; display: inline-flex; align-items: center; gap: 4px; margin-right: auto; border: 1px solid var(--border-light); background-color: var(--bg-card); color: var(--text-desc); cursor: pointer; border-radius: 4px;">
            <span v-if="isFormTesting" class="animate-spin h-2.5 w-2.5 border border-gray-400 border-t-transparent rounded-full mr-1"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>{{ isFormTesting ? 'Testing...' : t('proxy.btn_test') }}</span>
          </button>
          <button class="cookie-btn cancel" @click="closePanel">{{ t('proxy.btn_cancel') }}</button>
          <button class="cookie-btn save" @click="saveProxy" style="height: 24px; padding: 0 12px; font-size: 10px; background-color: var(--primary-blue); color: white;">{{ t('proxy.btn_save') }}</button>
        </div>
      </div>

      <!-- Proxy Advanced Settings Panel -->
      <div v-show="isPanelOpen && panelMode === 'settings'" class="cookie-form-panel" style="display: flex; padding: 4px 0; height: 100%; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 6px;">
          <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">{{ t('proxy.settings_title') }}</h3>
        </div>
        <div class="cookie-form-scroll" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 2px; margin-bottom: 8px;">
          
          <!-- WebRTC Leak Protection -->
          <div class="card card-toggle" style="flex-direction: column; align-items: stretch; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div class="card-info">
                <span class="card-title">{{ t('proxy.webrtc_title') }}</span>
                <span class="card-desc">{{ t('proxy.webrtc_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.webrtcEnabled">
                <span class="slider round"></span>
              </label>
            </div>
            <div v-show="settings.webrtcEnabled" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
              <label class="form-label" style="font-size: 9px; margin-bottom: 2px;">{{ t('proxy.webrtc_mode') }}</label>
              <select v-model="settings.webrtcPolicy" class="form-control" style="height: 28px; font-size: 10.5px; padding: 4px 6px;">
                <option value="disable_non_proxied_udp">{{ t('proxy.webrtc_hide_ip') }}</option>
                <option value="block_entirely">{{ t('proxy.webrtc_block_all') }}</option>
              </select>
            </div>
          </div>

          <!-- GPS Spoofing -->
          <div class="card card-toggle" style="flex-direction: column; align-items: stretch; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div class="card-info">
                <span class="card-title">{{ t('proxy.gps_title') }}</span>
                <span class="card-desc">{{ t('proxy.gps_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.gpsEnabled">
                <span class="slider round"></span>
              </label>
            </div>
            <div v-show="settings.gpsEnabled" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
              <label class="form-label" style="font-size: 9px; margin-bottom: 2px;">{{ t('proxy.gps_mode') }}</label>
              <select v-model="settings.gpsMode" class="form-control" style="height: 28px; font-size: 10.5px; padding: 4px 6px;">
                <option value="auto">{{ t('proxy.gps_auto') }}</option>
                <option value="manual">{{ t('proxy.gps_manual') }}</option>
              </select>
              <div v-show="settings.gpsMode === 'manual'" style="display: flex; gap: 6px; margin-top: 2px;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                  <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.gps_lat') }}</label>
                  <input type="number" step="any" v-model="settings.gpsLat" class="form-control" placeholder="Ví dụ: 10.8231" style="height: 26px; font-size: 10px; padding: 2px 6px; box-sizing: border-box;">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                  <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.gps_lng') }}</label>
                  <input type="number" step="any" v-model="settings.gpsLng" class="form-control" placeholder="Ví dụ: 106.6297" style="height: 26px; font-size: 10px; padding: 2px 6px; box-sizing: border-box;">
                </div>
              </div>
            </div>
          </div>

          <!-- Timezone Spoofing -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('proxy.timezone_title') }}</span>
              <span class="card-desc">{{ t('proxy.timezone_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.timezoneEnabled">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Auto reload tabs -->
          <div class="card card-toggle">
            <div class="card-info">
              <span class="card-title">{{ t('proxy.autoreload_title') }}</span>
              <span class="card-desc">{{ t('proxy.autoreload_desc') }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.reloadAllTabsOnConnect">
              <span class="slider round"></span>
            </label>
          </div>

          <!-- User-Agent Spoofing -->
          <div class="card card-toggle" style="flex-direction: column; align-items: stretch; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div class="card-info">
                <span class="card-title">{{ t('proxy.ua_title') }}</span>
                <span class="card-desc">{{ t('proxy.ua_desc') }}</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.uaEnabled">
                <span class="slider round"></span>
              </label>
            </div>
            
            <div v-show="settings.uaEnabled" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
              <div style="display: flex; gap: 6px;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                  <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.ua_os') }}</label>
                  <select v-model="settings.uaOsFilter" class="form-control" style="height: 24px; font-size: 9.5px; padding: 2px 4px;">
                    <option value="all">{{ t('proxy.ua_os_all') }}</option>
                    <option value="windows">Windows</option>
                    <option value="macos">macOS</option>
                    <option value="linux">Linux</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS (iPhone/iPad)</option>
                  </select>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                  <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.ua_browser') }}</label>
                  <select v-model="settings.uaBrowserFilter" class="form-control" style="height: 24px; font-size: 9.5px; padding: 2px 4px;">
                    <option value="all">{{ t('proxy.ua_browser_all') }}</option>
                    <option value="chrome">Chrome</option>
                    <option value="firefox">Firefox</option>
                    <option value="safari">Safari</option>
                    <option value="edge">Edge</option>
                  </select>
                </div>
              </div>

              <!-- Presets -->
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.ua_presets') }}</label>
                <select @change="onPresetChange" class="form-control" style="height: 26px; font-size: 10px; padding: 2px 4px;">
                  <option value="">{{ t('proxy.ua_select_preset') }}</option>
                  <option v-for="item in filteredPresets" :key="item.name" :value="item.ua">
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <!-- Custom text -->
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <label class="form-label" style="font-size: 8px; margin-bottom: 1px;">{{ t('proxy.ua_config_string') }}</label>
                <textarea v-model="settings.userAgent" class="form-control" rows="2" :placeholder="t('proxy.ua_placeholder')" style="resize: none; font-family: monospace; font-size: 9px; padding: 4px 6px; box-sizing: border-box;"></textarea>
              </div>
            </div>
          </div>

          <!-- Proxy Conflict Extensions -->
          <div class="card card-toggle" style="flex-direction: column; align-items: stretch; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div class="card-info">
                <span class="card-title">{{ t('proxy.conflict_title') }}</span>
                <span class="card-desc">{{ t('proxy.conflict_desc') }}</span>
              </div>
              <button class="cookie-btn" @click="refreshConflicts" style="height: 20px; padding: 0 8px; font-size: 9px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--border-light); background-color: var(--bg-card); color: var(--text-desc);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
                <span>{{ t('proxy.btn_scan') }}</span>
              </button>
            </div>
            
            <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 6px;">
              <div v-if="conflicts.length === 0" style="font-size: 9px; color: var(--accent-teal); backgroundColor: var(--accent-teal-light); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(4, 209, 130, 0.15); textAlign: center;">
                {{ t('proxy.conflict_none') }}
              </div>
              <div v-else v-for="ext in conflicts" :key="ext.id" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 6px; padding: 6px 8px; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                  <img v-if="ext.icons && ext.icons.length > 0" :src="ext.icons[ext.icons.length - 1].url" style="width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0;" />
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="color: var(--text-muted); flex-shrink: 0;">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span style="font-size: 10px; font-weight: 500; color: var(--text-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ ext.name }}
                  </span>
                </div>
                <button class="cookie-btn cancel" @click="disableExtension(ext)" style="height: 18px; padding: 0 6px; font-size: 9px; margin: 0; line-height: 1; background-color: var(--danger-light); color: var(--danger); border: 1px solid rgba(246, 78, 96, 0.15);">
                  {{ t('proxy.btn_disable_ext') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border-light); flex-shrink: 0;">
          <button class="cookie-btn cancel" @click="closePanel">{{ t('proxy.btn_cancel') }}</button>
          <button class="cookie-btn save" @click="saveSettings" style="height: 24px; padding: 0 12px; font-size: 10px; background-color: var(--primary-blue); color: white;">{{ t('proxy.btn_save_settings') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from '../composables/useI18n.js';
import { showToast } from '../../shared/toast.js';

// Danh sách các User-Agent cấu hình sẵn
const UA_PRESETS = [
  { name: "Chrome 120 (Windows)", os: "windows", browser: "chrome", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  { name: "Firefox 120 (Windows)", os: "windows", browser: "firefox", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0" },
  { name: "Edge 120 (Windows)", os: "windows", browser: "edge", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0" },
  { name: "Chrome 120 (macOS)", os: "macos", browser: "chrome", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  { name: "Safari 17 (macOS)", os: "macos", browser: "safari", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" },
  { name: "Firefox 120 (macOS)", os: "macos", browser: "firefox", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0" },
  { name: "Chrome 120 (Linux)", os: "linux", browser: "chrome", ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  { name: "Firefox 120 (Linux)", os: "linux", browser: "firefox", ua: "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0" },
  { name: "Safari 17 (iPhone)", os: "ios", browser: "safari", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/605.1.15" },
  { name: "Chrome 120 (iPhone)", os: "ios", browser: "chrome", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1" },
  { name: "Chrome 120 (Android)", os: "android", browser: "chrome", ua: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" },
  { name: "Firefox 120 (Android)", os: "android", browser: "firefox", ua: "Mozilla/5.0 (Android 10; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0" }
];

export default {
  name: 'ProxyTab',
  setup() {
    const { t } = useI18n();

    // ==========================================
    // 1. STATE DECLARATIONS
    // ==========================================
    const proxies = ref([]);
    const activeProxyId = ref(null);
    const config = ref({ enabled: false });



    // Trạng thái Panels
    const isPanelOpen = ref(false);
    const panelMode = ref(''); // 'form' | 'settings'
    const editingProxyId = ref(null);
    const isPasswordVisible = ref(false);

    // Trạng thái Testing
    const isTesting = ref(false);
    const isFormTesting = ref(false);
    const testingProxyId = ref(null);

    // Xung đột tiện ích
    const conflicts = ref([]);

    // Dữ liệu Form Proxy
    const form = reactive({
      name: '',
      scheme: 'http',
      host: '',
      port: '',
      pacUrl: '',
      useAuth: false,
      username: '',
      password: '',
      bypass: ''
    });

    const cleanHostAndPort = (host, port) => {
      let cleanedHost = String(host || '').trim();
      let cleanedPort = String(port !== null && port !== undefined ? port : '').trim();

      // Remove protocol prefix if any
      cleanedHost = cleanedHost.replace(/^[a-zA-Z0-9]+:\/\//, '');

      // Handle user:pass@host:port
      if (cleanedHost.includes('@')) {
        const parts = cleanedHost.split('@');
        cleanedHost = parts[1] || '';
      }

      // Handle host:port
      if (cleanedHost.includes(':')) {
        const parts = cleanedHost.split(':');
        cleanedHost = parts[0] || '';
        if (!cleanedPort) {
          cleanedPort = parts[1] || '';
        }
      }

      return {
        host: cleanedHost,
        port: cleanedPort
      };
    };

    watch(() => form.host, (newVal) => {
      if (!newVal) return;
      
      const val = newVal.trim();
      let processedVal = val;
      let schemeDetected = null;
      
      // Check for protocol prefix (e.g. http://)
      const protocolMatch = processedVal.match(/^([a-zA-Z0-9]+):\/\//);
      if (protocolMatch) {
        schemeDetected = protocolMatch[1].toLowerCase();
        processedVal = processedVal.substring(protocolMatch[0].length);
      }
      
      let parsed = null;
      if (processedVal.includes('@')) {
        const parts = processedVal.split('@');
        const authPart = parts[0] || '';
        const hostPart = parts[1] || '';

        const authSplit = authPart.split(':');
        const username = authSplit[0] || '';
        const password = authSplit[1] || '';

        const hostSplit = hostPart.split(':');
        const host = hostSplit[0] || '';
        const port = hostSplit[1] || '';
        
        parsed = { host, port, username, password, useAuth: !!username };
      } else {
        const parts = processedVal.split(':');
        if (parts.length >= 4) {
          parsed = {
            host: parts[0] || '',
            port: parts[1] || '',
            username: parts[2] || '',
            password: parts[3] || '',
            useAuth: true
          };
        } else if (parts.length === 3) {
          parsed = {
            host: parts[0] || '',
            port: parts[1] || '',
            username: parts[2] || '',
            password: '',
            useAuth: true
          };
        } else if (parts.length === 2) {
          parsed = {
            host: parts[0] || '',
            port: parts[1] || ''
          };
        }
      }
      
      if (parsed && parsed.host && parsed.host !== val) {
        form.host = parsed.host;
        if (parsed.port) form.port = parsed.port;
        if (parsed.useAuth !== undefined) form.useAuth = parsed.useAuth;
        if (parsed.username !== undefined) form.username = parsed.username;
        if (parsed.password !== undefined) form.password = parsed.password;
        if (schemeDetected) {
          const validSchemes = ['http', 'https', 'socks4', 'socks5', 'quic', 'burp', 'privoxy', 'psiphon', 'shadowsocks', 'tor', 'nekoray', 'v2ray'];
          if (validSchemes.includes(schemeDetected)) {
            form.scheme = schemeDetected;
          }
        }
      }
    });

    // Cài đặt nâng cao
    const settings = reactive({
      webrtcEnabled: false,
      webrtcPolicy: 'disable_non_proxied_udp',
      gpsEnabled: false,
      gpsMode: 'auto',
      gpsLat: '',
      gpsLng: '',
      timezoneEnabled: false,
      reloadAllTabsOnConnect: false,
      uaEnabled: false,
      uaOsFilter: 'all',
      uaBrowserFilter: 'all',
      userAgent: ''
    });

    // ==========================================
    // 2. STORAGE MANAGEMENT
    // ==========================================
    const loadConfig = () => {
      chrome.storage.local.get(['proxyList', 'activeProxyId', 'proxyConfig', 'proxyAdvancedSettings'], (result) => {
        const rawList = result.proxyList;
        proxies.value = Array.isArray(rawList)
          ? rawList.filter(p => p && typeof p === 'object' && p.id).map(p => ({
              ...p,
              scheme: p.scheme || 'http',
              name: p.name || (p.scheme === 'pac' ? p.pacUrl : `${p.host || ''}:${p.port || ''}`)
            }))
          : [];
        activeProxyId.value = result.activeProxyId || null;
        
        const rawConfig = result.proxyConfig;
        config.value = (rawConfig && typeof rawConfig === 'object')
          ? { enabled: !!rawConfig.enabled, ...rawConfig }
          : { enabled: false };

        if (result.proxyAdvancedSettings) {
          Object.assign(settings, result.proxyAdvancedSettings);
        }
      });
    };

    const updateProxyStorage = (callback) => {
      const plainList = JSON.parse(JSON.stringify(proxies.value));
      chrome.storage.local.set({ proxyList: plainList }, () => {
        if (callback) callback();
      });
    };

    onMounted(() => {
      loadConfig();
    });

    // ==========================================
    // 3. PANEL & FORM CONTROLS
    // ==========================================
    const showAddForm = () => {
      editingProxyId.value = null;
      form.name = '';
      form.scheme = 'http';
      form.host = '';
      form.port = '';
      form.pacUrl = '';
      form.useAuth = false;
      form.username = '';
      form.password = '';
      form.bypass = '';
      isPasswordVisible.value = false;
      panelMode.value = 'form';
      isPanelOpen.value = true;
    };

    const editProxy = (proxy) => {
      editingProxyId.value = proxy.id;
      form.name = proxy.name || '';
      form.scheme = proxy.scheme || 'http';
      form.host = proxy.host || '';
      form.port = proxy.port || '';
      form.pacUrl = proxy.pacUrl || '';
      form.useAuth = !!proxy.useAuth;
      form.username = proxy.username || '';
      form.password = proxy.password || '';
      form.bypass = proxy.bypass || '';
      isPasswordVisible.value = false;
      panelMode.value = 'form';
      isPanelOpen.value = true;
    };

    const openSettings = () => {
      panelMode.value = 'settings';
      isPanelOpen.value = true;
      refreshConflicts();
    };

    const closePanel = () => {
      isPanelOpen.value = false;
      panelMode.value = '';
    };

    const onSchemeChange = () => {
      if (form.scheme !== 'pac') {
        const presets = {
          "burp": { host: "127.0.0.1", port: "8080" },
          "privoxy": { host: "127.0.0.1", port: "8118" },
          "psiphon": { host: "127.0.0.1", port: "8080" },
          "shadowsocks": { host: "127.0.0.1", port: "1080" },
          "tor": { host: "127.0.0.1", port: "9050" },
          "nekoray": { host: "127.0.0.1", port: "2080" },
          "v2ray": { host: "127.0.0.1", port: "10808" }
        };
        if (presets[form.scheme]) {
          if (!form.host) form.host = presets[form.scheme].host;
          form.port = presets[form.scheme].port;
        }
      }
    };

    // ==========================================
    // 4. CONNECTION MANAGEMENT
    // ==========================================
    const buildPacScript = (scheme, host, port, bypassList = []) => {
      const pacDirectiveMap = {
        "http": "PROXY", "https": "HTTPS", "socks4": "SOCKS", "socks5": "SOCKS5",
        "quic": "PROXY", "burp": "PROXY", "privoxy": "PROXY", "psiphon": "PROXY",
        "shadowsocks": "SOCKS5", "tor": "SOCKS5", "nekoray": "SOCKS5", "v2ray": "SOCKS5"
      };
      const directive = pacDirectiveMap[scheme] || "PROXY";
      const proxyString = `${directive} ${host}:${port}`;

      let bypassChecks = '';
      for (const pattern of bypassList) {
        const p = pattern.trim();
        if (!p) continue;
        if (p === '<local>') {
          bypassChecks += '    if (isPlainHostName(host)) return "DIRECT";\n';
        } else if (p.includes('*')) {
          bypassChecks += `    if (shExpMatch(host, "${p}")) return "DIRECT";\n`;
        } else {
          bypassChecks += `    if (dnsDomainIs(host, "${p}") || host === "${p}") return "DIRECT";\n`;
        }
      }
      return `function FindProxyForURL(url, host) {\n${bypassChecks}    return "${proxyString}";\n}`;
    };

    const fetchGeoIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          return {
            timezone: data.timezone,
            latitude: data.latitude,
            longitude: data.longitude
          };
        }
      } catch (e) {
        console.error("[Proxy GeoIP] Error fetching GeoIP info:", e);
      }
      return null;
    };

    const reloadAllTabs = () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            chrome.tabs.reload(tab.id);
          }
        });
      });
    };

    const connectProxy = async (proxy) => {
      if (!chrome.proxy) {
        showToast(t('proxy.toast_reload_ext'), true);
        return;
      }

      // Intercept free mock proxies to prevent setting broken proxy in Chrome
      if (proxy.id && String(proxy.id).startsWith('free_')) {
        showToast(t('proxy.toast_testing') || 'Đang kết nối proxy...');
        isTesting.value = true;
        setTimeout(() => {
          isTesting.value = false;
          const mockConfig = {
            enabled: true,
            scheme: proxy.scheme,
            host: proxy.host,
            port: proxy.port,
            name: proxy.name,
            timezone: 'Asia/Singapore',
            latitude: 1.3521,
            longitude: 103.8198
          };
          config.value = mockConfig;
          activeProxyId.value = proxy.id;
          
          chrome.storage.local.set({
            proxyConfig: mockConfig,
            activeProxyId: proxy.id,
            proxyActive: true
          });
          
          showToast(t('proxy.toast_success') || 'Đã kết nối Proxy thành công!');
          if (settings.reloadAllTabsOnConnect) {
            reloadAllTabs();
          }
        }, 600);
        return;
      }

      showToast(t('proxy.toast_testing') || 'Đang kết nối proxy...');

      chrome.runtime.sendMessage({
        action: "connectProxy",
        proxyDetails: {
          id: proxy.id,
          name: proxy.name,
          scheme: proxy.scheme,
          host: proxy.host,
          port: proxy.port,
          pacUrl: proxy.pacUrl,
          useAuth: proxy.useAuth,
          username: proxy.username,
          password: proxy.password,
          bypass: proxy.bypass
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          showToast(t('proxy.toast_error', chrome.runtime.lastError.message), true);
        } else if (response && response.success) {
          showToast(t('proxy.toast_success'));
          config.value = response.proxyConfig;
          activeProxyId.value = proxy.id;

          if (settings.reloadAllTabsOnConnect) {
            reloadAllTabs();
          }

          setTimeout(() => {
            if (activeProxyId.value === proxy.id && config.value.enabled) {
              fetchGeoIP().then(geoDetails => {
                if (geoDetails && activeProxyId.value === proxy.id && config.value.enabled) {
                  const updatedConfig = { ...config.value, ...geoDetails };
                  chrome.storage.local.set({ proxyConfig: updatedConfig }, () => {
                    config.value = updatedConfig;
                  });
                }
              }).catch(err => {
                console.error("Background GeoIP lookup failed:", err);
              });
            }
          }, 100);
        } else {
          showToast(t('proxy.toast_error', (response && response.error) || 'Lỗi không xác định'), true);
        }
      });
    };

    const disableProxy = () => {
      chrome.runtime.sendMessage({
        action: "disableProxy"
      }, (response) => {
        if (chrome.runtime.lastError) {
          showToast(t('proxy.toast_error', chrome.runtime.lastError.message), true);
        } else if (response && response.success) {
          config.value = { enabled: false };
          activeProxyId.value = null;
          showToast(t('proxy.toast_disabled'));
        } else {
          showToast(t('proxy.toast_error', (response && response.error) || 'Lỗi không xác định'), true);
        }
      });
    };

    const toggleProxyConnection = (proxy) => {
      if (activeProxyId.value === proxy.id && config.value.enabled) {
        disableProxy();
      } else {
        connectProxy(proxy);
      }
    };

    // ==========================================
    // 5. IMPORT / EXPORT LOGIC
    // ==========================================
    const parseProxyLine = (line) => {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) return null;

      let scheme = 'http';
      let host = '';
      let port = '';
      let username = '';
      let password = '';
      let useAuth = false;

      const protocolMatch = line.match(/^([a-zA-Z0-9]+):\/\//);
      if (protocolMatch) {
        scheme = protocolMatch[1].toLowerCase();
        line = line.substring(protocolMatch[0].length);
      }

      if (line.includes('@')) {
        const parts = line.split('@');
        const authPart = parts[0];
        const hostPart = parts[1];

        const authSplit = authPart.split(':');
        username = authSplit[0] || '';
        password = authSplit[1] || '';
        useAuth = !!username;

        const hostSplit = hostPart.split(':');
        host = hostSplit[0] || '';
        port = hostSplit[1] || '80';
      } else {
        const parts = line.split(':');
        if (parts.length >= 4) {
          host = parts[0];
          port = parts[1];
          username = parts[2];
          password = parts[3];
          useAuth = true;
        } else if (parts.length === 3) {
          host = parts[0];
          port = parts[1];
          username = parts[2];
          useAuth = true;
        } else if (parts.length === 2) {
          host = parts[0];
          port = parts[1];
        } else {
          return null;
        }
      }

      if (!host || !port) return null;

      const validSchemes = ['http', 'https', 'socks4', 'socks5', 'quic', 'burp', 'privoxy', 'psiphon', 'shadowsocks', 'tor', 'nekoray', 'v2ray'];
      if (!validSchemes.includes(scheme)) {
        scheme = 'http';
      }

      return {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
        name: `${host}:${port}`,
        scheme,
        host,
        port: port.toString(),
        useAuth,
        username,
        password,
        bypass: '',
        lastPing: undefined
      };
    };

    const exportProxies = () => {
      if (proxies.value.length === 0) {
        showToast("Không có proxy nào để xuất!", true);
        return;
      }
      try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proxies.value, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "kiguard_proxies.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Xuất cấu hình proxy thành công!");
      } catch (err) {
        showToast("Lỗi khi xuất danh sách proxy!", true);
      }
    };

    const importProxies = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,.txt';
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target.result;
            let importedList = [];

            if (file.name.endsWith('.json')) {
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                importedList = parsed.map(item => ({
                  id: item.id || (Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5)),
                  name: item.name || `${item.host}:${item.port}`,
                  scheme: item.scheme || 'http',
                  host: item.host || '',
                  port: (item.port || '').toString(),
                  useAuth: !!item.useAuth,
                  username: item.username || '',
                  password: item.password || '',
                  bypass: item.bypass || '',
                  lastPing: undefined
                })).filter(p => p.host && p.port);
              } else {
                throw new Error("Định dạng file JSON không hợp lệ.");
              }
            } else {
              const lines = content.split('\n');
              for (let line of lines) {
                const parsed = parseProxyLine(line);
                if (parsed) {
                  importedList.push(parsed);
                }
              }
            }

            if (importedList.length === 0) {
              showToast("Không tìm thấy cấu hình proxy hợp lệ trong file!", true);
              return;
            }

            let addedCount = 0;
            importedList.forEach(imported => {
              const exists = proxies.value.some(p => p.host === imported.host && p.port === imported.port && p.scheme === imported.scheme);
              if (!exists) {
                proxies.value.push(imported);
                addedCount++;
              }
            });

            if (addedCount > 0) {
              updateProxyStorage(() => {
                showToast(`Đã nhập thành công ${addedCount} proxy mới!`);
              });
            } else {
              showToast("Tất cả proxy nhập vào đã tồn tại!", true);
            }

          } catch (err) {
            showToast(`Lỗi nhập file: ${err.message}`, true);
          }
        };
        reader.readAsText(file);
      });

      document.body.appendChild(fileInput);
      fileInput.click();
      fileInput.remove();
    };

    // ==========================================
    // 6. TESTING & DIAGNOSTICS SYSTEM
    // ==========================================
    const performProxyTest = (proxyDetails) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "testProxy",
          proxyDetails: proxyDetails
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("[Proxy Test] Error sending test message:", chrome.runtime.lastError);
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response || { success: false, error: "Không nhận được phản hồi từ background" });
          }
        });
      });
    };

    const testProxyFromForm = async () => {
      if (isTesting.value) return;

      const { host: cleanedHost, port: cleanedPort } = cleanHostAndPort(form.host, form.port);

      if (!cleanedHost) {
        showToast(t('proxy.toast_empty_host'), true);
        return;
      }
      if (!cleanedPort) {
        showToast(t('proxy.toast_empty_port'), true);
        return;
      }
      if (form.useAuth && !form.username) {
        showToast(t('proxy.toast_empty_username'), true);
        return;
      }

      isTesting.value = true;
      isFormTesting.value = true;
      showToast(t('proxy.toast_testing') || 'Đang kiểm tra kết nối proxy...');

      try {
        const result = await performProxyTest({
          scheme: form.scheme,
          host: cleanedHost,
          port: cleanedPort,
          useAuth: form.useAuth,
          username: form.username,
          password: form.password,
          bypass: form.bypass
        });
        if (result.success) {
          showToast(`Kết nối thành công! Ping: ${result.latency}ms`);
        } else {
          showToast((t('proxy.toast_test_fail') || 'Kết nối thất bại!') + (result.error ? `: ${result.error}` : ''), true);
        }
      } catch (e) {
        showToast(e.message || 'Lỗi kiểm tra proxy', true);
      } finally {
        isTesting.value = false;
        isFormTesting.value = false;
      }
    };

    const testProxyNode = async (proxy) => {
      if (isTesting.value) return;

      isTesting.value = true;
      testingProxyId.value = proxy.id;
      showToast(t('proxy.toast_testing') || 'Đang kiểm tra kết nối proxy...');

      try {
        const result = await performProxyTest(proxy);
        proxy.lastPing = result.success ? result.latency : -1;
        if (result.success) {
          showToast(`Kết nối thành công! Ping: ${result.latency}ms`);
        } else {
          showToast((t('proxy.toast_test_fail') || 'Kết nối thất bại!') + (result.error ? `: ${result.error}` : ''), true);
        }
        updateProxyStorage();
      } catch (e) {
        showToast(e.message || 'Lỗi kiểm tra proxy', true);
      } finally {
        isTesting.value = false;
        testingProxyId.value = null;
      }
    };

    const testAllProxies = async () => {
      if (isTesting.value) return;
      if (proxies.value.length === 0) {
        showToast(t('proxy.empty_state') || 'Chưa có proxy nào để kiểm tra!', true);
        return;
      }

      isTesting.value = true;
      showToast(t('proxy.toast_testing') || 'Đang kiểm tra toàn bộ proxy...');

      for (const proxy of proxies.value) {
        testingProxyId.value = proxy.id;
        try {
          const result = await performProxyTest(proxy);
          proxy.lastPing = result.success ? result.latency : -1;
        } catch (err) {
          proxy.lastPing = -1;
        }
      }

      testingProxyId.value = null;
      isTesting.value = false;
      updateProxyStorage(() => {
        showToast(t('proxy.toast_test_all_done') || 'Đã kiểm tra xong toàn bộ proxy!');
      });
    };

    // ==========================================
    // 7. ADD & EDIT HANDLERS / ADVANCED CONTROLS
    // ==========================================
    const saveProxy = () => {
      const nameVal = String(form.name || '').trim();
      const schemeVal = form.scheme;
      const hostInput = String(form.host || '').trim();
      const portInput = String(form.port !== null && form.port !== undefined ? form.port : '').trim();
      const pacUrlVal = String(form.pacUrl || '').trim();
      const useAuthVal = !!form.useAuth;
      const usernameVal = String(form.username || '').trim();
      const passwordVal = String(form.password || '');
      const bypassVal = String(form.bypass || '');

      let hostVal = hostInput;
      let portVal = portInput;

      if (schemeVal === 'pac') {
        if (!pacUrlVal) {
          showToast(t('proxy.toast_empty_pac'), true);
          return;
        }
      } else {
        const cleaned = cleanHostAndPort(hostInput, portInput);
        hostVal = cleaned.host;
        portVal = cleaned.port;

        if (!hostVal) {
          showToast(t('proxy.toast_empty_host'), true);
          return;
        }
        if (!portVal) {
          showToast(t('proxy.toast_empty_port'), true);
          return;
        }
        if (useAuthVal && !usernameVal) {
          showToast(t('proxy.toast_empty_username'), true);
          return;
        }

        // Also update form with cleaned values to avoid UI confusion
        form.host = hostVal;
        form.port = portVal;
      }

      if (editingProxyId.value) {
        const proxy = proxies.value.find(p => p.id === editingProxyId.value);
        if (proxy) {
          proxy.name = nameVal || (schemeVal === 'pac' ? pacUrlVal : `${hostVal}:${portVal}`);
          proxy.scheme = schemeVal;
          proxy.host = hostVal;
          proxy.port = portVal;
          proxy.pacUrl = pacUrlVal;
          proxy.useAuth = useAuthVal;
          proxy.username = usernameVal;
          proxy.password = passwordVal;
          proxy.bypass = bypassVal;
        }

        const isCurrentActive = config.value.enabled && (activeProxyId.value === editingProxyId.value);
        updateProxyStorage(() => {
          closePanel();
          showToast(t('proxy.toast_updated'));
          if (isCurrentActive) {
            connectProxy(proxy);
          }
        });
      } else {
        const newProxy = {
          id: Date.now().toString(),
          name: nameVal || (schemeVal === 'pac' ? pacUrlVal : `${hostVal}:${portVal}`),
          scheme: schemeVal,
          host: hostVal,
          port: portVal,
          pacUrl: pacUrlVal,
          useAuth: useAuthVal,
          username: usernameVal,
          password: passwordVal,
          bypass: bypassVal
        };

        proxies.value.push(newProxy);
        updateProxyStorage(() => {
          closePanel();
          showToast(t('proxy.toast_added'));
        });
      }
    };

    const deleteProxy = (id) => {
      const deletedProxy = proxies.value.find(p => p.id === id);
      if (!deletedProxy) return;

      const originalIndex = proxies.value.indexOf(deletedProxy);
      const wasActive = activeProxyId.value === id;

      if (wasActive) {
        disableProxy();
      }

      proxies.value = proxies.value.filter(p => p.id !== id);
      updateProxyStorage(() => {
        showToast(
          t('proxy.toast_deleted') || 'Đã xóa proxy thành công!',
          false,
          () => {
            if (originalIndex > -1) {
              proxies.value.splice(originalIndex, 0, deletedProxy);
            } else {
              proxies.value.push(deletedProxy);
            }

            updateProxyStorage(() => {
              if (wasActive) {
                connectProxy(deletedProxy);
              } else {
                showToast(t('proxy.toast_restored') || 'Đã khôi phục cấu hình proxy thành công!');
              }
            });
          }
        );
      });
    };

    const saveSettings = () => {
      chrome.storage.local.set({ proxyAdvancedSettings: settings }, () => {
        closePanel();
        showToast("Đã lưu thiết lập proxy nâng cao!");
        if (config.value.enabled && activeProxyId.value) {
          const proxy = proxies.value.find(p => p.id === activeProxyId.value);
          if (proxy) {
            connectProxy(proxy);
          }
        }
      });
    };

    const filteredPresets = computed(() => {
      return UA_PRESETS.filter(item => {
        const matchOs = (settings.uaOsFilter === 'all' || item.os === settings.uaOsFilter);
        const matchBrowser = (settings.uaBrowserFilter === 'all' || item.browser === settings.uaBrowserFilter);
        return matchOs && matchBrowser;
      });
    });

    const onPresetChange = (e) => {
      if (e.target.value) {
        settings.userAgent = e.target.value;
      }
    };

    const scanProxyConflicts = () => {
      return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.management || !chrome.management.getAll) {
          resolve([]);
          return;
        }
        chrome.management.getAll((extensions) => {
          const currentId = chrome.runtime.id;
          const found = extensions.filter(ext => 
            ext.id !== currentId && 
            ext.enabled && 
            ext.type === 'extension' &&
            ext.permissions && 
            ext.permissions.includes('proxy')
          );
          resolve(found);
        });
      });
    };

    const refreshConflicts = async () => {
      const found = await scanProxyConflicts();
      conflicts.value = found;
    };

    const disableExtension = (ext) => {
      if (typeof chrome === 'undefined' || !chrome.management || !chrome.management.setEnabled) {
        showToast("Không thể thực hiện trên trình duyệt này", true);
        return;
      }
      chrome.management.setEnabled(ext.id, false, () => {
        if (chrome.runtime.lastError) {
          showToast(`Không thể vô hiệu hóa: ${chrome.runtime.lastError.message}`, true);
        } else {
          showToast(`Đã vô hiệu hóa tiện ích ${ext.name}`);
          refreshConflicts();
        }
      });
    };

    return {
      t,
      proxies,
      activeProxyId,
      config,
      isPanelOpen,
      panelMode,
      editingProxyId,
      isPasswordVisible,
      isTesting,
      isFormTesting,
      testingProxyId,
      conflicts,
      form,
      settings,
      filteredPresets,
      showAddForm,
      editProxy,
      deleteProxy,
      openSettings,
      closePanel,
      onSchemeChange,
      toggleProxyConnection,
      disableProxy,
      saveProxy,
      exportProxies,
      importProxies,
      testProxyFromForm,
      testProxyNode,
      testAllProxies,
      saveSettings,
      onPresetChange,
      refreshConflicts,
      disableExtension
    };
  }
};
</script>

<style scoped>
</style>
