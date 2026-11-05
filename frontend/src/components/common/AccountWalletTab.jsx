import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMyWalletTransactions, fetchTopupStatus, topupWallet } from '../../services/api';
import { buildVietQrUrl, formatVnd } from '../../services/payment';
import { showToast } from './ToastNotification';
import PendingMembershipBanner from './PendingMembershipBanner';
import { notifyMembershipChanged } from '../../hooks/useMembershipStatus';
import '../../styles/membership.css';

const MIN_TOPUP = 1000;
const MAX_TOPUP = 50000000;
const PRESETS = [100000, 200000, 500000, 1000000];

const PURPOSE_LABEL = { WALLET_TOPUP: 'Nạp ví', MEMBERSHIP: 'Mua gói hội viên', BOOKING: 'Thanh toán đơn đặt sân' };
const STATUS_LABEL = { PAID: 'Đã thanh toán', PENDING: 'Chờ xác nhận', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn' };
const STATUS_CLASS = { PAID: 'ok', PENDING: 'wait', FAILED: 'bad', REFUNDED: 'bad' };

/** Tab "Ví & hội viên": số dư, gói đang dùng, nạp ví qua VietQR và lịch sử giao dịch. */
export default function AccountWalletTab({ balance, membership, pending, onChanged, onOpenMembership }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [topup, setTopup] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const pollTimerRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const list = await fetchMyWalletTransactions();
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      setHistoryError(err.message || 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Polling tự động kiểm tra trạng thái thanh toán nạp tiền
  useEffect(() => {
    if (!topup || !topup.paymentCode) return;

    setTimeLeft(900);
    const interval = setInterval(async () => {
      try {
        const res = await fetchTopupStatus(topup.paymentCode);
        if (res && res.status === 'PAID') {
          clearInterval(interval);
          setTopup(null);
          showToast('success', 'Nạp tiền vào ví thành công!', `Đã tự động cộng ${formatVnd(res.amount || topup.amount)} vào số dư ví của bạn!`, 5000);
          onChanged?.();
          notifyMembershipChanged();
          loadHistory();
        } else if (res && res.status === 'FAILED') {
          clearInterval(interval);
          setTopup(null);
          showToast('error', 'Lệnh nạp tiền thất bại', 'Lệnh nạp tiền đã bị hủy hoặc hết hạn.');
          loadHistory();
        }
      } catch (e) {
        // Lỗi mạng hoặc polling tạm thời, bỏ qua để lần sau thử lại
      }
    }, 3000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          clearInterval(interval);
          setTopup(null);
          showToast('warning', 'Hết thời gian giữ mã nạp', 'Mã QR nạp tiền đã hết hạn 15 phút. Vui lòng tạo mã nạp mới!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pollTimerRef.current = { interval, countdown };

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [topup, onChanged, loadHistory]);

  const handleTopup = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < MIN_TOPUP) {
      setError(`Số tiền nạp tối thiểu là ${formatVnd(MIN_TOPUP)} và phải là số nguyên.`);
      return;
    }
    if (value > MAX_TOPUP) {
      setError(`Mỗi lần nạp tối đa ${formatVnd(MAX_TOPUP)}.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await topupWallet(value, 'VIETQR');
      setTopup(res);
      showToast('info', 'Đã tạo mã QR nạp tiền', 'Vui lòng quét mã và chuyển khoản đúng nội dung. Tiền sẽ vào ví tự động ngay khi ngân hàng nhận được!');
      setAmount('');
      loadHistory();
      onChanged?.();
      notifyMembershipChanged();
    } catch (err) {
      setError(err.message || 'Không thể tạo yêu cầu nạp ví. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div>
      <PendingMembershipBanner pending={pending} />
      <div className="acc-row" style={{ marginBottom: '14px', background: '#f8fafc' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Số dư ví</span>
          <strong style={{ fontSize: '20px', color: '#0f172a' }}>{balance === null ? '—' : formatVnd(balance)}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Hội viên</span>
          {membership ? (
            <strong style={{ color: '#d97706' }}>
              <i className="fa-solid fa-crown"></i> {membership.package?.name} (−{Number(membership.discountPercent) || 0}%)
              <small style={{ display: 'block', color: '#64748b', fontWeight: 600 }}>
                Hết hạn {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString('vi-VN') : ''}
              </small>
            </strong>
          ) : (
            <button type="button" className="mem-btn primary" style={{ padding: '6px 12px' }} onClick={onOpenMembership}>
              Đăng ký hội viên
            </button>
          )}
        </div>
      </div>

      <form className="mem-panel" onSubmit={handleTopup} style={{ marginBottom: '16px' }}>
        <h4>Nạp tiền vào ví (VietQR)</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {PRESETS.map((p) => (
            <button type="button" key={p} className="mem-btn ghost" style={{ padding: '6px 12px' }} onClick={() => setAmount(String(p))}>
              {formatVnd(p)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_TOPUP}
            max={MAX_TOPUP}
            step="1000"
            className="form-input"
            style={{ flex: '1 1 160px' }}
            placeholder="Nhập số tiền (VNĐ)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit" className="mem-btn primary" disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo mã nạp'}
          </button>
        </div>
        {error && <div className="mem-banner error" role="alert" style={{ marginTop: '10px', marginBottom: 0 }}>{error}</div>}
      </form>

      {topup && (
        <div className="mem-panel mem-qr" style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h4>Quét mã VietQR để nạp {formatVnd(topup.amount)}</h4>
          <img src={buildVietQrUrl(topup.amount, topup.paymentCode)} alt="Mã VietQR nạp ví" style={{ maxWidth: '220px', margin: '0 auto 10px auto', display: 'block' }} />
          <p className="mem-meta">
            Nội dung chuyển khoản: <strong>{topup.paymentCode}</strong>
          </p>
          <div style={{ marginTop: '10px', padding: '8px 12px', background: '#eff6ff', borderRadius: '8px', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Đang chờ nhận tiền chuyển khoản tự động... (Hết hạn sau <strong>{timeFormatted}</strong>)</span>
          </div>
        </div>
      )}

      <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#0f172a' }}>Lịch sử giao dịch</h4>
      {loadingHistory && <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>Đang tải...</div>}
      {!loadingHistory && historyError && (
        <div className="mem-state">
          <p>{historyError}</p>
          <button type="button" className="mem-btn primary" onClick={loadHistory}>Thử lại</button>
        </div>
      )}
      {!loadingHistory && !historyError && history.length === 0 && (
        <div className="mem-state"><i className="fa-solid fa-receipt"></i>Chưa có giao dịch nào.</div>
      )}
      {!loadingHistory && !historyError && history.length > 0 && (
        <div className="acc-list">
          {history.map((p) => (
            <div className="acc-row" key={p.id ?? p.paymentCode}>
              <div>
                <strong>{PURPOSE_LABEL[p.purpose] || p.purpose}</strong>
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  {p.paymentCode} · {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{formatVnd(p.amount)}</strong>
                <div><span className={`acc-status ${STATUS_CLASS[p.status] || ''}`}>{STATUS_LABEL[p.status] || p.status}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
