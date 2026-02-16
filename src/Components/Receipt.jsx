import React from "react";

export const Receipt = React.forwardRef(({ transaction, businessInfo }, ref) => {
  return (
    <div ref={ref} dir="rtl" className="p-4 bg-white text-black font-sans max-w-[80mm] mx-auto print:max-w-full print:w-full print:bg-white text-sm leading-tight">
      {!transaction ? (
        <div className="text-center py-4">خەریکە وەسڵ ئامادە دەکرێت...</div>
      ) : (
        <>
          {/* --- HEADER --- */}
          <div className="text-center border-b-2 border-black pb-2 mb-2">
            <h1 className="text-xl font-bold mb-1">{businessInfo?.name || "ناوی پرۆژە"}</h1>
            <div className="text-xs flex flex-col gap-0.5">
               <span>{businessInfo?.address || "ناونیشان"}</span>
               <span dir="ltr">{businessInfo?.phone || "ژمارەی مۆبایل"}</span>
            </div>
          </div>

          {/* --- INFO GRID (Compact Key:Value) --- */}
          <div className="flex flex-col gap-1 text-xs mb-3 border-b border-black pb-2">
            <div className="flex">
               <span className="font-bold w-20">بەروار:</span>
               <span>{transaction.date} <span className="mx-1">|</span> <span dir="ltr">{transaction.time || ""}</span></span>
            </div>
            <div className="flex">
               <span className="font-bold w-20">ژمارەی وەسڵ:</span>
               <span className="font-mono">#{transaction.id.toString().slice(-6)}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-20">کڕیار:</span>
               <span className="font-bold">{transaction.customer}</span>
            </div>
          </div>

          {/* --- ITEMS TABLE --- */}
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b border-black">
                <th className="text-right py-1">ماددە (جۆر)</th>
                <th className="text-center py-1">بڕ</th>
                <th className="text-left py-1">نرخ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 text-right align-top">
                  <div className="font-bold">{transaction.fuel}</div>
                  <div className="text-[10px] text-gray-600">{transaction.brand}</div>
                </td>
                <td className="py-1 text-center align-top">
                  <div dir="ltr">{transaction.qty} {transaction.unit}</div>
                </td>
                <td className="py-1 text-left align-top font-mono">
                   {Number(transaction.price || (transaction.total / transaction.qty)).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* --- TOTALS (Compact Right-Aligned) --- */}
          <div className="border-t-2 border-black pt-2 mb-2 flex flex-col items-end text-sm">
            <div className="flex justify-between w-full font-bold text-lg mb-1">
              <span>کۆی گشتی:</span>
              <span>{Number(transaction.total).toLocaleString()} <span className="text-xs">IQD</span></span>
            </div>
            
            <div className="flex justify-between w-full text-xs">
              <span>بڕی دراو:</span>
              <span>{Number(transaction.paid).toLocaleString()} IQD</span>
            </div>

            {Number(transaction.total - transaction.paid) > 0 ? (
               <div className="flex justify-between w-full mt-1 pt-1 border-t border-dotted border-black font-bold">
                <span>ماوە (قەرز):</span>
                <span>{Number(transaction.total - transaction.paid).toLocaleString()} IQD</span>
              </div>
            ) : (
               <div className="w-full text-center text-[10px] font-bold border rounded border-black mt-1 py-0.5">
                  پاککراوەتەوە (Paid)
               </div>
            )}
          </div>

          {/* --- NOTES --- */}
          {transaction.note && (
            <div className="border border-black rounded p-1.5 mb-3 text-xs">
               <span className="font-bold block mb-0.5 border-b border-gray-400 pb-0.5 w-max">تێبینی:</span>
               <p className="whitespace-pre-wrap">{transaction.note}</p>
            </div>
          )}

          {/* --- FOOTER --- */}
          <div className="text-center text-[10px] mt-2">
            <p className="font-bold">سوپاس بۆ سەردانەکەتان</p>
          </div>
        </>
      )}
    </div>
  );
});

Receipt.displayName = "Receipt";
