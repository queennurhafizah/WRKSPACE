"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RequireMember } from "@/components/auth/require-member";
import { ETicketView } from "@/components/member/eticket-view";

export default function TiketPage() {
  return (
    <RequireMember>
      <Suspense
        fallback={
          <div className="container-page flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        }
      >
        <TiketContent />
      </Suspense>
    </RequireMember>
  );
}

function TiketContent() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = Number(params.id);
  const baru = search.get("baru") === "1";

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="container-page py-16 text-center text-ink/60">
        Reservasi tidak valid.
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <ETicketView id={id} baru={baru} />
    </div>
  );
}