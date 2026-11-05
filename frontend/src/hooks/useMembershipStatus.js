import { useCallback, useEffect, useState } from 'react';
import { fetchMyActiveMembership, fetchMyMembershipHistory, fetchMyWalletBalance } from '../services/api';

const EMPTY = { membership: null, pending: null, balance: null };

/** Báo cho mọi nơi đang hiển thị hạng hội viên và số dư ví biết dữ liệu vừa thay đổi (mua gói, hủy, nạp ví). */
export function notifyMembershipChanged() {
  window.dispatchEvent(new Event('d2_membership_changed'));
}

/**
 * Trạng thái hội viên của người dùng lấy từ máy chủ:
 * membership = gói đang hiệu lực, pending = gói đang chờ thanh toán, balance = số dư ví.
 */
export default function useMembershipStatus(user) {
  const userId = user?.id;
  const [state, setState] = useState(EMPTY);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [active, history, wallet] = await Promise.all([
        fetchMyActiveMembership(userId),
        fetchMyMembershipHistory(userId),
        fetchMyWalletBalance()
      ]);
      setState({
        membership: active?.isMember ? active : null,
        pending: Array.isArray(history) ? history.find((h) => h.status === 'PENDING') || null : null,
        balance: Number(wallet?.balance) || 0
      });
    } catch {
      setState(EMPTY);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    window.addEventListener('d2_membership_changed', refresh);
    return () => window.removeEventListener('d2_membership_changed', refresh);
  }, [refresh]);

  return { ...(userId ? state : EMPTY), refresh };
}
