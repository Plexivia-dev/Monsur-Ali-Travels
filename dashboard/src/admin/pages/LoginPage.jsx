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
        <Card className="shadow-2xl border-zinc-200 bg-white text-zinc-900 overflow-hidden rounded-2xl">
          <CardHeader className="px-5 pt-6 pb-4 text-center border-b border-zinc-100 bg-zinc-50/60 flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center gap-3.5">
              <img src={logo} alt="Monsur Ali Travels Logo" className="h-14 w-14 p-0.5 bg-zinc-100 rounded-full object-contain shadow-xs shrink-0" />
              <div className="text-left flex flex-col justify-center leading-none space-y-1">
                <span className="font-extrabold text-[1.15rem] tracking-[0.08em] text-zinc-950 uppercase font-['Outfit','Josefin_Sans',sans-serif]">
                  Monsur Ali
                </span>
                <span className="font-extrabold text-[0.85rem] tracking-[0.25em] text-[#0b3a60] uppercase font-['Outfit','Josefin_Sans',sans-serif]">
                  Travels
                </span>
              </div>
            </div>
            <CardDescription className="text-xs text-zinc-500 pt-1 font-medium">
              Secure administration portal
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-zinc-700 font-medium text-xs">
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 text-xs bg-zinc-900 text-white border-zinc-800 placeholder:text-zinc-500 focus:border-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg shadow-inner"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-700 font-medium text-xs">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-zinc-500 hover:text-zinc-800 hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 text-xs bg-zinc-900 text-white border-zinc-800 placeholder:text-zinc-500 focus:border-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="w-full mt-[20px] h-10 flex items-center justify-center font-semibold text-xs bg-[#0b3a60] hover:bg-[#082a46] text-white transition cursor-pointer shadow-md rounded-lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
