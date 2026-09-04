import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { CheckCircle } from 'lucide-react';

const Welcome: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Once the user is authenticated (email confirmed), start countdown
  useEffect(() => {
    if (user) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [user, navigate]);

  // If still loading or not authenticated yet, show a spinner
  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#43408C] mx-auto"></div>
        <p className="mt-4 text-[#4A4A4A]">Verifying your email...</p>
      </div>
    );
  }

  // If not authenticated after loading, maybe the confirmation failed.
  // We'll show a message and a link to try again or contact support.
  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-serif text-[#43408C]">Verification Failed</h1>
        <p className="text-[#4A4A4A] mt-4">
          We couldn't verify your email. The link may have expired or been used already.
        </p>
        <Link to="/login" className="mt-6 btn-primary inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16 text-center">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
      <h1 className="text-3xl font-serif text-[#43408C]">Email Verified!</h1>
      <p className="text-[#4A4A4A] mt-2">
        Your email has been successfully confirmed. Welcome to Muzoscent!
      </p>
      <p className="text-sm text-[#4A4A4A] mt-4">
        You will be redirected to the homepage in <span className="font-bold">{countdown}</span> seconds.
      </p>
      <Link to="/" className="mt-6 btn-primary inline-block">
        Start Shopping
      </Link>
    </div>
  );
};

export default Welcome;
