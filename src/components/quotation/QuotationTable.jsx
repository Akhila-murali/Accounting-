import { useState } from 'react';
import { AlertCircle, ChevronDown, Copy, Eye, Filter, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableEmptyState from '../common/TableEmptyState.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import Button from '../common/Button.jsx';

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getValidUntil = (dateOfIssue, validityPeriod) => {
  if (!dateOfIssue) {
    return '—';
  }

  const date = new Date(dateOfIssue);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  date.setDate(date.getDate() + Number(validityPeriod || 0));
  return formatDate(date);
};

const statusLabels = {
  0: 'Draft',
  1: 'Completed',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Expired',
  5: 'Cancelled',
};

const getStatusLabel = (status) => {
  if (status === 'Draft' || Number(status) === 0) return 'Saved';
  return statusLabels[status] || String(status ?? '—');
};

export default function QuotationTable({
  quotations = [],
  companies = [],
  loading,
  error,
  fetchQuotations,
  showSearch = true,
  showFooter = true,
  embedded = false,
  isDraftView = false,
  onDelete,
  onDuplicate,
  onDiscardDraft,
  actionId,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchText = search.toLowerCase();

  const getCompanyName = (quotation) => {
    if (quotation.isDraft && !quotation.submittedToCompanyName) {
      return '—';
    }
    if (quotation.submittedToCompanyName) {
      return quotation.submittedToCompanyName;
    }

    if (typeof quotation.submittedToCompany === 'string') {
      return quotation.submittedToCompany;
    }

    if (quotation.submittedToCompany?.companyName) {
      return quotation.submittedToCompany.companyName;
    }

    if (quotation.submittedTo?.companyName) {
      return quotation.submittedTo.companyName;
    }

    const company = companies.find((item) => {
      return String(item.id) === String(quotation.submittedToCompanyId);
    });

    return company?.companyName || '—';
  };

  const filteredQuotations = quotations.filter((quotation) => {
    const reference = quotation.proposalReference || '';
    const companyName = getCompanyName(quotation);
    const status = getStatusLabel(quotation.status);

    return (
      reference.toLowerCase().includes(searchText) ||
      companyName.toLowerCase().includes(searchText) ||
      status.toLowerCase().includes(searchText)
    );
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();
    return sortOrder === 'Newest' ? second - first : first - second;
  });

  return (
    <div
      className={embedded
        ? 'w-full overflow-hidden'
        : 'bg-white border border-stone-200/60 rounded-2xl shadow-xs max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar'
      }
    >
      {showSearch && (
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={isDraftView ? 'Search drafts...' : 'Search reference or customer...'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059]"
          />
        </div>
        <div className="relative">
          <Button variant="unstyled" type="button" onClick={() => setDropdownOpen((value) => !value)} className="flex items-center gap-2 px-3.5 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 transition-all duration-150 cursor-pointer select-none font-medium">
            <Filter size={13} className="text-stone-400" /><span>{sortOrder}</span>
            <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </Button>
          {dropdownOpen && <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[130px] 
          overflow-hidden py-1">
            {['Newest', 'Oldest'].map((option) => <Button variant="unstyled" key={option}
             type="button"
              onClick={() => { setSortOrder(option);
              setDropdownOpen(false); }} 
              className={`w-full text-left px-4 py-2 text-sm cursor-pointer border-none
               ${sortOrder === option ? 'text-[#8c6723] font-semibold bg-[#fbf5e7]' : 'text-stone-600 bg-transparent  hover:bg-stone-50'}`}>{option}</Button>)}</div>}
        </div>
      </div>
      )}

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
              <th className="w-[22%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Proposal Reference
              </th>
              <th className="w-[27%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Customer
              </th>
              <th className="w-[18%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Date
              </th>
              <th className="w-[18%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Valid Until
              </th>
              <th className="w-[15%] px-2 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider text-left">
                Status
              </th>
              {(onDelete || onDuplicate || onDiscardDraft) && <th className="w-[12%] px-2 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-stone-100 animate-pulse"
                >
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-3/4" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-2/3" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/2" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/2" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/2" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={onDelete || onDuplicate || onDiscardDraft ? 6 : 5} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="text-sm font-semibold text-stone-800 m-0">
                      Failed to load quotations
                    </p>
                    <p className="text-xs text-stone-500 m-0">{error}</p>
                    <Button variant="unstyled"
                      onClick={fetchQuotations}
                      className="mt-2 text-xs font-bold text-[#8c6723] border border-stone-200 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 cursor-pointer"
                    >
                      Try Again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : sortedQuotations.length === 0 ? (
              <tr>
                <td colSpan={onDelete || onDuplicate || onDiscardDraft ? 6 : 5} className="px-4 py-10">
                  <TableEmptyState
                    title={isDraftView ? 'No drafts found' : 'No quotations found'}
                    message={search ? `No ${isDraftView ? 'drafts' : 'quotations'} match your search.` : isDraftView ? 'Active quotation drafts will appear here.' : 'Quotations you create will appear here.'}
                  />
                </td>
              </tr>
            ) : (
              sortedQuotations.map((quotation) => (
                <tr
                  key={quotation.id || quotation.proposalReference}
                  onClick={() => {
                    if (quotation.draftId) {
                      navigate(`/quotations?draftId=${quotation.draftId}`);
                    } else if (quotation.id) {
                      navigate(`/quotations/${quotation.id}`, 
                      );
                    }
                  }}
                  className="border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25 transition-all cursor-pointer"
                >
                  <td className="px-4 py-3.5 text-stone-900 text-sm font-semibold whitespace-nowrap">
                    {quotation.proposalReference || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-stone-700 text-sm whitespace-nowrap">
                    {getCompanyName(quotation)}
                  </td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm whitespace-nowrap">
                    {formatDate(quotation.dateOfIssue)}
                  </td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm whitespace-nowrap">
                    {getValidUntil(
                      quotation.dateOfIssue,
                      quotation.validityPeriod
                    )}
                  </td>
                  <td className="px-2 py-3.5 text-left">
                    <StatusBadge
                      status={quotation.isDraft ? 'Draft' : getStatusLabel(quotation.status)}
                    />
                  </td>
                  {(onDelete || onDuplicate || onDiscardDraft) && (
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-1">
                        {quotation.isDraft && <Button variant="unstyled" type="button" title="Continue draft" onClick={(event) => { event.stopPropagation(); navigate(`/quotations?draftId=${quotation.draftId}`); }} className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-[#8c6723] cursor-pointer"><Eye size={14} /></Button>}
                        {quotation.isDraft && onDiscardDraft && <Button variant="unstyled" type="button" title="Discard draft" disabled={actionId === `draft-${quotation.draftId}`} onClick={(event) => { event.stopPropagation(); onDiscardDraft(quotation); }} className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer disabled:opacity-40"><Trash2 size={14} /></Button>}
                        {onDuplicate && <Button variant="unstyled" type="button" title="Duplicate quotation" disabled={actionId === quotation.id} onClick={(event) => { event.stopPropagation(); onDuplicate(quotation); }} className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-[#8c6723] cursor-pointer disabled:opacity-40"><Copy size={14} /></Button>}
                        {onDelete && <Button variant="unstyled" type="button" title="Delete quotation" disabled={actionId === quotation.id} onClick={(event) => { event.stopPropagation(); onDelete(quotation); }} className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer disabled:opacity-40"><Trash2 size={14} /></Button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="px-4 py-3.5 border-t border-stone-100 text-stone-500 text-xs">
          Showing {sortedQuotations.length}
        </div>
      )}
    </div>
  );
}
