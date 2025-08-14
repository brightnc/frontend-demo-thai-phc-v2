"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Trash2,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useOAuth2 } from "@/hooks/useOAuth2";

interface TestResult {
  type: "refresh" | "validate" | "revoke_access" | "revoke_refresh";
  success: boolean;
  data: Record<string, unknown> | { validToken: boolean } | null;
  message: string;
}

export default function TestTokensPage() {
  const {
    isAuthenticated,
    userInfo,
    refreshToken,
    revokeAccessToken,
    revokeRefreshToken,
    validateAndRefreshToken,
  } = useOAuth2();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ตรวจสอบ authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">ต้องเข้าสู่ระบบก่อน</h2>
          <p className="text-gray-600 mb-4">
            กรุณาเข้าสู่ระบบเพื่อทดสอบ token functions
          </p>
          <Button onClick={() => router.push("/")}>กลับหน้าหลัก</Button>
        </div>
      </div>
    );
  }

  const handleRefreshToken = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🔄 Testing refresh token...");
      const tokenData = await refreshToken();
      setResult({
        type: "refresh",
        success: true,
        data: tokenData,
        message: "Token refreshed successfully!",
      });
      console.log("✅ Refresh token test successful:", tokenData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Refresh token failed";
      setError(errorMessage);
      console.error("❌ Refresh token test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAndRefresh = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🔍 Testing validate and refresh token...");
      const validToken = await validateAndRefreshToken();
      setResult({
        type: "validate",
        success: true,
        data: { validToken: !!validToken },
        message: validToken
          ? "Token is valid and refreshed!"
          : "Token validation failed",
      });
      console.log("✅ Validate and refresh test successful:", validToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Validation failed";
      setError(errorMessage);
      console.error("❌ Validate and refresh test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccessToken = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🗑️ Testing revoke access token...");
      await revokeAccessToken();
      setResult({
        type: "revoke_access",
        success: true,
        data: null,
        message: "Access token revoked successfully!",
      });
      console.log("✅ Revoke access token test successful");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Revoke access token failed";
      setError(errorMessage);
      console.error("❌ Revoke access token test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRefreshToken = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🗑️ Testing revoke refresh token...");
      await revokeRefreshToken();
      setResult({
        type: "revoke_refresh",
        success: true,
        data: null,
        message: "Refresh token revoked successfully!",
      });
      console.log("✅ Revoke refresh token test successful");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Revoke refresh token failed";
      setError(errorMessage);
      console.error("❌ Revoke refresh token test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTokenInfo = () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const expiresIn = localStorage.getItem("expires_in");
    const scope = localStorage.getItem("scope");

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresIn: expiresIn ? parseInt(expiresIn) : null,
      scope: scope || "N/A",
      accessTokenLength: accessToken ? accessToken.length : 0,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
    };
  };

  const tokenInfo = getTokenInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Token Testing
              </h1>
              <p className="text-gray-600">
                ทดสอบ Refresh Token และ Token Revocation
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/me")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้าโปรไฟล์</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>ข้อมูล Token ปัจจุบัน</span>
              </CardTitle>
              <CardDescription>สถานะของ tokens ที่เก็บไว้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Access Token
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={
                        tokenInfo.hasAccessToken ? "default" : "secondary"
                      }
                    >
                      {tokenInfo.hasAccessToken ? "มี" : "ไม่มี"}
                    </Badge>
                    {tokenInfo.hasAccessToken && (
                      <span className="text-sm text-gray-600">
                        ({tokenInfo.accessTokenLength} chars)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Refresh Token
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={
                        tokenInfo.hasRefreshToken ? "default" : "secondary"
                      }
                    >
                      {tokenInfo.hasRefreshToken ? "มี" : "ไม่มี"}
                    </Badge>
                    {tokenInfo.hasRefreshToken && (
                      <span className="text-sm text-gray-600">
                        ({tokenInfo.refreshTokenLength} chars)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Expires In
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {tokenInfo.expiresIn
                      ? `${tokenInfo.expiresIn} วินาที`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Scope
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {tokenInfo.scope}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลผู้ใช้</CardTitle>
              <CardDescription>ผู้ใช้ที่กำลังทดสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              {userInfo && (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ชื่อ
                    </label>
                    <p className="text-gray-900">{userInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {userInfo.sub}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ประเภท
                    </label>
                    <Badge variant="secondary" className="uppercase">
                      {userInfo.user_type}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>ทดสอบ Token Functions</CardTitle>
              <CardDescription>เลือกฟังก์ชันที่ต้องการทดสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Refresh Token */}
                <Button
                  onClick={handleRefreshToken}
                  disabled={loading || !tokenInfo.hasRefreshToken}
                  className="flex items-center space-x-2 h-auto p-4"
                >
                  <RefreshCw className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Refresh Token</div>
                    <div className="text-sm opacity-80">
                      ใช้ refresh token เพื่อได้ access token ใหม่
                    </div>
                  </div>
                </Button>

                {/* Validate and Refresh */}
                <Button
                  onClick={handleValidateAndRefresh}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4"
                >
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Validate & Refresh</div>
                    <div className="text-sm opacity-80">
                      ตรวจสอบและ refresh token อัตโนมัติ
                    </div>
                  </div>
                </Button>

                {/* Revoke Access Token */}
                <Button
                  onClick={handleRevokeAccessToken}
                  disabled={loading || !tokenInfo.hasAccessToken}
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Trash2 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Revoke Access Token</div>
                    <div className="text-sm opacity-80">
                      ยกเลิก access token บน server
                    </div>
                  </div>
                </Button>

                {/* Revoke Refresh Token */}
                <Button
                  onClick={handleRevokeRefreshToken}
                  disabled={loading || !tokenInfo.hasRefreshToken}
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Revoke Refresh Token</div>
                    <div className="text-sm opacity-80">
                      ยกเลิก refresh token บน server
                    </div>
                  </div>
                </Button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">กำลังทดสอบ...</p>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="mt-6">
                  <Alert variant={result.success ? "default" : "destructive"}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{result.message}</div>
                      {result.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-6">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">เกิดข้อผิดพลาด</div>
                      <div className="mt-1">{error}</div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
