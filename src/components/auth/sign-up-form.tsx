"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Upload, X, User } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { RegisterMemberDto } from "@/lib/types";

const EMPTY: RegisterMemberDto = {
  username: "",
  password: "",
  nama_member: "",
  instansi: "",
  alamat: "",
  telp: "",
  foto: null,
};

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();

  const [form, setForm] = useState<RegisterMemberDto>(EMPTY);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RegisterMemberDto>(key: K, value: RegisterMemberDto[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      set("foto", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleRemoveFoto() {
    set("foto", null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await authApi.registerMember(form);
      signIn(auth);
      const next = params.get("next");
      router.replace(next ?? "/akun");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal mendaftar. Coba lagi.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Buat akun baru
      </h1>
      <p className="mt-2 text-ink/60">Gratis, dan cuma butuh satu menit.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">
            {error}
          </div>
        )}

        {/* Input Upload Foto Profil */}
        <Field label="Foto profil (Opsional)" htmlFor="foto">
          <div className="flex items-center gap-4 pt-1">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.02]">
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview foto"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    title="Hapus foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <User className="h-8 w-8 text-ink/30" />
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="foto"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-black/5"
              >
                <Upload className="h-3.5 w-3.5 text-ink/60" />
                <span>{previewUrl ? "Ganti foto" : "Pilih foto"}</span>
              </label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[11px] text-ink/40">
                Format JPG, PNG, atau WEBP (Maks. 2MB).
              </p>
            </div>
          </div>
        </Field>

        <Field label="Nama lengkap" htmlFor="nama" required>
          <Input
            id="nama"
            value={form.nama_member}
            onChange={(e) => set("nama_member", e.target.value)}
            placeholder="John Doe"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Username" htmlFor="username" required>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="johndoe"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password" htmlFor="password" required hint="Min. 6 karakter">
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </Field>
        </div>

        <Field label="Instansi / asal" htmlFor="instansi" required>
          <Input
            id="instansi"
            value={form.instansi}
            onChange={(e) => set("instansi", e.target.value)}
            placeholder="Universitas / Perusahaan"
            required
          />
        </Field>

        <Field label="Nomor telepon / WhatsApp" htmlFor="telp" required>
          <Input
            id="telp"
            value={form.telp}
            onChange={(e) => set("telp", e.target.value)}
            placeholder="0812xxxxxxxx"
            inputMode="tel"
            required
          />
        </Field>

        <Field label="Alamat" htmlFor="alamat" required>
          <Textarea
            id="alamat"
            value={form.alamat}
            onChange={(e) => set("alamat", e.target.value)}
            placeholder="Alamat domisili lengkap"
            required
          />
        </Field>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Sudah punya akun?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-text hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}