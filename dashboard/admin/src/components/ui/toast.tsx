import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

export const Toaster = SonnerToaster

export const toast = {
  add: ({ title, description, type, actionProps }: {
    title: string
    description?: string
    type?: "success" | "info" | "warning" | "error" | "loading"
    actionProps?: { children: React.ReactNode; onClick: () => void }
  }) => {
    const options: any = {
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
  close: (id: string | number) => {
    sonnerToast.dismiss(id)
  },
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    data: {
      loading: string
      success: string | ((result: T) => string)
      error: string | ((err: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, data)
  }
}
