import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import QuotationTable from '../../components/quotation/QuotationTable.jsx';
import { getCompanies } from '../../services/company.js';
import {
  deleteQuotation,
  discardDraft,
  duplicateQuotation,
  getActiveDrafts,
  getQuotations,
} from '../../services/quotation.js';

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export default function QuotationList() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [activeDrafts, setActiveDrafts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [showDrafts, setShowDrafts] = useState(false);

  const draftRows = activeDrafts.map((draft) => {
    const content = draft.content || {};
    const customer = companies.find((company) => {
      return String(company.id) ===
        String(content.submittedToCompanyId);
    });

    return {
      ...draft,
      isDraft: true,
      proposalReference:
        content.proposalReference || `Draft #${draft.draftId}`,
      submittedToCompanyName: customer?.companyName || '',
      dateOfIssue: content.dateOfIssue,
      validityPeriod: content.validityPeriod,
      createdAt: draft.updatedAt,
    };
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError('');

      const [quotationResponse, draftResponse, companyResponse] =
        await Promise.all([
          getQuotations(),
          getActiveDrafts(),
          getCompanies(),
        ]);

      if (quotationResponse?.success === false) {
        throw new Error(quotationResponse.message);
      }

      const quotationData = quotationResponse?.data || quotationResponse;
      const quotationList = Array.isArray(quotationData) // check is this array or not 
        ? quotationData
        : [];

      const companyData =
        companyResponse?.data || companyResponse;

      setQuotations(quotationList);
      setCompanies(Array.isArray(companyData) ? companyData : []);
      setActiveDrafts(
        draftResponse?.success && Array.isArray(draftResponse.data)
          ? draftResponse.data
          : []
      );
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        'Unable to load quotations.'
      );

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardDraft = async (draft) => {
    try {
      setActionId(`draft-${draft.draftId}`);
      const response = await discardDraft(draft.draftId);

      if (response?.success === false) {
        throw new Error(response.message || 'Unable to discard draft.');
      }

      setActiveDrafts((current) => (
        current.filter((item) => item.draftId !== draft.draftId)
      ));
      setPendingDraft(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to discard draft.'));
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (quotation) => {
    try {
      setActionId(quotation.id);

      const response = await deleteQuotation(quotation.id);

      if (response?.success === false) {
        throw new Error(
          response.message || 'Unable to delete quotation.'
        );
      }

      setQuotations((current) => {
        return current.filter((item) => item.id !== quotation.id);
      });

      setPendingDelete(null);
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        'Unable to delete quotation.'
      );

      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const handleDuplicate = async (quotation) => {
    try {
      setActionId(quotation.id);

      const response = await duplicateQuotation(quotation.id);

      if (response?.success === false) {
        throw new Error(
          response.message || 'Unable to duplicate quotation.'
        );
      }

      await fetchQuotations();
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        'Unable to duplicate quotation.'
      );

      setError(message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">
            {showDrafts ? 'Quotation Draft List' : 'Quotation List'}
          </h1>
          <p className="text-sm text-stone-500 mt-1 mb-0">
            {showDrafts ? 'Continue or discard quotation drafts.' : 'View all quotations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              icon={FileText}
              onClick={() => setShowDrafts((current) => !current)}
              className={showDrafts ? 'border-[#c5a059] bg-brand-gold-light text-brand-gold' : ''}
            >
              Drafts
            </Button>
            {activeDrafts.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-white">
                {activeDrafts.length}
              </span>
            )}
          </div>
          <Button onClick={() => navigate('/quotations')} aria-label="Add Quotation" className="px-3 sm:px-4">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Add Quotation</span>
          </Button>
        </div>
      </div>

      <QuotationTable
        quotations={showDrafts ? draftRows : quotations}
        companies={companies}
        loading={loading}
        error={error}
        fetchQuotations={fetchQuotations}
        onDelete={showDrafts ? undefined : setPendingDelete}
        onDuplicate={showDrafts ? undefined : handleDuplicate}
        onDiscardDraft={showDrafts ? setPendingDraft : undefined}
        isDraftView={showDrafts}
        actionId={actionId}
      />

      {pendingDelete && (
        <DeleteConfirmationModal
          title="Delete Quotation"
          message={<>Are you sure you want to delete <span className="font-semibold text-stone-800">{pendingDelete.proposalReference || `quotation ${pendingDelete.id}`}</span>?</>}
          isDeleting={actionId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => handleDelete(pendingDelete)}
        />
      )}

      {pendingDraft && (
        <DeleteConfirmationModal
          title="Discard Draft"
          message={<>Are you sure you want to discard draft <span className="font-semibold text-stone-800">#{pendingDraft.draftId}</span>?</>}
          confirmLabel="Discard Draft"
          isDeleting={actionId === `draft-${pendingDraft.draftId}`}
          onCancel={() => setPendingDraft(null)}
          onConfirm={() => handleDiscardDraft(pendingDraft)}
        />
      )}
    </div>
  );
}
