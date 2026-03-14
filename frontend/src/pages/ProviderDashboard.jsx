import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import styles from './Dashboard.module.css';

const ProviderDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/api/provider/patients');
        setPatients(data);
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
          <h1>Provider Dashboard</h1>
          <p>Monitor patient compliance and wellness goals</p>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : patients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3>No Patients Assigned</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Patients will appear here once they are assigned to you.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Goals Met</th>
                  <th>Missed Checkups</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <>
                    <tr
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        {selectedPatient === p.id ? '▼' : '▶'} {p.name}
                      </td>
                      <td>{p.email}</td>
                      <td>
                        {p.compliance.goalsMetThisWeek} / {p.compliance.goalsTotalThisWeek}
                      </td>
                      <td>{p.compliance.missedCheckups}</td>
                      <td>
                        <span className={`badge ${statusColor[p.compliance.status]}`}>
                          {p.compliance.status}
                        </span>
                      </td>
                    </tr>
                    {selectedPatient === p.id && (
                      <tr key={`${p.id}-detail`}>
                        <td colSpan={5} style={{ padding: '1.5rem', background: 'var(--bg-primary)' }}>
                          {detailLoading ? (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                              <div className="spinner" style={{ margin: '0 auto' }} />
                            </div>
                          ) : patientDetail ? (
                            <div>
                              <h4 style={{ marginBottom: '1rem' }}>
                                📋 {patientDetail.patient.name}'s Details
                              </h4>

                              {/* Recent Goals */}
                              <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Recent Goals
                              </h5>
                              {patientDetail.goals.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No goals logged.</p>
                              ) : (
                                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                                  {patientDetail.goals.slice(0, 10).map((g) => (
                                    <div key={g._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                                      <span className={`badge ${g.met ? 'badge-success' : 'badge-danger'}`}>
                                        {g.met ? 'Met' : 'Missed'}
                                      </span>
                                      <span style={{ textTransform: 'capitalize' }}>{g.goalType}</span>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        {g.value}/{g.target} on {new Date(g.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reminders */}
                              <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Preventive Care Reminders
                              </h5>
                              {patientDetail.reminders.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reminders set.</p>
                              ) : (
                                patientDetail.reminders.map((r) => (
                                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <span>{r.completed ? '✅' : '🔔'}</span>
                                    <span>{r.title}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                      — {new Date(r.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </>
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
