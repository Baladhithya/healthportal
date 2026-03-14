import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    role: 'patient',
    consentGiven: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.consentGiven) {
      setError('You must consent to data collection to register.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error ||
        err.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}>🏥</div>
            <span className={styles.authLogoText}>HealthPortal</span>
          </div>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Join the wellness community</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Role Tabs */}
        <div className={styles.roleTabs}>
          <button
            type="button"
            className={`${styles.roleTab} ${formData.role === 'patient' ? styles.roleTabActive : ''}`}
            onClick={() => setFormData((prev) => ({ ...prev, role: 'patient' }))}
          >
            🩺 Patient
          </button>
          <button
            type="button"
            className={`${styles.roleTab} ${formData.role === 'provider' ? styles.roleTabActive : ''}`}
            onClick={() => setFormData((prev) => ({ ...prev, role: 'provider' }))}
          >
            👨‍⚕️ Provider
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          {/* Consent Checkbox */}
          <div className={styles.consentGroup}>
            <input
              id="consent"
              name="consentGiven"
              type="checkbox"
              checked={formData.consentGiven}
              onChange={handleChange}
            />
            <label htmlFor="consent" className={styles.consentText}>
              I consent to the collection and processing of my health data as
              described in the <Link to="/health-info">Privacy Policy</Link>.
              I understand that my data will be stored securely and used solely
              for providing wellness and preventive care services.
            </label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
