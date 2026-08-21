import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

export const Toaster = (props) => {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      className="font-sans"
      closeButton
      toastOptions={{
        classNames: {
          toast: "group flex items-start gap-3 w-[360px] p-4 rounded-xl border font-sans shadow-2xl transition-all duration-300",
          success: "border-green-500/35 bg-green-950/20 text-green-400 [&_svg]:text-green-500",
          error: "border-red-500/35 bg-red-950/20 text-red-400 [&_svg]:text-red-500",
          warning: "border-amber-500/35 bg-amber-950/20 text-amber-400 [&_svg]:text-amber-500",
          info: "border-amber-500/35 bg-amber-950/20 text-amber-400 [&_svg]:text-amber-500",
          closeButton: "!left-auto !right-0 !top-0 !translate-x-[35%] !-translate-y-[35%] !opacity-100 !bg-gray-900 !text-white !border !border-gray-700 hover:!bg-gray-800 shadow-md",
        },
        style: {
          background: "rgba(9, 9, 11, 0.95)",
          backdropFilter: "blur(12px)",
        }
      }}
      {...props}
    />
  )
}

export const toast = {
  add: ({ title, description, type, actionProps }) => {
    const options = {
      description,
    }

    if (actionProps) {
      options.action = {
        label: actionProps.children,
        onClick: actionProps.onClick,
      }
    }

    // Embed rich icons matching the warning/success/error themes
    if (type === "success") {
      options.icon = <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      return sonnerToast.success(title, options)
    }
    if (type === "error") {
      options.icon = <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      return sonnerToast.error(title, options)
    }
    if (type === "warning") {
      options.icon = <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      return sonnerToast.warning(title, options)
    }
    if (type === "info") {
      options.icon = <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      return sonnerToast.info(title, options)
    }
    if (type === "loading") {
      return sonnerToast.loading(title, options)
    }

    return sonnerToast(title, options)
  },
  close: (id) => {
    sonnerToast.dismiss(id)
  },
  promise: (promise, data) => {
    return sonnerToast.promise(promise, data)
  }
}

export default toast
