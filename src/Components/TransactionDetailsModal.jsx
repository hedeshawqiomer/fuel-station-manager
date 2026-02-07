import React, { useEffect } from "react";
import {
  X,
  Receipt,
  Calendar,
  User,
  Droplet,
  Tag,
  StickyNote,
  Coins,
  Wallet,
} from "lucide-react";

const TransactionDetailsModal = ({ isOpen, onClose, transaction }) => {
  // --- 1. Close on ESC Key ---
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // --- 2. Safety Check ---
  if (!isOpen || !transaction) return null;

  // --- 3. Calculations ---
  const totalAmount = Number(transaction.total) || 0;
  const paidAmount = Number(transaction.paid) || 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const unitPrice =
    Number(transaction.price) ||
    (Number(transaction.qty) > 0
      ? Math.round(totalAmount / Number(transaction.qty))
      : 0);

  // --- 4. Status Config ---
  const getStatusConfig = () => {
    if (transaction.status === "paid" || remainingAmount === 0) {
      return {
        label: "پێدراو (PAID)",
        statusKey: "paid",
        color: "text-emerald-500",
        borderColor: "border-emerald-500",
        bgColor: "bg-emerald-500/10",
      };
    } else if (paidAmount > 0) {
      return {
        label: "بەشێک (PARTIAL)",
        statusKey: "partial",
        color: "text-amber-500",
        borderColor: "border-amber-500",
        bgColor: "bg-amber-500/10",
      };
    } else {
      return {
        label: "پێنەدراو (UNPAID)",
        statusKey: "unpaid",
        color: "text-rose-500",
        borderColor: "border-rose-500",
        bgColor: "bg-rose-500/10",
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className="fixed inset-0 z-[1070] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-right font-sans overflow-y-auto"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-[#333] rounded-2xl w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex justify-between items-center shrink-0 rounded-t-2xl relative z-20">
          <div className="flex items-center gap-3">
            <div className="bg-[#222] p-2 rounded-lg border border-[#333]">
              <Receipt size={20} className="text-[#b6ff00]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">پسوڵەی فرۆشتن</h3>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                ID: #{transaction.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#222] p-2 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-5 relative overflow-hidden rounded-b-2xl">
          {/* Status Stamp */}
          <div
            className={`absolute top-4 left-6 border-4 ${config.borderColor} ${config.color} font-black text-xs px-3 py-1 -rotate-12 opacity-15 rounded uppercase tracking-[0.2em] pointer-events-none select-none z-0 scale-125 origin-top-left`}
          >
            {config.statusKey}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 relative z-10">
            {/* === LEFT COLUMN (Money & Note) === */}
            <div className="flex-1 flex flex-col gap-3 order-2 lg:order-1">
              {/* Payment Summary Box */}
              <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
                {/* Total */}
                <div className="flex justify-between items-center p-3 bg-[#b6ff00]/5 border-b border-[#333]">
                  <span className="text-gray-300 font-bold text-sm">
                    کۆی گشتی
                  </span>
                  <span className="text-lg font-black text-white font-mono tracking-tight">
                    {totalAmount.toLocaleString()}{" "}
                    <span className="text-xs text-[#b6ff00] font-bold">
                      IQD
                    </span>
                  </span>
                </div>

                {/* Paid */}
                <div className="flex justify-between items-center p-3 text-sm border-b border-[#2a2a2a]">
                  <span className="text-gray-400">بڕی دراو</span>
                  <span
                    className={`font-mono font-bold ${
                      paidAmount > 0 ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {paidAmount.toLocaleString()} IQD
                  </span>
                </div>

                {/* Remaining */}
                {remainingAmount > 0 ? (
                  <div className="flex justify-between items-center p-3 text-sm bg-red-500/10">
                    <span className="text-red-400 font-bold flex items-center gap-2">
                      ماوە (قەرز)
                    </span>
                    <span className="text-red-500 font-mono font-black text-base">
                      {remainingAmount.toLocaleString()} IQD
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3 text-sm bg-emerald-500/5">
                    <span className="text-emerald-500 font-bold text-xs">
                      هەمووی دراوە (پاککراوەتەوە)
                    </span>
                    <Wallet size={16} className="text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Note Section (COMPACT VERSION) */}
              <div className="bg-[#222] p-3 rounded-xl border border-[#333] relative min-h-[80px]">
                <div className="absolute -top-2.5 right-4 bg-[#1a1a1a] px-2 py-0.5 text-[10px] text-gray-500 border border-[#333] rounded flex items-center gap-1">
                  <StickyNote size={10} /> تێبینی (Note)
                </div>
                <div className="mt-2">
                  {transaction.note ? (
                    <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap text-start">
                      {transaction.note}
                    </p>
                  ) : (
                    <div className="flex items-center justify-center text-gray-600 text-xs italic py-2">
                      هیچ تێبینییەک نییە
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === RIGHT COLUMN (Details) === */}
            <div className="flex-1 flex flex-col gap-3 order-1 lg:order-2">
              {/* Customer Profile */}
              <div className="text-center bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
                <div className="w-16 h-16 bg-gradient-to-b from-[#222] to-[#111] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#333] shadow-inner">
                  <User size={32} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {transaction.customer}
                </h2>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1 bg-[#151515] px-2 py-1 rounded border border-[#2a2a2a]">
                    <Calendar size={12} /> {transaction.date}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#2a2a2a] flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 text-[10px] mb-1 flex items-center gap-1">
                    <Droplet size={10} /> سووتەمەنی
                  </span>
                  <div className="font-bold text-white text-sm">
                    {transaction.fuel}
                    <span className="text-gray-500 text-[10px] block">
                      ({transaction.brand})
                    </span>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#2a2a2a] flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 text-[10px] mb-1 flex items-center gap-1">
                    <Tag size={10} /> بڕ
                  </span>
                  <div className="font-bold text-white text-sm font-mono">
                    {Number(transaction.qty).toLocaleString()}{" "}
                    <span className="text-[#b6ff00] text-[10px]">
                      {transaction.unit}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 bg-[#1a1a1a] p-3 rounded-xl border border-[#2a2a2a] flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 text-[10px] mb-1 flex items-center gap-1">
                    <Coins size={10} /> نرخی یەکە
                  </span>
                  <div className="font-bold text-white text-base font-mono">
                    {Number(unitPrice).toLocaleString()}{" "}
                    <span className="text-gray-500 text-xs">IQD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
