import React, { useState } from 'react';
import { Search, X, Calendar, MapPin, Phone, User, Clock, CheckCircle2, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { lookupBookings, cancelBooking } from '../services/api';

export default function BookingLookupModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const [searchError, setSearchError] = useState('');

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
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này không?')) return;
    try {
      await cancelBooking(bookingId);
      setCancelMsg('Đã hủy đơn đặt sân thành công!');
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
          <div className="lookup-alert-success">
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
            <div className="lookup-cards-list">
              {searchResults.map((b) => (
                <div key={b.id || b.bookingCode} className="lookup-result-card">
                  <div className="card-top-row">
                    <div className="code-tag">
                      <strong>{b.bookingCode}</strong>
                      <span className={`status-badge ${b.status === 'CANCELLED' ? 'cancelled' : 'confirmed'}`}>
                        {b.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'ĐÃ XÁC NHẬN'}
                      </span>
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
                      <span>{b.branch?.name || 'Ways Station NVL'}</span>
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

                  {b.status !== 'CANCELLED' && (
                    <div className="card-actions-row">
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="btn-cancel-order"
                      >
                        <Trash2 size={13} />
                        <span>Hủy đơn đặt sân này</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
