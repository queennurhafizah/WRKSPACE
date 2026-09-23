import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

/** Blob gradient dekoratif ala retro-pop untuk latar section. */
export function Blobs({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute right-52 top-24 h-52 w-52 rounded-full bg-sky/20 blur-3xl" />
      <div className="absolute -left-12 top-48 h-56 w-56 rounded-full bg-sage/25 blur-3xl" />
      <div className="absolute left-1/3 -top-8 h-40 w-40 rounded-full bg-butter/20 blur-3xl" />
    </div>
  );
}

/** Tampilan kosong yang ramah, mengajak bertindak. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-white/50 px-6 py-14 text-center">
      {icon && (
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-text">
          {icon}
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink/60">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
