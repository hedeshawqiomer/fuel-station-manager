import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTransaction } from "../store/dataSlice";
import AddSaleModal from "../Components/AddSaleModal";
import TransactionDetailsModal from "../Components/TransactionDetailsModal";
import { toast } from "sonner";
import {
  Plus,
  Grid,
  Banknote,
  CheckCircle,
  Calendar,
  Eye,
  AlertTriangle,
  Filter,
  X,
  User,
  SearchX,
} from "lucide-react";

export default function Delivered() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.data.transactions);
  const prices = useSelector((state) => state.data.prices);
  const filter = useSelector((state) => state.ui.filter);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const hasDateFilter = startDate || endDate;

  // --- HELPER ---
  const normalize = (str) => (str ? str.toString().trim().toLowerCase() : "");

  const handleViewDetails = (tx) => {
    setSelectedTx(tx);
    setIsDetailsOpen(true);
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Customer Filter
      const matchesCustomer =
        filter === "All" || normalize(t.customer) === normalize(filter);

      // 2. Date Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const parts = t.date.split("/"); // [dd, mm, yyyy]
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

  const { totalAmount, totalPaid, totalRemaining } = useMemo(() => {
    const amount = filtered.reduce((a, b) => a + Number(b.total), 0);
    const paid = filtered.reduce((a, b) => a + Number(b.paid), 0);
    return {
      totalAmount: amount,
      totalPaid: paid,
      totalRemaining: amount - paid,
    };
  }, [filtered]);

  const handleSaveTransaction = async (tx) => {
    if (window.api) {
      try {
        await window.api.addTransaction(tx);
        dispatch(addTransaction(tx));
        toast.success("فرۆشتنەکە تۆمارکرا");
      } catch (err) {
        console.error(err);
        toast.error("هەڵە لە پاشەکەوتکردن");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h4 className="text-xl font-bold flex items-center gap-2 text-white">
            <Grid className="text-primary" /> تۆماری فرۆشتن
          </h4>
          <span className="text-text-muted text-sm mt-1 block">
            {filter === "All" ? "گشت کڕیارەکان" : filter}
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
              className={hasDateFilter ? "text-primary" : "text-gray-500"}
            />
            <span className="text-xs font-bold hidden sm:inline">فیلتەر</span>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-gray-500 font-bold">لە</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white text-xs border-none p-0 h-auto focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-gray-500 font-bold">تا</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white text-xs border-none p-0 h-auto focus:ring-0"
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

      <div className="card-base p-5 mb-5 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-surface-hover to-surface">
        <SummaryStat
          label="کۆی فرۆشتن"
          value={filtered.length}
          sub="وەسڵ"
          icon={<Grid size={16} />}
        />
        <SummaryStat
          label="کۆی نرخ (IQD)"
          value={totalAmount.toLocaleString()}
          sub="داهات"
          icon={<Banknote size={16} />}
        />
        <SummaryStat
          label="پێدراو (IQD)"
          value={totalPaid.toLocaleString()}
          sub="کاش"
          icon={<CheckCircle size={16} />}
        />
        {totalRemaining > 0 && (
          <SummaryStat
            label="ماوە (IQD)"
            value={totalRemaining.toLocaleString()}
            sub="قەرز"
            icon={<AlertTriangle size={16} />}
            isWarning
          />
        )}
      </div>

      <div
        onClick={() => setIsModalOpen(true)}
        className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-surface-hover transition-all mb-6 group"
      >
        <Plus
          size={32}
          className="text-primary mb-2 group-hover:scale-110 transition-transform"
        />
        <h6 className="font-bold text-white">زیادکردنی فرۆشتنێکی نوێ</h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-border rounded-xl p-12 text-center text-text-muted bg-surface-hover/50 flex flex-col items-center">
            <SearchX size={48} className="text-gray-600 mb-3 opacity-50" />
            <h5 className="font-bold text-gray-400">
              هیچ فرۆشتنێک نەدۆزرایەوە!
            </h5>
          </div>
        ) : (
          filtered.map((t) => {
            // SAFE STATUS CHECK
            const rawStatus = t.status || t.Status || "";
            const status = rawStatus.toString().toLowerCase().trim();

            let badgeClass = "";
            let badgeText = "";

            if (status === "paid") {
              badgeClass =
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
              badgeText = "پێدراو";
            } else if (status === "partial") {
              badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
              badgeText = "بەشێک";
            } else {
              badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
              badgeText = "پێنەدراو";
            }

            return (
              <div
                key={t.id}
                className="card-base relative hover:-translate-y-1 hover:border-primary transition-all shadow-lg group"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-purple-400" />
                    <span className="text-white font-bold">{t.customer}</span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeClass}`}
                  >
                    {badgeText}
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      {t.fuel}
                    </span>
                    <span className="text-white">
                      {t.qty} {t.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span>گشتی:</span>{" "}
                    <span className="text-primary font-bold font-mono">
                      {Number(t.total).toLocaleString()} IQD
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-surface border-t border-border flex justify-between items-center">
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar size={12} /> {t.date}
                  </span>
                  <button
                    onClick={() => handleViewDetails(t)}
                    className="btn-primary px-3 py-1 text-xs h-auto flex items-center gap-1.5"
                  >
                    <Eye size={12} /> وەسڵ
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <AddSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          defaultStatus="paid"
          defaultCustomer={filter === "All" ? "" : filter}
          prices={prices}
        />
      )}
      {isDetailsOpen && selectedTx && (
        <TransactionDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          transaction={selectedTx}
        />
      )}
    </div>
  );
}

const SummaryStat = ({ label, value, sub, icon, isWarning }) => (
  <div className="bg-surface-hover border border-border rounded-lg p-3 text-center transition-transform hover:scale-105">
    <div
      className={`text-xl font-black mb-1 ${isWarning ? "text-amber-500" : "text-primary"}`}
    >
      {value}
    </div>
    <div className="text-text-muted text-xs flex justify-center items-center gap-1">
      {icon} {label}
    </div>
    <div className="text-[10px] text-gray-500 mt-1">{sub}</div>
  </div>
);
