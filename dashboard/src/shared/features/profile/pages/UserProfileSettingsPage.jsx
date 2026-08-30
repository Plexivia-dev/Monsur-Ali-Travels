import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  RefreshCw,
  Clock,
  IdCard,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UsersPage from '@/admin/pages/UsersPage';

// Pre-curated professional avatar collection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
];

export function UserProfileSettingsPage({ initialTab = 'profile', onProfileUpdated = null }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'security' | 'account' | 'users'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form Profile State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    address: '',
    bio: '',
    avatar: '',
    role: '',
    subRole: '',
    did: '',
    lastLogin: '',
  });

  // Password Change State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Fetch current user profile
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/auth/me');
      const user = res.data?.data || {};
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
        department: user.department || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        role: user.role || 'Staff',
        subRole: user.subRole || '',
        did: user.did || user.id || '',
        lastLogin: user.lastLogin || '',
      });
    } catch (err) {
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle avatar file upload with automatic image resizing/compression
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Avatar file size must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result;
      if (!rawBase64) return;

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, avatar: optimizedBase64 }));
        toast.success('Avatar image selected. Click "Save Changes" to apply.');
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, avatar: String(rawBase64) }));
        toast.success('Avatar image selected. Click "Save Changes" to apply.');
      };
      img.src = String(rawBase64);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      };

      const res = await apiClient.put('/api/v1/auth/profile', payload);
      const updated = res.data?.data;

      // Update local storage user
      try {
        const cachedRaw = localStorage.getItem('user');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const newCache = { ...cached, ...updated };
          localStorage.setItem('user', JSON.stringify(newCache));
        }
      } catch (e) {}

      toast.success('Profile updated successfully!');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passData.newPassword || passData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPass(true);
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      toast.success('Password changed successfully!');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const displayName = formData.name || 'User Profile';
  const displayRole = formData.role === 'Staff' && formData.subRole ? `Staff (${formData.subRole.replace('_', ' ')})` : formData.role;

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="size-8 text-primary animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">Loading Account Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="size-20 border-2 border-primary/30 shadow-md">
                <AvatarImage src={formData.avatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-file-upload-top"
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
                title="Change Avatar"
              >
                <Camera className="size-5" />
              </label>
              <input
                id="avatar-file-upload-top"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-foreground">{displayName}</h1>
                <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                  {displayRole}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{formData.email}</p>
              {formData.designation && (
                <p className="text-[11px] font-medium text-foreground/80 mt-0.5">
                  {formData.designation} {formData.department ? `• ${formData.department}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProfile}
              className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Reload</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <User className="size-4" />
            <span>Profile & Bio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Lock className="size-4" />
            <span>Security & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'account'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>Account Verification</span>
          </button>

          {['Owner', 'Admin', 'Superadmin', 'superadmin', 'owner', 'admin'].includes(formData.role) && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Users className="size-4" />
              <span>User & Role Management</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PROFILE & AVATAR SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Customization Section */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                <Camera className="size-4 text-primary" />
                User Avatar Customization
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a custom photo or choose from our professional curated avatar gallery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <Avatar className="size-16 border-2 border-primary/40 shadow-sm shrink-0">
                <AvatarImage src={formData.avatar} alt="Current Avatar" />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="avatar-file-upload"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>Upload Custom Photo</span>
                </label>
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: AVATAR_PRESETS[0] }))}
                  className="h-9 px-3 rounded-xl text-xs cursor-pointer"
                >
                  Reset Default
                </Button>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Quick Avatar Presets:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {AVATAR_PRESETS.map((presetUrl, idx) => {
                  const isSelected = formData.avatar === presetUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: presetUrl }))}
                      className={`relative rounded-full transition-transform hover:scale-105 cursor-pointer p-0.5 ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={presetUrl} alt={`Preset ${idx + 1}`} />
                      </Avatar>
                      {isSelected && (
                        <CheckCircle2 className="size-3.5 text-primary absolute -bottom-0.5 -right-0.5 bg-card rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Personal & Professional Information Form */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <User className="size-4 text-primary" />
              Personal & Professional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                  required
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Email Address (Login Identity)</label>
                <Input
                  value={formData.email}
                  disabled
                  className="h-10 text-xs bg-muted border-border rounded-xl text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Phone / Mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Contact Phone / WhatsApp</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 17XX XXXXXX"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Designation / Role Title</label>
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g. Visa Executive, Managing Director, Accountant"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Operations, Legal & Visa, Accounts"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Office / Contact Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Monsur Ali Travels, Dhaka, Bangladesh"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                />
              </div>
            </div>

            {/* Bio / Introduction */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">Staff Bio & Operational Notes</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description of responsibilities, operational skills, and schedule notes..."
                rows={3}
                className="w-full p-3 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-6 font-bold text-xs rounded-xl gap-2 cursor-pointer shadow-md"
              >
                <Save className={`size-4 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              Change Login Password
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ensure your account uses a strong, unique password with at least 6 characters.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Current Password *</label>
              <div className="relative">
                <Input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passData.currentPassword}
                  onChange={(e) => setPassData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">New Password (Min 6 chars) *</label>
              <div className="relative">
                <Input
                  type={showNewPass ? 'text' : 'password'}
                  value={passData.newPassword}
                  onChange={(e) => setPassData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new strong password"
                  className="h-10 text-xs bg-muted/40 border-border rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Confirm New Password *</label>
              <Input
                type="password"
                value={passData.confirmPassword}
                onChange={(e) => setPassData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className="h-10 text-xs bg-muted/40 border-border rounded-xl"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-border max-w-lg">
            <Button
              type="submit"
              disabled={changingPass}
              className="h-10 px-6 font-bold text-xs rounded-xl gap-2 cursor-pointer shadow-md"
            >
              <Lock className={`size-4 ${changingPass ? 'animate-spin' : ''}`} />
              <span>{changingPass ? 'Updating Password...' : 'Update Password'}</span>
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: ACCOUNT DETAILS */}
      {activeTab === 'account' && (
        <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-sm font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            Account Security & System Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Digital Identity (DID)</span>
              <p className="font-mono font-bold text-primary truncate">{formData.did || 'did_usr_...'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">System Authority Level</span>
              <p className="font-bold text-foreground">{displayRole}</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Account Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                <CheckCircle2 className="size-3 mr-1" /> Active & Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Last Session Login</span>
              <p className="font-medium text-foreground">
                {formData.lastLogin ? new Date(formData.lastLogin).toLocaleString('en-GB') : 'Just now'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM USERS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <UsersPage />
        </div>
      )}
    </div>
  );
}

export default UserProfileSettingsPage;
