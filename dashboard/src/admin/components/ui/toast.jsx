import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

export const Toaster = (props) => {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="light"
      className="font-sans"
      closeButton
      toastOptions={{
        classNames: {
          toast: "group flex items-start gap-3 w-[360px] p-4 rounded-xl border border-black/10 font-sans shadow-2xl transition-all duration-300 bg-white text-zinc-900",
          success: "border-emerald-500/35 bg-emerald-50 text-emerald-900 [&_svg]:text-emerald-600",
          error: "border-red-500/35 bg-red-50 text-red-900 [&_svg]:text-red-600",
          warning: "border-amber-500/35 bg-amber-50 text-amber-900 [&_svg]:text-amber-600",
          info: "border-sky-500/35 bg-sky-50 text-sky-900 [&_svg]:text-sky-600",
          closeButton: "!left-auto !right-0 !top-0 !translate-x-[35%] !-translate-y-[35%] !opacity-100 !bg-red-500/10 !text-red-600 !border !border-red-500/30 hover:!bg-red-500/20 shadow-md cursor-pointer",
        },
        style: {
          background: "#ffffff",
        }
      }}
      {...props}
    />
  )
}

export const toast = {
  success: (message, options) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />,
      ...options,
    })
  },
  error: (message, options) => {
    return sonnerToast.error(message, {
      icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
      ...options,
    })
  },
  warning: (message, options) => {
    return sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
      ...options,
    })
  },
  info: (message, options) => {
    return sonnerToast.info(message, {
      icon: <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
      ...options,
    })
  },
  loading: (message, options) => sonnerToast.loading(message, options),
  dismiss: (id) => sonnerToast.dismiss(id),
  close: (id) => sonnerToast.dismiss(id),
  promise: (promise, data) => sonnerToast.promise(promise, data),
  add: ({ title, description, type, actionProps }) => {
    const options = { description }
    if (actionProps) {
      options.action = {
        label: actionProps.children,
        onClick: actionProps.onClick,
      }
    }
    if (type === "success") {
      return sonnerToast.success(title, {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />,
        ...options
      })
    }
    if (type === "error") {
      return sonnerToast.error(title, {
        icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
        ...options
      })
    }
    if (type === "warning") {
      return sonnerToast.warning(title, {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
        ...options
      })
    }
    if (type === "info") {
      return sonnerToast.info(title, {
        icon: <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
        ...options
      })
    }
    return sonnerToast(title, options)
  },
}

export default toast
