import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { buyMembership, fetchMembershipPackages, getStoredUser } from '../../services/api';
import useMembershipStatus, { notifyMembershipChanged } from '../../hooks/useMembershipStatus';
import PendingMembershipBanner from '../common/PendingMembershipBanner';
import { buildVietQrUrl, formatVnd } from '../../services/payment';
import { showToast } from '../common/ToastNotification';
import '../../styles/membership.css';

const hhmm = (time) => (time ? String(time).slice(0, 5) : null);

/** Mô tả khung giờ được giảm giá của gói (gói thường giảm cả ngày nên trả về null). */
function describeDiscountWindow(pkg) {
  const from = hhmm(pkg.discountFromTime);
  const to = hhmm(pkg.discountToTime);
  if (from && from !== '00:00' && to) return `Giảm cho slot bắt đầu từ ${from} đến trước ${to}`;
  if (from && from !== '00:00') return `Giảm cho slot bắt đầu từ ${from}`;
  if (to) return `Giảm cho slot bắt đầu trước ${to}`;
  return null;
}

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

export default function MembershipModal({ isOpen, onClose }) {
  const modalBoxRef = useRef(null);
  const [user, setUser] = useState(getStoredUser());
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const { membership: active, pending, balance } = useMembershipStatus(isOpen ? user : null);
  const [selectedId, setSelectedId] = useState(null);
  const [method, setMethod] = useState('WALLET');
  const [submitting, setSubmitting] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [result, setResult] = useState(null);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setPackages(await fetchMembershipPackages());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onAuth = () => setUser(getStoredUser());
    window.addEventListener('d2_auth_changed', onAuth);
    return () => window.removeEventListener('d2_auth_changed', onAuth);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setBuyError('');
    setSelectedId(null);
    loadPackages();
    if (modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, autoAlpha: 0, y: -20 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
      );
    }
  }, [isOpen, loadPackages]);

  if (!isOpen) return null;

  const selected = packages.find((p) => p.id === selectedId) || null;
  const walletEnough = selected && balance !== null && balance >= Number(selected.price);

  const choosePackage = (pkg) => {
    setSelectedId(pkg.id);
    setBuyError('');
    setResult(null);
    setMethod(balance !== null && balance >= Number(pkg.price) ? 'WALLET' : 'VIETQR');
  };

  const handleBuy = async () => {
    if (!user) {
      showToast('info', 'Cần đăng nhập', 'Vui lòng đăng nhập để đăng ký gói hội viên.');
      window.dispatchEvent(new Event('d2_open_auth'));
      return;
    }
    setSubmitting(true);
    setBuyError('');
    try {
      const res = await buyMembership(selected.id, method);
      setResult(res);
      showToast(
        res.membershipStatus === 'ACTIVE' ? 'success' : 'info',
        res.membershipStatus === 'ACTIVE' ? 'Đã kích hoạt hội viên' : 'Đã tạo đăng ký',
        res.message
      );
      notifyMembershipChanged();
    } catch (err) {
      setBuyError(err.message || 'Không thể đăng ký gói hội viên. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setResult(null);
    onClose();
  };

  return (
    <div className="modal-overlay show mem-overlay">
      <div className="modal-box mem-box" ref={modalBoxRef}>
        <div className="modal-head mem-head">
          <h3>
            <i className="fa-solid fa-crown" style={{ marginRight: '8px' }}></i>
            Đặc Quyền Hội Viên Ways Station Badminton
          </h3>
          <button className="close-x" onClick={closeAndReset} style={{ color: '#fff' }} aria-label="Đóng">
            &times;
          </button>
        </div>

        <div className="mem-body">
          {result ? (
            <ResultView result={result} onClose={closeAndReset} onBuyMore={() => setResult(null)} />
          ) : (
            <>
              <p className="mem-intro">
                Chọn gói hội viên để được giảm giá giờ chơi tự động khi đặt sân. Gói mua sau sẽ nối tiếp ngay khi gói hiện tại hết hạn.
              </p>

              <PendingMembershipBanner pending={pending} />
              {active && (
                <div className="mem-banner active">
                  <i className="fa-solid fa-circle-check"></i> Bạn đang là <strong>{active.package?.name}</strong>
                  {' '}— giảm {Number(active.discountPercent) || 0}%, hết hạn {formatDate(active.expiresAt)}.
                </div>
              )}
              {!user && (
                <div className="mem-banner warn">
                  <i className="fa-solid fa-user-lock"></i> Bạn cần đăng nhập để đăng ký gói hội viên.
                  {' '}
                  <button type="button" className="mem-btn ghost" style={{ padding: '4px 12px' }}
                    onClick={() => window.dispatchEvent(new Event('d2_open_auth'))}>
                    Đăng nhập
                  </button>
                </div>
              )}

              {loading && (
                <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>Đang tải các gói hội viên...</div>
              )}
              {!loading && loadError && (
                <div className="mem-state">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <p>{loadError}</p>
                  <button type="button" className="mem-btn primary" onClick={loadPackages}>Thử lại</button>
                </div>
              )}
              {!loading && !loadError && packages.length === 0 && (
                <div className="mem-state"><i className="fa-solid fa-box-open"></i>Hiện chưa có gói hội viên nào được mở bán.</div>
              )}

              {!loading && !loadError && packages.length > 0 && (
                <div className="mem-grid">
                  {packages.map((pkg) => {
                    const windowText = describeDiscountWindow(pkg);
                    return (
                      <div
                        key={pkg.id}
                        className={`mem-card ${pkg.id === selectedId ? 'selected' : ''}`}
                        onClick={() => choosePackage(pkg)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && choosePackage(pkg)}
                      >
                        <i className={`mem-card-icon ${pkg.icon || 'fa-solid fa-crown'}`} style={{ color: pkg.badgeColor || '#f59e0b' }}></i>
                        <h4>{pkg.name}</h4>
                        <span className="mem-percent">Giảm {Number(pkg.discountPercent)}%</span>
                        <span className="mem-price">{formatVnd(pkg.price)}</span>
                        <span className="mem-meta">Thời hạn {pkg.durationDays} ngày</span>
                        {windowText && <span className="mem-meta">{windowText}</span>}
                        {pkg.studentOnly && <span className="mem-tag">Cần xác thực sinh viên</span>}
                        {pkg.description && <span className="mem-meta">{pkg.description}</span>}
                        {pkg.benefits?.length > 0 && (
                          <ul className="mem-benefits">
                            {pkg.benefits.map((b, i) => <li key={b.id ?? i}>{b.description}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selected && (
                <div className="mem-panel">
                  <h4>Thanh toán gói {selected.name} — {formatVnd(selected.price)}</h4>
                  <div className="mem-pay-options">
                    <label className={`mem-pay ${method === 'WALLET' ? 'selected' : ''} ${!walletEnough ? 'disabled' : ''}`}>
                      <input type="radio" name="mem-method" checked={method === 'WALLET'} disabled={!walletEnough}
                        onChange={() => setMethod('WALLET')} />
                      <span>
                        <strong>Ví Ways Station</strong>
                        <small>
                          {!user ? 'Đăng nhập để dùng ví'
                            : balance === null ? 'Không tải được số dư ví'
                            : walletEnough ? `Số dư ${formatVnd(balance)} — kích hoạt ngay`
                            : `Số dư ${formatVnd(balance)} không đủ, hãy nạp thêm hoặc chọn VietQR`}
                        </small>
                      </span>
                    </label>
                    <label className={`mem-pay ${method === 'VIETQR' ? 'selected' : ''}`}>
                      <input type="radio" name="mem-method" checked={method === 'VIETQR'} onChange={() => setMethod('VIETQR')} />
                      <span>
                        <strong>Chuyển khoản VietQR</strong>
                        <small>Quét mã để chuyển khoản; gói được kích hoạt sau khi quản trị viên xác nhận</small>
                      </span>
                    </label>
                  </div>

                  {buyError && <div className="mem-banner error" role="alert">{buyError}</div>}

                  <div className="mem-actions">
                    <button type="button" className="mem-btn ghost" onClick={closeAndReset}>Đóng</button>
                    <button type="button" className="mem-btn primary" disabled={submitting || !!pending || (method === 'WALLET' && !walletEnough)}
                      onClick={handleBuy}>
                      {submitting ? 'Đang xử lý...' : <><i className="fa-solid fa-crown"></i> Đăng ký gói này</>}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultView({ result, onClose, onBuyMore }) {
  const isActive = result.membershipStatus === 'ACTIVE';
  return (
    <div className="mem-qr">
      <div className={`mem-banner ${isActive ? 'active' : 'warn'}`}>
        <strong>{isActive ? 'Đăng ký thành công!' : 'Đã tạo đăng ký, đang chờ thanh toán'}</strong>
        <div>{result.message}</div>
      </div>

      {!isActive && (
        <>
          <img src={buildVietQrUrl(result.amount, result.paymentCode)} alt="Mã VietQR thanh toán gói hội viên" />
          <p className="mem-meta">Giữ nguyên nội dung chuyển khoản <strong>{result.paymentCode}</strong> để được xác nhận nhanh.</p>
        </>
      )}

      <dl className="mem-kv">
        <dt>Gói</dt><dd>{result.packageName}</dd>
        <dt>Mã đăng ký</dt><dd>{result.subscriptionCode}</dd>
        <dt>Mã thanh toán</dt><dd>{result.paymentCode}</dd>
        <dt>Số tiền</dt><dd>{formatVnd(result.amount)}</dd>
        <dt>Giảm giá</dt><dd>{Number(result.discountPercent)}% giờ chơi</dd>
        <dt>Hiệu lực</dt><dd>{formatDate(result.startDate)} – {formatDate(result.endDate)}</dd>
        <dt>Trạng thái</dt><dd>{isActive ? 'Đã kích hoạt' : 'Chờ xác nhận thanh toán'}</dd>
      </dl>

      <div className="mem-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="mem-btn ghost" onClick={onBuyMore}>Xem các gói khác</button>
        <button type="button" className="mem-btn primary" onClick={onClose}>Hoàn tất</button>
      </div>
    </div>
  );
}
