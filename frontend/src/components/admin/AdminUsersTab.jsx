import React, { useState } from 'react';
import { PaginationBar } from './Pagination';
import { usePagination } from './usePagination';
import AdminUserDetailModal from './AdminUserDetailModal';
import ModalPortal from './ModalPortal';

/**
 * Tab Quản Lý Tài Khoản Khách Hàng & Người Dùng
 * Kết nối REST API /api/admin/users
 */
export default function AdminUsersTab({
  users = [],
  onToggleUserStatus,
  onChangeUserRole,
  onCreateUser,
  onRefresh,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Hộp thoại xem chi tiết / đơn hàng của một tài khoản
  const [detailTarget, setDetailTarget] = useState(null);

  // Modal Thêm User mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'ROLE_USER'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const pg = usePagination(filteredUsers, 10, filteredUsers.length);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.password) {
      alert('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onCreateUser) {
        await onCreateUser(newUserForm);
        alert('Đã thêm tài khoản mới thành công vào CSDL!');
        setIsAddModalOpen(false);
        setNewUserForm({
          username: '',
          password: '',
          fullName: '',
          phone: '',
          email: '',
          role: 'ROLE_USER'
        });
      }
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="usersTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-users"></i> Quản Lý Tài Khoản Người Dùng & Phân Quyền
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Xem danh sách tài khoản đã đăng ký, phân quyền vai trò (Admin / Staff / User) và quản lý trạng thái
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
              <option value="ROLE_STAFF">Nhân Viên Sân (ROLE_STAFF)</option>
              <option value="ROLE_ADMIN">Quản Trị Viên (ROLE_ADMIN)</option>
            </select>

            <button
              type="button"
              className="btn-action-add"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i> Thêm Tài Khoản Mới
            </button>

            <button
              type="button"
              className="btn-tbl btn-tbl-edit"
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
                pg.pageItems.map((u) => {
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
                        <select
                          value={u.role || 'ROLE_USER'}
                          disabled={u.id === 1} // Không đổi role của super admin ID 1
                          onChange={(e) => onChangeUserRole && onChangeUserRole(u.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            background: isAdmin ? '#fef3c7' : '#f0f9ff',
                            color: isAdmin ? '#b45309' : '#0369a1',
                            cursor: u.id === 1 ? 'default' : 'pointer'
                          }}
                        >
                          <option value="ROLE_USER">Khách (ROLE_USER)</option>
                          <option value="ROLE_STAFF">Nhân viên (ROLE_STAFF)</option>
                          <option value="ROLE_ADMIN">Quản trị (ROLE_ADMIN)</option>
                        </select>
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
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-view"
                            title="Xem thông tin đầy đủ của tài khoản này"
                            onClick={() => setDetailTarget({ user: u, tab: 'info' })}
                          >
                            <i className="fa-solid fa-id-card"></i> Chi tiết
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-view"
                            title="Xem tất cả đơn đặt sân của tài khoản này"
                            onClick={() => setDetailTarget({ user: u, tab: 'orders' })}
                          >
                            <i className="fa-solid fa-receipt"></i> Đơn hàng
                          </button>
                          {u.id !== 1 && (
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <PaginationBar pagination={pg} unit="tài khoản" />
        </div>
      </div>

      {detailTarget && (
        <AdminUserDetailModal
          key={`${detailTarget.user.id}-${detailTarget.tab}`}
          user={detailTarget.user}
          initialTab={detailTarget.tab}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* MODAL THÊM USER MỚI */}
      {isAddModalOpen && (
        <ModalPortal><div className="admin-modal-backdrop show" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>
                <i className="fa-solid fa-user-plus"></i> Thêm Tài Khoản Người Dùng Mới
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-body" style={{ padding: '20px' }}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Tên Đăng Nhập (Username) *
                  </label>
                  <input
                    minLength={4}
                    maxLength={50}
                    pattern="[A-Za-z0-9_.]{4,50}"
                    title="4-50 ký tự: chữ, số, dấu chấm, gạch dưới"
                    type="text"
                    className="form-control"
                    placeholder="VD: staff_tanphu"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Mật Khẩu *
                  </label>
                  <input
                    minLength={6}
                    maxLength={100}
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Họ Và Tên
                  </label>
                  <input
                    maxLength={100}
                    type="text"
                    className="form-control"
                    placeholder="VD: Nguyễn Văn A"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Số Điện Thoại
                    </label>
                    <input
                      required
                      maxLength={12}
                      pattern="(0|\+84)[0-9]{9,10}"
                      title="Số điện thoại Việt Nam, VD: 0912345678 (không có khoảng trắng)"
                      type="tel"
                      className="form-control"
                      placeholder="0912 345 678"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Vai Trò (Role) *
                    </label>
                    <select
                      className="form-control"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      <option value="ROLE_USER">Khách Hàng (ROLE_USER)</option>
                      <option value="ROLE_STAFF">Nhân Viên Sân (ROLE_STAFF)</option>
                      <option value="ROLE_ADMIN">Quản Trị Viên (ROLE_ADMIN)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    maxLength={100}
                    type="email"
                    className="form-control"
                    placeholder="user@example.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-tbl btn-tbl-edit"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-action-add"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div></ModalPortal>
      )}
    </section>
  );
}
