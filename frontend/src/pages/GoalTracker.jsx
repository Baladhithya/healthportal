import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Target, BellPlus, Footprints, Droplets, Moon, Activity, CalendarPlus, X } from 'lucide-react';

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
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
  console.error(err);
  setMessage(err?.response?.data?.message || 'Failed to add goal. ❌');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/patient/reminders', reminderForm);
      setMessage('Reminder created successfully! 🔔');
      setReminderForm({ title: '', description: '', dueDate: '' });
      setShowReminderForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
  console.error(err);
  setMessage(err?.response?.data?.message || 'Failed to create reminder. ❌');
}
  };

  const goalConfig = {
    steps: { icon: <Footprints size={18} color="#0ea5e9" />, unit: 'steps', color: '#0ea5e9' },
    water: { icon: <Droplets size={18} color="#14b8a6" />, unit: 'glasses', color: '#14b8a6' },
    sleep: { icon: <Moon size={18} color="#6366f1" />, unit: 'hours', color: '#6366f1' },
  };

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Daily Goal Tracker</h1>
            <p>Log your wellness progress and set up preventive checkup reminders</p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') || message.includes('🔔') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* ── Log Goal Form ──────────────────────────────── */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
              <Target size={22} color="var(--primary)" /> Log Today's Goal
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {Object.entries(goalConfig).map(([type, config]) => (
                    <div
                      key={type}
                      onClick={() => setFormData(p => ({ ...p, goalType: type }))}
                      style={{
                        flex: 1, padding: '1rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        border: formData.goalType === type ? `2px solid ${config.color}` : '2px solid var(--border)',
                        background: formData.goalType === type ? 'var(--bg-secondary)' : '#fff',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        {config.icon}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target ({goalConfig[formData.goalType].unit})</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData((p) => ({ ...p, target: e.target.value }))}
                    placeholder={`Optional. Default: ${defaults[formData.goalType]}`}
                  />
                </div>
                <div className="form-group">
                  <label>Actual Value Completed</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                    placeholder={`e.g., 8000`}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={submitting}>
                {submitting ? 'Logging...' : 'Save Progress'}
              </button>
            </form>
          </div>

          {/* ── Create Reminder ────────────────────────────── */}
          <div className="card" style={{ alignSelf: 'start', border: showReminderForm ? '1px solid var(--primary-light)' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showReminderForm ? '1.5rem' : '0' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: 0 }}>
                <BellPlus size={22} color="var(--accent)" /> Preventive Care Reminder
              </h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                onClick={() => setShowReminderForm(!showReminderForm)}
              >
                {showReminderForm ? <><X size={16} /> Close</> : <><CalendarPlus size={16} /> New Reminder</>}
              </button>
            </div>

            {showReminderForm ? (
              <form onSubmit={handleCreateReminder} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={reminderForm.title}
                    onChange={(e) => setReminderForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Annual flu shot appointment"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      value={reminderForm.description}
                      onChange={(e) => setReminderForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Location, doctor's name, etc."
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
                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Save Reminder</button>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                Set up automated reminders for annual checkups, vaccinations, and routine screenings. Click the button above to create one.
              </p>
            )}
          </div>
        </div>

        {/* ── Recent Goals ────────────────────────────────── */}
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Activity size={20} color="var(--primary)" /> Goal History Log
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="loading-container" style={{ minHeight: '200px' }}>
                <div className="spinner" />
              </div>
            ) : goals.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No goals logged yet. Start tracking your daily habits above!
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date Logged</th>
                    <th>Actual Value</th>
                    <th>Target Goal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr key={g._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'capitalize', fontWeight: 600 }}>
                        <div style={{ padding: '0.4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          {goalConfig[g.goalType]?.icon}
                        </div>
                        {g.goalType}
                      </td>
                      <td>{new Date(g.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700 }}>{g.value}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{g.target}</td>
                      <td>
                        <span className={`badge ${g.met ? 'badge-success' : 'badge-danger'}`}>
                          {g.met ? 'Goal Met' : 'Missed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GoalTracker;