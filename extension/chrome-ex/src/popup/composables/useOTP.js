import { ref, reactive, onUnmounted } from 'vue';
import { generateTOTP } from '../utils/otpHelper.js';
import { showToast } from '../../shared/toast.js';

export default function useOTP({ accounts, panelState, t }) {
  const otps = reactive({});
  const remainingSeconds = ref(30);
  let timerInterval = null;

  const quickForm = reactive({
    key: '',
    otp: '------',
    isError: false
  });

  const formatOTP = (code) => {
    if (!code || code === '------' || code === t('authenticator.key_error')) return code || '------';
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  };

  const getBrandStyles = (label) => {
    const clean = label.toLowerCase();
    let gradient = 'linear-gradient(135deg, #727cf5 0%, #0acf97 100%)';
    let letter = label.trim().charAt(0).toUpperCase();

    if (clean.includes('facebook') || clean.includes('fb')) {
      gradient = 'linear-gradient(135deg, #1877f2 0%, #0056b3 100%)';
      letter = 'F';
    } else if (clean.includes('google') || clean.includes('gmail') || clean.includes('g-')) {
      gradient = 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)';
      letter = 'G';
    } else if (clean.includes('github')) {
      gradient = 'linear-gradient(135deg, #24292e 0%, #0f1115 100%)';
      letter = 'H';
    } else if (clean.includes('telegram') || clean.includes('tg')) {
      gradient = 'linear-gradient(135deg, #229ed9 0%, #177aa9 100%)';
      letter = 'T';
    } else if (clean.includes('discord')) {
      gradient = 'linear-gradient(135deg, #5865f2 0%, #3b429f 100%)';
      letter = 'D';
    } else if (clean.includes('binance')) {
      gradient = 'linear-gradient(135deg, #f0b90b 0%, #ba8b00 100%)';
      letter = 'B';
    } else if (clean.includes('microsoft') || clean.includes('outlook') || clean.includes('live') || clean.includes('ms')) {
      gradient = 'linear-gradient(135deg, #0078d4 0%, #005697 100%)';
      letter = 'M';
    }
    return { gradient, letter };
  };

  const copyOTP = (acc) => {
    const code = otps[acc.id];
    if (code && code !== '------') {
      navigator.clipboard.writeText(code).then(() => {
        showToast(t('authenticator.toast_otp_copied', acc.label));
      });
    }
  };

  const updateOTPs = async () => {
    const epoch = Math.floor(Date.now() / 1000);
    remainingSeconds.value = 30 - (epoch % 30);

    if (panelState.value === 'home') {
      for (const acc of accounts.value) {
        otps[acc.id] = await generateTOTP(acc.secret);
      }
    }

    if (panelState.value === 'unlock' && quickForm.key) {
      let cleaned = quickForm.key.replace(/[\s-]/g, '').toUpperCase();
      if (/^[A-Z2-7]+$/.test(cleaned)) {
        quickForm.otp = await generateTOTP(cleaned);
      }
    }
  };

  const startOTPLoop = () => {
    stopOTPLoop();
    updateOTPs();
    timerInterval = setInterval(updateOTPs, 1000);
  };

  const stopOTPLoop = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // Quick OTP Handlers
  const onQuickKeyInput = () => {
    updateQuickOTP();
  };

  const clearQuickKey = () => {
    quickForm.key = '';
    quickForm.otp = '------';
    quickForm.isError = false;
  };

  const pasteQuickKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        quickForm.key = text.trim();
        updateQuickOTP();
      }
    } catch (err) {
      showToast(t('authenticator.toast_paste_error'), true);
    }
  };

  const updateQuickOTP = async () => {
    let val = quickForm.key.trim().replace(/[\s-]/g, '').toUpperCase();
    if (!val) {
      quickForm.otp = '------';
      quickForm.isError = false;
      return;
    }

    if (!/^[A-Z2-7]+$/.test(val)) {
      quickForm.otp = t('authenticator.key_error');
      quickForm.isError = true;
      return;
    }

    quickForm.isError = false;
    const code = await generateTOTP(val);
    quickForm.otp = code;
  };

  const copyQuickOTP = () => {
    const code = quickForm.otp.replace(' ', '');
    if (code && code !== '------' && code !== t('authenticator.key_error')) {
      navigator.clipboard.writeText(code).then(() => {
        showToast(t('authenticator.toast_quick_otp_copied'));
      });
    }
  };

  onUnmounted(() => {
    stopOTPLoop();
  });

  return {
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
  };
}
