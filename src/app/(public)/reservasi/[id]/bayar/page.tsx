"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RequireMember } from "@/components/auth/require-member";
import { PaymentView } from "@/components/member/payment-view";

export default function BayarPage() {
  return (
    <RequireMember>
      <Suspense
        fallback={
          <div className="container-page flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        }
      >
        <BayarContent />
      </Suspense>
    </RequireMember>
  );
}

function BayarContent() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="container-page py-16 text-center text-ink/60">
        Reservasi tidak valid.
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <PaymentView id={id} />
    </div>
  );
}