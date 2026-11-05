import React, { useState } from 'react';
import { PaginationBar } from './Pagination';
import { usePagination } from './usePagination';
import AdminTrashModal from './AdminTrashModal';

/**
 * Tab Quản Lý Kho Dụng Cụ, Vợt & Giày Cho Thuê (Admin)
 * Giao diện hiển thị bảng dữ liệu (Table) chuẩn giống AdminArticlesTab
 */
export default function AdminProductsTab({
  products = [],
  trashedProducts = [],
  onOpenAddModal,
  onEditProduct,
  onToggleActive,
  onDeleteProduct,
  onRestoreProduct,
  onPermanentDeleteProduct,
  onClearProductTrash,
  onRefresh,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const getCatCode = (p) => {
    if (!p) return '';
    if (typeof p.category === 'object') return p.category?.code || '';
    return p.category || p.categoryCode || '';
  };

  const getCatLabel = (p) => {
    const catCode = getCatCode(p).toUpperCase();
    if (catCode === 'RACKET' || catCode === 'RACQUET') return 'Vợt Cầu Lông';
    if (catCode === 'SHOES') return 'Giày Thi Đấu';
    if (catCode === 'REFRESHMENTS' || catCode === 'DRINKS') return 'Nước & Khăn Lạnh';
    if (catCode === 'SERVICES') return 'Dịch Vụ Căng Cước';
    if (catCode === 'ACCESSORY') return 'Phụ Kiện Thể Thao';
    return p.categoryName || p.categoryLabel || 'Dụng Cụ';
  };

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.spec1 && p.spec1.toLowerCase().includes(q)) ||
      (p.spec2 && p.spec2.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));

    let matchCat = true;
    if (selectedCat) {
      const catCode = getCatCode(p).toUpperCase();
      if (selectedCat === 'RACKET') matchCat = catCode === 'RACKET' || catCode === 'RACQUET';
      else if (selectedCat === 'REFRESHMENTS') matchCat = catCode === 'REFRESHMENTS' || catCode === 'DRINKS';
      else matchCat = catCode === selectedCat;
    }

    return matchSearch && matchCat;
  });

  const pg = usePagination(
    filteredProducts,
    10,
    `${filteredProducts.length}-${selectedCat}-${searchTerm}`
  );

  return (
    <section id="productsTab" className="tab-pane">
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> Quản Lý Kho Dụng Cụ, Vợt & Giày Cho Thuê
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Thay đổi hình ảnh, giá thuê, thông số kỹ thuật và trạng thái hiển thị trực tiếp lên Trang Chủ và Bước Đặt Sân
            </p>
          </div>

          <div className="filter-tools-row">
            <div className="input-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm tên dụng cụ, thương hiệu, thông số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="">Tất cả danh mục ({products.length})</option>
              <option value="RACKET">Vợt Cầu Lông</option>
              <option value="SHOES">Giày Thi Đấu</option>
              <option value="REFRESHMENTS">Nước Uống & Khăn Lạnh</option>
              <option value="SERVICES">Dịch Vụ Căng Cước & Tiện Ích</option>
              <option value="ACCESSORY">Phụ Kiện Thể Thao</option>
            </select>

            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={onOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm Mới
            </button>
            <button
              type="button"
              className="btn-action-add"
              onClick={onRefresh}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
            <button
              type="button"
              className="btn-tbl btn-tbl-delete"
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Thùng rác: Xem, khôi phục hoặc xóa vĩnh viễn sản phẩm"
              onClick={() => setIsTrashOpen(true)}
            >
              <i className="fa-solid fa-trash-can"></i> Thùng rác ({trashedProducts.length})
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Hình Ảnh</th>
                <th>Tên Dụng Cụ / Sản Phẩm</th>
                <th>Danh Mục</th>
                <th>Giá Thuê / Bán</th>
                <th>Trạng Thái</th>
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách dụng cụ...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Chưa có sản phẩm nào trong kho. Bấm <strong>"+ Thêm Sản Phẩm Mới"</strong> để thêm!
                  </td>
                </tr>
              ) : (
                pg.pageItems.map((item) => {
                  const isActive = item.active !== false;
                  const catLabel = getCatLabel(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>#{item.id}</strong>
                      </td>
                      <td>
                        <img
                          src={
                            item.imageUrl ||
                            'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop'
                          }
                          alt={item.name}
                          style={{
                            width: '68px',
                            height: '46px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1'
                          }}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                      </td>
                      <td style={{ maxWidth: '340px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '4px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>
                            {item.name}
                          </strong>
                          {item.badge && (
                            <span
                              style={{
                                background: '#ffedd5',
                                color: '#c2410c',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10.5px',
                                fontWeight: 700
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                          }}
                        >
                          {item.brand && (
                            <span
                              style={{
                                fontWeight: 700,
                                color: '#0284c7',
                                textTransform: 'uppercase'
                              }}
                            >
                              {item.brand}
                            </span>
                          )}
                          {item.spec1 && (
                            <span>
                              <i className="fa-solid fa-check" style={{ fontSize: '10px' }}></i> {item.spec1}
                            </span>
                          )}
                          {item.spec2 && (
                            <span>
                              <i className="fa-solid fa-shield-halved" style={{ fontSize: '10px' }}></i> {item.spec2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {catLabel}
                        </span>
                      </td>
                      <td>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>
                            {(item.price || 0).toLocaleString('vi-VN')} đ
                          </strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '4px' }}>
                            {item.priceUnit || '/ ca chơi'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge-status badge-active">
                            <i className="fa-solid fa-eye"></i> Công Khai
                          </span>
                        ) : (
                          <span
                            className="badge-status badge-danger"
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}
                          >
                            <i className="fa-solid fa-eye-slash"></i> Đang Ẩn
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            title="Chỉnh sửa sản phẩm"
                            onClick={() => onEditProduct && onEditProduct(item)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-tbl"
                            style={{
                              background: isActive ? '#fef3c7' : '#dcfce7',
                              color: isActive ? '#b45309' : '#15803d',
                              border: isActive ? '1px solid #fde68a' : '1px solid #bbf7d0'
                            }}
                            title={
                              isActive
                                ? 'Ẩn khỏi trang chủ & đặt sân'
                                : 'Hiển thị công khai lên hệ thống'
                            }
                            onClick={() => onToggleActive && onToggleActive(item.id)}
                          >
                            <i className={isActive ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                            {isActive ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-delete"
                            title="Chuyển vào thùng rác"
                            onClick={() => onDeleteProduct && onDeleteProduct(item.id)}
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
          <PaginationBar pagination={pg} unit="dụng cụ & sản phẩm" />
        </div>
      </div>

      {isTrashOpen && (
        <AdminTrashModal
          title="Thùng rác Dụng Cụ, Vợt & Giày"
          hint="Dụng cụ đã xóa tạm được lưu trữ tại đây. Bạn có thể khôi phục lại kho hoặc xóa vĩnh viễn."
          items={trashedProducts}
          onRestore={(item) => onRestoreProduct && onRestoreProduct(item.id)}
          onDestroy={(item) => onPermanentDeleteProduct && onPermanentDeleteProduct(item.id)}
          onClearAll={trashedProducts.length > 0 ? onClearProductTrash : null}
          onClose={() => setIsTrashOpen(false)}
        />
      )}
    </section>
  );
}
