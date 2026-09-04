import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-serif text-[#43408C] mb-2">Forgot Password?</h1>
      <p className="text-sm text-[#4A4A4A] mb-6">
        Enter your registered email address and we'll send you instructions to reset your password.
      </p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="input-field w-full p-2 border rounded-md"
          />
        </div>

        <button type="submit" className="btn-primary w-full py-2 bg-[#43408C] text-white rounded-md hover:bg-[#2D2A6E] transition" disabled={loading}>
          {loading ? 'Sending Instructions...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#4A4A4A] text-center">
        Remember your password?{' '}
        <Link to="/login" className="text-[#43408C] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
