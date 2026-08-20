import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, CheckCircle2, AlertCircle, Shield, Globe, Users, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { WebsiteSettings } from '../../types';

export function AdminSettingsView() {
  const [settings, setSettings] = useState<WebsiteSettings>({});
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('Rs.');
  const [footerDescription, setFooterDescription] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Multi-Admin Team Accounts state
  const [adminUsers, setAdminUsers] = useState<{ id: string; username: string; createdAt: string }[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  const loadAdminUsers = async () => {
    try {
      const users = await api.getAdminUsers();
      if (Array.isArray(users)) {
        setAdminUsers(users);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
        setBusinessName(data.businessName || 'Maryam Trade Center');
        setTagline(data.tagline || 'CARRY THE MOMENT');
        setCurrencySymbol(data.currencySymbol || 'Rs.');
        setFooterDescription(data.footerDescription || '');
        setInstagramUrl(data.instagramUrl || 'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo');
        setFacebookUrl(data.facebookUrl || 'https://www.facebook.com/profile.php?id=61593629782975');
      } catch (err: any) {
        setSettingsError(err.message || 'Failed to load settings');
      }
    };
    load();
    loadAdminUsers();
  }, []);

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim() || !newAdminPassword) {
      setUserError('Please provide both username and password for the new admin account.');
      return;
    }
    if (newAdminPassword.length < 6) {
      setUserError('Password must be at least 6 characters.');
      return;
    }

    try {
      setCreatingUser(true);
      setUserError('');
      await api.createAdminUser(newAdminUsername.trim(), newAdminPassword);
      setUserSuccess(`Authorized admin account "${newAdminUsername.trim()}" created successfully.`);
      setNewAdminUsername('');
      setNewAdminPassword('');
      await loadAdminUsers();
      setTimeout(() => setUserSuccess(''), 4000);
    } catch (err: any) {
      setUserError(err.message || 'Failed to create admin user account.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteAdminUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for admin "${name}"?`)) return;
    try {
      setUserError('');
      await api.deleteAdminUser(id);
      setUserSuccess(`Admin account "${name}" removed successfully.`);
      await loadAdminUsers();
      setTimeout(() => setUserSuccess(''), 4000);
    } catch (err: any) {
      setUserError(err.message || 'Failed to delete admin account.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsError('');
      const updated = await api.updateSettings({
        businessName,
        tagline,
        currencySymbol,
        footerDescription,
        instagramUrl,
        facebookUrl,
      });
      setSettings(updated);
      setSettingsSuccess('Website settings updated successfully');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPasswordError('Please provide both current and new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      await api.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Admin password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Ensure current password is correct.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
          Website Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6B74]">
          Configure general store attributes, currency formatting, social links, and manage authorized admin accounts
        </p>
      </div>

      {/* Authorized Admin Accounts / Multi-Admin Access */}
      <div className="bg-white rounded-3xl border border-[#EBE3D5] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0EAE1]">
          <Users className="w-4 h-4 text-[#BFA36D]" />
          <h3 className="font-serif text-lg font-semibold text-[#421C2D]">Authorized Admin Accounts (Shared Catalog)</h3>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE3D5] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#BFA36D] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5C4A54] leading-relaxed">
            <span className="font-bold text-[#421C2D]">Unified Shared Product Database: </span>
            All authorized admin accounts (e.g. Admin 1 / You and Admin 2 / Client) manage the <span className="font-semibold text-[#421C2D]">same central catalog</span>. Products uploaded by any admin account are universally published to the public storefront immediately.
          </div>
        </div>

        {userSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{userSuccess}</span>
          </div>
        )}

        {userError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{userError}</span>
          </div>
        )}

        {/* Current Admin Users List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#421C2D]">Active Admin Team Accounts</h4>
          <div className="divide-y divide-[#F0EAE1] border border-[#E5DDD0] rounded-2xl overflow-hidden bg-[#FAF8F5]">
            {adminUsers.map((u) => (
              <div key={u.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#421C2D] text-white flex items-center justify-center text-[11px] font-bold">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#24101A]">{u.username}</span>
                    <span className="text-[10px] text-[#8C7A84] block">Authorized Admin</span>
                  </div>
                </div>
                {adminUsers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAdminUser(u.id, u.username)}
                    className="p-1.5 rounded-lg text-[#8C7A84] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove admin access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Authorized Admin Form */}
        <form onSubmit={handleCreateAdminUser} className="pt-3 border-t border-[#F0EAE1] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-[#BFA36D]" />
            <span>Authorize New Admin Account (e.g. Client / Co-Admin)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#5C4A54] mb-1">Username</label>
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="client_admin"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#5C4A54] mb-1">Password (min. 6 characters)</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={creatingUser}
              className="px-5 py-2 rounded-xl bg-[#BFA36D] hover:bg-[#A88E5A] text-[#24101A] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{creatingUser ? 'Creating...' : 'Add Authorized Admin'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-[#EBE3D5] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0EAE1]">
          <SettingsIcon className="w-4 h-4 text-[#BFA36D]" />
          <h3 className="font-serif text-lg font-semibold text-[#421C2D]">General Store Information</h3>
        </div>

        {settingsSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {settingsError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                Store Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Maryam Trade Center"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="Rs."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] font-mono focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Brand Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="CARRY THE MOMENT"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Footer Description
            </label>
            <textarea
              rows={3}
              value={footerDescription}
              onChange={(e) => setFooterDescription(e.target.value)}
              placeholder="Maryam Trade Center is a premier Pakistani fashion and accessories catalog..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="pt-3 border-t border-[#F0EAE1] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              <Globe className="w-3.5 h-3.5 text-[#BFA36D]" />
              <span>Official Social Media Profiles</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs text-[#421C2D] font-medium">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-[#421C2D] font-medium">Facebook URL</label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EAE1] flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#BFA36D]" />
            <span>{savingSettings ? 'Saving...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>

      {/* Security & Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-[#EBE3D5] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0EAE1]">
          <Shield className="w-4 h-4 text-[#BFA36D]" />
          <h3 className="font-serif text-lg font-semibold text-[#421C2D]">Security &amp; Admin Password</h3>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EAE1] flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="px-6 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Key className="w-4 h-4 text-[#BFA36D]" />
            <span>{savingPassword ? 'Updating...' : 'Change Password'}</span>
          </button>
        </div>
      </form>

      {/* Supabase Production Backend Status Card */}
      <div className="bg-white rounded-3xl border border-[#E8DFC8] p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#421C2D]">Supabase Production Database</h3>
            <p className="text-xs text-[#7A6B74]">Single source of truth for public storefront & admin catalog</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD0] space-y-3 text-xs text-[#523B48]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-[#421C2D]">Project ID:</span>
            <code className="bg-white px-2.5 py-1 rounded-lg border border-[#E0D7C6] font-mono text-[11px] text-[#421C2D]">
              nrdbencwwogpcsqwbcle
            </code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-[#421C2D]">Production Storage Bucket:</span>
            <code className="bg-white px-2.5 py-1 rounded-lg border border-[#E0D7C6] font-mono text-[11px] text-emerald-700 font-bold">
              product-images
            </code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-[#421C2D]">Row Level Security (RLS):</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enabled & Secured</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

