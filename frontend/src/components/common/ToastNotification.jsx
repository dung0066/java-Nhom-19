import React, { useState, useEffect } from 'react';
import '../../styles/toast.css';

/**
 * Global helper to trigger slide-in Toast from any component or service
 * @param {'success' | 'error' | 'warning' | 'info'} type
 * @param {string} title
 * @param {string} message
 * @param {number} duration (in milliseconds, default 3500ms)
 */
export function showToast(type = 'success', title = '', message = '', duration = 3500) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('d2_toast', {
        detail: {
          id: Date.now() + Math.random(),
          type,
          title,
          message,
          duration
        }
      })
    );
  }
}

/**
 * Toast Container Component
 * Renders slide-in notification toasts from the top-right edge
 */
export default function ToastNotification() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = e.detail;
      if (!newToast) return;

      setToasts((prev) => [...prev, { ...newToast, exiting: false }]);

      // Auto dismiss after duration
      const duration = newToast.duration || 3500;
      setTimeout(() => {
        dismissToast(newToast.id);
      }, duration);
    };

    window.addEventListener('d2_toast', handleToastEvent);
    return () => window.removeEventListener('d2_toast', handleToastEvent);
  }, []);

  const dismissToast = (id) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // Remove from DOM after exit animation completes (320ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="d2-toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        let iconClass = 'fa-solid fa-circle-check';
        let badgeLabel = 'Thành công';

        if (isError) {
          iconClass = 'fa-solid fa-circle-xmark';
          badgeLabel = 'Thất bại';
        } else if (isWarning) {
          iconClass = 'fa-solid fa-triangle-exclamation';
          badgeLabel = 'Lưu ý';
        } else if (toast.type === 'info') {
          iconClass = 'fa-solid fa-circle-info';
          badgeLabel = 'Thông báo';
        }

        return (
          <div
            key={toast.id}
            className={`d2-toast-card ${toast.type || 'info'} ${toast.exiting ? 'exiting' : ''}`}
            role="alert"
          >
            {/* Left Accent Icon Box */}
            <div className="d2-toast-icon-wrap">
              <i className={iconClass}></i>
            </div>

            {/* Main Content */}
            <div className="d2-toast-content">
              <div className="d2-toast-header-row">
                <span className="d2-toast-title">
                  {toast.title || (isSuccess ? 'Thành công' : 'Thông báo')}
                </span>
                <span className="d2-toast-badge">{badgeLabel}</span>
              </div>
              <p className="d2-toast-desc">{toast.message}</p>
            </div>

            {/* Manual Close Button */}
            <button
              type="button"
              className="d2-toast-close-btn"
              onClick={() => dismissToast(toast.id)}
              title="Đóng thông báo"
              aria-label="Đóng"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Bottom Progress Bar */}
            <div className="d2-toast-progress-track">
              <div
                className="d2-toast-progress-bar"
                style={{ animationDuration: `${toast.duration || 3500}ms` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

