import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import GoalTracker from './pages/GoalTracker';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import HealthInfo from './pages/HealthInfo';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/health-info" element={<HealthInfo />} />

          {/* Protected Common */}
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={['patient', 'provider']}>
              <Home />
            </ProtectedRoute>
          } />

          {/* Patient Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <GoalTracker />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['patient', 'provider']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Provider Routes */}
          <Route path="/provider" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
