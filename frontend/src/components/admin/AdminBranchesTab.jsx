import React, { useState } from 'react';

export default function AdminBranchesTab({
  branches = [],
  courts = [],
  onOpenAddBranch,
  onOpenAddCourt,
  onDeleteBranch,
  onDeleteCourt
}) {
  const [selectedBranchCode, setSelectedBranchCode] = useState(
    branches[0]?.code || 'NVL'
  );

  const filteredCourts = courts.filter((c) => {
    if (!c.branch) return true;
    return c.branch.code === selectedBranchCode;
  });

  return (
    <section id="branchesTab" className="tab-pane">
      {/* 3.1: QUẢN LÝ CHI NHÁNH */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-building"></i> Danh Sách Chi Nhánh Hệ Thống
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm mới, sửa địa chỉ/hotline hoặc xóa chi nhánh
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
                <th>Số Sân</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Chưa có chi nhánh nào.
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
                    <td>{b.phone || '0889555559'}</td>
                    <td>
                      <strong>{b.totalCourts || (b.courts ? b.courts.length : 7)} Sân</strong>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          onClick={() => alert(`Chỉnh sửa chi nhánh ${b.name}`)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-delete"
                          onClick={() => onDeleteBranch && onDeleteBranch(b.id)}
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

      {/* 3.2: QUẢN LÝ SÂN ĐẤU THEO CHI NHÁNH */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-table-cells"></i> Quản Lý Danh Sách Sân Đấu Từng Cơ Sở
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm sân mới, chỉnh sửa cụm sân, bật/tắt chế độ bảo trì sân
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
                <th>Cụm Sân (Group)</th>
                <th>Chi Nhánh</th>
                <th>Trạng Thái Hoạt Động</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    Không có sân nào trong chi nhánh này.
                  </td>
                </tr>
              ) : (
                filteredCourts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>#{c.id}</strong>
                    </td>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.courtOrder || c.id}</td>
                    <td>
                      <span className="badge-status badge-active">
                        {c.courtGroup || 'Sân 1+2'}
                      </span>
                    </td>
                    <td>
                      <strong>{selectedBranchCode}</strong>
                    </td>
                    <td>
                      <span className="badge-status badge-active">Đang Hoạt Động</span>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          onClick={() => alert(`Chỉnh sửa ${c.name}`)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-delete"
                          onClick={() => onDeleteCourt && onDeleteCourt(c.id)}
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
    </section>
  );
}
