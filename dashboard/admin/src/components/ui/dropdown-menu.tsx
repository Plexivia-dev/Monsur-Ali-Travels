import * as React from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = ({ children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuTrigger = ({ render, isOpen, setIsOpen }: any) => {
  return React.cloneElement(render, {
    onClick: () => setIsOpen(!isOpen),
  })
}

export const DropdownMenuContent = ({ children, isOpen, setIsOpen, align = "end", className }: any) => {
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
        alignments[align as keyof typeof alignments],
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuRadioGroup = ({ children, value, onValueChange, setIsOpen }: any) => {
  return (
    <div className="flex flex-col">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selectedValue: value,
            onSelect: (val: any) => {
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

export const DropdownMenuRadioItem = ({ children, value, selectedValue, onSelect, className }: any) => {
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
