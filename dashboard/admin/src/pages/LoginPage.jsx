import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogIn, Mail, Lock } from "lucide-react"
import { useAuth } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { getErrorMessage } from "@/lib/error-handler"

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate("/admin")
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

  const handleGoogleLogin = () => {
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here"
    const redirectUri = window.location.origin + "/login"
    const scope = "openid email profile"
    const responseType = "code"
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=select_account`
    window.location.href = authUrl
  }

  return (
    <div className="dark min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-70 animate-pulse" />

      <div className="w-full max-w-[400px] relative z-10">
        <Card className="shadow-2xl border-border bg-card/90 text-card-foreground backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="px-5 pt-5 pb-3 text-center border-b border-border/80 bg-card/40">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center justify-center gap-1.5 text-foreground">
              ADMIN DASHBOARD LOGIN
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Secure store administration portal
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 text-xs bg-background/60 border-border text-foreground focus:border-primary placeholder:text-muted-foreground/40 rounded-lg"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Password
                  </label>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10 text-xs bg-background/60 border-border text-foreground focus:border-primary placeholder:text-muted-foreground/40 rounded-lg"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="w-full mt-3 h-10 flex items-center justify-center font-semibold text-xs bg-foreground hover:bg-foreground/90 text-background transition cursor-pointer shadow-md rounded-lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-1.5" />
                )}
                {isSubmitting ? "Signing In…" : "Log In"}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-semibold">Or continue with</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-10 flex items-center justify-center font-semibold text-xs border-border bg-background/40 hover:bg-background/80 hover:text-white transition cursor-pointer shadow-sm rounded-lg"
              >
                <GoogleIcon />
                Google Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
