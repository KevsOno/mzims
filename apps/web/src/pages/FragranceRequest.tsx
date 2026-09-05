import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import api from '../lib/api';

const FragranceRequest: React.FC = () => {
  const { user } = useAuth();
  const [requestText, setRequestText] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill contact email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setContact(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Fixed: Added trailing slash to match FastAPI route directly without 307 redirect
      await api.post('/requests/', {
        request_text: requestText,
        contact: contact,
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Request submission error:', error);
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to submit request. Please check your network connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-serif text-[#43408C]">Request Sent!</h2>
        <p className="text-[#4A4A4A] mt-2">We'll get back to you with recommendations soon.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-serif text-[#43408C] mb-4">Request a Scent</h1>
      <p className="text-[#4A4A4A] mb-6">
        Tell us what you're looking for – a specific fragrance, a note, a mood. We'll help you discover your perfect match.
      </p>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your Request</label>
          <textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            required
            rows={4}
            className="input-field"
            placeholder="E.g., I'm looking for a woody, warm scent similar to Tom Ford Oud Wood..."
          />
        </div>
        <div>
          <label className="label">Contact (email or phone)</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="input-field"
            placeholder="email@example.com or 080-1234-5678"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default FragranceRequest;
