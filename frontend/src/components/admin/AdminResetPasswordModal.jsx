import React, { useState, useEffect } from 'react';
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithToken
} from '../../services/api';
import ModalPortal from './ModalPortal';

export default function AdminResetPasswordModal({
  isOpen,
  onClose,
  initialIdentifier = 'admin',
  onSuccess
}) {
  // Steps: 1 = SEND_OTP, 2 = VERIFY_OTP, 3 = NEW_PASSWORD, 4 = SUCCESS
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier(initialIdentifier || 'admin');
      setOtp('');
      setMaskedEmail('');
      setDebugOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialIdentifier]);

  if (!isOpen) return null;

  // BƯỚC 1: GỬI OTP QUA EMAIL
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập hoặc Email quản trị viên!');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOtp(identifier.trim());
      setMaskedEmail(res.email || 'email quản trị');
      if (res.debugOtp) setDebugOtp(res.debugOtp);
      setSuccessMsg(res.message || 'Đã gửi mã OTP 6 số đến email của bạn!');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại tài khoản!');
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 2: XÁC THỰC MÃ OTP TỪ SERVER
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Mã xác thực OTP phải gồm đúng 6 chữ số!');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await verifyForgotPasswordOtp(identifier.trim(), cleanOtp);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setSuccessMsg('Xác thực OTP thành công! Đang chuyển tiếp sang trang đổi mật khẩu...');
        // Tự động chuyển tiếp sang trang đặt mật khẩu mới
        setTimeout(() => {
          setSuccessMsg('');
          setStep(3);
        }, 500);
      } else {
        throw new Error('Không nhận được token xác thực từ server!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 3: ĐẶT MẬT KHẨU MỚI VỚI RESET TOKEN
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      await resetPasswordWithToken(resetToken, newPassword);
      setStep(4);
      if (onSuccess) onSuccess(newPassword);
    } catch (err) {
      setErrorMsg(err.message || 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalPortal>
    <div className="admin-modal-backdrop show" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="admin-modal-box"
        style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div
          className="admin-modal-header"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '20px 24px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-shield-halved"></i> Đặt Lại Mật Khẩu Quản Trị
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              Xác thực 2 lớp qua Email OTP 6 số bảo mật chuẩn BWF
            </p>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            style={{ color: '#fff', fontSize: '24px', opacity: 0.8 }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* PROGRESS STEP BAR */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #e2e8f0', gap: '8px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: step >= 1 ? '#0284c7' : '#94a3b8' }}>
              1. GỬI OTP
            </div>
            <div style={{ height: '3px', background: step >= 1 ? '#0284c7' : '#e2e8f0', borderRadius: '2px', marginTop: '4px' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: step >= 2 ? '#0284c7' : '#94a3b8' }}>
              2. NHẬP OTP
            </div>
            <div style={{ height: '3px', background: step >= 2 ? '#0284c7' : '#e2e8f0', borderRadius: '2px', marginTop: '4px' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: step >= 3 ? '#0284c7' : '#94a3b8' }}>
              3. ĐỔI MẬT KHẨU
            </div>
            <div style={{ height: '3px', background: step >= 3 ? '#0284c7' : '#e2e8f0', borderRadius: '2px', marginTop: '4px' }} />
          </div>
        </div>

        <div className="admin-modal-body" style={{ padding: '24px' }}>
          {/* ERROR ALERT */}
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS ALERT */}
          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-check"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {/* BƯỚC 1: NHẬP TÀI KHOẢN ĐỂ GỬI OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '16px' }}>
                Nhập tên đăng nhập hoặc địa chỉ email tài khoản Quản trị viên. Hệ thống sẽ tự động tạo và gửi mã xác thực <strong>OTP 6 số</strong> vào hòm thư email của bạn.
              </p>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Tên Đăng Nhập Hoặc Email Quản Trị *
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-user" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: admin hoặc admin@d2badmintonshop.vn"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-action-add"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang gửi mã OTP qua Email...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Gửi Mã OTP 6 Số Qua Email
                  </>
                )}
              </button>
            </form>
          )}

          {/* BƯỚC 2: NHẬP VÀ XÁC THỰC MÃ OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-envelope-open-text"></i>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800 }}>
                  Kiểm Tra Email Của Bạn
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Mã OTP 6 số đã được gửi tới: <strong style={{ color: '#0369a1' }}>{maskedEmail}</strong>
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  (Mã có hiệu lực trong vòng 10 phút)
                </p>
              </div>

              {debugOtp && (
                <div style={{ background: '#eff6ff', border: '1px dashed #3b82f6', borderRadius: '8px', padding: '10px', textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#1d4ed8' }}>Mã OTP thử nghiệm (Dev/Localhost):</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '4px', color: '#1e40af', marginTop: '2px' }}>
                    {debugOtp}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
                  Nhập Mã Xác Thực OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '32px',
                    fontWeight: 900,
                    letterSpacing: '12px',
                    border: '2px solid #0284c7',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    color: '#0369a1',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="btn-action-add"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang xác thực OTP...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key"></i> Xác Thực OTP & Chuyển Tiếp
                  </>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Đổi tài khoản
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          )}

          {/* BƯỚC 3: NHẬP MẬT KHẨU MỚI (PAGE CHUYỂN TIẾP TOKEN) */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '8px' }}>
                  <i className="fa-solid fa-lock-open"></i>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800 }}>
                  Thiết Lập Mật Khẩu Mới
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Token bảo mật đã được xác thực hợp lệ. Vui lòng đặt mật khẩu mới cho tài khoản <strong>{identifier}</strong>.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Mật Khẩu Mới (Tối thiểu 6 ký tự) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Xác Nhận Mật Khẩu Mới *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-action-add"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang lưu mật khẩu...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check-double"></i> Xác Nhận Đặt Lại Mật Khẩu
                  </>
                )}
              </button>
            </form>
          )}

          {/* BƯỚC 4: THÀNH CÔNG */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                Đặt Lại Mật Khẩu Thành Công!
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Mật khẩu tài khoản quản trị viên của bạn đã được cập nhật an toàn vào CSDL MySQL. Bạn có thể đăng nhập ngay bằng mật khẩu mới này.
              </p>

              <button
                type="button"
                className="btn-action-add"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
                onClick={onClose}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Đăng Nhập Ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

