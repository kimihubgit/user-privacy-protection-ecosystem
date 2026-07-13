import { ref, reactive } from 'vue';
import { OtpMigrationDecoder, decryptData } from '../utils/otpHelper.js';
import { showToast } from '../../shared/toast.js';

export default function useAccountActions({ accounts, panelState, saveVault, updateOTPs, t }) {
  const addForm = reactive({
    label: '',
    key: ''
  });
  const importText = ref('');
  const exportText = ref('');
  const exportTab = ref('backup');
  const importTab = ref('qr');

  const addAccount = async () => {
    const label = addForm.label.trim();
    let key = addForm.key.trim().replace(/[\s-]/g, '').toUpperCase();

    if (!label || !key) {
      showToast(t('authenticator.toast_empty_fields'), true);
      return;
    }

    if (!/^[A-Z2-7]+$/.test(key)) {
      showToast(t('authenticator.toast_invalid_base32'), true);
      return;
    }

    accounts.value.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      label: label,
      secret: key
    });

    await saveVault();
    showToast(t('authenticator.toast_add_success'));
    addForm.label = '';
    addForm.key = '';
    panelState.value = 'home';
    if (updateOTPs) updateOTPs();
  };

  const deleteAccount = (id) => {
    const accountToDelete = accounts.value.find(a => a.id === id);
    if (!accountToDelete) return;

    const idx = accounts.value.indexOf(accountToDelete);
    accounts.value = accounts.value.filter(a => a.id !== id);

    saveVault().then(() => {
      showToast(
        t('authenticator.toast_delete_success', accountToDelete.label),
        false,
        () => {
          if (idx > -1) {
            accounts.value.splice(idx, 0, accountToDelete);
          } else {
            accounts.value.push(accountToDelete);
          }
          saveVault().then(() => {
            if (updateOTPs) updateOTPs();
          });
        }
      );
      if (updateOTPs) updateOTPs();
    });
  };

  const exportVault = (masterPassword) => {
    if (!masterPassword) return;
    chrome.storage.sync.get(['kiguard_2fa_vault'], (result) => {
      exportText.value = result.kiguard_2fa_vault || '';
      exportTab.value = 'backup';
      panelState.value = 'export';
    });
  };

  const copyExportCode = () => {
    navigator.clipboard.writeText(exportText.value).then(() => {
      showToast(t('authenticator.toast_backup_copied'));
    });
  };

  const importVault = async (masterPassword) => {
    const text = importText.value.trim();
    if (!text) return;

    if (text.startsWith('otpauth-migration://') || text.includes('data=') || (text.length > 100 && !text.includes('{') && !text.includes('['))) {
      try {
        const imported = OtpMigrationDecoder.decode(text);
        if (imported.length > 0) {
          const existingSecrets = accounts.value.map(a => a.secret.toUpperCase());
          let addedCount = 0;
          
          for (const acc of imported) {
            if (!existingSecrets.includes(acc.secret.toUpperCase())) {
              accounts.value.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + addedCount,
                label: acc.label,
                secret: acc.secret
              });
              addedCount++;
            }
          }
          
          if (addedCount > 0) {
            await saveVault();
            showToast(`Đã nhập thành công ${addedCount} tài khoản từ Google Authenticator!`);
            importText.value = '';
            panelState.value = 'home';
            if (updateOTPs) updateOTPs();
          } else {
            showToast('Tất cả tài khoản trong danh sách đã tồn tại.', true);
          }
        } else {
          showToast('Không tìm thấy tài khoản nào trong dữ liệu.', true);
        }
        return;
      } catch (err) {
        showToast('Giải mã dữ liệu Google Authenticator thất bại.', true);
        return;
      }
    }

    try {
      const vaultJson = await decryptData(text, masterPassword);
      const parsed = JSON.parse(vaultJson);
      if (Array.isArray(parsed)) {
        accounts.value = parsed;
        await saveVault();
        showToast(t('authenticator.toast_import_success'));
        importText.value = '';
        panelState.value = 'home';
        if (updateOTPs) updateOTPs();
      } else {
        showToast(t('authenticator.toast_import_invalid'), true);
      }
    } catch (e) {
      showToast(t('authenticator.toast_import_decrypt_fail'), true);
    }
  };

  const copyMigrationLink = () => {
    try {
      const migrationUrl = OtpMigrationDecoder.encodeMigration(accounts.value);
      navigator.clipboard.writeText(migrationUrl).then(() => {
        showToast('Đã copy đường dẫn đồng bộ Google Authenticator!');
      });
    } catch (err) {
      showToast('Lỗi sao chép đường dẫn.', true);
    }
  };

  return {
    addForm,
    importText,
    exportText,
    exportTab,
    importTab,
    addAccount,
    deleteAccount,
    exportVault,
    copyExportCode,
    importVault,
    copyMigrationLink
  };
}
