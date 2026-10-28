import React, { useState } from 'react';

/**
 * Tab Quản Lý Tài Khoản Khách Hàng & Người Dùng
 * Kết nối REST API /api/admin/users
 * Code đơn giản, ngắn gọn, trực quan để báo cáo đồ án
 */
export default function AdminUsersTab({
  users = [],
  onToggleUserStatus,
  onDeleteUser,
  onRefresh,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));

    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <section id="usersTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-users"></i> Quản Lý Tài Khoản Người Dùng & Khách Hàng
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Xem danh sách tài khoản đã đăng ký, phân quyền hệ thống và quản lý trạng thái tài khoản
            </p>
          </div>

          <div className="filter-tools-row">
            <div className="input-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm username, họ tên, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ROLE_USER">Khách Hàng (ROLE_USER)</option>
              <option value="ROLE_ADMIN">Quản Trị Viên (ROLE_ADMIN)</option>
              <option value="ROLE_STAFF">Nhân Viên Sân (ROLE_STAFF)</option>
            </select>

            <button
              type="button"
              className="btn-action-add"
              onClick={onRefresh}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tài Khoản</th>
                <th>Họ Và Tên</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Vai Trò (Role)</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isLocked = u.status === 'LOCKED' || u.status === 'DELETED';
                  const isAdmin = u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';

                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>#{u.id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0284c7' }}>{u.username}</strong>
                      </td>
                      <td>
                        <strong>{u.fullName || '---'}</strong>
                      </td>
                      <td>{u.phone || '---'}</td>
                      <td>{u.email || '---'}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                          background: isAdmin ? '#fef3c7' : '#e0f2fe',
                          color: isAdmin ? '#b45309' : '#0369a1'
                        }}>
                          <i className={isAdmin ? "fa-solid fa-shield-halved" : "fa-solid fa-user"}></i>
                          {u.role || 'ROLE_USER'}
                        </span>
                      </td>
                      <td>
                        {isLocked ? (
                          <span className="badge-status badge-danger">
                            <i className="fa-solid fa-lock"></i> Đã Khóa
                          </span>
                        ) : (
                          <span className="badge-status badge-active">
                            <i className="fa-solid fa-check"></i> Hoạt Động
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          {!isAdmin && (
                            <button
                              type="button"
                              className="btn-tbl"
                              style={{
                                background: isLocked ? '#dcfce7' : '#fef3c7',
                                color: isLocked ? '#15803d' : '#b45309',
                                border: isLocked ? '1px solid #bbf7d0' : '1px solid #fde68a'
                              }}
                              title={isLocked ? "Mở khóa tài khoản này" : "Khóa tài khoản này"}
                              onClick={() => onToggleUserStatus && onToggleUserStatus(u.id)}
                            >
                              <i className={isLocked ? "fa-solid fa-lock-open" : "fa-solid fa-lock"}></i>
                              {isLocked ? 'Mở Khóa' : 'Khóa'}
                            </button>
                          )}
                          {!isAdmin && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-delete"
                              title="Xóa tài khoản này"
                              onClick={() => onDeleteUser && onDeleteUser(u.id)}
                            >
                              <i className="fa-solid fa-trash"></i> Xóa
                            </button>
                          )}
                          {isAdmin && (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Quản trị viên
                            </span>
                          )}
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

