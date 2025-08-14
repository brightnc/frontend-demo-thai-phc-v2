"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Globe, X } from "lucide-react";

export default function ConsentForm({
  params,
}: {
  params?: Record<string, string>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [mounted, setMounted] = useState(false);

  // Get query params
  const clientId = params?.client_id || "";
  const redirectUri = params?.redirect_uri || "/";
  const state = params?.state || "";
  const scope = params?.scope || "";
  const consentEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/consent`
    : "/api/v1/auth/consent";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setUserId("User");
  }, [mounted]);

  const handleAllow = async () => {
    setLoading(true);
    setError("");

    // สร้าง form และ submit แทนการใช้ fetch

    const form = document.createElement("form");
    form.method = "POST";
    form.action = consentEndpoint;
    form.style.display = "none";

    // เพิ่ม form fields
    const fields: { [key: string]: string } = {
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      action: "approve",
    };
    scope.split(" ").forEach((scopeItem) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "scopes";
      input.value = scopeItem;
      form.appendChild(input);
    });
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

  const handleDeny = async () => {
    setLoading(true);
    setError("");

    // สร้าง form และ submit แทนการใช้ fetch
    const form = document.createElement("form");
    form.method = "POST";
    form.action = consentEndpoint;
    form.style.display = "none";

    // เพิ่ม form fields
    const fields: { [key: string]: string } = {
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      action: "deny",
    };

    scope.split(" ").forEach((scopeItem) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "scopes";
      input.value = scopeItem;
      form.appendChild(input);
    });

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

  // Show loading while checking authentication
  if (!mounted || (!userId && mounted)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Authorize Access</CardTitle>
          <CardDescription>
            <strong>{clientId}</strong> wants to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>
                Signed in as: <strong>{userId}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">
              This app will be able to:
            </h3>
            <div className="space-y-3">
              {scope.split(" ").map((scopeName) => (
                <div
                  key={scopeName}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Badge variant="secondary" className="text-xs">
                    {scopeName}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mt-1">
                      Allow access to {scopeName} information
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={loading}
              className="flex-1 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Deny
            </Button>
            <Button onClick={handleAllow} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Allow
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>
              By clicking &quot;Allow&quot;, you authorize {clientId} to access
              your account according to their terms of service and privacy
              policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

