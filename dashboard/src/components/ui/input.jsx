import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, label, error, helperText, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-foreground/80 tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "w-full rounded-lg border border-input bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

function Select({ className, label, error, children, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-foreground/80 tracking-wide">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full rounded-lg border border-input bg-card/60 px-3 py-2 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { Input, Select };
export default Input;
