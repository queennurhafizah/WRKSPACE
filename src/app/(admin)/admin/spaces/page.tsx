"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { uploadApi } from "@/lib/api/upload";
import { ApiError } from "@/lib/api/client";
import type {
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  SpaceTipe,
} from "@/lib/types";
import { rupiah, labelTipe, resolveImageUrl, TIPE_THEME } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { Dialog } from "@/components/admin/dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Spinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

const EMPTY_FORM: CreateSpaceDto = {
  nama_space: "",
  harga_per_jam: 0,
  tipe: "desk",
  kapasitas: 1,
  deskripsi: "",
  foto: "",
};

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const [form, setForm] = useState<CreateSpaceDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSpaces(await adminApi.spaces.list());
    } catch {
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(s: Space) {
    setEditTarget(s);
    setForm({
      nama_space: s.nama_space,
      harga_per_jam: s.harga_per_jam,
      tipe: s.tipe,
      kapasitas: s.kapasitas,
      deskripsi: s.deskripsi,
      foto: s.foto ?? "",
    });
    setSelectedFile(null);
    setError(null);
    setDialogOpen(true);
  }

  function set<K extends keyof CreateSpaceDto>(k: K, v: CreateSpaceDto[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const res = await uploadApi.space(file);
      set("foto", res.filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("nama_space", form.nama_space);
      formData.append("tipe", form.tipe);
      formData.append("kapasitas", String(form.kapasitas));
      formData.append("harga_per_jam", String(form.harga_per_jam));
      formData.append("deskripsi", form.deskripsi);

      // Lampirkan file fisik jika user memilih foto baru
      if (selectedFile) {
        formData.append("foto", selectedFile);
      }

      if (editTarget) {
        await adminApi.spaces.update(editTarget.id, formData);
        showToast("Space berhasil diperbarui!");
      } else {
        await adminApi.spaces.create(formData);
        showToast("Space baru berhasil ditambahkan!");
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
      await adminApi.spaces.remove(deleteTarget.id);
      showToast("Space berhasil dihapus.");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Kelola Space
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Tambah, edit, atau hapus ruangan & meja coworking.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Space
        </Button>
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
      ) : spaces.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-12 text-center text-ink/40">
          Belum ada space. Klik &quot;Tambah Space&quot; untuk memulai.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s) => {
            const theme = TIPE_THEME[s.tipe];
            // Ambil URL gambar yang sudah dibetulkan
            const imgUrl = resolveImageUrl(s.foto_url ?? s.foto, "spaces");

            return (
              <div
                key={s.id}
                className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-soft"
              >
                <div
                  className={cn(
                    "relative aspect-[3/2] flex items-center justify-center overflow-hidden",
                    theme.soft,
                  )}
                >
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={s.nama_space}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Jika URL gambar error/404, sembunyikan img tag agar fallback icon tampil
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon className={cn("h-10 w-10", theme.text)} />
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge className={cn(theme.soft, theme.border, theme.text)}>
                      {labelTipe(s.tipe)}
                    </Badge>
                  </div>
                </div>

                {/* Detail info space */}
                <div className="p-4">
                  <h3 className="font-display font-bold truncate">
                    {s.nama_space}
                  </h3>
                  <p className="text-sm text-ink/50 mt-0.5">
                    Kapasitas {s.kapasitas} orang
                  </p>
                  <p className="mt-2 font-display text-lg font-extrabold text-ink">
                    {rupiah(s.harga_per_jam)}
                    <span className="text-xs font-normal text-ink/40">
                      {" "}
                      / jam
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeleteTarget(s)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog tambah/edit */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editTarget ? "Edit Space" : "Tambah Space Baru"}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">
              {error}
            </div>
          )}
          <Field label="Nama space" required>
            <Input
              value={form.nama_space}
              onChange={(e) => set("nama_space", e.target.value)}
              placeholder="cth. Personal Desk Alpha 01"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipe" required>
              <Select
                value={form.tipe}
                onChange={(e) => set("tipe", e.target.value as SpaceTipe)}
              >
                <option value="desk">Personal Desk</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="private_office">Private Office</option>
              </Select>
            </Field>
            <Field label="Kapasitas (orang)" required>
              <Input
                type="number"
                min={1}
                value={form.kapasitas}
                onChange={(e) => set("kapasitas", Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Harga per jam (Rp)" required>
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.harga_per_jam}
              onChange={(e) => set("harga_per_jam", Number(e.target.value))}
            />
          </Field>
          <Field label="Deskripsi & fasilitas" required>
            <Textarea
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              placeholder="WiFi, stopkontak, AC, dll."
            />
          </Field>
          <Field label="Foto" hint="Upload foto ruangan (jpg/png)">
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <span className="text-xs font-semibold text-sage-text truncate max-w-[140px]">
                  ✓ {selectedFile.name}
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
              disabled={saving || uploadingPhoto}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editTarget ? (
                "Simpan perubahan"
              ) : (
                "Tambah space"
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
        itemName={deleteTarget?.nama_space}
      />
    </div>
  );
}
