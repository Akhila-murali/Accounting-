import { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard.jsx';
import QuotationTable from '../quotation/QuotationTable.jsx';
import { getActiveDrafts, getQuotations } from '../../services/quotation.js';
import { getCompanies } from '../../services/company.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(true);
  const [quotationError, setQuotationError] = useState('');
  const [quotationCount, setQuotationCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  const fetchRecentQuotations = async () => {
    try {
      setQuotationLoading(true);
      setQuotationError('');

      const [quotationResponse, draftResponse, companyResponse] = await Promise.all([
        getQuotations(),
        getActiveDrafts(),
        getCompanies(),
      ]);

      if (quotationResponse?.success === false) {
        throw new Error(quotationResponse.message);
      }

      const quotationData = quotationResponse?.data || quotationResponse;
      const quotationList = Array.isArray(quotationData)
        ? quotationData
        : [];

      setQuotationCount(quotationList.length);

      const draftData = draftResponse?.data || draftResponse;
      const draftList = Array.isArray(draftData) ? draftData : [];
      setDraftCount(draftList.length);

      const newestFive = [...quotationList]
        .sort((first, second) => {
          return Number(second.id || 0) - Number(first.id || 0);
        })
        .slice(0, 5);

      setRecentQuotations(newestFive);

      if (companyResponse?.success) {
        setCompanies(companyResponse.data || []);
      }
    } catch (error) {
      setQuotationError(
        error.response?.data?.message ||
        error.message ||
        'Unable to load recent quotations.'
      );
    } finally {
      setQuotationLoading(false);
    }
  };

  useEffect(() => {
    // Load recent quotations once when the dashboard opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecentQuotations();
  }, []);

  const stats = [
    {
      id: 1,
      label: 'Total Quotations',
      value: quotationCount,
      subtext: 'All quotations created',
      icon: <FileText size={18} />
    },
    {
      id: 2,
      label: 'Sent Quotations',
      value: 0,
      subtext: 'Quotations sent to customers',
      icon: <Send size={18} />
    },
    {
      id: 3,
      label: 'Total Drafts',
      value: draftCount,
      subtext: 'Active quotation drafts',
      icon: <FileText size={18} />
    },
    {
      id: 4,
      label: 'Accepted Quotations',
      value: 0,
      subtext: 'Quotations accepted',
      icon: <CheckCircle size={18} />
    }
  ];

  return (
    <div className="flex flex-col gap-8 text-stone-800">
      {/* Welcome Heading Banner */}
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-5 shadow-xs sm:px-7 sm:py-6"
        style={{ backgroundImage: 'var(--gradient-surface-gold)' }}
      >
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[28px] border-brand-gold-highlight/10" />
        <div className="absolute right-24 top-7 h-3 w-3 rounded-full bg-brand-gold-highlight/25" />

        <div className="relative">
          <p className="m-0 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">
            Workspace overview
          </p>
          <h1 className="m-0 mt-1.5 text-2xl font-bold text-stone-900">
            Welcome back, <span className="text-brand-gold">Admin!</span>
          </h1>
          <p className="m-0 mt-1.5 text-sm text-stone-500">Here's an overview of your quotations.</p>
        </div>
      </div>

      {/* Summary Statistics Cards — inline horizontal scrolling on mobile/tablet, grid on desktop */}
      <div className="relative">
        {/* Left Scroll Arrow (Mobile/Tablet only) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((card) => (
            <StatCard
              key={card.id}
              label={card.label}
              value={card.value}
              subtext={card.subtext}
              icon={card.icon}
              compact
            />
          ))}
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-xs w-full">
          <div className="flex items-center justify-between mb-5 gap-4">
            <h3 className="text-stone-900 text-lg font-bold m-0">
              Recent Quotations
            </h3>

            <button
              type="button"
              onClick={() => navigate('/quotation-list')}
              className="border-0 bg-transparent text-xs font-bold text-[#8c6723] hover:text-[#72521a] cursor-pointer"
            >
              View All
            </button>
          </div>

          <QuotationTable
            quotations={recentQuotations}
            companies={companies}
            loading={quotationLoading}
            error={quotationError}
            fetchQuotations={fetchRecentQuotations}
            showSearch={false}
            showFooter={false}
            embedded
          />
      </div>
    </div>
  );
}
