import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Adjust path to your Supabase client

type ResetStep = 'REQUEST_OTP' | 'VERIFY_OTP' | 'NEW_PASSWORD';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<ResetStep>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // STEP 1: Request 6-Digit OTP via Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setMessage(`A 6-digit code has been sent to ${email}`);
      setStep('VERIFY_OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify the 6-digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'recovery',
      });

      if (error) throw error;

      setMessage('Code verified! Please enter your new password.');
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Set New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-serif text-[#43408C] mb-2">Reset Password</h1>

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

      {/* STEP 1: Enter Email */}
      {step === 'REQUEST_OTP' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <p className="text-sm text-[#4A4A4A] mb-4">
            Enter your account email to receive a 6-digit password reset code.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#43408C]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#43408C] text-white font-medium rounded-md hover:bg-[#2D2A6E] transition disabled:opacity-50"
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>
      )}

      {/* STEP 2: Enter OTP */}
      {step === 'VERIFY_OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-[#4A4A4A] mb-4">
            Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1">Verification Code (OTP)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              placeholder="123456"
              className="w-full p-2 text-center tracking-widest text-lg font-bold border border-gray-200 rounded-md focus:outline-none focus:border-[#43408C]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#43408C] text-white font-medium rounded-md hover:bg-[#2D2A6E] transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => setStep('REQUEST_OTP')}
            className="w-full text-xs text-gray-500 hover:underline text-center block mt-2"
          >
            Resend Code / Change Email
          </button>
        </form>
      )}

      {/* STEP 3: Enter New Password */}
      {step === 'NEW_PASSWORD' && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#43408C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#43408C]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#43408C] text-white font-medium rounded-md hover:bg-[#2D2A6E] transition disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-[#4A4A4A] text-center">
        Remember your password?{' '}
        <Link to="/login" className="text-[#43408C] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
