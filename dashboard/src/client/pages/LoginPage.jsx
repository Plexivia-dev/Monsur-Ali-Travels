import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { handleGlobalError } from '@/lib/error-handler';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const { user, login, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'forgot_request' | 'forgot_reset' | 'forgot_success'
  const [viewMode, setViewMode] = useState('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (code) {
        setIsGoogleSigningIn(true);
        const redirectUri = window.location.origin + '/login';
        loginWithGoogle(code, redirectUri)
          .then(() => {
            toast.success('Logged in with Google successfully.');
          })
          .catch((err) => {
            handleGlobalError(err);
            setIsGoogleSigningIn(false);
            navigate('/login', { replace: true });
          });
      }
    }
  }, [loginWithGoogle, location.search, navigate]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isAuthLoading, navigate]);

  // Handle standard login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Logged in successfully.');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Request Password Reset Code
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/auth/forgot-password', { email: targetEmail });
      setResetEmail(targetEmail);
      toast.success(res.data?.message || 'Verification code sent to your email.');
      setViewMode('forgot_reset');
      setResendCooldown(60);
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsResetSubmitting(false);
    }
  };

  // Step 2: Submit OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match. Please verify.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/auth/reset-password', {
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });

      toast.success(res.data?.message || 'Password reset successfully!');
      setViewMode('forgot_success');
      setEmail(resetEmail.trim());
      setPassword('');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here';
    const redirectUri = window.location.origin + '/login';
    const scope = 'openid email profile';
    const responseType = 'code';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  if (isAuthLoading || isGoogleSigningIn) {
    return (
      <div className="dark min-h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <div className="h-9 w-9 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">
          {isGoogleSigningIn ? 'Signing in with Google...' : 'Authenticating secure session...'}
        </span>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen w-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none opacity-60" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none opacity-40" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10 my-auto"
      >
        <div className="bg-[#121214]/90 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl rounded-2xl p-6 sm:p-7 space-y-6">
          {/* Top Branding Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="size-16 rounded-2xl bg-zinc-900 border border-zinc-700/60 p-2.5 flex items-center justify-center shadow-md">
              <img
                src={logo}
                alt="Monsur Ali Travels Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black tracking-tight text-white uppercase font-sans">
                MONSUR ALI TRAVELS
              </h1>
              <p className="text-xs font-medium text-zinc-400">
                {viewMode === 'login' && 'Operations & Staff Workspace Portal'}
                {viewMode === 'forgot_request' && 'Password Recovery Request'}
                {viewMode === 'forgot_reset' && 'Reset Your Account Password'}
                {viewMode === 'forgot_success' && 'Password Successfully Reset'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* VIEW 1: Standard Login Form */}
            {viewMode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
                autoComplete="off"
              >
                {/* Email Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="user_login_email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setViewMode('forgot_request');
                      }}
                      className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="user_login_password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 h-10 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Log In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 h-10 flex items-center justify-center font-bold text-xs bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-1.5" />
                  )}
                  {isSubmitting ? 'Signing In…' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                    Or continue with
                  </span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-10 flex items-center justify-center font-medium text-xs border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <GoogleIcon />
                  <span>Google Account</span>
                </button>
              </motion.form>
            )}

            {/* VIEW 2: Forgot Password - Request Email OTP */}
            {viewMode === 'forgot_request' && (
              <motion.form
                key="forgot-request-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRequestResetOtp}
                className="space-y-4"
                autoComplete="off"
              >
                <div className="text-left bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-400 leading-relaxed">
                  Enter your registered account email address. We will send a secure 6-digit verification code to reset your password.
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="forgot_email"
                      autoComplete="off"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-60"
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-1.5" />
                  )}
                  {isResetSubmitting ? 'Sending Verification Code…' : 'Send Verification Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full h-9 flex items-center justify-center font-medium text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Back to Sign In</span>
                </button>
              </motion.form>
            )}

            {/* VIEW 3: Forgot Password - Verify OTP & Set New Password */}
            {viewMode === 'forgot_reset' && (
              <motion.form
                key="forgot-reset-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
                autoComplete="off"
              >
                <div className="text-left bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300">
                  <span>Enter the 6-digit code sent to: </span>
                  <span className="font-bold text-white block mt-0.5">{resetEmail}</span>
                </div>

                {/* 6-Digit OTP Field */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isResetSubmitting}
                      onClick={handleRequestResetOtp}
                      className="text-[11px] text-zinc-400 hover:text-white disabled:opacity-50 transition cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-3.5 h-10 text-sm font-mono tracking-widest bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all text-center"
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 h-10 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-60"
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-1.5" />
                  )}
                  {isResetSubmitting ? 'Updating Password…' : 'Reset & Save Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('forgot_request')}
                  className="w-full h-9 flex items-center justify-center font-medium text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Change Email</span>
                </button>
              </motion.form>
            )}

            {/* VIEW 4: Success State */}
            {viewMode === 'forgot_success' && (
              <motion.div
                key="forgot-success-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center py-2"
              >
                <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Password Reset Successful
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your password has been securely updated. You can now sign in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span>Proceed to Sign In</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-400 text-center mt-4">
          © 2026 Monsur Ali Travels. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
