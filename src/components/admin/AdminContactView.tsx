import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle, Save, CheckCircle2, AlertCircle, Clock, MapPin, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { WebsiteSettings } from '../../types';

export function AdminContactView() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        setWhatsappNumber(data.whatsappNumber || '+92 330 5859348');
        setEmail(data.email || 'mirstiger28@gmail.com');
        setPhone(data.phone || data.phoneNumber || '+92 330 5859348');
        setAddress(data.businessAddress || 'Lahore, Punjab, Pakistan');
        setOperatingHours(data.operatingHours || 'Mon - Sat: 10:00 AM - 8:00 PM PKT');
        setInstagramUrl(data.instagramUrl || 'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo');
        setFacebookUrl(data.facebookUrl || 'https://www.facebook.com/profile.php?id=61593629782975');
      } catch (err: any) {
        setError(err.message || 'Failed to load contact settings');
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.updateSettings({
        whatsappNumber,
        email,
        phone,
        businessAddress: address,
        operatingHours,
        instagramUrl,
        facebookUrl,
      });
      setSuccess('Contact details and social links updated successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save contact settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
          Contact &amp; Social Channels
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6B74]">
          Configure your direct WhatsApp order routing number, email, and official social media profile URLs
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#EBE3D5] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official WhatsApp Order Number</span>
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+92 330 5859348"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] font-mono focus:outline-hidden focus:border-[#421C2D]"
            />
            <span className="text-[11px] text-[#7A6B74] block">
              All "Order on WhatsApp" and inquiry buttons will route directly to this phone number.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#BFA36D]" />
                <span>Business Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mirstiger28@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#BFA36D]" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 330 5859348"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] font-mono focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#BFA36D]" />
              <span>Business Address / Location</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Lahore, Punjab, Pakistan"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#BFA36D]" />
              <span>Operating Hours</span>
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="Mon - Sat: 10:00 AM - 8:00 PM PKT"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          {/* Social Media Links Section */}
          <div className="pt-4 border-t border-[#F0EAE1] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#421C2D] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#BFA36D]" />
              <span>Official Social Media Profiles</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                Official Instagram Profile URL
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
                Official Facebook Profile URL
              </label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://www.facebook.com/profile.php?id=61593629782975"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EAE1] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#BFA36D]" />
            <span>{saving ? 'Saving...' : 'Save Contact Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
