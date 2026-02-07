// --- 1. Strict Date Formatter ---
export const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
};

// --- 2. Text Normalizers ---
export const toLatinDigits = (s) =>
  String(s)
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\d.]/g, "");

export const normSpaces = (s) => (s || "").replace(/\s+/g, " ").trim();

// 👇 FIXED: Allows ANY product name (Benzin, Diesel, etc.)
export const normProduct = (s) => {
  return normSpaces(s);
};

export const normUnit = (s) => (/بەرمیل|barrel/i.test(s) ? "بەرمیل" : "لیتر");

export const makeKey = (p, b, u) =>
  [normProduct(p), normSpaces(b), normUnit(u)].join("|");
