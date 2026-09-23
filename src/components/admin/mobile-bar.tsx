"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import { AnimatePresence, motion } from "framer-motion";

export function AdminMobileBar({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-black/[0.07] bg-white px-4 lg:hidden">
        <span className="font-display text-base font-extrabold">{brandName}</span>
        <button
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-black/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <div className="relative h-full">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <AdminSidebar brandName={brandName} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
