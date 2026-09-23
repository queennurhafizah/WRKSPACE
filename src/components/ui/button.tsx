import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-sans font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-brand bg-brand text-white shadow-brand-glow hover:brightness-105 active:scale-[0.98]",
        secondary:
          "border-2 border-sky bg-transparent text-sky-text hover:bg-sky-soft active:scale-[0.98]",
        sky: "border-2 border-sky bg-sky text-white shadow-sky-glow hover:brightness-105 active:scale-[0.98]",
        outline:
          "border-2 border-brand bg-transparent text-brand-text hover:bg-brand-soft active:scale-[0.98]",
        ghost:
          "border-2 border-transparent bg-transparent text-ink hover:bg-black/5 active:scale-[0.98]",
        danger:
          "border-2 border-rose bg-rose-soft text-rose-deep hover:bg-rose hover:text-white active:scale-[0.98]",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
