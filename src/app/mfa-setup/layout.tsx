import { Suspense } from "react";
import MFAVerify from "./page";

export default function MFASetupPage() {
  return (
    <Suspense fallback={<p>Loading MFA Setup...</p>}>
      <MFAVerify />
    </Suspense>
  );
}
