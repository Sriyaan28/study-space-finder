import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Grid,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Zap,
  Sun,
  Shield,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export const AdminSeatingPage = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaceId || '');
  const [currentSpace, setCurrentSpace] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch all spaces for selector
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await api.getSpaces();
        if (res.success && res.data) {
          setAllSpaces(res.data);
          if (!selectedSpaceId && res.data.length > 0) {
            setSelectedSpaceId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load spaces:', err.message);
      }
    };
    fetchSpaces();
  }, []);

  // Fetch seats for selected space
  useEffect(() => {
    if (!selectedSpaceId) return;

    const fetchSpaceSeating = async () => {
      setLoading(true);
      setSelectedSeat(null);
      setSuccessMsg(null);
      try {
        const [spaceRes, seatsRes] = await Promise.all([
          api.getSpaceById(selectedSpaceId),
          api.getSpaceSeats(selectedSpaceId),
        ]);

        if (spaceRes.success) setCurrentSpace(spaceRes.data);
        if (seatsRes.success && seatsRes.data?.seats) {
          setSeats(seatsRes.data.seats);
        }
      } catch (err) {
        console.error('Failed to fetch seating layout:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceSeating();
  }, [selectedSpaceId]);

  const handleSpaceChange = (newId) => {
    setSelectedSpaceId(newId);
    navigate(`/admin/seating/${newId}`);
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat({ ...seat });
  };

  const handleSeatPropChange = (field, val) => {
    if (!selectedSeat) return;
    const updated = { ...selectedSeat, [field]: val };
    setSelectedSeat(updated);

    // Update in main list
    setSeats((prev) =>
      prev.map((s) => (s.seatId === updated.seatId ? updated : s))
    );
  };

  const handleToggleBlock = (seatId) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.seatId === seatId) {
          const nextStatus = s.status === 'blocked' ? 'available' : 'blocked';
          const updated = { ...s, status: nextStatus, currentStatus: nextStatus };
          if (selectedSeat?.seatId === seatId) setSelectedSeat(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const handleAddRow = () => {
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Find next row letter
    const existingRows = new Set(seats.map((s) => s.row));
    let nextRow = 'A';
    for (let i = 0; i < rowLetters.length; i++) {
      if (!existingRows.has(rowLetters[i])) {
        nextRow = rowLetters[i];
        break;
      }
    }

    const colsCount = 6;
    const newRowSeats = [];
    for (let c = 1; c <= colsCount; c++) {
      newRowSeats.push({
        seatId: `${nextRow}${c}`,
        row: nextRow,
        column: c,
        label: `Seat ${nextRow}${c}`,
        type: 'standard',
        status: 'available',
        hasPower: true,
        isWindowSeat: false,
      });
    }

    setSeats((prev) => [...prev, ...newRowSeats]);
  };

  const handleSaveLayout = async () => {
    if (!selectedSpaceId) return;

    setSaving(true);
    setSuccessMsg(null);

    try {
      const rows = new Set(seats.map((s) => s.row)).size;
      const res = await api.saveSpaceLayout(selectedSpaceId, {
        rows,
        cols: 6,
        seats,
      });

      if (res.success) {
        setSuccessMsg('Seating layout and seat statuses saved successfully to MongoDB!');
        if (res.data?.seats) setSeats(res.data.seats);
      }
    } catch (err) {
      alert(err.message || 'Failed to save seating layout');
    } finally {
      setSaving(false);
    }
  };

  // Group seats by row
  const rowsMap = seats.reduce((acc, seat) => {
    const r = seat.row || seat.seatId?.charAt(0) || 'A';
    if (!acc[r]) acc[r] = [];
    acc[r].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(rowsMap).sort();
  sortedRows.forEach((r) => {
    rowsMap[r].sort((a, b) => (Number(a.column) || 0) - (Number(b.column) || 0));
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: '320px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link to="/admin/spaces" className="btn btn-secondary btn-sm" style={{ marginBottom: '0.5rem' }}>
              <ChevronLeft size={14} /> Back to Spaces
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Seating Grid Configurator
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Configure row layout, mark maintenance/blocked desks, and customize seat attributes.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSaveLayout}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'Saving to Database...' : 'Save Seating Layout'}</span>
          </button>
        </div>

        {/* Space Selector & Grid Controls */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Space:</span>
            <select
              value={selectedSpaceId}
              onChange={(e) => handleSpaceChange(e.target.value)}
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 700, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff', outline: 'none' }}
            >
              {allSpaces.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.building})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddRow}>
              <Plus size={14} /> Add Row
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-700)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Seating Layout Grid & Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedSeat ? 'minmax(0, 1.8fr) minmax(0, 1fr)' : '1fr', gap: '1.5rem' }}>
          {/* Seating Canvas */}
          <div className="card seat-map-container" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="screen-indicator"></div>
              <div className="screen-label">FRONT OF ROOM · WHITEBOARDS & WINDOW VIEW</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click any seat to inspect, modify amenities, or toggle maintenance status.
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              </div>
            ) : (
              <div className="seating-grid">
                {sortedRows.map((r) => (
                  <div key={r} className="seating-row">
                    <span className="row-label">{r}</span>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      {rowsMap[r].map((seat) => {
                        const isSelected = selectedSeat?.seatId === seat.seatId;
                        const isBlocked = seat.status === 'blocked';

                        return (
                          <button
                            key={seat.seatId}
                            type="button"
                            className={`seat-btn ${
                              isSelected ? 'seat-selected' :
                              isBlocked ? 'seat-blocked' : 'seat-available'
                            }`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Seat ${seat.seatId} - Click to edit`}
                          >
                            <span>{seat.seatId}</span>
                            {seat.hasPower && (
                              <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', backgroundColor: '#4f46e5', borderRadius: '50%' }}></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className="row-label">{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="seating-legend" style={{ marginTop: '2rem' }}>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span>Active / Available ({seats.filter((s) => s.status !== 'blocked').length})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#334155' }}></span>
                <span>Maintenance / Blocked ({seats.filter((s) => s.status === 'blocked').length})</span>
              </div>
            </div>
          </div>

          {/* Seat Inspector Sidebar */}
          {selectedSeat && (
            <div className="card animate-fade-in" style={{ padding: '1.5rem', alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Seat {selectedSeat.seatId} Settings
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Row {selectedSeat.row}, Col {selectedSeat.column}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSeat(null)}
                >
                  Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Seat Label</label>
                  <input
                    type="text"
                    value={selectedSeat.label || ''}
                    onChange={(e) => handleSeatPropChange('label', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Workstation Type</label>
                  <select
                    value={selectedSeat.type || 'standard'}
                    onChange={(e) => handleSeatPropChange('type', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="standard">Standard Desk</option>
                    <option value="quiet_pod">Quiet Focus Pod</option>
                    <option value="standing_desk">Standing Desk</option>
                    <option value="power_station">Power Workstation</option>
                    <option value="group_table">Group Table</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Seat Operational Status</label>
                  <select
                    value={selectedSeat.status || 'available'}
                    onChange={(e) => handleSeatPropChange('status', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="available">Available for Booking</option>
                    <option value="blocked">Blocked / Under Maintenance</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSeat.hasPower || false}
                      onChange={(e) => handleSeatPropChange('hasPower', e.target.checked)}
                    />
                    <span>⚡ Dedicated Power Outlet</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSeat.isWindowSeat || false}
                      onChange={(e) => handleSeatPropChange('isWindowSeat', e.target.checked)}
                    />
                    <span>🪟 Natural Window Daylight</span>
                  </label>
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className={`btn ${selectedSeat.status === 'blocked' ? 'btn-primary' : 'btn-danger'} btn-sm`}
                    style={{ width: '100%' }}
                    onClick={() => handleToggleBlock(selectedSeat.seatId)}
                  >
                    {selectedSeat.status === 'blocked' ? 'Unblock This Seat' : 'Mark Under Maintenance'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSeatingPage;
