"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { UpdateCoworkingProfileDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Spinner } from "@/components/ui/feedback";

export default function AdminProfilPage() {
  const [form, setForm] = useState<UpdateCoworkingProfileDto>({
    nama_coworking: "", nama_pemilik: "", telp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    adminApi.getProfile()
      .then((p) => setForm({ nama_coworking: p.nama_coworking, nama_pemilik: p.nama_pemilik, telp: p.telp }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof UpdateCoworkingProfileDto>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      await adminApi.updateProfile(form);
      showToast("Profil lokasi berhasil diperbarui!");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal menyimpan.", false);
    } finally { setSaving(false); }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center"><Spinner className="h-6 w-6 text-brand" /></div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Profil Lokasi</h1>
        <p className="mt-1 text-sm text-ink/50">
          Data ini tampil di navbar, halaman Tentang, dan footer website.
        </p>
      </div>

      {toast && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${toast.ok ? "bg-sage-soft text-sage-deep" : "bg-rose-soft text-rose-deep"}`}>
          {toast.msg}
        </div>
      )}

      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-soft space-y-4">
        <Field label="Nama coworking space" required>
          <Input value={form.nama_coworking} onChange={(e) => set("nama_coworking", e.target.value)} placeholder="WRKSPACE Hub" />
        </Field>
        <Field label="Nama pemilik / penanggung jawab" required>
          <Input value={form.nama_pemilik} onChange={(e) => set("nama_pemilik", e.target.value)} />
        </Field>
        <Field label="Nomor telepon / WhatsApp" required>
          <Input value={form.telp} onChange={(e) => set("telp", e.target.value)} inputMode="tel" />
        </Field>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Simpan perubahan</>}
        </Button>
      </div>
    </div>
  );
}
