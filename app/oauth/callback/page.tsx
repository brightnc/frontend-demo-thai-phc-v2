"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOAuth2 } from "@/hooks/useOAuth2";

export default function OAuthCallback() {
  const router = useRouter();
  const { handleCallback } = useOAuth2();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // ป้องกัน duplicate request
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        console.log("🔄 Processing OAuth2 callback...");
        await handleCallback();

        // Redirect to /me page after successful authentication
        console.log("✅ OAuth2 callback successful, redirecting to /me");
        router.push("/me");
      } catch (err) {
        console.error("❌ OAuth2 callback error:", err);
        setError(err instanceof Error ? err.message : "OAuth2 callback failed");
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [handleCallback, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>กำลังประมวลผล OAuth2 callback...</p>
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
          <h2 className="text-xl font-semibold mb-2">OAuth2 Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return null;
}

