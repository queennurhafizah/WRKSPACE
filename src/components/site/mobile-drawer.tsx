"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut, LayoutDashboard, CalendarCheck, History, UserRound } from "lucide-react";
import { NAV_LINKS } from "./nav-links";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[82%] max-w-sm flex-col bg-ivory p-6 shadow-2xl md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">Menu</span>
              <button
                onClick={onClose}
                aria-label="Tutup menu"
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-black/10 text-ink hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="rounded-xl px-3 py-3 text-base font-semibold text-ink hover:bg-brand-soft hover:text-brand-text"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-black/10 pt-6">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin" onClick={onClose}>
                      <Button variant="secondary" className="w-full">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/akun/profil" onClick={onClose}>
                        <Button variant="secondary" className="w-full">
                          <UserRound className="h-4 w-4" /> Profil saya
                        </Button>
                      </Link>
                      <Link href="/akun" onClick={onClose}>
                        <Button variant="ghost" className="w-full">
                          <CalendarCheck className="h-4 w-4" /> Reservasi saya
                        </Button>
                      </Link>
                      <Link href="/akun/riwayat" onClick={onClose}>
                        <Button variant="ghost" className="w-full">
                          <History className="h-4 w-4" /> Riwayat
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" onClick={onClose}>
                    <Button variant="outline" className="w-full">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={onClose}>
                    <Button className="w-full">Daftar</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}