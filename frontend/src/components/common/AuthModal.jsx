import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { loginUser, registerUser } from '../../services/api';

/**
 * Component Modal Đăng Nhập / Đăng Ký kèm Captcha Mã Số Đơn Giản
 */
export default function AuthModal({ isOpen, onClose, onAuthSuccess, titleNotice }) {
  // Tab hiện tại: 'login' hoặc 'register'
  const [tab, setTab] = useState('login');

  // Form đăng nhập
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Form đăng ký
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: ''
  });

  // Mã Captcha hiển thị và mã do người dùng nhập
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');

  // Trạng thái thông báo lỗi & loading
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm tạo mã Captcha gồm 4 chữ số ngẫu nhiên
  const generateCaptcha = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(randomNum);
    setInputCaptcha('');
    setErrorMsg('');
  };

  // Mỗi khi mở modal hoặc đổi tab thì sinh mã Captcha mới
  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setErrorMsg('');
    }
  }, [isOpen, tab]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Xử lý submit Đăng Nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Kiểm tra mã Captcha
    if (inputCaptcha.trim() !== captchaCode) {
      setErrorMsg('Mã xác nhận (Captcha) không chính xác! Vui lòng nhập đúng số ở trên.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginData.username, loginData.password);
      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit Đăng Ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Kiểm tra mã Captcha
    if (inputCaptcha.trim() !== captchaCode) {
      setErrorMsg('Mã xác nhận (Captcha) không chính xác! Vui lòng nhập đúng số ở trên.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(registerData);
      alert('Đăng ký tài khoản thành công!');
      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng X */}
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {/* Thông báo lý do yêu cầu đăng nhập nếu có */}
        {titleNotice && (
          <div style={styles.noticeBox}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
            {titleNotice}
          </div>
        )}

        {/* Chuyển tab Đăng Nhập / Đăng Ký */}
        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(tab === 'login' ? styles.tabActive : {}) }}
            onClick={() => setTab('login')}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => setTab('register')}
          >
            Đăng Ký
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        {/* ================= FORM ĐĂNG NHẬP ================= */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Tên đăng nhập / Số điện thoại:</label>
              <input
                type="text"
                required
                placeholder="VD: admin hoặc hoivien_gold"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Mật khẩu:</label>
              <input
                type="password"
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
                required
                maxLength="4"
                placeholder="Nhập đúng 4 số ở trên..."
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* ================= FORM ĐĂNG KÝ ================= */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Họ và tên:</label>
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
              <label style={styles.label}>Tên đăng nhập:</label>
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
              <label style={styles.label}>Số điện thoại:</label>
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
              <label style={styles.label}>Mật khẩu:</label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự..."
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
                required
                maxLength="4"
                placeholder="Nhập đúng 4 số ở trên..."
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

// ================= GIAO DIỆN STYLE GỌN GÀNG, ĐƠN GIẢN =================
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    borderRadius: '18px',
    width: '100%',
    maxWidth: '430px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '28px 24px',
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
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.4'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px 8px'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px'
  },
  tabBtn: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer'
  },
  tabActive: {
    color: '#0284c7',
    borderBottomColor: '#0284c7'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
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
    width: '100%'
  },
  captchaSection: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
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
    borderRadius: '6px',
    userSelect: 'none',
    fontFamily: 'monospace'
  },
  captchaRefreshBtn: {
    background: 'none',
    border: '1px solid #cbd5e1',
    padding: '6px 10px',
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
    marginBottom: '14px'
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
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
  }
};
