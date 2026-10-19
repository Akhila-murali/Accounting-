import { ChevronRight } from 'lucide-react';

import LoadingSpinner from '../common/LoadingSpinner.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';

const money = (value) => value == null
  ? '—'
  : `₹${Number(value).toLocaleString('en-IN')}`;

const statusLabels = {
  OutOfStock: 'OUT OF STOCK',
  LowStock: 'LOW STOCK',
  InStock: 'IN STOCK',
  OverStock: 'OVER STOCK',
};

const statusColors = {
  OutOfStock: 'text-red-900',
  LowStock: 'text-red-600',
  InStock: 'text-emerald-700',
  OverStock: 'text-blue-700',
};

export default function StockTable({ items, loading, error, onRowClick }) {
  const headings = [
    'Item', 'HSN/SAC', 'Unit', 'Purchased', 'Sold', 'Available',
    'Consumed', 'Damaged', 'Purchase Price', 'Selling Price', 'Status', 'Action',
  ];

  return (
    <section className="-mx-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-stone-200 bg-white font-sans text-stone-800 shadow-xs sm:mx-0 sm:w-full sm:rounded-2xl">
      <div
        className="w-full max-w-full overflow-x-auto overscroll-x-contain"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth > container.clientWidth) {
            container.scrollLeft += event.deltaY;
          }
        }}
      >
        <table className="w-full min-w-[850px] border-collapse text-left lg:min-w-[950px]">
          <thead className="bg-stone-50 text-[11px] uppercase text-stone-500">
            <tr>
              {headings.map((heading) => (
                <th key={heading} className="border-b border-stone-200 px-2 py-3 font-semibold sm:px-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="12" className="p-10 text-center"><LoadingSpinner /></td></tr>
            ) : error ? (
              <tr><td colSpan="12" className="p-10 text-center text-sm text-rose-600">{error}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="12" className="p-8"><TableEmptyState title="No stock found" message="Current stock will appear here." /></td></tr>
            ) : items.map((item) => (
              <tr key={item.itemKey} onClick={() => onRowClick(item)} className="cursor-pointer border-b border-stone-100 text-sm hover:bg-[#fbf5e7]/30">
                <td className="px-2 py-3 font-medium text-stone-900 sm:px-3">{item.name}</td>
                <td className="px-2 py-3 sm:px-3">{item.hsnsac}</td>
                <td className="px-2 py-3 sm:px-3">{item.defaultUnit}</td>
                <td className="px-2 py-3 text-center sm:px-3">{item.purchasedQuantity}</td>
                <td className="px-2 py-3 text-center sm:px-3">{item.soldQuantity}</td>
                <td className="px-2 py-3 text-center font-semibold sm:px-3">{item.availableQuantity}</td>
                <td className="px-2 py-3 text-center sm:px-3">{item.consumedQuantity}</td>
                <td className="px-2 py-3 text-center sm:px-3">{item.damagedQuantity}</td>
                <td className="px-2 py-3 sm:px-3">{money(item.averagePurchasePrice)}</td>
                <td className="px-2 py-3 font-medium sm:px-3">{money(item.currentSellingPrice)}</td>
                <td className="px-2 py-3 sm:px-3">
                  <span className={`text-[11px] font-semibold tracking-wide ${statusColors[item.stockStatus] || 'text-stone-600'}`}>
                    {statusLabels[item.stockStatus] || item.stockStatus}
                  </span>
                </td>
                <td className="px-2 py-3 text-xs font-semibold text-[#8c6723] sm:px-3">
                  <span className="inline-flex items-center gap-1">History <ChevronRight size={13} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
