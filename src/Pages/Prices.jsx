import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updatePrices } from "../store/dataSlice";
import { AddModal, RenewModal } from "../Components/FuelModals";
import { Plus, Tag, RefreshCw, Droplet } from "lucide-react";
import {
  toLatinDigits,
  normSpaces,
  normProduct,
  normUnit,
  makeKey,
} from "../utils/helper";
import { toast } from "sonner";

export default function Prices() {
  const dispatch = useDispatch();
  const prices = useSelector((state) => state.data.prices);

  const [filter, setFilter] = useState("ALL");
  const [isAddOpen, setAddOpen] = useState(false);
  const [isRenewOpen, setRenewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- 1. DYNAMICALLY GET UNIQUE PRODUCTS ---
  const uniqueProducts = useMemo(() => {
    const names = prices.map((p) => p.product);
    return [...new Set(names)];
  }, [prices]);

  // --- HELPER: SAVE TO REDUX & DATABASE ---
  const saveToReduxAndDB = async (newPrices) => {
    if (window.api) {
      try {
        await window.api.updatePrices(newPrices);
      } catch (err) {
        console.error("Failed to update prices:", err);
        toast.error("هەڵە لە پاشەکەوتکردنی نرخ");
        return;
      }
    }
    dispatch(updatePrices(newPrices));
  };

  // --- Handlers ---
  const handleAdd = (formData) => {
    const product = normProduct(formData.product);
    const brand = normSpaces(formData.brand);
    const unit = normUnit(formData.unit);
    const price = Number(toLatinDigits(formData.price));

    if (price < 0 || isNaN(price)) return toast.error("نرخ هەڵەیە");

    const key = makeKey(product, brand, unit);
    const exists = prices.some(
      (item) => makeKey(item.product, item.brand, item.unit) === key,
    );

    if (exists) {
      return toast.error("ئەم بەرهەمە پێشتر هەیە؛ تکایە نوێکردنەوە بەکاربهێنە");
    }

    const newItem = {
      product,
      productNorm: product,
      brand,
      unit,
      unitPriceIQD: price,
    };

    saveToReduxAndDB([...prices, newItem]);
    setAddOpen(false);
    toast.success("بەرهەم بە سەرکەوتوویی زیادکرا");
  };

  const handleUpdate = (updatedItem) => {
    if (updatedItem.unitPriceIQD < 0)
      return toast.error("نرخ نابێت کەمتر بێت لە سفر");

    const key = makeKey(
      updatedItem.product,
      updatedItem.brand,
      updatedItem.unit,
    );

    const newItems = prices.map((item) =>
      makeKey(item.product, item.brand, item.unit) === key ? updatedItem : item,
    );

    saveToReduxAndDB(newItems);
    setRenewOpen(false);
    toast.success("نرخ بە سەرکەوتوویی نوێکرایەوە");
  };

  const handleDelete = (itemToDelete) => {
    if (!window.confirm("دڵنیایت لە سڕینەوەی ئەم بەرهەمە؟")) return;

    const key = makeKey(
      itemToDelete.product,
      itemToDelete.brand,
      itemToDelete.unit,
    );

    const newItems = prices.filter(
      (item) => makeKey(item.product, item.brand, item.unit) !== key,
    );

    saveToReduxAndDB(newItems);
    setRenewOpen(false);
    toast.success("بەرهەم سڕایەوە");
  };

  // --- 2. DYNAMIC FILTERING ---
  const filteredItems = prices.filter((item) => {
    if (filter === "ALL") return true;
    return item.product === filter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Tag className="text-primary" /> نرخەکانی ئەمڕۆ
        </h1>
        <div className="relative">
          {/* DYNAMIC DROPDOWN */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-surface-hover text-white font-bold text-sm py-2 px-4 pr-8 rounded-lg border border-border focus:border-primary focus:outline-none cursor-pointer transition-colors"
          >
            <option value="ALL">گشتی (ALL)</option>
            {uniqueProducts.map((prod, index) => (
              <option key={index} value={prod}>
                {prod}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="card-base relative group hover:-translate-y-1 hover:border-primary transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    {item.product}
                  </h2>
                  <span className="bg-surface-active text-text-muted text-[11px] px-2.5 py-1 rounded-md w-fit border border-border font-medium">
                    {item.brand}
                  </span>
                </div>
                {/* ICON */}
                <div className="bg-surface-active p-3 rounded-full border border-border text-primary group-hover:bg-primary group-hover:text-black transition-colors shadow-inner">
                  <Droplet size={24} />
                </div>
              </div>

              {/* RESTORED CARD INFO (Liter/Barrel) */}
              <div className="mt-2">
                <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                  نرخی هەر{" "}
                  <span className="text-gray-300 font-bold">{item.unit}ێک</span>
                </p>
                <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1.5 font-mono">
                  {Number(item.unitPriceIQD).toLocaleString()}{" "}
                  <span className="text-sm text-primary font-bold opacity-80 font-sans">
                    IQD
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedItem(item);
                setRenewOpen(true);
              }}
              className="w-full bg-surface-active hover:bg-primary hover:text-black text-text-muted hover:font-bold py-3.5 text-sm transition-all flex items-center justify-center gap-2 border-t border-border"
            >
              <RefreshCw size={16} /> نوێکردنەوە (Renew)
            </button>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed left-8 bottom-8 z-50 btn-primary px-6 py-4 shadow-2xl hover:scale-110 hover:shadow-primary/20 transition-all flex items-center gap-2 rounded-full font-bold"
      >
        <Plus size={24} />
        <span className="hidden sm:inline">زیادکردن</span>
      </button>

      {/* Modals */}
      <AddModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      {selectedItem && (
        <RenewModal
          isOpen={isRenewOpen}
          onClose={() => setRenewOpen(false)}
          data={selectedItem}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
