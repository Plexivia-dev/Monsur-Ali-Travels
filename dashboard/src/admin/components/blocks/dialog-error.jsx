import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function ErrorDialog({
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onClose,
  trigger,
  title = "Confirm Deletion",
  description = "Are you sure you want to perform this action? This operation is permanent and cannot be undone."
}) {
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        />

        {/* Dialog content */}
        <div className="relative z-50 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500/80 shadow-xs transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold leading-none tracking-tight text-white">
                {title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-300 border border-rose-500/40 hover:border-rose-500/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
