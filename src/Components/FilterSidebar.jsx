import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPage, setFilter } from "../store/uiSlice";
import {
  Home,
  Tag,
  Banknote,
  Grid,
  Users,
  X,
  Droplet,
  LayoutGrid,
} from "lucide-react";

export default function FilterSidebar() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const {
    isSidebarOpen,
    currentPage,
    filter: activeFilter,
  } = useSelector((state) => state.ui);
  const user = useSelector((state) => state.auth.user);
  const { customers, transactions } = useSelector((state) => state.data);

  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState("");

  const showCustomerList = ["loans", "delivered"].includes(currentPage);

  // --- HELPER: Normalize Strings ---
  // This makes "Ali" == "ali " and "Paid" == "paid"
  const normalize = (str) => (str ? str.toString().trim().toLowerCase() : "");

  // 1. FILTER TRANSACTIONS (Based on Page)
  const pageTransactions = useMemo(() => {
    if (currentPage === "loans") {
      return transactions.filter((t) => {
        // SAFE CHECK: Handles "Not Paid", "not paid", "Credit", etc.
        const s = normalize(t.status);
        return (
          s === "partial" || s === "not paid" || s === "credit" || s === ""
        );
      });
    }
    // For delivered, we return everything, so sidebar counts show total activity
    return transactions;
  }, [transactions, currentPage]);

  // 2. CALCULATE COUNTS (The Performance Fix)
  const customerCounts = useMemo(() => {
    const counts = {};
    pageTransactions.forEach((t) => {
      // Use normalized name as key so "Ali" matches "ali"
      const nameKey = normalize(t.customer);
      if (nameKey) {
        counts[nameKey] = (counts[nameKey] || 0) + 1;
      }
    });
    return counts;
  }, [pageTransactions]);

  // 3. FILTER CUSTOMERS
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      normalize(c.name).includes(normalize(searchTerm)),
    );
  }, [customers, searchTerm]);

  return (
    <aside
      className={`
        fixed top-0 right-0 h-full w-[280px] bg-[#0a0a0a] border-l border-border z-50 
        transition-transform duration-300 ease-in-out flex flex-col
        lg:static lg:translate-x-0 
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"} 
      `}
    >
      {/* HEADER */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b6ff00] rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(182,255,0,0.3)]">
            <Droplet size={24} strokeWidth={2.5} className="fill-black/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none text-white">
              شوێنی
            </span>
            <span className="text-lg font-black tracking-tight leading-none text-[#b6ff00]">
              {user?.name || "بەڕێوەبەر"}
            </span>
          </div>
        </div>
        <button
          onClick={() => dispatch(setPage(currentPage))}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="p-3 space-y-1">
        <NavItem
          icon={<Home size={18} />}
          label="سەرەکی"
          active={currentPage === "dashboard"}
          onClick={() => dispatch(setPage("dashboard"))}
        />
        <NavItem
          icon={<Tag size={18} />}
          label="نرخەکانی ئەمرۆ"
          active={currentPage === "prices"}
          onClick={() => dispatch(setPage("prices"))}
        />
        <NavItem
          icon={<Banknote size={18} />}
          label="قەرزەکان"
          active={currentPage === "loans"}
          onClick={() => dispatch(setPage("loans"))}
        />
        <NavItem
          icon={<Grid size={18} />}
          label="تۆماری فرۆشتن"
          active={currentPage === "delivered"}
          onClick={() => dispatch(setPage("delivered"))}
        />
      </div>

      {/* CUSTOMER FILTERS */}
      {showCustomerList && (
        <div className="flex flex-col flex-1 min-h-0 border-t border-border mt-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 flex items-center gap-2 text-primary">
            <Users size={18} />
            <span className="font-bold text-sm">کڕیارەکان</span>
          </div>
          <div className="px-3 pb-2">
            <input
              type="search"
              placeholder="گەڕان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
            />
          </div>
          <ul className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
            <li
              onClick={() => dispatch(setFilter("All"))}
              className={`flex justify-between items-center p-2.5 rounded-lg cursor-pointer transition-all ${
                activeFilter === "All"
                  ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
                  : "hover:bg-surface-hover text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid size={14} />
                <span className="text-sm">گشتی</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20">
                {pageTransactions.length}
              </span>
            </li>

            {filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-600">
                نەدۆزرایەوە
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <FilterItem
                  key={c.id}
                  label={c.name}
                  // FIX: Lookup using normalized name
                  count={customerCounts[normalize(c.name)] || 0}
                  active={activeFilter === c.name}
                  onClick={() => dispatch(setFilter(c.name))}
                />
              ))
            )}
          </ul>
        </div>
      )}
    </aside>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
      active
        ? "text-primary bg-surface-hover font-bold border-r-2 border-primary shadow-sm"
        : "text-gray-400 hover:bg-surface-hover hover:text-white"
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const FilterItem = ({ label, count, active, onClick }) => (
  <li
    onClick={onClick}
    className={`flex justify-between items-center p-2.5 rounded-lg cursor-pointer transition-all ${
      active
        ? "bg-surface-active text-white border-r-2 border-primary"
        : "hover:bg-surface-hover text-gray-400 hover:text-gray-200"
    }`}
  >
    <span className="text-sm truncate">{label}</span>
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center ${
        active
          ? "bg-primary text-black"
          : "bg-surface border border-border text-gray-500"
      }`}
    >
      {count}
    </span>
  </li>
);
