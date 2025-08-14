import { useState, useEffect, useCallback } from 'react';

interface UserInfo {
  sub: string;
  name: string;
  user_type: string;
  osm_code: string;
  province_code: string;
  province_name: string;
  district_code: string;
  district_name: string;
  subdistrict_code: string;
  subdistrict_name: string;
  email: string | null;
  client_id: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/userinfo`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsAuthenticated(true);
        setError(null);
      } else {
        throw new Error('Failed to fetch user info');
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to fetch user information');
      setIsAuthenticated(false);
    }
  }, []);

  const checkLoginStatus = useCallback(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthenticated(true);
      fetchUserInfo(accessToken);
    } else {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
    setIsLoading(false);
  }, [fetchUserInfo]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('scope');
    setIsAuthenticated(false);
    setUserInfo(null);
    setError(null);
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return {
    isAuthenticated,
    userInfo,
    isLoading,
    error,
    logout,
    refreshAuth: checkLoginStatus,
  };
} 