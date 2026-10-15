import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchUserBookings, cancelBooking, fetchUserMembershipHistory } from '../../services/api';

export default function UserProfileModal({ onOpenMembershipModal }) {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    logout,
    updateProfile,
    changePassword,
    refreshUser
  } = useAuth();
  const { isVietnamese } = useLanguage();
  const modalBoxRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'bookings' | 'memberships'

  // Edit Profile Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Bookings list
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Memberships list
  const [userMemberships, setUserMemberships] = useState([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);

  // Alerts
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isProfileModalOpen && modalBoxRef.current) {
      setMsg({ type: '', text: '' });
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.88, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, [isProfileModalOpen, activeTab]);

  // Load bookings when bookings tab is selected
  useEffect(() => {
    if (isProfileModalOpen && activeTab === 'bookings' && currentUser?.id) {
      const load = async () => {
        setIsLoadingBookings(true);
        try {
          const list = await fetchUserBookings(currentUser.id);
          setUserBookings(list || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingBookings(false);
        }
      };
      load();
    }
  }, [isProfileModalOpen, activeTab, currentUser?.id]);

  // Load memberships history
  useEffect(() => {
    if (isProfileModalOpen && activeTab === 'memberships' && currentUser?.id) {
      const load = async () => {
        setIsLoadingMemberships(true);
        try {
          const list = await fetchUserMembershipHistory(currentUser.id);
          setUserMemberships(list || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingMemberships(false);
        }
      };
      load();
    }
  }, [isProfileModalOpen, activeTab, currentUser?.id]);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ fullName, phone, email });
      setMsg({ type: 'success', text: isVietnamese ? 'Cập nhật thông tin thành công!' : 'Profile updated successfully!' });
      refreshUser();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || (isVietnamese ? 'Cập nhật thất bại!' : 'Failed to update profile!') });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword) {
      setMsg({ type: 'error', text: isVietnamese ? 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!' : 'Please enter current and new password!' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: isVietnamese ? 'Mật khẩu mới phải có từ 6 ký tự trở lên!' : 'New password must have at least 6 characters!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: isVietnamese ? 'Xác nhận mật khẩu mới không khớp!' : 'Passwords do not match!' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setMsg({ type: 'success', text: isVietnamese ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message || (isVietnamese ? 'Đổi mật khẩu thất bại!' : 'Failed to change password!') });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelMyBooking = async (bookingId) => {
    if (!window.confirm(isVietnamese ? `Bạn có chắc chắn muốn hủy đơn đặt sân #${bookingId}?` : `Cancel booking #${bookingId}?`)) {
      return;
    }
    try {
      await cancelBooking(bookingId);
      alert(isVietnamese ? 'Đã hủy đơn đặt sân thành công!' : 'Booking cancelled successfully!');
      const fresh = await fetchUserBookings(currentUser.id);
      setUserBookings(fresh || []);
      refreshUser();
    } catch (err) {
      alert(err.message || 'Lỗi khi hủy đơn!');
    }
  };

  return (
    <div
      className="profile-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfileModal();
      }}
    >
      <div
        className="profile-modal-card"
        ref={modalBoxRef}
        style={{
          width: '100%',
          maxWidth: '740px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header Profile */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {(currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  {currentUser.fullName || currentUser.username}
                </h3>
                {currentUser.isMember && (
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="fa-solid fa-crown"></i> VIP MEMBER
                  </span>
                )}
                {currentUser.role === 'ROLE_ADMIN' && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                @{currentUser.username} • {currentUser.phone || 'Chưa cập nhật SĐT'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={logout}
              title={isVietnamese ? 'Đăng xuất tài khoản' : 'Sign out'}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>{isVietnamese ? 'Đăng xuất' : 'Logout'}</span>
            </button>
            <button
              type="button"
              onClick={closeProfileModal}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '14px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              {isVietnamese ? 'SỐ DƯ VÍ' : 'WALLET BALANCE'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>
              {(currentUser.walletBalance || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              {isVietnamese ? 'ĐIỂM TÍCH LŨY' : 'LOYALTY POINTS'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>
              {currentUser.loyaltyPoints || 0} pts
            </span>
          </div>
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              {isVietnamese ? 'GÓI HỘI VIÊN' : 'MEMBERSHIP TIER'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: currentUser.isMember ? '#f59e0b' : '#64748b' }}>
              {currentUser.isMember
                ? `${currentUser.membershipPackage?.name || 'VIP'} (-${currentUser.discountPercent || 0}%)`
                : (isVietnamese ? 'Khách thường' : 'Standard')}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', background: '#fff' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setMsg({ type: '', text: '' }); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: activeTab === 'profile' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-user-pen"></i>
            <span>{isVietnamese ? 'Hồ Sơ Cá Nhân' : 'My Profile'}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('bookings'); setMsg({ type: '', text: '' }); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'bookings' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: activeTab === 'bookings' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-calendar-check"></i>
            <span>{isVietnamese ? 'Lịch Sử Đặt Sân' : 'Bookings'}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('memberships'); setMsg({ type: '', text: '' }); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'memberships' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: activeTab === 'memberships' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-crown"></i>
            <span>{isVietnamese ? 'Gói Hội Viên' : 'Memberships'}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setMsg({ type: '', text: '' }); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid #0284c7' : '2px solid transparent',
              background: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: activeTab === 'password' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-key"></i>
            <span>{isVietnamese ? 'Đổi Mật Khẩu' : 'Password'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {msg.text && (
            <div
              style={{
                backgroundColor: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: msg.type === 'success' ? '#15803d' : '#b91c1c',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
              <span>{msg.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isVietnamese ? 'Họ và tên' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isVietnamese ? 'Tên đăng nhập (Cố định)' : 'Username (Fixed)'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isVietnamese ? 'Số điện thoại' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>{isUpdatingProfile ? (isVietnamese ? 'Đang lưu...' : 'Saving...') : (isVietnamese ? 'Lưu Thay Đổi' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BOOKINGS HISTORY */}
          {activeTab === 'bookings' && (
            <div>
              {isLoadingBookings ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                  <p>{isVietnamese ? 'Đang tải lịch sử đặt sân...' : 'Loading bookings...'}</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '36px', marginBottom: '12px', color: '#cbd5e1' }}></i>
                  <p style={{ fontSize: '14px', margin: 0 }}>{isVietnamese ? 'Bạn chưa có đơn đặt sân nào trên hệ thống!' : 'No booking records found.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                            #{b.bookingCode || b.id}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: b.status === 'CONFIRMED' || b.status === 'PAID' ? '#dcfce7' : '#fee2e2',
                              color: b.status === 'CONFIRMED' || b.status === 'PAID' ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {b.status || 'CONFIRMED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                          📅 {b.bookingDate} • {b.branch?.name || 'Ways Station'} • {b.totalHours || 1}h
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '15px' }}>
                          {(b.totalPrice || 0).toLocaleString('vi-VN')} đ
                        </div>
                        {b.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelMyBooking(b.id)}
                            style={{
                              marginTop: '4px',
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            {isVietnamese ? 'Hủy đơn' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEMBERSHIPS */}
          {activeTab === 'memberships' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: '#92400e', fontSize: '15px', fontWeight: 800 }}>
                    <i className="fa-solid fa-crown" style={{ marginRight: '6px' }}></i>
                    {currentUser.isMember
                      ? (isVietnamese ? `Gói đang kích hoạt: ${currentUser.membershipPackage?.name || 'VIP'}` : `Active tier: ${currentUser.membershipPackage?.name}`)
                      : (isVietnamese ? 'Bạn chưa đăng ký gói Hội Viên VIP' : 'You do not have an active VIP package')}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#b45309' }}>
                    {currentUser.isMember
                      ? (isVietnamese
                          ? `Được giảm ${currentUser.discountPercent || 0}% mọi ca đặt sân • Hạn đến: ${currentUser.membershipExpiresAt ? new Date(currentUser.membershipExpiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}`
                          : `Save ${currentUser.discountPercent}% on every court booking`)
                      : (isVietnamese
                          ? 'Đăng ký ngay để nhận chiết khấu lên đến 10% giờ chơi, miễn phí tủ đồ và sấy giày UV!'
                          : 'Subscribe now to save up to 10% on courts!')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeProfileModal();
                    if (onOpenMembershipModal) onOpenMembershipModal();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {currentUser.isMember ? (isVietnamese ? 'Gia hạn gói' : 'Extend') : (isVietnamese ? 'Nâng cấp VIP ngay' : 'Join VIP')}
                </button>
              </div>

              {isLoadingMemberships ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang tải lịch sử...
                </div>
              ) : userMemberships.length > 0 ? (
                <div>
                  <h5 style={{ margin: '0 0 10px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>
                    {isVietnamese ? 'Lịch sử giao dịch gói VIP:' : 'VIP subscription history:'}
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userMemberships.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '13px'
                        }}
                      >
                        <div>
                          <strong>{m.membershipPackage?.name || 'Gói VIP'}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {m.startDate} ➔ {m.endDate} • {m.paymentMethod}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                            {(m.pricePaid || 0).toLocaleString('vi-VN')} đ
                          </span>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: m.status === 'ACTIVE' ? '#15803d' : '#64748b',
                              fontWeight: 700
                            }}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 4: PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {isVietnamese ? 'Mật khẩu hiện tại' : 'Current Password'}
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isVietnamese ? 'Mật khẩu mới' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="≥ 6 ký tự"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isVietnamese ? 'Xác nhận lại' : 'Confirm'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fa-solid fa-lock"></i>
                  <span>{isChangingPassword ? (isVietnamese ? 'Đang đổi...' : 'Changing...') : (isVietnamese ? 'Cập Nhật Mật Khẩu' : 'Update Password')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
