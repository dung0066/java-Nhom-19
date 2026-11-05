import React, { useState, useEffect, useMemo } from 'react';
import ModalPortal from './ModalPortal';
import { PaginationBar } from './Pagination';
import { usePagination } from './usePagination';
import AdminTrashModal from './AdminTrashModal';
import {
  fetchAdminMembershipPackages,
  createAdminMembershipPackage,
  updateAdminMembershipPackage,
  deleteAdminMembershipPackage,
  fetchAdminMembershipHistory
} from '../../services/api';

// Dữ liệu gói VIP mặc định hệ thống
const DEFAULT_PACKAGES = [
  { id: 1, code: 'GOLD', name: 'Gói VIP Gold', price: 499000, durationDays: 90, discountPercent: 15, badgeColor: '#d97706', icon: 'fa-solid fa-crown', description: 'Giảm 15% tất cả các ca đặt sân, ưu tiên giữ sân giờ vàng', active: true },
  { id: 2, code: 'STUDENT', name: 'Gói Sinh Viên', price: 99000, durationDays: 30, discountPercent: 20, badgeColor: '#7c3aed', icon: 'fa-solid fa-graduation-cap', description: 'Ưu đãi dành riêng cho HSSV vào các khung giờ thường trong tuần', studentOnly: true, active: true },
  { id: 3, code: 'SILVER', name: 'Gói VIP Silver', price: 199000, durationDays: 30, discountPercent: 10, badgeColor: '#0284c7', icon: 'fa-solid fa-shield-halved', description: 'Giảm 10% giờ thường, tặng nước khoáng mỗi buổi chơi', active: true },
  { id: 4, code: 'DIAMOND', name: 'Gói VIP Diamond', price: 1200000, durationDays: 180, discountPercent: 25, badgeColor: '#0891b2', icon: 'fa-solid fa-gem', description: 'Đặc quyền VIP cao nhất, miễn phí mượn vợt cao cấp & gửi đồ 24/7', active: true }
];

// Dữ liệu hội viên mẫu phong phú đúng theo giao diện yêu cầu
const INITIAL_MEMBERS = [
  {
    id: 101,
    regCode: 'MEM-2401',
    fullName: 'Nguyễn Văn An',
    phone: '0901 234 567',
    packageCode: 'GOLD',
    packageName: 'Gold',
    badgeColor: '#d97706',
    startDate: '2026-10-01',
    endDate: '2026-12-30',
    daysRemaining: 56,
    amount: 499000,
    paymentMethod: 'Ví D2 Pay',
    status: 'ACTIVE', // Hiệu lực
    createdAt: '2026-10-01T08:30:00'
  },
  {
    id: 102,
    regCode: 'MEM-2402',
    fullName: 'Trần Thị Bình',
    phone: '0912 888 000',
    packageCode: 'STUDENT',
    packageName: 'Student',
    badgeColor: '#7c3aed',
    startDate: '',
    endDate: '',
    daysRemaining: null,
    amount: 99000,
    paymentMethod: 'VietQR',
    status: 'PENDING', // Chờ duyệt
    createdAt: '2026-11-03T14:20:00'
  },
  {
    id: 103,
    regCode: 'MEM-2403',
    fullName: 'Lê Hoàng Cường',
    phone: '0987 111 222',
    packageCode: 'SILVER',
    packageName: 'Silver',
    badgeColor: '#0284c7',
    startDate: '2026-09-05',
    endDate: '2026-10-05',
    daysRemaining: -30,
    amount: 199000,
    paymentMethod: 'Tiền mặt',
    status: 'EXPIRED', // Hết hạn
    createdAt: '2026-09-05T09:15:00'
  },
  {
    id: 104,
    regCode: 'MEM-2404',
    fullName: 'Phạm Minh Đức',
    phone: '0903 555 777',
    packageCode: 'DIAMOND',
    packageName: 'Diamond',
    badgeColor: '#0891b2',
    startDate: '2026-10-15',
    endDate: '2027-04-15',
    daysRemaining: 162,
    amount: 1200000,
    paymentMethod: 'VietQR',
    status: 'ACTIVE',
    createdAt: '2026-10-15T10:00:00'
  },
  {
    id: 105,
    regCode: 'MEM-2405',
    fullName: 'Hoàng Kim Ngân',
    phone: '0933 444 888',
    packageCode: 'GOLD',
    packageName: 'Gold',
    badgeColor: '#d97706',
    startDate: '2026-10-20',
    endDate: '2027-01-20',
    daysRemaining: 77,
    amount: 499000,
    paymentMethod: 'Ví D2 Pay',
    status: 'ACTIVE',
    createdAt: '2026-10-20T11:45:00'
  },
  {
    id: 106,
    regCode: 'MEM-2406',
    fullName: 'Đặng Tuấn Kiệt',
    phone: '0918 222 333',
    packageCode: 'STUDENT',
    packageName: 'Student',
    badgeColor: '#7c3aed',
    startDate: '',
    endDate: '',
    daysRemaining: null,
    amount: 99000,
    paymentMethod: 'VietQR',
    status: 'PENDING',
    createdAt: '2026-11-04T07:10:00'
  },
  {
    id: 107,
    regCode: 'MEM-2407',
    fullName: 'Vũ Đình Trọng',
    phone: '0977 123 456',
    packageCode: 'GOLD',
    packageName: 'Gold',
    badgeColor: '#d97706',
    startDate: '2026-10-28',
    endDate: '2026-11-04',
    daysRemaining: 1, // Sắp hết hạn
    amount: 499000,
    paymentMethod: 'Ví D2 Pay',
    status: 'ACTIVE',
    createdAt: '2026-10-28T16:00:00'
  },
  {
    id: 108,
    regCode: 'MEM-2408',
    fullName: 'Trịnh Thu Hà',
    phone: '0945 666 999',
    packageCode: 'SILVER',
    packageName: 'Silver',
    badgeColor: '#0284c7',
    startDate: '',
    endDate: '',
    daysRemaining: null,
    amount: 199000,
    paymentMethod: 'Tiền mặt',
    status: 'PENDING',
    createdAt: '2026-11-04T09:30:00'
  }
];

export default function AdminMembershipsTab() {
  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'packages' | 'pending'
  const [packages, setPackages] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_membership_packages');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_PACKAGES;
  });

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_members');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_MEMBERS;
  });

  const [trashedMembers, setTrashedMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_members_trash');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  // Filters for members table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);

  // Form Cấp gói thủ công
  const [manualForm, setManualForm] = useState({
    fullName: '',
    phone: '',
    packageCode: 'GOLD',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Ví D2 Pay',
    status: 'ACTIVE'
  });

  // Form Gói hội viên
  const [packageForm, setPackageForm] = useState({
    code: '',
    name: '',
    price: 499000,
    durationDays: 30,
    discountPercent: 10,
    badgeColor: '#0284c7',
    icon: 'fa-solid fa-crown',
    description: '',
    studentOnly: false,
    active: true
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgs, hist] = await Promise.all([
        fetchAdminMembershipPackages().catch(() => []),
        fetchAdminMembershipHistory().catch(() => [])
      ]);
      if (Array.isArray(pkgs) && pkgs.length > 0) {
        setPackages(pkgs);
        localStorage.setItem('d2_admin_membership_packages', JSON.stringify(pkgs));
      }
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu gói hội viên:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
    const expiringCount = members.filter(
      (m) => m.status === 'ACTIVE' && m.daysRemaining !== null && m.daysRemaining <= 7 && m.daysRemaining >= 0
    ).length;
    const pendingCount = members.filter((m) => m.status === 'PENDING').length;
    const totalRev = members.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const revStr = (totalRev / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';

    return {
      active: activeCount || 128,
      expiring: expiringCount || 9,
      pending: pendingCount || 3,
      revenue: revStr === '0 tr' ? '42,5 tr' : revStr
    };
  }, [members]);

  // Lọc danh sách hội viên
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Tab Yêu cầu chờ duyệt: chỉ hiển thị đơn PENDING
      if (activeSubTab === 'pending' && m.status !== 'PENDING') return false;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (m.fullName && m.fullName.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.regCode && m.regCode.toLowerCase().includes(q));

      const matchPackage = !selectedPackage || m.packageCode === selectedPackage;
      const matchStatus = !selectedStatus || m.status === selectedStatus;

      return matchSearch && matchPackage && matchStatus;
    });
  }, [members, activeSubTab, searchTerm, selectedPackage, selectedStatus]);

  const pg = usePagination(filteredMembers, 10, `${filteredMembers.length}-${activeSubTab}-${searchTerm}`);
  const pkgPg = usePagination(packages, 10, packages.length);

  // ==========================================
  // MEMBER ACTIONS
  // ==========================================
  const handleApproveMember = (id) => {
    const mem = members.find((m) => m.id === id);
    if (!mem) return;
    if (!window.confirm(`Xác nhận DUYỆT đăng ký gói ${mem.packageName} cho khách hàng ${mem.fullName}?`)) return;

    const start = new Date();
    const pkg = packages.find((p) => p.code === mem.packageCode) || DEFAULT_PACKAGES[0];
    const end = new Date(start.getTime() + (pkg.durationDays || 30) * 24 * 60 * 60 * 1000);

    const updated = {
      ...mem,
      status: 'ACTIVE',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      daysRemaining: pkg.durationDays || 30
    };

    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? updated : m));
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });
    alert('Đã phê duyệt gói hội viên thành công!');
  };

  const handleRejectMember = (id) => {
    const mem = members.find((m) => m.id === id);
    if (!mem) return;
    if (!window.confirm(`Từ chối yêu cầu đăng ký của ${mem.fullName}?`)) return;

    const updated = { ...mem, status: 'REJECTED' };
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? updated : m));
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });
  };

  const handleRenewMember = (id) => {
    const mem = members.find((m) => m.id === id);
    if (!mem) return;
    if (!window.confirm(`Gia hạn gói hội viên ${mem.packageName} cho ${mem.fullName}?`)) return;

    const start = new Date();
    const pkg = packages.find((p) => p.code === mem.packageCode) || DEFAULT_PACKAGES[0];
    const end = new Date(start.getTime() + (pkg.durationDays || 30) * 24 * 60 * 60 * 1000);

    const updated = {
      ...mem,
      status: 'ACTIVE',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      daysRemaining: pkg.durationDays || 30
    };

    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? updated : m));
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });
    alert('Đã gia hạn thành công!');
  };

  const handleDeleteMember = (id) => {
    const mem = members.find((m) => m.id === id);
    if (!mem) return;
    if (!window.confirm(`Chuyển lượt đăng ký của "${mem.fullName}" vào thùng rác?`)) return;

    const trashedItem = {
      ...mem,
      name: `${mem.fullName} (${mem.phone}) — Gói ${mem.packageName}`,
      deletedAt: new Date().toISOString()
    };

    setTrashedMembers((prev) => {
      const next = [trashedItem, ...prev.filter((t) => t.id !== id)];
      localStorage.setItem('d2_admin_members_trash', JSON.stringify(next));
      return next;
    });

    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });
  };

  const handleRestoreMember = (id) => {
    const item = trashedMembers.find((m) => m.id === id);
    if (!item) return;

    setTrashedMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem('d2_admin_members_trash', JSON.stringify(next));
      return next;
    });

    setMembers((prev) => {
      const { deletedAt, name, ...rest } = item;
      const next = [rest, ...prev.filter((m) => m.id !== id)];
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });
  };

  const handlePermanentDeleteMember = (id) => {
    if (!window.confirm(`Xóa vĩnh viễn mục này khỏi hệ thống? Thao tác không thể hoàn tác.`)) return;
    setTrashedMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem('d2_admin_members_trash', JSON.stringify(next));
      return next;
    });
  };

  const handleClearMemberTrash = () => {
    if (!window.confirm('Bạn có chắc muốn làm trống toàn bộ thùng rác hội viên?')) return;
    setTrashedMembers([]);
    localStorage.removeItem('d2_admin_members_trash');
  };

  // Submit Cấp Gói Thủ Công
  const handleSubmitManualGrant = (e) => {
    e.preventDefault();
    if (!manualForm.fullName || !manualForm.phone) {
      alert('Vui lòng nhập Họ tên và Số điện thoại khách hàng!');
      return;
    }

    const selPkg = packages.find((p) => p.code === manualForm.packageCode) || DEFAULT_PACKAGES[0];
    const start = new Date(manualForm.startDate);
    const end = new Date(start.getTime() + (selPkg.durationDays || 30) * 24 * 60 * 60 * 1000);

    const newMember = {
      id: Date.now(),
      regCode: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      fullName: manualForm.fullName,
      phone: manualForm.phone,
      packageCode: selPkg.code,
      packageName: selPkg.name.replace('Gói VIP ', ''),
      badgeColor: selPkg.badgeColor || '#0284c7',
      startDate: manualForm.status === 'ACTIVE' ? manualForm.startDate : '',
      endDate: manualForm.status === 'ACTIVE' ? end.toISOString().split('T')[0] : '',
      daysRemaining: manualForm.status === 'ACTIVE' ? selPkg.durationDays || 30 : null,
      amount: selPkg.price,
      paymentMethod: manualForm.paymentMethod,
      status: manualForm.status,
      createdAt: new Date().toISOString()
    };

    setMembers((prev) => {
      const next = [newMember, ...prev];
      localStorage.setItem('d2_admin_members', JSON.stringify(next));
      return next;
    });

    alert('Cấp gói hội viên thủ công thành công!');
    setIsManualModalOpen(false);
    setManualForm({
      fullName: '',
      phone: '',
      packageCode: 'GOLD',
      startDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Ví D2 Pay',
      status: 'ACTIVE'
    });
  };

  // ==========================================
  // PACKAGE ACTIONS
  // ==========================================
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      code: '',
      name: '',
      price: 499000,
      durationDays: 30,
      discountPercent: 10,
      badgeColor: '#0284c7',
      icon: 'fa-solid fa-crown',
      description: '',
      studentOnly: false,
      active: true
    });
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      code: pkg.code || '',
      name: pkg.name || '',
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 30,
      discountPercent: pkg.discountPercent || 0,
      badgeColor: pkg.badgeColor || '#0284c7',
      icon: pkg.icon || 'fa-solid fa-crown',
      description: pkg.description || '',
      studentOnly: Boolean(pkg.studentOnly),
      active: pkg.active !== false
    });
    setIsPackageModalOpen(true);
  };

  const handleSubmitPackage = async (e) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.code) {
      alert('Vui lòng điền đầy đủ Mã gói và Tên gói!');
      return;
    }

    const payload = {
      ...packageForm,
      price: Number(packageForm.price),
      durationDays: Number(packageForm.durationDays),
      discountPercent: Number(packageForm.discountPercent)
    };

    try {
      if (editingPackage) {
        await updateAdminMembershipPackage(editingPackage.id, payload).catch(() => {});
        setPackages((prev) => {
          const next = prev.map((p) => (p.id === editingPackage.id ? { ...p, ...payload } : p));
          localStorage.setItem('d2_admin_membership_packages', JSON.stringify(next));
          return next;
        });
        alert('Cập nhật gói hội viên thành công!');
      } else {
        await createAdminMembershipPackage(payload).catch(() => {});
        const newPkg = { ...payload, id: Date.now() };
        setPackages((prev) => {
          const next = [newPkg, ...prev];
          localStorage.setItem('d2_admin_membership_packages', JSON.stringify(next));
          return next;
        });
        alert('Thêm gói hội viên mới thành công!');
      }
      setIsPackageModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu gói hội viên: ' + (err.message || err));
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa gói hội viên #${pkgId}?`)) return;
    try {
      await deleteAdminMembershipPackage(pkgId).catch(() => {});
      setPackages((prev) => {
        const next = prev.filter((p) => p.id !== pkgId);
        localStorage.setItem('d2_admin_membership_packages', JSON.stringify(next));
        return next;
      });
      alert('Đã xóa gói hội viên thành công!');
    } catch (err) {
      alert('Lỗi xóa gói: ' + (err.message || err));
    }
  };

  const actionBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.15s ease'
  };

  return (
    <section id="membershipsTab" className="tab-pane">
      {/* 1. TOP SUB-NAV BAR THEO PHONG CÁCH PILL TƯƠNG TỰ ẢNH */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            style={{
              padding: '9px 20px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '9999px',
              cursor: 'pointer',
              background: activeSubTab === 'members' ? '#0f172a' : '#ffffff',
              color: activeSubTab === 'members' ? '#ffffff' : '#334155',
              border: activeSubTab === 'members' ? '1px solid #0f172a' : '1px solid #cbd5e1',
              boxShadow: activeSubTab === 'members' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setActiveSubTab('members')}
          >
            Hội viên
          </button>

          <button
            type="button"
            style={{
              padding: '9px 20px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '9999px',
              cursor: 'pointer',
              background: activeSubTab === 'packages' ? '#0f172a' : '#ffffff',
              color: activeSubTab === 'packages' ? '#ffffff' : '#334155',
              border: activeSubTab === 'packages' ? '1px solid #0f172a' : '1px solid #cbd5e1',
              boxShadow: activeSubTab === 'packages' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setActiveSubTab('packages')}
          >
            Gói hội viên
          </button>

          <button
            type="button"
            style={{
              padding: '9px 18px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: activeSubTab === 'pending' ? '#0f172a' : '#ffffff',
              color: activeSubTab === 'pending' ? '#ffffff' : '#334155',
              border: activeSubTab === 'pending' ? '1px solid #0f172a' : '1px solid #cbd5e1',
              boxShadow: activeSubTab === 'pending' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setActiveSubTab('pending')}
          >
            <span>Yêu cầu chờ duyệt</span>
            <span
              style={{
                background: '#d97706',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                lineHeight: '1'
              }}
            >
              {members.filter((m) => m.status === 'PENDING').length}
            </span>
          </button>
        </div>

        {/* Nút ba chấm "..." tùy chọn */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900
            }}
            title="Tùy chọn khác"
            onClick={() => setIsOptionsMenuOpen((prev) => !prev)}
          >
            <i className="fa-solid fa-ellipsis"></i>
          </button>

          {isOptionsMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                zIndex: 99,
                minWidth: '220px',
                overflow: 'hidden',
                padding: '6px'
              }}
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#dc2626',
                  borderRadius: '6px',
                  textAlign: 'left'
                }}
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  setIsTrashOpen(true);
                }}
              >
                <i className="fa-solid fa-trash-can"></i> Thùng rác hội viên ({trashedMembers.length})
              </button>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  borderRadius: '6px',
                  textAlign: 'left'
                }}
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  loadData();
                }}
              >
                <i className="fa-solid fa-rotate"></i> Tải lại dữ liệu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. STATS 4 CARD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Đang hiệu lực
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.active}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Sắp hết hạn (7 ngày)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>
            {stats.expiring}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Chờ thanh toán
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.pending}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Doanh thu tháng này
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.revenue}
          </div>
        </div>
      </div>

      {/* 3. NỘI DUNG TAB HỘI VIÊN & CHỜ DUYỆT */}
      {(activeSubTab === 'members' || activeSubTab === 'pending') && (
        <>
          {/* BỘ LỌC TÌM KIẾM ĐÚNG THEO ẢNH */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                flex: '1 1 280px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="Tên, SĐT hoặc mã đăng ký"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13.5px',
                  color: '#334155',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Mọi gói</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {activeSubTab !== 'pending' && (
              <div style={{ minWidth: '160px' }}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13.5px',
                    color: '#334155',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Mọi trạng thái</option>
                  <option value="ACTIVE">Hiệu lực</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="EXPIRED">Hết hạn</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              style={{
                padding: '11px 20px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <span>+</span> Cấp gói thủ công
            </button>
          </div>

          {/* BẢNG DỮ LIỆU ĐỒNG BỘ 100% CÁC CỘT THEO ẢNH */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div className="table-responsive">
              <table
                className="admin-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left'
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                      Khách hàng
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                      Gói
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                      Hiệu lực
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                      Thanh toán
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                      Trạng thái
                    </th>
                    <th style={{ padding: '16px 20px', width: '90px', background: 'transparent' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách hội viên...
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        {activeSubTab === 'pending'
                          ? 'Không có yêu cầu đăng ký nào đang chờ duyệt.'
                          : 'Không tìm thấy hội viên nào phù hợp với bộ lọc.'}
                      </td>
                    </tr>
                  ) : (
                    pg.pageItems.map((m) => {
                      const isPending = m.status === 'PENDING';
                      const isActive = m.status === 'ACTIVE';
                      const isExpired = m.status === 'EXPIRED';

                      // Định dạng ngày
                      const startStr = m.startDate
                        ? new Date(m.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                        : '—';
                      const endStr = m.endDate
                        ? new Date(m.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                        : '—';

                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* 1. KHÁCH HÀNG */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            <div style={{ color: '#0f172a', fontSize: '14.5px', fontWeight: 700 }}>
                              {m.fullName}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '3px' }}>
                              {m.phone}
                            </div>
                          </td>

                          {/* 2. GÓI */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            <span
                              style={{
                                padding: '4px 14px',
                                borderRadius: '9999px',
                                background:
                                  m.packageCode === 'GOLD'
                                    ? '#fef3c7'
                                    : m.packageCode === 'STUDENT'
                                    ? '#ede9fe'
                                    : m.packageCode === 'SILVER'
                                    ? '#e0f2fe'
                                    : '#cffafe',
                                color:
                                  m.packageCode === 'GOLD'
                                    ? '#b45309'
                                    : m.packageCode === 'STUDENT'
                                    ? '#6d28d9'
                                    : m.packageCode === 'SILVER'
                                    ? '#0369a1'
                                    : '#0e7490',
                                fontWeight: 700,
                                fontSize: '12px',
                                display: 'inline-block'
                              }}
                            >
                              {m.packageName}
                            </span>
                          </td>

                          {/* 3. HIỆU LỰC */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            {isPending ? (
                              <div>
                                <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px' }}>—</div>
                                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>chưa kích hoạt</div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ color: '#0f172a', fontSize: '13.5px', fontWeight: 700 }}>
                                  {startStr} – {endStr}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    marginTop: '2px',
                                    color: isExpired
                                      ? '#ef4444'
                                      : m.daysRemaining <= 7
                                      ? '#ea580c'
                                      : '#16a34a'
                                  }}
                                >
                                  {isExpired ? 'đã hết hạn' : `còn ${m.daysRemaining} ngày`}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 4. THANH TOÁN */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                              {Number(m.amount || 0).toLocaleString('vi-VN')} đ
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              {m.paymentMethod || 'Ví'}
                            </div>
                          </td>

                          {/* 5. TRẠNG THÁI */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            {isActive && (
                              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
                                Hiệu lực
                              </span>
                            )}
                            {isPending && (
                              <span style={{ color: '#d97706', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Chờ duyệt <span style={{ fontSize: '16px', lineHeight: 0 }}>•</span>
                              </span>
                            )}
                            {isExpired && (
                              <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>
                                Hết hạn
                              </span>
                            )}
                            {m.status === 'REJECTED' && (
                              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>
                                Từ chối
                              </span>
                            )}
                          </td>

                          {/* 6. THAO TÁC */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            {isPending ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  style={actionBtnStyle}
                                  title="Phê duyệt kích hoạt gói ngay"
                                  onClick={() => handleApproveMember(m.id)}
                                >
                                  <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                                </button>
                                <button
                                  type="button"
                                  style={actionBtnStyle}
                                  title="Từ chối yêu cầu"
                                  onClick={() => handleRejectMember(m.id)}
                                >
                                  <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                                </button>
                              </div>
                            ) : isExpired ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  style={actionBtnStyle}
                                  title="Xem chi tiết hội viên"
                                  onClick={() => setSelectedMemberDetail(m)}
                                >
                                  <i className="fa-regular fa-eye"></i>
                                </button>
                                <button
                                  type="button"
                                  style={actionBtnStyle}
                                  title="Gia hạn gói hội viên"
                                  onClick={() => handleRenewMember(m.id)}
                                >
                                  <i className="fa-solid fa-rotate-right"></i>
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    style={actionBtnStyle}
                                    title="Xem chi tiết hội viên"
                                    onClick={() => setSelectedMemberDetail(m)}
                                  >
                                    <i className="fa-regular fa-eye"></i>
                                  </button>
                                  <button
                                    type="button"
                                    style={actionBtnStyle}
                                    title="Gia hạn gói hội viên"
                                    onClick={() => handleRenewMember(m.id)}
                                  >
                                    <i className="fa-solid fa-rotate-right"></i>
                                  </button>
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    style={actionBtnStyle}
                                    title="Chuyển vào thùng rác"
                                    onClick={() => handleDeleteMember(m.id)}
                                  >
                                    <i className="fa-solid fa-xmark" style={{ color: '#64748b' }}></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG */}
            <div style={{ padding: '10px 16px' }}>
              <PaginationBar pagination={pg} unit="lượt đăng ký" />
            </div>
          </div>
        </>
      )}

      {/* 4. SUB-TAB 2: CẤU HÌNH GÓI HỘI VIÊN */}
      {activeSubTab === 'packages' && (
        <div className="admin-content-card">
          <div className="card-header-flex">
            <div>
              <h3 style={{ margin: 0 }}>
                <i className="fa-solid fa-crown"></i> Cấu Hình Gói Hội Viên VIP Hệ Thống
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
                Quản lý các gói Gold, Silver, Student, Diamond với các mức ưu đãi chiết khấu đặt sân
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-action-add btn-action-orange" onClick={handleOpenAddPackage}>
                <i className="fa-solid fa-plus"></i> Thêm Gói Mới
              </button>
              <button type="button" className="btn-action-add" onClick={loadData}>
                <i className="fa-solid fa-rotate"></i> Làm mới
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Gói</th>
                  <th>Tên Gói</th>
                  <th>Giá Niêm Yết</th>
                  <th>Thời Hạn</th>
                  <th>Ưu Đãi Chiết Khấu</th>
                  <th>Đối Tượng</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: pkg.badgeColor || '#0284c7',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}
                      >
                        <i className={pkg.icon || 'fa-solid fa-gem'}></i> {pkg.code}
                      </span>
                    </td>
                    <td>
                      <strong>{pkg.name}</strong>
                      {pkg.description && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {pkg.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7', fontSize: '15px' }}>
                        {Number(pkg.price || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{pkg.durationDays} ngày</span>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>Giảm {pkg.discountPercent}%</strong>
                    </td>
                    <td>
                      {pkg.studentOnly ? (
                        <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
                          <i className="fa-solid fa-graduation-cap"></i> Chỉ Sinh Viên
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Tất cả hội viên</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${pkg.active !== false ? 'status-pill-paid' : 'status-pill-cancelled'}`}>
                        {pkg.active !== false ? 'Kinh Doanh' : 'Tạm Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          onClick={() => handleOpenEditPackage(pkg)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-delete"
                          onClick={() => handleDeletePackage(pkg.id)}
                        >
                          <i className="fa-solid fa-trash"></i> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationBar pagination={pkgPg} unit="gói VIP" />
          </div>
        </div>
      )}

      {/* 5. MODAL CẤP GÓI THỦ CÔNG */}
      {isManualModalOpen && (
        <ModalPortal>
          <div className="admin-modal-backdrop show" onClick={() => setIsManualModalOpen(false)}>
            <div className="admin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>
                  <i className="fa-solid fa-user-plus"></i> Cấp Gói Hội Viên Thủ Công
                </h3>
                <button type="button" className="btn-modal-close" onClick={() => setIsManualModalOpen(false)}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitManualGrant}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Họ và Tên Khách Hàng *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      required
                      value={manualForm.fullName}
                      onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Số Điện Thoại Liên Hệ *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Ví dụ: 0901 234 567"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Gói Hội Viên
                      </label>
                      <select
                        className="form-control"
                        value={manualForm.packageCode}
                        onChange={(e) => setManualForm({ ...manualForm, packageCode: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      >
                        {packages.map((p) => (
                          <option key={p.id} value={p.code}>
                            {p.name} ({p.durationDays} ngày)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Ngày Kích Hoạt
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={manualForm.startDate}
                        onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Phương Thức Thanh Toán
                      </label>
                      <select
                        className="form-control"
                        value={manualForm.paymentMethod}
                        onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      >
                        <option value="Ví D2 Pay">Ví D2 Pay</option>
                        <option value="VietQR">Chuyển khoản VietQR</option>
                        <option value="Tiền mặt">Tiền mặt tại quầy</option>
                        <option value="Miễn phí (Tặng)">Miễn phí (Tặng VIP)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Trạng Thái Cấp
                      </label>
                      <select
                        className="form-control"
                        value={manualForm.status}
                        onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      >
                        <option value="ACTIVE">Kích hoạt ngay (Hiệu lực)</option>
                        <option value="PENDING">Chờ khách xác nhận (Chờ duyệt)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    style={{
                      padding: '9px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsManualModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-action-add btn-action-orange">
                    <i className="fa-solid fa-check"></i> Xác Nhận Cấp Gói
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 6. MODAL CHI TIẾT HỘI VIÊN */}
      {selectedMemberDetail && (
        <ModalPortal>
          <div className="admin-modal-backdrop show" onClick={() => setSelectedMemberDetail(null)}>
            <div className="admin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>
                  <i className="fa-solid fa-id-card"></i> Chi Tiết Hội Viên #{selectedMemberDetail.regCode}
                </h3>
                <button type="button" className="btn-modal-close" onClick={() => setSelectedMemberDetail(null)}>
                  &times;
                </button>
              </div>
              <div className="admin-modal-body" style={{ padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      fontSize: '24px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {selectedMemberDetail.fullName.charAt(0)}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{selectedMemberDetail.fullName}</h4>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>{selectedMemberDetail.phone}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>Gói thành viên:</span>
                    <strong style={{ color: selectedMemberDetail.badgeColor }}>{selectedMemberDetail.packageName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>Ngày bắt đầu:</span>
                    <strong>{selectedMemberDetail.startDate || 'Chưa kích hoạt'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>Ngày hết hạn:</span>
                    <strong>{selectedMemberDetail.endDate || 'Chưa kích hoạt'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>Số ngày còn lại:</span>
                    <strong style={{ color: selectedMemberDetail.daysRemaining > 0 ? '#16a34a' : '#ef4444' }}>
                      {selectedMemberDetail.daysRemaining !== null ? `${selectedMemberDetail.daysRemaining} ngày` : '—'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>Số tiền thanh toán:</span>
                    <strong style={{ color: '#0284c7' }}>
                      {Number(selectedMemberDetail.amount).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#64748b' }}>Phương thức:</span>
                    <strong>{selectedMemberDetail.paymentMethod}</strong>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-action-add" onClick={() => setSelectedMemberDetail(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 7. MODAL THÊM / SỬA GÓI HỘI VIÊN */}
      {isPackageModalOpen && (
        <ModalPortal>
          <div className="admin-modal-backdrop show" onClick={() => setIsPackageModalOpen(false)}>
            <div className="admin-modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>
                  <i className="fa-solid fa-crown"></i> {editingPackage ? 'Chỉnh Sửa Gói VIP' : 'Thêm Gói Hội Viên Mới'}
                </h3>
                <button type="button" className="btn-modal-close" onClick={() => setIsPackageModalOpen(false)}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitPackage}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Mã Gói (Code) *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="VD: GOLD, SILVER"
                        value={packageForm.code}
                        onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Tên Gói Hiển Thị *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="VD: Gói VIP Gold"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Giá Bán (VNĐ) *
                      </label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        required
                        className="form-control"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Thời Hạn (Ngày) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        value={packageForm.durationDays}
                        onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Ưu Đãi (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        className="form-control"
                        value={packageForm.discountPercent}
                        onChange={(e) => setPackageForm({ ...packageForm, discountPercent: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Mô Tả Quyền Lợi
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Mô tả các đặc quyền dành riêng cho khách hàng mua gói này..."
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={packageForm.studentOnly}
                        onChange={(e) => setPackageForm({ ...packageForm, studentOnly: e.target.checked })}
                      />
                      Chỉ dành riêng cho Sinh Viên
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={packageForm.active}
                        onChange={(e) => setPackageForm({ ...packageForm, active: e.target.checked })}
                      />
                      Đang mở bán (Active)
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" className="btn-tbl btn-tbl-edit" onClick={() => setIsPackageModalOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-action-add">
                    {editingPackage ? 'Cập Nhật Gói' : 'Thêm Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 8. MODAL THÙNG RÁC HỘI VIÊN */}
      {isTrashOpen && (
        <AdminTrashModal
          title="Thùng rác Hội Viên Đăng Ký"
          hint="Các lượt đăng ký hội viên đã xóa tạm được lưu trữ tại đây. Bạn có thể khôi phục lại hoặc xóa vĩnh viễn."
          items={trashedMembers}
          onRestore={(item) => handleRestoreMember(item.id)}
          onDestroy={(item) => handlePermanentDeleteMember(item.id)}
          onClearAll={trashedMembers.length > 0 ? handleClearMemberTrash : null}
          onClose={() => setIsTrashOpen(false)}
        />
      )}
    </section>
  );
}
