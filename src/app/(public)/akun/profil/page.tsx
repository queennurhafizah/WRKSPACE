"use client";

import { useState } from "react";
import { Building2, Loader2, MapPin, Phone, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { RequireMember } from "@/components/auth/require-member";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/format";

export default function ProfilPage() {
  return (
    <RequireMember>
      <ProfilContent />
    </RequireMember>
  );
}

function ProfilContent() {
  const { user, refresh } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Data ini datang dari GET /api/auth/profile (di-fetch oleh AuthProvider
  // saat halaman dimuat / token tersedia). Halaman ini read-only karena
  // kontrak API tidak menyediakan endpoint bagi member untuk mengubah
  // profilnya sendiri (yang bisa mengubah data member hanya Admin Space,
  // lewat PUT /api/admin/members/{id}).
  const member = user?.member ?? null;
  const fotoUrl = resolveImageUrl(member?.foto_url ?? member?.foto, "members");

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-accent text-2xl text-brand-text">Akun saya</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Profil Saya
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Data akun kamu yang tersimpan di sistem WRKSPACE.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Muat ulang
        </Button>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-black/[0.06] bg-white p-6 shadow-soft sm:p-8">
        {/* Header avatar + nama */}
        <div className="flex flex-col items-center gap-4 border-b border-black/[0.06] pb-6 text-center sm:flex-row sm:text-left">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt={member?.nama_member ?? user?.username ?? "Foto profil"}
              className="h-20 w-20 shrink-0 rounded-full object-cover bg-brand-soft"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text">
              <User className="h-8 w-8" />
            </span>
          )}
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">
              {member?.nama_member ?? user?.username ?? "-"}
            </h2>
            <p className="text-sm text-ink/50">@{user?.username ?? "-"}</p>
            <div className="mt-2">
              <Badge className="border-brand-border bg-brand-soft text-brand-text">
                Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Detail data */}
        <dl className="mt-6 space-y-4">
          <DetailRow
            icon={<Building2 className="h-4 w-4" />}
            label="Instansi / asal"
            value={member?.instansi}
          />
          <DetailRow
            icon={<Phone className="h-4 w-4" />}
            label="Telepon"
            value={member?.telp}
          />
          <DetailRow
            icon={<MapPin className="h-4 w-4" />}
            label="Alamat"
            value={member?.alamat}
          />
        </dl>

        <p className="mt-6 rounded-xl bg-black/[0.03] px-4 py-3 text-xs text-ink/50">
          Perlu mengubah data di atas? Hubungi pengelola coworking space —
          perubahan data member saat ini hanya bisa dilakukan oleh admin.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/[0.04] text-ink/60">
        {icon}
      </span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-ink/40">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-ink">
          {value || "-"}
        </dd>
      </div>
    </div>
  );
}