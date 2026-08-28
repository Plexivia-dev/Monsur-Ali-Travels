import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { handleGlobalError } from '@/lib/error-handler';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'forgot_request' | 'forgot_reset' | 'forgot_success'
  const [viewMode, setViewMode] = useState('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (isAuthLoading) {
    return (
      <div className="dark min-h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <div className="h-9 w-9 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">
          Authenticating secure session...
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
        <div className="bg-[#121214]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl rounded-2xl p-6 sm:p-7 space-y-6">
          {/* Top Branding Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Logo Container with light gray background */}
            <div className="size-16 rounded-2xl bg-zinc-200 border border-zinc-300/80 p-2.5 flex items-center justify-center shadow-md">
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
                className="flex flex-col gap-4"
                autoComplete="off"
              >
                {/* Email Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="user_login_email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
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
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="user_login_password"
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
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Log In Button with explicit 20px margin-top */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                  style={{ marginTop: '20px' }}
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-1.5" />
                  )}
                  {isSubmitting ? 'Logging In…' : 'Log In'}
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
                className="flex flex-col gap-4"
                autoComplete="off"
              >
                {/* Info Container with dark screen background color (#09090b) */}
                <div className="text-left bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-400 leading-relaxed shadow-inner">
                  Enter your registered account email address. We will send a secure 6-digit verification code to reset your password.
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="forgot_email"
                      autoComplete="off"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                  style={{ marginTop: '20px' }}
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
                  <span>Back to Log In</span>
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
                className="flex flex-col gap-4"
                autoComplete="off"
              >
                {/* OTP Target Banner with dark screen background color (#09090b) */}
                <div className="text-left bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 shadow-inner">
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

                {/* New Password Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
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

                {/* Confirm Password Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 h-10 text-xs bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-60"
                  style={{ marginTop: '20px' }}
                >
                  {isResetSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
                className="flex flex-col gap-4 text-center py-2"
              >
                <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Password Reset Successful
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your password has been securely updated. You can now log in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-[0.99]"
                  style={{ marginTop: '10px' }}
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span>Proceed to Log In</span>
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
