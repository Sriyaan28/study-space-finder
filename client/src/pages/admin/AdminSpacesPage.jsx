import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Grid,
  CheckCircle,
  AlertTriangle,
  X,
  MapPin,
  Wifi,
  Volume2,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export const AdminSpacesPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: 'Floor 1',
    room: '',
    description: '',
    capacity: 30,
    noiseLevel: 'quiet',
    wifiAvailable: true,
    amenities: 'Wi-Fi, Power Outlets, Standing Desks',
    status: 'open',
    imageUrl: '',
    featured: false,
    rows: 4,
    cols: 6,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpaces = async () => {
    try {
      const res = await api.getSpaces();
      if (res.success && res.data) {
        setSpaces(res.data);
      }
    } catch (err) {
      console.error('Failed to load spaces:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSpace(null);
    setFormData({
      name: '',
      building: 'Engineering Hall (Building A)',
      floor: 'Floor 2',
      room: 'Room 201',
      description: '',
      capacity: 30,
      noiseLevel: 'quiet',
      wifiAvailable: true,
      amenities: 'Wi-Fi, Power Outlets, Standing Desks',
      status: 'open',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      featured: false,
      rows: 4,
      cols: 6,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (space) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      building: space.building,
      floor: space.floor,
      room: space.room,
      description: space.description || '',
      capacity: space.capacity,
      noiseLevel: space.noiseLevel,
      wifiAvailable: space.wifiAvailable,
      amenities: space.amenities?.join(', ') || '',
      status: space.status,
      imageUrl: space.imageUrl || '',
      featured: !!space.featured,
      rows: space.seatingGrid?.rows || 4,
      cols: space.seatingGrid?.cols || 6,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);

    const payload = {
      ...formData,
      capacity: Number(formData.capacity) || 30,
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      seatingGrid: {
        rows: Number(formData.rows) || 4,
        cols: Number(formData.cols) || 6,
      },
    };

    try {
      if (editingSpace) {
        await api.updateSpace(editingSpace._id, payload);
      } else {
        await api.createSpace(payload);
      }
      setIsModalOpen(false);
      await fetchSpaces();
    } catch (err) {
      setError(err.message || 'Failed to save study space');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (spaceId, spaceName) => {
    if (!window.confirm(`Are you sure you want to delete "${spaceName}"? All its seats will also be permanently removed.`)) {
      return;
    }

    try {
      await api.deleteSpace(spaceId);
      setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
    } catch (err) {
      alert(err.message || 'Failed to delete space');
    }
  };

  const handleStatusChange = async (spaceId, newStatus) => {
    try {
      await api.updateSpace(spaceId, { status: newStatus });
      setSpaces((prev) =>
        prev.map((s) => (s._id === spaceId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: '320px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Study Space Management
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Add, update room amenities, configure seating grids, and control availability status.
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Add Study Space
          </button>
        </div>

        {/* Spaces List / Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {spaces.map((space) => {
              const live = space.liveStats || { availableSeats: space.capacity, occupiedSeats: 0 };
              return (
                <div key={space._id} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '260px' }}>
                    <img
                      src={space.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=200&q=80'}
                      alt={space.name}
                      style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${
                          space.status === 'open' ? 'badge-emerald' :
                          space.status === 'maintenance' ? 'badge-amber' : 'badge-rose'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {space.status.replace('_', ' ')}
                        </span>
                        <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>
                          {space.noiseLevel}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>{space.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {space.building} · {space.floor} · {space.room}
                      </p>
                    </div>
                  </div>

                  {/* Seat Stats */}
                  <div style={{ textAlign: 'center', padding: '0 1rem', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {live.availableSeats} / {live.totalSeats || space.capacity}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Seats Available
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/admin/seating/${space._id}`}
                      className="btn btn-secondary btn-sm"
                      title="Configure BookMyShow Seating Grid"
                    >
                      <Grid size={15} color="var(--primary)" />
                      <span>Edit Seating</span>
                    </Link>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(space)}
                      title="Edit Space Properties"
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>

                    <select
                      value={space.status}
                      onChange={(e) => handleStatusChange(space._id, e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff', outline: 'none' }}
                    >
                      <option value="open">Status: Open</option>
                      <option value="closed">Status: Closed</option>
                      <option value="maintenance">Status: Maintenance</option>
                      <option value="temporarily_unavailable">Status: Unavailable</option>
                    </select>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(space._id, space.name)}
                      title="Delete Space"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Space Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {editingSpace ? 'Edit Study Space' : 'Create New Study Space'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                  <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Space Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ada Lovelace Engineering Library"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Building</label>
                    <input
                      type="text"
                      required
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      placeholder="Engineering Hall"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Floor</label>
                    <input
                      type="text"
                      required
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="Floor 3"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Room #</label>
                    <input
                      type="text"
                      required
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="Room 302"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the atmosphere and features of this study space..."
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Noise Level</label>
                    <select
                      value={formData.noiseLevel}
                      onChange={(e) => setFormData({ ...formData, noiseLevel: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    >
                      <option value="silent">Silent</option>
                      <option value="quiet">Quiet</option>
                      <option value="moderate">Moderate</option>
                      <option value="noisy">Collaborative/Noisy</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="temporarily_unavailable">Temporarily Unavailable</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Wi-Fi Available</label>
                    <select
                      value={formData.wifiAvailable ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, wifiAvailable: e.target.value === 'true' })}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    >
                      <option value="true">Yes (High-Speed)</option>
                      <option value="false">No Wi-Fi</option>
                    </select>
                  </div>
                </div>

                {!editingSpace && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.5rem' }}>Initial Seating Grid Generator</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Rows (A, B, C...)</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={formData.rows}
                          onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Columns per row</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={formData.cols}
                          onChange={(e) => setFormData({ ...formData, cols: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="Wi-Fi, Power Outlets, Standing Desks, Monitors"
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Image Photo URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={modalLoading}>
                    {modalLoading ? 'Saving Space...' : editingSpace ? 'Update Space' : 'Create Space'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSpacesPage;
