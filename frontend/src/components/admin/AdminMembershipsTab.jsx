import React, { useState, useEffect } from 'react';
import {
  fetchAllUsers,
  fetchAllMembershipsAdmin,
  fetchAllPackagesAdmin,
  createMembershipPackageAdmin,
  updateMembershipPackageAdmin,
  deleteMembershipPackageAdmin
} from '../../services/api';

export default function AdminMembershipsTab() {
  const [subTab, setSubTab] = useState('users'); // 'users' | 'subscriptions' | 'packages'
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Package Modal state
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    code: '',
    name: '',
    price: 199000,
    durationDays: 30,
    discountPercent: 5.0,
    badgeColor: '#0284c7',
    icon: 'fa-solid fa-medal',
    description: '',
    perks: '',
    active: true
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uList, sList, pList] = await Promise.all([
        fetchAllUsers(),
        fetchAllMembershipsAdmin(),
        fetchAllPackagesAdmin()
      ]);
      setUsers(uList || []);
      setSubscriptions(sList || []);
      setPackages(pList || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu hội viên:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddPkg = () => {
    setEditingPkg(null);
    setPkgFormData({
      code: '',
      name: '',
      price: 199000,
      durationDays: 30,
      discountPercent: 5.0,
      badgeColor: '#0284c7',
      icon: 'fa-solid fa-medal',
      description: '',
      perks: '',
      active: true
    });
    setIsPkgModalOpen(true);
  };

  const handleOpenEditPkg = (pkg) => {
    setEditingPkg(pkg);
    setPkgFormData({
      code: pkg.code || '',
      name: pkg.name || '',
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 30,
      discountPercent: pkg.discountPercent || 5.0,
      badgeColor: pkg.badgeColor || '#0284c7',
      icon: pkg.icon || 'fa-solid fa-medal',
      description: pkg.description || '',
      perks: pkg.perks || '',
      active: pkg.active !== undefined ? pkg.active : true
    });
    setIsPkgModalOpen(true);
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    try {
      if (editingPkg) {
        await updateMembershipPackageAdmin(editingPkg.id, pkgFormData);
        alert('Cập nhật gói hội viên thành công!');
      } else {
        await createMembershipPackageAdmin(pkgFormData);
        alert('Tạo gói hội viên mới thành công!');
      }
      setIsPkgModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu gói hội viên!');
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn ẩn / xóa gói hội viên #${id}?`)) return;
    try {
      await deleteMembershipPackageAdmin(id);
      alert('Đã xóa / ẩn gói hội viên thành công!');
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa gói!');
    }
  };

  return (
    <section className="tab-pane" style={{ display: 'block' }}>
      {/* SUB-NAV */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setSubTab('users')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'users' ? '#0284c7' : '#fff',
            color: subTab === 'users' ? '#fff' : '#475569',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fa-solid fa-users"></i>
          <span>Danh Sách Người Dùng ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('subscriptions')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'subscriptions' ? '#f59e0b' : '#fff',
            color: subTab === 'subscriptions' ? '#fff' : '#475569',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fa-solid fa-crown"></i>
          <span>Lịch Sử Kích Hoạt VIP ({subscriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('packages')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'packages' ? '#10b981' : '#fff',
            color: subTab === 'packages' ? '#fff' : '#475569',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fa-solid fa-boxes-packing"></i>
          <span>Cấu Hình Gói VIP ({packages.length})</span>
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
          <p>Đang đồng bộ dữ liệu từ Java API...</p>
        </div>
      )}

      {/* 1. USERS LIST */}
      {!isLoading && subTab === 'users' && (
        <div className="admin-content-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <i className="fa-solid fa-users" style={{ marginRight: '8px', color: '#0284c7' }}></i>
                Toàn Bộ Tài Khoản Người Dùng Trong Hệ Thống
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Dữ liệu đồng bộ trực tiếp từ Spring Boot API <code>/api/auth/users</code>
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ Tên & Username</th>
                  <th>Số Điện Thoại</th>
                  <th>Email</th>
                  <th>Số Dư Ví</th>
                  <th>Điểm Thưởng</th>
                  <th>Gói Hội Viên</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      Chưa có tài khoản người dùng nào được tạo.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>#{u.id}</strong></td>
                      <td>
                        <strong>{u.fullName || u.username}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>@{u.username}</div>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>
                        {(u.walletBalance || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        {u.loyaltyPoints || 0} pts
                      </td>
                      <td>
                        {u.isMember ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                            <i className="fa-solid fa-crown"></i> VIP (-{u.discountPercent}%)
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Khách thường</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: u.role === 'ROLE_ADMIN' ? '#dc2626' : '#2563eb' }}>
                          {u.role || 'ROLE_USER'}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: u.status === 'BLOCKED' ? '#fee2e2' : '#dcfce7', color: u.status === 'BLOCKED' ? '#b91c1c' : '#15803d' }}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTIONS LIST */}
      {!isLoading && subTab === 'subscriptions' && (
        <div className="admin-content-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <i className="fa-solid fa-crown" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
                Toàn Bộ Lịch Sử Đăng Ký Hội Viên VIP
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Đồng bộ từ Spring Boot API <code>/api/memberships/admin/all</code>
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đăng Ký</th>
                  <th>Khách Hàng</th>
                  <th>Gói Hội Viên</th>
                  <th>Giá Thanh Toán</th>
                  <th>Thời Hạn Hiệu Lực</th>
                  <th>Hình Thức</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      Chưa có lượt đăng ký gói hội viên nào.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((s) => (
                    <tr key={s.id}>
                      <td><strong>#VIP-{s.id}</strong></td>
                      <td>
                        <strong>{s.user?.fullName || s.user?.username}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{s.user?.phone}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#f59e0b' }}>{s.membershipPackage?.name || 'Gói VIP'}</strong>
                        <div style={{ fontSize: '11.5px', color: '#10b981' }}>Giảm {s.membershipPackage?.discountPercent}%</div>
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {(s.pricePaid || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{s.startDate} ➔ {s.endDate}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: s.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: s.status === 'ACTIVE' ? '#15803d' : '#b91c1c' }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PACKAGES CRUD */}
      {!isLoading && subTab === 'packages' && (
        <div className="admin-content-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <i className="fa-solid fa-boxes-packing" style={{ marginRight: '8px', color: '#10b981' }}></i>
                Danh Sách Gói Hội Viên Đang Mở Bán
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Quản lý bảng giá, tỷ lệ chiết khấu (%) và đặc quyền của từng gói
              </p>
            </div>
            <button
              type="button"
              className="btn-action-add"
              onClick={handleOpenAddPkg}
            >
              <i className="fa-solid fa-plus"></i> Thêm Gói VIP Mới
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '18px',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={pkg.icon || 'fa-solid fa-crown'} style={{ color: pkg.badgeColor || '#f59e0b', fontSize: '18px' }}></i>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{pkg.name}</strong>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: pkg.active ? '#dcfce7' : '#fee2e2', color: pkg.active ? '#15803d' : '#b91c1c' }}>
                    {pkg.active ? 'MỞ BÁN' : 'ĐÃ ẨN'}
                  </span>
                </div>

                <div style={{ margin: '8px 0', fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>
                  {(pkg.price || 0).toLocaleString('vi-VN')} đ
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>/ {pkg.durationDays} ngày</span>
                </div>

                <div style={{ fontSize: '12.5px', color: '#0284c7', fontWeight: 700, marginBottom: '8px' }}>
                  Ưu đãi: Giảm {pkg.discountPercent}% tiền giờ chơi
                </div>

                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 14px', flex: 1, lineHeight: '1.5' }}>
                  {pkg.description}
                </p>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPkg(pkg)}
                    style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Chỉnh Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePkg(pkg.id)}
                    style={{ flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-trash"></i> Xóa Gói
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA GÓI VIP */}
      {isPkgModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingPkg ? 'Cập Nhật Gói Hội Viên' : 'Thêm Gói Hội Viên Mới'}
              </h4>
              <button
                type="button"
                onClick={() => setIsPkgModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePkg} style={{ padding: '20px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mã Gói (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: PLATINUM"
                    value={pkgFormData.code}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tên Gói Hội Viên</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hội Viên Bạch Kim (Platinum)"
                    value={pkgFormData.name}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Giá Gói (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={pkgFormData.price}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Số Ngày Hạn</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pkgFormData.durationDays}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, durationDays: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>% Giảm Giá</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.5"
                    value={pkgFormData.discountPercent}
                    onChange={(e) => setPkgFormData({ ...pkgFormData, discountPercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mô Tả Ngắn</label>
                <textarea
                  rows="2"
                  value={pkgFormData.description}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Đặc Quyền Chi Tiết (Cách nhau bằng dấu chấm phẩy ;)</label>
                <textarea
                  rows="2"
                  placeholder="Giảm 10% giờ chơi; Tủ đồ riêng; Khử khuẩn giày..."
                  value={pkgFormData.perks}
                  onChange={(e) => setPkgFormData({ ...pkgFormData, perks: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPkgModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  Lưu Gói Hội Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
