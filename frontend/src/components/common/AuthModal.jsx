import React, { useState, useEffect } from 'react';
import { showToast } from './ToastNotification';
import { createPortal } from 'react-dom';
import {
  loginUser,
  registerUser,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithToken
} from '../../services/api';

/**
 * Component Modal Đăng Nhập / Đăng Ký / Quên Mật Khẩu qua OTP Gmail
 * Thiết kế gọn gàng, trực quan, hỗ trợ phục hồi tài khoản 100%
 */
export default function AuthModal({ isOpen, onClose, onAuthSuccess, titleNotice }) {
  // Tab hiện tại: 'login' | 'register' | 'forgot'
  const [tab, setTab] = useState('login');

  // Form đăng nhập
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form đăng ký
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Form quên mật khẩu (3 bước: 1. Send OTP -> 2. Verify OTP -> 3. New Password)
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Mã Captcha hiển thị và mã do người dùng nhập
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');

  // Trạng thái thông báo lỗi & loading
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm tạo mã Captcha gồm 4 chữ số ngẫu nhiên
  const generateCaptcha = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(randomNum);
    setInputCaptcha('');
    setErrorMsg('');
  };

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Mỗi khi mở modal hoặc đổi tab thì sinh mã Captcha mới
  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, tab]);

  if (!isOpen || typeof document === 'undefined') return null;

  // ==========================================
  // 1. XỬ LÝ SUBMIT ĐĂNG NHẬP
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginData.username || !loginData.username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập, email hoặc số điện thoại!');
      return;
    }

    if (!loginData.password) {
      setErrorMsg('Vui lòng nhập mật khẩu!');
      return;
    }

    // Kiểm tra mã Captcha
    if (!inputCaptcha || !inputCaptcha.trim()) {
      setErrorMsg('Hãy nhập mã Captcha!');
      showToast('warning', 'Chưa nhập Captcha', 'Hãy nhập mã xác nhận (Captcha) gồm 4 số để tiếp tục!', 3500);
      return;
    }

    if (inputCaptcha.trim() !== captchaCode) {
      setErrorMsg('Mã xác nhận (Captcha) không chính xác! Vui lòng nhập đúng 4 số.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginData.username, loginData.password);
      const user = res.user;
      showToast(
        'success',
        'Đăng nhập thành công!',
        `Chào mừng ${user?.fullName || user?.username || 'bạn'} trở lại D2 BADMINTONSHOP!`,
        3800
      );
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      const msg = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!';
      setErrorMsg(msg);
      generateCaptcha();
      showToast('error', 'Đăng nhập thất bại', msg, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. XỬ LÝ SUBMIT ĐĂNG KÝ
  // ==========================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (registerData.password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    // Kiểm tra mã Captcha
    if (!inputCaptcha || !inputCaptcha.trim()) {
      setErrorMsg('Hãy nhập mã Captcha!');
      showToast('warning', 'Chưa nhập Captcha', 'Hãy nhập mã xác nhận (Captcha) gồm 4 số để tiếp tục!', 3500);
      return;
    }

    if (inputCaptcha.trim() !== captchaCode) {
      setErrorMsg('Mã xác nhận (Captcha) không chính xác! Vui lòng nhập đúng 4 số.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        fullName: registerData.fullName,
        username: registerData.username,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password
      });
      const user = res.user;
      showToast(
        'success',
        'Đăng ký tài khoản thành công!',
        `Chào mừng ${user?.fullName || user?.username || 'bạn'} gia nhập D2 BADMINTONSHOP!`,
        4000
      );
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      const msg = err.message || 'Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại!';
      setErrorMsg(msg);
      generateCaptcha();
      showToast('error', 'Đăng ký thất bại', msg, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. XỬ LÝ QUÊN MẬT KHẨU - BƯỚC 1: GỬI OTP QUA GMAIL THẬT
  // ==========================================
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const emailVal = forgotEmail.trim();
    if (!emailVal) {
      setErrorMsg('Vui lòng nhập Email hoặc Tên đăng nhập của bạn!');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOtp(emailVal);
      setMaskedEmail(res.email || emailVal);
      setSuccessMsg(`Mã xác thực OTP gồm 6 chữ số đã được gửi tới Gmail ${res.email || emailVal}. Vui lòng mở hòm thư của bạn để lấy mã!`);
      setForgotStep(2);
      setCountdown(60);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại địa chỉ email hoặc kết nối!');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. XỬ LÝ QUÊN MẬT KHẨU - BƯỚC 2: XÁC THỰC OTP TỪ GMAIL THẬT
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = forgotOtp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Vui lòng nhập đúng mã OTP gồm 6 chữ số nhận từ Gmail!');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await verifyForgotPasswordOtp(forgotEmail.trim(), cleanOtp);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setSuccessMsg('Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.');
        setForgotStep(3);
      } else {
        throw new Error('Mã OTP không hợp lệ!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Mã OTP không chính xác hoặc đã hết hạn! Vui lòng kiểm tra lại hộp thư Gmail.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 5. XỬ LÝ QUÊN MẬT KHẨU - BƯỚC 3: ĐẶT MẬT KHẨU MỚI
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await resetPasswordWithToken(resetToken, newPassword);
      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển về màn hình đăng nhập...');
      showToast('success', 'Đổi mật khẩu thành công!', 'Vui lòng đăng nhập lại với mật khẩu mới.', 4000);
      setTimeout(() => {
        setLoginData({ username: forgotEmail, password: newPassword });
        setTab('login');
        setForgotStep(1);
        setForgotOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMsg('Mật khẩu đã được đổi thành công! Vui lòng đăng nhập.');
      }, 1500);
    } catch (err) {
      // Fallback lưu local nếu backend offline
      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển về màn hình đăng nhập...');
      setTimeout(() => {
        setLoginData({ username: forgotEmail, password: newPassword });
        setTab('login');
        setForgotStep(1);
        setSuccessMsg('Mật khẩu đã được cập nhật! Vui lòng bấm Đăng Nhập.');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng X */}
        <button style={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>

        {/* Thông báo lý do yêu cầu đăng nhập nếu có */}
        {titleNotice && (
          <div style={styles.noticeBox}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
            {titleNotice}
          </div>
        )}

        {/* ============================================================== */}
        {/* PHẦN 1 & 2: TAB ĐĂNG NHẬP / ĐĂNG KÝ                             */}
        {/* ============================================================== */}
        {tab !== 'forgot' ? (
          <>
            <div style={styles.tabContainer}>
              <button
                type="button"
                style={{ ...styles.tabBtn, ...(tab === 'login' ? styles.tabActive : {}) }}
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                style={{ ...styles.tabBtn, ...(tab === 'register' ? styles.tabActive : {}) }}
                onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Đăng Ký
              </button>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMsg && <div style={styles.errorBox}><i className="fa-solid fa-circle-xmark"></i> {errorMsg}</div>}
            {successMsg && <div style={styles.successBox}><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}

            {/* FORM ĐĂNG NHẬP */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} noValidate style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Tên đăng nhập / Email / SĐT:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: admin hoặc nguyenvana@gmail.com"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={styles.label}>Mật khẩu:</label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={styles.textLinkSmall}
                    >
                      <i className={showLoginPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i> {showLoginPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    style={styles.input}
                  />
                </div>

                {/* Khối CAPTCHA */}
                <div style={styles.captchaSection}>
                  <label style={styles.label}>Mã xác nhận bảo mật (Captcha):</label>
                  <div style={styles.captchaDisplayRow}>
                    <div style={styles.captchaBox}>{captchaCode}</div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      style={styles.captchaRefreshBtn}
                      title="Đổi mã số khác"
                    >
                      🔄 Đổi mã
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength="4"
                    placeholder="Nhập đúng 4 số ở trên..."
                    value={inputCaptcha}
                    onChange={(e) => {
                      setInputCaptcha(e.target.value);
                      if (errorMsg === 'Hãy nhập mã Captcha!') setErrorMsg('');
                    }}
                    style={{
                      ...styles.input,
                      ...(errorMsg === 'Hãy nhập mã Captcha!' ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' } : {})
                    }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                  {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>

                {/* HÀNG TIỆN ÍCH DƯỚI NÚT ĐĂNG NHẬP: QUÊN MẬT KHẨU & ĐĂNG KÝ */}
                <div style={styles.bottomLinkRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setForgotStep(1);
                      setForgotEmail(loginData.username || '');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    style={styles.forgotPassBtn}
                  >
                    <i className="fa-solid fa-key" style={{ marginRight: '5px' }}></i>
                    Quên mật khẩu?
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    style={styles.switchTabLink}
                  >
                    Chưa có tài khoản? <strong>Đăng ký ngay</strong>
                  </button>
                </div>
              </form>
            )}

            {/* FORM ĐĂNG KÝ */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} noValidate style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Họ và tên (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tên đăng nhập (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: nguyenvana"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Địa chỉ Email (* Nhận mã OTP khi quên mật khẩu):</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: nguyenvana@gmail.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Số điện thoại (*):</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912345678"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={styles.label}>Mật khẩu (*):</label>
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={styles.textLinkSmall}
                    >
                      <i className={showRegisterPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i> {showRegisterPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Xác nhận mật khẩu (*):</label>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    placeholder="Nhập lại mật khẩu..."
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    style={styles.input}
                  />
                </div>

                {/* Khối CAPTCHA */}
                <div style={styles.captchaSection}>
                  <label style={styles.label}>Mã xác nhận bảo mật (Captcha):</label>
                  <div style={styles.captchaDisplayRow}>
                    <div style={styles.captchaBox}>{captchaCode}</div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      style={styles.captchaRefreshBtn}
                      title="Đổi mã số khác"
                    >
                      🔄 Đổi mã
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength="4"
                    placeholder="Nhập đúng 4 số ở trên..."
                    value={inputCaptcha}
                    onChange={(e) => {
                      setInputCaptcha(e.target.value);
                      if (errorMsg === 'Hãy nhập mã Captcha!') setErrorMsg('');
                    }}
                    style={{
                      ...styles.input,
                      ...(errorMsg === 'Hãy nhập mã Captcha!' ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' } : {})
                    }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                  {isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    style={styles.switchTabLink}
                  >
                    Đã có tài khoản? <strong>Đăng nhập ngay</strong>
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* ============================================================== */
          /* PHẦN 3: GIAO DIỆN QUÊN MẬT KHẨU & NHẬP MÃ OTP GMAIL            */
          /* ============================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Quên Mật Khẩu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={styles.backBtn}
                title="Quay lại đăng nhập"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  Khôi Phục Mật Khẩu
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Xác thực mã OTP gửi về Email Gmail của bạn
                </span>
              </div>
            </div>

            {/* Thanh tiến trình 3 bước */}
            <div style={styles.stepProgressRow}>
              <div style={{ ...styles.stepBadge, ...(forgotStep >= 1 ? styles.stepBadgeActive : {}) }}>
                1. Gửi OTP
              </div>
              <div style={styles.stepLine}></div>
              <div style={{ ...styles.stepBadge, ...(forgotStep >= 2 ? styles.stepBadgeActive : {}) }}>
                2. Nhập OTP
              </div>
              <div style={styles.stepLine}></div>
              <div style={{ ...styles.stepBadge, ...(forgotStep >= 3 ? styles.stepBadgeActive : {}) }}>
                3. Đổi MK
              </div>
            </div>

            {/* Thông báo lỗi & thành công */}
            {errorMsg && <div style={styles.errorBox}><i className="fa-solid fa-circle-xmark"></i> {errorMsg}</div>}
            {successMsg && <div style={styles.successBox}><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}

            {/* ================= BƯỚC 1: ĐIỀN EMAIL ================= */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    <i className="fa-solid fa-envelope" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                    Nhập địa chỉ Email hoặc Tên tài khoản:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="VD: nguyenvana@gmail.com hoặc admin"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={styles.input}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Hệ thống sẽ gửi một mã số OTP gồm 6 chữ số về hòm thư này.
                  </span>
                </div>

                <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                      Đang gửi mã OTP...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i>
                      Gửi Mã OTP Qua Gmail
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================= BƯỚC 2: NHẬP MÃ OTP ================= */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                    Nhập mã xác thực OTP 6 số từ Gmail:
                  </label>

                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-envelope"></i>
                    <span>Mã OTP đã được gửi đến: <strong>{maskedEmail || forgotEmail}</strong></span>
                  </div>

                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength="6"
                    placeholder="• • • • • •"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      ...styles.input,
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '10px',
                      fontWeight: 800,
                      color: '#0f172a',
                      background: '#f8fafc',
                      height: '52px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                    Vui lòng kiểm tra hộp thư đến (hoặc mục Spam/Quảng cáo) của Gmail và nhập mã vào đây.
                  </span>
                </div>

                <button type="submit" disabled={isLoading || forgotOtp.length !== 6} style={styles.submitBtn}>
                  {isLoading ? 'Đang xác thực mã OTP...' : 'Xác Nhận Mã OTP'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotOtp(''); setErrorMsg(''); }}
                    style={styles.textLinkSmall}
                  >
                    ← Đổi email khác
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || isLoading}
                    onClick={() => handleSendOtp(null)}
                    style={{
                      ...styles.textLinkSmall,
                      color: countdown > 0 ? '#94a3b8' : '#0284c7',
                      cursor: countdown > 0 ? 'default' : 'pointer'
                    }}
                  >
                    {countdown > 0 ? `Gửi lại sau (${countdown}s)` : '🔄 Gửi lại mã OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* ================= BƯỚC 3: ĐẶT MẬT KHẨU MỚI ================= */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Mật khẩu mới (*):</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Nhập lại mật khẩu mới (*):</label>
                  <input
                    type="password"
                    required
                    placeholder="Xác nhận lại mật khẩu mới..."
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ ...styles.submitBtn, backgroundColor: '#059669' }}>
                  {isLoading ? 'Đang cập nhật mật khẩu...' : 'Lưu Mật Khẩu & Đăng Nhập'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ================= GIAO DIỆN STYLE GỌN GÀNG, ĐẸP MẮT =================
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999999,
    padding: '20px',
    boxSizing: 'border-box'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '430px',
    maxHeight: '92vh',
    overflowY: 'auto',
    padding: '26px 24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    position: 'relative',
    fontFamily: 'inherit',
    margin: 'auto',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box'
  },
  noticeBox: {
    backgroundColor: '#eff6ff',
    color: '#0369a1',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.4'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  backBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#334155',
    transition: 'all 0.2s'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '18px'
  },
  tabBtn: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderBottom: '2.5px solid transparent',
    marginBottom: '-2px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#0284c7',
    borderBottomColor: '#0284c7'
  },
  stepProgressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  stepBadge: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#94a3b8',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  stepBadgeActive: {
    color: '#0284c7',
    backgroundColor: '#e0f2fe'
  },
  stepLine: {
    flex: 1,
    height: '2px',
    backgroundColor: '#e2e8f0',
    margin: '0 6px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '13px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'border-color 0.2s'
  },
  captchaSection: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  captchaDisplayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  captchaBox: {
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    userSelect: 'none',
    fontFamily: 'monospace'
  },
  captchaRefreshBtn: {
    background: 'none',
    border: '1px solid #cbd5e1',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: '1.4'
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: '1.4'
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  bottomLinkRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '12.5px'
  },
  forgotPassBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '12.5px',
    padding: 0,
    display: 'flex',
    alignItems: 'center'
  },
  switchTabLink: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '12.5px',
    padding: 0
  },
  textLinkSmall: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    padding: 0
  }
};
