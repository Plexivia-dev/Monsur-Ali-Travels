import * as React from "react"
import { cn } from "@/lib/utils"

export const TooltipProvider = ({ children }) => {
  return <>{children}</>
}

export const Tooltip = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen })
        }
        return child
      })}
    </div>
  )
}

export const TooltipTrigger = ({ children, isOpen, ...props }) => {
  return (
    <div className="inline-block cursor-help" {...props}>
      {children}
    </div>
  )
}

export const TooltipContent = ({ children, isOpen, side = "top", className }) => {
  if (!isOpen) return null

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      className={cn(
        "absolute z-50 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 border border-border whitespace-nowrap",
        positions[side],
        className
      )}
    >
      {children}
    </div>
  )
}
