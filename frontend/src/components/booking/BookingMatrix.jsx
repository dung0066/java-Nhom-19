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
  onClaimPassSlot
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
      const rows = matrixContainerRef.current.querySelectorAll('.court-row');
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { autoAlpha: 0.2, y: 10 },
          { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.35, ease: 'power2.out' }
        );
      }
    }
  }, [courts]);

  const handleCellClick = (e, court, slot, status, isSelected) => {
    // If slot is booked, cannot select
    if (status === 'BOOKED') {
      gsap.to(e.currentTarget, {
        x: [-4, 4, -4, 4, 0],
        duration: 0.25,
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
      { scale: 1, duration: 0.25, ease: 'back.out(2.5)' }
    );

    onToggleSlot(court, slot);
  };

  return (
    <main className="matrix-main-wrapper" ref={matrixContainerRef}>
      <div className="matrix-scroll-container" id="matrixScrollContainer">
        <div className="matrix-blocks-wrapper" id="matrixBlocksWrapper">
          {blocks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải sơ đồ sân...
            </div>
          ) : (
            blocks.map((courtPair, blockIdx) => (
              <div key={blockIdx} className="court-block-group">
                {/* 1. Header row with time slots */}
                <div className="block-header-row">
                  <div className="block-header-corner"></div>
                  <div className="block-header-slots">
                    {timeSlots.map((slot, slotIdx) => {
                      let tag = '';
                      if (slotIdx < 6) tag = 'đơn';
                      else if (slotIdx < 11) tag = 'sáng';

                      return (
                        <div
                          key={slot.id}
                          className="header-slot-cell"
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          <span className="header-slot-time">{slot.displayLabel}</span>
                          {tag && <span className="header-slot-tag">{tag}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Court Data Rows */}
                {courtPair.map((court) => (
                  <div key={court.id} className="court-row">
                    <div className="grid-cell-court-name">
                      <span>{court.name.toUpperCase()}</span>
                    </div>

                    <div className="court-slots-row">
                      {timeSlots.map((slot) => {
                        const slotKey = `${court.id}_${slot.id}`;
                        const baseStatus = slotStatusMap[slotKey] || 'AVAILABLE';
                        const isSelected = selectedSlots.some(
                          (s) => s.court.id === court.id && s.slot.id === slot.id
                        );

                        let cellClass = 'status-available';
                        let cellContent = `${Math.round(slot.price / 1000)}k`;

                        if (baseStatus === 'BOOKED') {
                          cellClass = 'status-booked';
                          cellContent = 'H';
                        } else if (baseStatus === 'PASS_WANTED') {
                          cellClass = 'status-pass-wanted';
                          cellContent = 'Pass';
                        }

                        if (isSelected) {
                          cellClass = 'status-selected';
                          cellContent = <i className="fa-solid fa-check"></i>;
                        }

                        return (
                          <div
                            key={slot.id}
                            className={`grid-cell-slot ${cellClass}`}
                            style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                            onClick={(e) =>
                              handleCellClick(e, court, slot, baseStatus, isSelected)
                            }
                            title={`${court.name} - ${slot.displayLabel} (${(slot.price || 0).toLocaleString('vi-VN')} đ)`}
                          >
                            <span>{cellContent}</span>
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
          min="64"
          max="88"
          value={cellWidth}
          onChange={(e) => setCellWidth(Number(e.target.value))}
          className="slider-blue"
          title="Kéo dãn độ rộng ô"
        />
      </div>
    </main>
  );
}
