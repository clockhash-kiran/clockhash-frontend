"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Shield, ShieldOff } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isUpdatingMFA, setIsUpdatingMFA] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);

  const { data, mutate } = useSWR("/api/mfa/status", fetcher);
  const mfaStatus = data?.mfaEnabled;

  if (status === "unauthenticated") {
    router.push("/sign-in");
    return null;
  }

  const fetchQRCode = async () => {
    try {
      setQrCodeLoading(true);
      const res = await fetch("/api/mfa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setQrCode(data.qrCode);
      setIsQRCodeModalOpen(true);
    } catch {
      toast.error("Failed to generate QR code");
    } finally {
      setQrCodeLoading(false);
    }
  };

  const toggleMFAStatus = async () => {
    if (!session?.user?.id) {
      toast.error("User not found");
      return;
    }

    setIsUpdatingMFA(true);

    try {
      const res = await fetch("/api/mfa/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          action: mfaStatus ? "false" : "true",
        }),
      });

      if (!res.ok) throw new Error();

      if (!mfaStatus) await fetchQRCode();
      mutate();
      toast.success(`MFA ${mfaStatus ? "disabled" : "enabled"} successfully`);
    } catch {
      toast.error("Failed to update MFA");
    } finally {
      setIsUpdatingMFA(false);
    }
  };

  const handleGenerateApiToken = async () => {
    setGeneratingToken(true);
    setGeneratedToken(null);

    try {
      const response = await fetch("/api/token/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setGeneratedToken(data.token);
      toast.success("Token generated successfully");
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setGeneratingToken(false);
    }
  };

  if (status === "loading" || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className=" mx-auto px-4 py-12 max-w-2xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {mfaStatus ? (
                  <Shield className="w-6 h-6 text-green-600" />
                ) : (
                  <ShieldOff className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    Multi-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mfaStatus ? "Enabled for additional security" : "Disabled"}
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleMFAStatus}
                disabled={isUpdatingMFA}
                size="sm"
                variant={mfaStatus ? "outline" : "default"}
                className={
                  mfaStatus ? "text-red-600 border-red-600 hover:bg-red-50" : ""
                }
              >
                {isUpdatingMFA
                  ? "Updating..."
                  : mfaStatus
                    ? "Disable MFA"
                    : "Enable MFA"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Token</CardTitle>
            <CardDescription>
              Generate a personal access token for CI/CD or API access. You can
              only view it once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateApiToken} disabled={generatingToken}>
              {generatingToken ? "Generating..." : "Generate New Token"}
            </Button>

            {generatedToken && (
              <div className="mt-4 bg-muted p-3 rounded text-sm break-all">
                <strong>Your token (save this now):</strong>
                <pre className="mt-1 whitespace-pre-wrap">{generatedToken}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isQRCodeModalOpen} onOpenChange={setIsQRCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Multi-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app.
            </DialogDescription>
          </DialogHeader>
          {qrCodeLoading ? (
            <div className="flex justify-center items-center h-64">
              Loading QR Code...
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={qrCode}
                alt="MFA QR Code"
                width={250}
                height={250}
                className="mx-auto"
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan with Google Authenticator, 1Password, or Authy.
              </p>
              <Button
                onClick={() => setIsQRCodeModalOpen(false)}
                variant="outline"
              >
                I've Scanned the Code
              </Button>
            </div>
          ) : (
            <div className="text-center text-red-600">
              Failed to generate QR Code
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsPage;
