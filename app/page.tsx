"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SSOLoginButton from "@/components/sso-login-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  User,
  ArrowRight,
  CheckCircle,
  Building2,
  MapPin,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useOAuth2 } from "@/hooks/useOAuth2";

export default function HomePage() {
  const { isAuthenticated, userInfo, loading, logout } = useOAuth2();
  const router = useRouter();

  // Debug environment variables
  useEffect(() => {
    console.log("=== Home Page Environment Check ===");
    console.log(
      "NEXT_PUBLIC_OAUTH_CLIENT_ID:",
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID
    );
    console.log(
      "NEXT_PUBLIC_BACKEND_URL:",
      process.env.NEXT_PUBLIC_BACKEND_URL
    );
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // ตรวจสอบว่า environment variables มีค่าหรือไม่
    if (!process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID) {
      console.error("❌ NEXT_PUBLIC_OAUTH_CLIENT_ID is missing!");
      console.error(
        "Please create .env.local file with the required variables"
      );
    } else {
      console.log("✅ NEXT_PUBLIC_OAUTH_CLIENT_ID is set");
    }

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL is missing!");
    } else {
      console.log("✅ NEXT_PUBLIC_BACKEND_URL is set");
    }

    console.log("===================================");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Thai PHC
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                OAuth Demo
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/me")}
                    className="flex items-center space-x-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>โปรไฟล์</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await logout();
                        router.push("/");
                      } catch (error) {
                        console.error("❌ Logout failed:", error);
                        router.push("/");
                      }
                    }}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="flex items-center space-x-2"
                >
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ยินดีต้อนรับสู่
              <span className="text-blue-600 block">Thai PHC OAuth Demo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ระบบยืนยันตัวตนด้วย OAuth 2.0
              สำหรับระบบข้อมูลสุขภาพระดับปฐมภูมิของประเทศไทย
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SSOLoginButton />
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="flex items-center space-x-2"
                >
                  <span>ดูข้อมูลเพิ่มเติม</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => router.push("/me")}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>ดูข้อมูลผู้ใช้</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              คุณสมบัติหลัก
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ระบบยืนยันตัวตนที่ปลอดภัยและเชื่อถือได้สำหรับบุคลากรสาธารณสุข
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>ความปลอดภัยสูง</CardTitle>
                <CardDescription>
                  ใช้มาตรฐาน OAuth 2.0 และ OpenID Connect
                  เพื่อความปลอดภัยในการยืนยันตัวตน
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>เชื่อมต่อกับระบบ OSM</CardTitle>
                <CardDescription>
                  รองรับการเชื่อมต่อกับระบบข้อมูลสุขภาพระดับปฐมภูมิ (OSM)
                  ของประเทศไทย
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>ข้อมูลที่อยู่ครบถ้วน</CardTitle>
                <CardDescription>
                  แสดงข้อมูลที่อยู่ตามระบบการปกครองของไทย (จังหวัด อำเภอ ตำบล)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* User Info Section (if logged in) */}
      {isAuthenticated && userInfo && (
        <div className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ข้อมูลผู้ใช้ปัจจุบัน
              </h2>
              <p className="text-lg text-gray-600">คุณได้เข้าสู่ระบบแล้ว</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{userInfo.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="uppercase">
                        {userInfo.user_type}
                      </Badge>
                    </CardDescription>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500 ml-auto" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      รหัส OSM
                    </label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {userInfo.osm_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ที่อยู่
                    </label>
                    <p className="text-sm">
                      ตำบล{userInfo.subdistrict_name} อำเภอ
                      {userInfo.district_name} จังหวัด{userInfo.province_name}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={() => router.push("/me")} className="w-full">
                    ดูข้อมูลเพิ่มเติม
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">Thai PHC OAuth Demo</span>
            </div>
            <p className="text-gray-400 mb-4">
              ระบบยืนยันตัวตนด้วย OAuth 2.0 สำหรับระบบข้อมูลสุขภาพระดับปฐมภูมิ
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Thai PHC</span>
              <span>•</span>
              <span>OAuth 2.0 Demo</span>
              <span>•</span>
              <span>Next.js + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

