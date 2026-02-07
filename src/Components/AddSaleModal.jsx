import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { X, User, Calculator, Wallet, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// --- 1. THE FORCE FIELD (This CSS block kills the blue background) ---
const DarkModeAutofillFix = () => (
  <style>{`
    /* Target every possible autofill state */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
      /* Mask the blue background with your dark gray color */
      -webkit-box-shadow: 0 0 0 1000px #151515 inset !important;
      /* Force text to be white */
      -webkit-text-fill-color: white !important;
      /* Prevent background color transition */
      transition: background-color 5000s ease-in-out 0s;
      caret-color: white !important;
    }
  `}</style>
);

// --- 2. INPUT CLASSES ---
const inputBaseClass = `
  w-full 
  bg-[#151515] 
  border border-[#333] 
  rounded-lg 
  p-3 
  text-white 
  text-sm font-bold
  placeholder:text-gray-600 
  outline-none 
  focus:border-[#b6ff00] 
  focus:ring-1 
  focus:ring-[#b6ff00]/50
  transition-all 
`;

// --- WRAPPER COMPONENT ---
const AddSaleModal = (props) => {
  if (!props.isOpen) return null;
  return (
    <>
      {/* Inject the Fix */}
      <DarkModeAutofillFix />
      <AddSaleForm {...props} />
    </>
  );
};

// --- HELPER: CUSTOM SELECT INPUT ---
const CustomSelect = ({ value, onChange, options, disabled, placeholder }) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        ${inputBaseClass} 
        appearance-none pr-10 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={{ colorScheme: "dark" }}
    >
      <option value="">{placeholder || "هەڵبژێرە..."}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {/* Custom Arrow Icon */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
      <ChevronDown size={16} />
    </div>
  </div>
);

// --- INNER FORM COMPONENT ---
const AddSaleForm = ({
  onClose,
  onSave,
  defaultStatus = "paid",
  defaultCustomer = "",
  prices = [],
}) => {
  const customers = useSelector((state) => state.data.customers);

  // 1. STATE
  const [formData, setFormData] = useState({
    customer: defaultCustomer,
    fuel: "",
    brand: "",
    unit: "",
    unitPrice: "",
    quantity: "",
    totalPrice: 0,
    paymentStatus: defaultStatus,
    paidAmount: "",
    note: "",
  });

  // 2. CALCULATIONS
  const uniqueFuels = useMemo(() => {
    const names = prices.map((p) => p.product);
    return [...new Set(names)];
  }, [prices]);

  const availableBrands = useMemo(() => {
    if (!formData.fuel) return [];
    return [
      ...new Set(
        prices.filter((p) => p.product === formData.fuel).map((p) => p.brand),
      ),
    ];
  }, [prices, formData.fuel]);

  const availableUnits = useMemo(() => {
    if (!formData.fuel || !formData.brand) return [];
    return prices.filter(
      (p) => p.product === formData.fuel && p.brand === formData.brand,
    );
  }, [prices, formData.fuel, formData.brand]);

  // Calculate Remaining
  const calculateRemaining = () => {
    const pay = Number(formData.paidAmount) || 0;
    const total = formData.totalPrice;
    const rem = total - pay;
    return rem > 0 ? rem : 0;
  };

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    if (
      ["quantity", "unitPrice", "paidAmount"].includes(field) &&
      Number(value) < 0
    )
      return;

    setFormData((prev) => {
      let next = { ...prev };

      if (field === "paidAmount") {
        const val = Number(value);
        if (val > prev.totalPrice) {
          toast.warning("بڕی پارە ناتوانێت زیاتر بێت لە کۆی گشتی");
          next.paidAmount = prev.totalPrice;
        } else {
          next.paidAmount = value;
        }
      } else {
        next[field] = value;
      }

      if (field === "fuel") {
        next.brand = "";
        next.unit = "";
        next.unitPrice = "";
      } else if (field === "brand") {
        next.unit = "";
        next.unitPrice = "";
      }

      if (field === "unit") {
        const priceItem = prices.find(
          (p) =>
            p.product === next.fuel &&
            p.brand === next.brand &&
            p.unit === value,
        );
        next.unitPrice = priceItem ? priceItem.unitPriceIQD : "";
      }

      if (["quantity", "unitPrice", "unit"].includes(field)) {
        const q = parseFloat(next.quantity) || 0;
        const p = parseFloat(next.unitPrice) || 0;
        next.totalPrice = Math.round(q * p);

        if (
          next.paymentStatus === "partial" &&
          Number(next.paidAmount) > next.totalPrice
        ) {
          next.paidAmount = next.totalPrice;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCustomerObj = customers.find(
      (c) => c.name === formData.customer,
    );

    if (!selectedCustomerObj) return toast.error("تکایە کڕیار هەڵبژێرە");
    if (!formData.fuel || !formData.brand || !formData.unit)
      return toast.error("زانیاری سووتەمەنی تەواو نییە");
    if (Number(formData.quantity) <= 0)
      return toast.error("بڕی سووتەمەنی هەڵەیە");

    let finalStatus = formData.paymentStatus;
    let finalPaid = 0;
    let finalRemain = 0;

    if (finalStatus === "partial") {
      const pay = Number(formData.paidAmount);
      if (pay >= formData.totalPrice) {
        finalStatus = "paid";
        finalPaid = formData.totalPrice;
        finalRemain = 0;
      } else if (pay <= 0) {
        return toast.error("بۆ پارەی سفر، 'پێنەدراو' هەڵبژێرە");
      } else {
        finalPaid = pay;
        finalRemain = formData.totalPrice - pay;
      }
    } else if (finalStatus === "paid") {
      finalPaid = formData.totalPrice;
      finalRemain = 0;
    } else {
      finalStatus = "Not Paid";
      finalPaid = 0;
      finalRemain = formData.totalPrice;
    }

    const priceItem = prices.find(
      (p) =>
        p.product === formData.fuel &&
        p.brand === formData.brand &&
        p.unit === formData.unit,
    );
    const buyPrice = priceItem ? priceItem.unitCostIQD || 0 : 0;
    const estimatedProfit =
      formData.totalPrice - buyPrice * Number(formData.quantity);

    onSave({
      id: crypto.randomUUID(),
      customerId: selectedCustomerObj.id,
      customer: formData.customer,
      fuel: formData.fuel,
      brand: formData.brand,
      unit: formData.unit,
      qty: Number(formData.quantity),
      price: Number(formData.unitPrice),
      total: formData.totalPrice,
      paid: finalPaid,
      remain: finalRemain,
      status: finalStatus,
      date: new Date().toLocaleDateString("en-GB"),
      time: new Date().toLocaleTimeString(),
      note: formData.note,
      unitCost: buyPrice,
      profit: estimatedProfit,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1060] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-right"
      dir="rtl"
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-surface rounded-t-xl">
          <h5 className="text-white font-bold flex items-center gap-2">
            <Plus size={20} className="text-[#b6ff00]" /> زیادکردنی فرۆشتن
          </h5>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body - AUTOCOMPLETE OFF */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0f0f0f]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="off"
          >
            {/* 1. Main Info */}
            <div className="bg-surface-active/50 border border-border rounded-xl p-5 relative pt-7">
              <h6 className="text-[#b6ff00] font-bold text-xs absolute -top-2.5 right-4 bg-[#0f0f0f] px-2 border border-border rounded flex items-center gap-1">
                <User size={12} /> زانیاری سەرەکی
              </h6>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block font-medium">
                    کڕیار
                  </label>
                  <CustomSelect
                    value={formData.customer}
                    onChange={(e) => handleChange("customer", e.target.value)}
                    disabled={!!defaultCustomer}
                    placeholder="کڕیارێک هەڵبژێرە..."
                    options={customers.map((c) => ({
                      value: c.name,
                      label: c.name,
                    }))}
                  />
                </div>

                <div>
                  <label className="text-text-muted text-xs mb-1.5 block font-medium">
                    پیتڕۆڵ
                  </label>
                  <CustomSelect
                    value={formData.fuel}
                    onChange={(e) => handleChange("fuel", e.target.value)}
                    placeholder="هەڵبژێرە..."
                    options={uniqueFuels.map((f) => ({ value: f, label: f }))}
                  />
                </div>

                <div>
                  <label className="text-text-muted text-xs mb-1.5 block font-medium">
                    جۆر (Brand)
                  </label>
                  <CustomSelect
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    disabled={!formData.fuel}
                    placeholder={formData.fuel ? "جۆرێک هەڵبژێرە..." : "..."}
                    options={availableBrands.map((b) => ({
                      value: b,
                      label: b,
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block font-medium">
                      یەکە
                    </label>
                    <CustomSelect
                      value={formData.unit}
                      onChange={(e) => handleChange("unit", e.target.value)}
                      disabled={!formData.brand}
                      placeholder="—"
                      options={availableUnits.map((u) => ({
                        value: u.unit,
                        label: u.unit,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block font-medium">
                      نرخ (IQD)
                    </label>
                    <input
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        handleChange("unitPrice", e.target.value)
                      }
                      className={inputBaseClass}
                      style={{ appearance: "textfield" }}
                      placeholder="0"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Calculation */}
            <div className="bg-surface-active/50 border border-border rounded-xl p-5 relative pt-7">
              <h6 className="text-[#b6ff00] font-bold text-xs absolute -top-2.5 right-4 bg-[#0f0f0f] px-2 border border-border rounded flex items-center gap-1">
                <Calculator size={12} /> هەژمارکردن
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block font-medium">
                    بڕ (Quantity)
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className={inputBaseClass}
                    style={{ appearance: "textfield" }}
                    placeholder="0"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block font-medium">
                    کۆی گشتی (IQD)
                  </label>
                  <div
                    className="w-full bg-[#151515] border border-border rounded-lg p-3 text-[#b6ff00] text-lg font-mono font-bold text-left"
                    dir="ltr"
                  >
                    {formData.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Status */}
            <div className="bg-surface-active/50 border border-border rounded-xl p-5 relative pt-7">
              <h6 className="text-[#b6ff00] font-bold text-xs absolute -top-2.5 right-4 bg-[#0f0f0f] px-2 border border-border rounded flex items-center gap-1">
                <Wallet size={12} /> شێوازی پارەدان
              </h6>
              <div className="flex flex-col gap-3">
                {/* Paid */}
                <div
                  onClick={() => handleChange("paymentStatus", "paid")}
                  className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${formData.paymentStatus === "paid" ? "bg-green-500/10 border-green-500" : "bg-surface hover:bg-surface-hover border-border"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentStatus === "paid" ? "border-green-500" : "border-gray-500"}`}
                  >
                    {formData.paymentStatus === "paid" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <span
                    className={
                      formData.paymentStatus === "paid"
                        ? "text-green-400 font-bold text-sm"
                        : "text-gray-400 text-sm"
                    }
                  >
                    پێدراو (Paid)
                  </span>
                </div>

                {/* Partial */}
                <div
                  onClick={() => handleChange("paymentStatus", "partial")}
                  className={`cursor-pointer border rounded-lg p-3 transition-all ${formData.paymentStatus === "partial" ? "bg-amber-500/10 border-amber-500" : "bg-surface hover:bg-surface-hover border-border"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentStatus === "partial" ? "border-amber-500" : "border-gray-500"}`}
                    >
                      {formData.paymentStatus === "partial" && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </div>
                    <span
                      className={
                        formData.paymentStatus === "partial"
                          ? "text-amber-400 font-bold text-sm"
                          : "text-gray-400 text-sm"
                      }
                    >
                      بەشێک (Partial)
                    </span>
                  </div>

                  {formData.paymentStatus === "partial" && (
                    <div className="mr-7 space-y-3 animate-in slide-in-from-top-1">
                      <div>
                        <input
                          type="number"
                          value={formData.paidAmount}
                          onChange={(e) =>
                            handleChange("paidAmount", e.target.value)
                          }
                          className={`${inputBaseClass} border-amber-500/30 focus:border-amber-500`}
                          placeholder="بڕی پارە..."
                          autoComplete="off"
                        />
                      </div>
                      <div className="flex justify-between items-center bg-[#151515] p-2.5 rounded-lg border border-red-500/20">
                        <span className="text-red-400 text-xs font-bold">
                          ماوە (قەرز):
                        </span>
                        <span className="text-red-500 font-mono font-bold text-sm">
                          {calculateRemaining().toLocaleString()} IQD
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Not Paid */}
                <div
                  onClick={() => handleChange("paymentStatus", "Not Paid")}
                  className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${formData.paymentStatus === "Not Paid" ? "bg-red-500/10 border-red-500" : "bg-surface hover:bg-surface-hover border-border"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentStatus === "Not Paid" ? "border-red-500" : "border-gray-500"}`}
                  >
                    {formData.paymentStatus === "Not Paid" && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span
                    className={
                      formData.paymentStatus === "Not Paid"
                        ? "text-red-400 font-bold text-sm"
                        : "text-gray-400 text-sm"
                    }
                  >
                    پێنەدراو (Credit)
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-surface-active/50 border border-border rounded-xl p-3">
              <textarea
                value={formData.note}
                onChange={(e) => handleChange("note", e.target.value)}
                className={`${inputBaseClass} h-24 resize-none`}
                placeholder="تێبینی زیادە..."
                autoComplete="off"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface rounded-b-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-surface-active hover:bg-surface-hover text-white font-bold py-3 px-6 rounded-xl border border-border"
          >
            داخستن
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] btn-primary py-3 px-6 rounded-xl shadow-lg"
          >
            پاشەکەوتکردن
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSaleModal;
