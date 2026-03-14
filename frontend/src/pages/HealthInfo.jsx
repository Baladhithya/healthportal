import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HealthInfo = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏥</span>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>HealthPortal</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <Link to={user.role === 'provider' ? '/provider' : '/dashboard'} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 500 }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Content ────────────────────────────────────── */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>Health Information</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          General wellness tips and important health policy information
        </p>

        {/* General Health Tips */}
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🌿 General Health Tips</h2>
          <ul style={{ listStyle: 'none', display: 'grid', gap: '0.75rem' }}>
            {[
              { icon: '🏃', text: 'Aim for at least 150 minutes of moderate exercise per week.' },
              { icon: '🥗', text: 'Eat a balanced diet rich in fruits, vegetables, and whole grains.' },
              { icon: '💤', text: 'Get 7-9 hours of quality sleep each night.' },
              { icon: '💧', text: 'Stay hydrated — drink at least 8 glasses of water daily.' },
              { icon: '🧠', text: 'Prioritize mental health with regular breaks and stress-management techniques.' },
              { icon: '🚭', text: 'Avoid smoking and limit alcohol consumption.' },
              { icon: '🧼', text: 'Wash hands frequently to prevent infections.' },
            ].map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Preventive Care Guide */}
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📋 Preventive Care Guide</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Checkup</th>
                  <th>Frequency</th>
                  <th>Ages</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Blood Pressure Screening', 'Annually', '18+'],
                  ['Cholesterol Check', 'Every 4-6 years', '20+'],
                  ['Diabetes Screening', 'Every 3 years', '45+'],
                  ['Dental Exam', 'Every 6 months', 'All ages'],
                  ['Eye Exam', 'Every 1-2 years', '18+'],
                  ['Flu Shot', 'Annually', '6 months+'],
                  ['Mammogram', 'Every 1-2 years', '40+'],
                  ['Colonoscopy', 'Every 10 years', '45+'],
                ].map(([name, freq, age], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td>{freq}</td>
                    <td><span className="badge badge-info">{age}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🔒 Privacy Policy</h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>
              HealthPortal is committed to protecting your health information in accordance with
              HIPAA (Health Insurance Portability and Accountability Act) guidelines.
            </p>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Data Collection</h4>
            <p style={{ marginBottom: '1rem' }}>
              We collect only the minimum necessary health information to provide our wellness
              and preventive care services. This includes basic health metrics, allergies,
              medications, and wellness goal data.
            </p>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Data Security</h4>
            <p style={{ marginBottom: '1rem' }}>
              All data is encrypted in transit (TLS/HTTPS) and at rest (AES-256). Passwords are
              hashed using bcrypt. Access is controlled through JWT authentication and
              role-based permissions.
            </p>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Data Access</h4>
            <p style={{ marginBottom: '1rem' }}>
              Patients can only access their own data. Healthcare providers can only view data
              for patients assigned to them. All data access events are logged for audit purposes.
            </p>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Rights</h4>
            <p>
              You have the right to view, modify, and request deletion of your personal health
              information. Contact your healthcare provider or our support team for assistance.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
      }}>
        © {new Date().getFullYear()} HealthPortal. All rights reserved. |{' '}
        Built with security and privacy in mind.
      </footer>
    </div>
  );
};

export default HealthInfo;
