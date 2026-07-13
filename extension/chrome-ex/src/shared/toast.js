/**
 * Unified Toast notification — Shared between CookieController and ProxyController.
 * Previously duplicated in both files with slightly different implementations.
 * 
 * Usage:
 *   import { showToast } from '../shared/toast.js';
 *   showToast('Success message');
 *   showToast('Error occurred!', true);
 *   showToast('Deleted item', false, () => { restoreItem(); });
 */

let toastTimeout = null;
let toastHideTimeout = null;

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {boolean} [isError=false] - Whether this is an error toast
 * @param {Function|null} [undoCallback=null] - Optional undo action callback
 * @param {number} [duration] - Auto-hide duration in ms (default: 2500, or 6000 with undo)
 */
export function showToast(message, isError = false, undoCallback = null, duration) {
    const toast = document.getElementById('cookie-toast');
    if (!toast) return;

    // Reset animation to force restart fade-in
    toast.style.animation = 'none';
    void toast.offsetWidth; // Trigger reflow
    toast.style.animation = '';

    toast.innerHTML = '';

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (undoCallback) {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Hoàn tác';
        undoBtn.className = 'cookie-toast-undo-btn';
        Object.assign(undoBtn.style, {
            marginLeft: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--primary-blue)',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: '700',
            padding: '0',
            fontFamily: 'inherit',
            fontSize: '11px',
            transition: 'color 0.2s'
        });

        undoBtn.addEventListener('mouseenter', () => {
            undoBtn.style.color = 'var(--primary-blue-hover, #187de4)';
        });
        undoBtn.addEventListener('mouseleave', () => {
            undoBtn.style.color = 'var(--primary-blue)';
        });

        undoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            undoCallback();
            hideToast();
        });
        toast.appendChild(undoBtn);
    }

    toast.className = `cookie-toast${isError ? ' error' : ''}`;
    toast.style.display = 'block';

    // Clear existing timeouts
    if (toastTimeout) clearTimeout(toastTimeout);
    if (toastHideTimeout) clearTimeout(toastHideTimeout);

    // Toast with undo should stay longer
    const autoDuration = duration || (undoCallback ? 6000 : 2500);

    toastTimeout = setTimeout(() => {
        hideToast();
    }, autoDuration);
}

/**
 * Hide the current toast notification
 */
export function hideToast() {
    const toast = document.getElementById('cookie-toast');
    if (!toast || toast.style.display === 'none') return;

    toast.style.animation = 'fadeOut 0.3s ease forwards';
    toastHideTimeout = setTimeout(() => {
        toast.style.display = 'none';
        toast.style.animation = '';
    }, 300);
}
