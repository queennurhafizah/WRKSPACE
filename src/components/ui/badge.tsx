import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  /** Icon opsional di dalam lingkaran (kiri). */
  icon?: React.ReactNode;
  /** Kelas warna gabungan (bg + border + text), mis. dari STATUS_META.badge. */
  className?: string;
  /** Kelas untuk lingkaran icon. */
  iconClassName?: string;
}

/**
 * Pill badge bergaya retro-pop: outline berwarna, fill lebih lembut,
 * icon dalam lingkaran tinted — persis pola pada referensi visual.
 */
export function Badge({ children, icon, className, iconClassName }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border-2 py-1 pl-1.5 pr-3 text-xs font-bold",
        icon ? "" : "px-3",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full text-[11px]",
            iconClassName,
          )}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
