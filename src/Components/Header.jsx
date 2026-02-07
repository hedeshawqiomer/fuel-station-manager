import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { setPage, toggleSidebar } from "../store/uiSlice";
import {
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Menu,
  Users,
  Building2,
} from "lucide-react";

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeUser = user || {
    name: "Admin",
    role: "Owner",
    email: "admin@sys.com",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (pageName) => {
    dispatch(setPage(pageName));
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-border h-16 flex items-center shadow-sm">
      <div className="flex items-center justify-between w-full px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden text-gray-400 hover:text-white p-2 hover:bg-surface-hover rounded-lg transition-all"
        >
          <Menu size={24} />
        </button>

        {/* Spacer to push User Profile to the End (Left in RTL) */}
        <div className="flex-grow"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-200 ${
              isOpen
                ? "bg-surface-hover border-primary/50 shadow-[0_0_15px_rgba(182,255,0,0.1)]"
                : "bg-transparent border-transparent hover:bg-surface-hover hover:border-border"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-primary shadow-inner">
              <User size={18} />
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-bold text-white leading-tight">
                {safeUser.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                {safeUser.role}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform duration-200 ml-1 ${
                isOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            // FIX: Changed 'end-0' to 'left-0' to explicitly align to the left edge in RTL
            // Added 'origin-top-left' for correct animation direction
            <div className="absolute left-0 top-full mt-2 w-72 bg-[#151515] border border-border rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-left overflow-hidden">
              {/* Dropdown Header */}
              <div className="p-5 border-b border-border bg-surface-hover/30">
                <p className="font-bold text-base text-right text-white">
                  {safeUser.name}
                </p>
                <p className="text-gray-500 text-xs font-mono text-right mt-0.5">
                  {safeUser.email}
                </p>
                <div className="mt-3 flex items-center justify-end gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[10px] font-bold w-fit ml-auto border border-primary/20">
                  <ShieldCheck size={12} /> هەژماری خاوەن کار
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <MenuBtn
                  onClick={() => handleNav("customers")}
                  icon={Users}
                  label="بەڕێوەبردنی کڕیاران"
                />
                <MenuBtn
                  onClick={() => handleNav("businessInfo")}
                  icon={Building2}
                  label="زانیاری بازرگانی"
                />
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-border mt-1">
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full flex items-center justify-end gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all font-medium group"
                >
                  <span>دەرچوون</span>
                  <LogOut
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Helper Component for Menu Items
const MenuBtn = ({ onClick, icon, label }) => {
  // Fix: Capitalize icon component to prevent ReferenceError
  const LucideIcon = icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-end gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-all group"
    >
      <span className="group-hover:text-primary transition-colors font-medium">
        {label}
      </span>
      {LucideIcon && (
        <LucideIcon
          size={16}
          className="text-gray-500 group-hover:text-primary transition-colors"
        />
      )}
    </button>
  );
};
