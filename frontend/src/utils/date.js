/**
 * Ngày dạng yyyy-MM-dd theo giờ địa phương của máy người dùng.
 * Không dùng toISOString() vì nó tính theo giờ quốc tế (UTC): ở Việt Nam từ 0h đến 7h sáng
 * kết quả sẽ lùi một ngày so với ngày thực tế.
 */
export function toLocalDateString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
