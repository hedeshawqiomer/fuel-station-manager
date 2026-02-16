import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserInfo } from "../store/authSlice";
import {
  Building2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "sonner";

// --- Helper: Safely Render Icons ---
const DynamicIcon = ({ icon: Icon, size, className }) => {
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
};

// --- Sub-components ---
// --- Sub-components ---
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover border border-border group hover:border-primary/30 transition-all duration-200">
    <div className="w-10 h-10 rounded-full bg-surface-active flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors shrink-0 shadow-sm">
      <DynamicIcon icon={icon} size={20} />
    </div>
    <div>
      <p className="text-xs text-text-muted font-bold mb-0.5 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium text-sm text-text-main">
        {value || (
          <span className="text-text-muted italic text-xs">دیاری نەکراوە</span>
        )}
      </p>
    </div>
  </div>
);

const InputField = ({ icon, label, className, ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-bold text-text-muted">{label}</label>
    <div className="relative group">
      <div className="absolute right-3 top-3.5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
        <DynamicIcon icon={icon} size={18} />
      </div>
      <input
        className="w-full py-3 pr-10 pl-4 bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted"
        {...props}
      />
    </div>
  </div>
);

// --- Main Component ---
export default function BusinessInfo() {
  const dispatch = useDispatch();
  // Always use this for "View Mode" so it stays live-updated from Redux
  const info = useSelector((state) => state.auth.user) || {};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // 1. When clicking Edit, copy current Redux info to local form state
  const handleStartEditing = () => {
    setFormData({ ...info }); // Create a fresh copy
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLER: SAVE BUSINESS INFO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return toast.error("ناوی خاوەن کار پێویستە!");
    }

    // 1. SAVE TO DATABASE (Backend)
    if (window.api) {
      console.log("💾 Saving Business Info...");
      try {
        await window.api.updateBusinessInfo(formData);
      } catch (err) {
        console.error("Failed to save info:", err);
        return toast.error("هەڵە لە پاشەکەوتکردن");
      }
    }

    // 2. UPDATE REDUX (Frontend)
    dispatch(updateUserInfo(formData));

    toast.success("زانیارییەکان بە سەرکەوتوویی نوێکرانەوە");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({}); // Clear local state to save memory
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-text-main">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="text-primary" size={24} />
            </div>
            زانیاری بازرگانی
          </h1>
          <p className="text-text-muted text-sm mt-1 mr-12">
            زانیارییەکانی پرۆفایل و پەیوەندی کردن بەڕێوەببە
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEditing}
            className="btn-secondary px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-surface-active transition-all"
          >
            <Edit2 size={16} /> دەستکاری زانیاری
          </button>
        )}
      </div>

      {/* Card */}
      <div className="card-base shadow-2xl relative overflow-hidden border border-border/50">
        {/* Banner */}
        <div className="h-48 bg-surface-active border-b border-border relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b6ff00_1px,transparent_1px)] [background-size:16px_16px]"></div>
          {isEditing && (
            <div className="absolute top-4 left-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              دۆخی دەستکاریکردن
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute top-28 right-10 z-10">
          <div className="w-32 h-32 bg-surface rounded-full border-[6px] border-surface flex items-center justify-center text-primary shadow-xl overflow-hidden group relative">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            <User size={56} className="relative z-10" />
          </div>
        </div>

        {/* Content */}
        <div className="px-10 pt-20 pb-10 bg-surface">
          {!isEditing ? (
            // VIEW MODE: Renders directly from 'info' (Redux)
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 pr-4">
                <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
                  {info.name || "ناوی نەناسراو"}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {info.role || "ڕۆڵ دیاری نەکراوە"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoItem icon={Mail} label="ئیمەیڵ" value={info.email} />
                <InfoItem icon={Phone} label="مۆبایل" value={info.phone} />
                <div className="md:col-span-2">
                  <InfoItem
                    icon={MapPin}
                    label="ناونیشان"
                    value={info.address}
                  />
                </div>
              </div>
            </div>
          ) : (
            // EDIT MODE: Renders from 'formData' (Local State)
            <form
              onSubmit={handleSubmit}
              className="space-y-6 animate-in fade-in zoom-in-95 duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="ناوی خاوەن کار"
                  name="name"
                  icon={User}
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="ناو..."
                  autoFocus
                />
                <InputField
                  label="پلە / ڕۆڵ"
                  name="role"
                  icon={Building2}
                  value={formData.role || ""}
                  onChange={handleChange}
                  placeholder="بەڕێوەبەر..."
                />
                <InputField
                  label="ئیمەیڵ"
                  name="email"
                  icon={Mail}
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  dir="ltr"
                  className="text-right"
                />
                <InputField
                  label="ژمارەی مۆبایل"
                  name="phone"
                  icon={Phone}
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="0750..."
                  dir="ltr"
                  className="text-right"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="ناونیشان"
                    name="address"
                    icon={MapPin}
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="شار، گەڕەک..."
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-border flex justify-center gap-9">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl border border-border text-text-muted hover:text-text-main hover:bg-surface-active font-bold text-sm transition-all flex items-center gap-2"
                >
                  <X size={18} /> پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="btn-primary py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  <Save size={18} /> پاشەکەوتکردن
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
