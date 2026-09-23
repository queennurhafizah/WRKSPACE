"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Diskon, CreateDiskonDto } from "@/lib/types";
import { tanggalPanjang } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/form";
import { Dialog } from "@/components/admin/dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Spinner } from "@/components/ui/feedback";

const EMPTY: CreateDiskonDto = {
  nama_diskon: "",
  persentase_diskon: 10,
  tanggal_awal: "",
  tanggal_akhir: "",
};

function toLocalDate(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}
function toISOStart(date: string) { return date ? `${date}T00:00:00Z` : ""; }
function toISOEnd(date: string) { return date ? `${date}T23:59:59Z` : ""; }

export default function AdminDiskonPage() {
  const [list, setList] = useState<Diskon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Diskon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Diskon | null>(null);
  const [form, setForm] = useState<CreateDiskonDto>(EMPTY);
  const [awalDate, setAwalDate] = useState("");
  const [akhirDate, setAkhirDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await adminApi.diskon.list()); }
    catch { setList([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function isActive(d: Diskon) {
    const now = Date.now();
    return new Date(d.tanggal_awal).getTime() <= now && now <= new Date(d.tanggal_akhir).getTime();
  }

  function openCreate() {
    setEditTarget(null); setForm(EMPTY); setAwalDate(""); setAkhirDate(""); setError(null); setDialogOpen(true);
  }
  function openEdit(d: Diskon) {
    setEditTarget(d);
    setForm({ nama_diskon: d.nama_diskon, persentase_diskon: d.persentase_diskon, tanggal_awal: d.tanggal_awal, tanggal_akhir: d.tanggal_akhir });
    setAwalDate(toLocalDate(d.tanggal_awal));
    setAkhirDate(toLocalDate(d.tanggal_akhir));
    setError(null); setDialogOpen(true);
  }
  function setF<K extends keyof CreateDiskonDto>(k: K, v: CreateDiskonDto[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true); setError(null);
    const payload = { ...form, tanggal_awal: toISOStart(awalDate), tanggal_akhir: toISOEnd(akhirDate) };
    try {
      if (editTarget) {
        await adminApi.diskon.update(editTarget.id, payload);
        showToast("Promo berhasil diperbarui!");
      } else {
        await adminApi.diskon.create(payload);
        showToast("Promo baru berhasil ditambahkan!");
      }
      setDialogOpen(false); await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan.");
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.diskon.remove(deleteTarget.id);
      showToast("Promo berhasil dihapus.");
      setDeleteTarget(null); await load();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal.");
    } finally { setDeleting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Promo & Diskon</h1>
          <p className="mt-1 text-sm text-ink/50">Kelola kode promo dan periode berlakunya.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Promo</Button>
      </div>

      {toast && <div className="rounded-xl bg-sage-soft px-4 py-3 text-sm font-semibold text-sage-deep">{toast}</div>}

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Spinner className="h-6 w-6 text-brand" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-12 text-center text-ink/40">Belum ada kode promo.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => {
            const active = isActive(d);
            return (
              <div key={d.id} className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-butter-soft text-butter-deep">
                    <Tag className="h-5 w-5" />
                  </div>
                  <Badge className={active
                    ? "border-sage-border bg-sage-soft text-sage-deep"
                    : "border-black/10 bg-black/5 text-ink/50"
                  }>
                    {active ? "Aktif" : "Tidak aktif"}
                  </Badge>
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-butter-deep">
                  {d.persentase_diskon}%
                </p>
                <p className="mt-1 font-mono text-sm font-bold tracking-wide text-ink">
                  {d.nama_diskon}
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  {tanggalPanjang(d.tanggal_awal)} – {tanggalPanjang(d.tanggal_akhir)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(d)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteTarget(d)}>
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editTarget ? "Edit Promo" : "Tambah Promo Baru"}>
        <div className="space-y-4">
          {error && <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">{error}</div>}
          <Field label="Kode promo" hint="Huruf kapital & angka, tanpa spasi" required>
            <Input value={form.nama_diskon} onChange={(e) => setF("nama_diskon", e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="PROMO2026" />
          </Field>
          <Field label="Persentase diskon (%)" required>
            <Input type="number" min={1} max={100} value={form.persentase_diskon} onChange={(e) => setF("persentase_diskon", Number(e.target.value))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal mulai" required>
              <Input type="date" value={awalDate} onChange={(e) => setAwalDate(e.target.value)} />
            </Field>
            <Field label="Tanggal berakhir" required>
              <Input type="date" value={akhirDate} min={awalDate} onChange={(e) => setAkhirDate(e.target.value)} />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button className="flex-1" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editTarget ? "Simpan" : "Tambah promo"}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} loading={deleting} itemName={deleteTarget?.nama_diskon} />
    </div>
  );
}
