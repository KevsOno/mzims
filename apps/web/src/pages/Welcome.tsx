import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';

const Welcome: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Force Supabase to evaluate current session/hash parameters upon mounting
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setVerifying(false);
        } else {
          // Brief timeout buffer to allow onAuthStateChange in AuthContext to process hash fragment
          const timer = setTimeout(() => {
            setVerifying(false);
          }, 1500);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Error verifying session on welcome page:', err);
        setVerifying(false);
      }
    };

    checkSession();
  }, []);

  // Handle redirect timer once user is fully resolved
  useEffect(() => {
    if (user && !verifying) {
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
  }, [user, verifying, navigate]);

  // Show spinner during initial AuthContext load or active session check
  if (authLoading || verifying) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#43408C] mx-auto"></div>
        <p className="mt-4 text-[#4A4A4A]">Verifying your email session...</p>
      </div>
    );
  }

  // Show failure state only after verification attempt finishes without a user
  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-16 text-center">
        <h1 className="text-3xl font-serif text-[#43408C]">Verification Failed</h1>
        <p className="text-[#4A4A4A] mt-4">
          We couldn't verify your email session. The link may have expired or was already used.
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
