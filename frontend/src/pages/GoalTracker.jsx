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

  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [showReminderForm, setShowReminderForm] = useState(false);

  const defaults = {
    steps: 10000,
    water: 8,
    sleep: 8,
  };

  const goalConfig = {
    steps: {
      icon: <Footprints size={18} color="#0ea5e9" />,
      unit: 'steps',
      color: '#0ea5e9',
    },
    water: {
      icon: <Droplets size={18} color="#14b8a6" />,
      unit: 'glasses',
      color: '#14b8a6',
    },
    sleep: {
      icon: <Moon size={18} color="#6366f1" />,
      unit: 'hours',
      color: '#6366f1',
    },
  };

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

  useEffect(() => {
    fetchGoals();
  }, []);

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

      setFormData((prev) => ({
        ...prev,
        value: '',
        target: '',
      }));

      fetchGoals();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
  console.error(err);
  setMessage(err?.response?.data?.message || 'Failed to log goal. ❌');

    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();

    try {
      await api.post('/api/patient/reminders', reminderForm);

      setMessage('Reminder created successfully! 🔔');

      setReminderForm({
        title: '',
        description: '',
        dueDate: '',
      });

      setShowReminderForm(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
  console.error(err);
  setMessage(err?.response?.data?.message || 'Failed to create reminder. ❌');
}
  };

  const handleValueChange = (e) => {
    const val = e.target.value;

    if (val === '' || /^\d{0,5}$/.test(val)) {
      setFormData((p) => ({ ...p, value: val }));
    }
  };

  const handleTargetChange = (e) => {
    const val = e.target.value;

    if (val === '' || /^\d{0,5}$/.test(val)) {
      setFormData((p) => ({ ...p, target: val }));
    }
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
          <div
            className={`alert ${
              message.includes('✅') || message.includes('🔔')
                ? 'alert-success'
                : 'alert-error'
            }`}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Goal Form */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h3
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.2rem',
              }}
            >
              <Target size={22} color="var(--primary)" /> Log Today's Goal
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Type</label>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  {Object.entries(goalConfig).map(([type, config]) => (
                    <div
                      key={type}
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          goalType: type,
                          value: '',
                          target: '',
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: '1rem',
                        textAlign: 'center',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border:
                          formData.goalType === type
                            ? `2px solid ${config.color}`
                            : '2px solid var(--border)',
                        background:
                          formData.goalType === type
                            ? 'var(--bg-secondary)'
                            : '#fff',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '0.5rem',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {config.icon}
                      </div>

                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
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
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Target ({goalConfig[formData.goalType].unit})
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.target}
                    onChange={handleTargetChange}
                      maxLength={5}                
                    placeholder={`Optional. Default: ${defaults[formData.goalType]}`}
                  />
                </div>

                <div className="form-group">
                  <label>Actual Value Completed</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.value}
                    onChange={handleValueChange}
                      maxLength={5}                  
                    placeholder="e.g., 8000"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem' }}
                disabled={submitting}
              >
                {submitting ? 'Logging...' : 'Save Progress'}
              </button>
            </form>
          </div>

          {/* Reminder */}
          <div
            className="card"
            style={{
              alignSelf: 'start',
              border: showReminderForm
                ? '1px solid var(--primary-light)'
                : '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: showReminderForm ? '1.5rem' : '0',
              }}
            >
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.2rem',
                  margin: 0,
                }}
              >
                <BellPlus size={22} color="var(--accent)" />
                Preventive Care Reminder
              </h3>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => setShowReminderForm(!showReminderForm)}
              >
                {showReminderForm ? (
                  <>
                    <X size={16} /> Close
                  </>
                ) : (
                  <>
                    <CalendarPlus size={16} /> New Reminder
                  </>
                )}
              </button>
            </div>

            {showReminderForm && (
              <form onSubmit={handleCreateReminder}>
                <div className="form-group">
                  <label>Title</label>

                  <input
                    value={reminderForm.title}
                    onChange={(e) =>
                      setReminderForm((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>

                    <input
                      value={reminderForm.description}
                      onChange={(e) =>
                        setReminderForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>

                    <input
                      type="date"
                      value={reminderForm.dueDate}
                      onChange={(e) =>
                        setReminderForm((p) => ({
                          ...p,
                          dueDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '100%' }}
                >
                  Save Reminder
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Goal History */}
        <section>
          <h2
            style={{
              fontSize: '1.2rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Activity size={20} color="var(--primary)" /> Goal History Log
          </h2>

          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
              </div>
            ) : goals.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                No goals logged yet.
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
                      <td>{g.goalType}</td>
                      <td>{new Date(g.date).toLocaleDateString()}</td>
                      <td>{g.value}</td>
                      <td>{g.target}</td>
                      <td>
                        {g.met ? (
                          <span className="badge badge-success">
                            Goal Met
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            Missed
                          </span>
                        )}
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