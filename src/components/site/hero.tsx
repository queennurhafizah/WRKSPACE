"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  brandName: string;
  tagline: string;
  centered?: boolean;
}

function fadeUp(delay: number, reduced: boolean) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
  };
}

export function Hero({ brandName, tagline, centered = true }: HeroProps) {
  const reduced = useReducedMotion() ?? false;

  const wrapClass = centered
    ? "flex flex-col items-center text-center mx-auto max-w-4xl gap-6"
    : "flex flex-col items-start max-w-3xl gap-6";

  return (
    <div className={wrapClass}>
      <motion.div {...fadeUp(0.05, reduced)}>
        <Badge
          icon={<Sparkles className="h-3 w-3" />}
          className="border-brand-border bg-brand-soft text-brand-text"
          iconClassName="bg-brand-border text-brand-deep"
        >
          Coworking space buat semua segmen
        </Badge>
      </motion.div>

      <motion.h1
        {...fadeUp(0.17, reduced)}
        className="font-display text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl"
      >
        Satu tempat,{" "}
        <span className="text-brand">semua</span>{" "}
        bisa berkarya.
      </motion.h1>

      <motion.p
        {...fadeUp(0.29, reduced)}
        className="font-accent text-2xl font-bold text-brand sm:text-3xl"
      >
        {tagline}
      </motion.p>

      <motion.p
        {...fadeUp(0.41, reduced)}
        className="max-w-xl text-lg leading-relaxed text-ink/70"
      >
        Dari mahasiswa, freelancer, sampai tim startup — pilih space yang cocok
        dan booking dalam hitungan detik di {brandName}.
      </motion.p>

      <motion.div
        {...fadeUp(0.53, reduced)}
        className="flex flex-wrap gap-3"
      >
        <Link href="/spaces">
          <Button size="lg">Pesan sekarang</Button>
        </Link>
        <Link href="/promo">
          <Button variant="secondary" size="lg">
            Lihat promo
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
