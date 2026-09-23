"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  MonitorPlay,
  Users,
  Tag,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/reservasi", label: "Reservasi", icon: CalendarCheck },
  { href: "/admin/spaces", label: "Kelola Space", icon: MonitorPlay },
  { href: "/admin/members", label: "Kelola Member", icon: Users },
  { href: "/admin/diskon", label: "Promo & Diskon", icon: Tag },
  { href: "/admin/laporan", label: "Laporan Pendapatan", icon: TrendingUp },
  { href: "/admin/profile", label: "Profil Lokasi", icon: Settings },
];

export function AdminSidebar({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-black/[0.07] bg-white print:hidden">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-black/[0.07] px-5">
        <Logo brandName={brandName} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-soft text-brand-text"
                  : "text-ink/60 hover:bg-black/5 hover:text-ink"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand")} />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-black/[0.07] p-3">
        <div className="mb-2 rounded-xl bg-ink/[0.03] px-3 py-2.5">
          <p className="text-xs font-semibold text-ink/80 truncate">
            {user?.space_owner?.nama_coworking ?? user?.username}
          </p>
          <p className="text-[11px] text-ink/40 mt-0.5">Admin Pengelola</p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-text hover:bg-rose-soft transition-colors"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  );
}