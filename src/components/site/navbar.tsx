"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, LogOut, CalendarCheck, History, LayoutDashboard, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./mobile-drawer";
import { NAV_LINKS } from "./nav-links";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function Navbar({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup dropdown saat pindah halaman
  useEffect(() => setMenuOpen(false), [pathname]);

  const displayName =
    user?.member?.nama_member ?? user?.space_owner?.nama_coworking ?? user?.username;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-colors",
        scrolled
          ? "border-black/10 bg-ivory/85 backdrop-blur-md"
          : "border-transparent bg-ivory",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Logo brandName={brandName} />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  active ? "text-brand-text" : "text-ink/70 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-pill border-2 border-black/10 py-1.5 pl-1.5 pr-3 text-sm font-semibold hover:bg-black/5"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand to-sky text-xs font-bold text-white">
                  {(displayName ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[9rem] truncate">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-ink/50" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border-2 border-black/10 bg-white shadow-card">
                  {isAdmin ? (
                    <DropdownLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
                      Dashboard admin
                    </DropdownLink>
                  ) : (
                    <>
                      <DropdownLink href="/akun/profil" icon={<UserRound className="h-4 w-4" />}>
                        Profil saya
                      </DropdownLink>
                      <DropdownLink href="/akun" icon={<CalendarCheck className="h-4 w-4" />}>
                        Reservasi saya
                      </DropdownLink>
                      <DropdownLink href="/akun/riwayat" icon={<History className="h-4 w-4" />}>
                        Riwayat pemesanan
                      </DropdownLink>
                    </>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2.5 border-t border-black/10 px-4 py-3 text-sm font-semibold text-rose-text hover:bg-rose-soft"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu"
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-black/10 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

function DropdownLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-soft hover:text-brand-text"
    >
      {icon}
      {children}
    </Link>
  );
}