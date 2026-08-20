import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Phone,
  MapPin,
  AtSign,
  Camera,
  Trash2,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  Building,
  Calendar,
  BadgeCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { handleGlobalError } from '@/lib/error-handler';

export function UserProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    address: '',
    avatar: '',
  });

  const [initialData, setInitialData] = useState({
    name: '',
    username: '',
    phone: '',
    address: '',
    avatar: '',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync user data
  useEffect(() => {
    if (fetchProfile) fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user]);

  const initials = (formData.name || user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // Profile Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await apiClient.post('/api/v1/uploads/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.url) {
        const newAvatarUrl = res.data.data.url;
        setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
        toast.success(t('account.updateSuccess', 'Profile photo updated!'));
      }
    } catch (err) {
      handleGlobalError(err, 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  // Discard Changes
  const handleDiscard = () => {
    setFormData(initialData);
  };

  const isFormDirty =
    formData.name !== initialData.name ||
    formData.username !== initialData.username ||
    formData.phone !== initialData.phone ||
    formData.address !== initialData.address ||
    formData.avatar !== initialData.avatar;

  // Submit Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('account.fullNamePlaceholder', 'Please enter your full name'));
      return;
    }

    if (formData.username && formData.username.trim()) {
      const usernameClean = formData.username.trim();
      if (!/^[a-zA-Z0-9_.-]+$/.test(usernameClean)) {
        toast.error(t('account.usernameHelp', 'Username can only contain letters, numbers, underscores, dots, and hyphens.'));
        return;
      }
      if (usernameClean.length < 3) {
        toast.error('Username must be at least 3 characters.');
        return;
      }
    }

    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: formData.name.trim(),
        username: formData.username ? formData.username.trim() : null,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        avatar: formData.avatar,
      });

      setInitialData(formData);
      toast.success(t('account.updateSuccess', 'Profile updated successfully!'));
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error(t('account.usernameTaken', 'Username is already taken. Please try another.'));
      } else {
        handleGlobalError(err, t('errors.generic', 'Failed to update profile.'));
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Password Change
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error(t('account.currentPasswordPlaceholder', 'Enter current password'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('account.newPasswordPlaceholder', 'New password must be at least 6 characters'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('account.passwordMismatch', 'New password and confirmation do not match.'));
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success(t('account.passwordSuccess', 'Password changed successfully!'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      handleGlobalError(err, 'Failed to change password. Please verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <User className="w-6 h-6 text-primary" />
            <span>{t('account.title', 'Account & Profile Settings')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('account.subtitle', 'Manage your personal profile, contact information, unique username, and security credentials.')}
          </p>
        </div>
      </div>

      {/* Profile Overview Header Card */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with Upload Overlay */}
            <div className="relative group">
              <Avatar className="size-24 sm:size-28 border-4 border-background shadow-md ring-2 ring-border">
                <AvatarImage src={formData.avatar || ''} alt={formData.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Upload Action Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer ring-2 ring-background group-hover:scale-105"
                title={t('account.changePhoto', 'Change Photo')}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* User Meta Information */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                    <span>{formData.name || user?.name || 'Administrator'}</span>
                    <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {formData.username ? `@${formData.username}` : user?.email}
                  </p>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold uppercase">
                    {user?.role || 'Employee'}
                  </Badge>
                  {user?.department && (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                      {user.department}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <span>{user?.email}</span>
                </span>
                {formData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>{formData.phone}</span>
                  </span>
                )}
                {user?.did && (
                  <span className="font-mono text-[11px] bg-muted/60 px-2 py-0.5 rounded border border-border">
                    DID: {user.did}
                  </span>
                )}
              </div>

              {/* Photo Actions */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="h-7 text-xs gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('account.changePhoto', 'Change Photo')}</span>
                </Button>
                {formData.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('account.removePhoto', 'Remove Photo')}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Personal Info & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Personal Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>{t('account.personalInfo', 'Personal Information')}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t('account.personalInfoDesc', 'Update your name, unique username, and contact details across the ERP system.')}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveProfile}>
              <CardContent className="p-5 space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>{t('account.fullName', 'Full Name')}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('account.fullNamePlaceholder', 'Enter your full name')}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Custom Unique Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-primary" />
                      <span>{t('account.username', 'Custom Username')}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {t('common.status', 'Unique')}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm font-semibold">
                      @
                    </span>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, ''))}
                      placeholder={t('account.usernamePlaceholder', 'e.g. johndoe')}
                      className="pl-8 font-mono text-sm h-10"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t('account.usernameHelp', 'Unique handle across the platform (letters, numbers, underscores, dots, hyphens).')}
                  </p>
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{t('account.phone', 'Phone Number')}</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('account.phonePlaceholder', 'Enter your phone number')}
                      className="h-10 text-sm"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>{t('account.email', 'Email Address')}</span>
                      </span>
                      <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="h-10 text-sm bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{t('account.address', 'Address / Location')}</span>
                  </label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('account.addressPlaceholder', 'Enter your street address, city, and country')}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 px-5 py-3.5 flex items-center justify-between gap-3 bg-muted/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={!isFormDirty || isSavingProfile}
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t('account.discard', 'Discard Changes')}</span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!isFormDirty || isSavingProfile}
                  className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingProfile ? t('account.saving', 'Saving...') : t('account.saveChanges', 'Save Changes')}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right 1 Column: Security & System Credentials */}
        <div className="space-y-6">
          {/* Security & Password Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>{t('account.security', 'Security & Password')}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t('account.securityDesc', 'Update your account password to maintain system security.')}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleChangePasswordSubmit}>
              <CardContent className="p-5 space-y-3.5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('account.currentPassword', 'Current Password')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder={t('account.currentPasswordPlaceholder', 'Enter current password')}
                      className="pr-9 h-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('account.newPassword', 'New Password')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder={t('account.newPasswordPlaceholder', 'Enter new password (min 6 characters)')}
                      className="pr-9 h-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('account.confirmPassword', 'Confirm New Password')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder={t('account.confirmPasswordPlaceholder', 'Confirm your new password')}
                      className="pr-9 h-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 px-5 py-3 bg-muted/20">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    isChangingPassword
                  }
                  className="w-full text-xs gap-1.5 cursor-pointer"
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>{isChangingPassword ? t('account.saving', 'Saving...') : t('account.security', 'Update Password')}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* System Role & Security Info Card */}
          <Card className="border-border/80 shadow-xs bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Account Role & Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Access Level:</span>
                <span className="font-semibold text-foreground">{user?.role || 'Employee'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-[11px] text-foreground">{user?.did || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
