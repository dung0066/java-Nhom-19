/** Tiện ích thanh toán dùng chung: tạo ảnh VietQR đúng số tiền và nội dung chuyển khoản. */
export const BANK_NAME = 'Ngân hàng Á Châu (ACB)';
export const BANK_ACCOUNT_NO = '18900291';
export const BANK_ACCOUNT_NAME = 'DAO DUY DUNG';

export function buildVietQrUrl(amount, content) {
  const params = new URLSearchParams({
    amount: String(Math.round(Number(amount) || 0)),
    addInfo: content || '',
    accountName: BANK_ACCOUNT_NAME
  });
  return `https://api.vietqr.io/image/ACB-${BANK_ACCOUNT_NO}-compact2.jpg?${params.toString()}`;
}

export const formatVnd = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')} đ`;
