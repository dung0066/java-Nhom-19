import React, { useState } from 'react';
import { Search, X, Calendar, MapPin, Phone, User, Clock, CheckCircle2, AlertCircle, Trash2, ArrowRight, QrCode, CreditCard } from 'lucide-react';
import { lookupBookings, cancelBooking, getStoredUser } from '../services/api';
import OrderPayModal from './booking/OrderPayModal';

export default function BookingLookupModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const [searchError, setSearchError] = useState('');
  const [payingBooking, setPayingBooking] = useState(null);
  const currentUser = getStoredUser();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setCancelMsg('');
    setSearchError('');
    try {
      setSearchResults(await lookupBookings(query));
    } catch (err) {
      setSearchResults(null);
      setSearchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Quý khách có chắc chắn muốn hủy đơn đặt sân này không?\n\nLƯU Ý: Toàn bộ số tiền quý khách đã thanh toán (bao gồm cả tiền đặt cọc 50%) sẽ được hoàn trả 100% trực tiếp vào Ví D2 BadmintonShop ngay lập tức!')) return;
    try {
      const res = await cancelBooking(bookingId);
      const refunded = res?.refundedAmount;
      const msg = refunded && refunded > 0
        ? `Đã hủy đơn thành công! Hệ thống đã hoàn trả ${formatVND(refunded)} về Ví D2 BadmintonShop của bạn.`
        : (res?.message || 'Đã hủy đơn đặt sân thành công! Tiền thanh toán đã được hoàn về ví.');
      setCancelMsg(msg);
      setSearchResults((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
    } catch (err) {
      setCancelMsg('');
      setSearchError(err.message || 'Bạn cần đăng nhập bằng tài khoản đã đặt đơn này để hủy.');
    }
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel medium-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header-section">
          <h3 className="modal-heading">Tra Cứu Đơn Đặt Sân</h3>
          <p className="modal-sub">Nhập đầy đủ số điện thoại người đặt hoặc mã đơn đặt sân (WAY-...) để kiểm tra lịch chơi</p>
        </div>

        <form onSubmit={handleSearch} className="lookup-search-form">
          <div className="lookup-input-wrap">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Nhập SĐT (VD: 0909123456) hoặc Mã đơn (WAY-2026...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn-lookup-submit" disabled={isLoading}>
              {isLoading ? 'Đang tìm...' : 'Tra Cứu'}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="lookup-alert-success" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <AlertCircle size={15} />
            <span>{searchError}</span>
          </div>
        )}

        {cancelMsg && (
          <div className="lookup-alert-success" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={15} />
            <span>{cancelMsg}</span>
          </div>
        )}

        <div className="lookup-results-container">
          {searchResults === null ? (
            <div className="lookup-placeholder">
              <Clock size={36} className="text-muted" />
              <p>Nhập thông tin bên trên để tra cứu chi tiết lịch đặt sân và mã QR thanh toán.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="lookup-empty">
              <AlertCircle size={36} className="text-amber" />
              <p>Không tìm thấy đơn đặt sân nào phù hợp với từ khóa: <strong>{searchQuery}</strong></p>
              <span className="text-sub">Vui lòng kiểm tra lại số điện thoại hoặc mã đơn.</span>
            </div>
          ) : (
              {searchResults.map((b) => {
                const isDeposited = b.status === 'DEPOSITED';
                const isDepositOrder = b.isDeposit || isDeposited || (b.notes && (b.notes.includes('COC_50%') || b.notes.includes('50%')));

                return (
                  <div key={b.id || b.bookingCode} className="lookup-result-card">
                    <div className="card-top-row">
                      <div className="code-tag">
                        <strong>{b.bookingCode}</strong>
                        {b.status === 'CANCELLED' ? (
                          <span className="status-badge cancelled">ĐÃ HỦY</span>
                        ) : isDeposited ? (
                          <span className="status-badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>ĐÃ CỌC 50%</span>
                        ) : b.status === 'PENDING' ? (
                          <span className="status-badge" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>CHỜ THANH TOÁN</span>
                        ) : (
                          <span className="status-badge confirmed">ĐÃ THANH TOÁN ĐỦ</span>
                        )}
                        {isDepositOrder ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            CỌC 50%
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            THANH TOÁN 100%
                          </span>
                        )}
                      </div>
                      <div className="total-tag">{formatVND(b.totalPrice)}</div>
                    </div>

                    <div className="card-details-grid">
                      <div className="detail-item">
                        <User size={13} className="text-muted" />
                        <span>{b.customerName} - {b.customerPhone}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={13} className="text-emerald" />
                        <span>{b.branch?.name || 'D2 BadmintonShop NVL'}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={13} className="text-cyan" />
                        <span>Ngày chơi: <strong>{b.bookingDate}</strong></span>
                      </div>
                      <div className="detail-item">
                        <Clock size={13} className="text-amber" />
                        <span>Tổng thời gian: {b.totalHours || 1} giờ</span>
                      </div>
                    </div>

                    {isDepositOrder ? (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fffbeb', borderRadius: '6px', color: '#92400e', fontSize: '12px' }}>
                        {isDeposited ? (
                          <span>
                            Đã cọc 50%: <strong>{formatVND(b.paidAmount || (b.totalPrice * 0.5))}</strong> (Đã thanh toán) - Còn thiếu: <strong>{formatVND(b.remainingAmount || (b.totalPrice * 0.5))}</strong> (thanh toán online hoặc tại quầy khi nhận sân)
                          </span>
                        ) : b.status === 'CONFIRMED' ? (
                          <span>
                            ✓ Đã đặt cọc 50% ({formatVND(b.totalPrice * 0.5)}) + Đã thu nốt ({formatVND(b.totalPrice * 0.5)}) =&gt; <strong>Đã thanh toán đủ 100%!</strong>
                          </span>
                        ) : (
                          <span>
                            Cần thanh toán tiền cọc 50%: <strong>{formatVND(b.depositAmount || (b.totalPrice * 0.5))}</strong> - Còn lại thu tại quầy: <strong>{formatVND(b.remainingAmount || (b.totalPrice * 0.5))}</strong>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f0fdf4', borderRadius: '6px', color: '#166534', fontSize: '12px' }}>
                        {b.status === 'CONFIRMED' || b.status === 'PAID'
                          ? `✓ Đã thanh toán toàn bộ 100% (${formatVND(b.totalPrice)}). Đến sân quý khách chỉ cần đọc mã đặt chỗ để vào nhận sân.`
                          : `Chờ thanh toán toàn bộ 100% (${formatVND(b.totalPrice)}) qua VietQR hoặc tại quầy khi nhận sân.`}
                      </div>
                    )}

                    {b.status === 'CANCELLED' && (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#ecfdf5', borderRadius: '6px', color: '#065f46', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} />
                        <span>Đơn đã hủy - Toàn bộ tiền đã thanh toán được hoàn về Ví D2 BadmintonShop</span>
                      </div>
                    )}

                    {b.status !== 'CANCELLED' && (
                      <div className="card-actions-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {b.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => setPayingBooking(b)}
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              padding: '7px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <QrCode size={13} />
                            <span>{isDepositOrder ? 'Thanh toán tiền cọc 50%' : 'Thanh toán ngay (VietQR)'}</span>
                          </button>
                        )}

                        {isDeposited && (
                          <button
                            type="button"
                            onClick={() => setPayingBooking(b)}
                            style={{
                              background: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              padding: '7px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CreditCard size={13} />
                            <span>Thanh toán nốt 50% online ({formatVND(b.remainingAmount || (b.totalPrice * 0.5))})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="btn-cancel-order"
                        >
                          <Trash2 size={13} />
                          <span>Hủy đơn & hoàn tiền về Ví</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {payingBooking && (
        <OrderPayModal
          isOpen={!!payingBooking}
          onClose={() => setPayingBooking(null)}
          booking={payingBooking}
          currentUser={currentUser}
          onSuccess={async () => {
            setPayingBooking(null);
            if (searchQuery.trim()) {
              try {
                setSearchResults(await lookupBookings(searchQuery.trim()));
              } catch (e) {}
            }
          }}
        />
      )}
    </div>
  );
}
