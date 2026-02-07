import React, { useState } from "react";
import { useSelector } from "react-redux"; // 👈 Added Redux
import { X, Plus, RefreshCw, Trash2, Droplet } from "lucide-react";

const inputClass =
  "w-full bg-surface border border-border rounded-lg p-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600";
const labelClass = "text-text-muted text-xs mb-1.5 block font-medium";

// Wrapper
const ModalWrapper = ({ onClose, title, icon: Icon, children }) => (
  <div
    className="fixed inset-0 z-[1060] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-right"
    dir="rtl"
  >
    <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-4 border-b border-border bg-surface rounded-t-xl">
        <h5 className="text-white font-bold flex items-center gap-2">
          {Icon && <Icon size={20} className="text-primary" />} {title}
        </h5>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// --- ADD MODAL ---
export function AddModal({ isOpen, onClose, onAdd }) {
  if (!isOpen) return null;
  return <AddModalForm onClose={onClose} onAdd={onAdd} />;
}

const AddModalForm = ({ onClose, onAdd }) => {
  // 1. Get existing products
  const prices = useSelector((state) => state.data.prices);
  const existingProducts = [...new Set(prices.map((p) => p.product))];

  const [formData, setFormData] = useState({
    product: "",
    brand: "",
    unit: "لیتر",
    price: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, price: Number(formData.price) });
  };

  return (
    <ModalWrapper onClose={onClose} title="زیادکردنی بەرهەم" icon={Plus}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 👇 DYNAMIC INPUT LIST */}
        <div>
          <label className={labelClass}>بەرهەم (Product)</label>
          <input
            list="products-list"
            value={formData.product}
            onChange={(e) =>
              setFormData({ ...formData, product: e.target.value })
            }
            placeholder="هەڵبژێرە یان بنووسە..."
            className={inputClass}
            required
            autoFocus
          />
          <datalist id="products-list">
            {existingProducts.map((p, i) => (
              <option key={i} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>جۆر (Brand)</label>
          <input
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            placeholder="نموونە: لاناز..."
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>یەکە</label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className={`${inputClass} cursor-pointer`}
            >
              <option value="لیتر">لیتر</option>
              <option value="بەرمیل">بەرمیل</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>نرخ (IQD)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0"
              className={inputClass}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full py-3 mt-2 shadow-lg"
        >
          زیادکردن
        </button>
      </form>
    </ModalWrapper>
  );
};

// --- RENEW MODAL ---
export function RenewModal({ isOpen, onClose, data, onUpdate, onDelete }) {
  if (!isOpen || !data) return null;
  return (
    <RenewModalForm
      onClose={onClose}
      data={data}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}

const RenewModalForm = ({ onClose, data, onUpdate, onDelete }) => {
  const [price, setPrice] = useState(data.unitPriceIQD);
  return (
    <ModalWrapper onClose={onClose} title="نوێکردنەوەی نرخ" icon={RefreshCw}>
      <div className="space-y-5">
        <div className="bg-surface-active/50 border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Droplet size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">
              {data.product} - {data.brand}
            </h4>
            <span className="text-text-muted text-xs">
              یەکەی هەژمار: {data.unit}
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass}>نرخی نوێ (IQD)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${inputClass} text-lg font-bold text-primary`}
            autoFocus
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onDelete(data)}
            className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> سڕینەوە
          </button>
          <button
            onClick={() => onUpdate({ ...data, unitPriceIQD: Number(price) })}
            className="flex-[2] btn-primary py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> نوێکردنەوە
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
