import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import PurchaseTable from '../../components/purchase/PurchaseTable.jsx';
import { getCompanies } from '../../services/company.js';
import {
  deletePurchase,
  discardPurchaseDraft,
  getActivePurchaseDrafts,
  getPurchaseDeletePreview,
  getPurchases,
} from '../../services/purchase.js';

const getErrorMessage = (error, fallback) => {
  return error.response?.data?.message || error.message || fallback;
};

export default function PurchaseList() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);

  const draftRows = drafts.map((draft) => {
    const content = draft.content || {};
    const supplier = companies.find((company) => {
      return String(company.id) === String(content.supplierCompanyId);
    });

    return {
      ...draft,
      draftId: draft.id,
      isDraft: true,
      billNumber: content.billNumber,
      billDate: content.billDate,
      supplierCompanyName: supplier?.companyName || '',
      createdAt: draft.updatedAt,
    };
  });

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError('');

      const [purchaseResponse, draftResponse, companyResponse] =
        await Promise.all([
          getPurchases(),
          getActivePurchaseDrafts(),
          getCompanies(),
        ]);

      if (purchaseResponse?.success === false) {
        throw new Error(purchaseResponse.message);
      }

      setPurchases(
        Array.isArray(purchaseResponse?.data)
          ? purchaseResponse.data
          : []
      );
      setDrafts(
        draftResponse?.success && Array.isArray(draftResponse.data)
          ? draftResponse.data
          : []
      );
      setCompanies(
        companyResponse?.success && Array.isArray(companyResponse.data)
          ? companyResponse.data
          : []
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Unable to load purchases.')
      );
    } finally {
      setLoading(false);
    }
  };

  const prepareDelete = async (purchase) => {
    try {
      setActionId(purchase.id);
      const response = await getPurchaseDeletePreview(purchase.id);

      if (response?.success === false) {
        throw new Error(response.message);
      }

      setPendingDelete({
        ...purchase,
        previewMessage:
          response?.data?.warning ||
          `Warning: Deleting purchase ${purchase.billNumber || ''} will also remove any new products created through this purchase from the current inventory. Do you want to continue?`,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Unable to preview purchase deletion.')
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionId(pendingDelete.id);
      const response = await deletePurchase(pendingDelete.id);

      if (response?.success === false) {
        throw new Error(response.message);
      }

      setPurchases((current) =>
        current.filter((purchase) => purchase.id !== pendingDelete.id)
      );
      setPendingDelete(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete purchase.'));
    } finally {
      setActionId(null);
    }
  };

  const handleDiscardDraft = async () => {
    try {
      setActionId(`draft-${pendingDraft.draftId}`);
      const response = await discardPurchaseDraft(pendingDraft.draftId);

      if (response?.success === false) {
        throw new Error(response.message);
      }

      setDrafts((current) =>
        current.filter((draft) => draft.id !== pendingDraft.draftId)
      );
      setPendingDraft(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to discard draft.'));
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-stone-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">
            {showDrafts ? 'Purchase Draft List' : 'Purchase List'}
          </h1>
          <p className="text-sm text-stone-500 mt-1 mb-0">
            {showDrafts
              ? 'Continue or discard saved purchase drafts.'
              : 'View all purchases.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              icon={FileText}
              onClick={() => setShowDrafts((current) => !current)}
              className={showDrafts ? 'border-[#c5a059] bg-[#fbf5e7]' : ''}
            >
              Drafts
            </Button>
            {drafts.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-white">
                {drafts.length}
              </span>
            )}
          </div>

          <Button onClick={() => navigate('/purchase/new')} aria-label="Add Purchase" className="px-3 sm:px-4">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Add Purchase Bill</span>
          </Button>
        </div>
      </div>

      <PurchaseTable
        purchases={showDrafts ? draftRows : purchases}
        loading={loading}
        error={error}
        fetchPurchases={fetchPurchases}
        isDraftView={showDrafts}
        onDelete={prepareDelete}
        onDiscardDraft={setPendingDraft}
        actionId={actionId}
      />

      {pendingDelete && (
        <DeleteConfirmationModal
          title="Delete Purchase"
          message={pendingDelete.previewMessage || `Delete purchase ${pendingDelete.billNumber}?`}
          isDeleting={actionId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {pendingDraft && (
        <DeleteConfirmationModal
          title="Discard Draft"
          message={`Are you sure you want to discard draft #${pendingDraft.draftId}?`}
          confirmLabel="Discard Draft"
          isDeleting={actionId === `draft-${pendingDraft.draftId}`}
          onCancel={() => setPendingDraft(null)}
          onConfirm={handleDiscardDraft}
        />
      )}
    </div>
  );
}
