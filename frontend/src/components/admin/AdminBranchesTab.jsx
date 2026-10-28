import React, { useState } from 'react';

export default function AdminBranchesTab({
  branches = [],
  courts = [],
  onOpenAddBranch,
  onEditBranch,
  onOpenAddCourt,
  onEditCourt,
  onToggleCourtActive,
  onDeleteBranch,
  onDeleteCourt
}) {
  const [selectedBranchCode, setSelectedBranchCode] = useState(
    branches[0]?.code || 'NVL'
  );

  // Lọc sân theo chi nhánh được chọn (hỗ trợ cả Spring Boot SQL & Mock data)
  const filteredCourts = courts.filter((c) => {
    const code = c.branch?.code || c.branchCode || 'NVL';
    return code === selectedBranchCode;
  });

  return (
    <section id="branchesTab" className="tab-pane">
      {/* 1. QUẢN LÝ CHI NHÁNH */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-building"></i> Danh Sách Chi Nhánh Hệ Thống D2 SHOP
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm mới cơ sở, cập nhật địa chỉ hotline hoặc quản lý chi nhánh
            </p>
          </div>
          <button
            type="button"
            className="btn-action-add"
            onClick={onOpenAddBranch}
          >
            <i className="fa-solid fa-plus"></i> Thêm Chi Nhánh Mới
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã CN</th>
                <th>Tên Chi Nhánh</th>
                <th>Địa Chỉ Cơ Sở</th>
                <th>Hotline</th>
                <th>Quy Mô Sân</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Chưa có chi nhánh nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id || b.code}>
                    <td>
                      <strong style={{ color: '#0284c7' }}>{b.code}</strong>
                    </td>
                    <td>
                      <strong>{b.name}</strong>
                    </td>
                    <td>{b.address}</td>
                    <td>{b.phone || '0914977030'}</td>
                    <td>
                      <strong>{b.totalCourts || (b.courts ? b.courts.length : 7)} Sân Thi Đấu</strong>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          title="Chỉnh sửa thông tin chi nhánh"
                          onClick={() => onEditBranch && onEditBranch(b)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-delete"
                          title="Xóa chi nhánh này"
                          onClick={() => onDeleteBranch && onDeleteBranch(b.id || b.code)}
                        >
                          <i className="fa-solid fa-trash"></i> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. QUẢN LÝ SÂN ĐẤU (THÊM, SỬA, XÓA, BẬT/TẮT BẢO TRÌ) */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-table-cells"></i> Quản Lý Danh Sách Sân Đấu Từng Cơ Sở
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm sân mới, chỉnh sửa thông tin sân, bật/tắt chế độ bảo trì hoặc xóa sân
            </p>
          </div>
          <div className="filter-tools-row">
            <select
              className="select-filter"
              value={selectedBranchCode}
              onChange={(e) => setSelectedBranchCode(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={onOpenAddCourt}
            >
              <i className="fa-solid fa-plus"></i> Thêm Sân Mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Sân</th>
                <th>Tên Sân</th>
                <th>Số Thứ Tự</th>
                <th>Loại Thảm / Cụm Sân</th>
                <th>Chi Nhánh</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không có sân nào trong chi nhánh này. Bấm nút <strong>"+ Thêm Sân Mới"</strong> để tạo sân đầu tiên.
                  </td>
                </tr>
              ) : (
                filteredCourts.map((c) => {
                  const isActive = c.active !== false;
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>#{c.id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{c.name || `Sân ${c.courtNumber || c.id}`}</strong>
                      </td>
                      <td>{c.courtNumber || c.courtOrder || c.id}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px',
                          fontSize: '12px', fontWeight: 600, color: '#334155'
                        }}>
                          <i className="fa-solid fa-layer-group" style={{ color: '#0284c7' }}></i>
                          {c.courtGroup || 'Thảm Taraflex BWF 7.5mm'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0284c7' }}>{selectedBranchCode}</strong>
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge-status badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fa-solid fa-circle-check"></i> Đang Hoạt Động
                          </span>
                        ) : (
                          <span className="badge-status badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                            <i className="fa-solid fa-wrench"></i> Đang Bảo Trì
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            title="Sửa thông tin sân"
                            onClick={() => onEditCourt && onEditCourt(c)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-tbl"
                            style={{
                              background: isActive ? '#fef3c7' : '#dcfce7',
                              color: isActive ? '#b45309' : '#15803d',
                              border: isActive ? '1px solid #fde68a' : '1px solid #bbf7d0'
                            }}
                            title={isActive ? "Chuyển sang chế độ bảo trì" : "Bật sân hoạt động trở lại"}
                            onClick={() => onToggleCourtActive && onToggleCourtActive(c.id)}
                          >
                            <i className={isActive ? "fa-solid fa-wrench" : "fa-solid fa-play"}></i>
                            {isActive ? 'Bảo Trì' : 'Mở Sân'}
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-delete"
                            title="Xóa sân này"
                            onClick={() => onDeleteCourt && onDeleteCourt(c.id)}
                          >
                            <i className="fa-solid fa-trash"></i> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
