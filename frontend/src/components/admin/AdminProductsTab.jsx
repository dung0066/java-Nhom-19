import React, { useState, useEffect } from 'react';

export default function AdminProductsTab({
  products = [],
  onOpenAddModal,
  onEditProduct,
  onToggleActive,
  onDeleteProduct
}) {
  const [selectedCat, setSelectedCat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredProducts = selectedCat
    ? products.filter((p) => p.category === selectedCat)
    : products;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <section id="productsTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-wand-magic-sparkles"></i> Quản Lý Kho Dụng Cụ, Vợt & Giày Cho Thuê
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thay đổi hình ảnh, giá thuê, thông số kỹ thuật và trạng thái hiển thị trực tiếp lên Trang Chủ
            </p>
          </div>
          <div className="filter-tools-row">
            <select
              className="select-filter"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              <option value="RACQUET">Vợt Cầu Lông</option>
              <option value="SHOES">Giày Thi Đấu</option>
              <option value="ACCESSORY">Phụ Kiện & Căn Tin</option>
            </select>
            <button
              type="button"
              className="btn-action-add"
              onClick={onOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm Mới
            </button>
          </div>
        </div>

        {/* Products Grid Display */}
        <div className="products-admin-grid">
          {filteredProducts.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Chưa có sản phẩm nào trong kho.
            </p>
          ) : (
            paginatedProducts.map((p) => {
              let catLabel = 'Vợt Cầu Lông';
              if (p.category === 'SHOES') catLabel = 'Giày Thi Đấu';
              else if (p.category === 'ACCESSORY') catLabel = 'Phụ Kiện';

              return (
                <div
                  key={p.id}
                  className="p-admin-card"
                  style={{ opacity: p.active !== false ? 1 : 0.6 }}
                >
                  <div className="p-admin-thumb-wrap">
                    <img
                      src={
                        p.imageUrl ||
                        'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop'
                      }
                      alt={p.name}
                      className="p-admin-thumb"
                    />
                    {p.badge && <span className="p-admin-badge">{p.badge}</span>}
                    <span className="p-admin-cat">{catLabel}</span>
                  </div>
                  <div className="p-admin-body">
                    <span className="p-admin-brand">{p.brand || 'CHÍNH HÃNG'}</span>
                    <h4 className="p-admin-name">{p.name}</h4>
                    <div className="p-admin-specs">
                      {p.spec1 && (
                        <span>
                          <i className="fa-solid fa-check"></i> {p.spec1}
                        </span>
                      )}
                      {p.spec2 && (
                        <span>
                          <i className="fa-solid fa-shield-halved"></i> {p.spec2}
                        </span>
                      )}
                    </div>
                    <div className="p-admin-price-row">
                      <span className="p-admin-price">
                        {(p.price || 0).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="p-admin-unit">{p.priceUnit || '/ buổi'}</span>
                    </div>
                    <div className="p-admin-actions">
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-edit"
                        onClick={() => onEditProduct(p)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Sửa
                      </button>
                      <button
                        type="button"
                        className={`btn-tbl ${p.active !== false ? 'btn-tbl-view' : 'btn-tbl-success'}`}
                        onClick={() => onToggleActive(p.id)}
                      >
                        <i className="fa-solid fa-eye"></i> {p.active !== false ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-delete"
                        onClick={() => onDeleteProduct(p.id)}
                      >
                        <i className="fa-solid fa-trash"></i> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar for Products */}
        {filteredProducts.length > 0 && (
          <div className="admin-pagination-bar" style={{ marginTop: '20px', borderRadius: '8px' }}>
            <div className="pagination-info">
              Hiển thị <strong>{startIndex + 1} - {endIndex}</strong> trên <strong>{filteredProducts.length}</strong> sản phẩm
              &nbsp;&bull;&nbsp;
              <label style={{ marginLeft: '8px' }}>
                Số SP/trang:
                <select
                  className="pagination-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ marginLeft: '6px' }}
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                </select>
              </label>
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <i className="fa-solid fa-chevron-left"></i> Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-number-btn ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Tiếp <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
