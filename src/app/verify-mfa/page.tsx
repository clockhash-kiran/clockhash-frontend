"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function MFAVerify() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract userId from URL
  const userId = searchParams.get("id");

  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [isMfaSetupComplete, setIsMfaSetupComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { update } = useSession();
  const email = sessionStorage.getItem("email");
  const password = sessionStorage.getItem("password");
  async function handleVerify() {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/mfa/verify", { userId, token: code });

      if (res.status === 200) {
        setIsMfaSetupComplete(true);

        // 🔹 Re-run authentication flow
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (loginRes?.error) {
          setError(loginRes.error);
          return;
        }

        // 🔹 Force session refresh
        await update();

        // 🔹 Redirect to dashboard or homepage
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid code. Try again.");
      }
    } catch (error) {
      console.error(error);
      setError("Error verifying MFA code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">MFA Setup</h2>
        </CardHeader>
        <CardContent>
          {isMfaSetupComplete ? (
            <Alert className="bg-green-100 text-green-700">
              <AlertDescription>
                MFA setup complete. You can now log in securely!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <h3 className="mt-4 font-medium">
                Enter the code from your Authenticator app:
              </h3>
              <Input
                type="text"
                placeholder="Enter TOTP Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!isMfaSetupComplete && (
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
