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

  let response = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/refresh-token')) {
    try {
      // Attempt to refresh the token
      const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData.data.accessToken;
        
        // Save new token
        Cookies.set('token', newToken, { expires: 7, path: '/' });
        
        // Retry original request with new token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        
        response = await fetch(`${API_URL}${endpoint}`, {
          cache: 'no-store',
          ...options,
          headers: retryHeaders,
        });
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      // Refresh failed, clear and redirect
      Cookies.remove('token', { path: '/' });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
