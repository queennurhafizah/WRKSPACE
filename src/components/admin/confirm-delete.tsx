"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Dialog } from "./dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  itemName?: string;
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  loading,
  itemName,
}: ConfirmDeleteProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Hapus data" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-soft text-rose-deep">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-ink">
            Yakin ingin menghapus?
          </p>
          {itemName && (
            <p className="mt-1 text-sm text-ink/60">
              <span className="font-semibold">{itemName}</span> akan dihapus
              permanen dan tidak bisa dikembalikan.
            </p>
          )}
        </div>
        <div className="flex w-full gap-2 pt-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
