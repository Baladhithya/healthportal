import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, ChevronRight, ChevronDown, Activity, BellRing, ClipboardList, UserPlus, Check, X, HeartPulse } from 'lucide-react';

const ProviderDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const [patientsRes, requestsRes] = await Promise.all([
          api.get('/api/provider/patients'),
          api.get('/api/provider/assignment-requests')
        ]);
        setPatients(patientsRes.data);
        setRequests(requestsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSelectPatient = async (patientId) => {
    if (selectedPatient === patientId) {
      setSelectedPatient(null);
      setPatientDetail(null);
      return;
    }
    setSelectedPatient(patientId);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/api/provider/patients/${patientId}`);
      setPatientDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.put(`/api/provider/assignment-requests/${requestId}/respond`, { status });
      // Remove from pending list
      setRequests(prev => prev.filter(req => req._id !== requestId));
      // If accepted, immediately refetch the patient list to show the new patient
      if (status === 'accepted') {
        const { data } = await api.get('/api/provider/patients');
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to respond to request.');
    }
  };

  const statusColor = {
    'On Track': 'badge-success',
    'Needs Attention': 'badge-warning',
    'At Risk': 'badge-danger',
    'No Data': 'badge-info',
  };

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Overview</h1>
            <p>Monitor patient compliance and daily wellness goals</p>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary-fade)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
              <UserPlus size={22} /> Pending Patient Requests ({requests.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{req.patientId.firstName} {req.patientId.lastName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.patientId.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleRespondRequest(req._id, 'accepted')}
                      style={{ background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title="Accept"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleRespondRequest(req._id, 'rejected')}
                      style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : patients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '50%' }}>
                <Users size={48} color="var(--primary)" />
              </div>
            </div>
            <h3>No Patients Assigned</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Patients will appear here once they are assigned to your care.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Patient Name</th>
                  <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Email</th>
                  <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Goals Met</th>
                  <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Missed Checkups</th>
                  <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr
                      onClick={() => handleSelectPatient(p.id)}
                      style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selectedPatient === p.id ? 'var(--bg-secondary)' : 'transparent', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {selectedPatient === p.id ? <ChevronDown size={18} color="var(--primary)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                        {p.name}
                      </td>
                      <td style={{ padding: '1.25rem', color: 'var(--text-secondary)' }}>{p.email}</td>
                      <td style={{ padding: '1.25rem', fontWeight: 600 }}>
                        {p.compliance.goalsMetThisWeek} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {p.compliance.goalsTotalThisWeek}</span>
                      </td>
                      <td style={{ padding: '1.25rem' }}>{p.compliance.missedCheckups}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <span className={`badge ${statusColor[p.compliance.status]}`}>
                          {p.compliance.status}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail View */}
                    {selectedPatient === p.id && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0, borderBottom: '2px solid var(--border)' }}>
                          <div style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
                            {detailLoading ? (
                              <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner" style={{ margin: '0 auto' }} />
                              </div>
                            ) : patientDetail ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                
                                {/* Patient Health Profile Section */}
                                {patientDetail.profile && (
                                  <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <HeartPulse size={18} color="var(--accent)" /> Health Profile
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Blood Type</div>
                                        <div style={{ fontWeight: 600 }}>{patientDetail.profile.bloodType || 'Unknown'}</div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Emergency Contact</div>
                                        <div style={{ fontWeight: 600 }}>
                                          {patientDetail.profile.emergencyContactName ? (
                                            <>{patientDetail.profile.emergencyContactName} ({patientDetail.profile.emergencyContactPhone || 'No Phone'})</>
                                          ) : 'Not Provided'}
                                        </div>
                                      </div>
                                      <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Allergies</div>
                                        <div style={{ fontWeight: 600 }}>{patientDetail.profile.allergies?.length ? patientDetail.profile.allergies.join(', ') : 'None Reported'}</div>
                                      </div>
                                      <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Medications</div>
                                        <div style={{ fontWeight: 600 }}>{patientDetail.profile.medications?.length ? patientDetail.profile.medications.join(', ') : 'None Reported'}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                                  {/* Recent Goals */}
                                <div>
                                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={18} color="var(--primary)" /> Recent Goals Loop
                                  </h4>
                                  {patientDetail.goals.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No recent goals logged.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {patientDetail.goals.slice(0, 5).map((g) => (
                                        <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span className={`badge ${g.met ? 'badge-success' : 'badge-danger'}`} style={{ width: '60px', justifyContent: 'center' }}>
                                              {g.met ? 'Met' : 'Missed'}
                                            </span>
                                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{g.goalType}</span>
                                          </div>
                                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {g.value}/{g.target} — {new Date(g.date).toLocaleDateString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Reminders */}
                                <div>
                                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BellRing size={18} color="var(--primary)" /> Preventive Reminders
                                  </h4>
                                  {patientDetail.reminders.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No active reminders.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {patientDetail.reminders.map((r) => (
                                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                          <div style={{ fontWeight: 600, color: r.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: r.completed ? 'line-through' : 'none' }}>
                                            {r.title}
                                          </div>
                                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(r.dueDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              </div> 
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboard;