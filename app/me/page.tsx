"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, User, MapPin, Building, Hash, Shield } from "lucide-react";
import { useOAuth2 } from "@/hooks/useOAuth2";

export default function MePage() {
  const { isAuthenticated, userInfo, loading, error, logout, refreshUserInfo } =
    useOAuth2();
  const router = useRouter();

  useEffect(() => {
    // ถ้าไม่ได้ login ให้ redirect ไปหน้า login
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, redirect to home
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>กลับหน้าหลัก</Button>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>ไม่พบข้อมูลผู้ใช้</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ข้อมูลผู้ใช้</h1>
          <div className="flex gap-2">
            <Button
              onClick={refreshUserInfo}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>รีเฟรช</span>
            </Button>
            <Button
              onClick={() => router.push("/test-tokens")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              ทดสอบ Token
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ข้อมูลส่วนตัว */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>ข้อมูลพื้นฐานของผู้ใช้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {userInfo.sub}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ชื่อ-นามสกุล
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {userInfo.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ประเภทผู้ใช้
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="uppercase">
                      {userInfo.user_type}
                    </Badge>
                  </div>
                </div>

                {userInfo.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      อีเมล
                    </label>
                    <p className="text-gray-900">{userInfo.email}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Client ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {userInfo.client_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูล OSM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                ข้อมูล OSM
              </CardTitle>
              <CardDescription>รหัสและข้อมูล OSM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  รหัส OSM
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                  {userInfo.osm_code}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลที่อยู่ */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                ข้อมูลที่อยู่
              </CardTitle>
              <CardDescription>ข้อมูลที่อยู่ตามระบบการปกครอง</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* จังหวัด */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-500">
                      จังหวัด
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      รหัส: {userInfo.province_code}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {userInfo.province_name}
                    </p>
                  </div>
                </div>

                {/* อำเภอ */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-green-600" />
                    <label className="text-sm font-medium text-gray-500">
                      อำเภอ
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      รหัส: {userInfo.district_code}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {userInfo.district_name}
                    </p>
                  </div>
                </div>

                {/* ตำบล */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    <label className="text-sm font-medium text-gray-500">
                      ตำบล
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      รหัส: {userInfo.subdistrict_code}
                    </p>
                    <p className="text-gray-900 font-medium">
                      {userInfo.subdistrict_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* ที่อยู่เต็ม */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  ที่อยู่เต็ม
                </label>
                <p className="text-gray-900">
                  ตำบล{userInfo.subdistrict_name} อำเภอ
                  {userInfo.district_name} จังหวัด{userInfo.province_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูล Token */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>ข้อมูล Session</CardTitle>
              <CardDescription>ข้อมูลการเชื่อมต่อปัจจุบัน</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Token Type
                  </label>
                  <p className="text-gray-900">
                    {localStorage.getItem("token_type") || "Bearer"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Scope
                  </label>
                  <p className="text-gray-900">
                    {localStorage.getItem("scope") ||
                      "openid profile address email"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Expires In
                  </label>
                  <p className="text-gray-900">
                    {localStorage.getItem("expires_in") || "Unknown"} วินาที
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    สถานะ
                  </label>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    เชื่อมต่อสำเร็จ
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

