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

  // --- 🔌 LOAD DATA FROM DATABASE ---
  useEffect(() => {
    const loadDB = async () => {
      if (window.api) {
        console.log("🔌 App Started: Connecting to Database...");
        try {
          // 1. Get ALL data from the JSON file
          const dbData = await window.api.loadInitialData();
          console.log("📥 Data Received:", dbData);

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
              console.log("👤 Updating User Info:", dbData.businessInfo);
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
      className="flex h-screen overflow-hidden bg-[#0a0a0a] text-white"
      dir="rtl"
    >
      <Toaster position="top-center" richColors theme="dark" />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      <FilterSidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] custom-scrollbar">
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
