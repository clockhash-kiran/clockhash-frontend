"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const VerifyEmailClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<string>("Verifying...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await fetch(`/api/verify-email?token=${token}`);
          const data = await response.json();
          setStatus(data.message || "Error occurred");

          if (response.ok) {
            setTimeout(() => router.push("/"), 2000);
          }
        } catch (error) {
          console.error(error);
          setStatus("Verification failed. Try again.");
        } finally {
          setLoading(false);
        }
      };

      verifyEmail();
    } else {
      setStatus("Invalid verification link.");
      setLoading(false);
    }
  }, [token, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          ) : (
            <p className="text-lg font-medium">{status}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailClient;
