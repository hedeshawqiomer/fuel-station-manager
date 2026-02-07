import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Removed "store/"
import dataReducer from "./dataSlice"; // Removed "store/"
import uiReducer from "./uiSlice"; // Removed "store/"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    ui: uiReducer,
  },
  // No middleware (We removed the LocalStorage auto-save)
  // No preloadedState (We wait for the Database file instead)
});
