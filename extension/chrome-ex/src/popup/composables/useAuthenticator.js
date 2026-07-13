import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from './useI18n.js';
import { showToast } from '../../shared/toast.js';
import { OtpMigrationDecoder } from '../utils/otpHelper.js';

// Import sub-composables
import useAuthVault from './useAuthVault.js';
import usePinInput from './usePinInput.js';
import useOTP from './useOTP.js';
import useAccountActions from './useAccountActions.js';
import useQR from './useQR.js';

export default function useAuthenticator() {
  const { t } = useI18n();

  // 1. Shared core state
  const panelState = ref('unlock'); // setup, unlock, home, add, import, export, qr
  const setupStep = ref(1);
  const searchQuery = ref('');

  // 2. AuthVault Composable
  const {
    masterPassword,
    accounts,
    checkSetupState,
    setupMasterPassword: runSetupMasterPassword,
    unlockVault: runUnlockVault,
    lockVault: runLockVault,
    saveVault
  } = useAuthVault({ panelState, t });

  // 3. OTP Composable
  const {
    otps,
    remainingSeconds,
    quickForm,
    formatOTP,
    getBrandStyles,
    copyOTP,
    copyQuickOTP,
    updateOTPs,
    startOTPLoop,
    stopOTPLoop,
    onQuickKeyInput,
    clearQuickKey,
    pasteQuickKey
  } = useOTP({ accounts, panelState, t });

  // 4. Account Actions Composable
  const {
    addForm,
    importText,
    exportText,
    exportTab,
    importTab,
    addAccount,
    deleteAccount,
    exportVault: runExportVault,
    copyExportCode,
    importVault: runImportVault,
    copyMigrationLink
  } = useAccountActions({ accounts, panelState, saveVault, updateOTPs, t });

  // 5. QR Composable
  const {
    qrCanvas,
    currentQrAccount,
    exportQrCanvas,
    qrFileInput,
    showQR,
    copyQRImage,
    downloadQRImage,
    triggerQrFileSelect,
    handleQrFileSelect,
    handleImportPaste,
    scanCurrentTabQr
  } = useQR({
    accounts,
    panelState,
    onImportScanned: (data) => {
      importText.value = data;
      showToast("Đã quét thành công dữ liệu QR Code!");
      runImportVault(masterPassword.value);
    },
    t
  });

  // 6. PinInput Composable
  const {
    setupP1,
    setupP2,
    unlockPasswordArray,
    setupP1Inputs,
    setupP2Inputs,
    unlockInputs,
    focusPinInput,
    onPinInput,
    onPinDelete,
    resetPinInputs
  } = usePinInput({
    onUnlock: () => {
      const pwd = unlockPasswordArray.join('');
      runUnlockVault(
        pwd,
        () => {
          // Success
        },
        () => {
          // Failure
          resetPinInputs(unlockPasswordArray, unlockInputs.value);
        }
      );
    },
    onStep2: () => {
      const pin = setupP1.join('');
      if (pin.length < 6) {
        showToast(t('authenticator.toast_enter_full_pin'), true);
        return;
      }
      setupStep.value = 2;
      nextTick(() => {
        focusPinInput(setupP2Inputs.value[0]);
      });
    },
    onSetupMaster: () => {
      const p1 = setupP1.join('');
      const p2 = setupP2.join('');
      runSetupMasterPassword(p1, p2, () => {
        // Success
      });
    }
  });

  // 7. Filtered accounts based on search query
  const filteredAccounts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return accounts.value;
    return accounts.value.filter(acc => acc.label.toLowerCase().includes(q));
  });

  // 8. Bindings for setup callbacks and component interfaces
  const checkSetupStateCallback = () => {
    checkSetupState(
      () => {
        panelState.value = 'setup';
        setupStep.value = 1;
        resetPinInputs(setupP1, setupP1Inputs.value);
      },
      () => {
        panelState.value = 'unlock';
        nextTick(() => focusPinInput(unlockInputs.value[0]));
      }
    );
  };

  const goToStep2 = () => {
    const pin = setupP1.join('');
    if (pin.length < 6) {
      showToast(t('authenticator.toast_enter_full_pin'), true);
      return;
    }
    setupStep.value = 2;
    nextTick(() => {
      focusPinInput(setupP2Inputs.value[0]);
    });
  };

  const goBackToStep1 = () => {
    setupStep.value = 1;
    resetPinInputs(setupP2, setupP2Inputs.value);
    nextTick(() => {
      focusPinInput(setupP1Inputs.value[0]);
    });
  };

  const setupMasterPassword = () => {
    const p1 = setupP1.join('');
    const p2 = setupP2.join('');
    runSetupMasterPassword(p1, p2);
  };

  const unlockVault = () => {
    const pwd = unlockPasswordArray.join('');
    runUnlockVault(
      pwd,
      () => {},
      () => {
        resetPinInputs(unlockPasswordArray, unlockInputs.value);
      }
    );
  };

  const lockVault = () => {
    runLockVault(() => {
      resetPinInputs(unlockPasswordArray, unlockInputs.value);
    });
  };

  const exportVault = () => {
    runExportVault(masterPassword.value);
  };

  const importVault = () => {
    runImportVault(masterPassword.value);
  };

  const drawExportQr = () => {
    try {
      const migrationUrl = OtpMigrationDecoder.encodeMigration(accounts.value);
      nextTick(() => {
        if (exportQrCanvas.value && typeof QRious !== 'undefined') {
          new QRious({
            element: exportQrCanvas.value,
            value: migrationUrl,
            size: 140
          });
        }
      });
    } catch (err) {
      showToast('Không thể tạo mã QR Google Authenticator.', true);
    }
  };

  watch(exportTab, (newTab) => {
    if (newTab === 'google') {
      drawExportQr();
    }
  });

  // Lifecycle
  onMounted(() => {
    checkSetupStateCallback();
    startOTPLoop();
  });

  return {
    t,
    panelState,
    setupStep,
    accounts,
    searchQuery,
    filteredAccounts,
    otps,
    remainingSeconds,
    setupP1,
    setupP2,
    goToStep2,
    goBackToStep1,
    unlockPasswordArray,
    setupP1Inputs,
    setupP2Inputs,
    unlockInputs,
    quickForm,
    addForm,
    importText,
    exportText,
    qrCanvas,
    currentQrAccount,
    exportQrCanvas,
    exportTab,
    importTab,
    copyMigrationLink,
    qrFileInput,
    triggerQrFileSelect,
    handleQrFileSelect,
    handleImportPaste,
    scanCurrentTabQr,
    onPinInput,
    onPinDelete,
    setupMasterPassword,
    unlockVault,
    lockVault,
    addAccount,
    deleteAccount,
    exportVault,
    copyExportCode,
    importVault,
    showQR,
    copyQRImage,
    downloadQRImage,
    onQuickKeyInput,
    clearQuickKey,
    pasteQuickKey,
    copyQuickOTP,
    formatOTP,
    getBrandStyles,
    copyOTP
  };
}
