import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null, // Starts empty
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;

      // 👇 THE FIX: Don't overwrite DB data with "Admin" dummy data
      // If we already have user data (from DB), keep it!
      const existingUser = state.user || {};
      const incomingUser = action.payload || {};

      // Merge them: DB data wins if it exists
      state.user = {
        ...incomingUser, // Defaults (like "Admin")
        ...existingUser, // Real DB Data (like "UTUT")
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      // We do NOT set user to null here, so the name stays for next time
      // or you can set it to null if you want high security clearing
      state.user = null;
    },
    updateUserInfo: (state, action) => {
      if (!state.user) state.user = {};
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { login, logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
