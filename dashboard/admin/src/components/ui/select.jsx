import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef(null)

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div ref={selectRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            isOpen,
            setIsOpen,
          })
        }
        return child;
      })}
    </div>
  )
}

export const SelectTrigger = ({ children, className, isOpen, setIsOpen, ...props }) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
    </button>
  )
}

export const SelectValue = ({ value, placeholder }) => {
  return <span>{value || placeholder}</span>
}

export const SelectContent = ({ children, isOpen, setIsOpen, value, onValueChange, className }) => {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 slide-in-from-top-1 mt-1",
        className
      )}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              selectedValue: value,
              onSelect: (val) => {
                onValueChange(val)
                setIsOpen(false)
              },
            })
          }
          return child;
        })}
      </div>
    </div>
  )
}

export const SelectItem = ({ children, value, selectedValue, onSelect, className }) => {
  const isSelected = value === selectedValue

  return (
    <div
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        isSelected && "bg-accent text-accent-foreground font-semibold",
        className
      )}
    >
      {children}
    </div>
  )
}
