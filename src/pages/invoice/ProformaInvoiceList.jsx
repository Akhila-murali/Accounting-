import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';
import InvoiceTable from '../../components/invoice/InvoiceTable.jsx';
import { getCompanies } from '../../services/company.js';
import {
  createProformaInvoiceDraft,
  deleteProformaInvoice,
  discardProformaInvoiceDraft,
  getActiveProformaInvoiceDrafts,
  getProformaInvoices,
} from '../../services/proformaInvoice.js';

export default function ProformaInvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [actionId, setActionId] = useState(null);

  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [toast, setToast] = useState(null);

  const draftRows = drafts.map((draft) => {
    const content = draft.content || {};
    const customer = companies.find((company) => (
      String(company.id) === String(content.customerCompanyId)
    ));

    return {
      ...draft,
      id: draft.draftId,
      invoiceNumber: `Draft #${draft.draftId}`,
      customerName: customer?.companyName || content.billingName || '',
      invoiceDate: content.invoiceDate,
      validUntil: '',
      totalAmount: 0,
      status: 'Draft',
    };
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invoiceResponse, draftResponse, companyResponse] = await Promise.all([
        getProformaInvoices(),
        getActiveProformaInvoiceDrafts(),
        getCompanies(),
      ]);

      if (invoiceResponse?.success === false) {
        throw new Error(invoiceResponse.message || 'Failed to retrieve proforma invoices.');
      }

      setInvoices(Array.isArray(invoiceResponse?.data) ? invoiceResponse.data : []);
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
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Error loading proforma invoices.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateDraft = async () => {
    if (isCreatingDraft) return;

    setIsCreatingDraft(true);
    setToast(null);

    try {
      const response = await createProformaInvoiceDraft();

      const draftId = response.data?.draftId;

      if (!draftId) {
        throw new Error('Draft ID was not returned by the backend.');
      }

      navigate(`/proforma-invoices/drafts/${draftId}`, {
        state: { startEditing: true },
      });
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Unable to create Proforma Invoice Draft.',
        type: 'error',
      });
    } finally {
      setIsCreatingDraft(false);
    }
  };


  const handleDelete = async () => {
    if (!pendingDelete) return;

    setActionId(pendingDelete.id);
    try {
      const response = await deleteProformaInvoice(pendingDelete.id);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete proforma invoice.');
      }

      setPendingDelete(null);
      setToast({
        message: response.message || 'Proforma invoice deleted successfully.',
        type: 'success',
      });
      fetchInvoices();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Error deleting proforma invoice.',
        type: 'error',
      });
    } finally {
      setActionId(null);
    }
  };

  const handleDiscardDraft = async () => {
    if (!pendingDraft) return;

    setActionId(pendingDraft.id);
    try {
      const response = await discardProformaInvoiceDraft(pendingDraft.id);
      if (response?.success === false) {
        throw new Error(response.message || 'Failed to discard draft.');
      }

      setDrafts((current) => (
        current.filter((draft) => draft.draftId !== pendingDraft.id)
      ));
      setPendingDraft(null);
      setToast({ message: 'Draft discarded successfully.', type: 'success' });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || 'Error discarding draft.',
        type: 'error',
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-800">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-bold text-stone-900 sm:text-2xl">
            {showDrafts ? 'Proforma Invoice Draft List' : 'Proforma Invoice List'}
          </h1>
          <p className="mb-0 mt-1 text-sm text-stone-500">
            {showDrafts ? 'Continue or discard proforma invoice drafts.' : 'View all proforma invoices.'}
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <div className="relative">
            <Button
              variant="outline"
              icon={FileText}
              onClick={() => setShowDrafts((current) => !current)}
              className={showDrafts ? 'border-[#c5a059] bg-brand-gold-light text-brand-gold' : ''}
            >
              Drafts
            </Button>
            {drafts.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-white">
                {drafts.length}
              </span>
            )}
          </div>

          <Button onClick={handleCreateDraft} disabled={isCreatingDraft} aria-label="Add Proforma Invoice" className="px-3 sm:px-4">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">{isCreatingDraft ? 'Creating...' : '+ Add Proforma Invoice'}</span>
          </Button>
        </div>
      </div>
      
      <InvoiceTable
        invoices={showDrafts ? draftRows : invoices}
        loading={loading}
        error=""
        onRetry={fetchInvoices}
        onDelete={showDrafts ? setPendingDraft : setPendingDelete}
        actionId={actionId}
        basePath={showDrafts ? '/proforma-invoices/drafts' : '/proforma-invoices'}
        documentName={showDrafts ? 'proforma invoice draft' : 'proforma invoice'}
      />

      {pendingDelete && (
        <DeleteConfirmationModal
          title="Delete Proforma Invoice"
          message={`Delete proforma invoice ${pendingDelete.invoiceNumber || ''}?`}
          isDeleting={actionId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {pendingDraft && (
        <DeleteConfirmationModal
          title="Discard Draft"
          message={`Are you sure you want to discard draft #${pendingDraft.id}?`}
          confirmLabel="Discard Draft"
          isDeleting={actionId === pendingDraft.id}
          onCancel={() => setPendingDraft(null)}
          onConfirm={handleDiscardDraft}
        />
      )}
    </div>
  );
}
