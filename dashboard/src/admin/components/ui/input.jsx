import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

function Select({ className, label, error, children, ...props }) {
  const selectElement = (
    <select
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
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
          <label className="text-xs font-semibold text-foreground/80 tracking-wide">
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

export { Input, Select }
export default Input;
