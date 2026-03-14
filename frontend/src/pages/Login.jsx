import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import { ShieldCheck, Mail, Lock, HeartPulse } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login, validate2FA } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.requires2FA) {
        setRequires2FA(true);
        setUserId(data.userId);
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await validate2FA(userId, twoFactorCode);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid authentication code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}><HeartPulse color="#fff" size={28} /></div>
          </div>
          <h1 className={styles.authTitle}>HealthPortal</h1>
          <p className={styles.authSubtitle}>
            {requires2FA ? 'Two-Factor Authentication' : 'Welcome back to your wellness journey'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!requires2FA ? (
          <form onSubmit={handleLoginSubmit}>
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit}>
            <div className={styles.twoFactorIconWrap}>
              <ShieldCheck size={48} color="var(--primary)" />
            </div>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Please enter the 6-digit confirmation code from your authenticator app.
            </p>
            <div className="form-group">
              <input
                id="twoFactorCode"
                type="text"
                maxLength="6"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', padding: '1rem' }}
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || twoFactorCode.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Secure Login'}
            </button>
            <button 
              type="button" 
              className={`btn btn-secondary ${styles.submitBtn}`} 
              onClick={() => { setRequires2FA(false); setTwoFactorCode(''); }}
              style={{ marginTop: '0.5rem' }}
            >
              Back to Login
            </button>
          </form>
        )}

        {!requires2FA && (
          <div className={styles.authFooter}>
            Don't have an account? <Link to="/register">Create one now</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
