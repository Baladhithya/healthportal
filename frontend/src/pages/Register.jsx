import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import { Mail, Lock, User, Calendar, HeartPulse, Building } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    hospitalName: '',
    role: 'patient',
    consentGiven: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard} style={{ maxWidth: '550px' }}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}><HeartPulse color="#fff" size={28} /></div>
          </div>
          <h1 className={styles.authTitle}>Create an Account</h1>
          <p className={styles.authSubtitle}>Join HealthPortal today.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.roleTabs}>
          <button
            className={`${styles.roleTab} ${formData.role === 'patient' ? styles.roleTabActive : ''}`}
            onClick={() => setFormData({ ...formData, role: 'patient' })}
          >
            Patient
          </button>
          <button
            className={`${styles.roleTab} ${formData.role === 'provider' ? styles.roleTabActive : ''}`}
            onClick={() => setFormData({ ...formData, role: 'provider' })}
          >
            Healthcare Provider
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="firstName">First Name</label>
              <div style={{ position: 'relative' }}>
                <User className={styles.inputIcon} size={18} />
                <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="lastName">Last Name</label>
              <div style={{ position: 'relative' }}>
                <User className={styles.inputIcon} size={18} />
                <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail className={styles.inputIcon} size={18} />
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <Calendar className={styles.inputIcon} size={18} />
                <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
          </div>

          <div className={`form-group ${styles.inputWrapper}`}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className={styles.inputIcon} size={18} />
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars, 1 uppercase, 1 number" required style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          {formData.role === 'provider' && (
            <div className={`form-group ${styles.inputWrapper}`}>
              <label htmlFor="hospitalName">Hospital / Clinic Name</label>
              <div style={{ position: 'relative' }}>
                <Building className={styles.inputIcon} size={18} />
                <input id="hospitalName" name="hospitalName" type="text" value={formData.hospitalName} onChange={handleChange} placeholder="e.g., General Hospital" required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
          )}

          <div className={styles.consentGroup}>
            <input id="consentGiven" name="consentGiven" type="checkbox" checked={formData.consentGiven} onChange={handleChange} required />
            <label htmlFor="consentGiven" className={styles.consentText}>
              I consent to the collection and processing of my health information as outlined in the <Link to="/health-info" target="_blank">Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
