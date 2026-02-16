import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addCustomer, deleteCustomer } from "../store/dataSlice";
import {
  Users,
  Trash2,
  Plus,
  Search,
  Phone,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.data.customers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- HANDLER: ADD CUSTOMER ---
  const handleAdd = async (e) => {
    e.preventDefault();

    // 1. Validation Checks
    if (!name.trim()) return toast.error("تکایە ناوی کڕیار بنووسە");
    if (!phone.trim()) return toast.error("تکایە ژمارەی مۆبایل بنووسە");

    // 2. Duplicate Check
    const exists = customers.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (exists) {
      return toast.error("ئەم کڕیارە پێشتر تۆمارکراوە!");
    }

    const newCustomer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
    };

    // 3. SAVE TO DATABASE (Backend)
    if (window.api) {
      console.log("💾 Saving customer to DB...");
      try {
        await window.api.addCustomer(newCustomer);
      } catch (err) {
        console.error("Failed to save customer:", err);
        return toast.error("هەڵە لە پاشەکەوتکردن");
      }
    }

    // 4. UPDATE REDUX (Frontend)
    dispatch(addCustomer(newCustomer));

    // 5. Success & Reset
    toast.success("کڕیار بە سەرکەوتوویی زیادکرا");
    setName("");
    setPhone("");
    setIsModalOpen(false);
  };

  // --- HANDLER: DELETE CUSTOMER ---
  // --- HANDLER: DELETE CUSTOMER ---
  const handleDelete = (id) => {
    toast("دڵنیایت لە سڕینەوەی ئەم کڕیارە؟", {
      action: {
        label: "بەڵێ، بیسڕەوە",
        onClick: async () => {
          // 1. DELETE FROM DATABASE (Backend)
          if (window.api) {
            try {
              // This should handle deleting the customer and transactions in your JSON
              await window.api.deleteCustomer(id);
            } catch (err) {
              console.error("Failed to delete customer:", err);
              return toast.error("هەڵە لە سڕینەوە");
            }
          }

          // 2. DELETE FROM REDUX (Frontend)
          // Because we updated dataSlice.js, this will now automatically
          // wipe the transactions from your screen as well.
          dispatch(deleteCustomer(id));

          toast.success("کڕیارەکە و هەموو تۆمارەکانی بە سەرکەوتوویی سڕایەوە");
        },
      },
      cancel: {
        label: "نەخێر",
      },
      duration: 5000,
      icon: <AlertTriangle className="text-amber-500" size={20} />,
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-text-main">
            <Users className="text-primary" /> بەڕێوەبردنی کڕیاران
          </h1>
          <p className="text-text-muted text-sm mt-1">
            لیستی هەموو کڕیارەکان و بەڕێوەبردنیان
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="گەڕان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2.5 pr-10 pl-4 w-full bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:outline-none placeholder:text-text-muted"
            />
            <Search className="absolute left-3 top-3 text-text-muted" size={18} />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">زیادکردن</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl bg-surface-hover">
            <Users
              size={48}
              className="mx-auto text-text-muted mb-3 opacity-50"
            />
            <p className="text-text-muted font-medium">هیچ کڕیارێک نەدۆزرایەوە</p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="card-base p-4 flex justify-between items-center group hover:border-primary/50 hover:-translate-y-1 transition-all shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-active rounded-full flex items-center justify-center text-text-muted border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main">{c.name}</h3>
                  <div className="flex items-center gap-1.5 text-text-muted text-sm mt-0.5">
                    <Phone size={12} className="text-primary" />
                    <span dir="ltr" className="font-mono">
                      {c.phone || "---"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-text-muted hover:text-red-500 hover:bg-red-500/10 p-2.5 rounded-lg transition-all"
                title="سڕینەوە"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="card-base w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-border">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-text-main">
                <Plus className="text-primary" size={24} /> زیادکردنی کڕیار
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1.5 block font-bold">
                  ناوی کڕیار <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:outline-none placeholder:text-text-muted"
                  placeholder="ناوی سیانی..."
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block font-bold">
                  ژمارەی مۆبایل <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 font-mono text-left bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:outline-none placeholder:text-text-muted"
                  placeholder="0750..."
                  dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 flex justify-center items-center gap-2"
                >
                  <Save size={18} /> زیادکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
