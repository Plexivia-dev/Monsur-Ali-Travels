import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorDialogProps {
  isOpen?: boolean
  defaultOpen?: boolean
  onClose?: () => void
  trigger?: React.ReactNode
  title?: string
  description?: string
}

export default function ErrorDialog({
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onClose,
  trigger,
  title = "Confirm Deletion",
  description = "Are you sure you want to perform this action? This operation is permanent and cannot be undone."
}: ErrorDialogProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(defaultOpen)
  const isCurrentlyOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen

  const handleClose = () => {
    if (controlledIsOpen === undefined) {
      setUncontrolledIsOpen(false)
    }
    if (onClose) onClose()
  }

  const handleOpen = () => {
    if (controlledIsOpen === undefined) {
      setUncontrolledIsOpen(true)
    }
  }

  if (!isCurrentlyOpen) {
    return trigger ? <div onClick={handleOpen} className="inline-block">{trigger}</div> : null
  }

  return (
    <>
      {trigger && <div onClick={handleOpen} className="inline-block">{trigger}</div>}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <div 
          onClick={handleClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        />

        {/* Dialog content */}
        <div className="relative z-50 w-full max-w-md rounded-xl border border-destructive/20 bg-card p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClose} size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
