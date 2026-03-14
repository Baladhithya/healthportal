import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Footprints, Droplets, Moon, Bell, CheckCircle2, Lightbulb, Target, CalendarClock } from 'lucide-react';

const GOAL_CONFIG = {
  steps: { icon: <Footprints size={24} color="#0ea5e9" />, label: 'Steps', unit: 'steps', color: '#0ea5e9' },
  water: { icon: <Droplets size={24} color="#14b8a6" />, label: 'Water', unit: 'glasses', color: '#14b8a6' },
  sleep: { icon: <Moon size={24} color="#6366f1" />, label: 'Sleep', unit: 'hrs', color: '#6366f1' },
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
          <div>
            <h1>Overview</h1>
            <p>Track your wellness goals and preventive care</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* ── Wellness Goals ─────────────────────────────── */}
          <section>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Target size={20} color="var(--primary)" /> Wellness Goals This Week
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(GOAL_CONFIG).map(([type, config]) => {
                const data = progress[type] || { met: 0, total: 0, latestValue: 0, latestTarget: 0 };
                const pct = data.latestTarget > 0
                  ? Math.min((data.latestValue / data.latestTarget) * 100, 100)
                  : 0;

                return (
                  <div key={type} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{config.label}</div>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                        {config.icon}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800 }}>{data.latestValue}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/ {data.latestTarget || '–'} {config.unit}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: config.color }} />
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{data.met}</strong> of {data.total} days met this week
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* ── Preventive Care Reminders ─────────────────── */}
            <section>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <CalendarClock size={20} color="var(--primary)" /> Preventive Care Reminders
              </h2>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {reminders.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reminders yet. Add one from the Goal Tracker page!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {reminders.slice(0, 5).map((r) => (
                      <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ background: r.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',   padding: '0.5rem', borderRadius: '50%' }}>
                            {r.completed ? <CheckCircle2 size={20} color="var(--success)" /> : <Bell size={20} color="var(--warning)" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${r.completed ? 'badge-success' : 'badge-warning'}`}>
                          {r.completed ? 'Done' : 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Health Tip of the Day ─────────────────────── */}
            {healthTip && (
              <section>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <Lightbulb size={20} color="var(--primary)" /> Health Tip of the Day
                </h2>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.2)', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                    {healthTip.category}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, fontWeight: 500 }}>
                    "{healthTip.tip}"
                  </h3>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
