import React, { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import TransactionDetailsModal from "../Components/TransactionDetailsModal";
import {
  Wallet,
  BookOpen,
  DollarSign,
  Droplet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
  Eye,
} from "lucide-react";

const Dashboard = () => {
  const transactions = useSelector((state) => state.data.transactions);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const dateInputRef = useRef(null);

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDisplayDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${d}/${m}/${y}`;
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const dailyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const parts = t.date.split("/");
      if (parts.length !== 3) return false;
      // Convert DD/MM/YYYY to JS Date
      const txDate = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0]),
      );
      return isSameDay(txDate, selectedDate);
    });
  }, [selectedDate, transactions]);

  // --- STATS CALCULATION ---
  const { dailyTotalMoney, dailyTotalPaid, dailyTotalDebt, fuelStats } =
    useMemo(() => {
      const stats = {
        dailyTotalMoney: 0,
        dailyTotalPaid: 0,
        dailyTotalDebt: 0,
        fuelStats: {},
      };

      dailyTransactions.forEach((t) => {
        stats.dailyTotalMoney += Number(t.total) || 0;
        stats.dailyTotalPaid += Number(t.paid) || 0;

        const key = `${t.fuel}_${t.unit}`;
        if (!stats.fuelStats[key]) {
          stats.fuelStats[key] = { name: t.fuel, unit: t.unit, qty: 0 };
        }
        stats.fuelStats[key].qty += Number(t.qty) || 0;
      });

      stats.dailyTotalDebt = stats.dailyTotalMoney - stats.dailyTotalPaid;
      return stats;
    }, [dailyTransactions]);

  const isToday = isSameDay(selectedDate, new Date());

  const handleViewDetails = (tx) => {
    setSelectedTx(tx);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <ArrowUpRight className="text-primary" /> پوختەی داشبۆرد
          </h1>
          <p className="text-text-muted text-sm mt-1">
            کورتەیەک لە چالاکییەکانی بازرگانی.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center bg-surface-hover border border-border p-1 rounded-xl shadow-lg relative">
            <input
              type="date"
              ref={dateInputRef}
              className="absolute opacity-0 w-0 h-0"
              onChange={(e) => {
                if (e.target.valueAsDate) setSelectedDate(e.target.valueAsDate);
              }}
            />
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-surface-active text-text-muted hover:text-text-main rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div
              onClick={() => dateInputRef.current.showPicker()}
              className="flex flex-col items-center px-4 min-w-[140px] border-x border-border cursor-pointer hover:bg-surface-active rounded mx-1 py-1"
            >
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                {isToday ? "ئەمڕۆ" : "بەرواری دیاریکراو"}
              </span>
              <div className="flex items-center gap-2 text-text-main font-mono font-bold text-sm mt-0.5">
                <CalendarIcon size={14} className="text-primary" />{" "}
                {formatDisplayDate(selectedDate)}
              </div>
            </div>
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-surface-active text-text-muted hover:text-text-main rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="mr-2 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 border border-primary/20 font-bold"
              >
                ئەمڕۆ
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="کۆی فرۆشتن"
          value={dailyTotalMoney}
          suffix="IQD"
          icon={DollarSign}
          color="text-primary"
        />
        <StatCard
          title="پارەی وەرگیراو"
          value={dailyTotalPaid}
          suffix="IQD"
          icon={Wallet}
          color="text-emerald-500"
        />
        <StatCard
          title="قەرزەکان"
          value={dailyTotalDebt}
          suffix="IQD"
          icon={BookOpen}
          color="text-amber-500"
        />

        <div className="bg-gradient-to-br from-surface-hover to-surface border border-border p-5 rounded-2xl shadow-md relative overflow-hidden group flex flex-col justify-center">
          <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplet size={60} className="text-cyan-500" />
          </div>
          <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-3">
            بڕی سووتەمەنی
          </div>
          <div className="grid grid-cols-2 gap-2 relative z-10 w-full">
            {Object.values(fuelStats).length > 0 ? (
              Object.values(fuelStats).map((item, i) => (
                <div
                  key={i}
                  className="bg-surface-active border border-border rounded-lg p-2 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-text-muted font-bold text-[10px]">
                    {item.name}
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {item.qty.toLocaleString()}{" "}
                    <span className="text-[9px] text-text-muted block">
                      {item.unit}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-text-muted font-mono text-xl font-bold py-2">
                0
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-base shadow-xl">
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover">
          <h3 className="font-bold text-text-main flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" /> لیستی فرۆشتنەکان{" "}
            <span className="bg-border text-text-muted text-[10px] px-2 py-0.5 rounded-full font-mono">
              {dailyTransactions.length}
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          {dailyTransactions.length > 0 ? (
            <table className="w-full text-right">
              <thead className="bg-surface-active text-xs text-text-muted uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">کڕیار</th>
                  <th className="px-6 py-4">سووتەمەنی</th>
                  <th className="px-6 py-4">بڕ</th>
                  <th className="px-6 py-4">نرخ</th>
                  <th className="px-6 py-4">دۆخ</th>
                  <th className="px-6 py-4 text-center">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailyTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-main">{tx.customer}</div>
                      <div className="text-[10px] text-text-muted font-mono">
                        #{tx.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-main">
                      {tx.fuel}{" "}
                      <span className="text-text-muted text-xs">
                        ({tx.brand})
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-text-main">
                      {tx.qty}{" "}
                      <span className="text-primary text-xs">{tx.unit}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-text-main">
                      {Number(tx.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Use the improved status badge */}
                      <StatusBadge transaction={tx} />
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <button
                        onClick={() => handleViewDetails(tx)}
                        className="p-2 hover:bg-surface-active rounded-lg text-text-muted hover:text-text-main transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <CalendarIcon size={30} className="text-text-muted" />
              </div>
              <p className="text-text-muted">هیچ داتایەک نییە بۆ ئەم بەروارە</p>
            </div>
          )}
        </div>
      </div>

      {isDetailsOpen && selectedTx && (
        <TransactionDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          transaction={selectedTx}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, suffix, icon, color }) => {
  const IconComponent = icon;
  return (
    <div className="bg-surface border border-border p-5 rounded-2xl shadow-md relative overflow-hidden group">
      <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <IconComponent size={60} className={color.replace("text-", "text-")} />
      </div>
      <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className={`text-2xl font-black ${color} font-mono`}>
        {value.toLocaleString()}{" "}
        <span className="text-xs opacity-50 text-text-muted">{suffix}</span>
      </div>
    </div>
  );
};

// --- SAFE STATUS BADGE ---
// This safely checks "Paid", "paid", "PAID" etc.
const StatusBadge = ({ transaction }) => {
  const rawStatus = transaction.status || transaction.Status || "";
  const s = rawStatus.toString().toLowerCase().trim();

  const styles =
    s === "paid"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : s === "partial"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-rose-500/10 text-rose-500 border-rose-500/20";

  const label = s === "paid" ? "پێدراو" : s === "partial" ? "بەشێک" : "قەرز";

  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
};

export default Dashboard;
