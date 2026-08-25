import * as React from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = ({ children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const menuRef = React.useRef(null)

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuTrigger = ({ render, children, isOpen, setIsOpen }) => {
  const element = render || children
  return React.cloneElement(element, {
    onClick: () => setIsOpen(!isOpen),
  })
}

export const DropdownMenuContent = ({ children, isOpen, setIsOpen, align = "end", className }) => {
  if (!isOpen) return null

  const alignments = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md min-w-[8rem] overflow-hidden animate-in fade-in-0 zoom-in-95",
        alignments[align],
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuGroup = ({ children, setIsOpen }) => {
  return (
    <div className="flex flex-col">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuItem = ({ children, variant, render, onClick, setIsOpen, className }) => {
  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (setIsOpen) setIsOpen(false)
  }

  const baseClasses = cn(
    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground gap-2",
    variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive",
    className
  )

  if (render) {
    return React.cloneElement(render, {
      className: cn(baseClasses, render.props.className),
      onClick: (e) => {
        handleClick(e)
        if (render.props.onClick) render.props.onClick(e)
      }
    })
  }

  return (
    <div onClick={handleClick} className={baseClasses}>
      {children}
    </div>
  )
}

export const DropdownMenuLabel = ({ children, className }) => {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-semibold", className)}>
      {children}
    </div>
  )
}

export const DropdownMenuSeparator = () => {
  return <div className="-mx-1 my-1 h-px bg-border" />
}

export const DropdownMenuRadioGroup = ({ children, value, onValueChange, setIsOpen }) => {
  return (
    <div className="flex flex-col">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedValue: value,
            onSelect: (val) => {
              onValueChange(val)
              if (setIsOpen) setIsOpen(false)
            },
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuRadioItem = ({ children, value, selectedValue, onSelect, className }) => {
  const isSelected = value === selectedValue

  return (
    <div
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/80 font-semibold",
        className
      )}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center mr-2">
        {isSelected && (
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
        )}
      </span>
      {children}
    </div>
  )
}
