import { Info, Package, X } from 'lucide-react';

export default function ProductDetails({ product, onClose }) {
  if (!product) return null;
  const rows = [['Name', product.name], ['HSN/SAC', product.hsnSac], ['Quantity', product.qty], ['Price per Unit', `₹${Number(product.pricePerUnit).toLocaleString('en-IN')}`], ['Total', `₹${Number(product.total).toLocaleString('en-IN')}`], ['Status', product.status]];

  return (
    <div className="w-full max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar text-left pr-1">
      <div className="bg-white border border-stone-200/70 rounded-2xl shadow-sm overflow-hidden border-l-4 border-l-[#8c6723]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-[#fbf5e7] text-[#8c6723] flex items-center justify-center"><Package size={15} /></div><h2 className="text-sm font-bold text-stone-900 m-0">Product Details</h2></div>
          <button onClick={onClose} title="Close" className="p-1.5 border-0 bg-transparent text-stone-400 cursor-pointer"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 border-b border-stone-100"><h3 className="text-base font-bold text-stone-900 m-0">{product.name}</h3><p className="text-xs text-stone-500 font-mono mt-1 mb-0">ID: {product.id}</p></div>
        <div className="p-5"><h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100"><Info size={13} />Product Information</h4>
          <div className="space-y-2.5 text-sm">{rows.map(([label, value]) => <div key={label} className="flex justify-between items-center py-1 border-b border-stone-50"><span className="text-stone-500 font-medium">{label}</span><span className="text-stone-900 font-bold">{value}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}
