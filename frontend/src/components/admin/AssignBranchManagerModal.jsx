import React, { useState, useEffect } from 'react';

export default function AssignBranchManagerModal({
  isOpen,
  onClose,
  branch,
  users = [],
  currentManager = null,
  onAssign,
  onRevoke
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentManager) {
      setSelectedUserId(currentManager.id || '');
    } else {
      setSelectedUserId('');
    }
    setSearchUser('');
    setErrorMsg('');
  }, [currentManager, isOpen]);

  if (!isOpen || !branch) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchUser.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Vui lòng chọn một tài khoản để ủy quyền làm Quản lý cửa hàng!');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onAssign(branch.id || branch.branchId, Number(selectedUserId));
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi ủy quyền.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!currentManager) return;
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền Quản lý cửa hàng của ${currentManager.fullName || currentManager.username} tại chi nhánh ${branch.name}?`)) {
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onRevoke(branch.id || branch.branchId, currentManager.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi hủy ủy quyền.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-box"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-user-shield" style={{ color: '#0284c7' }}></i>
            Ủy Quyền Quản Lý Cửa Hàng (Store Manager)
          </h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Chi nhánh chỉ định:</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7' }}>
              {branch.name || branch.branchName} ({branch.code || branch.branchCode})
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
              Địa chỉ: {branch.address || branch.branchAddress || '---'}
            </div>
            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '10px', paddingTop: '10px', fontSize: '13px' }}>
              Quản lý hiện tại: {currentManager ? (
                <strong style={{ color: '#059669' }}>
                  {currentManager.fullName || currentManager.username} ({currentManager.phone || currentManager.email})
                </strong>
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có người phụ trách</span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
            </div>
          )}

          <div className="form-group-item" style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '700', fontSize: '13.5px', color: '#334155' }}>
              Chọn Tài Khoản Ủy Quyền
            </label>
            <input
              type="text"
              placeholder="Gõ để tìm kiếm tài khoản theo tên, SĐT, username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '13px' }}
            />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              required
            >
              <option value="">-- Bấm để chọn tài khoản phụ trách --</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.username} ({u.username}) - {u.phone || u.email || 'Chưa có SĐT'} [{u.role}]
                </option>
              ))}
            </select>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '12.5px', color: '#166534', marginBottom: '20px', lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
            <strong>Quyền hạn Store Manager:</strong> Tài khoản được ủy quyền sẽ tự động được gán quyền <strong>ROLE_STAFF</strong>, chỉ có thể xem đơn hàng và quản lý số lượng tồn kho (qty) tại đúng chi nhánh <strong>{branch.name}</strong> này.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            {currentManager && (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isSubmitting}
                style={{ padding: '9px 16px', borderRadius: '8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-user-xmark"></i> Hủy Ủy Quyền
              </button>
            )}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                type="button"
                className="btn-tbl"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: '9px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '9px 18px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-shield-check"></i> Xác Nhận Ủy Quyền
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
