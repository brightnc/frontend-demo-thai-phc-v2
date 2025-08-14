"use client";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { OAuth2Client } from "@/lib/oauth2-client";

export default function SSOLoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const redirectUri = `${window.location.origin}/oauth/callback`;

    // Debug: แสดง environment variables ทั้งหมด
    console.log("=== Environment Variables Debug ===");
    console.log("NEXT_PUBLIC_OAUTH_CLIENT_ID:", clientId);
    console.log("NEXT_PUBLIC_BACKEND_URL:", backendUrl);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Current URL:", window.location.href);
    console.log("===================================");

    // ตรวจสอบ environment variables
    if (!clientId) {
      console.error("❌ NEXT_PUBLIC_OAUTH_CLIENT_ID is not defined");
      console.error("Please check your .env.local file");
      alert(
        "OAuth configuration is missing.\n\n" +
          "Please check:\n" +
          "1. .env.local file exists in project root\n" +
          "2. NEXT_PUBLIC_OAUTH_CLIENT_ID is set\n" +
          "3. Development server is restarted\n\n" +
          "See console for more details."
      );
      return;
    }

    if (!backendUrl) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL is not defined");
      alert("Backend URL is missing. Please check your .env.local file");
      return;
    }

    if (!clientSecret) {
      console.error("❌ NEXT_PUBLIC_OAUTH_CLIENT_SECRET is not defined");
      alert("Client secret is missing. Please check your .env.local file");
      return;
    }

    console.log("✅ OAuth Parameters:", {
      clientId,
      redirectUri,
      backendUrl,
    });

    try {
      // สร้าง OAuth2Client และเริ่ม authorization flow
      const oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri,
        backendUrl
      );

      // เริ่ม OAuth2 authorization flow
      oauth2Client.startAuthorization([
        "openid",
        "profile",
        "address",
        "email",
      ]);
    } catch (error) {
      console.error("❌ Failed to start OAuth2 flow:", error);
      alert("Failed to start OAuth2 flow. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <Shield className="w-5 h-5" />
      <span>เข้าสู่ระบบด้วย SSO</span>
      <ArrowRight className="w-5 h-5" />
    </Button>
  );
}

