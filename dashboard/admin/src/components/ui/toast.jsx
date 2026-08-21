import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

export const Toaster = SonnerToaster

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

    if (type === "success") return sonnerToast.success(title, options)
    if (type === "error") return sonnerToast.error(title, options)
    if (type === "warning") return sonnerToast.warning(title, options)
    if (type === "info") return sonnerToast.info(title, options)
    if (type === "loading") return sonnerToast.loading(title, options)

    return sonnerToast(title, options)
  },
  close: (id) => {
    sonnerToast.dismiss(id)
  },
  promise: (promise, data) => {
    return sonnerToast.promise(promise, data)
  }
}
