import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "./nav-links";
import type { Brand } from "@/lib/brand";

export function Footer({ brand }: { brand: Brand }) {
  return (
    <footer className="mt-24 border-t border-black/10 bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo brandName={brand.name} />
          <p className="mt-3 font-accent text-xl font-bold text-brand">{brand.tagline}</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink/60">
            Pesan personal desk, meeting room, atau private office kapan pun kamu butuh ruang untuk fokus.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-ink">Jelajahi</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink/60 hover:text-brand-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-ink">Kontak</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand" />
              {brand.phone}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-sky" />
              Dikelola oleh {brand.owner}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. Seluruh hak cipta.
          </p>
          <p>Dibuat untuk UKK RPL — Reservasi Coworking Space.</p>
        </div>
      </div>
    </footer>
  );
}
