import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import styles from './Dashboard.module.css';

const GOAL_CONFIG = {
  steps: { icon: '🚶', label: 'Steps', unit: 'steps', color: '#0ea5e9' },
  water: { icon: '💧', label: 'Water', unit: 'glasses', color: '#14b8a6' },
  sleep: { icon: '😴', label: 'Sleep', unit: 'hours', color: '#6366f1' },
};

const PatientDashboard = () => {
  const [progress, setProgress] = useState({});
  const [reminders, setReminders] = useState([]);
  const [healthTip, setHealthTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, remindersRes, tipRes] = await Promise.all([
          api.get('/api/patient/goals/progress'),
          api.get('/api/patient/reminders'),
          api.get('/api/patient/health-tip'),
        ]);
        setProgress(progressRes.data);
        setReminders(remindersRes.data);
        setHealthTip(tipRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <h1>Patient Dashboard</h1>
          <p>Track your wellness goals and preventive care</p>
        </div>

        <div className={styles.dashboard}>
          {/* ── Wellness Goals ─────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🎯 Wellness Goals This Week</h2>
            <div className={styles.statsGrid}>
              {Object.entries(GOAL_CONFIG).map(([type, config]) => {
                const data = progress[type] || { met: 0, total: 0, latestValue: 0, latestTarget: 0 };
                const pct = data.latestTarget > 0
                  ? Math.min((data.latestValue / data.latestTarget) * 100, 100)
                  : 0;

                return (
                  <div key={type} className={`card ${styles.goalCard}`}>
                    <div className={styles.goalHeader}>
                      <div>
                        <div className={styles.goalType}>{config.label}</div>
                      </div>
                      <div className={styles.goalIcon}>{config.icon}</div>
                    </div>
                    <div className={styles.goalValues}>
                      <span className={styles.goalCurrent}>{data.latestValue}</span>
                      <span className={styles.goalTarget}>/ {data.latestTarget || '–'} {config.unit}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {data.met} of {data.total} days met this week
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Preventive Care Reminders ─────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📅 Preventive Care Reminders</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {reminders.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No reminders yet. Add one from the Goal Tracker page!</p>
                </div>
              ) : (
                reminders.slice(0, 5).map((r) => (
                  <div key={r._id} className={styles.reminderItem}>
                    <div className={styles.reminderLeft}>
                      <div className={styles.reminderIcon}>
                        {r.completed ? '✅' : '🔔'}
                      </div>
                      <div>
                        <div className={styles.reminderTitle}>{r.title}</div>
                        <div className={styles.reminderDate}>
                          {new Date(r.dueDate).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${r.completed ? 'badge-success' : 'badge-warning'}`}>
                      {r.completed ? 'Done' : 'Upcoming'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Health Tip of the Day ─────────────────────── */}
          {healthTip && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>💡 Health Tip of the Day</h2>
              <div className={`card ${styles.tipCard}`}>
                <div className={styles.tipCategory}>{healthTip.category}</div>
                <div className={styles.tipText}>{healthTip.tip}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
