import React, { useState } from 'react';

/**
 * Tab Quản Lý Tin Tức & Bài Viết Cầu Lông (Admin)
 * Kết nối REST API /api/admin/articles (SQL Database)
 */
export default function AdminArticlesTab({
  articles = [],
  onOpenAddModal,
  onEditArticle,
  onTogglePublished,
  onDeleteArticle,
  onRefresh,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredArticles = articles.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.author && a.author.toLowerCase().includes(q));

    const matchCat = !categoryFilter || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <section id="articlesTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-newspaper"></i> Quản Lý Danh Sách Tin Tức & Bài Viết
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Thêm mới bài viết, chỉnh sửa nội dung, bật/tắt xuất bản ra trang chủ và trang tin tức người dùng
            </p>
          </div>

          <div className="filter-tools-row">
            <div className="input-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm tiêu đề, nội dung bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              <option value="KY_THUAT">Kỹ Thuật & Sức Khỏe</option>
              <option value="TIEU_CHUAN">Tiêu Chuẩn Sân</option>
              <option value="GIAI_DAU">Giải Đấu Mở Rộng</option>
              <option value="SU_KIEN">Sự Kiện & CLB</option>
            </select>

            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={onOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i> Thêm Bài Viết Mới
            </button>
            <button
              type="button"
              className="btn-action-add"
              onClick={onRefresh}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Hình Ảnh</th>
                <th>Tiêu Đề Bài Viết</th>
                <th>Danh Mục</th>
                <th>Tác Giả</th>
                <th>Trạng Thái</th>
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách bài viết từ SQL...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Chưa có bài viết nào trong hệ thống. Bấm <strong>"+ Thêm Bài Viết Mới"</strong> để đăng tin!
                  </td>
                </tr>
              ) : (
                filteredArticles.map((item) => {
                  const isPub = item.published !== false;
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>#{item.id}</strong>
                      </td>
                      <td>
                        <img
                          src={item.image || '/news/news1.png'}
                          alt={item.title}
                          style={{ width: '68px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          onError={(e) => { e.currentTarget.src = '/banners/banner1.jpg'; }}
                        />
                      </td>
                      <td style={{ maxWidth: '320px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px', display: 'block', marginBottom: '4px' }}>
                          {item.title}
                        </strong>
                        <small style={{ color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.summary || item.content}
                        </small>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: 700
                        }}>
                          {item.categoryLabel || item.category || 'Tin Tức'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                          {item.author || 'D2 Media'}
                        </span>
                      </td>
                      <td>
                        {isPub ? (
                          <span className="badge-status badge-active">
                            <i className="fa-solid fa-eye"></i> Công Khai
                          </span>
                        ) : (
                          <span className="badge-status badge-danger" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                            <i className="fa-solid fa-eye-slash"></i> Bản Nháp
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            title="Chỉnh sửa bài viết"
                            onClick={() => onEditArticle && onEditArticle(item)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-tbl"
                            style={{
                              background: isPub ? '#fef3c7' : '#dcfce7',
                              color: isPub ? '#b45309' : '#15803d',
                              border: isPub ? '1px solid #fde68a' : '1px solid #bbf7d0'
                            }}
                            title={isPub ? "Ẩn khỏi trang chủ người dùng" : "Xuất bản công khai ra trang chủ"}
                            onClick={() => onTogglePublished && onTogglePublished(item.id)}
                          >
                            <i className={isPub ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                            {isPub ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-delete"
                            title="Xóa bài viết này khỏi SQL"
                            onClick={() => onDeleteArticle && onDeleteArticle(item.id)}
                          >
                            <i className="fa-solid fa-trash"></i> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

