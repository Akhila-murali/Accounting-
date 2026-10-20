import Dropdown from '../common/Dropdown.jsx';
import TermsConditionsPanel from '../common/bills/TermsConditionsPanel.jsx';
import InvoiceAttachments from './InvoiceAttachments.jsx';

export default function InvoiceTerms({
  selectedTerms,
  onTermsChange,
  description,
  paymentType,
  paymentTypes,
  documents,
  onFieldChange,
  onDocumentsAdd,
  onDocumentDownload,
  onDocumentDelete,
  isDocumentBusy,
  showDocuments = true,
}) {
  return (
    <TermsConditionsPanel
      selectedTerms={selectedTerms}
      onTermsChange={onTermsChange}
      splitExtraFields

      extraFields={
        <div className="space-y-4">

          {/* Description */}
          <label className="block text-xs font-semibold text-stone-600">
            Description

            <span className="font-normal text-stone-400">
              {' '}(Optional)
            </span>

            <textarea
              name="description"
              value={description}
              onChange={onFieldChange}
              rows="3"
              placeholder="Add notes or a brief description"
              className="mt-1.5 w-full resize-none rounded-lg border border-stone-200 bg-white p-3 text-xs leading-5 outline-none focus:border-[#c5a059]"
            />
          </label>


          {/* Payment Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-600">
              Payment Type
            </label>

            <Dropdown
              name="paymentType"
              value={paymentType}
              options={paymentTypes}
              onChange={onFieldChange}
              placeholder="Select payment type"
              emptyMessage="No payment types available"
              menuPlacement="top"
            />
          </div>


          {showDocuments && (
            <InvoiceAttachments
              documents={documents}
              onAdd={onDocumentsAdd}
              onDownload={onDocumentDownload}
              onDelete={onDocumentDelete}
              isBusy={isDocumentBusy}
            />
          )}

        </div>
      }
    />
  );
}
