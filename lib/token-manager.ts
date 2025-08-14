export class TokenManager {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(baseUrl: string, clientId: string, clientSecret: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  // ตรวจสอบ token ก่อนใช้งาน
  async validateTokenBeforeUse(token: string): Promise<string | null> {
    try {
      // ตรวจสอบว่า token หมดอายุหรือไม่ (basic check)
      const isExpired = this.isTokenExpired(token);

      if (isExpired) {
        console.log("🔄 Token expired, attempting refresh...");
        // Token หมดอายุ - ใช้ refresh token
        const newToken = await this.refreshAccessToken();
        return newToken;
      }

      return token;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      // Token ไม่ถูกต้อง - redirect ไป login
      this.redirectToLogin();
      return null;
    }
  }

  // ตรวจสอบ token expiration (basic check)
  private isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (ไม่ verify signature)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);

      // ตรวจสอบ expiration time
      if (payload.exp && payload.exp < now) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Failed to decode token:", error);
      return true; // ถ้า decode ไม่ได้ให้ถือว่าหมดอายุ
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.log("❌ No refresh token available");
      this.redirectToLogin();
      return null;
    }

    try {
      console.log("🔄 Refreshing access token...");

      const response = await fetch(`${this.baseUrl}/token`, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + btoa(`${this.clientId}:${this.clientSecret}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Refresh token failed:", error);
        throw new Error("Refresh token failed");
      }

      const tokenData = await response.json();
      console.log("✅ Token refresh successful");

      localStorage.setItem("access_token", tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem("refresh_token", tokenData.refresh_token);
      }

      return tokenData.access_token;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Refresh token หมดอายุ - redirect ไป login
      this.redirectToLogin();
      return null;
    }
  }

  redirectToLogin() {
    console.log("🔄 Redirecting to login...");

    // Clear tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("scope");
    localStorage.removeItem("oauth_state");

    // Redirect ไป login page
    window.location.href = "/login";
  }

  // ดึง JWKS (JSON Web Key Set)
  async getJWKS() {
    try {
      const response = await fetch(`${this.baseUrl}/.well-known/jwks.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch JWKS");
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Failed to fetch JWKS:", error);
      throw error;
    }
  }
}
