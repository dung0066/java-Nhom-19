import React from 'react';

/** Rút gọn danh sách số trang: 1 ... 4 5 6 ... 20 để không tràn khi có nhiều trang. */
function buildPageList(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap-' + p);
    result.push(p);
  });
  return result;
}

export function PaginationBar({ pagination, unit = 'mục' }) {
  const { page, setPage, pageSize, setPageSize, total, totalPages, startIndex, endIndex } = pagination;
  if (total === 0) return null;

  return (
    <div className="admin-pagination-bar" style={{ marginTop: '16px', borderRadius: '8px' }}>
      <div className="pagination-info">
        Hiển thị <strong>{startIndex + 1} - {endIndex}</strong> trên <strong>{total}</strong> {unit}
        &nbsp;&bull;&nbsp;
        <label style={{ marginLeft: '8px' }}>
          Số dòng/trang:
          <select
            className="pagination-size-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ marginLeft: '6px' }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="pagination-controls">
        <button type="button" className="btn-page-nav" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <i className="fa-solid fa-chevron-left"></i> Trước
        </button>

        {buildPageList(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`page-number-btn ${page === item ? 'active' : ''}`}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          )
        )}

        <button type="button" className="btn-page-nav" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Tiếp <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
