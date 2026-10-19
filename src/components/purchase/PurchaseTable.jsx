import { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  Filter,
  Search,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TableEmptyState from '../common/TableEmptyState.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function PurchaseTable({
  purchases = [],
  loading,
  error,
  fetchPurchases,
  isDraftView,
  onDelete,
  onDiscardDraft,
  actionId,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchText = search.toLowerCase();

  const filteredPurchases = purchases.filter((purchase) => {
    const billNumber = purchase.billNumber || '';
    const supplier = purchase.supplierCompanyName || '';
    const status = purchase.isDraft ? 'Draft' : purchase.status || '';

    return (
      billNumber.toLowerCase().includes(searchText) ||
      supplier.toLowerCase().includes(searchText) ||
      status.toLowerCase().includes(searchText)
    );
  });

  const sortedPurchases = [...filteredPurchases].sort((first, second) => {
    const firstDate = new Date(first.createdAt || first.billDate).getTime();
    const secondDate = new Date(second.createdAt || second.billDate).getTime();

    return sortOrder === 'Newest'
      ? secondDate - firstDate
      : firstDate - secondDate;
  });

  const openPurchase = (purchase) => {
    if (purchase.isDraft) {
      navigate(`/purchase/new?draftId=${purchase.draftId}`);
    } else {
      navigate(`/purchase/${purchase.id}`);
    }
  };

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl shadow-xs max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={
              isDraftView
                ? 'Search drafts...'
                : 'Search bill or supplier...'
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059]"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((current) => !current)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            <Filter size={13} className="text-stone-400" />
            <span>{sortOrder}</span>
            <ChevronDown size={13} className="text-stone-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[130px] overflow-hidden py-1">
              {['Newest', 'Oldest'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortOrder(option);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-600 bg-white hover:bg-stone-50 cursor-pointer border-none"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto pb-2"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth <= container.clientWidth) return;

          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              {['Bill Number', 'Supplier', 'Bill Date', 'Total', 'Status', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-stone-100 animate-pulse">
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3.5">
                      <div className="h-4 bg-stone-100 rounded-md w-2/3" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="text-sm text-stone-800 m-0">
                      Failed to load purchases
                    </p>
                    <p className="text-xs text-stone-500 m-0">{error}</p>
                    <button
                      type="button"
                      onClick={fetchPurchases}
                      className="mt-2 text-xs text-[#8c6723] border border-stone-200 px-3 py-1.5 rounded-lg bg-white cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : sortedPurchases.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-10">
                  <TableEmptyState
                    title={isDraftView ? 'No drafts found' : 'No purchases found'}
                    message={
                      isDraftView
                        ? 'Active purchase drafts will appear here.'
                        : 'Purchases you create will appear here.'
                    }
                  />
                </td>
              </tr>
            ) : (
              sortedPurchases.map((purchase) => (
                <tr
                  key={purchase.isDraft ? `draft-${purchase.draftId}` : purchase.id}
                  onClick={() => openPurchase(purchase)}
                  className="cursor-pointer border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25"
                >
                  <td className="px-4 py-3.5 text-stone-900 text-sm">
                    {purchase.billNumber || `Draft #${purchase.draftId}`}
                  </td>
                  <td className="px-4 py-3.5 text-stone-700 text-sm">
                    {purchase.supplierCompanyName || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm">
                    {formatDate(purchase.billDate)}
                  </td>
                  <td className="px-4 py-3.5 text-stone-700 text-sm">
                    {purchase.isDraft
                      ? '—'
                      : `₹${Number(purchase.totalAmount || 0).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    <StatusBadge
                      status={purchase.isDraft ? 'Draft' : purchase.status}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={purchase.isDraft ? 'Discard draft' : 'Delete purchase'}
                        disabled={actionId === (purchase.isDraft ? `draft-${purchase.draftId}` : purchase.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          purchase.isDraft
                            ? onDiscardDraft(purchase)
                            : onDelete(purchase);
                        }}
                        className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3.5 border-t border-stone-100 text-stone-500 text-xs">
        Showing {sortedPurchases.length}
      </div>
    </div>
  );
}
