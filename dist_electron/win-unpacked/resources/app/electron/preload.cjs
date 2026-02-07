// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadInitialData: () => ipcRenderer.invoke("db:get-all"),
  addTransaction: (data) => ipcRenderer.invoke("db:add-transaction", data),
  updateTransaction: (data) =>
    ipcRenderer.invoke("db:update-transaction", data),
  addCustomer: (data) => ipcRenderer.invoke("db:add-customer", data),
  deleteCustomer: (id) => ipcRenderer.invoke("db:delete-customer", id),
  updatePrices: (data) => ipcRenderer.invoke("db:update-prices", data),
  updateBusinessInfo: (data) =>
    ipcRenderer.invoke("db:update-business-info", data),
});
