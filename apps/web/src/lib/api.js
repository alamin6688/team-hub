import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020/api/v1';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = Cookies.get('token');
  
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized (maybe redirect to login or clear cookies)
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return;
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
