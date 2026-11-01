import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getAuthToken } from '../services/firebase';
import { kotlinAuthService } from '../services/kotlinApi';
import { DEMO_USERS } from '../data/demoUsers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const isAuth = localStorage.getItem('is_authenticated') === 'true';
    if (!isAuth) return null;

    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.warn('[AuthContext] Failed to parse auth_user from localStorage', e);
      }
    }
    const savedRole = localStorage.getItem('user_role');
    if (savedRole && DEMO_USERS[savedRole]) {
      return DEMO_USERS[savedRole];
    }
    return DEMO_USERS.student;
  });

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [role, setRole] = useState(() => {
    return localStorage.getItem('user_role') || 'student';
  });
  const [userProfile, setUserProfile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedByBackend, setVerifiedByBackend] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Directly fetches and verifies the user's role from the Kotlin backend.
   * Sends the Firebase ID Token / JWT via Authorization header.
   */
  const verifyRoleWithBackend = useCallback(async (tokenToVerify) => {
    setIsVerifying(true);
    setAuthError(null);

    const token = tokenToVerify || (await getAuthToken());

    if (!token) {
      setIsVerifying(false);
      setVerifiedByBackend(false);
      return;
    }

    try {
      const data = await kotlinAuthService.verifyUserRole(token);

      if (data && data.role) {
        const normalizedRole = data.role.toLowerCase();
        setRole(normalizedRole);
        setUserProfile(data.user || data);
        setVerifiedByBackend(true);
        localStorage.setItem('user_role', normalizedRole);
      }
    } catch (err) {
      console.warn(
        '[AuthContext] Kotlin backend role verification failed or backend is offline at http://localhost:8080/api:',
        err.message
      );
      setAuthError(err.message);
      setVerifiedByBackend(false);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Listen to Firebase Identity Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setAuthToken(idToken);
          localStorage.setItem('auth_token', idToken);
          await verifyRoleWithBackend(idToken);
        } catch (err) {
          console.error('[AuthContext] Failed to retrieve token from Firebase User:', err);
          setIsVerifying(false);
        }
      } else {
        const cachedToken = localStorage.getItem('auth_token');
        if (cachedToken) {
          await verifyRoleWithBackend(cachedToken);
        } else {
          setIsVerifying(false);
        }
      }
    });

    return () => unsubscribe();
  }, [verifyRoleWithBackend]);

  /**
   * Log into the platform with a specific demo role or custom profile
   */
  const login = useCallback((userOrRole) => {
    let targetProfile = userOrRole;
    if (typeof userOrRole === 'string') {
      targetProfile = DEMO_USERS[userOrRole.toLowerCase()] || DEMO_USERS.student;
    } else if (!userOrRole) {
      targetProfile = DEMO_USERS.student;
    }

    const normalizedRole = (targetProfile.role || 'student').toLowerCase();
    const finalProfile = { ...targetProfile, role: normalizedRole };

    setIsAuthenticated(true);
    setCurrentUser(finalProfile);
    setRole(normalizedRole);

    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('user_role', normalizedRole);
    localStorage.setItem('auth_user', JSON.stringify(finalProfile));

    return finalProfile;
  }, []);

  /**
   * Sign out of the platform, clearing persistence and resetting to login state
   */
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_token');
  }, []);

  /**
   * Allows role switching for preview & testing while maintaining role persistence
   */
  const switchRole = useCallback((newRole) => {
    const normalized = (newRole || 'student').toLowerCase();
    const matchingProfile = DEMO_USERS[normalized] || {
      id: normalized,
      role: normalized,
      name: normalized.toUpperCase(),
      email: `${normalized}@levelup.edu`
    };

    setRole(normalized);
    setCurrentUser(matchingProfile);
    localStorage.setItem('user_role', normalized);
    localStorage.setItem('auth_user', JSON.stringify(matchingProfile));
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    login,
    logout,
    firebaseUser,
    authToken,
    role,
    userProfile,
    isVerifying,
    verifiedByBackend,
    authError,
    verifyRoleWithBackend,
    switchRole,
    setRole: switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
