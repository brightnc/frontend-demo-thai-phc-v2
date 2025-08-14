import { TokenManager } from "./token-manager";

// Type definitions
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

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

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class SecureAPIClient {
  private tokenManager: TokenManager;
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

  constructor(baseUrl: string, clientId: string, clientSecret: string) {
    this.tokenManager = new TokenManager(baseUrl, clientId, clientSecret);
    this.baseUrl = baseUrl;
  }

  // ตรวจสอบ cache
  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Using cached data for: ${key}`);
      return cached.data;
    }
    return null;
  }

  // เก็บข้อมูลใน cache
  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log(`💾 Cached data for: ${key}`);
  }

  // ล้าง cache
  clearCache(): void {
    this.cache.clear();
    console.log("🗑️ Cache cleared");
  }

  // เรียก API พร้อม token verification
  async callAPI(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("❌ No access token found");
      this.tokenManager.redirectToLogin();
      return null;
    }

    // Verify token ก่อนเรียก API
    const validToken = await this.tokenManager.validateTokenBeforeUse(token);
    if (!validToken) {
      console.log("❌ Token validation failed");
      return null;
    }

    try {
      console.log(`🌐 Calling API: ${endpoint}`);

      // เรียก API
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${validToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Handle response
      if (response.status === 401) {
        console.log("❌ API returned 401, attempting token refresh...");
        // Backend reject token - refresh หรือ redirect
        const newToken = await this.tokenManager.refreshAccessToken();
        if (newToken) {
          // Retry with new token
          console.log("🔄 Retrying API call with new token...");
          return this.callAPI(endpoint, options);
        }
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ API call failed (${response.status}):`, error);
        throw new Error(`API call failed: ${error.detail || error.message}`);
      }

      const data = await response.json();
      console.log(`✅ API call successful: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API call error: ${endpoint}`, error);
      throw error;
    }
  }

  // เรียก UserInfo endpoint พร้อม cache
  async getUserInfo(): Promise<UserInfo> {
    const cacheKey = "userinfo";
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      return cachedData as UserInfo;
    }

    const data = await this.callAPI("/api/v1/auth/userinfo");
    this.setCachedData(cacheKey, data);
    return data as UserInfo;
  }

  // เรียก Client Scopes endpoint
  async getClientScopes(clientId: string): Promise<unknown> {
    return await this.callAPI(`/client-scopes/${clientId}`);
  }

  // เรียก API อื่นๆ ตามต้องการ
  async getProfile(): Promise<unknown> {
    return await this.callAPI("/profile");
  }

  async updateProfile(data: Record<string, unknown>): Promise<unknown> {
    // ล้าง cache เมื่อ update ข้อมูล
    this.clearCache();
    return await this.callAPI("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ===== Refresh Token Flow =====

  // ใช้ refresh token เพื่อได้ access token ใหม่
  async refreshAccessToken(refreshToken?: string): Promise<TokenResponse> {
    const tokenToUse = refreshToken || localStorage.getItem("refresh_token");

    if (!tokenToUse) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Refreshing access token...");

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}:${process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET}`
          )}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokenToUse,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Refresh token failed:", error);
        throw new Error(
          `Refresh token failed: ${error.detail || error.message}`
        );
      }

      const tokenData: TokenResponse = await response.json();
      console.log("✅ Token refresh successful");

      // เก็บ tokens ใหม่
      localStorage.setItem("access_token", tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem("refresh_token", tokenData.refresh_token);
      }
      localStorage.setItem("token_type", tokenData.token_type);
      localStorage.setItem(
        "expires_in",
        tokenData.expires_in?.toString() || ""
      );
      localStorage.setItem("scope", tokenData.scope || "");

      // ล้าง cache เมื่อได้ token ใหม่
      this.clearCache();

      return tokenData;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      throw error;
    }
  }

  // ===== Token Revocation =====

  // Revoke access token
  async revokeAccessToken(accessToken?: string): Promise<void> {
    const tokenToRevoke = accessToken || localStorage.getItem("access_token");

    if (!tokenToRevoke) {
      throw new Error("No access token to revoke");
    }

    console.log("🗑️ Revoking access token...");

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}:${process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET}`
          )}`,
        },
        body: new URLSearchParams({
          token: tokenToRevoke,
          token_type_hint: "access_token",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Token revocation failed:", error);
        throw new Error(
          `Token revocation failed: ${error.detail || error.message}`
        );
      }

      console.log("✅ Access token revoked successfully");

      // ลบ access token จาก localStorage
      localStorage.removeItem("access_token");
    } catch (error) {
      console.error("❌ Token revocation failed:", error);
      throw error;
    }
  }

  // Revoke refresh token
  async revokeRefreshToken(refreshToken?: string): Promise<void> {
    const tokenToRevoke = refreshToken || localStorage.getItem("refresh_token");

    if (!tokenToRevoke) {
      throw new Error("No refresh token to revoke");
    }

    console.log("🗑️ Revoking refresh token...");

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}:${process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET}`
          )}`,
        },
        body: new URLSearchParams({
          token: tokenToRevoke,
          token_type_hint: "refresh_token",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Token revocation failed:", error);
        throw new Error(
          `Token revocation failed: ${error.detail || error.message}`
        );
      }

      console.log("✅ Refresh token revoked successfully");

      // ลบ refresh token จาก localStorage
      localStorage.removeItem("refresh_token");
    } catch (error) {
      console.error("❌ Token revocation failed:", error);
      throw error;
    }
  }

  // Revoke both tokens (logout)
  async revokeAllTokens(): Promise<void> {
    console.log("🚪 Revoking all tokens (logout)...");

    try {
      // Revoke access token
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        await this.revokeAccessToken(accessToken);
      }

      // Revoke refresh token
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await this.revokeRefreshToken(refreshToken);
      }

      // Clear all tokens from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("expires_in");
      localStorage.removeItem("scope");
      localStorage.removeItem("oauth_state");

      // Clear cache
      this.clearCache();

      console.log("✅ All tokens revoked successfully");
    } catch (error) {
      console.error("❌ Token revocation failed:", error);
      // Even if revocation fails, clear local storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("expires_in");
      localStorage.removeItem("scope");
      localStorage.removeItem("oauth_state");
      this.clearCache();
      throw error;
    }
  }

  // ===== Token Management =====

  // ตรวจสอบ token expiration
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch (error) {
      console.error("❌ Failed to decode token:", error);
      return true;
    }
  }

  // ตรวจสอบ token ก่อนใช้งาน
  async validateAndRefreshToken(): Promise<string | null> {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken) {
      console.log("❌ No access token found");
      return null;
    }

    // ตรวจสอบว่า access token หมดอายุหรือไม่
    if (this.isTokenExpired(accessToken)) {
      console.log("🔄 Access token expired, refreshing...");

      if (!refreshToken) {
        console.log("❌ No refresh token available");
        return null;
      }

      try {
        const tokenData = await this.refreshAccessToken(refreshToken);
        return tokenData.access_token;
      } catch (error) {
        console.error("❌ Token refresh failed:", error);
        return null;
      }
    }

    return accessToken;
  }
}
