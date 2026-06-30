import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock, Leaf } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const { isAuthed, login } = useAdminAuth();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthed) {
    const from = location.state?.from || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Incorrect password. Try again.');
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 60%, #4A7A4A 100%)',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', padding: '44px 36px',
        width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--cream)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Leaf size={26} color="var(--forest)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--soil)' }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
            This area is restricted to farm administrators only.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Unlock Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}
