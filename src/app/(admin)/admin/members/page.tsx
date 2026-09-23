"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, User } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { uploadApi } from "@/lib/api/upload";
import { ApiError } from "@/lib/api/client";
import type {
  Member,
  CreateMemberAdminDto,
} from "@/lib/types";
import { resolveImageUrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/admin/dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Spinner } from "@/components/ui/feedback";

const EMPTY: CreateMemberAdminDto = {
  username: "",
  password: "",
  nama_member: "",
  instansi: "",
  alamat: "",
  telp: "",
  foto: "",
};

/** Sub-komponen penanganan Avatar + Fallback jika Gambar Error */
function MemberAvatar({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  // PENTING: reset status error setiap kali photoUrl berubah (mis. setelah
  // admin mengganti foto). Tanpa ini, begitu satu foto pernah gagal dimuat
  // (mis. file lama 404), komponen ini akan permanen menampilkan ikon
  // default walau foto baru yang valid sudah diterima dari server —
  // karena React mempertahankan instance & state komponen ini selama
  // key baris (`m.id`) di induknya tidak berubah.
  useEffect(() => {
    setHasError(false);
  }, [photoUrl]);

  // Jika URL kosong atau pernah error, tampilkan icon default User
  if (!photoUrl || hasError) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text">
        <User className="h-4 w-4" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={name}
      className="h-8 w-8 shrink-0 rounded-full object-cover bg-brand-soft"
      onError={() => setHasError(true)}
    />
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [form, setForm] = useState<CreateMemberAdminDto>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newFoto, setNewFoto] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await adminApi.members.list(search || undefined));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 350);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY);
    setNewFoto(null);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(m: Member) {
    setEditTarget(m);
    setForm({
      username: "",
      password: "",
      nama_member: m.nama_member,
      instansi: m.instansi,
      alamat: m.alamat,
      telp: m.telp,
      foto: m.foto ?? "",
    });
    setNewFoto(null);
    setError(null);
    setDialogOpen(true);
  }

  function set<K extends keyof CreateMemberAdminDto>(
    k: K,
    v: CreateMemberAdminDto[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handlePhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const r = await uploadApi.member(file);
      console.log("Response Upload:", r);

      // Ambil nama file dari response upload
      const uploadedFilename = r.filename || r.url?.split("/").pop();

      if (uploadedFilename) {
        setNewFoto(uploadedFilename); // Simpan ke state newFoto
      } else {
        setError("Gagal mendapatkan nama file dari server upload.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);

    // Gunakan foto baru dari upload jika ada, jika tidak gunakan foto lama di form
    const finalFoto = newFoto || form.foto || undefined;

    try {
      if (editTarget) {
        // PENTING: adminApi.members.update() mengharapkan FormData (bukan
        // object biasa), karena endpoint PUT /api/admin/members/{id}
        // menerima multipart/form-data (untuk mendukung upload foto).
        // Sebelumnya di sini dikirim object `UpdateMemberAdminDto` biasa,
        // yang tidak cocok dengan tipe yang diminta -> inilah error TS
        // di baris "await adminApi.members.update(editTarget.id, dto)".
        const formData = new FormData();
        formData.append("nama_member", form.nama_member);
        formData.append("instansi", form.instansi);
        formData.append("alamat", form.alamat);
        formData.append("telp", form.telp);
        if (form.password) formData.append("password", form.password);
        if (finalFoto) formData.append("foto", finalFoto);

        console.log("FormData yang dikirim ke update:", Object.fromEntries(formData)); // Cek apakah foto sudah berubah
        await adminApi.members.update(editTarget.id, formData);
        showToast("Member berhasil diperbarui!");
      } else {
        await adminApi.members.create({
          ...form,
          foto: finalFoto,
        });
        showToast("Member baru berhasil ditambahkan!");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.members.remove(deleteTarget.id);
      showToast("Member berhasil dihapus.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Kelola Member
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Daftar seluruh pelanggan coworking space.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, instansi, atau telepon..."
          className="pl-10"
        />
      </div>

      {toast && (
        <div className="rounded-xl bg-sage-soft px-4 py-3 text-sm font-semibold text-sage-deep">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-6 w-6 text-brand" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-12 text-center text-ink/40">
          {search
            ? "Tidak ada member yang cocok."
            : "Belum ada member terdaftar."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.07] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.07] bg-black/[0.02]">
                {["Member", "Instansi", "Telepon", "Alamat", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {members.map((m) => {
                const rawImg = resolveImageUrl(m.foto, "members");
                console.log(`Foto Member ${m.nama_member}:`, {
                  fotoDB: m.foto,
                  resolvedURL: rawImg,
                });

                // ...
                // Buat URL unik agar tidak tersimpan di cache browser
                const photoUrl = rawImg ? `${rawImg}?t=${Date.now()}` : null;

                return (
                  <tr key={m.id} className="hover:bg-black/[0.015]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar
                          photoUrl={photoUrl}
                          name={m.nama_member}
                        />
                        <span className="font-medium">{m.nama_member}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {m.instansi || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{m.telp || "-"}</td>
                    <td className="px-4 py-3 text-ink/60 max-w-[180px] truncate">
                      {m.alamat || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(m)}
                          className="rounded-lg border border-black/10 p-1.5 hover:bg-black/5"
                          title="Edit Member"
                        >
                          <Pencil className="h-3.5 w-3.5 text-ink/60" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="rounded-lg border border-rose-border p-1.5 hover:bg-rose-soft"
                          title="Hapus Member"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-text" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editTarget ? "Edit Member" : "Tambah Member Baru"}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">
              {error}
            </div>
          )}

          <Field label="Nama lengkap" required>
            <Input
              value={form.nama_member}
              onChange={(e) => set("nama_member", e.target.value)}
            />
          </Field>

          {!editTarget && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username" required>
                <Input
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                />
              </Field>
              <Field label="Password" required hint="Min. 6 karakter">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>
            </div>
          )}

          {editTarget && (
            <Field
              label="Password baru"
              hint="Kosongkan jika tidak ingin mengubah"
            >
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </Field>
          )}

          <Field label="Instansi / asal" required>
            <Input
              value={form.instansi}
              onChange={(e) => set("instansi", e.target.value)}
            />
          </Field>

          <Field label="Telepon" required>
            <Input
              value={form.telp}
              onChange={(e) => set("telp", e.target.value)}
              inputMode="tel"
            />
          </Field>

          <Field label="Alamat" required>
            <Textarea
              value={form.alamat}
              onChange={(e) => set("alamat", e.target.value)}
            />
          </Field>

          <Field label="Foto profil" hint="Upload foto member (opsional)">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(f);
                }}
              />
              {uploading && <Spinner className="h-4 w-4 text-brand" />}
              {(newFoto || form.foto) && (
                <span className="text-xs font-semibold text-sage-text truncate max-w-[150px]">
                  ✓ {newFoto ? `Baru: ${newFoto}` : form.foto}
                </span>
              )}
            </div>
          </Field>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={save}
              disabled={saving || uploading}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editTarget ? (
                "Simpan perubahan"
              ) : (
                "Tambah member"
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDelete
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        itemName={deleteTarget?.nama_member}
      />
    </div>
  );
}