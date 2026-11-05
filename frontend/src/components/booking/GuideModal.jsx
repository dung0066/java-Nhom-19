import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GuideModal({ isOpen, onClose }) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show">
      <div className="modal-box" ref={modalBoxRef}>
        <div className="modal-head">
          <h3>
            <i className="fa-solid fa-circle-question"></i> Bảng Giá & Quy Định Đặt Sân
          </h3>
          <button className="close-x" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content-area guide-content">
          <h4>1. Bảng giá theo khung giờ</h4>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Khung giờ</th>
                <th>Thời gian</th>
                <th>Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Giờ thường (Off-Peak)</td>
                <td>00:00 - 17:00</td>
                <td>
                  <strong style={{ color: '#0284c7' }}>70.000 đ/giờ</strong>
                </td>
              </tr>
              <tr>
                <td>Giờ vàng (Peak)</td>
                <td>17:00 - 22:00</td>
                <td>
                  <strong style={{ color: '#ef4444' }}>120.000 đ/giờ</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ marginTop: '16px' }}>2. Hướng dẫn sử dụng</h4>
          <p>• Nhấn vào ô trắng để chọn giờ đặt sân. Ô sẽ chuyển sang màu vàng.</p>
          <p>• Ô màu đỏ là sân đã có người đặt.</p>
          <p>• Ô màu tím là sân khách hàng bận cần pass lại.</p>

          <button
            type="button"
            className="btn-confirm-submit"
            onClick={onClose}
            style={{ width: '100%', marginTop: '16px' }}
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
