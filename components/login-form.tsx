"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User } from "lucide-react";

const AUTH_LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`
  : "/api/v1/auth/login";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [urlParams, setUrlParams] = useState<{
    client_id: string;
    redirect_uri: string;
    scope: string;
    state: string;
  }>({
    client_id: "",
    redirect_uri: "",
    scope: "",
    state: "",
  });
  const searchParams = useSearchParams();

  // อ่าน parameters จาก URL เมื่อ component mount
  useEffect(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString());

      // อ่าน OAuth parameters
      const oauthParams = {
        client_id: params.get("client_id") || "",
        redirect_uri: params.get("redirect_uri") || "",
        scope: params.get("scope") || "",
        state: params.get("state") || "",
      };

      setUrlParams(oauthParams);

      // อ่าน error parameters
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam) {
        // แปลง error code เป็นข้อความที่เข้าใจง่าย
        const errorMessages: { [key: string]: string } = {
          invalid_client: "Invalid client application.",
          invalid_username_or_password: "Invalid username or password.",
          user_not_active: "User account is not active.",
          access_denied: "Access denied.",
          consent_failed: "Failed to save consent.",
        };

        const errorMessage =
          errorMessages[errorParam] ||
          errorDescription ||
          `Error: ${errorParam}`;
        setError(errorMessage);

        // ลบเฉพาะ error parameters ออก แต่เก็บ OAuth params ไว้
        params.delete("error");
        params.delete("error_description");

        // สร้าง URL ใหม่
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [searchParams]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ตรวจสอบว่ามี client_id และ state หรือไม่
    if (!urlParams.client_id || !urlParams.state) {
      setError("Missing OAuth parameters. Please try logging in again.");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous error

    // Debug: แสดง environment variables และ endpoint
    console.log("=== Login Form Debug ===");
    console.log(
      "NEXT_PUBLIC_BACKEND_URL:",
      process.env.NEXT_PUBLIC_BACKEND_URL
    );
    console.log("AUTH_LOGIN_ENDPOINT:", AUTH_LOGIN_ENDPOINT);
    console.log("OAuth Parameters:", urlParams);
    console.log("=========================");

    // สร้าง form และ submit แทนการใช้ fetch เพื่อหลีกเลี่ยง CORS
    const form = document.createElement("form");
    form.method = "POST";
    form.action = AUTH_LOGIN_ENDPOINT;
    form.style.display = "none";

    // สร้าง redirect_to URL
    const redirectTo = `${
      process.env.NEXT_PUBLIC_BACKEND_URL
    }/api/v1/auth/authorize?client_id=${encodeURIComponent(
      urlParams.client_id
    )}&redirect_uri=${encodeURIComponent(
      urlParams.redirect_uri
    )}&scope=${encodeURIComponent(urlParams.scope)}&state=${encodeURIComponent(
      urlParams.state
    )}`;

    // เพิ่ม form fields
    const fields = {
      username: formData.username,
      password: formData.password,
      user_type: "osm",
      client_id: urlParams.client_id,
      state: urlParams.state,
      redirect_uri: urlParams.redirect_uri,
      scope: urlParams.scope,
      redirect_to: redirectTo,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // เพิ่ม form ลงใน DOM และ submit
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อเข้าสู่ระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`pl-10 ${
                    validationErrors.username ? "border-red-500" : ""
                  }`}
                  disabled={loading}
                />
              </div>
              {validationErrors.username && (
                <p className="text-sm text-red-500">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 ${
                    validationErrors.password ? "border-red-500" : ""
                  }`}
                  disabled={loading}
                />
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>ข้อมูลทดสอบ: 1234567890123 / password</p>
          </div>

          {/* Debug info - ลบออกใน production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Client ID: {urlParams.client_id || "ไม่พบ"}</p>
              <p>State: {urlParams.state || "ไม่พบ"}</p>
              <p>Scope: {urlParams.scope || "ไม่พบ"}</p>
              <p>Redirect URI: {urlParams.redirect_uri || "ไม่พบ"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

