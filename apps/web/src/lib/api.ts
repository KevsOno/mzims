import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://muzoscent.onrender.com/api/v1/';


const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use(async (config) => {
  const { supabase } = await import('./supabase');
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
