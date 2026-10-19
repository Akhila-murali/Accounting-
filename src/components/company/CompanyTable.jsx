import { useState } from 'react';
import { Search, Filter, ChevronDown, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import TableEmptyState from '../common/TableEmptyState.jsx';

const formatVal = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'string' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return null;
  }
  return trimmed;
};

export default function CompanyTable({
  companies = [],
  loading,
  error,
  fetchCompanies,
  selectedCompany,
  isDetailsOpen,
  handleOpenView,
  handleOpenEdit,
  handleOpenDelete,
}) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Live search filtering
  const term = search.toLowerCase();
  const filteredCompanies = companies.filter((c) =>
    c.companyName?.toLowerCase().includes(term) ||
    c.city?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.gstNo?.toLowerCase().includes(term)
  );

  // Sort by creation date.
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();
    return sortOrder === 'Newest' ? second - first : first - second;
  });

  return (
    <div
      className="w-full max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar rounded-2xl border border-stone-200/60 bg-white shadow-xs"
    >
      {/* Toolbar: Search Box & Filter */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] transition-all duration-150"
          />
        </div>

        {/* Sort Filter Dropdown (Newest / Oldest) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 transition-all duration-150 cursor-pointer select-none font-medium"
          >
            <Filter size={13} className="text-stone-400" />
            <span>{sortOrder}</span>
            <ChevronDown
              size={13}
              className={`text-stone-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[130px] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
              {['Newest', 'Oldest'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSortOrder(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer border-none bg-transparent ${
                    sortOrder === opt
                      ? 'text-[#8c6723] font-semibold bg-[#fbf5e7]'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto pb-2"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth <= container.clientWidth) return;

          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="w-[38%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Company Name
              </th>
              <th className="w-[34%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Email
              </th>
              <th className="w-[28%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Phone
              </th>
              <th className="px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-3/4"></div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-2/3"></div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-1/2"></div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-stone-100 rounded-md w-1/2"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="text-sm font-semibold text-stone-800 m-0">Failed to load companies</p>
                    <p className="text-xs text-stone-500 m-0">{error}</p>
                    <button
                      onClick={fetchCompanies}
                      className="mt-2 text-xs font-bold text-[#8c6723] hover:text-[#72521a] bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all cursor-pointer bg-white"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : sortedCompanies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10">
                  <TableEmptyState
                    title="No companies found"
                    message={search ? 'No companies match your search.' : 'Companies you add will appear here.'}
                  />
                </td>
              </tr>
            ) : (
              sortedCompanies.map((company) => {
                const isSelected = selectedCompany?.id === company.id && isDetailsOpen;
                const formattedName = formatVal(company.companyName) || '—';
                const formattedEmail = formatVal(company.email);
                const formattedPhone = formatVal(company.phoneNumber);

                return (
                  <tr
                    key={company.id}
                    className={`border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25 transition-all ${
                      isSelected ? 'bg-[#fbf5e7]/40 border-l-4 border-l-[#8c6723]' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-stone-900 text-sm font-semibold whitespace-nowrap">
                      {formattedName}
                    </td>
                    <td className="px-4 py-3.5 text-stone-500 text-sm whitespace-nowrap">
                      {formattedEmail || <span className="text-stone-300 italic text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-stone-600 text-sm whitespace-nowrap">
                      {formattedPhone || <span className="text-stone-300 italic text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" title="View company" aria-label="View company" onClick={() => handleOpenView(company)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-[#8c6723] hover:shadow-xs">
                          <Eye size={15} strokeWidth={1.8} />
                        </button>
                        <button type="button" title="Edit company" aria-label="Edit company" onClick={() => handleOpenEdit(company)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-xs">
                          <Pencil size={14} strokeWidth={1.8} />
                        </button>
                        <button type="button" title="Delete company" aria-label="Delete company" onClick={() => handleOpenDelete(company)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
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
        <span>Showing {sortedCompanies.length} entries</span>
      </div>

      {/* Dropdown backdrop */}
      {/* {dropdownOpen && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setDropdownOpen(false)}
        />
      )} */}
    </div>
  );
}
