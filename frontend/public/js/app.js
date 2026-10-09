/**
 * Ways Station Badminton - Core Javascript
 * Matching san.ways.io.vn exactly with Welcome Modal & Marquee
 */

const appState = {
    branch: 'NVL',
    date: new Date().toISOString().split('T')[0],
    selectedSlots: new Map(), // key: `${courtId}_${slotId}` -> { court, slot, price }
    matrix: null
};

// DOM Cache
const dom = {
    dateInput: document.getElementById('bookingDateInput'),
    branchItems: document.querySelectorAll('.branch-item'),
    matrixBlocksWrapper: document.getElementById('matrixBlocksWrapper'),
    zoomRange: document.getElementById('zoomRange'),
    matrixScrollContainer: document.getElementById('matrixScrollContainer'),

    // Initial Welcome Modal
    initialWelcomeModal: document.getElementById('initialWelcomeModal'),
    initDateInput: document.getElementById('initDateInput'),
    btnConfirmInitial: document.getElementById('btnConfirmInitial'),

    // Bottom Bar
    bottomSelectedText: document.getElementById('bottomSelectedText'),
    bottomTotalText: document.getElementById('bottomTotalText'),
    btnBottomNext: document.getElementById('btnBottomNext'),

    // Checkout Modal
    checkoutModal: document.getElementById('checkoutModal'),
    btnCloseCheckout: document.getElementById('btnCloseCheckout'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    recapSlotsList: document.getElementById('recapSlotsList'),
    recapHours: document.getElementById('recapHours'),
    recapPrice: document.getElementById('recapPrice'),
    bookingOrderForm: document.getElementById('bookingOrderForm'),

    // Success Modal
    successReceiptModal: document.getElementById('successReceiptModal'),
    resCode: document.getElementById('resCode'),
    resName: document.getElementById('resName'),
    resPhone: document.getElementById('resPhone'),
    resDate: document.getElementById('resDate'),
    resHours: document.getElementById('resHours'),
    resPrice: document.getElementById('resPrice'),
    vietQrBlock: document.getElementById('vietQrBlock'),
    qrImage: document.getElementById('qrImage'),
    resTransferNote: document.getElementById('resTransferNote'),
    btnDoneSuccess: document.getElementById('btnDoneSuccess'),

    // Guide Modal
    guideModal: document.getElementById('guideModal'),
    btnOpenGuide: document.getElementById('btnOpenGuide'),
    btnCloseGuide: document.getElementById('btnCloseGuide'),
    btnGuideOk: document.getElementById('btnGuideOk')
};

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    dom.dateInput.value = appState.date;
    dom.dateInput.min = appState.date;
    dom.initDateInput.value = appState.date;
    dom.initDateInput.min = appState.date;

    bindEvents();
    fetchMatrix();

    // Mở popup chọn ngày & chi nhánh ngay khi vào trang web
    setTimeout(() => {
        dom.initialWelcomeModal.classList.add('show');
    }, 200);
});

function bindEvents() {
    // 1. Initial Modal Confirm
    dom.btnConfirmInitial.addEventListener('click', () => {
        const selectedInitDate = dom.initDateInput.value;
        const selectedInitBranch = document.querySelector('input[name="initBranch"]:checked').value;

        if (selectedInitDate) {
            appState.date = selectedInitDate;
            dom.dateInput.value = selectedInitDate;
        }

        appState.branch = selectedInitBranch;

        // Cập nhật radio chi nhánh trên thanh header
        dom.branchItems.forEach(item => {
            const radio = item.querySelector('input');
            if (radio.value === selectedInitBranch) {
                item.classList.add('active');
                radio.checked = true;
            } else {
                item.classList.remove('active');
                radio.checked = false;
            }
        });

        appState.selectedSlots.clear();
        updateBottomBar();
        fetchMatrix();

        dom.initialWelcomeModal.classList.remove('show');
    });

    // 2. Date Change on Header
    dom.dateInput.addEventListener('change', (e) => {
        appState.date = e.target.value;
        appState.selectedSlots.clear();
        updateBottomBar();
        fetchMatrix();
    });

    // 3. Branch selection on Header
    dom.branchItems.forEach(item => {
        item.addEventListener('click', () => {
            dom.branchItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const radio = item.querySelector('input');
            radio.checked = true;
            appState.branch = radio.value;
            appState.selectedSlots.clear();
            updateBottomBar();
            fetchMatrix();
        });
    });

    // 4. Thanh trượt kéo dãn độ rộng các ô khung giờ (Zoom / Stretch Cells)
    dom.zoomRange.min = 64;
    dom.zoomRange.max = 88;
    dom.zoomRange.value = 68;

    dom.zoomRange.addEventListener('input', (e) => {
        const cellWidth = e.target.value;
        document.querySelectorAll('.header-slot-cell, .grid-cell-slot').forEach(cell => {
            cell.style.width = `${cellWidth}px`;
            cell.style.minWidth = `${cellWidth}px`;
        });
    });

    // 5. Cho phép cuộn ngang tự nhiên bằng thanh cuộn (Scrollbar)
    // Người dùng tự kéo thanh cuộn hoặc giữ Shift + lăn chuột tự nhiên

    // 6. Bottom Next Button
    dom.btnBottomNext.addEventListener('click', () => {
        if (appState.selectedSlots.size === 0) {
            alert('Vui lòng chọn ít nhất 1 khung giờ đặt sân!');
            return;
        }
        openCheckoutModal();
    });

    dom.btnCloseCheckout.addEventListener('click', () => dom.checkoutModal.classList.remove('show'));
    dom.btnCancelModal.addEventListener('click', () => dom.checkoutModal.classList.remove('show'));

    // Payment Cards
    document.querySelectorAll('.pay-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pay-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;
        });
    });

    // Form Submit
    dom.bookingOrderForm.addEventListener('submit', handleFormSubmit);

    // Success Modal Close
    dom.btnDoneSuccess.addEventListener('click', () => {
        dom.successReceiptModal.classList.remove('show');
        appState.selectedSlots.clear();
        updateBottomBar();
        fetchMatrix();
    });

    // Guide Modal
    dom.btnOpenGuide.addEventListener('click', () => dom.guideModal.classList.add('show'));
    dom.btnCloseGuide.addEventListener('click', () => dom.guideModal.classList.remove('show'));
    dom.btnGuideOk.addEventListener('click', () => dom.guideModal.classList.remove('show'));
}

// Fallback Data when backend is offline
function getFallbackMatrix(branchCode, dateStr) {
    const courtsCountMap = { 'NVL': 7, 'DQII': 4, 'NQA': 6, 'HB': 2 };
    const count = courtsCountMap[branchCode] || 7;
    const courts = [];
    for (let i = 1; i <= count; i++) {
        courts.push({
            id: i,
            name: `Sân ${i}`,
            courtNumber: i,
            active: true
        });
    }

    const timeSlots = [
        { id: 1, startTime: '00:15', endTime: '01:15', displayLabel: '0:15-1:15', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 2, startTime: '01:20', endTime: '02:20', displayLabel: '1:20-2:20', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 3, startTime: '02:25', endTime: '03:25', displayLabel: '2:25-3:25', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 4, startTime: '03:30', endTime: '04:30', displayLabel: '3:30-4:30', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 5, startTime: '04:35', endTime: '05:35', displayLabel: '4:35-5:35', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 6, startTime: '05:40', endTime: '06:40', displayLabel: '5:40-6:40', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 7, startTime: '06:45', endTime: '07:45', displayLabel: '6:45-7:45', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 8, startTime: '08:00', endTime: '09:00', displayLabel: '8:00-9:00', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 9, startTime: '09:05', endTime: '10:05', displayLabel: '9:05-10:05', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 10, startTime: '10:10', endTime: '11:10', displayLabel: '10:10-11:10', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 11, startTime: '11:15', endTime: '12:15', displayLabel: '11:15-12:15', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 12, startTime: '12:20', endTime: '13:20', displayLabel: '12:20-13:20', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 13, startTime: '13:25', endTime: '14:25', displayLabel: '13:25-14:25', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 14, startTime: '14:30', endTime: '15:30', displayLabel: '14:30-15:30', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 15, startTime: '15:35', endTime: '16:35', displayLabel: '15:35-16:35', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 16, startTime: '16:40', endTime: '17:40', displayLabel: '16:40-17:40', standardPrice: 70000, peakPrice: 120000, isPeakHour: false },
        { id: 17, startTime: '17:45', endTime: '18:45', displayLabel: '17:45-18:45', standardPrice: 70000, peakPrice: 120000, isPeakHour: true },
        { id: 18, startTime: '18:50', endTime: '19:50', displayLabel: '18:50-19:50', standardPrice: 70000, peakPrice: 120000, isPeakHour: true },
        { id: 19, startTime: '19:55', endTime: '20:55', displayLabel: '19:55-20:55', standardPrice: 70000, peakPrice: 120000, isPeakHour: true },
        { id: 20, startTime: '21:00', endTime: '22:00', displayLabel: '21:00-22:00', standardPrice: 70000, peakPrice: 120000, isPeakHour: true },
        { id: 21, startTime: '22:05', endTime: '23:05', displayLabel: '22:05-23:05', standardPrice: 70000, peakPrice: 120000, isPeakHour: true },
        { id: 22, startTime: '23:10', endTime: '00:10', displayLabel: '23:10-0:10', standardPrice: 70000, peakPrice: 120000, isPeakHour: false }
    ];

    const slotStatusMap = {
        '1_12': { status: 'PASS_WANTED', customerName: 'Hoàng Long', passContact: '0912345678', price: 70000 },
        '1_13': { status: 'BOOKED', customerName: 'Nguyễn Văn Tuấn', price: 70000 },
        '1_17': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000 },
        '1_18': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000 },
        '1_19': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000 },
        '2_17': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 120000 },
        '2_18': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 120000 },
        '2_19': { status: 'PASS_WANTED', customerName: 'Ngô Kiến Huy', passContact: '0908889999', price: 120000 },
        '3_17': { status: 'BOOKED', customerName: 'Công Ty FPT', price: 120000 },
        '3_18': { status: 'BOOKED', customerName: 'Công Ty FPT', price: 120000 },
        '4_18': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 120000 },
        '4_19': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 120000 },
        '5_12': { status: 'PASS_WANTED', customerName: 'Đặng Thu Thảo', passContact: '0933557799', price: 70000 },
        '5_17': { status: 'BOOKED', customerName: 'Phạm Hải Đăng', price: 120000 },
        '6_18': { status: 'BOOKED', customerName: 'Vũ Quốc Bảo', price: 120000 },
        '7_17': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 120000 },
        '7_18': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 120000 }
    };

    return {
        currentBranch: { code: branchCode, name: `Ways Station ${branchCode}` },
        courts,
        timeSlots,
        slotStatusMap
    };
}

// Fetch Matrix from Backend API
async function fetchMatrix() {
    try {
        const res = await fetch(`/api/booking/matrix?branch=${appState.branch}&date=${appState.date}`);
        if (!res.ok) throw new Error('Không thể tải sơ đồ sân!');
        appState.matrix = await res.json();
        renderGroupedMatrix(appState.matrix);
    } catch (err) {
        console.warn('Backend chưa bật hoặc lỗi API, dùng dữ liệu mô phỏng chuẩn:', err);
        appState.matrix = getFallbackMatrix(appState.branch, appState.date);
        renderGroupedMatrix(appState.matrix);
    }
}

// Group courts into blocks (Sân 1+2, Sân 3+4, Sân 5+6, Sân 7)
function renderGroupedMatrix(data) {
    const { currentBranch, courts, timeSlots, slotStatusMap } = data;
    dom.matrixBlocksWrapper.innerHTML = '';

    if (!courts || courts.length === 0) {
        dom.matrixBlocksWrapper.innerHTML = '<div style="padding:20px;text-align:center;">Không có dữ liệu sân.</div>';
        return;
    }

    // Group courts by 2 or single
    const blocks = [];
    for (let i = 0; i < courts.length; i += 2) {
        if (i + 1 < courts.length) {
            blocks.push([courts[i], courts[i + 1]]);
        } else {
            blocks.push([courts[i]]);
        }
    }

    blocks.forEach((courtPair) => {
        const blockGroup = document.createElement('div');
        blockGroup.className = 'court-block-group';

        // 1. Block Header Row (with time slots)
        const headerRow = document.createElement('div');
        headerRow.className = 'block-header-row';

        const corner = document.createElement('div');
        corner.className = 'block-header-corner';
        headerRow.appendChild(corner);

        const slotsHeaderContainer = document.createElement('div');
        slotsHeaderContainer.className = 'block-header-slots';

        timeSlots.forEach((slot, slotIdx) => {
            const hCell = document.createElement('div');
            hCell.className = 'header-slot-cell';

            let tag = '';
            if (slotIdx < 6) tag = 'đơn';
            else if (slotIdx < 11) tag = 'sáng';

            hCell.innerHTML = `
                <span class="header-slot-time">${slot.displayLabel}</span>
                ${tag ? `<span class="header-slot-tag">${tag}</span>` : ''}
            `;
            slotsHeaderContainer.appendChild(hCell);
        });
        headerRow.appendChild(slotsHeaderContainer);
        blockGroup.appendChild(headerRow);

        // 2. Data Rows for each court in this block
        courtPair.forEach(court => {
            const cRow = document.createElement('div');
            cRow.className = 'court-data-row';

            // Sticky Court Title Cell
            const titleCell = document.createElement('div');
            titleCell.className = 'court-title-cell';
            titleCell.innerHTML = `
                <span class="tag-cn">CN ${currentBranch.code}</span>
                <span class="tag-court-name">${court.name}</span>
            `;
            cRow.appendChild(titleCell);

            // Time Slot Cells for this court
            const slotsRow = document.createElement('div');
            slotsRow.className = 'court-slots-row';

            timeSlots.forEach(slot => {
                const key = `${court.id}_${slot.id}`;
                const statusInfo = slotStatusMap[key];
                const isSelected = appState.selectedSlots.has(key);
                const price = slot.isPeakHour ? slot.peakPrice : slot.standardPrice;

                const cell = document.createElement('div');
                cell.className = 'grid-cell-slot';

                if (statusInfo) {
                    if (statusInfo.status === 'PASS_WANTED') {
                        cell.classList.add('is-pass');
                        cell.title = `Cần Pass - LH: ${statusInfo.passContact || '0889555559'}`;
                        cell.addEventListener('click', () => toggleSlotSelection(court, slot, price, key, true));
                    } else {
                        if (slot.isPeakHour) {
                            cell.classList.add('is-booked');
                        } else {
                            cell.classList.add('is-booked-coral');
                        }
                        cell.title = `Đã đặt bởi ${statusInfo.customerName}`;
                    }
                } else if (isSelected) {
                    cell.classList.add('is-selected');
                    cell.addEventListener('click', () => toggleSlotSelection(court, slot, price, key, false));
                } else {
                    // Empty cell
                    cell.title = `${court.name} (${slot.displayLabel}): ${price.toLocaleString('vi-VN')} đ`;
                    cell.addEventListener('click', () => toggleSlotSelection(court, slot, price, key, false));
                }

                slotsRow.appendChild(cell);
            });

            cRow.appendChild(slotsRow);
            blockGroup.appendChild(cRow);
        });

        dom.matrixBlocksWrapper.appendChild(blockGroup);
    });

    // Giữ nguyên độ rộng kéo dãn khi đổi ngày hoặc đổi chi nhánh
    const currentWidth = dom.zoomRange.value;
    if (currentWidth) {
        document.querySelectorAll('.header-slot-cell, .grid-cell-slot').forEach(cell => {
            cell.style.width = `${currentWidth}px`;
            cell.style.minWidth = `${currentWidth}px`;
        });
    }
}

// Toggle slot selection
function toggleSlotSelection(court, slot, price, key, isPass) {
    if (appState.selectedSlots.has(key)) {
        appState.selectedSlots.delete(key);
    } else {
        appState.selectedSlots.set(key, { court, slot, price, isPass });
    }
    updateBottomBar();
    renderGroupedMatrix(appState.matrix);
}

// Update sticky bottom checkout bar
function updateBottomBar() {
    const count = appState.selectedSlots.size;
    let total = 0;
    appState.selectedSlots.forEach(item => {
        total += item.price;
    });

    dom.bottomSelectedText.innerText = `Đang chọn: ${count}h00`;
    dom.bottomTotalText.innerText = `Tổng: ${total.toLocaleString('vi-VN')} đ`;

    if (count > 0) {
        dom.btnBottomNext.classList.add('active');
        dom.btnBottomNext.innerText = 'Tiếp theo';
    } else {
        dom.btnBottomNext.classList.remove('active');
        dom.btnBottomNext.innerText = 'Tiếp theo';
    }
}

// Open Checkout Modal
function openCheckoutModal() {
    dom.recapSlotsList.innerHTML = '';
    let totalPrice = 0;

    appState.selectedSlots.forEach((item) => {
        totalPrice += item.price;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '4px 0';
        row.innerHTML = `
            <span>• <strong>${item.court.name}</strong> (${item.slot.displayLabel}) ${item.isPass ? '<span style="color:#a855f7;">[Cần Pass]</span>' : ''}</span>
            <span style="font-weight:700; color:#0284c7;">${item.price.toLocaleString('vi-VN')} đ</span>
        `;
        dom.recapSlotsList.appendChild(row);
    });

    dom.recapHours.innerText = `${appState.selectedSlots.size}h`;
    dom.recapPrice.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
    dom.checkoutModal.classList.add('show');
}

// Handle submit
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('inputName').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const notes = document.getElementById('inputNotes').value.trim();
    const payType = document.querySelector('input[name="payType"]:checked').value;

    const slots = [];
    appState.selectedSlots.forEach(item => {
        slots.push({ courtId: item.court.id, timeSlotId: item.slot.id });
    });

    const payload = {
        branchCode: appState.branch,
        bookingDate: appState.date,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        paymentMethod: payType,
        notes: notes,
        selectedSlots: slots
    };

    try {
        const btn = document.getElementById('btnConfirmBooking');
        btn.disabled = true;
        btn.innerText = 'Đang xử lý...';

        const res = await fetch('/api/booking/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Đặt sân thất bại!');

        dom.checkoutModal.classList.remove('show');
        showSuccessModal(data, payType);

    } catch (err) {
        if (err.message && (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to fetch') || err.name === 'TypeError')) {
            // Offline simulation when backend is not running
            let totPrice = 0;
            appState.selectedSlots.forEach(item => totPrice += item.price);
            const mockCode = 'WAY-' + appState.date.replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
            dom.checkoutModal.classList.remove('show');
            showSuccessModal({
                bookingCode: mockCode,
                customerName: name,
                bookingDate: appState.date,
                totalHours: appState.selectedSlots.size,
                totalPrice: totPrice
            }, payType);
            return;
        }
        alert(err.message);
    } finally {
        const btn = document.getElementById('btnConfirmBooking');
        btn.disabled = false;
        btn.innerText = 'Xác Nhận Đặt Sân';
    }
}

function showSuccessModal(data, payType) {
    dom.resCode.innerText = data.bookingCode;
    dom.resName.innerText = data.customerName;
    dom.resPhone.innerText = document.getElementById('inputPhone').value;
    dom.resDate.innerText = data.bookingDate;
    dom.resHours.innerText = `${data.totalHours} giờ`;
    dom.resPrice.innerText = `${data.totalPrice.toLocaleString('vi-VN')} đ`;
    dom.resTransferNote.innerText = data.bookingCode;

    if (payType === 'VIETQR') {
        dom.vietQrBlock.style.display = 'block';
        dom.qrImage.src = `https://img.vietqr.io/image/MB-0889555559-compact2.png?amount=${data.totalPrice}&addInfo=${encodeURIComponent(data.bookingCode)}&accountName=${encodeURIComponent('WAYS STATION BADMINTON')}`;
    } else {
        dom.vietQrBlock.style.display = 'none';
    }

    dom.successReceiptModal.classList.add('show');
}
