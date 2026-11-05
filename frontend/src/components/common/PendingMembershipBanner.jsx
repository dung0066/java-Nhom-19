import React, { useState } from 'react';
import { cancelPendingMembership } from '../../services/api';
import { formatVnd } from '../../services/payment';
import { notifyMembershipChanged } from '../../hooks/useMembershipStatus';
import { showToast } from './ToastNotification';
import '../../styles/membership.css';

/** Thông báo gói hội viên đang chờ xác nhận thanh toán, kèm nút hủy yêu cầu (hỏi lại một lần trước khi hủy). */
export default function PendingMembershipBanner({ pending }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!pending) return null;

  const handleCancel = async () => {
    setBusy(true);
    try {
      const res = await cancelPendingMembership(pending.id);
      showToast('success', 'Đã hủy yêu cầu', res?.message || 'Đã hủy yêu cầu đăng ký gói hội viên.');
      notifyMembershipChanged();
    } catch (err) {
      showToast('error', 'Không thể hủy', err.message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="mem-banner warn" role="status">
      <i className="fa-solid fa-hourglass-half"></i>{' '}
      Gói <strong>{pending.membershipPackage?.name}</strong> ({formatVnd(pending.pricePaid)}) đang <strong>chờ xác nhận thanh toán</strong>
      {' '}— mã <strong>{pending.subscriptionCode}</strong>. Hạng hội viên sẽ được cập nhật sau khi quản trị viên xác nhận đã nhận tiền.
      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {!confirming ? (
          <button type="button" className="mem-btn ghost" style={{ padding: '4px 12px' }} onClick={() => setConfirming(true)}>
            Hủy yêu cầu này
          </button>
        ) : (
          <>
            <button type="button" className="mem-btn primary" style={{ padding: '4px 12px' }} disabled={busy} onClick={handleCancel}>
              {busy ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
            <button type="button" className="mem-btn ghost" style={{ padding: '4px 12px' }} disabled={busy} onClick={() => setConfirming(false)}>
              Giữ lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}
