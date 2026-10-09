import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orders = [],
  onSelectOrder
}) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="billing-modal-overlay show">
      <div className="billing-modal-card orders-history-card" ref={modalBoxRef}>
        <div className="billing-modal-header">
          <div className="billing-title-meta">
            <span className="step-tag">QUẢN LÝ ĐƠN HÀNG & LỊCH SỬ TÍNH ĐƠN</span>
            <h2>
              <i className="fa-solid fa-list-check"></i> Danh Sách Các Đơn Đã Đóng
            </h2>
          </div>
          <button type="button" className="billing-close-btn" onClick={onClose} title="Đóng">
            &times;
          </button>
        </div>

        <div className="orders-history-body">
          {orders.length === 0 ? (
            <div className="empty-orders-state">
              <i className="fa-solid fa-receipt"></i>
              <h4>Chưa có đơn đặt sân nào</h4>
              <p>Hãy chọn ca sân và các dịch vụ đi kèm để tạo đơn tính tiền đầu tiên của bạn!</p>
            </div>
          ) : (
            <div className="orders-cards-list">
              {orders.map((order, idx) => (
                <div key={idx} className="order-history-item-card">
                  <div className="order-card-top">
                    <div className="order-code-badge">
                      <i className="fa-solid fa-ticket"></i> {order.bookingCode || `WAY-${order.id || idx + 1}`}
                    </div>
                    <span className="order-time-tag">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : order.bookingDate || 'Hôm nay'}
                    </span>
                    <span className={`order-status-pill ${order.paymentType === 'VIETQR' ? 'paid' : 'pending'}`}>
                      {order.paymentType === 'VIETQR' ? 'VietQR MB Bank' : 'Tại quầy'}
                    </span>
                  </div>

                  <div className="order-client-info">
                    <strong>{order.customerName}</strong> • {order.customerPhone}
                    {order.branchCode && <span> • Chi nhánh: {order.branchCode}</span>}
                  </div>

                  <div className="order-breakdown-mini">
                    {/* Sân */}
                    <div className="breakdown-line">
                      <span><i className="fa-solid fa-calendar-days"></i> Giờ sân ({order.totalHours || order.slots?.length || 1}h):</span>
                      <strong>{(order.finalCourtPrice || order.courtPriceRaw || order.totalPrice || 0).toLocaleString('vi-VN')} đ</strong>
                    </div>

                    {/* Dịch vụ */}
                    {order.services && order.services.length > 0 && (
                      <div className="breakdown-line">
                        <span><i className="fa-solid fa-bottle-water"></i> Dịch vụ nước & khăn ({order.services.length} món):</span>
                        <strong>{(order.servicesTotal || 0).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    )}

                    {/* Căng cước */}
                    {order.hasStringing && order.stringingOrders && order.stringingOrders.length > 0 && (
                      <div className="breakdown-line">
                        <span><i className="fa-solid fa-wand-magic-sparkles"></i> Căng cước ({order.stringingOrders.length} vợt):</span>
                        <strong>{(order.stringingTotal || 0).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    )}
                  </div>

                  <div className="order-card-bottom">
                    <div className="total-figure">
                      Tổng hóa đơn: <strong>{(order.totalPrice || 0).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {onSelectOrder && (
                      <button
                        type="button"
                        className="btn-view-order-detail"
                        onClick={() => onSelectOrder(order)}
                      >
                        <i className="fa-solid fa-eye"></i> Xem Biên Lai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="billing-modal-footer">
          <button type="button" className="btn-wizard-next" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
