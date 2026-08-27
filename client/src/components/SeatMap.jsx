import React, { useState } from 'react';
import { Zap, Sun, User, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SeatMap = ({
  seats = [],
  selectedSeat = null,
  onSelectSeat,
  roomName = 'Study Room',
  readOnly = false,
  onSeatAction = null, // for admin
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Group seats by row (e.g. 'A', 'B', 'C', 'D'...)
  const rowsMap = seats.reduce((acc, seat) => {
    const r = seat.row || (seat.seatId ? seat.seatId.charAt(0) : 'A');
    if (!acc[r]) acc[r] = [];
    acc[r].push(seat);
    return acc;
  }, {});

  // Sort rows alphabetically and columns numerically
  const sortedRows = Object.keys(rowsMap).sort();
  sortedRows.forEach((r) => {
    rowsMap[r].sort((a, b) => (Number(a.column) || 0) - (Number(b.column) || 0));
  });

  const getSeatClass = (seat) => {
    const isSelected = selectedSeat && (selectedSeat._id === seat._id || selectedSeat.seatId === seat.seatId);
    if (isSelected) return 'seat-btn seat-selected';

    const status = seat.currentStatus || seat.status || 'available';
    switch (status) {
      case 'available':
        return 'seat-btn seat-available';
      case 'occupied':
        return 'seat-btn seat-occupied';
      case 'reserved':
        return 'seat-btn seat-reserved';
      case 'blocked':
        return 'seat-btn seat-blocked';
      default:
        return 'seat-btn seat-available';
    }
  };

  const handleSeatClick = (seat) => {
    if (onSeatAction) {
      // Admin handler
      onSeatAction(seat);
      return;
    }

    if (readOnly) return;

    const status = seat.currentStatus || seat.status || 'available';
    if (status !== 'available') {
      return; // Cannot select occupied/reserved/blocked seats
    }

    if (onSelectSeat) {
      if (selectedSeat && (selectedSeat._id === seat._id || selectedSeat.seatId === seat.seatId)) {
        onSelectSeat(null); // toggle off
      } else {
        onSelectSeat(seat);
      }
    }
  };

  return (
    <div className="seat-map-container">
      {/* Front of Room / Screen Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="screen-indicator"></div>
        <div className="screen-label">
          <span>FRONT OF STUDY ROOM · WHITEBOARDS & WINDOW VIEW</span>
        </div>
      </div>

      {/* Seating Grid */}
      <div className="seating-grid">
        {sortedRows.map((rowKey) => (
          <div key={rowKey} className="seating-row">
            <span className="row-label">{rowKey}</span>

            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              {rowsMap[rowKey].map((seat) => {
                const status = seat.currentStatus || seat.status || 'available';
                const isSelected = selectedSeat && (selectedSeat._id === seat._id || selectedSeat.seatId === seat.seatId);

                return (
                  <button
                    key={seat._id || seat.seatId}
                    type="button"
                    className={getSeatClass(seat)}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={!onSeatAction && status !== 'available'}
                    title={`${seat.label || `Seat ${seat.seatId}`} - ${status.toUpperCase()}`}
                  >
                    <span>{seat.seatId}</span>

                    {/* Small power badge indicator if equipped */}
                    {seat.hasPower && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          right: '-3px',
                          width: '8px',
                          height: '8px',
                          backgroundColor: isSelected ? '#ffffff' : '#4f46e5',
                          borderRadius: '50%',
                        }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            <span className="row-label">{rowKey}</span>
          </div>
        ))}
      </div>

      {/* Hovered Seat Detail Banner */}
      {hoveredSeat && (
        <div className="seat-hover-preview animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
              {hoveredSeat.label || `Seat ${hoveredSeat.seatId}`}
            </span>
            <span className={`badge ${
              hoveredSeat.currentStatus === 'available' ? 'badge-emerald' :
              hoveredSeat.currentStatus === 'occupied' ? 'badge-rose' :
              hoveredSeat.currentStatus === 'reserved' ? 'badge-amber' : 'badge-slate'
            }`}>
              {hoveredSeat.currentStatus || hoveredSeat.status}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Type: <strong>{hoveredSeat.type?.replace('_', ' ') || 'Standard Desk'}</strong></span>
            {hoveredSeat.hasPower && <span>⚡ Power Outlet</span>}
            {hoveredSeat.isWindowSeat && <span>🪟 Window Seat</span>}
            {hoveredSeat.activeReservation && (
              <span style={{ color: 'var(--amber-600)' }}>
                Booked by {hoveredSeat.activeReservation.userName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Seating Legend */}
      <div className="seating-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}></span>
          <span>Your Selected Seat</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f43f5e' }}></span>
          <span>Occupied (In-Use)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Reserved (Upcoming)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#334155' }}></span>
          <span>Disabled / Maintenance</span>
        </div>
      </div>

      <style>{`
        .seat-hover-preview {
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default SeatMap;
