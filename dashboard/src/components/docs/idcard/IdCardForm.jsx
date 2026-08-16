import React from 'react';
import { User, IdCard, Calendar, Droplets, Phone, Mail, MapPin, Upload, RefreshCw, Globe, PenTool } from 'lucide-react';

export function IdCardForm({ cardData, setCardData, onResetSample }) {
  const handleChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
          <IdCard className="w-4 h-4 text-primary" />
          ID Card Details & Photo Input
        </h2>
        <button
          onClick={onResetSample}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Demo
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Photo Upload Box */}
        <div className="bg-muted/30 p-3 rounded-xl border border-border">
          <label className="block font-bold text-foreground mb-1">
            📷 Photo Upload (ছবি সিলেক্ট করুন)
          </label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-16 rounded-xl border-2 border-primary/30 overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-xs relative">
              {cardData.photo ? (
                <img src={cardData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground">
                Upload clear passport size photo (JPG/PNG).
              </p>
            </div>
          </div>
        </div>

        {/* Full Name & Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">Full Name (পূর্ণ নাম)</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={cardData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="MD HAKIMUL ISLAM"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Role / Designation (পদবি)</label>
            <input
              type="text"
              value={cardData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="EMPLOYEE"
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold uppercase"
            />
          </div>
        </div>

        {/* Employee ID & Joining Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">Employee ID</label>
            <input
              type="text"
              value={cardData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="123"
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Joining Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={cardData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                placeholder="01-10-2025"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Blood Group & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">Blood Group</label>
            <div className="relative">
              <Droplets className="w-3.5 h-3.5 absolute left-3 top-2.5 text-rose-500" />
              <input
                type="text"
                value={cardData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                placeholder="B+"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold text-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Contact Number</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={cardData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="0134557934"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-bold text-foreground mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="email"
              value={cardData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="monsuralitravels@gmail.com"
              className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Office Address */}
        <div>
          <label className="block font-bold text-foreground mb-1">Office Address</label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={cardData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Mominpur Jagannathpur Road Sunamganj"
              className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Website & Signature Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
          <div>
            <label className="block font-bold text-foreground mb-1">Website URL</label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={cardData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.monsuralitravels.com"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Signature Text</label>
            <div className="relative">
              <PenTool className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={cardData.signatureName}
                onChange={(e) => handleChange('signatureName', e.target.value)}
                placeholder="M. Ali"
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
