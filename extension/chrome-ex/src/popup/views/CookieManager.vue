<template>
  <div class="cookie-container" style="height: 100%; display: flex; flex-direction: column; gap: 4px;">

    <!-- Profile Cookie Top Selector -->
    <div v-if="!isSystemPage && currentDomain && !activePanel" class="cookie-profile-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 4px; flex-shrink: 0; font-size: 11px;">
      <div style="display: flex; align-items: center; gap: 4px; overflow: hidden; flex-grow: 1; min-width: 0; margin-right: 6px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" style="color: var(--primary-blue); flex-shrink: 0;">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span style="color: var(--text-muted); font-size: 10px; white-space: nowrap; flex-shrink: 0;">Profile:</span>
        <span style="font-weight: 700; color: var(--text-title); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 11px; max-width: 110px;" :title="activeProfileName || 'Mặc định'">
          {{ activeProfileName || 'Mặc định' }}
        </span>
        <button 
          v-if="activeProfileId"
          @click="resetToDefaultProfile"
          style="background: none; border: none; padding: 1px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; flex-shrink: 0; margin-left: 2px;"
          title="Quay về phiên mặc định"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="8" height="8">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Only Manage Profiles button is needed since importing auto-saves profiles -->
      <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
        <button 
          @click="toggleProfilesPanel"
          style="background: var(--primary-blue); border: 1px solid transparent; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 3px; height: 22px; padding: 0 6px; font-size: 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s; outline: none; flex-shrink: 0; white-space: nowrap; width: auto !important;"
          class="cookie-action-btn primary"
          title="Quản lý các Profile đã lưu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="10" height="10" style="flex-shrink: 0;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <span style="font-size: 10px; font-weight: 500; white-space: nowrap; line-height: 1;">Quản lý</span>
        </button>
      </div>
    </div>

    <!-- Body Section containing Lists and Overlays -->
    <div class="cookie-body" style="position: relative; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;">
      
      <!-- COOKIE LIST VIEW -->
      <div v-if="!activePanel" class="cookie-list" style="flex-grow: 1; overflow-y: auto;">
        <div v-if="isSystemPage" class="empty-state" style="padding: 40px 10px; text-align: center; color: var(--text-muted);">
          {{ t('cookie.system_page_error') }}
        </div>
        <div v-else-if="!currentDomain" class="empty-state" style="padding: 40px 10px; text-align: center; color: var(--text-muted);">
          {{ t('cookie.no_active_tab') }}
        </div>
        <div v-else-if="cookies.length === 0" class="empty-state" style="padding: 30px 0; text-align: center; color: var(--text-muted);">
          {{ t('cookie.no_cookies_found') }}
        </div>
        
        <div 
          v-else 
          v-for="cookie in cookies" 
          :key="cookie.name + cookie.domain + cookie.path"
          class="cookie-item"
          @click="showEditForm(cookie)"
        >
          <div class="cookie-item-main">
            <div class="cookie-item-title-row">
              <span class="cookie-item-name" :title="cookie.name">{{ cookie.name }}</span>
              <div class="cookie-item-badges">
                <span v-if="cookie.hostOnly" class="cookie-flag-badge host">HostOnly</span>
                <span v-if="cookie.httpOnly" class="cookie-flag-badge http">HttpOnly</span>
                <span v-if="cookie.secure" class="cookie-flag-badge secure">Secure</span>
                <span v-if="cookie.session" class="cookie-flag-badge session">Session</span>
                <span v-else-if="cookie.expirationDate" class="cookie-flag-badge expiry" :title="t('cookie.expiry_label') + ': ' + formatFullDate(cookie.expirationDate)">
                  {{ formatDate(cookie.expirationDate) }}
                </span>
              </div>
            </div>
            <span class="cookie-item-value" :title="cookie.value">{{ previewValue(cookie.value) }}</span>
          </div>
          
          <div class="cookie-item-actions">
            <button class="cookie-item-btn copy-btn" @click.stop="copyCookieValue(cookie.value)" :title="t('cookie.tooltip_copy')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="cookie-item-btn edit-btn" @click.stop="showEditForm(cookie)" :title="t('cookie.tooltip_edit')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="cookie-item-btn delete-btn danger" @click.stop="deleteCookie(cookie)" :title="t('cookie.tooltip_delete')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- FORM ADD / EDIT PANEL -->
      <div 
        v-if="activePanel === 'form'" 
        class="cookie-form-panel" 
        style="display: flex; animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">
              {{ isEditing ? t('cookie.form_title_edit') : t('cookie.form_title_add') }}
            </h3>
            <button @click="showFieldsInfo" :title="t('cookie.tooltip_fields_info')" style="background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; outline: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="cookie-form-scroll" style="flex-grow: 1; overflow-y: auto;">
          <div class="cookie-form-row">
            <div class="cookie-form-group">
              <label class="cookie-form-label">{{ t('cookie.form_name') }}</label>
              <input type="text" v-model="form.name" :disabled="isEditing" class="cookie-form-input" placeholder="c_user">
            </div>
            <div class="cookie-form-group">
              <label class="cookie-form-label">{{ t('cookie.form_value') }}</label>
              <input type="text" v-model="form.value" class="cookie-form-input" :placeholder="t('cookie.placeholder_value')">
            </div>
          </div>
          <div class="cookie-form-row">
            <div class="cookie-form-group">
              <label class="cookie-form-label">{{ t('cookie.form_domain') }}</label>
              <input type="text" v-model="form.domain" class="cookie-form-input" placeholder=".facebook.com">
            </div>
            <div class="cookie-form-group">
              <label class="cookie-form-label">{{ t('cookie.form_path') }}</label>
              <input type="text" v-model="form.path" class="cookie-form-input">
            </div>
          </div>
          <div class="cookie-form-row">
            <div class="cookie-form-group">
              <label class="cookie-form-label">{{ t('cookie.form_expiry') }}</label>
              <input type="number" v-model="form.expiry" :disabled="form.session" class="cookie-form-input" placeholder="Timestamp">
            </div>
            <div class="cookie-form-group">
              <label class="cookie-form-label">SameSite</label>
              <select v-model="form.sameSite" class="cookie-form-input">
                <option value="unspecified">Unspecified</option>
                <option value="no_restriction">None</option>
                <option value="lax">Lax</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </div>
          <div class="cookie-form-checkboxes" style="padding: 6px 8px; gap: 8px;">
            <label class="cookie-checkbox-label" style="font-size: 9px;">
              <input type="checkbox" v-model="form.secure"> Secure
            </label>
            <label class="cookie-checkbox-label" style="font-size: 9px;">
              <input type="checkbox" v-model="form.httpOnly"> HttpOnly
            </label>
            <label class="cookie-checkbox-label" style="font-size: 9px;">
              <input type="checkbox" v-model="form.session" @change="onSessionChange"> Session
            </label>
          </div>
        </div>
      </div>

      <!-- FIELDS INFO PANEL -->
      <div 
        v-if="activePanel === 'fields-info'" 
        class="cookie-form-panel" 
        style="display: flex; padding: 8px 10px; z-index: 30; flex-direction: column;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 8px;">
          <h3 class="cookie-panel-title" style="font-size: 13px; margin: 0; border: none; padding: 0; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" style="color: var(--primary-blue);">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{{ t('cookie.fields_info_title') }}</span>
          </h3>
          <button class="cookie-btn cancel" @click="closeFieldsInfo" style="height: 20px; font-size: 10px; padding: 0 8px; margin: 0;">{{ t('cookie.btn_close') }}</button>
        </div>
        <div class="cookie-form-scroll" style="font-size: 11px; line-height: 1.6; color: var(--text-desc); gap: 12px; padding-right: 4px;">
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_name_val_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_name_val_desc') }}</p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_domain_path_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_domain_path_desc') }}</p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_expiry_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_expiry_desc') }}</p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_samesite_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;" v-html="t('cookie.info_samesite_desc')"></p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_secure_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_secure_desc') }}</p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_httponly_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_httponly_desc') }}</p>
          </div>
          <div>
            <strong style="color: #ffffff; font-size: 11.5px;">{{ t('cookie.info_session_title') }}</strong>
            <p style="margin: 2px 0 0 0; font-size: 10.5px;">{{ t('cookie.info_session_desc') }}</p>
          </div>
        </div>
      </div>

      <!-- IMPORT PANEL -->
      <div 
        v-if="activePanel === 'import'" 
        class="cookie-form-panel" 
        style="display: flex; animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">{{ t('cookie.import_title') }}</h3>
            <button @click="showFormatInfo" :title="t('cookie.tooltip_format_info')" style="background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; outline: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
          </div>
          <label for="cookie-upload-file-vue" class="cookie-btn" style="height: 20px; font-size: 9px; padding: 0 8px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; margin: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="17"></line>
            </svg>
            <span>{{ t('cookie.import_select_file') }}</span>
          </label>
          <input type="file" id="cookie-upload-file-vue" accept=".json,.txt" @change="onFileUpload" style="display: none;">
        </div>
        <p class="cookie-panel-desc" style="font-size: 9px; margin-bottom: 6px;">{{ t('cookie.import_desc') }}</p>
        
        <!-- Decryption Password field, only visible if ciphertext prefix detected -->
        <div v-if="isImportEncrypted" class="cookie-form-group" style="margin-bottom: 8px;">
          <label class="cookie-form-label" style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10" style="color: var(--primary-blue);">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>{{ t('cookie.import_password_label') }}</span>
          </label>
          <div style="position: relative; display: flex; align-items: center;">
            <input 
              :type="showImportPassword ? 'text' : 'password'" 
              v-model="importPassword" 
              class="cookie-form-input" 
              :placeholder="t('cookie.import_password_placeholder')" 
              style="height: 28px; font-size: 10px; width: 100%; padding-left: 28px; padding-right: 28px; box-sizing: border-box;"
            >
            <span style="position: absolute; left: 10px; color: var(--text-muted); display: flex; align-items: center; pointer-events: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <button type="button" @click="showImportPassword = !showImportPassword" style="position: absolute; right: 8px; background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; border-radius: 4px; transition: color 0.2s;">
              <svg v-if="!showImportPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <textarea 
          v-model="importText" 
          class="cookie-form-textarea" 
          placeholder="JSON:&#10;[{&quot;name&quot;:&quot;Cookie&quot;,&quot;value&quot;:&quot;text&quot;,[...]}]&#10;&#10;Header String:&#10;Cookie=text;Editor=yes&#10;&#10;Netscape:&#10;# Netscape HTTP Cookie File&#10;# [...]&#10;cookie-editor.com[...]	Cookie	text" 
          style="font-size: 9px; margin-bottom: 6px; flex-grow: 1;"
        ></textarea>
      </div>

      <!-- FORMAT INFO PANEL -->
      <div 
        v-if="activePanel === 'format-info'" 
        class="cookie-form-panel" 
        style="display: flex; padding: 8px 10px; z-index: 30; flex-direction: column;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 8px;">
          <h3 class="cookie-panel-title" style="font-size: 13px; margin: 0; border: none; padding: 0; display: flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="color: var(--primary-blue);">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{{ t('cookie.format_info_title') }}</span>
          </h3>
          <button class="cookie-btn cancel" @click="closeFormatInfo" style="height: 20px; font-size: 10px; padding: 0 8px; margin: 0;">{{ t('cookie.btn_close') }}</button>
        </div>
        <div class="cookie-form-scroll" style="font-size: 11px; line-height: 1.5; color: var(--text-desc); gap: 10px;">
          <div>
            <strong style="color: #ffffff; display: block; margin-bottom: 2px; font-size: 11.5px;">{{ t('cookie.format_json_title') }}</strong>
            <p style="margin: 0 0 4px 0; font-size: 10.5px;">{{ t('cookie.format_json_desc') }}</p>
            <pre style="background: var(--bg-input); padding: 4px 6px; border-radius: 4px; font-size: 9px; margin: 0; overflow-x: auto; color: var(--text-muted); font-family: monospace;">[
  {
    "name": "c_user",
    "value": "100000000000000",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false
  }
]</pre>
          </div>
          <div>
            <strong style="color: #ffffff; display: block; margin-bottom: 2px; font-size: 11.5px;">{{ t('cookie.format_header_title') }}</strong>
            <p style="margin: 0 0 4px 0; font-size: 10.5px;">{{ t('cookie.format_header_desc') }}</p>
            <pre style="background: var(--bg-input); padding: 4px 6px; border-radius: 4px; font-size: 9px; margin: 0; overflow-x: auto; color: var(--text-muted); font-family: monospace;">c_user=100000000000000; xs=12345:abcde:2:1600000000;</pre>
          </div>
          <div>
            <strong style="color: #ffffff; display: block; margin-bottom: 2px; font-size: 11.5px;">{{ t('cookie.format_netscape_title') }}</strong>
            <p style="margin: 0 0 4px 0; font-size: 10.5px;">{{ t('cookie.format_netscape_desc') }}</p>
            <pre style="background: var(--bg-input); padding: 4px 6px; border-radius: 4px; font-size: 9px; margin: 0; overflow-x: auto; color: var(--text-muted); font-family: monospace;">.facebook.com   TRUE    /   TRUE    0   c_user  10000000000</pre>
          </div>
        </div>
      </div>

      <!-- EXPORT PANEL -->
      <div 
        v-if="activePanel === 'export'" 
        class="cookie-form-panel" 
        style="display: flex; animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 4px;">
          <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">{{ t('cookie.export_title') }}</h3>
          <select v-model="exportFormat" @change="updateExportText" style="height: 22px; font-size: 9px; padding: 2px 4px; border: 1px solid var(--border-light); border-radius: 4px; background-color: var(--bg-input); color: var(--text-title); outline: none;">
            <option value="json">Format: JSON</option>
            <option value="header">Format: Header String</option>
            <option value="netscape">Format: Netscape</option>
          </select>
        </div>
        
        <textarea :value="exportText" class="cookie-form-textarea" readonly style="font-size: 9px; margin-bottom: 6px; flex-grow: 1;"></textarea>

        <!-- Toggle Switch to use Encryption -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; background-color: var(--bg-card); padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-light); flex-shrink: 0;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-title);">{{ t('cookie.export_encrypt_title') }}</span>
            <span style="font-size: 10px; color: var(--text-muted);">{{ t('cookie.export_encrypt_desc') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="exportUseEncryption" @change="onExportEncryptionChange">
            <span class="slider round"></span>
          </label>
        </div>

        <div v-if="exportUseEncryption" style="display: flex; margin-bottom: 8px; flex-direction: column; flex-shrink: 0;">
          <div style="position: relative; display: flex; align-items: center;">
            <input 
              :type="showExportPassword ? 'text' : 'password'" 
              v-model="exportPassword" 
              @input="updateExportText" 
              class="cookie-form-input" 
              :placeholder="t('cookie.export_encrypt_placeholder')" 
              style="height: 28px; font-size: 10px; width: 100%; padding-left: 28px; padding-right: 28px; box-sizing: border-box;"
            >
            <span style="position: absolute; left: 10px; color: var(--text-muted); display: flex; align-items: center; pointer-events: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <button type="button" @click="showExportPassword = !showExportPassword" style="position: absolute; right: 8px; background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; border-radius: 4px; transition: color 0.2s;">
              <svg v-if="!showExportPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- SAVE PROFILE PANEL -->
      <div 
        v-if="activePanel === 'save-profile'" 
        class="cookie-form-panel" 
        style="display: flex; animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 8px;">
          <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0;">Lưu Profile Cookie</h3>
          <button 
            @click="closePanel" 
            style="background: none; border: none; padding: 4px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; border-radius: 4px; transition: all 0.2s; margin: 0;"
            title="Đóng"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px; text-align: left;">
          <p class="cookie-panel-desc" style="font-size: 10px; margin-bottom: 4px; line-height: 1.4;">
            Lưu toàn bộ <strong>{{ cookies.length }}</strong> cookie của tên miền <strong>{{ currentDomain }}</strong> thành một profile riêng biệt để có thể khôi phục hoặc chuyển đổi sau này.
          </p>
          
          <div class="cookie-form-group">
            <label class="cookie-form-label">Tên Profile</label>
            <input 
              type="text" 
              v-model="newProfileName" 
              class="cookie-form-input" 
              placeholder="Ví dụ: Tài khoản phụ 1, Nick clone, v.v..."
              style="height: 32px; font-size: 11px; padding: 6px; box-sizing: border-box;"
            >
          </div>
          
          <div class="cookie-form-group" style="margin-top: 4px;">
            <label class="cookie-checkbox-label" style="font-size: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;">
              <input type="checkbox" v-model="saveProfileIncludeSession" style="margin: 0;">
              <span>Lưu cả session cookie (khuyên dùng)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- SHARE PROFILE MODAL OVERLAY -->
      <div 
        v-if="activePanel === 'share-profile'" 
        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; backdrop-filter: blur(0.5px);"
        @click.self="activePanel = 'profiles'"
      >
        <div 
          style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 6px; padding: 12px; width: 100%; max-width: 280px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); animation: zoomIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-sizing: border-box;"
        >
          <!-- Title row -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 2px; text-align: left;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-title); display: flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11" style="color: var(--primary-blue); flex-shrink: 0;">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Chia sẻ Profile
            </span>
            <button 
              @click="activePanel = 'profiles'" 
              style="background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; transition: color 0.2s;"
              title="Quay lại danh sách"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="12" height="12">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Profile Info Card -->
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 4px; padding: 6px 8px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; text-align: left; box-sizing: border-box;">
            <span style="font-weight: 600; color: var(--text-title); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 150px;" :title="sharingProfileName">
              {{ sharingProfileName }}
            </span>
            <span style="color: var(--text-muted); font-size: 9px; flex-shrink: 0;">{{ sharingProfileCookiesCount }} cookies</span>
          </div>

          <!-- Access Type Select -->
          <div style="display: flex; flex-direction: column; gap: 3px; text-align: left;">
            <span style="font-size: 9.5px; color: var(--text-muted); font-weight: 600;">Quyền truy cập chung</span>
            <select 
              v-model="shareAccessType" 
              style="height: 26px; font-size: 10px; padding: 2px 6px; background-color: var(--bg-input); border: 1px solid var(--border-light); border-radius: 4px; color: var(--text-title); width: 100%; outline: none;"
            >
              <option value="public">🌍 Mọi người có liên kết</option>
              <option value="private">🔒 Hạn chế (Yêu cầu mật khẩu)</option>
            </select>
          </div>

          <!-- Password Field if Private -->
          <div v-if="shareAccessType === 'private'" style="display: flex; flex-direction: column; gap: 3px; text-align: left; animation: fadeIn 0.15s ease-in-out;">
            <span style="font-size: 9.5px; color: var(--text-muted); font-weight: 600;">Cài đặt mật khẩu</span>
            <div style="position: relative; display: flex; align-items: center;">
              <input 
                :type="showSharePassword ? 'text' : 'password'" 
                v-model="sharePassword" 
                placeholder="Nhập mật khẩu truy cập"
                style="height: 26px; font-size: 10px; padding: 4px 24px 4px 6px; box-sizing: border-box; width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-light); border-radius: 4px; color: white; outline: none;"
              >
              <button type="button" @click="showSharePassword = !showSharePassword" style="position: absolute; right: 6px; background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;">
                <svg v-if="!showSharePassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Buttons -->
          <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px;">
            <button 
              @click="activePanel = 'profiles'" 
              style="height: 24px; padding: 0 10px; font-size: 10px; border-radius: 4px; border: 1px solid var(--border-light); background: transparent; color: var(--text-title); cursor: pointer; outline: none;"
            >
              Hủy
            </button>
            <button 
              @click="submitShareProfile" 
              style="height: 24px; padding: 0 10px; font-size: 10px; border-radius: 4px; border: 1px solid transparent; background: var(--primary-blue); color: white; cursor: pointer; font-weight: 600; outline: none;"
            >
              Chia sẻ
            </button>
          </div>
        </div>
      </div>

      <!-- PROFILES LIST PANEL -->
      <div 
        v-if="activePanel === 'profiles'" 
        class="cookie-form-panel" 
        style="display: flex; animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; height: 100%;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; margin-bottom: 8px;">
          <h3 class="cookie-panel-title" style="font-size: 12px; margin: 0; border: none; padding: 0; display: flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="color: var(--primary-blue);">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span>Quản lý Profiles ({{ profileTab === 'current' ? savedProfiles.length : allProfiles.length }})</span>
          </h3>
          <button 
            @click="closePanel" 
            style="background: none; border: none; padding: 4px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none; border-radius: 4px; transition: all 0.2s; margin: 0;"
            title="Đóng"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div style="display: flex; background: rgba(0, 0, 0, 0.2); border-radius: 6px; padding: 2px; margin-bottom: 8px;">
          <button 
            @click="profileTab = 'current'"
            style="flex: 1; border: none; background: none; padding: 4px 0; font-size: 10px; border-radius: 4px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 4px;"
            :style="{ background: profileTab === 'current' ? 'var(--primary-blue)' : 'transparent', color: profileTab === 'current' ? 'white' : 'var(--text-muted)', fontWeight: profileTab === 'current' ? '700' : '500' }"
          >
            <span>Trang hiện tại ({{ savedProfiles.length }})</span>
          </button>
          <button 
            @click="profileTab = 'all'"
            style="flex: 1; border: none; background: none; padding: 4px 0; font-size: 10px; border-radius: 4px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 4px;"
            :style="{ background: profileTab === 'all' ? 'var(--primary-blue)' : 'transparent', color: profileTab === 'all' ? 'white' : 'var(--text-muted)', fontWeight: profileTab === 'all' ? '700' : '500' }"
          >
            <span>Tất cả trang ({{ allProfiles.length }})</span>
          </button>
        </div>
        
        <p class="cookie-panel-desc" style="font-size: 10px; margin-bottom: 8px; line-height: 1.4; text-align: left;">
          <template v-if="profileTab === 'current'">
            Danh sách profile đã lưu cho trang <strong>{{ currentDomain }}</strong>. Bấm "Sử dụng" để chuyển đổi cookie tức thì.
          </template>
          <template v-else>
            Tất cả profile cookie đã lưu của các trang web. Bấm "Sử dụng" để chuyển đổi cookie cho trang đó.
          </template>
        </p>

        <!-- Profiles Scroll List -->
        <div class="cookie-form-scroll" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; max-height: 230px;">
          <!-- CURRENT TAB -->
          <template v-if="profileTab === 'current'">
            <div v-if="savedProfiles.length === 0" style="padding: 20px 0; text-align: center; color: var(--text-muted); font-size: 11px;">
              Chưa có profile nào được lưu cho tên miền này.
            </div>
            
            <div 
              v-else
              v-for="profile in savedProfiles" 
              :key="profile.id"
              style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 6px; transition: border-color 0.2s;"
              :style="{ borderColor: activeProfileId === profile.id ? 'var(--primary-blue)' : 'var(--border-light)' }"
            >
              <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex-grow: 1; margin-right: 8px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-weight: 700; color: var(--text-title); font-size: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" :title="profile.name">
                    {{ profile.name }}
                  </span>
                  <span v-if="activeProfileId === profile.id" style="font-size: 8px; background: rgba(59, 130, 246, 0.15); color: var(--primary-blue); padding: 1px 4px; border-radius: 4px; font-weight: 850; line-height: 1; flex-shrink: 0;">
                    ĐANG DÙNG
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; font-size: 9px; color: var(--text-muted);">
                  <span>{{ profile.cookiesCount }} cookies</span>
                  <span>•</span>
                  <span>{{ formatDate(profile.createdAt / 1000) }}</span>
                </div>
              </div>
              
              <div style="display: flex; gap: 4px; flex-shrink: 0;">
                <button 
                  @click="switchProfile(profile)"
                  :disabled="activeProfileId === profile.id"
                  style="height: 22px; font-size: 9px; padding: 0 8px; border-radius: 4px; border: 1px solid transparent; background: var(--primary-blue); color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 2px; transition: all 0.2s;"
                  :style="{ opacity: activeProfileId === profile.id ? 0.4 : 1, cursor: activeProfileId === profile.id ? 'not-allowed' : 'pointer' }"
                >
                  <span>Sử dụng</span>
                </button>
                <button 
                  @click="shareProfile(profile)"
                  style="height: 22px; width: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border-light); background: rgba(59, 130, 246, 0.1); color: var(--primary-blue); cursor: pointer; transition: all 0.2s;"
                  class="profile-share-btn"
                  title="Chia sẻ profile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button 
                  @click="deleteProfile(profile)"
                  style="height: 22px; width: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border-light); background: rgba(239, 68, 68, 0.1); color: #ef4444; cursor: pointer; transition: all 0.2s;"
                  class="profile-delete-btn"
                  title="Xóa profile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <!-- ALL TAB -->
          <template v-else>
            <div v-if="allProfiles.length === 0" style="padding: 20px 0; text-align: center; color: var(--text-muted); font-size: 11px;">
              Chưa có profile nào được lưu.
            </div>
            
            <div 
              v-else
              v-for="profile in allProfiles" 
              :key="profile.id"
              style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 6px; transition: border-color 0.2s;"
              :style="{ borderColor: activeProfilesMap[profile.domain] === profile.id ? 'var(--primary-blue)' : 'var(--border-light)' }"
            >
              <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex-grow: 1; margin-right: 8px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 4px; overflow: hidden;">
                  <span style="font-weight: 700; color: var(--text-title); font-size: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" :title="profile.name">
                    {{ profile.name }}
                  </span>
                  <span v-if="activeProfilesMap[profile.domain] === profile.id" style="font-size: 8px; background: rgba(59, 130, 246, 0.15); color: var(--primary-blue); padding: 1px 4px; border-radius: 4px; font-weight: 850; line-height: 1; flex-shrink: 0;">
                    ĐANG DÙNG
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 9px; color: var(--primary-blue); font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" :title="profile.domain">
                    {{ profile.domain }}
                  </span>
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; color: var(--text-muted);">
                    <span>{{ profile.cookiesCount }} cookies</span>
                    <span>•</span>
                    <span>{{ formatDate(profile.createdAt / 1000) }}</span>
                  </div>
                </div>
              </div>
              
              <div style="display: flex; gap: 4px; flex-shrink: 0;">
                <button 
                  @click="switchProfile(profile)"
                  :disabled="activeProfilesMap[profile.domain] === profile.id"
                  style="height: 22px; font-size: 9px; padding: 0 8px; border-radius: 4px; border: 1px solid transparent; background: var(--primary-blue); color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 2px; transition: all 0.2s;"
                  :style="{ opacity: activeProfilesMap[profile.domain] === profile.id ? 0.4 : 1, cursor: activeProfilesMap[profile.domain] === profile.id ? 'not-allowed' : 'pointer' }"
                >
                  <span>Sử dụng</span>
                </button>
                <button 
                  @click="shareProfile(profile)"
                  style="height: 22px; width: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border-light); background: rgba(59, 130, 246, 0.1); color: var(--primary-blue); cursor: pointer; transition: all 0.2s;"
                  class="profile-share-btn"
                  title="Chia sẻ profile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button 
                  @click="deleteProfile(profile)"
                  style="height: 22px; width: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border-light); background: rgba(239, 68, 68, 0.1); color: #ef4444; cursor: pointer; transition: all 0.2s;"
                  class="profile-delete-btn"
                  title="Xóa profile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Sticky Footer Actions -->
    <div class="cookie-footer-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border-light); flex-shrink: 0;">
      <span class="cookie-stats-badge" style="font-size: 9px; padding: 2px 8px; background-color: var(--border-light); color: var(--text-desc); border-radius: 6px;">
        {{ t('cookie.stats_count', cookies.length) }}
      </span>
      
      <div style="display: flex; gap: 8px;">
        <!-- Default Cookie Actions (When in main view) -->
        <div v-if="!activePanel" style="display: flex; gap: 6px;">
          <button class="cookie-action-btn primary" @click="showAddForm" :disabled="isSystemPage" :title="t('cookie.btn_add')" style="width: auto; padding: 0 8px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px;" :style="{ opacity: isSystemPage ? 0.4 : 1, cursor: isSystemPage ? 'not-allowed' : 'pointer', pointerEvents: isSystemPage ? 'none' : 'auto' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ t('cookie.btn_add') }}
          </button>
          <button class="cookie-action-btn" @click="showImportForm" :disabled="isSystemPage" :title="t('cookie.btn_import')" style="width: auto; padding: 0 8px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px;" :style="{ opacity: isSystemPage ? 0.4 : 1, cursor: isSystemPage ? 'not-allowed' : 'pointer', pointerEvents: isSystemPage ? 'none' : 'auto' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="17"></line>
            </svg>
            {{ t('cookie.btn_import') }}
          </button>
          <button class="cookie-action-btn" @click="showExportForm" :disabled="isSystemPage" :title="t('cookie.btn_export')" style="width: auto; padding: 0 8px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px;" :style="{ opacity: isSystemPage ? 0.4 : 1, cursor: isSystemPage ? 'not-allowed' : 'pointer', pointerEvents: isSystemPage ? 'none' : 'auto' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ t('cookie.btn_export') }}
          </button>
          <button class="cookie-action-btn danger" @click="confirmClearAll" :disabled="isSystemPage" :title="t('cookie.btn_clear_all')" style="width: auto; padding: 0 8px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px;" :style="{ opacity: isSystemPage ? 0.4 : 1, cursor: isSystemPage ? 'not-allowed' : 'pointer', pointerEvents: isSystemPage ? 'none' : 'auto' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            {{ t('cookie.btn_clear_all') }}
          </button>
          <button class="cookie-action-btn success" @click="reloadCurrentTab" :title="t('cookie.btn_reload')" style="width: auto; padding: 0 8px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            {{ t('cookie.btn_reload') }}
          </button>
        </div>
        
        <!-- Form Add/Edit actions -->
        <div v-if="activePanel === 'form'" style="display: flex; gap: 8px;">
          <button class="cookie-btn cancel" @click="closePanel" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_cancel') }}</button>
          <button class="cookie-btn save" @click="saveCookieForm" style="height: 26px; padding: 0 16px; font-size: 10px;">{{ t('cookie.btn_save') }}</button>
        </div>
        
        <!-- Import actions -->
        <div v-if="activePanel === 'import'" style="display: flex; gap: 8px;">
          <button class="cookie-btn cancel" @click="closePanel" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_cancel') }}</button>
          <button class="cookie-btn save" @click="submitImport" style="height: 26px; padding: 0 16px; font-size: 10px;">{{ t('cookie.btn_import') }}</button>
        </div>
        
        <!-- Export actions -->
        <div v-if="activePanel === 'export'" style="display: flex; gap: 8px;">
          <button class="cookie-btn cancel" @click="closePanel" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_close') }}</button>
          <button class="cookie-btn copy" @click="copyExportToClipboard" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_copy_clipboard') }}</button>
          <button class="cookie-btn save" @click="downloadExportFile" style="height: 26px; padding: 0 16px; font-size: 10px;">{{ t('cookie.btn_download_file') }}</button>
        </div>

        <!-- Save Profile actions -->
        <div v-if="activePanel === 'save-profile'" style="display: flex; gap: 8px;">
          <button class="cookie-btn cancel" @click="closePanel" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_cancel') }}</button>
          <button class="cookie-btn save" @click="submitSaveProfile" style="height: 26px; padding: 0 16px; font-size: 10px;">Lưu Profile</button>
        </div>
        
        <!-- Profiles List actions -->
        <div v-if="activePanel === 'profiles'" style="display: flex; gap: 8px;">
          <button class="cookie-btn cancel" @click="closePanel" style="height: 26px; padding: 0 14px; font-size: 10px;">{{ t('cookie.btn_close') }}</button>
          <button class="cookie-btn save" @click="showSaveProfileDialog" style="height: 26px; padding: 0 16px; font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tạo Mới
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { showToast } from '../../shared/toast.js';
import { CookieParser } from '../utils/CookieParser.js';
import { encryptData } from '../../shared/crypto.js';
import { useI18n } from '../composables/useI18n.js';

export default {
  name: 'CookieManager',
  setup() {
    const { t } = useI18n();
    const cookies = ref([]);
    const currentTab = ref(null);
    const currentDomain = ref('');
    const currentUrl = ref('');
    const isSystemPage = ref(false);
    const activePanel = ref(null); // 'form', 'import', 'export', 'fields-info', 'format-info', 'save-profile', 'profiles'
    const isEditing = ref(false);
    const editingCookie = ref(null);

    // Cookie Profile states
    const savedProfiles = ref([]);
    const activeProfileId = ref('');
    const activeProfileName = computed(() => {
      const p = savedProfiles.value.find(p => p.id === activeProfileId.value);
      return p ? p.name : '';
    });
    const newProfileName = ref('');
    const saveProfileIncludeSession = ref(true);
    const profileTab = ref('current'); // 'current' or 'all'
    const allProfiles = ref([]);
    const activeProfilesMap = ref({});

    // Cookie Share states
    const sharingProfile = ref(null);
    const shareAccessType = ref('public');
    const sharePassword = ref('');
    const showSharePassword = ref(false);
    const sharingProfileName = computed(() => sharingProfile.value ? sharingProfile.value.name : '');
    const sharingProfileCookiesCount = computed(() => sharingProfile.value ? sharingProfile.value.cookiesCount : 0);

    const loadProfiles = (domain) => {
      if (!domain) return;
      const parts = domain.split('.');
      const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

      const keys = [`cookie_profiles_${domain}`, `active_profile_id_${domain}`];
      if (baseDomain !== domain) {
        keys.push(`cookie_profiles_${baseDomain}`);
        keys.push(`active_profile_id_${baseDomain}`);
      }

      chrome.storage.local.get(keys, (res) => {
        const exactProfiles = res[`cookie_profiles_${domain}`] || [];
        const baseProfiles = res[`cookie_profiles_${baseDomain}`] || [];
        
        const mergedProfiles = [...exactProfiles];
        baseProfiles.forEach(p => {
          if (!mergedProfiles.some(mp => mp.id === p.id)) {
            mergedProfiles.push(p);
          }
        });

        savedProfiles.value = mergedProfiles;
        activeProfileId.value = res[`active_profile_id_${domain}`] || res[`active_profile_id_${baseDomain}`] || '';
      });
    };

    const loadAllProfiles = () => {
      chrome.storage.local.get(null, (res) => {
        const all = [];
        const activeMap = {};
        for (const [key, value] of Object.entries(res)) {
          if (key.startsWith('cookie_profiles_') && Array.isArray(value)) {
            const domain = key.substring('cookie_profiles_'.length);
            value.forEach(profile => {
              all.push({
                ...profile,
                domain: domain
              });
            });
          } else if (key.startsWith('active_profile_id_')) {
            const domain = key.substring('active_profile_id_'.length);
            activeMap[domain] = value;
          }
        }
        all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        allProfiles.value = all;
        activeProfilesMap.value = activeMap;
      });
    };

    // Profile Management methods
    const showSaveProfileDialog = () => {
      newProfileName.value = '';
      activePanel.value = 'save-profile';
    };

    const toggleProfilesPanel = () => {
      activePanel.value = 'profiles';
      profileTab.value = 'current';
      loadAllProfiles();
    };

    const submitSaveProfile = () => {
      if (!newProfileName.value.trim()) {
        showToast('Vui lòng nhập tên profile!', true);
        return;
      }
      const domain = currentDomain.value;
      if (!domain) return;

      chrome.cookies.getAll({ url: currentUrl.value }, (cookiesList) => {
        const finalCookies = cookiesList || [];
        const filteredCookies = saveProfileIncludeSession.value 
          ? finalCookies 
          : finalCookies.filter(c => !c.session);
        
        const newProfile = {
          id: Date.now().toString(),
          name: newProfileName.value.trim(),
          cookiesCount: filteredCookies.length,
          cookies: filteredCookies,
          createdAt: Date.now()
        };
        
        savedProfiles.value.push(newProfile);
        
        // Persist to chrome.storage.local
        const storageKey = `cookie_profiles_${domain}`;
        chrome.storage.local.set({ [storageKey]: JSON.parse(JSON.stringify(savedProfiles.value)) }, () => {
          showToast('Đã lưu Profile mới thành công!');
          activePanel.value = 'profiles';
          loadAllProfiles();
        });
      });
    };

    const reloadTabsForDomain = (targetDomain) => {
      setTimeout(() => {
        chrome.tabs.query({}, (tabs) => {
          if (!tabs) return;
          tabs.forEach(tab => {
            if (tab.url) {
              try {
                const urlObj = new URL(tab.url);
                const hostname = urlObj.hostname;
                const baseDomain = targetDomain.startsWith('.') ? targetDomain.substring(1) : targetDomain;
                if (hostname === baseDomain || hostname.endsWith('.' + baseDomain)) {
                  chrome.tabs.reload(tab.id);
                }
              } catch (e) {
                console.error(e);
              }
            }
          });
        });
      }, 2000);
    };

    const switchProfile = (profile) => {
      const domain = profile.domain || currentDomain.value;
      if (!domain) return;

      const isCurrentDomain = domain === currentDomain.value;
      const getOptions = isCurrentDomain 
        ? { url: currentUrl.value }
        : { domain: domain };

      chrome.cookies.getAll(getOptions, (currentCookies) => {
        let clearedCount = 0;
        const totalToClear = currentCookies ? currentCookies.length : 0;
        
        const proceedToRestore = () => {
          const profileCookies = profile.cookies || [];
          const totalToRestore = profileCookies.length;
          
          if (totalToRestore === 0) {
            if (isCurrentDomain) {
              activeProfileId.value = profile.id;
            }
            chrome.storage.local.set({ [`active_profile_id_${domain}`]: profile.id }, () => {
              showToast(`Đã chuyển sang Profile rỗng: ${profile.name}`);
              if (isCurrentDomain) {
                loadCookies();
              } else {
                loadAllProfiles();
              }
              reloadTabsForDomain(domain);
            });
            return;
          }
          
          let restoredCount = 0;
          let errorCount = 0;
          
          profileCookies.forEach(c => {
            const cleanDomain = (c.domain && c.domain.startsWith('.')) ? c.domain.substring(1) : (c.domain || domain);
            const url = (c.secure ? 'https://' : 'http://') + cleanDomain + (c.path || '/');
            
            const setDetails = {
              url,
              name: c.name,
              value: c.value || '',
              path: c.path || '/',
              secure: c.secure !== undefined ? c.secure : false,
              httpOnly: c.httpOnly !== undefined ? c.httpOnly : false
            };
            
            if (c.domain && !c.hostOnly) setDetails.domain = c.domain;
            if (c.sameSite && c.sameSite !== 'unspecified') setDetails.sameSite = c.sameSite;
            if (c.expirationDate && !c.session) setDetails.expirationDate = c.expirationDate;
            if (c.storeId) setDetails.storeId = c.storeId;
            
            chrome.cookies.set(setDetails, () => {
              restoredCount++;
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                errorCount++;
              }
              if (restoredCount === totalToRestore) {
                if (isCurrentDomain) {
                  activeProfileId.value = profile.id;
                }
                chrome.storage.local.set({ [`active_profile_id_${domain}`]: profile.id }, () => {
                  if (errorCount === 0) {
                    showToast(`Đã chuyển đổi sang Profile: ${profile.name}`);
                  } else {
                    showToast(`Đã chuyển đổi thành công ${totalToRestore - errorCount}/${totalToRestore} cookie. Có ${errorCount} lỗi.`, true);
                  }
                  if (isCurrentDomain) {
                    loadCookies();
                  } else {
                    loadAllProfiles();
                  }
                  reloadTabsForDomain(domain);
                });
              }
            });
          });
        };
        
        if (totalToClear === 0) {
          proceedToRestore();
        } else {
          currentCookies.forEach(cookie => {
            const cleanDomain = cookie.domain.replace(/^\./, '');
            const url = (cookie.secure ? 'https://' : 'http://') + cleanDomain + cookie.path;
            
            chrome.cookies.remove({
              url,
              name: cookie.name,
              storeId: cookie.storeId
            }, () => {
              clearedCount++;
              if (clearedCount === totalToClear) {
                proceedToRestore();
              }
            });
          });
        }
      });
    };

    const deleteProfile = (profile) => {
      const domain = profile.domain || currentDomain.value;
      if (!domain) return;

      const parts = domain.split('.');
      const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

      savedProfiles.value = savedProfiles.value.filter(p => p.id !== profile.id);
      allProfiles.value = allProfiles.value.filter(p => p.id !== profile.id);

      chrome.storage.local.get([`cookie_profiles_${domain}`, `cookie_profiles_${baseDomain}`], (res) => {
        const updates = {};
        if (res[`cookie_profiles_${domain}`]) {
          updates[`cookie_profiles_${domain}`] = res[`cookie_profiles_${domain}`].filter(p => p.id !== profile.id);
        }
        if (res[`cookie_profiles_${baseDomain}`]) {
          updates[`cookie_profiles_${baseDomain}`] = res[`cookie_profiles_${baseDomain}`].filter(p => p.id !== profile.id);
        }

        const isCurrentDomain = domain === currentDomain.value || baseDomain === currentDomain.value;
        if (isCurrentDomain && activeProfileId.value === profile.id) {
          activeProfileId.value = '';
          updates[`active_profile_id_${domain}`] = '';
          updates[`active_profile_id_${baseDomain}`] = '';
        }

        chrome.storage.local.set(updates, () => {
          showToast(`Đã xoá profile: ${profile.name}`);
          loadAllProfiles();
        });
      });
    };

    const resetToDefaultProfile = () => {
      const domain = currentDomain.value;
      if (!domain) return;
      activeProfileId.value = '';
      chrome.storage.local.set({ [`active_profile_id_${domain}`]: '' }, () => {
        showToast('Đã quay về phiên mặc định (Default Session)');
      });
    };

    const shareProfile = (profile) => {
      if (!profile || !profile.cookies || profile.cookies.length === 0) {
        showToast('Profile không có cookie để chia sẻ!', true);
        return;
      }
      sharingProfile.value = profile;
      shareAccessType.value = 'public';
      sharePassword.value = '';
      showSharePassword.value = false;
      activePanel.value = 'share-profile';
    };

    const submitShareProfile = async () => {
      const profile = sharingProfile.value;
      if (!profile) return;

      const isPrivate = shareAccessType.value === 'private';
      const passwordVal = isPrivate ? sharePassword.value.trim() : null;

      if (isPrivate && !passwordVal) {
        showToast('Vui lòng nhập mật khẩu cho chế độ hạn chế!', true);
        return;
      }

      showToast('Đang chuẩn bị chia sẻ...');

      try {
        const payload = {
          name: profile.name,
          domain: profile.domain || currentDomain.value,
          cookies: profile.cookies,
          password: passwordVal
        };

        // Gọi API Cloudflare Worker thực tế. Có thể đổi endpoint tùy ý.
        const response = await fetch('https://cookie.kimidev.net/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const shareUrl = data.shareUrl || `https://cookie.kimidev.net/c/${data.id || data.shareId}`;
          await navigator.clipboard.writeText(shareUrl);
          showToast('Đã tạo link và sao chép vào Clipboard!');
          activePanel.value = 'profiles';
        } else {
          throw new Error('Server share cookie erro');
        }
      } catch (err) {
        console.warn('Lỗi kết nối tới Worker, dùng cơ chế mock local:', err);
        const mockShareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const mockShareUrl = `https://cookie.kimidev.net/c/${mockShareId}`;

        // Lưu dữ liệu profile chia sẻ tạm thời kèm mật khẩu bảo vệ vào storage local dạng shared_link_<id>
        const mockData = {
          ...profile,
          password: passwordVal
        };
        chrome.storage.local.set({ [`shared_link_${mockShareId}`]: JSON.parse(JSON.stringify(mockData)) }, () => {
          navigator.clipboard.writeText(mockShareUrl).then(() => {
            showToast('Đã copy link share (Fallback Mock do chưa cấu hình Worker!)', true);
            activePanel.value = 'profiles';
          });
        });
      }
    };


    // Form inputs
    const form = reactive({
      name: '',
      value: '',
      domain: '',
      path: '/',
      expiry: '',
      sameSite: 'unspecified',
      secure: false,
      httpOnly: false,
      session: true
    });

    // Import states
    const importText = ref('');
    const importPassword = ref('');
    const showImportPassword = ref(false);

    // Export states
    const exportFormat = ref('json');
    const exportText = ref('');
    const exportUseEncryption = ref(false);
    const exportPassword = ref('');
    const showExportPassword = ref(false);

    // Watch import text to check if it's encrypted (to show/hide password box)
    const isImportEncrypted = computed(() => {
      return importText.value.trim().startsWith('[KiGuard Encrypted Cookie]');
    });

    // Load active domain & cookies
    const loadCookies = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        currentTab.value = tabs[0];
        currentUrl.value = currentTab.value.url || '';

        try {
          const urlObj = new URL(currentUrl.value);
          currentDomain.value = urlObj.hostname;

          if (urlObj.protocol === 'chrome:' || urlObj.protocol === 'chrome-extension:') {
            isSystemPage.value = true;
            cookies.value = [];
            savedProfiles.value = [];
            activeProfileId.value = '';
            return;
          }

          isSystemPage.value = false;

          // Load profiles
          loadProfiles(currentDomain.value);

          // Fetch cookies
          chrome.cookies.getAll({ url: currentUrl.value }, (cookiesList) => {
            cookies.value = cookiesList || [];
          });
        } catch (e) {
          isSystemPage.value = true;
          cookies.value = [];
        }
      });
    };

    // Event listener for tab updates to keep lists fresh
    const handleTabUpdated = (tabId, changeInfo, tab) => {
      if (currentTab.value && tabId === currentTab.value.id && changeInfo.status === 'complete') {
        loadCookies();
      }
    };

    onMounted(() => {
      loadCookies();
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    });

    onUnmounted(() => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    });

    // Formatting helpers
    const formatDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleDateString();
    };

    const formatFullDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleString();
    };

    const previewValue = (val) => {
      if (!val) return '';
      return val.length > 45 ? val.substring(0, 42) + '...' : val;
    };

    // Clipboard copy helper
    const copyCookieValue = (value) => {
      navigator.clipboard.writeText(value).then(() => {
        showToast(t('cookie.toast_copied'));
      });
    };

    // Panels logic
    const closePanel = () => {
      activePanel.value = null;
    };

    const showAddForm = () => {
      isEditing.value = false;
      editingCookie.value = null;

      form.name = '';
      form.value = '';
      form.domain = currentDomain.value.startsWith('.') ? currentDomain.value : `.${currentDomain.value}`;
      form.path = '/';
      form.expiry = '';
      form.sameSite = 'unspecified';
      form.secure = false;
      form.httpOnly = false;
      form.session = true;

      activePanel.value = 'form';
    };

    const showEditForm = (cookie) => {
      isEditing.value = true;
      editingCookie.value = cookie;

      form.name = cookie.name;
      form.value = cookie.value;
      form.domain = cookie.domain;
      form.path = cookie.path;

      if (cookie.session) {
        form.session = true;
        form.expiry = '';
      } else {
        form.session = false;
        form.expiry = cookie.expirationDate ? Math.round(cookie.expirationDate) : '';
      }

      // SameSite map
      let sameSiteVal = 'unspecified';
      if (cookie.sameSite === 'no_restriction') sameSiteVal = 'no_restriction';
      else if (cookie.sameSite === 'lax') sameSiteVal = 'lax';
      else if (cookie.sameSite === 'strict') sameSiteVal = 'strict';
      form.sameSite = sameSiteVal;

      form.secure = cookie.secure || false;
      form.httpOnly = cookie.httpOnly || false;

      activePanel.value = 'form';
    };

    const onSessionChange = () => {
      if (form.session) {
        form.expiry = '';
      }
    };

    const saveCookieForm = () => {
      const name = form.name.trim();
      const value = form.value;
      const domain = form.domain.trim();
      const path = form.path.trim();

      if (!name) {
        showToast(t('cookie.toast_name_empty'), true);
        return;
      }

      const cleanDomain = domain.replace(/^\./, '');
      const url = (form.secure ? 'https://' : 'http://') + cleanDomain + path;

      const details = {
        url,
        name,
        value,
        domain,
        path,
        secure: form.secure,
        httpOnly: form.httpOnly
      };

      if (form.sameSite !== 'unspecified') {
        details.sameSite = form.sameSite;
      }

      if (!form.session && form.expiry) {
        details.expirationDate = parseFloat(form.expiry);
      }

      chrome.cookies.set(details, (res) => {
        if (chrome.runtime.lastError) {
          showToast(t('cookie.toast_error', chrome.runtime.lastError.message), true);
        } else {
          showToast(isEditing.value ? t('cookie.toast_edited') : t('cookie.toast_added'));
          closePanel();
          loadCookies();
        }
      });
    };

    // Delete single cookie
    const deleteCookie = (cookie) => {
      const cleanDomain = cookie.domain.replace(/^\./, '');
      const url = (cookie.secure ? 'https://' : 'http://') + cleanDomain + cookie.path;

      chrome.cookies.remove({
        url,
        name: cookie.name,
        storeId: cookie.storeId
      }, (res) => {
        if (chrome.runtime.lastError) {
          showToast(t('cookie.toast_error', chrome.runtime.lastError.message), true);
        } else {
          showToast(t('cookie.toast_deleted_name', cookie.name), false, () => {
            restoreCookies([cookie]);
          });
          loadCookies();
        }
      });
    };

    // Restore cookies helper
    const restoreCookies = (cookiesList) => {
      let restoredCount = 0;
      let errors = 0;
      const total = cookiesList.length;

      cookiesList.forEach(c => {
        const cleanDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
        const url = (c.secure ? 'https://' : 'http://') + cleanDomain + c.path;

        const setDetails = {
          url,
          name: c.name,
          value: c.value || '',
          path: c.path || '/',
          secure: c.secure !== undefined ? c.secure : false,
          httpOnly: c.httpOnly !== undefined ? c.httpOnly : false
        };

        if (c.domain && !c.hostOnly) setDetails.domain = c.domain;
        if (c.sameSite && c.sameSite !== 'unspecified') setDetails.sameSite = c.sameSite;
        if (c.expirationDate && !c.session) setDetails.expirationDate = c.expirationDate;
        if (c.storeId) setDetails.storeId = c.storeId;

        chrome.cookies.set(setDetails, () => {
          restoredCount++;
          if (chrome.runtime.lastError) errors++;

          if (restoredCount === total) {
            if (errors === 0) {
              showToast(t('cookie.toast_restored_success', total));
            } else {
              showToast(t('cookie.toast_restored_error', total - errors, total, errors), true);
            }
            loadCookies();
          }
        });
      });
    };

    // Clear all cookies
    const confirmClearAll = () => {
      const cookiesToClear = [...cookies.value];
      const total = cookiesToClear.length;

      if (total === 0) {
        showToast(t('cookie.toast_no_cookies_to_clear'));
        return;
      }

      let deletedCount = 0;
      let errors = 0;

      cookiesToClear.forEach(cookie => {
        const cleanDomain = cookie.domain.replace(/^\./, '');
        const url = (cookie.secure ? 'https://' : 'http://') + cleanDomain + cookie.path;
        
        chrome.cookies.remove({
          url,
          name: cookie.name,
          storeId: cookie.storeId
        }, () => {
          deletedCount++;
          if (chrome.runtime.lastError) errors++;
          if (deletedCount === total) {
            if (errors === 0) {
              showToast(t('cookie.toast_cleared_all', total), false, () => {
                restoreCookies(cookiesToClear);
              });
            } else {
              showToast(t('cookie.toast_cleared_error', total - errors, total, errors), true);
            }
            loadCookies();
          }
        });
      });
    };

    // Reload page
    const reloadCurrentTab = () => {
      if (currentTab.value) {
        chrome.tabs.reload(currentTab.value.id, () => {
          showToast(t('cookie.toast_reloaded'));
        });
      }
    };

    // Fields info panel
    const showFieldsInfo = () => {
      activePanel.value = 'fields-info';
    };

    const closeFieldsInfo = () => {
      activePanel.value = 'form';
    };

    // Import logic
    const showImportForm = () => {
      importText.value = '';
      importPassword.value = '';
      showImportPassword.value = false;
      activePanel.value = 'import';
    };

    const showFormatInfo = () => {
      activePanel.value = 'format-info';
    };

    const closeFormatInfo = () => {
      activePanel.value = 'import';
    };

    const onFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        importText.value = event.target.result;
        showToast(t('cookie.toast_file_uploaded', file.name));
        e.target.value = '';
      };
      reader.onerror = () => {
        showToast(t('cookie.toast_file_read_error'), true);
        e.target.value = '';
      };
      reader.readAsText(file);
    };

    const submitImport = async () => {
      const text = importText.value.trim();
      const password = importPassword.value;
      const result = await CookieParser.parse(text, currentDomain.value, password);

      if (result.error) {
        showToast(result.error, true);
        return;
      }

      const cookiesArray = result.cookies;
      const total = cookiesArray.length;

      if (total === 0) {
        showToast(t('cookie.toast_no_cookies_in_data'));
        return;
      }

      let count = 0;
      let errors = 0;

      cookiesArray.forEach(c => {
        let domain = c.domain || currentDomain.value;
        let path = c.path || '/';
        let secure = c.secure !== undefined ? c.secure : false;

        let cleanDomain = domain.startsWith('.') ? domain.substring(1) : domain;
        let url = (secure ? 'https://' : 'http://') + cleanDomain + path;

        const setDetails = {
          url,
          name: c.name,
          value: c.value || '',
          path,
          secure,
          httpOnly: c.httpOnly !== undefined ? c.httpOnly : false
        };

        if (domain && !c.hostOnly) {
          setDetails.domain = domain;
        }

        if (c.sameSite && c.sameSite !== 'unspecified') {
          setDetails.sameSite = c.sameSite;
        }

        if (c.expirationDate && !c.session) {
          setDetails.expirationDate = c.expirationDate;
        }

        chrome.cookies.set(setDetails, () => {
          count++;
          if (chrome.runtime.lastError) errors++;

          if (count === total) {
            // Generate auto profile name: <domain>_<index>_<random_chars>
            const domain = currentDomain.value;
            const nextNum = savedProfiles.value.length + 1;
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let randSuffix = '';
            for (let i = 0; i < 3; i++) {
              randSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const autoName = `${domain}_${nextNum}_${randSuffix}`;

            // Create new profile object
            const newProfile = {
              id: Date.now().toString(),
              name: autoName,
              cookiesCount: total,
              cookies: cookiesArray,
              createdAt: Date.now()
            };

            // Add to profiles and select it
            savedProfiles.value.push(newProfile);
            activeProfileId.value = newProfile.id;

            // Save to chrome storage
            const storageKey = `cookie_profiles_${domain}`;
            const activeKey = `active_profile_id_${domain}`;
            
            chrome.storage.local.set({
              [storageKey]: JSON.parse(JSON.stringify(savedProfiles.value)),
              [activeKey]: newProfile.id
            }, () => {
              if (errors === 0) {
                showToast(`Đã nhập ${total} cookie và tự động tạo Profile: ${autoName}`);
              } else {
                showToast(`Đã nhập ${total - errors}/${total} cookie. Tự động tạo Profile: ${autoName}`, true);
              }
              closePanel();
              loadCookies();
            });
          }
        });
      });
    };

    // Export logic
    const showExportForm = () => {
      exportFormat.value = 'json';
      exportPassword.value = '';
      showExportPassword.value = false;
      exportUseEncryption.value = false;
      activePanel.value = 'export';
      updateExportText();
    };

    const onExportEncryptionChange = () => {
      if (!exportUseEncryption.value) {
        exportPassword.value = '';
      }
      updateExportText();
    };

    const updateExportText = async () => {
      let content = '';

      if (exportFormat.value === 'json') {
        const formatted = cookies.value.map(c => {
          const item = {
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            secure: c.secure,
            httpOnly: c.httpOnly,
            sameSite: c.sameSite,
            hostOnly: c.hostOnly,
            session: c.session
          };
          if (c.expirationDate) item.expirationDate = c.expirationDate;
          if (c.storeId) item.storeId = c.storeId;
          return item;
        });
        content = JSON.stringify(formatted, null, 2);
      } else if (exportFormat.value === 'header') {
        content = cookies.value.map(c => `${c.name}=${c.value}`).join('; ');
      } else if (exportFormat.value === 'netscape') {
        let netscapeStr = '# Netscape HTTP Cookie File\n# This file is generated by KiGuard\n\n';
        cookies.value.forEach(c => {
          const domain = c.domain || '';
          const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE';
          const path = c.path || '/';
          const secure = c.secure ? 'TRUE' : 'FALSE';
          const expiration = c.session ? '0' : (c.expirationDate ? Math.round(c.expirationDate) : '0');
          const name = c.name || '';
          const value = c.value || '';
          netscapeStr += `${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}\n`;
        });
        content = netscapeStr;
      }

      if (exportUseEncryption.value && exportPassword.value) {
        try {
          const encrypted = await encryptData(content, exportPassword.value);
          exportText.value = `[KiGuard Encrypted Cookie]\n${encrypted}`;
        } catch (e) {
          console.error(e);
          exportText.value = t('cookie.export_encrypt_error');
        }
      } else {
        exportText.value = content;
      }
    };

    const copyExportToClipboard = () => {
      navigator.clipboard.writeText(exportText.value).then(() => {
        if (exportUseEncryption.value && exportPassword.value) {
          showToast(t('cookie.toast_copied_encrypted'));
        } else {
          showToast(t('cookie.toast_copied_format', exportFormat.value.toUpperCase()));
        }
      });
    };

    const downloadExportFile = () => {
      let mimeType = 'data:text/json;charset=utf-8,';
      let filename = `${currentDomain.value}_cookies.json`;

      if (exportUseEncryption.value && exportPassword.value) {
        mimeType = 'data:text/plain;charset=utf-8,';
        filename = `${currentDomain.value}_cookies_encrypted.txt`;
      } else if (exportFormat.value === 'header') {
        mimeType = 'data:text/plain;charset=utf-8,';
        filename = `${currentDomain.value}_cookies_header.txt`;
      } else if (exportFormat.value === 'netscape') {
        mimeType = 'data:text/plain;charset=utf-8,';
        filename = `${currentDomain.value}_cookies_netscape.txt`;
      }

      const dataStr = mimeType + encodeURIComponent(exportText.value);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      const exportTypeStr = exportUseEncryption.value && exportPassword.value 
        ? t('cookie.encrypt_label_upper') 
        : exportFormat.value.toUpperCase();
      showToast(t('cookie.toast_downloading', exportTypeStr));
    };

    return {
      t,
      cookies,
      currentDomain,
      currentUrl,
      isSystemPage,
      activePanel,
      isEditing,
      form,
      importText,
      importPassword,
      showImportPassword,
      isImportEncrypted,
      exportFormat,
      exportText,
      exportUseEncryption,
      exportPassword,
      showExportPassword,
      formatDate,
      formatFullDate,
      previewValue,
      copyCookieValue,
      closePanel,
      showAddForm,
      showEditForm,
      onSessionChange,
      saveCookieForm,
      deleteCookie,
      confirmClearAll,
      reloadCurrentTab,
      showFieldsInfo,
      closeFieldsInfo,
      showImportForm,
      showFormatInfo,
      closeFormatInfo,
      onFileUpload,
      submitImport,
      showExportForm,
      onExportEncryptionChange,
      updateExportText,
      copyExportToClipboard,
      downloadExportFile,
      savedProfiles,
      activeProfileId,
      activeProfileName,
      newProfileName,
      saveProfileIncludeSession,
      showSaveProfileDialog,
      toggleProfilesPanel,
      submitSaveProfile,
      switchProfile,
      deleteProfile,
      resetToDefaultProfile,
      shareProfile,
      sharingProfile,
      shareAccessType,
      sharePassword,
      showSharePassword,
      sharingProfileName,
      sharingProfileCookiesCount,
      submitShareProfile,
      profileTab,
      allProfiles,
      activeProfilesMap,
      loadAllProfiles
    };
  }
};
</script>
