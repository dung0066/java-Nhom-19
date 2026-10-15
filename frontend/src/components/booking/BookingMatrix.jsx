import React, { useRef } from 'react';
import gsap from 'gsap';

export default function BookingMatrix({
  courts,
  timeSlots,
  slotStatusMap,
  selectedSlots,
  onToggleSlot,
  cellWidth,
  setCellWidth,
  onClaimPassSlot,
  branch = 'NVL'
}) {
  const matrixContainerRef = useRef(null);

  // Group courts into blocks of 2 (or 1)
  const blocks = [];
  if (courts && courts.length > 0) {
    for (let i = 0; i < courts.length; i += 2) {
      if (i + 1 < courts.length) {
        blocks.push([courts[i], courts[i + 1]]);
      } else {
        blocks.push([courts[i]]);
      }
    }
  }

  // GSAP: Stagger entrance for court rows
  React.useEffect(() => {
    if (matrixContainerRef.current) {
      const rows = matrixContainerRef.current.querySelectorAll('.court-data-row');
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { autoAlpha: 0.2, y: 8 },
          { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out' }
        );
      }
    }
  }, [courts, branch]);

  // Staggered minutes for each cluster (:15 for pair 1, :25 for pair 2, :35 for pair 3, :45 for pair 4)
  const formatSlotLabelForCluster = (slot, clusterIdx) => {
    const minuteOffsets = [15, 25, 35, 45];
    const m = minuteOffsets[clusterIdx % minuteOffsets.length];
    const mStr = String(m).padStart(2, '0');

    if (slot.startTime && slot.endTime) {
      const sH = parseInt(slot.startTime.split(':')[0], 10);
      const eH = parseInt(slot.endTime.split(':')[0], 10);
      return `${sH}:${mStr}-${eH}:${mStr}`;
    }
    return slot.displayLabel || '';
  };

  const getSlotPeriodTag = (slotIdx) => {
    if (slotIdx < 5) return 'đêm';
    if (slotIdx < 11) return 'sáng';
    if (slotIdx < 13) return 'trưa';
    if (slotIdx < 16) return 'chiều';
    if (slotIdx < 21) return 'tối';
    return 'đêm';
  };

  const handleCellClick = (e, court, slot, status, isSelected) => {
    // If slot is booked, cannot select
    if (status === 'BOOKED') {
      gsap.to(e.currentTarget, {
        x: [-3, 3, -3, 3, 0],
        duration: 0.22,
        ease: 'power2.inOut'
      });
      return;
    }

    // If slot is pass wanted
    if (status === 'PASS_WANTED') {
      if (onClaimPassSlot) {
        onClaimPassSlot(court, slot);
      }
      return;
    }

    // GSAP Spring click animation
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.88 },
      { scale: 1, duration: 0.22, ease: 'back.out(2.2)' }
    );

    onToggleSlot(court, slot);
  };

  return (
    <main className="matrix-main-wrapper" ref={matrixContainerRef}>
      <div className="matrix-scroll-container" id="matrixScrollContainer">
        <div className="matrix-blocks-wrapper" id="matrixBlocksWrapper">
          {blocks.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang tải sơ đồ sân...
            </div>
          ) : (
            blocks.map((courtPair, blockIdx) => (
              <div key={blockIdx} className="court-block-group">
                {/* 1. Header row with time slots for this specific cluster */}
                <div className="block-header-row">
                  <div className="block-header-corner"></div>
                  <div className="block-header-slots">
                    {timeSlots.map((slot, slotIdx) => {
                      const displayTime = formatSlotLabelForCluster(slot, blockIdx);
                      const periodTag = getSlotPeriodTag(slotIdx);

                      return (
                        <div
                          key={slot.id}
                          className="header-slot-cell"
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          <span className="header-slot-time">{displayTime}</span>
                          <span className="header-slot-tag">{periodTag}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Court Data Rows (Sân 1, Sân 2...) */}
                {courtPair.map((court) => (
                  <div key={court.id} className="court-data-row">
                    {/* Left Court Title: CN ${branch} + Court Name */}
                    <div className="court-title-cell">
                      <div className="court-title-cn-col">
                        <span className="cn-text">CN</span>
                        <span className="branch-text">{branch}</span>
                      </div>
                      <div className="court-title-name-col">
                        <span>{court.name}</span>
                      </div>
                    </div>

                    {/* Slots for this court */}
                    <div className="court-slots-row">
                      {timeSlots.map((slot, slotIdx) => {
                        const slotKey = `${court.id}_${slot.id}`;
                        const baseStatus = slotStatusMap[slotKey] || 'AVAILABLE';
                        const isSelected = selectedSlots.some(
                          (s) => s.court.id === court.id && s.slot.id === slot.id
                        );

                        let cellClass = 'is-available';
                        if (baseStatus === 'BOOKED') {
                          cellClass = 'is-booked';
                        } else if (baseStatus === 'PASS_WANTED') {
                          cellClass = 'is-pass';
                        }

                        if (isSelected) {
                          cellClass = 'is-selected';
                        }

                        const displayTime = formatSlotLabelForCluster(slot, blockIdx);
                        const priceStr = (slot.price || 70000).toLocaleString('vi-VN');

                        return (
                          <div
                            key={slot.id}
                            className={`grid-cell-slot ${cellClass}`}
                            style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                            onClick={(e) =>
                              handleCellClick(e, court, slot, baseStatus, isSelected)
                            }
                            title={`${court.name} - ${displayTime} (${priceStr} đ)`}
                          >
                            {/* Empty clean colored tile - 100% pixel matching reference */}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Zoom Slider */}
      <div className="zoom-floating-pill">
        <input
          type="range"
          min="60"
          max="84"
          value={cellWidth}
          onChange={(e) => setCellWidth(Number(e.target.value))}
          className="slider-blue"
          title="Kéo dãn độ rộng ô"
        />
      </div>
    </main>
  );
}
