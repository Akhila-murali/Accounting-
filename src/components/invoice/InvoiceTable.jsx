import { useState } from 'react';
import { AlertCircle, ChevronDown, Filter, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import StatusBadge from '../common/StatusBadge.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';

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

export default function InvoiceTable({
  invoices = [],
  loading,
  error,
  onRetry,
  onDelete,
  actionId,
  basePath = '/proforma-invoices',
  numberHeading = 'PI Number',
  documentName = 'proforma invoice',
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchText = search.toLowerCase();

  const filteredInvoices = invoices.filter((invoice) =>
    [invoice.invoiceNumber, invoice.customerName, invoice.status]
      .some((value) => String(value || '').toLowerCase().includes(searchText))
  );

  const sortedInvoices = [...filteredInvoices].sort((first, second) => {
    const firstDate = new Date(first.createdAt || first.invoiceDate).getTime();
    const secondDate = new Date(second.createdAt || second.invoiceDate).getTime();
    return sortOrder === 'Newest' ? secondDate - firstDate : firstDate - secondDate;
  });

  return (
    <div className="no-scrollbar max-h-[calc(100vh-175px)] overflow-y-auto rounded-2xl border border-stone-200/60 bg-white shadow-xs">
      <div className="flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3.5">
        <div className="relative max-w-sm flex-grow">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice or customer..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-8 pr-3 text-sm text-stone-800 placeholder-stone-400 focus:border-[#c5a059] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((current) => !current)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-600 hover:bg-stone-50"
          >
            <Filter size={13} className="text-stone-400" />
            <span>{sortOrder}</span>
            <ChevronDown size={13} className="text-stone-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[130px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              {['Newest', 'Oldest'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortOrder(option);
                    setDropdownOpen(false);
                  }}
                  className="w-full cursor-pointer border-none bg-white px-4 py-2 text-left text-sm text-stone-600 hover:bg-stone-50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              {[numberHeading, 'Customer', 'Invoice Date', 'Valid Until', 'Total', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-stone-100">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3.5"><div className="h-4 w-2/3 rounded-md bg-stone-100" /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="m-0 text-sm text-stone-800">Failed to load {documentName}s</p>
                    <p className="m-0 text-xs text-stone-500">{error}</p>
                    <button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-[#8c6723]">Try Again</button>
                  </div>
                </td>
              </tr>
            ) : sortedInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-10">
                  <TableEmptyState title={`No ${documentName}s found`} message={`${documentName.charAt(0).toUpperCase() + documentName.slice(1)}s you create will appear here.`} />
                </td>
              </tr>
            ) : (
              sortedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => navigate(`${basePath}/${invoice.id}`)}
                  className="cursor-pointer border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25"
                >
                  <td className="px-4 py-3.5 text-sm text-stone-900">{invoice.invoiceNumber || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-stone-700">{invoice.customerName || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-stone-500">{formatDate(invoice.invoiceDate)}</td>
                  <td className="px-4 py-3.5 text-sm text-stone-500">{formatDate(invoice.validUntil)}</td>
                  <td className="px-4 py-3.5 text-sm text-stone-700">₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 text-sm"><StatusBadge status={invoice.status || 'Draft'} /></td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      title={`Delete ${documentName}`}
                      disabled={actionId === invoice.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(invoice);
                      }}
                      className="cursor-pointer border-0 bg-transparent p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-stone-100 px-4 py-3.5 text-xs text-stone-500">Showing {sortedInvoices.length}</div>
    </div>
  );
}
