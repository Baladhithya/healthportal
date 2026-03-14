import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Activity, ShieldEllipsis, ShieldCheck, Mail, Phone, HeartPulse, CheckCircle2, ChevronRight, CheckSquare, Key, Building, Send, Clock } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth(); // Needed to optionally update token if required, but we can just use local state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile States
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    allergies: '',
    medications: '',
    bloodType: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Provider specific fields
    hospitalName: '',
    mobileNumber: '',
  });

  // Assignment Request State (Patient Only)
  const [providerLicenseKey, setProviderLicenseKey] = useState('');
  const [requestStatus, setRequestStatus] = useState('');

  // 2FA States
  const [tfaSetupUrl, setTfaSetupUrl] = useState('');
  const [tfaToken, setTfaToken] = useState('');
  const [tfaStatus, setTfaStatus] = useState('');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false);

  const fetchData = async () => {
    try {
      if (user.role === 'patient') {
        const { data } = await api.get('/api/patient/profile');
        setProfile(data);
        setFormData({
          allergies: (data.allergies || []).join(', '),
          medications: (data.medications || []).join(', '),
          bloodType: data.bloodType || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
        });
      } else {
        setProfile({});
      }
      
      // Refresh 2FA state from backend /me
      const { data: userData } = await api.get('/api/auth/me');
      setIsTwoFactorEnabled(userData.isTwoFactorEnabled);
      // If the user's local state is missing licenseKey (old token), the /me route will fetch it.
      if (!user.licenseKey && userData.licenseKey) {
        user.licenseKey = userData.licenseKey;
      }
      if (!user.hospitalName && userData.hospitalName) {
        user.hospitalName = userData.hospitalName;
      }
      if (!user.mobileNumber && userData.mobileNumber) {
        user.mobileNumber = userData.mobileNumber;
      }
      
      if (user.role === 'provider') {
        setFormData(p => ({
          ...p,
          hospitalName: user.hospitalName || '',
          mobileNumber: user.mobileNumber || ''
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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
      setProfile(data); // Profile already includes populated providers from backend if we return them
      setEditMode(false);
      setMessage('Profile updated successfully! ✅');
      fetchData(); // Quick refetch to ensure we have populated refs
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile. ❌');
    } finally {
      setSaving(false);
    }
  };

  const handleProviderSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put('/api/provider/profile', {
        hospitalName: formData.hospitalName,
        mobileNumber: formData.mobileNumber,
      });
      // Optimistically update context user
      user.hospitalName = data.hospitalName;
      user.mobileNumber = data.mobileNumber;
      setEditMode(false);
      setMessage('Clinic information updated successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update clinic information. ❌');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestProvider = async (e) => {
    e.preventDefault();
    setRequestStatus('sending');
    try {
      await api.post('/api/patient/assignment-requests', { licenseKey: providerLicenseKey });
      setRequestStatus('success');
      setProviderLicenseKey('');
      fetchData(); // Refetch profile to show new pending request
      setTimeout(() => setRequestStatus(''), 3000);
    } catch (err) {
      setRequestStatus(err.response?.data?.error || 'Failed to send request.');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const { data } = await api.post('/api/auth/2fa/enable');
      setTfaSetupUrl(data.qrCodeUrl);
      setTfaStatus('setup');
    } catch (err) {
      console.error(err);
      setTfaStatus('error');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/api/auth/2fa/verify', { token: tfaToken });
      setIsTwoFactorEnabled(true);
      user.isTwoFactorEnabled = true; // Optimistically update local context user object
      setTfaStatus('success');
      setTfaSetupUrl('');
      setTfaToken('');
    } catch (err) {
      setTfaStatus('invalid');
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
          <div>
            <h1>Account & Profile</h1>
            <p>Manage your personal data and security settings</p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* User Details Card */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <User size={32} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user.firstName} {user.lastName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <Mail size={14} /> {user.email}
                </div>
                <div style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                  <span className={`badge ${user.role === 'provider' ? 'badge-info' : 'badge-success'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Details Section */}
            {user.role === 'provider' && (
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Building size={20} color="var(--primary)" /> Clinic Information
                  </h3>
                  {!editMode && (
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setEditMode(true)}>
                      Edit Info
                    </button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleProviderSave} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                    <div className="form-group">
                      <label>Hospital/Clinic Name</label>
                      <input 
                        value={formData.hospitalName} 
                        onChange={(e) => setFormData(p => ({ ...p, hospitalName: e.target.value }))} 
                        placeholder="General Hospital" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input 
                        value={formData.mobileNumber} 
                        onChange={(e) => setFormData(p => ({ ...p, mobileNumber: e.target.value }))} 
                        placeholder="+1 234 567 8900" 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setEditMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hospital/Clinic</span>
                      <span style={{ fontWeight: 600 }}>{user.hospitalName || 'Not specified'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={14} /> Mobile Number
                      </span>
                      <span style={{ fontWeight: 600 }}>{user.mobileNumber || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your License Key</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: 'var(--primary-fade)', color: 'var(--primary-dark)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                          {user.licenseKey}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.4 }}>
                      Provide this License Key to your patients. They will use it to request an assignment to your care.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Security Section (2FA) */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" /> Security Settings
            </h3>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Two-Factor Authentication</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Add an extra layer of security to your account using an authenticator app.
                  </p>
                </div>
                {isTwoFactorEnabled ? (
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> Enabled
                  </span>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleEnable2FA} disabled={tfaStatus === 'setup'}>
                    Enable 2FA
                  </button>
                )}
              </div>

              {tfaStatus === 'setup' && !isTwoFactorEnabled && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', animation: 'fadeIn 0.3s' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    1. Scan this QR code with your authenticator app (like Google Authenticator or Authy):
                  </p>
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: '1rem' }}>
                    <img src={tfaSetupUrl} alt="2FA QR Code" style={{ width: '150px', height: '150px' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    2. Enter the 6-digit code generated by the app:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength="6"
                      value={tfaToken}
                      onChange={(e) => setTfaToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{ width: '120px', textAlign: 'center', letterSpacing: '0.25em', fontWeight: 700 }}
                    />
                    <button className="btn btn-primary" onClick={handleVerify2FA} disabled={tfaToken.length !== 6}>
                      Verify
                    </button>
                  </div>
                  {tfaStatus === 'invalid' && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Invalid token. Please try again.</p>}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details & Health Info */}
          {user.role === 'patient' && (
            <div className="card" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HeartPulse size={22} color="var(--accent)" /> Health Information
                </h3>
                {!editMode && (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label>Allergies (comma-separated)</label>
                    <input value={formData.allergies} onChange={(e) => setFormData(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g., Penicillin, Peanuts" />
                  </div>
                  <div className="form-group">
                    <label>Current Medications (comma-separated)</label>
                    <input value={formData.medications} onChange={(e) => setFormData(p => ({ ...p, medications: e.target.value }))} placeholder="e.g., Lisinopril, Metformin" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Blood Type</label>
                      <select value={formData.bloodType} onChange={(e) => setFormData(p => ({ ...p, bloodType: e.target.value }))}>
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Emergency Contact Name</label>
                      <input value={formData.emergencyContactName} onChange={(e) => setFormData(p => ({ ...p, emergencyContactName: e.target.value }))} placeholder="Contact name" />
                    </div>
                    <div className="form-group">
                      <label>Emergency Phone</label>
                      <input value={formData.emergencyContactPhone} onChange={(e) => setFormData(p => ({ ...p, emergencyContactPhone: e.target.value }))} placeholder="+1 ..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <InfoRow label="Allergies" value={profile?.allergies?.length ? profile.allergies.join(', ') : 'None listed'} />
                  <InfoRow label="Medications" value={profile?.medications?.length ? profile.medications.join(', ') : 'None listed'} />
                  <InfoRow label="Blood Type" value={profile?.bloodType || 'Not set'} />
                  <InfoRow label="Emergency Contact" 
                    value={profile?.emergencyContactName ? `${profile.emergencyContactName} (${profile.emergencyContactPhone || 'No phone'})` : 'Not set'} 
                  />
                  
                  {/* Provider Management Section */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      <ShieldEllipsis size={20} color="var(--primary)" /> Care Team
                    </h4>
                    
                    {/* Request Provider Form */}
                    <form onSubmit={handleRequestProvider} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Key size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          value={providerLicenseKey} 
                          onChange={(e) => setProviderLicenseKey(e.target.value)}
                          placeholder="Provider License Key (e.g. LIC-A1B2)" 
                          style={{ paddingLeft: '2.5rem', margin: 0 }}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-secondary" disabled={requestStatus === 'sending'} style={{ whiteSpace: 'nowrap' }}>
                        <Send size={16} /> Request
                      </button>
                    </form>

                    {requestStatus && requestStatus !== 'sending' && requestStatus !== 'success' && (
                       <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>{requestStatus}</p>
                    )}
                    {requestStatus === 'success' && (
                       <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>Request sent successfully!</p>
                    )}

                    {/* Pending Requests list */}
                    {profile?.pendingRequests && profile.pendingRequests.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Pending Requests</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {profile.pendingRequests.map((provider) => (
                            <div key={provider._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#fff', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                               <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dr. {provider.lastName}</div>
                               <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Pending</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Providers List */}
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Providers</h5>
                    {profile?.assignedProviders && profile.assignedProviders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {profile.assignedProviders.map((provider) => (
                          <div key={provider._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--primary-fade)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Building size={20} color="var(--primary)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dr. {provider.firstName} {provider.lastName}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{provider.hospitalName || provider.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No active providers assigned.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

export default Profile;