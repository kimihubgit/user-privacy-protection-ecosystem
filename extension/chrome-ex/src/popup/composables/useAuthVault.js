import { ref } from 'vue';
import { encryptData, decryptData } from '../utils/otpHelper.js';
import { showToast } from '../../shared/toast.js';

export default function useAuthVault({ panelState, t }) {
  const masterPassword = ref('');
  const accounts = ref([]);

  const checkSetupState = (onNeedSetup, onNeedUnlock) => {
    chrome.storage.sync.get(['kiguard_2fa_verifier'], (result) => {
      if (result.kiguard_2fa_verifier) {
        if (onNeedUnlock) onNeedUnlock();
      } else {
        if (onNeedSetup) onNeedSetup();
      }
    });
  };

  const setupMasterPassword = async (p1, p2, onSuccess) => {
    if (p1.length < 6) {
      showToast(t('authenticator.toast_pin_length_error'), true);
      return false;
    }
    if (p1 !== p2) {
      showToast(t('authenticator.toast_pin_mismatch'), true);
      return false;
    }

    try {
      const verifierStr = await encryptData('kiguard_verified', p1);
      const emptyVault = await encryptData(JSON.stringify([]), p1);

      return new Promise((resolve) => {
        chrome.storage.sync.set({
          kiguard_2fa_verifier: verifierStr,
          kiguard_2fa_vault: emptyVault
        }, () => {
          masterPassword.value = p1;
          accounts.value = [];
          showToast(t('authenticator.toast_setup_success'));
          panelState.value = 'home';
          if (onSuccess) onSuccess();
          resolve(true);
        });
      });
    } catch (e) {
      showToast(t('authenticator.toast_setup_error'), true);
      return false;
    }
  };

  const unlockVault = async (pwd, onSuccess, onFailure) => {
    if (pwd.length < 6) return false;

    chrome.storage.sync.get(['kiguard_2fa_verifier', 'kiguard_2fa_vault'], async (result) => {
      if (!result.kiguard_2fa_verifier) {
        panelState.value = 'setup';
        if (onFailure) onFailure();
        return;
      }

      try {
        const verified = await decryptData(result.kiguard_2fa_verifier, pwd);
        if (verified === 'kiguard_verified') {
          masterPassword.value = pwd;
          if (result.kiguard_2fa_vault) {
            const vaultJson = await decryptData(result.kiguard_2fa_vault, pwd);
            accounts.value = JSON.parse(vaultJson);
          } else {
            accounts.value = [];
          }
          panelState.value = 'home';
          if (onSuccess) onSuccess();
        } else {
          showToast(t('authenticator.toast_unlock_error'), true);
          if (onFailure) onFailure();
        }
      } catch (err) {
        showToast(t('authenticator.toast_unlock_error'), true);
        if (onFailure) onFailure();
      }
    });
  };

  const lockVault = (onLocked) => {
    masterPassword.value = '';
    accounts.value = [];
    panelState.value = 'unlock';
    showToast(t('authenticator.toast_vault_locked'));
    if (onLocked) onLocked();
  };

  const saveVault = async () => {
    if (!masterPassword.value) return;
    const cipher = await encryptData(JSON.stringify(accounts.value), masterPassword.value);
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kiguard_2fa_vault: cipher }, () => {
        resolve();
      });
    });
  };

  return {
    masterPassword,
    accounts,
    checkSetupState,
    setupMasterPassword,
    unlockVault,
    lockVault,
    saveVault
  };
}
