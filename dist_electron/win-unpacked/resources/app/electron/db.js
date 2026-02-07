import { app } from "electron";
import path from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import fs from "fs";

let db;

export async function initDB() {
  // 1. Get the Safe Path (AppData)
  const userDataPath = app.getPath("userData");

  // Ensure the folder exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // 2. THE SAFETY SWITCH
  // If app is installed (.exe) -> use "business_db.json"
  // If app is in VS Code (Dev) -> use "dev_db.json"
  const dbName = app.isPackaged ? "business_db.json" : "dev_db.json";
  const dbPath = path.join(userDataPath, dbName);

  // ⚠️ DEBUG LOG
  console.log("-------------------------------------");
  console.log(
    "🚀 MODE:",
    app.isPackaged ? "PRODUCTION (Real App)" : "DEVELOPMENT (Coding)",
  );
  console.log("📂 DATABASE:", dbName);
  console.log("📍 PATH:", dbPath);
  console.log("-------------------------------------");

  // 3. Setup LowDB
  const adapter = new JSONFile(dbPath);
  db = new Low(adapter, {
    transactions: [],
    customers: [],
    prices: [],
    businessInfo: { name: "My Business" },
    admin: null,
  });

  // 4. Read & Initialize
  await db.read();

  // Set defaults if empty
  db.data ||= {};
  db.data.transactions ||= [];
  db.data.customers ||= [];
  db.data.prices ||= [];
  db.data.businessInfo ||= { name: "My Business" };
  db.data.admin ||= null;

  await db.write();
  return true;
}

// --- HELPER: Auto-Calculate Status ---
function calculateStatus(total, paid) {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid) || 0;

  if (p >= t) {
    return "Paid"; // Full Payment
  } else if (p > 0) {
    return "Partial"; // Some Payment
  } else {
    return "Not Paid"; // No Payment
  }
}

// --- API FUNCTIONS ---

export async function getTransactions() {
  await db.read();
  return db.data;
}

export async function addTransaction(t) {
  await db.read();

  // 🛡️ AUTO-CALCULATE STATUS
  t.status = calculateStatus(t.totalAmount || t.total, t.paidAmount || t.paid);

  // Ensure ID and Date exist
  t.id = t.id || Date.now().toString();
  t.date = t.date || new Date().toISOString().split("T")[0];

  db.data.transactions.push(t);
  await db.write();
  return { success: true, transaction: t };
}

export async function updateTransaction(updatedTx) {
  await db.read();
  const index = db.data.transactions.findIndex((t) => t.id === updatedTx.id);

  if (index !== -1) {
    // 🛡️ AUTO-CALCULATE STATUS ON UPDATE
    updatedTx.status = calculateStatus(
      updatedTx.total || updatedTx.totalAmount,
      updatedTx.paid || updatedTx.paidAmount,
    );

    db.data.transactions[index] = updatedTx;
    await db.write();
    return { success: true, transaction: updatedTx };
  }
  return { success: false, error: "Not found" };
}

export async function addCustomer(c) {
  await db.read();
  db.data.customers.push(c);
  await db.write();
  return { success: true };
}

// 👇 FIXED: CASCADING DELETE
export async function deleteCustomer(id) {
  await db.read();

  // 1. Find the customer's name first
  const customerToDelete = db.data.customers.find((c) => c.id === id);

  if (customerToDelete) {
    const customerName = customerToDelete.name;

    // 2. Delete the Customer
    db.data.customers = db.data.customers.filter((c) => c.id !== id);

    // 3. Delete ALL transactions belonging to this customer
    // We filter OUT any transaction that has this customer's name
    const initialCount = db.data.transactions.length;
    db.data.transactions = db.data.transactions.filter(
      (t) => t.customer !== customerName,
    );
    const finalCount = db.data.transactions.length;

    console.log(`Deleted customer: ${customerName}`);
    console.log(
      `Deleted ${initialCount - finalCount} associated transactions.`,
    );

    await db.write();
    return { success: true };
  }

  return { success: false, error: "Customer not found" };
}

export async function updatePrices(newPrices) {
  await db.read();
  db.data.prices = newPrices;
  await db.write();
  return { success: true };
}

export async function updateBusinessInfo(info) {
  await db.read();
  db.data.businessInfo = info;
  await db.write();
  return { success: true };
}

// --- AUTH FUNCTIONS ---

export async function checkSystemSetup() {
  await db.read();
  return !!db.data.admin;
}

export async function registerAdmin({ username, password, businessName }) {
  await db.read();
  db.data.admin = { username, password };
  db.data.businessInfo = { name: businessName };
  await db.write();
  return { success: true };
}

export async function loginAdmin({ username, password }) {
  await db.read();
  const savedAdmin = db.data.admin;

  if (
    savedAdmin &&
    savedAdmin.username === username &&
    savedAdmin.password === password
  ) {
    return { success: true };
  } else {
    return { success: false, error: "Wrong password" };
  }
}
