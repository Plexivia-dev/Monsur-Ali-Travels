import React from 'react';
import { User, IdCard, Calendar, Droplets, Phone, Mail, MapPin, Upload, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

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
          ID Card Details & Settings
        </h2>
        <button
          onClick={onResetSample}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Load Sample
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Photo Upload & Preview */}
        <div>
          <label className="block font-bold text-foreground mb-1">Holder Photo (ছবি আপলোড)</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border-2 border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-xs">
              {cardData.photo ? (
                <img src={cardData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <label className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-border transition-all">
              <Upload className="w-4 h-4 text-primary" />
              <span>Choose Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
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
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Role / Designation (পদবি)</label>
            <select
              value={cardData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="CANDIDATE">CANDIDATE</option>
              <option value="AGENT">AGENT</option>
              <option value="CONSULTANT">CONSULTANT</option>
              <option value="OFFICER">OFFICER</option>
            </select>
          </div>
        </div>

        {/* Employee ID & Joining Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-foreground mb-1">Employee / Candidate ID</label>
            <input
              type="text"
              value={cardData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="123"
              className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
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
                className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Contact Phone</label>
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

        {/* Email & Office Address */}
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

        <div>
          <label className="block font-bold text-foreground mb-1">Office Address</label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={cardData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Mominpur Jagannathpur Road, Sunamganj"
              className="w-full pl-9 pr-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
