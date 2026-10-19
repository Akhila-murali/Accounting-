import { ChevronRight } from 'lucide-react';

import LoadingSpinner from '../common/LoadingSpinner.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ManufacturedStockTable({ items, loading, error, onRowClick }) {
  const headings = [
    'Item', 'Manufactured', 'Consumed', 'Available', 'Avg Cost',
    'Selling Price', 'Stock Value', 'Action',
  ];

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
      <div
        className="w-full max-w-full touch-pan-x overflow-x-auto overscroll-x-contain"
        onWheel={(event) => {
          const container = event.currentTarget;

          if (container.scrollWidth <= container.clientWidth) return;

          event.preventDefault();
          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-stone-50 text-[11px] uppercase text-stone-500">
            <tr>{headings.map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="p-10 text-center"><LoadingSpinner /></td></tr>
            ) : error ? (
              <tr><td colSpan="8" className="p-10 text-center text-rose-600">{error}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" className="p-8"><TableEmptyState title="No manufactured goods found" message="Completed manufacturing stock will appear here." /></td></tr>
            ) : items.map((item, index) => (
              <tr key={`${item.itemKey}-${item.hsnsac || index}`} onClick={() => onRowClick(item)} className="cursor-pointer border-t border-stone-100 hover:bg-[#fbf5e7]/30">
                <td className="px-4 py-3 font-semibold text-stone-900">{item.itemKey}</td>
                <td className="px-4 py-3">{item.manufacturedQuantity}</td>
                <td className="px-4 py-3">{item.consumedQuantity}</td>
                <td className="px-4 py-3 font-semibold">{item.availableQuantity}</td>
                <td className="px-4 py-3">{money(item.averageManufacturingCost)}</td>
                <td className="px-4 py-3">{money(item.sellingPricePerUnit)}</td>
                <td className="px-4 py-3 font-semibold">{money(item.totalAvailableStockValue)}</td>
                <td className="px-4 py-3 text-xs font-semibold text-[#8c6723]">
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
