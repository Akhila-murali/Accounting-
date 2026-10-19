import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import InvoiceTable from '../../components/invoice/InvoiceTable.jsx';

const sampleInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0001',
    customerName: 'Stride Innovations Private Limited',
    invoiceDate: '2026-09-15',
    validUntil: '2026-10-15',
    totalAmount: 2360000,
    status: 'Pending',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0002',
    customerName: 'Acme Industrial Solutions',
    invoiceDate: '2026-09-12',
    validUntil: '2026-10-12',
    totalAmount: 485000,
    status: 'Completed',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-0003',
    customerName: 'Nova Engineering Works',
    invoiceDate: '2026-09-10',
    validUntil: '2026-10-10',
    totalAmount: 172500,
    status: 'Draft',
  },
];

export default function SalesInvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(sampleInvoices);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionId, setActionId] = useState(null);

  const handleDelete = () => {
    if (!pendingDelete) return;
    setActionId(pendingDelete.id);
    setInvoices((current) => current.filter((invoice) => invoice.id !== pendingDelete.id));
    setActionId(null);
    setPendingDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 text-stone-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">Sales Invoice List</h1>
          <p className="mb-0 mt-1 text-sm text-stone-500">View all sales invoices.</p>
        </div>

        <Button onClick={() => navigate('/sales-invoices/new')} aria-label="Add Sales Invoice" className="px-3 sm:px-4">
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+ Add Sales Invoice</span>
        </Button>
      </div>

      <InvoiceTable
        invoices={invoices}
        loading={false}
        error=""
        onRetry={() => {}}
        onDelete={setPendingDelete}
        actionId={actionId}
        basePath="/sales-invoices"
        numberHeading="Invoice Number"
        documentName="sales invoice"
      />

      {pendingDelete && (
        <DeleteConfirmationModal
          title="Delete Sales Invoice"
          message={`Delete sales invoice ${pendingDelete.invoiceNumber || ''}?`}
          isDeleting={actionId === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
