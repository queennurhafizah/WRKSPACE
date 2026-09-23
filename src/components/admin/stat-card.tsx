import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  tone?: "brand" | "sky" | "sage" | "butter" | "grape";
}

const TONE = {
  brand: { wrap: "bg-brand-soft", icon: "bg-brand-border text-brand-deep", value: "text-brand-deep" },
  sky:   { wrap: "bg-sky-soft",   icon: "bg-sky-border text-sky-deep",     value: "text-sky-deep"   },
  sage:  { wrap: "bg-sage-soft",  icon: "bg-sage-border text-sage-deep",   value: "text-sage-deep"  },
  butter:{ wrap: "bg-butter-soft",icon: "bg-butter-border text-butter-deep",value: "text-butter-deep"},
  grape: { wrap: "bg-grape-soft", icon: "bg-grape-border text-grape-deep", value: "text-grape-deep" },
};

export function StatCard({ label, value, sub, icon, tone = "brand" }: StatCardProps) {
  const t = TONE[tone];
  return (
    <div className={cn("rounded-2xl p-5", t.wrap)}>
      <div className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", t.icon)}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-extrabold", t.value)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
    </div>
  );
}
