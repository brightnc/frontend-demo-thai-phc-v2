export class OAuth2Client {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    baseUrl: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.baseUrl = baseUrl;
  }

  // 1. เริ่ม OAuth2 flow
  startAuthorization(scopes: string[] = ["openid", "profile"]) {
    const state = this.generateState();
    const scope = scopes.join(" ");

    const authUrl =
      `${this.baseUrl}/api/v1/auth/authorize?` +
      new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: scope,
        state: state,
      });

    // เก็บ state ไว้ตรวจสอบ
    localStorage.setItem("oauth_state", state);

    console.log("🔗 Starting OAuth2 authorization:", authUrl);

    // Redirect ไป authorization page
    window.location.href = authUrl;
  }

  // 2. Handle callback จาก authorization
  async handleCallback(): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  }> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    console.log("📥 OAuth2 callback received:", { code: !!code, state, error });

    // ตรวจสอบ state
    const savedState = localStorage.getItem("oauth_state");
    if (state !== savedState) {
      throw new Error("State mismatch - possible CSRF attack");
    }

    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    if (!code) {
      throw new Error("No authorization code received");
    }

    // 3. Exchange code สำหรับ access token
    return await this.exchangeCodeForToken(code);
  }

  // 3. Exchange authorization code สำหรับ access token
  async exchangeCodeForToken(code: string) {
    console.log("🔄 Exchanging code for token...");

    const response = await fetch(`${this.baseUrl}/api/v1/auth/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${this.clientId}:${this.clientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Token exchange failed:", error);
      throw new Error(
        `Token exchange failed: ${error.detail || error.message}`
      );
    }

    const tokenData = await response.json();
    console.log("✅ Token exchange successful");

    // เก็บ tokens
    localStorage.setItem("access_token", tokenData.access_token);
    localStorage.setItem("refresh_token", tokenData.refresh_token);
    localStorage.setItem("token_type", tokenData.token_type);
    localStorage.setItem("expires_in", tokenData.expires_in?.toString() || "");
    localStorage.setItem("scope", tokenData.scope || "");

    // ลบ state หลังจากใช้แล้ว
    localStorage.removeItem("oauth_state");

    return tokenData;
  }

  generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // ดึง OpenID Connect configuration
  async getOpenIDConfiguration() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/auth/.well-known/openid_configuration`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch OpenID configuration");
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Failed to fetch OpenID configuration:", error);
      throw error;
    }
  }

  // ดึง JWKS (JSON Web Key Set)
  async getJWKS() {
    try {
      const config = await this.getOpenIDConfiguration();
      const response = await fetch(config.jwks_uri);
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
