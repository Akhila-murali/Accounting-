import { useState } from 'react';
import { Search, Eye, Pencil, Trash2, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import TableEmptyState from '../common/TableEmptyState.jsx';
import Button from '../common/Button.jsx';

export default function TermsTable({
  terms = [],
  loading,
  error,
  fetchTerms,
  onEdit,
  onDelete,
  onView,
  selectedTerm,
  isDetailsOpen,
}) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const term = search.toLowerCase();

  const filteredTerms = terms.filter((t) =>
    t.title?.toLowerCase().includes(term)
  );

  const sortedTerms = [...filteredTerms].sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();
    return sortOrder === 'Newest' ? second - first : first - second;
  });

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="w-full max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar rounded-2xl border border-stone-200/60 bg-white shadow-xs"
    >
      {/* Toolbar: Search Box */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] transition-all duration-150"
          />
        </div>
        <div className="relative">
          <Button variant="unstyled" type="button" onClick={() => setDropdownOpen((value) => !value)} className="flex items-center gap-2 px-3.5 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 transition-all duration-150 cursor-pointer select-none font-medium">
            <Filter size={13} className="text-stone-400" /><span>{sortOrder}</span>
            <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </Button>
          {dropdownOpen && <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[130px] overflow-hidden py-1">{['Newest', 'Oldest'].map((option) => <Button variant="unstyled" key={option} type="button" onClick={() => { setSortOrder(option); setDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm cursor-pointer border-none ${sortOrder === option ? 'text-[#8c6723] font-semibold bg-[#fbf5e7]' : 'text-stone-600 bg-transparent hover:bg-stone-50'}`}>{option}</Button>)}</div>}
        </div>
      </div>

      {/* Terms Table List */}
      <div
        className="overflow-x-auto pb-2"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth <= container.clientWidth) return;

          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[620px] lg:w-[calc(100%-2rem)] lg:mx-auto text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="w-[45%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Title
              </th>

              <th className="w-[35%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Created At
              </th>

              <th className="w-[20%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-100 last:border-b-0 animate-pulse"
                >
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-3/4"></div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-1/2"></div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-1/3 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle className="text-rose-500" size={24} />

                    <p className="text-sm font-semibold text-stone-800 m-0">
                      Failed to load terms
                    </p>

                    <p className="text-xs text-stone-500 m-0">
                      {error}
                    </p>

                    {fetchTerms && (
                      <Button variant="unstyled"
                        onClick={fetchTerms}
                        className="mt-2 text-xs font-bold text-[#8c6723] hover:text-[#72521a] border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all cursor-pointer bg-white"
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedTerms.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10"
                >
                  <TableEmptyState
                    title="No terms found"
                    message={search ? 'No terms match your search.' : 'Terms and conditions you add will appear here.'}
                  />
                </td>
              </tr>
            ) : (
              sortedTerms.map((item) => {
                const isSelected =
                  selectedTerm?.id === item.id && isDetailsOpen;

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25 transition-all ${
                      isSelected
                        ? 'bg-[#fbf5e7]/40 border-l-4 border-l-[#8c6723]'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-stone-900 text-sm font-semibold whitespace-nowrap">
                      {item.title || '—'}
                    </td>

                    <td className="px-4 py-3.5 text-stone-500 text-sm whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="px-4 py-3.5 text-left whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1.5">
                        <Button variant="unstyled"
                          type="button"
                          onClick={() => onView && onView(item)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-[#8c6723] hover:shadow-xs"
                          title="View"
                          aria-label="View term"
                        >
                          <Eye size={15} strokeWidth={1.8} />
                        </Button>
                        <Button variant="unstyled"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(item);
                          }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-xs"
                          title="Edit"
                          aria-label="Edit term"
                        >
                          <Pencil size={14} strokeWidth={1.8} />
                        </Button>

                        <Button variant="unstyled"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete(item);
                          }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                          aria-label="Delete term"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="px-4 py-3.5 border-t border-stone-100 text-stone-500 text-xs bg-stone-50/10">
        <span>Showing {sortedTerms.length} entries</span>
      </div>
    </div>
  );
}
