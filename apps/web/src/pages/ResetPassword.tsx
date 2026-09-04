import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', { token, password });
      alert('Password successfully updated! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-serif text-[#43408C] mb-2">Reset Password</h1>
      <p className="text-sm text-[#4A4A4A] mb-6">Please enter your new password below.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="input-field w-full p-2 border rounded-md"
          />
        </div>

        <button type="submit" className="btn-primary w-full py-2 bg-[#43408C] text-white rounded-md hover:bg-[#2D2A6E] transition" disabled={loading}>
          {loading ? 'Updating Password...' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#4A4A4A] text-center">
        Back to{' '}
        <Link to="/login" className="text-[#43408C] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
