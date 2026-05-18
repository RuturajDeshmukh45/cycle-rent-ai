import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

/**
 * Popup / Modal component
 * variant: 'confirm' | 'alert' | 'success' | 'danger' | 'form'
 */
const Popup = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'confirm',
  loading = false,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const icons = {
    confirm: <Info size={22} style={{ color: 'var(--accent)' }} />,
    alert: <AlertTriangle size={22} style={{ color: 'var(--warning)' }} />,
    success: <CheckCircle size={22} style={{ color: 'var(--success)' }} />,
    danger: <Trash2 size={22} style={{ color: 'var(--danger)' }} />,
    form: null,
  };

  const confirmBtnStyle = variant === 'danger'
    ? { background: 'var(--danger)', color: '#fff', border: 'none' }
    : { background: 'var(--accent)', color: '#fff', border: 'none' };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'popupIn .18s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        {(icons[variant] || title) && (
          <div className="flex items-center gap-3 mb-4">
            {icons[variant] && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: variant === 'danger' ? 'rgba(239,68,68,0.1)'
                    : variant === 'success' ? 'rgba(34,197,94,0.1)'
                    : variant === 'alert' ? 'rgba(245,158,11,0.1)'
                    : 'rgba(34,197,94,0.1)',
                }}
              >
                {icons[variant]}
              </div>
            )}
            <h3 className="text-base font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
        )}

        {/* Message */}
        {message && (
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        {/* Custom children (for form variant) */}
        {children && <div className="mb-5">{children}</div>}

        {/* Actions */}
        {(onConfirm || variant !== 'form') && !children && (
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: 'Space Grotesk' }}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                style={{ ...confirmBtnStyle, fontFamily: 'Space Grotesk' }}
              >
                {loading && <span className="spinner inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />}
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes popupIn{from{opacity:0;transform:scale(.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

export default Popup;
