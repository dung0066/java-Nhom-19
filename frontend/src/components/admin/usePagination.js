import { useState } from 'react';

/**
 * Phân trang phía giao diện cho danh sách admin.
 * resetKey thay đổi (ví dụ số kết quả sau khi lọc) thì tự quay về trang 1.
 */
export function usePagination(items, initialSize = 10, resetKey = '') {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const [prevKey, setPrevKey] = useState(resetKey);

  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setPage(1);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    page: currentPage,
    setPage,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size);
      setPage(1);
    },
    total,
    totalPages,
    startIndex,
    endIndex,
    pageItems: items.slice(startIndex, endIndex)
  };
}
