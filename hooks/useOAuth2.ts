import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { OAuth2Client } from "@/lib/oauth2-client";
import { SecureAPIClient } from "@/lib/secure-api-client";

// Import UserInfo interface from SecureAPIClient
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

// Singleton instances เพื่อป้องกันการสร้าง instances ใหม่ทุกครั้ง
let oauth2ClientInstance: OAuth2Client | null = null;
let apiClientInstance: SecureAPIClient | null = null;

function getOAuth2Client() {
  if (!oauth2ClientInstance) {
    oauth2ClientInstance = new OAuth2Client(
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET!,
      typeof window !== "undefined"
        ? `${window.location.origin}/oauth/callback`
        : "http://localhost:3000/oauth/callback",
      process.env.NEXT_PUBLIC_BACKEND_URL!
    );
  }
  return oauth2ClientInstance;
}

function getAPIClient() {
  if (!apiClientInstance) {
    apiClientInstance = new SecureAPIClient(
      process.env.NEXT_PUBLIC_BACKEND_URL!,
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET!
    );
  }
  return apiClientInstance;
}

export function useOAuth2() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ใช้ useMemo เพื่อสร้าง instances ที่ stable และไม่เปลี่ยนทุกครั้ง
  const oauth2Client = useMemo(() => getOAuth2Client(), []);
  const apiClient = useMemo(() => getAPIClient(), []);

  // ใช้ useRef เพื่อป้องกัน duplicate calls
  const hasCheckedAuth = useRef(false);

  // ตรวจสอบ authentication status
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAuthenticated(false);
      setUserInfo(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Checking authentication status...");
      const userInfo = await apiClient.getUserInfo();
      setUserInfo(userInfo);
      setIsAuthenticated(true);
      setError(null);
      console.log("✅ Authentication check successful");
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      setIsAuthenticated(false);
      setUserInfo(null);
      setError("Authentication failed");
      // Clear invalid tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  // Login ด้วย OAuth2
  const login = useCallback(
    (scopes: string[] = ["openid", "profile", "address", "email"]) => {
      console.log("🚀 Starting OAuth2 login...");
      oauth2Client.startAuthorization(scopes);
    },
    [oauth2Client]
  );

  // Logout with token revocation
  const logout = useCallback(async () => {
    console.log("🚪 Logging out...");

    try {
      // Revoke all tokens on the server
      await apiClient.revokeAllTokens();
    } catch (error) {
      console.error("❌ Token revocation failed:", error);
      // Even if revocation fails, clear local state
    }

    // Clear local state
    setIsAuthenticated(false);
    setUserInfo(null);
    setError(null);

    // Reset the flag when logging out
    hasCheckedAuth.current = false;
  }, [apiClient]);

  // Handle OAuth2 callback
  const handleCallback = useCallback(async () => {
    try {
      console.log("📥 Handling OAuth2 callback...");
      const tokenData = await oauth2Client.handleCallback();
      console.log("✅ OAuth2 callback successful");

      // ตรวจสอบ authentication หลังจากได้ token
      await checkAuth();

      return tokenData;
    } catch (error) {
      console.error("❌ OAuth2 callback failed:", error);
      setError(
        error instanceof Error ? error.message : "OAuth2 callback failed"
      );
      setIsAuthenticated(false);
      throw error;
    }
  }, [oauth2Client, checkAuth]);

  // Refresh user info
  const refreshUserInfo = useCallback(async () => {
    try {
      // Clear cache before refreshing to get fresh data
      apiClient.clearCache();
      const userInfo = await apiClient.getUserInfo();
      setUserInfo(userInfo);
      setError(null);
      return userInfo;
    } catch (error) {
      console.error("❌ Failed to refresh user info:", error);
      setError("Failed to refresh user information");
      throw error;
    }
  }, [apiClient]);

  // Refresh access token
  const refreshToken = useCallback(
    async (refreshToken?: string) => {
      try {
        console.log("🔄 Refreshing access token...");
        const tokenData = await apiClient.refreshAccessToken(refreshToken);

        // Update authentication state
        await checkAuth();

        return tokenData;
      } catch (error) {
        console.error("❌ Token refresh failed:", error);
        setError("Token refresh failed");
        setIsAuthenticated(false);
        throw error;
      }
    },
    [apiClient, checkAuth]
  );

  // Revoke specific tokens
  const revokeAccessToken = useCallback(
    async (accessToken?: string) => {
      try {
        await apiClient.revokeAccessToken(accessToken);
        console.log("✅ Access token revoked");
      } catch (error) {
        console.error("❌ Access token revocation failed:", error);
        throw error;
      }
    },
    [apiClient]
  );

  const revokeRefreshToken = useCallback(
    async (refreshToken?: string) => {
      try {
        await apiClient.revokeRefreshToken(refreshToken);
        console.log("✅ Refresh token revoked");
      } catch (error) {
        console.error("❌ Refresh token revocation failed:", error);
        throw error;
      }
    },
    [apiClient]
  );

  // Validate and refresh token if needed
  const validateAndRefreshToken = useCallback(async () => {
    try {
      const validToken = await apiClient.validateAndRefreshToken();
      if (validToken) {
        // Update authentication state if token was refreshed
        await checkAuth();
      }
      return validToken;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      setError("Token validation failed");
      setIsAuthenticated(false);
      return null;
    }
  }, [apiClient, checkAuth]);

  // ดึง OpenID configuration
  const getOpenIDConfig = useCallback(async () => {
    try {
      return await oauth2Client.getOpenIDConfiguration();
    } catch (error) {
      console.error("❌ Failed to get OpenID config:", error);
      throw error;
    }
  }, [oauth2Client]);

  // ดึง JWKS
  const getJWKS = useCallback(async () => {
    try {
      return await oauth2Client.getJWKS();
    } catch (error) {
      console.error("❌ Failed to get JWKS:", error);
      throw error;
    }
  }, [oauth2Client]);

  // Clear cache manually
  const clearCache = useCallback(() => {
    apiClient.clearCache();
  }, [apiClient]);

  useEffect(() => {
    // ป้องกันการเรียก checkAuth ซ้ำ
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  return {
    isAuthenticated,
    userInfo,
    loading,
    error,
    login,
    logout,
    handleCallback,
    refreshUserInfo,
    refreshToken,
    revokeAccessToken,
    revokeRefreshToken,
    validateAndRefreshToken,
    getOpenIDConfig,
    getJWKS,
    clearCache,
    apiClient,
  };
}
