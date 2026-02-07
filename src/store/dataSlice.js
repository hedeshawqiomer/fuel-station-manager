import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactions: [],
  customers: [],
  prices: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setInitialData: (state, action) => {
      state.transactions = action.payload.transactions || [];
      state.customers = action.payload.customers || [];
      state.prices = action.payload.prices || [];
    },

    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },

    // --- PROFESSIONAL FIX: CASCADE DELETE ---
    // ... inside your dataSlice reducers ...
    // ... inside your dataSlice reducers ...
    deleteCustomer: (state, action) => {
      const idToDelete = action.payload; // This is the UUID

      // 1. Remove the customer from the list
      state.customers = state.customers.filter((c) => c.id !== idToDelete);

      // 2. THE FIX: Remove all transactions linked to this specific ID
      state.transactions = state.transactions.filter(
        (t) => t.customerId !== idToDelete,
      );
    },

    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
    },
    updatePrices: (state, action) => {
      state.prices = action.payload;
    },
  },
});

export const {
  setInitialData,
  addTransaction,
  updateTransaction,
  addCustomer,
  deleteCustomer,
  updatePrices,
} = dataSlice.actions;

export default dataSlice.reducer;
