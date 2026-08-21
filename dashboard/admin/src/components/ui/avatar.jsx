import * as React from "react"
import { cn } from "@/lib/utils"

export const Avatar = React.forwardRef(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "h-10 w-10",
      sm: "h-8 w-8",
      lg: "h-12 w-12",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Avatar.displayName = "Avatar"

export const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold text-xs",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"
