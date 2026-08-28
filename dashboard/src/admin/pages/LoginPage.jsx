import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogIn, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/store/useAuthStore"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { getErrorMessage } from "@/lib/error-handler"
import { apiClient } from "@/lib/api-client"
import logo from "@/assets/logo.png"

export function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Mode: 'login' | 'forgot_request' | 'forgot_reset' | 'forgot_success'
  const [viewMode, setViewMode] = useState("login")

  // Login State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isResetSubmitting, setIsResetSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

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
      await login(email.trim(), password)
      toast.add({ title: "Logged in successfully.", type: "success" })
    } catch (err) {
      toast.add({ title: getErrorMessage(err, "Sign in failed"), type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestResetOtp = async (e) => {
    e.preventDefault()
    const targetEmail = resetEmail.trim() || email.trim()
    if (!targetEmail) {
      toast.add({ title: "Please enter your registered email address.", type: "error" })
      return
    }

    setIsResetSubmitting(true)
    try {
      const res = await apiClient.post("/api/v1/auth/forgot-password", { email: targetEmail })
      setResetEmail(targetEmail)
      toast.add({ title: res.data?.message || "Verification code sent to email.", type: "success" })
      setViewMode("forgot_reset")
      setResendCooldown(60)
    } catch (err) {
      toast.add({ title: getErrorMessage(err, "Failed to send reset code"), type: "error" })
    } finally {
      setIsResetSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetOtp.trim()) {
      toast.add({ title: "Please enter the 6-digit verification code.", type: "error" })
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.add({ title: "New password must be at least 6 characters long.", type: "error" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.add({ title: "New passwords do not match. Please verify.", type: "error" })
      return
    }

    setIsResetSubmitting(true)
    try {
      const res = await apiClient.post("/api/v1/auth/reset-password", {
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      })

      toast.add({ title: res.data?.message || "Password reset successfully!", type: "success" })
      setViewMode("forgot_success")
      setEmail(resetEmail.trim())
      setPassword("")
    } catch (err) {
      toast.add({ title: getErrorMessage(err, "Password reset failed"), type: "error" })
    } finally {
      setIsResetSubmitting(false)
    }
  }

  return (
    <div className="dark min-h-screen w-full bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-70 animate-pulse" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-[#121214]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Logo Container with light gray background */}
            <div className="size-16 rounded-2xl bg-zinc-200 border border-zinc-300/80 p-2.5 flex items-center justify-center shadow-md">
              <img src={logo} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black tracking-tight text-white uppercase font-sans">
                MONSUR ALI TRAVELS
              </h1>
              <p className="text-xs font-medium text-zinc-400">
                {viewMode === "login" && "Administration & Management Portal"}
                {viewMode === "forgot_request" && "Password Recovery Request"}
                {viewMode === "forgot_reset" && "Reset Your Account Password"}
                {viewMode === "forgot_success" && "Password Successfully Reset"}
              </p>
            </div>
          </div>

          {/* VIEW 1: Login Form */}
          {viewMode === "login" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold text-zinc-300">
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    name="admin_login_email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-300">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email)
                      setViewMode("forgot_request")
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="admin_login_password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Log In Button Container with guaranteed 20px top space */}
              <div className="pt-5" style={{ paddingTop: '20px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-1.5" />
                  )}
                  {isSubmitting ? "Logging In…" : "Log In"}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: Request Reset OTP */}
          {viewMode === "forgot_request" && (
            <form onSubmit={handleRequestResetOtp} className="flex flex-col gap-4" autoComplete="off">
              {/* Info Container with dark screen background color (#09090b) */}
              <div className="text-left bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-400 leading-relaxed shadow-inner">
                Enter your registered administrator email address to receive a secure 6-digit password reset code.
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold text-zinc-300">
                  Account Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="pt-5" style={{ paddingTop: '20px' }}>
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-1.5" />
                  )}
                  {isResetSubmitting ? "Sending Verification Code…" : "Send Verification Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("login")}
                className="w-full h-9 flex items-center justify-center font-medium text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Back to Log In</span>
              </button>
            </form>
          )}

          {/* VIEW 3: Verify OTP & New Password */}
          {viewMode === "forgot_reset" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4" autoComplete="off">
              {/* OTP Target Banner with dark screen background color (#09090b) */}
              <div className="text-left bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 shadow-inner">
                <span>Enter the 6-digit code sent to: </span>
                <span className="font-bold text-white block mt-0.5">{resetEmail}</span>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-300">
                    6-Digit Verification Code
                  </Label>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isResetSubmitting}
                    onClick={handleRequestResetOtp}
                    className="text-[11px] text-zinc-400 hover:text-white disabled:opacity-50 transition cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 h-10 text-sm font-mono tracking-widest bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all text-center font-bold"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold text-zinc-300">
                  New Password
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold text-zinc-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <div className="pt-5" style={{ paddingTop: '20px' }}>
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-1.5" />
                  )}
                  {isResetSubmitting ? "Updating Password…" : "Reset & Save Password"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("forgot_request")}
                className="w-full h-9 flex items-center justify-center font-medium text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Change Email</span>
              </button>
            </form>
          )}

          {/* VIEW 4: Success View */}
          {viewMode === "forgot_success" && (
            <div className="flex flex-col gap-4 text-center py-2">
              <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Password Reset Successful
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your administrator password has been securely updated. You can now log in using your new credentials.
                </p>
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setViewMode("login")}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99]"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span>Proceed to Log In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 text-center mt-4">
          © 2026 Monsur Ali Travels. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
