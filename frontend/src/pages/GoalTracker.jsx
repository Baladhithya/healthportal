import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import styles from './Dashboard.module.css';

const GoalTracker = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    goalType: 'steps',
    target: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Reminder form
  const [reminderForm, setReminderForm] = useState({ title: '', description: '', dueDate: '' });
  const [showReminderForm, setShowReminderForm] = useState(false);

  const defaults = { steps: 10000, water: 8, sleep: 8 };

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/api/patient/goals');
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/api/patient/goals', {
        ...formData,
        target: Number(formData.target) || defaults[formData.goalType],
        value: Number(formData.value),
      });
      setMessage('Goal logged successfully! ✅');
      setFormData((prev) => ({ ...prev, value: '', target: '' }));
      fetchGoals();
    } catch (err) {
      setMessage('Failed to log goal. ❌');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/patient/reminders', reminderForm);
      setMessage('Reminder created! 🔔');
      setReminderForm({ title: '', description: '', dueDate: '' });
      setShowReminderForm(false);
    } catch (err) {
      setMessage('Failed to create reminder. ❌');
    }
  };

  const goalConfig = {
    steps: { icon: '🚶', unit: 'steps' },
    water: { icon: '💧', unit: 'glasses' },
    sleep: { icon: '😴', unit: 'hours' },
  };

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Goal Tracker</h1>
          <p>Log your daily wellness goals</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') || message.includes('🔔') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* ── Log Goal Form ──────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📝 Log Today's Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Goal Type</label>
                <select
                  value={formData.goalType}
                  onChange={(e) => setFormData((p) => ({ ...p, goalType: e.target.value }))}
                >
                  <option value="steps">🚶 Steps</option>
                  <option value="water">💧 Water Intake (glasses)</option>
                  <option value="sleep">😴 Sleep (hours)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Target ({goalConfig[formData.goalType].unit})</label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData((p) => ({ ...p, target: e.target.value }))}
                  placeholder={`Default: ${defaults[formData.goalType]}`}
                />
              </div>
              <div className="form-group">
                <label>Actual Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                  placeholder="Enter value"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Logging...' : 'Log Goal'}
            </button>
          </form>
        </div>

        {/* ── Create Reminder ────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowReminderForm(!showReminderForm)}>
            🔔 {showReminderForm ? 'Cancel' : 'Add Reminder'}
          </button>
          {showReminderForm && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Create Preventive Care Reminder</h3>
              <form onSubmit={handleCreateReminder}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={reminderForm.title}
                    onChange={(e) => setReminderForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Annual blood test"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      value={reminderForm.description}
                      onChange={(e) => setReminderForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Optional details"
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={reminderForm.dueDate}
                      onChange={(e) => setReminderForm((p) => ({ ...p, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">Create Reminder</button>
              </form>
            </div>
          )}
        </div>

        {/* ── Recent Goals ────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 Recent Goals</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="loading-container" style={{ minHeight: '200px' }}>
                <div className="spinner" />
              </div>
            ) : goals.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No goals logged yet. Start tracking above!</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Value</th>
                    <th>Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr key={g._id}>
                      <td>{goalConfig[g.goalType]?.icon} {g.goalType}</td>
                      <td>{new Date(g.date).toLocaleDateString()}</td>
                      <td>{g.value}</td>
                      <td>{g.target}</td>
                      <td>
                        <span className={`badge ${g.met ? 'badge-success' : 'badge-danger'}`}>
                          {g.met ? 'Met ✓' : 'Missed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoalTracker;
