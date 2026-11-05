import React, { useCallback, useEffect, useState } from 'react';
import ModalPortal from './ModalPortal';
import {
  fetchBranchTrash,
  fetchCourtTrash,
  restoreAdminBranch,
  restoreAdminCourt,
  permanentDeleteAdminBranch,
  permanentDeleteAdminCourt
} from '../../services/api';
import '../../styles/membership.css';

const CONFIG = {
  branches: {
    title: 'Thùng rác chi nhánh',
    hint: 'Chi nhánh bị xóa tạm kéo theo các sân của nó. Khôi phục chi nhánh sẽ khôi phục luôn các sân bị xóa cùng lúc.',
    load: fetchBranchTrash,
    restore: restoreAdminBranch,
    destroy: permanentDeleteAdminBranch
  },
  courts: {
    title: 'Thùng rác sân đấu',
    hint: 'Sân của chi nhánh đang nằm trong thùng rác chỉ khôi phục được sau khi khôi phục chi nhánh.',
    load: fetchCourtTrash,
    restore: restoreAdminCourt,
    destroy: permanentDeleteAdminCourt
  }
};

const fmt = (v) => (v ? new Date(v).toLocaleString('vi-VN') : '—');

/**
 * Hộp thoại thùng rác: liệt kê chi nhánh, sân, dụng cụ hoặc bài viết đã xóa tạm, cho khôi phục hoặc xóa vĩnh viễn.
 */
export default function AdminTrashModal({
  type,
  title: customTitle,
  hint: customHint,
  items: customItems,
  onRestore: customRestore,
  onDestroy: customDestroy,
  onClearAll: customClearAll,
  onClose,
  onChanged
}) {
  const isCustom = Array.isArray(customItems);
  const cfg = CONFIG[type] || {
    title: customTitle || 'Thùng rác',
    hint: customHint || 'Danh sách các mục đã xóa tạm. Bạn có thể khôi phục lại hoặc xóa vĩnh viễn.',
    load: null,
    restore: customRestore,
    destroy: customDestroy
  };

  const [items, setItems] = useState(isCustom ? customItems : null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isCustom) {
      setItems(customItems);
    }
  }, [isCustom, customItems]);

  const load = useCallback(async () => {
    if (isCustom) {
      setItems(customItems);
      return;
    }
    setItems(null);
    setError('');
    try {
      const list = await cfg.load();
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Không thể tải thùng rác');
    }
  }, [cfg, isCustom, customItems]);

  useEffect(() => {
    if (!isCustom) {
      load();
    }
  }, [load, isCustom]);

  const run = async (item, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(item.id);
    setMessage(null);
    try {
      if (isCustom) {
        if (action) await action(item);
        setMessage({ ok: true, text: 'Thao tác thành công!' });
      } else {
        const res = await action(item.id);
        setMessage({ ok: true, text: res?.message || 'Thành công!' });
        await load();
      }
      onChanged?.();
    } catch (err) {
      setMessage({ ok: false, text: err.message || 'Thao tác thất bại' });
    } finally {
      setBusyId(null);
    }
  };

  const label = (item) => {
    if (type === 'branches') return `${item.name} (${item.code})`;
    if (type === 'courts') return `${item.name} — ${item.branchName}`;
    return item.name || item.title || `#${item.id}`;
  };

  const thumb = (item) => item.imageUrl || item.image;

  return (
    <ModalPortal>
      <div className="admin-modal-backdrop show" onClick={onClose}>
        <div className="admin-modal-box" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3><i className="fa-solid fa-trash-can"></i> {cfg.title}</h3>
            <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Đóng">&times;</button>
          </div>
          <div className="admin-modal-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{cfg.hint}</p>
              {isCustom && items && items.length > 0 && customClearAll && (
                <button
                  type="button"
                  className="btn-tbl btn-tbl-delete"
                  style={{ padding: '6px 12px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                  onClick={customClearAll}
                >
                  <i className="fa-solid fa-trash-can"></i> Dọn sạch thùng rác
                </button>
              )}
            </div>

            {message && (
              <div className={`mem-banner ${message.ok ? 'active' : 'error'}`} role="status">{message.text}</div>
            )}

            {!items && !error && <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>Đang tải thùng rác...</div>}
            {error && (
              <div className="mem-state">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p>{error}</p>
                <button type="button" className="mem-btn primary" onClick={load}>Thử lại</button>
              </div>
            )}
            {items && items.length === 0 && (
              <div className="mem-state" style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                <i className="fa-solid fa-trash-can" style={{ fontSize: '32px', marginBottom: '10px', display: 'block', color: '#cbd5e1' }}></i>
                Thùng rác trống. Các mục đã xóa tạm sẽ hiển thị tại đây để bạn có thể khôi phục lại khi cần.
              </div>
            )}
            {items && items.length > 0 && (
              <div className="acc-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div className="acc-row" key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '12px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      {thumb(item) && (
                        <img
                          src={thumb(item)}
                          alt={label(item)}
                          style={{ width: '56px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', flexShrink: 0 }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{label(item)}</strong>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {item.brand && (
                            <span style={{ color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>{item.brand}</span>
                          )}
                          {(item.categoryLabel || item.category) && (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                              {item.categoryLabel || item.category}
                            </span>
                          )}
                          {item.price ? (
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>
                              {(item.price || 0).toLocaleString('vi-VN')} đ
                            </span>
                          ) : null}
                          <span>Xóa lúc {fmt(item.deletedAt)}</span>
                          {type === 'courts' && item.branchDeleted && (
                            <span className="acc-status wait" style={{ marginLeft: '4px' }}>Chi nhánh đang trong thùng rác</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-success"
                        disabled={busyId === item.id}
                        onClick={() => run(item, cfg.restore)}
                      >
                        <i className="fa-solid fa-rotate-left"></i> Khôi phục
                      </button>
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-delete"
                        disabled={busyId === item.id}
                        onClick={() => run(item, cfg.destroy, `Xóa vĩnh viễn "${label(item)}"? Thao tác này không thể hoàn tác.`)}
                      >
                        <i className="fa-solid fa-xmark"></i> Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
