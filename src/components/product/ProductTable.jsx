import { useState } from 'react';
import { Search } from 'lucide-react';
import TableEmptyState from '../common/TableEmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function ProductTable({ products, loading, selectedProduct, isDetailsOpen, onView }) {
  const [search, setSearch] = useState('');
  const term = search.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(term) ||
    product.hsnSac?.toLowerCase().includes(term)
  );

  return (
    <div className={`transition-all duration-300 bg-white border border-stone-200/60 rounded-2xl shadow-xs max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar ${isDetailsOpen ? 'w-full lg:w-1/2' : 'w-full'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product name or HSN/SAC..." className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30" />
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[850px] text-left border-collapse">
          <thead><tr className="border-b border-stone-100 bg-stone-50/60">
            {['Name', 'HSN/SAC', 'Qty', 'Price / Unit', 'Total', 'Status'].map((heading) => <th key={heading} className="px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">{heading}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="p-10"><LoadingSpinner /></td></tr> : filteredProducts.length === 0 ? <tr><td colSpan="6" className="p-10"><TableEmptyState title="No products found" message="Products will appear here." /></td></tr> : filteredProducts.map((product) => (
              <tr key={product.id} onClick={() => onView(product)} className={`border-b border-stone-100 hover:bg-[#fbf5e7]/25 cursor-pointer ${selectedProduct?.id === product.id && isDetailsOpen ? 'bg-[#fbf5e7]/40 border-l-4 border-l-[#8c6723]' : ''}`}>
                <td className="px-4 py-3.5 text-sm font-semibold text-stone-900">{product.name}</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">{product.hsnSac}</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">{product.qty}</td>
                <td className="px-4 py-3.5 text-sm text-stone-600">₹{Number(product.pricePerUnit).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-stone-800">₹{Number(product.total).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>{product.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3.5 border-t border-stone-100 text-stone-500 text-xs">Showing {filteredProducts.length} entries</div>
    </div>
  );
}
