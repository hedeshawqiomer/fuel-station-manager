import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { setInitialData } from "./store/dataSlice";
import { updateUserInfo } from "./store/authSlice"; // <--- IMPORT THIS

import FilterSidebar from "./Components/FilterSidebar";
import Header from "./Components/Header";
import Dashboard from "./Pages/DashBoard";
import Prices from "./Pages/Prices";
import Delivered from "./Pages/Delivered";
import Loans from "./Pages/Loans";
import Login from "./Pages/Login";
import Customers from "./Pages/Customers";
import BusinessInfo from "./Pages/BusinessInfo";
import { toggleSidebar } from "./store/uiSlice";

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { currentPage, isSidebarOpen } = useSelector((state) => state.ui);

  // --- 🌙 GLOBAL THEME INITIALIZATION ---
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    const root = window.document.documentElement;
    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  // --- 🌙 GLOBAL THEME INITIALIZATION ---
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    const root = window.document.documentElement;
    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  // --- 🔌 LOAD DATA FROM DATABASE ---
  useEffect(() => {
    const loadDB = async () => {
    const loadDB = async () => {
      if (window.api) {
        try {
          // 1. Get ALL data from the JSON file
          const dbData = await window.api.loadInitialData();

          if (dbData) {
            // 2. Send Transactions/Customers to Data Slice
            dispatch(
              setInitialData({
                transactions: dbData.transactions || [],
                customers: dbData.customers || [],
                prices: dbData.prices || [],
              }),
            );

            // 3. 👇 Send Business Info to Auth Slice (THE FIX) 👇
            if (dbData.businessInfo) {
              dispatch(updateUserInfo(dbData.businessInfo));
            }
          }
        } catch (error) {
          console.error("❌ Failed to load data:", error);
        }
      }
    };
    loadDB();
  }, [dispatch]);

  if (!isAuthenticated) return <Login />;

  return (
    <div
      className="flex h-screen overflow-hidden bg-background text-text-main"
      dir="rtl"
    >
      <Toaster position="top-center" richColors theme="system" />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      <FilterSidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "prices" && <Prices />}
          {currentPage === "loans" && <Loans />}
          {currentPage === "delivered" && <Delivered />}
          {currentPage === "customers" && <Customers />}
          {currentPage === "businessInfo" && <BusinessInfo />}
        </main>
      </div>
    </div>
  );
}
