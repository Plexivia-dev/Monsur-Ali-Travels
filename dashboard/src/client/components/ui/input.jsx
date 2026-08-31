import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-lg border border-black/15 bg-white px-3 py-1 text-sm text-black shadow-2xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-black placeholder:text-black/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          className
        )}
        {...props}
      />
    );

    if (label || error || helperText) {
      return (
        <div className="w-full space-y-1.5">
          {label && (
            <label className="text-xs font-semibold text-black/80 tracking-wide">
              {label}
            </label>
          )}
          {inputElement}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {helperText && !error && <p className="text-xs text-black/60">{helperText}</p>}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";

function Select({ className, label, error, children, ...props }) {
  const selectElement = (
    <select
      className={cn(
        "flex h-9 w-full rounded-lg border border-black/15 bg-white px-3 py-1 text-sm text-black transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        error && "border-destructive focus:border-destructive focus:ring-destructive/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );

  if (label || error) {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-black/80 tracking-wide">
            {label}
          </label>
        )}
        {selectElement}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return selectElement;
}

export { Input, Select };
export default Input;
