import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTransaction, updateTransaction } from "../store/dataSlice";
import AddSaleModal from "../Components/AddSaleModal";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Edit,
  Banknote,
  Coins,
  CheckCircle,
  X,
  Filter,
  FileText,
  Wallet,
  ArrowUpRight,
  SearchX,
} from "lucide-react";

export default function Loans() {
  const dispatch = useDispatch();

  const transactions = useSelector((state) => state.data.transactions);
  const prices = useSelector((state) => state.data.prices);
  const filter = useSelector((state) => state.ui.filter);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAlterModalOpen, setIsAlterModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const hasDateFilter = startDate || endDate;

  // --- HELPER ---
  const normalize = (str) => (str ? str.toString().trim().toLowerCase() : "");

  // --- 1. OPTIMIZED FILTERING ---
  const filteredLoans = useMemo(() => {
    return transactions.filter((t) => {
      // Normalize status
      const s = normalize(t.status || t.Status);

      // Allow "not paid", "credit", "partial"
      const allowedStatus =
        s === "not paid" || s === "credit" || s === "partial";
      if (!allowedStatus) return false;

      // Customer Filter
      const matchesCustomer =
        filter === "All" || normalize(t.customer) === normalize(filter);

      // Date Range Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const parts = t.date.split("/");
        const txDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (txDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) matchesDate = false;
        }
      }
      return matchesCustomer && matchesDate;
    });
  }, [transactions, filter, startDate, endDate]);

  // --- 2. OPTIMIZED MATH ---
  const { totalDebt, totalLoansCount, uniqueDebtors } = useMemo(() => {
    const debt = filteredLoans.reduce(
      (acc, curr) => acc + (Number(curr.total) - Number(curr.paid || 0)),
      0,
    );
    const uniqueCount =
      filter === "All"
        ? new Set(filteredLoans.map((l) => normalize(l.customer))).size
        : filteredLoans.length > 0
          ? 1
          : 0;

    return {
      totalDebt: debt,
      totalLoansCount: filteredLoans.length,
      uniqueDebtors: uniqueCount,
    };
  }, [filteredLoans, filter]);

  const handleSaveNewLoan = async (tx) => {
    if (window.api) {
      try {
        await window.api.addTransaction(tx);
        dispatch(addTransaction(tx));
        toast.success("قەرزەکە بە سەرکەوتوویی زیادکرا");
      } catch (err) {
        console.error(err);
        toast.error("هەڵە لە پاشەکەوتکردن");
      }
    }
  };

  const handleUpdateLoan = async (updatedTx) => {
    if (window.api) {
      try {
        await window.api.updateTransaction(updatedTx);
        dispatch(updateTransaction(updatedTx));
        toast.success("زانیاری قەرز نوێکرایەوە");
      } catch (err) {
        console.error(err);
        toast.error("هەڵە لە نوێکردنەوە");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-text-main">
            <Banknote className="text-primary" /> قەرزەکان
          </h1>
          <span className="text-text-muted text-sm mt-1 block">
            {filter === "All"
              ? "قەرزەکانی هەموو کڕیاران"
              : `قەرزەکان ـ ${filter}`}
          </span>
        </div>

        <div
          className={`flex flex-wrap items-center gap-3 p-2 rounded-xl border transition-all ${
            hasDateFilter
              ? "bg-primary/5 border-primary"
              : "bg-surface-hover border-border"
          }`}
        >
          <div className="flex items-center gap-2 px-2 text-text-muted">
            <Filter
              size={16}
              className={hasDateFilter ? "text-primary" : "text-text-muted"}
            />
            <span className="text-xs font-bold hidden sm:inline">فیلتەر:</span>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 min-w-[140px]">
            <span className="text-[10px] text-text-muted font-bold">لە</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-text-main text-xs border-none p-0 h-auto focus:ring-0 w-full"
            />
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 min-w-[140px]">
            <span className="text-[10px] text-text-muted font-bold">تا</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-text-main text-xs border-none p-0 h-auto focus:ring-0 w-full"
            />
          </div>
          {hasDateFilter && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1.5 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-surface border border-border rounded-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border shadow-lg overflow-hidden">
        <div className="p-5 flex items-center gap-4 hover:bg-surface-hover transition-colors group">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <User size={24} />
          </div>
          <div>
            <div className="text-text-muted text-xs font-bold mb-0.5 uppercase tracking-wide">
              ژمارەی قەرزداران
            </div>
            <div className="text-2xl font-black text-text-main">
              {uniqueDebtors}
            </div>
          </div>
        </div>
        <div className="p-5 flex items-center gap-4 hover:bg-surface-hover transition-colors group">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Coins size={24} />
          </div>
          <div>
            <div className="text-text-muted text-xs font-bold mb-0.5 uppercase tracking-wide">
              ژمارەی قەرزەکان
            </div>
            <div className="text-2xl font-black text-text-main">
              {totalLoansCount}
            </div>
          </div>
        </div>
        <div className="p-5 flex items-center gap-4 bg-gradient-to-l from-amber-500/5 to-transparent relative group">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 bg-amber-500 text-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-amber-500 text-xs font-bold mb-0.5 flex items-center gap-1 uppercase tracking-wide">
              کۆی گشتی قەرز <ArrowUpRight size={12} />
            </div>
            <div className="text-2xl font-black text-text-main font-mono tracking-tight">
              {totalDebt.toLocaleString()}{" "}
              <span className="text-xs text-text-muted font-bold">IQD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredLoans.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-border rounded-xl p-12 text-center text-text-muted bg-surface-hover/50 flex flex-col items-center">
            {hasDateFilter ? (
              <>
                <SearchX size={48} className="mb-4 text-text-muted opacity-50" />
                <h5 className="font-bold text-text-muted">
                  هیچ ئەنجامێک نەدۆزرایەوە
                </h5>
              </>
            ) : (
              <>
                <CheckCircle size={48} className="mb-4 text-green-500/50" />
                <h5 className="font-bold text-text-muted">هیچ قەرزێک نییە!</h5>
              </>
            )}
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const s = normalize(loan.status || loan.Status);
            const isPartial = s === "partial";
            const paid = Number(loan.paid) || 0;
            const remaining = Number(loan.total) - paid;
            return (
              <div
                key={loan.id}
                className="card-base shadow-md group hover:border-primary transition-all relative hover:-translate-y-1"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-purple-400" />
                    <span className="text-primary font-bold text-sm">
                      {loan.customer}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                      isPartial
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {isPartial ? "بەشێک" : "پێنەدراو"}
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="text-text-muted text-sm">⛽ {loan.fuel}</div>
                  <div className="text-text-muted text-sm">
                    بڕ:{" "}
                    <span className="text-text-main">
                      {loan.qty} {loan.unit}
                    </span>
                  </div>
                  <div className="text-text-muted text-sm">
                    نرخی گشتی:{" "}
                    <span className="text-text-main font-mono">
                      {Number(loan.total).toLocaleString()} IQD
                    </span>
                  </div>
                  {isPartial && (
                    <div className="text-sm text-green-500 font-bold">
                      پێدراو: {paid.toLocaleString()} IQD
                    </div>
                  )}
                  <div className="mt-2 bg-surface-active border border-border rounded-lg p-3 flex justify-between items-center">
                    <span className="text-xs text-text-muted">
                      ماوە بۆ دان:
                    </span>
                    <span className="text-red-500 font-bold font-mono text-lg">
                      {remaining.toLocaleString()}
                    </span>
                  </div>
                  {loan.note && (
                    <div className="mt-2 bg-background border border-border p-2.5 rounded-lg flex gap-2 items-start">
                      <FileText
                        size={14}
                        className="text-text-muted mt-0.5 shrink-0"
                      />
                      <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                        {loan.note}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border flex justify-between items-center bg-surface">
                  <span className="text-text-muted text-xs flex items-center gap-1">
                    <Calendar size={12} /> {loan.date}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedLoan(loan);
                      setIsAlterModalOpen(true);
                    }}
                    className="btn-primary px-3 py-1.5 text-xs font-bold h-auto"
                  >
                    <Edit size={12} /> گۆڕین
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAddModalOpen && (
        <AddSaleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewLoan}
          defaultStatus="Not Paid"
          defaultCustomer={filter === "All" ? "" : filter}
          prices={prices}
        />
      )}

      {isAlterModalOpen && selectedLoan && (
        <AlterLoanModal
          isOpen={isAlterModalOpen}
          onClose={() => setIsAlterModalOpen(false)}
          loan={selectedLoan}
          onUpdate={handleUpdateLoan}
        />
      )}
    </div>
  );
}

const AlterLoanModal = ({ isOpen, onClose, loan, onUpdate }) => {
  const [mode, setMode] = useState("partial");
  const [payNow, setPayNow] = useState("");
  const currentPaid = Number(loan.paid) || 0;
  const currentTotal = Number(loan.total) || 0;
  const currentDebt = currentTotal - currentPaid;
  const remainingAfter = Math.max(0, currentDebt - (Number(payNow) || 0));

  const handleInputChange = (e) => {
    let val = Number(e.target.value);
    if (val < 0) return;
    if (val > currentDebt) {
      val = currentDebt;
      toast.warning("ناتوانێت زیاتر بێت لە قەرز");
    }
    setPayNow(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated = { ...loan };
    if (mode === "paid") {
      updated.paid = currentTotal;
      updated.status = "paid";
    } else {
      const pay = Number(payNow) || 0;
      if (pay <= 0) return toast.error("تکایە بڕی پارە بنووسە");
      updated.paid = currentPaid + pay;
      if (currentTotal - updated.paid <= 0) {
        updated.status = "paid";
      } else {
        updated.status = "partial";
      }
    }
    onUpdate(updated);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-right"
      dir="rtl"
    >
      <div className="card-base w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 bg-surface border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover rounded-t-xl">
          <h6 className="text-text-main font-bold m-0">
            گۆڕینی قەرز{" "}
            <span className="text-primary text-sm">({loan.customer})</span>
          </h6>
          <button onClick={onClose}>
            <X size={20} className="text-text-muted hover:text-text-main transition-colors" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-surface-hover p-3 rounded-lg border border-border flex justify-between">
            <span className="text-text-muted">کۆی قەرزی ئێستا:</span>
            <span className="text-red-500 font-bold font-mono">
              {currentDebt.toLocaleString()} IQD
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setMode("partial")}
              className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${mode === "partial" ? "border-primary bg-primary/10 text-text-main" : "border-border bg-surface-hover text-text-muted"}`}
            >
              <div className="font-bold text-sm">پێدانی بڕێک</div>
            </div>
            <div
              onClick={() => setMode("paid")}
              className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${mode === "paid" ? "border-primary bg-primary/10 text-text-main" : "border-border bg-surface-hover text-text-muted"}`}
            >
              <div className="font-bold text-sm">پێدانی هەمووی</div>
            </div>
          </div>
          {mode === "partial" && (
            <div className="bg-surface-hover p-3 rounded-lg border border-border space-y-3 animate-in slide-in-from-top-2 fade-in">
              <label className="text-xs text-text-muted">بڕی پارەی ئێستا</label>
              <input
                type="number"
                min="0"
                max={currentDebt}
                onWheel={(e) => e.target.blur()}
                value={payNow}
                onChange={handleInputChange}
                placeholder="IQD ..."
                className="w-full p-2 bg-surface border border-border rounded focus:border-primary outline-none text-text-main font-mono appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
              <div className="flex justify-between text-sm text-text-muted pt-2 border-t border-border">
                <span>ماوە دوای پارەدان:</span>{" "}
                <span className="text-red-500 font-bold">
                  {remainingAfter.toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary w-full py-3">
            پاشەکەوتکردن
          </button>
        </form>
      </div>
    </div>
  );
};
