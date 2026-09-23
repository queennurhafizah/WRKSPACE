import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border-2 border-black/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:opacity-60";

// ---------- Field wrapper (label + error) ----------
interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-ink"
        >
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-text">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

// ---------- Input ----------
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseField, className)} {...props} />
));
Input.displayName = "Input";

// ---------- Textarea ----------
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, "min-h-[96px] resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// ---------- Select ----------
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(baseField, "appearance-none bg-white pr-9", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
