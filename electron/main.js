import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process"; // 👈 FIXES THE ERROR
import {
  initDB,
  addTransaction,
  updateTransaction,
  getTransactions,
  addCustomer,
  deleteCustomer,
  updatePrices,
  updateBusinessInfo,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

async function createWindow() {
  // 1. Initialize Database
  await initDB();

  // 2. Create Window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Fuel Management System",
    icon: path.join(__dirname, "../public/icon.ico"), // Ensure this file exists!
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // 3. Load Content
  if (!app.isPackaged && process.env.NODE_ENV !== "production") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // 4. Show Debug Info (Optional - Remove later)
  // This tells you the app successfully started and loaded the DB logic
  console.log("App Started Successfully");
}

// --- IPC LISTENERS ---
ipcMain.handle("db:get-all", async () => await getTransactions());
ipcMain.handle(
  "db:add-transaction",
  async (_, data) => await addTransaction(data),
);
ipcMain.handle(
  "db:update-transaction",
  async (_, data) => await updateTransaction(data),
);
ipcMain.handle("db:add-customer", async (_, data) => await addCustomer(data));
ipcMain.handle("db:delete-customer", async (_, id) => await deleteCustomer(id));
ipcMain.handle("db:update-prices", async (_, data) => await updatePrices(data));
ipcMain.handle(
  "db:update-business-info",
  async (_, data) => await updateBusinessInfo(data),
);

// --- LIFECYCLE ---
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
