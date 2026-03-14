import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    allergies: '',
    medications: '',
    bloodType: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/patient/profile');
        setProfile(data);
        setFormData({
          allergies: (data.allergies || []).join(', '),
          medications: (data.medications || []).join(', '),
          bloodType: data.bloodType || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put('/api/patient/profile', {
        allergies: formData.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        medications: formData.medications.split(',').map((s) => s.trim()).filter(Boolean),
        bloodType: formData.bloodType,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      });
      setProfile(data);
      setEditMode(false);
      setMessage('Profile updated successfully! ✅');
    } catch (err) {
      setMessage('Failed to update profile. ❌');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading-container"><div className="spinner" /></div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Profile Management</h1>
          <p>Manage your health information</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>🩺 Health Information</h3>
            {!editMode && (
              <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                ✏️ Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Allergies (comma-separated)</label>
                <input
                  value={formData.allergies}
                  onChange={(e) => setFormData((p) => ({ ...p, allergies: e.target.value }))}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>
              <div className="form-group">
                <label>Current Medications (comma-separated)</label>
                <input
                  value={formData.medications}
                  onChange={(e) => setFormData((p) => ({ ...p, medications: e.target.value }))}
                  placeholder="e.g., Lisinopril, Metformin"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodType: e.target.value }))}
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContactName: e.target.value }))}
                    placeholder="Contact name"
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <InfoRow label="Allergies" value={profile?.allergies?.join(', ') || 'None listed'} />
              <InfoRow label="Current Medications" value={profile?.medications?.join(', ') || 'None listed'} />
              <InfoRow label="Blood Type" value={profile?.bloodType || 'Not set'} />
              <InfoRow label="Emergency Contact" value={
                profile?.emergencyContactName
                  ? `${profile.emergencyContactName} – ${profile.emergencyContactPhone || 'No phone'}`
                  : 'Not set'
              } />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.875rem 0',
    borderBottom: '1px solid var(--border)',
  }}>
    <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>{label}</span>
    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</span>
  </div>
);

export default Profile;
