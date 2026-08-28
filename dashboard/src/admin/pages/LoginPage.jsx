import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { getErrorMessage } from "@/lib/error-handler"
import logo from "@/assets/logo.png"

export function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && user) {
      const roleStr = String(user.role || '').toLowerCase()
      if (['owner', 'admin'].includes(roleStr)) {
        navigate("/admin", { replace: true })
      } else {
        window.location.replace("/client.html")
      }
    }
  }, [user, isAuthLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.add({ title: "Please enter both email and password.", type: "error" })
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      toast.add({ title: "Logged in successfully.", type: "success" })
    } catch (err) {
      toast.add({ title: getErrorMessage(err, "Sign in failed"), type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dark min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-70 animate-pulse" />

      <div className="w-full max-w-[400px] relative z-10">
        <Card className="shadow-2xl border-border bg-card/90 text-card-foreground backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="px-5 pt-5 pb-3 text-center border-b border-border/80 bg-card/40 flex flex-col items-center justify-center">
            <img src={logo} alt="Monsur Ali Travels Logo" className="h-16 w-16 p-2 bg-white rounded-full object-contain mb-1.5 shadow-sm" />
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Secure administration portal
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 text-xs bg-white text-zinc-900 border-zinc-300 placeholder:text-zinc-400 focus:border-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 text-xs bg-white text-zinc-900 border-zinc-300 placeholder:text-zinc-400 focus:border-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-700 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="w-full mt-4 h-10 flex items-center justify-center font-semibold text-xs bg-foreground hover:bg-foreground/90 text-background transition cursor-pointer shadow-md rounded-lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-1.5" />
                )}
                {isSubmitting ? "Signing In…" : "Log In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
