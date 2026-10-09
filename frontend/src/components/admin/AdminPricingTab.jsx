import React from 'react';

export default function AdminPricingTab() {
  const slotsList = [
    { stt: 1, time: '0:15 - 1:15', type: 'Giờ đêm (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 2, time: '1:20 - 2:20', type: 'Giờ đêm (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 3, time: '2:25 - 3:25', type: 'Giờ đêm (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 4, time: '3:30 - 4:30', type: 'Giờ đêm (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 5, time: '4:35 - 5:35', type: 'Giờ đêm (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 6, time: '5:40 - 6:40', type: 'Giờ sáng (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 7, time: '6:45 - 7:45', type: 'Giờ sáng (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 8, time: '8:00 - 9:00', type: 'Giờ sáng (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 9, time: '9:05 - 10:05', type: 'Giờ sáng (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 10, time: '10:10 - 11:10', type: 'Giờ sáng (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 11, time: '11:15 - 12:15', type: 'Giờ trưa (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 12, time: '12:20 - 13:20', type: 'Giờ trưa (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 13, time: '13:25 - 14:25', type: 'Giờ chiều (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 14, time: '14:30 - 15:30', type: 'Giờ chiều (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 15, time: '15:35 - 16:35', type: 'Giờ chiều (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 16, time: '16:40 - 17:40', type: 'Giờ chiều (Off-Peak)', price: '70.000 đ', peak: false },
    { stt: 17, time: '17:45 - 18:45', type: '★ Giờ Vàng (Peak)', price: '120.000 đ', peak: true },
    { stt: 18, time: '18:50 - 19:50', type: '★ Giờ Vàng (Peak)', price: '120.000 đ', peak: true },
    { stt: 19, time: '19:55 - 20:55', type: '★ Giờ Vàng (Peak)', price: '120.000 đ', peak: true },
    { stt: 20, time: '21:00 - 22:00', type: '★ Giờ Vàng (Peak)', price: '120.000 đ', peak: true }
  ];

  return (
    <section id="pricingTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <h3>
            <i className="fa-solid fa-tags"></i> Cấu Hình Khung Giờ & Bảng Giá Thi Đấu
          </h3>
        </div>

        <div className="stats-grid" style={{ marginTop: '10px' }}>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa-solid fa-sun"></i>
            </div>
            <div className="stat-meta">
              <h4>Khung Giờ Thường (Off-Peak)</h4>
              <div className="stat-val" style={{ color: '#0284c7' }}>
                70.000 đ / giờ
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Áp dụng từ 00:00 - 17:00 các ngày trong tuần
              </p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">
              <i className="fa-solid fa-fire"></i>
            </div>
            <div className="stat-meta">
              <h4>Khung Giờ Vàng (Peak Hours)</h4>
              <div className="stat-val" style={{ color: '#ea580c' }}>
                120.000 đ / giờ
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Áp dụng từ 17:00 - 22:00 (giờ cao điểm sôi động)
              </p>
            </div>
          </div>
        </div>

        <h4 style={{ margin: '24px 0 12px 0', fontSize: '15px', fontWeight: 800 }}>
          Danh Sách 20 Khung Giờ Mở Cửa 24/7
        </h4>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Khung Giờ</th>
                <th>Thời Lượng</th>
                <th>Loại Giờ</th>
                <th>Giá Thuê / Sân</th>
              </tr>
            </thead>
            <tbody>
              {slotsList.map((slot) => (
                <tr
                  key={slot.stt}
                  style={slot.peak ? { background: '#fff7ed' } : {}}
                >
                  <td>{slot.stt}</td>
                  <td>
                    <strong>{slot.time}</strong>
                  </td>
                  <td>60 phút</td>
                  <td>
                    {slot.peak ? (
                      <span style={{ color: '#ea580c', fontWeight: 700 }}>
                        {slot.type}
                      </span>
                    ) : (
                      slot.type
                    )}
                  </td>
                  <td>
                    <strong style={slot.peak ? { color: '#ea580c' } : {}}>
                      {slot.price}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
