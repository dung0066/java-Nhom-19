import React, { useState, useEffect } from 'react';
import {
  fetchCourts,
  createBranch,
  updateBranch,
  deleteBranch,
  createCourt,
  updateCourt,
  toggleCourtActive,
  deleteCourt
} from '../../services/api';

export default function AdminBranchesTab({
  branches = [],
  courts = [],
  onRefresh
}) {
  const [selectedBranchCode, setSelectedBranchCode] = useState(
    branches[0]?.code || 'NVL'
  );
  const [localCourts, setLocalCourts] = useState(courts);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);

  // Branch Modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ code: '', name: '', address: '', phone: '', totalCourts: 7 });

  // Court Modal state
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [courtForm, setCourtForm] = useState({ branchId: '', name: '', courtNumber: 1, courtGroup: 'Sân 1+2', active: true });

  // Load courts for selected branch
  const loadBranchCourts = async (code) => {
    setIsLoadingCourts(true);
    try {
      const data = await fetchCourts(code);
      if (data && data.length > 0) {
        setLocalCourts(data);
      } else {
        // Fallback to filtering props
        setLocalCourts(courts.filter(c => !c.branch || c.branch.code === code));
      }
    } catch {
      setLocalCourts(courts.filter(c => !c.branch || c.branch.code === code));
    } finally {
      setIsLoadingCourts(false);
    }
  };

  useEffect(() => {
    if (selectedBranchCode) {
      loadBranchCourts(selectedBranchCode);
    }
  }, [selectedBranchCode]);

  useEffect(() => {
    if (branches.length > 0 && !branches.some(b => b.code === selectedBranchCode)) {
      setSelectedBranchCode(branches[0].code);
    }
  }, [branches]);

  // BRANCH HANDLERS
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({ code: '', name: '', address: '', phone: '0889555559', totalCourts: 6 });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b) => {
    setEditingBranch(b);
    setBranchForm({
      code: b.code || '',
      name: b.name || '',
      address: b.address || '',
      phone: b.phone || '',
      totalCourts: b.totalCourts || 6
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, branchForm);
        alert('Cập nhật thông tin chi nhánh thành công!');
      } else {
        await createBranch(branchForm);
        alert('Tạo chi nhánh mới thành công!');
      }
      setIsBranchModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu chi nhánh!');
    }
  };

  const handleDeleteBranch = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${name}" cùng toàn bộ sân đấu thuộc chi nhánh này?`)) return;
    try {
      await deleteBranch(id);
      alert('Đã xóa chi nhánh thành công!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa chi nhánh!');
    }
  };

  // COURT HANDLERS
  const handleOpenAddCourt = () => {
    const currentBranch = branches.find(b => b.code === selectedBranchCode) || branches[0];
    setEditingCourt(null);
    setCourtForm({
      branchId: currentBranch ? currentBranch.id : 1,
      name: `Sân ${localCourts.length + 1}`,
      courtNumber: localCourts.length + 1,
      courtGroup: 'Cụm Tiêu Chuẩn',
      active: true
    });
    setIsCourtModalOpen(true);
  };

  const handleOpenEditCourt = (c) => {
    setEditingCourt(c);
    setCourtForm({
      branchId: c.branch?.id || (branches.find(b => b.code === selectedBranchCode)?.id || 1),
      name: c.name || '',
      courtNumber: c.courtNumber || c.courtOrder || 1,
      courtGroup: c.courtGroup || 'Sân 1+2',
      active: c.active !== undefined ? c.active : true
    });
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = async (e) => {
    e.preventDefault();
    try {
      if (editingCourt) {
        await updateCourt(editingCourt.id, courtForm);
        alert('Cập nhật sân đấu thành công!');
      } else {
        await createCourt(courtForm);
        alert('Thêm sân đấu mới thành công!');
      }
      setIsCourtModalOpen(false);
      loadBranchCourts(selectedBranchCode);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu sân đấu!');
    }
  };

  const handleToggleCourt = async (courtId) => {
    try {
      await toggleCourtActive(courtId);
      loadBranchCourts(selectedBranchCode);
    } catch {
      setLocalCourts(prev => prev.map(c => c.id === courtId ? { ...c, active: !c.active } : c));
    }
  };

  const handleDeleteCourt = async (courtId, name) => {
    if (!window.confirm(`Xác nhận xóa sân "${name}" khỏi cơ sở này?`)) return;
    try {
      await deleteCourt(courtId);
      alert('Đã xóa sân thành công!');
      loadBranchCourts(selectedBranchCode);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa sân!');
    }
  };

  return (
    <section id="branchesTab" className="tab-pane" style={{ display: 'block' }}>
      {/* 3.1: QUẢN LÝ CHI NHÁNH */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-building"></i> Danh Sách Chi Nhánh Hệ Thống
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm mới, sửa địa chỉ/hotline hoặc xóa chi nhánh (kết nối trực tiếp Java API <code>/api/branches</code>)
            </p>
          </div>
          <button
            type="button"
            className="btn-action-add"
            onClick={handleOpenAddBranch}
          >
            <i className="fa-solid fa-plus"></i> Thêm Chi Nhánh Mới
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã CN</th>
                <th>Tên Chi Nhánh</th>
                <th>Địa Chỉ Cơ Sở</th>
                <th>Hotline</th>
                <th>Số Sân</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Chưa có chi nhánh nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id || b.code}>
                    <td>
                      <strong style={{ color: '#0284c7' }}>{b.code}</strong>
                    </td>
                    <td>
                      <strong>{b.name}</strong>
                    </td>
                    <td>{b.address}</td>
                    <td>{b.phone || '0889555559'}</td>
                    <td>
                      <strong>{b.totalCourts || (b.courts ? b.courts.length : 7)} Sân</strong>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          onClick={() => handleOpenEditBranch(b)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-delete"
                          onClick={() => handleDeleteBranch(b.id, b.name)}
                        >
                          <i className="fa-solid fa-trash"></i> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3.2: QUẢN LÝ SÂN ĐẤU THEO CHI NHÁNH */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3>
              <i className="fa-solid fa-table-cells"></i> Quản Lý Danh Sách Sân Đấu Từng Cơ Sở
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thêm sân mới, chỉnh sửa cụm sân, bật/tắt bảo trì (kết nối trực tiếp Java API <code>/api/courts</code>)
            </p>
          </div>
          <div className="filter-tools-row">
            <select
              className="select-filter"
              value={selectedBranchCode}
              onChange={(e) => setSelectedBranchCode(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={handleOpenAddCourt}
            >
              <i className="fa-solid fa-plus"></i> Thêm Sân Mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {isLoadingCourts ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách sân...
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Sân</th>
                  <th>Tên Sân</th>
                  <th>Số Thứ Tự</th>
                  <th>Cụm Sân (Group)</th>
                  <th>Chi Nhánh</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {localCourts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      Không có sân nào trong chi nhánh này.
                    </td>
                  </tr>
                ) : (
                  localCourts.map((c) => {
                    const isActive = c.active !== false;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>#{c.id}</strong>
                        </td>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>{c.courtNumber || c.courtOrder || c.id}</td>
                        <td>
                          <span className="badge-status badge-active" style={{ background: '#f1f5f9', color: '#334155' }}>
                            {c.courtGroup || 'Sân Tiêu Chuẩn'}
                          </span>
                        </td>
                        <td>
                          <strong>{selectedBranchCode}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleCourt(c.id)}
                            style={{
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: isActive ? '#dcfce7' : '#fee2e2',
                              color: isActive ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {isActive ? '● Đang Hoạt Động' : '■ Tạm Dừng / Bảo Trì'}
                          </button>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-edit"
                              onClick={() => handleOpenEditCourt(c)}
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Sửa
                            </button>
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-delete"
                              onClick={() => handleDeleteCourt(c.id, c.name)}
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
          )}
        </div>
      </div>

      {/* MODAL CHI NHÁNH */}
      {isBranchModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingBranch ? 'Cập Nhật Thông Tin Chi Nhánh' : 'Thêm Chi Nhánh Cơ Sở Mới'}
              </h4>
              <button type="button" onClick={() => setIsBranchModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
            </div>
            <form onSubmit={handleSaveBranch} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mã CN (Code)</label>
                  <input type="text" required placeholder="VD: Q7" value={branchForm.code} onChange={e => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tên Cơ Sở</label>
                  <input type="text" required placeholder="VD: Ways Station Q7" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Địa Chỉ Chi Tiết</label>
                <input type="text" required placeholder="Số nhà, Tên đường, Quận, TP.HCM" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Hotline</label>
                  <input type="tel" placeholder="0889 555 559" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Số Lượng Sân</label>
                  <input type="number" min="1" max="50" value={branchForm.totalCourts} onChange={e => setBranchForm({ ...branchForm, totalCourts: Number(e.target.value) })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsBranchModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Hủy Bỏ</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>Lưu Chi Nhánh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SÂN ĐẤU */}
      {isCourtModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                {editingCourt ? 'Cập Nhật Sân Đấu' : 'Thêm Sân Đấu Mới'}
              </h4>
              <button type="button" onClick={() => setIsCourtModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
            </div>
            <form onSubmit={handleSaveCourt} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Thuộc Chi Nhánh</label>
                <select value={courtForm.branchId} onChange={e => setCourtForm({ ...courtForm, branchId: Number(e.target.value) })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tên Sân</label>
                  <input type="text" required placeholder="VD: Sân 8 (VIP)" value={courtForm.name} onChange={e => setCourtForm({ ...courtForm, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Số Thứ Tự</label>
                  <input type="number" min="1" max="100" value={courtForm.courtNumber} onChange={e => setCourtForm({ ...courtForm, courtNumber: Number(e.target.value) })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Cụm Sân (Group)</label>
                <input type="text" placeholder="VD: Sân 1+2 hoặc Sân Trung Tâm" value={courtForm.courtGroup} onChange={e => setCourtForm({ ...courtForm, courtGroup: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  <input type="checkbox" checked={courtForm.active} onChange={e => setCourtForm({ ...courtForm, active: e.target.checked })} />
                  <span>Kích hoạt sân sẵn sàng nhận đặt trực tuyến</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsCourtModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Hủy Bỏ</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>Lưu Sân Đấu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
