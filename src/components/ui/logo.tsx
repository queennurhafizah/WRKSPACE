import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  markOnly?: boolean;
  brandName?: string;
}

export function Logo({
  href = "/",
  className,
  markOnly = false,
  brandName = "WRKSPACE",
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Mark: inisial pertama + kedua dari brand name */}
      <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-brand to-sky font-display text-base font-extrabold text-white shadow-brand-glow">
        {brandName.charAt(0).toUpperCase()}
      </span>
      {!markOnly && (
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">
          {brandName}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={brandName} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
