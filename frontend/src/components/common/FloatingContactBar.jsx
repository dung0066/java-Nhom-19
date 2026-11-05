import React from 'react';
import '../../styles/floating-contact.css';

/**
 * Thanh liên hệ nhanh bên mép trái màn hình (Floating Contact Bar)
 * Gồm: Messenger, Zalo, Gọi Hotline, Gửi SMS
 */
export default function FloatingContactBar() {
  const hotline = '0914977030';

  return (
    <aside className="d2-floating-contact-bar" aria-label="Kênh liên hệ hỗ trợ nhanh">
      {/* 1. Messenger */}
      <a
        href="https://m.me/d2shop.badminton"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-item messenger-item"
        title="Chat Facebook Messenger"
      >
        <span className="icon-circle">
          <i className="fa-brands fa-facebook-messenger"></i>
        </span>
        <span className="contact-tooltip">Chat Messenger</span>
      </a>

      {/* 2. Zalo */}
      <a
        href={`https://zalo.me/${hotline}`}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-item zalo-item"
        title="Chat Zalo hỗ trợ"
      >
        <span className="icon-circle zalo-badge">
          <span className="zalo-text">Zalo</span>
        </span>
        <span className="contact-tooltip">Chat Zalo: {hotline}</span>
      </a>

      {/* 3. Gọi Hotline */}
      <a
        href={`tel:${hotline}`}
        className="contact-item phone-item"
        title="Gọi hotline đặt sân"
      >
        <span className="icon-circle phone-pulse">
          <i className="fa-solid fa-phone-volume"></i>
        </span>
        <span className="contact-tooltip">Hotline: 0914 977 030</span>
      </a>

      {/* 4. SMS */}
      <a
        href={`sms:${hotline}`}
        className="contact-item sms-item"
        title="Gửi tin nhắn SMS"
      >
        <span className="icon-circle sms-badge">
          <span className="sms-text">SMS</span>
        </span>
        <span className="contact-tooltip">Gửi SMS: {hotline}</span>
      </a>
    </aside>
  );
}
