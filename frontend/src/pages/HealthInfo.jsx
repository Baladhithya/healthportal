import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, CheckCircle2, ShieldCheck, Dumbbell, Droplet, Moon, Brain, Apple, Stethoscope } from 'lucide-react';

const HealthInfo = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        padding: '1.25rem 3rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={24} color="#fff" />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>HealthPortal</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/home" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                Join HealthPortal
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Content ────────────────────────────────────── */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Health Information & Resources
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Essential wellness strategies, preventive care guidelines, and security policies to keep you and your robust health data safe.
          </p>
        </div>

        {/* General Health Tips */}
        <section className="card" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
            <Stethoscope size={24} /> General Wellness Advice
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Dumbbell size={24} color="var(--primary)" />, title: 'Daily Exercise', text: 'Aim for at least 150 minutes of moderate activity per week.' },
              { icon: <Droplet size={24} color="var(--info)" />, title: 'Stay Hydrated', text: 'Drink at least 8 glasses of water daily for optimal function.' },
              { icon: <Moon size={24} color="var(--secondary)" />, title: 'Quality Sleep', text: 'Get 7-9 hours of restful sleep every night to recharge.' },
              { icon: <Apple size={24} color="var(--success)" />, title: 'Balanced Nutrition', text: 'Incorporate plenty of fruits, vegetables, and lean proteins.' },
              { icon: <Brain size={24} color="#8b5cf6" />, title: 'Mental Wellness', text: 'Prioritize breaks and practice stress-management.' }
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ padding: '0.75rem', background: '#fff', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                  {tip.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{tip.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preventive Care Guide */}
        <section className="card" style={{ marginBottom: '2.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
              <CheckCircle2 size={24} /> Recommended Preventive Care
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>General guidelines tailored by medical experts.</p>
          </div>
          
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Medical Checkup / Screening</th>
                <th>Frequency</th>
                <th>Recommended Ages</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Blood Pressure Screening', 'Annually', '18+'],
                ['Cholesterol Check', 'Every 4-6 years', '20+'],
                ['Diabetes Screening', 'Every 3 years', '45+'],
                ['Dental & Eye Exam', 'Annually', 'All ages'],
                ['Routine Immunizations', 'Annually (Flu)', '6 months+'],
              ].map(([name, freq, age], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{freq}</td>
                  <td><span className="badge badge-info">{age}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Privacy Policy */}
        <section className="card" style={{ background: 'linear-gradient(to right, #ffffff, var(--bg-primary))' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
            <ShieldCheck size={24} /> Privacy & Security Policy
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p>
              HealthPortal handles your personal health information with the utmost strictness and in absolute accordance with 
              <strong style={{ color: 'var(--text-primary)' }}> HIPAA</strong> guidelines.
            </p>
            
            <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>Encryption & Security</h4>
              <p>All data is dynamically encrypted in-transit leveraging modern TLS/HTTPS. Passwords and credentials are securely hashed. We enforce Role-Based Access Controls alongside JWT authentication to verify session validity dynamically.</p>
            </div>
            
            <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>Data Visibility Guarantee</h4>
              <p>Patients have exclusive rights over their medical profile. Assigned healthcare providers can only read specific compliance metrics under strict audit-logged conditions to facilitate ongoing preventive care.</p>
            </div>

            <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>Two-Factor Authentication</h4>
              <p>We actively support Time-based One Time Passwords (TOTP) through modern Authenticator apps. Enable this within your dashboard for uncompromising protection against unauthorized access.</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <HeartPulse size={16} /> <strong>HealthPortal MV</strong>
        </div>
        © {new Date().getFullYear()} Modern Healthcare Dynamics. All rights reserved. Built with security and privacy in mind.
      </footer>
    </div>
  );
};

export default HealthInfo;
