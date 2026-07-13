<template>
  <div style="height: 100%; display: flex; flex-direction: column; gap: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
      <div style="display: flex; flex-direction: column;">
        <h2 class="title" style="margin: 0;">{{ t('authenticator.title') || 'Mã Xác Thực 2FA' }}</h2>
      </div>
      <!-- Circular Expiration Timer -->
      <div v-show="panelState === 'home'" style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 4px 8px; border-radius: 20px;">
        <svg width="14" height="14" viewBox="0 0 20 20" style="transform: rotate(-90deg); display: block;">
          <!-- Background track -->
          <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.05)" stroke-width="2.5" fill="none"/>
          <!-- Active dash progress -->
          <circle 
            cx="10" 
            cy="10" 
            r="8" 
            :stroke="remainingSeconds <= 5 ? 'var(--danger)' : 'var(--primary-blue)'" 
            stroke-width="2.5" 
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="50.26"
            :stroke-dashoffset="50.26 - (remainingSeconds / 30) * 50.26"
            style="transition: stroke-dashoffset 1s linear, stroke 0.3s;"
          />
        </svg>
        <span :style="{ color: remainingSeconds <= 5 ? 'var(--danger)' : 'var(--text-title)' }" style="font-family: 'Outfit', monospace; font-size: 10px; font-weight: 800; min-width: 20px; text-align: center; line-height: 1;">
          {{ remainingSeconds }}s
        </span>
      </div>
    </div>

    <!-- Safe Panels (Vault container) -->
    <div class="safe-panels-container" style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column;">
      
      <!-- 1. State: Setup (Create Master Password) -->
      <div v-if="panelState === 'setup'" id="auth-panel-setup" class="auth-lock-panel" style="display: flex; overflow: hidden; padding: 4px 0;">
        <div style="width: 100%; max-width: 310px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div class="auth-lock-icon-wrapper" style="width: 40px; height: 40px; margin-bottom: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          
          <h3 class="auth-lock-title" style="font-size: 13.5px; margin: 0;">
            {{ setupStep === 1 ? t('authenticator.setup_title') : t('authenticator.confirm_title') }}
          </h3>
          <p class="auth-lock-desc" style="font-size: 10px; margin: 0 0 4px 0;">
            {{ setupStep === 1 ? t('authenticator.setup_desc') : t('authenticator.confirm_desc') }}
          </p>
          
          <!-- Step 1 Input PIN -->
          <div v-show="setupStep === 1" class="form-group" style="margin: 0; width: 100%;">
            <label class="form-label" style="font-size: 9px; margin-bottom: 2px; color: var(--text-desc); text-align: center; display: block;">{{ t('authenticator.setup_pin_label') }}</label>
            <div style="position: relative; width: 100%; display: flex; align-items: center; justify-content: center;">
              <div class="auth-pin-container" style="margin: 2px 0;">
                <input 
                  v-for="(digit, index) in 6" 
                  :key="'step1-' + index"
                  ref="setupP1Inputs"
                  v-model="setupP1[index]"
                  @input="onPinInput($event, index, setupP1Inputs, setupP1, 'setup-p1-done')"
                  @keydown.delete="onPinDelete($event, index, setupP1Inputs, setupP1)"
                  type="text" 
                  maxlength="1" 
                  class="auth-pin-input" 
                  inputmode="numeric" 
                  pattern="[0-9]*"
                  style="width: 36px; height: 44px; font-size: 14px;"
                >
              </div>
            </div>
          </div>
          
          <!-- Step 2 Input PIN -->
          <div v-show="setupStep === 2" class="form-group" style="margin: 0; width: 100%;">
            <label class="form-label" style="font-size: 9px; margin-bottom: 2px; color: var(--text-desc); text-align: center; display: block;">{{ t('authenticator.confirm_pin_label') }}</label>
            <div style="position: relative; width: 100%; display: flex; align-items: center; justify-content: center;">
              <div class="auth-pin-container" style="margin: 2px 0;">
                <input 
                  v-for="(digit, index) in 6" 
                  :key="'step2-' + index"
                  ref="setupP2Inputs"
                  v-model="setupP2[index]"
                  @input="onPinInput($event, index, setupP2Inputs, setupP2, 'setup-p2-done')"
                  @keydown.delete="onPinDelete($event, index, setupP2Inputs, setupP2)"
                  type="text" 
                  maxlength="1" 
                  class="auth-pin-input" 
                  inputmode="numeric" 
                  pattern="[0-9]*"
                  style="width: 36px; height: 44px; font-size: 14px;"
                >
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 8px; width: 100%; margin-top: 6px;">
            <button v-if="setupStep === 2" @click="goBackToStep1" class="cookie-btn cancel" style="flex: 1; height: 32px; font-size: 10.5px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; margin: 0;">
              {{ t('authenticator.btn_back') }}
            </button>
            <button @click="setupStep === 1 ? goToStep2() : setupMasterPassword()" class="auth-lock-btn" style="flex: 2; height: 32px; font-size: 10.5px; cursor: pointer; border-radius: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>{{ setupStep === 1 ? t('authenticator.btn_continue') : t('authenticator.btn_confirm_setup') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. State: Lock (Unlock & Quick OTP) -->
      <div v-else-if="panelState === 'unlock'" id="auth-panel-unlock" class="auth-lock-panel" style="display: flex; flex-direction: column; overflow-y: auto;">
        <!-- Unlock Form -->
        <div style="width: 100%; max-width: 310px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <div class="auth-lock-icon-wrapper" style="width: 36px; height: 36px; margin-bottom: 2px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 16px; height: 16px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          
          <h3 class="auth-lock-title" style="font-size: 13.5px; margin: 0;">{{ t('authenticator.unlock_title') }}</h3>
          <p class="auth-lock-desc" style="font-size: 10px; margin: 0 0 2px 0;">{{ t('authenticator.unlock_desc') }}</p>
          
          <div class="form-group" style="margin: 0; width: 100%; display: flex; align-items: center; gap: 8px; justify-content: center;">
            <div class="auth-pin-container">
              <input 
                v-for="(digit, index) in 6" 
                :key="index"
                ref="unlockInputs"
                v-model="unlockPasswordArray[index]"
                @input="onPinInput($event, index, unlockInputs, unlockPasswordArray, 'unlock-done')"
                @keydown.delete="onPinDelete($event, index, unlockInputs, unlockPasswordArray)"
                type="text" 
                maxlength="1" 
                class="auth-pin-input" 
                inputmode="numeric" 
                pattern="[0-9]*"
              >
            </div>
          </div>
          <button @click="unlockVault" class="auth-lock-btn" style="height: 32px; font-size: 11px; margin-bottom: 2px; cursor: pointer;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>{{ t('authenticator.unlock_btn') }}</span>
          </button>
        </div>

        <!-- Horizontal Line -->
        <div style="height: 1px; background-color: var(--border-light); margin: 8px 0; width: 100%;"></div>

        <!-- Quick OTP Section -->
        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
          <span style="font-size: 9.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; font-family: 'Outfit', sans-serif;">{{ t('authenticator.quick_otp_title') }}</span>
          
          <div style="display: flex; gap: 6px; align-items: center; position: relative; width: 100%;">
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; align-items: center; pointer-events: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
            </span>
            <input 
              type="text" 
              v-model="quickForm.key" 
              @input="onQuickKeyInput"
              class="form-control" 
              :placeholder="t('authenticator.quick_otp_placeholder')" 
              style="height: 38px; font-size: 12.5px; font-family: monospace; box-sizing: border-box; width: 100%; padding: 4px 72px 4px 32px; border-radius: 8px;"
            >
            <div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: flex; gap: 6px; align-items: center;">
              <button 
                v-show="quickForm.key"
                @click="clearQuickKey"
                class="cookie-btn cancel" 
                style="height: 24px; width: 24px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none; background: none; color: var(--text-muted);" 
                :title="t('authenticator.tooltip_clear')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button @click="pasteQuickKey" class="cookie-btn" style="height: 24px; padding: 0 8px; font-size: 10px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; border-radius: 4px; border: 1px solid var(--border-light);" :title="t('authenticator.tooltip_paste')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                <span>{{ t('authenticator.btn_paste') }}</span>
              </button>
            </div>
          </div>

          <!-- Quick Result -->
          <div v-show="quickForm.key" style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(80, 205, 137, 0.08) 0%, rgba(0, 158, 247, 0.08) 100%); border: 1px dashed rgba(0, 158, 247, 0.35); padding: 6px 12px; border-radius: 8px; transition: all 0.2s ease; margin-top: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span :style="{ color: quickForm.isError ? 'var(--danger)' : 'var(--accent-teal)' }" style="font-family: 'Outfit', monospace; font-size: 21px; font-weight: 800; letter-spacing: 1px; line-height: 1; text-shadow: 0 0 10px rgba(80, 205, 137, 0.25);">
                {{ formatOTP(quickForm.otp) }}
              </span>
              <span v-if="!quickForm.isError" :style="{ color: remainingSeconds <= 5 ? 'var(--danger)' : 'var(--primary-blue)' }" style="font-size: 10px; font-weight: 700; background-color: rgba(0, 158, 247, 0.12); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                {{ remainingSeconds }}s
              </span>
            </div>
            <button v-show="!quickForm.isError" @click="copyQuickOTP" class="cookie-btn copy" style="height: 25px; padding: 0 10px; font-size: 10px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; border-radius: 4px; border: none; box-shadow: 0 2px 6px rgba(80, 205, 137, 0.15); cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>{{ t('authenticator.btn_copy') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. State: Home (List of accounts) -->
      <div v-else-if="panelState === 'home'" id="auth-panel-home" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">


        <!-- Search input -->
        <div style="position: relative; margin-bottom: 8px; flex-shrink: 0; display: flex; align-items: center;">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm tài khoản..." 
            style="width: 100%; height: 28px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 6px; padding: 0 28px; font-size: 11px; color: var(--text-title); outline: none; box-sizing: border-box; transition: all 0.2s;"
            class="auth-search-input"
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="position: absolute; left: 8px; color: var(--text-muted); width: 12px; height: 12px; pointer-events: none;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''"
            style="position: absolute; right: 8px; background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Scroll List -->
        <div class="cookie-list" style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px;">
          <div v-if="accounts.length === 0" class="empty-state" style="padding: 40px 0; text-align: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 32px; height: 32px; color: var(--text-muted); margin-bottom: 8px; display: inline-block;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style="font-size: 11px; color: var(--text-desc);">{{ t('authenticator.empty_desc') }}</div>
          </div>

          <div v-else-if="filteredAccounts.length === 0" class="empty-state" style="padding: 40px 0; text-align: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 24px; height: 24px; color: var(--text-muted); margin-bottom: 8px; display: inline-block;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div style="font-size: 11px; color: var(--text-desc);">Không tìm thấy tài khoản phù hợp.</div>
          </div>
          
          <div 
            v-else
            v-for="acc in filteredAccounts" 
            :key="acc.id"
            class="auth-list-item"
          >
            <div class="auth-item-left-group" style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
              <div class="auth-item-brand" :style="{ background: getBrandStyles(acc.label).gradient }" style="width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; flex-shrink: 0;">
                {{ getBrandStyles(acc.label).letter }}
              </div>
              <div class="auth-item-info" style="min-width: 0;">
                <span class="auth-item-label" style="font-size: 11.5px; font-weight: 600; color: var(--text-title); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="acc.label">{{ acc.label }}</span>
              </div>
            </div>
            
            <div class="auth-item-code-group" style="padding: 0 10px;">
              <span :class="{ 'low-time': remainingSeconds <= 5 }" style="font-family: 'Outfit', monospace; font-size: 17px; font-weight: 800; color: var(--accent-teal); letter-spacing: 0.5px;">
                {{ formatOTP(otps[acc.id]) }}
              </span>
            </div>
            
            <div class="auth-item-actions">
              <button class="auth-item-btn copy" @click="copyOTP(acc)" :title="t('authenticator.tooltip_copy')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="auth-item-btn qr" @click="showQR(acc)" :title="t('authenticator.tooltip_qr')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <line x1="7" y1="17" x2="7.01" y2="17"></line>
                  <line x1="17" y1="7" x2="17.01" y2="7"></line>
                  <line x1="17" y1="17" x2="17.01" y2="17"></line>
                </svg>
              </button>
              <button class="auth-item-btn delete" @click="deleteAccount(acc.id)" :title="t('authenticator.tooltip_delete')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); flex-shrink: 0;">
          <div style="display: flex; gap: 6px;">
            <button @click="panelState = 'add'" class="cookie-action-btn primary" :title="t('authenticator.tooltip_add')" style="width: auto; padding: 0 10px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{{ t('authenticator.btn_add') }}</span>
            </button>
            <button @click="panelState = 'import'" class="cookie-action-btn" :title="t('authenticator.tooltip_import')" style="width: auto; padding: 0 10px; font-size: 10px; height: 26px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); color: var(--text-title); display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ t('authenticator.btn_import') }}</span>
            </button>
            <button @click="exportVault" class="cookie-action-btn" :title="t('authenticator.tooltip_export')" style="width: auto; padding: 0 10px; font-size: 10px; height: 26px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); color: var(--text-title); display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{{ t('authenticator.btn_export') }}</span>
            </button>
          </div>
          <button @click="lockVault" class="cookie-action-btn cancel" :title="t('authenticator.tooltip_lock')" style="width: auto; padding: 0 10px; font-size: 10px; height: 26px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>{{ t('authenticator.btn_lock') }}</span>
          </button>
        </div>
      </div>

      <!-- 4. State: Form Add (Add new account) -->
      <div v-else-if="panelState === 'add'" id="auth-panel-add" style="display: flex; flex-direction: column; gap: 10px; padding: 10px 0;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-title); margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">{{ t('authenticator.add_title') }}</h3>
        
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 10px; margin-bottom: 4px;">{{ t('authenticator.add_label_desc') }}</label>
          <input type="text" v-model="addForm.label" class="form-control" :placeholder="t('authenticator.add_label_placeholder')" style="height: 32px; font-size: 11px; border-radius: 8px;">
        </div>
        
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 10px; margin-bottom: 4px;">{{ t('authenticator.add_key_desc') }}</label>
          <input type="text" v-model="addForm.key" class="form-control" :placeholder="t('authenticator.add_key_placeholder')" style="height: 32px; font-size: 11px; font-family: monospace; border-radius: 8px;">
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
          <button @click="panelState = 'home'" class="cookie-btn cancel" style="height: 30px; font-size: 11px; padding: 0 14px; border-radius: 6px;">{{ t('authenticator.btn_cancel') }}</button>
          <button @click="addAccount" class="cookie-btn save auth-glow-btn" style="height: 30px; font-size: 11px; padding: 0 16px; border-radius: 6px;">{{ t('authenticator.btn_save') }}</button>
        </div>
      </div>

      <!-- 5. State: Form Import -->
      <div v-else-if="panelState === 'import'" id="auth-panel-import" style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0; height: 100%; overflow: hidden;" @paste="handleImportPaste">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-title); margin: 0 0 2px 0; font-family: 'Outfit', sans-serif;">{{ t('authenticator.import_title') || 'Nhập tài khoản 2FA' }}</h3>
        
        <!-- Toggle Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 4px; flex-shrink: 0;">
          <button 
            @click="importTab = 'qr'" 
            :style="{ background: importTab === 'qr' ? 'rgba(54, 153, 255, 0.12)' : 'rgba(255,255,255,0.02)', color: importTab === 'qr' ? 'var(--primary-blue)' : 'var(--text-muted)', borderColor: importTab === 'qr' ? 'var(--primary-blue)' : 'var(--border-light)' }"
            style="flex: 1; height: 26px; font-size: 9.5px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer; outline: none; transition: all 0.2s;"
          >
            Quét mã QR Code
          </button>
          <button 
            @click="importTab = 'text'" 
            :style="{ background: importTab === 'text' ? 'rgba(54, 153, 255, 0.12)' : 'rgba(255,255,255,0.02)', color: importTab === 'text' ? 'var(--primary-blue)' : 'var(--text-muted)', borderColor: importTab === 'text' ? 'var(--primary-blue)' : 'var(--border-light)' }"
            style="flex: 1; height: 26px; font-size: 9.5px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer; outline: none; transition: all 0.2s;"
          >
            Dán liên kết / Văn bản
          </button>
        </div>

        <input type="file" ref="qrFileInput" @change="handleQrFileSelect" accept="image/*" style="display: none;" />

        <!-- Tab 1: QR Scan -->
        <div v-show="importTab === 'qr'" style="display: flex; flex-direction: column; gap: 10px; flex-grow: 1; justify-content: center; align-items: center; padding: 10px 0;">
          <!-- Radar Visual Element -->
          <div style="width: 60px; height: 60px; border-radius: 50%; border: 2px dashed var(--primary-blue); display: flex; align-items: center; justify-content: center; background: rgba(54, 153, 255, 0.05); position: relative; margin-bottom: 2px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26" style="color: var(--primary-blue);">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid var(--primary-blue); opacity: 0.3; animation: ping 2s infinite;"></div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 260px;">
            <button 
              @click="scanCurrentTabQr" 
              class="cookie-action-btn primary auth-glow-btn" 
              style="width: 100%; height: 32px; font-size: 11px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <line x1="7" y1="17" x2="7.01" y2="17"></line>
                <line x1="17" y1="7" x2="17.01" y2="7"></line>
                <line x1="17" y1="17" x2="17.01" y2="17"></line>
              </svg>
              <span>Quét mã QR trên Tab hiện tại</span>
            </button>
            
            <button 
              @click="triggerQrFileSelect" 
              class="cookie-action-btn" 
              style="width: 100%; height: 32px; font-size: 11px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); color: var(--text-title); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Tải file ảnh từ thiết bị</span>
            </button>
          </div>
          
          <div style="font-size: 9.5px; color: var(--text-desc); line-height: 1.45; text-align: center; max-width: 280px; margin-top: 2px;">
            Mẹo: Bạn cũng có thể copy ảnh mã QR (chụp màn hình) rồi **bấm Ctrl + V** ở đây để quét tự động.
          </div>

          <div style="width: 100%; display: flex; justify-content: center; margin-top: auto; border-top: 1px solid var(--border-light); padding-top: 8px;">
            <button @click="panelState = 'home'" class="cookie-btn cancel" style="width: 100%; max-width: 260px; height: 30px; font-size: 11px; border-radius: 6px;">{{ t('authenticator.btn_cancel') || 'Hủy bỏ' }}</button>
          </div>
        </div>

        <!-- Tab 2: Text / Link Paste -->
        <div v-show="importTab === 'text'" style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1; overflow: hidden;">
          <p style="font-size: 10px; color: var(--text-desc); margin: 0; line-height: 1.45;">
            Dán đường dẫn `otpauth-migration://` của Google Authenticator hoặc chuỗi văn bản sao lưu mã hóa vào ô dưới đây.
          </p>
          <textarea 
            v-model="importText" 
            class="form-control" 
            rows="4" 
            placeholder="Dán liên kết hoặc mã sao lưu tại đây..." 
            style="resize: none; font-size: 10.5px; font-family: monospace; padding: 8px; box-sizing: border-box; border-radius: 8px; flex-grow: 1;"
          ></textarea>
          
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; flex-shrink: 0; border-top: 1px solid var(--border-light); padding-top: 8px;">
            <button @click="panelState = 'home'" class="cookie-btn cancel" style="height: 30px; font-size: 11px; padding: 0 14px; border-radius: 6px;">{{ t('authenticator.btn_cancel') }}</button>
            <button @click="importVault" class="cookie-btn save auth-glow-btn" style="height: 30px; font-size: 11px; padding: 0 16px; border-radius: 6px;">{{ t('authenticator.btn_import_submit') }}</button>
          </div>
        </div>
      </div>
 
      <!-- 6. State: Form Export (Export backup text or Google Migration QR) -->
      <div v-else-if="panelState === 'export'" id="auth-panel-export" style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0; height: 100%; overflow: hidden;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--text-title); margin: 0 0 4px 0; font-family: 'Outfit', sans-serif;">{{ t('authenticator.export_title') || 'Xuất dữ liệu 2FA' }}</h3>
        
        <!-- Toggle Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
          <button 
            @click="exportTab = 'backup'" 
            :style="{ background: exportTab === 'backup' ? 'rgba(54, 153, 255, 0.12)' : 'rgba(255,255,255,0.02)', color: exportTab === 'backup' ? 'var(--primary-blue)' : 'var(--text-muted)', borderColor: exportTab === 'backup' ? 'var(--primary-blue)' : 'var(--border-light)' }"
            style="flex: 1; height: 26px; font-size: 9.5px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer; outline: none; transition: all 0.2s;"
          >
            Bản sao lưu Encrypted
          </button>
          <button 
            @click="exportTab = 'google'" 
            :style="{ background: exportTab === 'google' ? 'rgba(54, 153, 255, 0.12)' : 'rgba(255,255,255,0.02)', color: exportTab === 'google' ? 'var(--primary-blue)' : 'var(--text-muted)', borderColor: exportTab === 'google' ? 'var(--primary-blue)' : 'var(--border-light)' }"
            style="flex: 1; height: 26px; font-size: 9.5px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer; outline: none; transition: all 0.2s;"
          >
            QR Google Authenticator
          </button>
        </div>

        <!-- Tab 1: Backup Text -->
        <div v-show="exportTab === 'backup'" style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1; overflow: hidden;">
          <p style="font-size: 10px; color: var(--text-desc); margin: 0; line-height: 1.45;">Mã sao lưu đã được mã hóa bằng Master Password của bạn. Lưu trữ văn bản này ở nơi an toàn để khôi phục.</p>
          <textarea v-model="exportText" class="form-control" rows="4" readonly style="resize: none; font-size: 10px; font-family: monospace; padding: 8px; box-sizing: border-box; background-color: rgba(255,255,255,0.02); color: var(--text-desc); border-radius: 8px; flex-grow: 1;"></textarea>
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; flex-shrink: 0;">
            <button @click="copyExportCode" class="cookie-btn copy" style="height: 30px; font-size: 11px; padding: 0 16px; border-radius: 6px;">{{ t('authenticator.btn_copy_code') || 'Copy Code' }}</button>
            <button @click="panelState = 'home'" class="cookie-btn cancel" style="height: 30px; font-size: 11px; padding: 0 14px; border-radius: 6px;">{{ t('authenticator.btn_close') || 'Đóng' }}</button>
          </div>
        </div>

        <!-- Tab 2: Google Migration QR -->
        <div v-show="exportTab === 'google'" style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex-grow: 1; overflow-y: auto;">
          <p style="font-size: 10px; color: var(--text-desc); margin: 0; line-height: 1.45; text-align: center;">Quét mã QR dưới đây bằng Google Authenticator hoặc ứng dụng tương thích để đồng bộ nhanh toàn bộ tài khoản.</p>
          
          <div style="background-color: #ffffff; padding: 6px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin: 4px 0;">
            <canvas ref="exportQrCanvas" style="width: 140px; height: 140px; display: block;"></canvas>
          </div>

          <div style="display: flex; gap: 8px; width: 100%; max-width: 280px; flex-shrink: 0;">
            <button @click="copyMigrationLink" class="cookie-btn copy" style="flex: 1; height: 30px; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; border-radius: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Đường dẫn</span>
            </button>
            <button @click="panelState = 'home'" class="cookie-btn cancel" style="flex: 1; height: 30px; font-size: 11px; border-radius: 6px;">{{ t('authenticator.btn_close') || 'Đóng' }}</button>
          </div>
        </div>
      </div>

      <!-- 7. State: QR View -->
      <div v-else-if="panelState === 'qr'" id="auth-panel-qr" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 10px 0; height: 100%;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-title); margin: 0; text-align: center; font-family: 'Outfit', sans-serif;">{{ t('authenticator.qr_title', currentQrAccount?.label) }}</h3>
        
        <div style="background-color: #ffffff; padding: 8px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <canvas ref="qrCanvas" style="width: 150px; height: 150px; display: block;"></canvas>
        </div>
        
        <div style="display: flex; gap: 8px; width: 100%; max-width: 280px; margin-top: 4px;">
          <button @click="copyQRImage" class="cookie-btn copy" style="flex: 1; height: 30px; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; border-radius: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>{{ t('authenticator.btn_copy_qr') }}</span>
          </button>
          <button @click="downloadQRImage" class="cookie-btn save auth-glow-btn" style="flex: 1; height: 30px; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; border-radius: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>{{ t('authenticator.btn_download_qr') }}</span>
          </button>
        </div>
        <button @click="panelState = 'home'" class="cookie-btn cancel" style="width: 100%; max-width: 280px; height: 30px; font-size: 11px; border-radius: 6px;">{{ t('authenticator.btn_back') }}</button>
      </div>

    </div>
  </div>
</template>

<script>
import useAuthenticator from '../composables/useAuthenticator.js';

export default {
  name: 'AuthenticatorTab',
  setup() {
    return useAuthenticator();
  }
};
</script>
