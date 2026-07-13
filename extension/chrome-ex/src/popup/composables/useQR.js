import { ref, nextTick } from 'vue';
import { processQrImage, scanCurrentTabQr as captureTabQr } from '../utils/qrScanner.js';
import { showToast } from '../../shared/toast.js';

export default function useQR({ accounts, panelState, onImportScanned, t }) {
  const qrCanvas = ref(null);
  const currentQrAccount = ref(null);
  const exportQrCanvas = ref(null);
  const qrFileInput = ref(null);

  const showQR = (acc) => {
    currentQrAccount.value = acc;
    panelState.value = 'qr';

    const otpauthUrl = `otpauth://totp/KiGuard:${encodeURIComponent(acc.label)}?secret=${acc.secret}&issuer=KiGuard`;

    nextTick(() => {
      if (qrCanvas.value && typeof QRious !== 'undefined') {
        new QRious({
          element: qrCanvas.value,
          value: otpauthUrl,
          size: 160
        });
      }
    });
  };

  const copyQRImage = () => {
    if (qrCanvas.value) {
      qrCanvas.value.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast(t('authenticator.toast_qr_copied'));
        } catch (err) {
          showToast(t('authenticator.toast_qr_copy_error'), true);
        }
      }, 'image/png');
    }
  };

  const downloadQRImage = () => {
    if (currentQrAccount.value && qrCanvas.value) {
      const link = document.createElement('a');
      link.download = `kiguard_2fa_${currentQrAccount.value.label.replace(/\s+/g, '_')}.png`;
      link.href = qrCanvas.value.toDataURL('image/png');
      link.click();
      showToast(t('authenticator.toast_qr_downloaded'));
    }
  };

  const triggerQrFileSelect = () => {
    if (qrFileInput.value) {
      qrFileInput.value.value = '';
      qrFileInput.value.click();
    }
  };

  const handleQrFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processQrImage(file)
        .then((data) => {
          if (onImportScanned) onImportScanned(data);
        })
        .catch((err) => {
          showToast(err.message, true);
        });
    }
  };

  const handleImportPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          processQrImage(file)
            .then((data) => {
              if (onImportScanned) onImportScanned(data);
            })
            .catch((err) => {
              showToast(err.message, true);
            });
          e.preventDefault();
          break;
        }
      }
    }
  };

  const scanCurrentTabQr = () => {
    showToast("Đang quét mã QR trên màn hình...");
    captureTabQr()
      .then((data) => {
        if (onImportScanned) onImportScanned(data);
      })
      .catch((err) => {
        showToast(err.message, true);
      });
  };

  return {
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
  };
}
