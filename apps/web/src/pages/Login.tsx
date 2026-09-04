import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-2xl font-serif text-[#43408C] mb-4">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>
        <p className="mt-4 text-sm text-[#4A4A4A]">
  Don't have an account? <Link to="/register" className="text-[#43408C] font-semibold">Sign up</Link>
</p>
      </form>
    </div>
  );
};

export default Login;
