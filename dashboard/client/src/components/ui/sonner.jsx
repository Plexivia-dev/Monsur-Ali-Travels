import { useThemeStore } from "../../store/useThemeStore"
import { Toaster as Sonner } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }) => {
  const isDark = useThemeStore((state) => state.isDark)
  const theme = isDark ? "dark" : "light"

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      visibleToasts={1}
      duration={3500}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        }
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          closeButton: "!left-auto !right-0 !top-0 !translate-x-[35%] !-translate-y-[35%] !opacity-100 !bg-card !text-foreground !border !border-border hover:!bg-muted shadow-xs",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
