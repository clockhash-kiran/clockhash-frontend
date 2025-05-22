import { Suspense } from "react";
import VerifyEmailClient from "@/components/VerifyEmailClient";
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
