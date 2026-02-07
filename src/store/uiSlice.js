import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    filter: "All",
    isSidebarOpen: true,
    currentPage: "dashboard", // <--- Added this (Default Page)
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload; // <--- Added this Reducer
      state.isSidebarOpen = false; // Auto-close sidebar on mobile when navigating
      state.filter = "All"; // Reset filter when changing pages
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
  },
});

export const { setPage, setFilter, toggleSidebar, closeSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
