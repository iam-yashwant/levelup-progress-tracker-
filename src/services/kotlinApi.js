import axios from 'axios';
import { getAuthToken } from './firebase';

/**
 * Base Axios instance pointing to the Kotlin Backend API.
 * Default: http://localhost:8080/api
 */
const kotlinApi = axios.create({
  baseURL: import.meta.env.VITE_KOTLIN_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

/**
 * Authorization Request Interceptor:
 * Attaches the Firebase ID Token / JWT (Authorization: Bearer <token>) to every outgoing request.
 */
kotlinApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[Kotlin API Client] Failed to attach Bearer Authorization token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Handles centralized errors (e.g. 401 Unauthorized or 403 Forbidden responses).
 */
kotlinApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[Kotlin API Client] 401 Unauthorized: Session expired or invalid token.');
    } else if (error.response?.status === 403) {
      console.warn('[Kotlin API Client] 403 Forbidden: Insufficient permissions for requested resource.');
    }
    return Promise.reject(error);
  }
);

/**
 * Dedicated Kotlin Auth API endpoints for role verification and token lifecycle.
 */
export const kotlinAuthService = {
  /**
   * Verifies the user's token directly against the Kotlin backend and returns role & profile details.
   * Expected response: { uid, email, role: 'Student' | 'Faculty' | 'Mentor' | 'Parent', permissions: [...] }
   */
  verifyUserRole: async (tokenOverride = null) => {
    const config = {};
    if (tokenOverride) {
      config.headers = { Authorization: `Bearer ${tokenOverride}` };
    }
    const response = await kotlinApi.get('/auth/verify', config);
    return response.data;
  },

  /**
   * Fetches the current authenticated user's profile and verified role from Kotlin backend.
   */
  getCurrentUser: async () => {
    const response = await kotlinApi.get('/auth/me');
    return response.data;
  },

  /**
   * Exchanges Firebase ID Token for a Kotlin backend issued custom JWT.
   */
  exchangeToken: async (firebaseIdToken) => {
    const response = await kotlinApi.post('/auth/exchange-token', {
      firebaseToken: firebaseIdToken,
    });
    return response.data;
  },
};

export default kotlinApi;
