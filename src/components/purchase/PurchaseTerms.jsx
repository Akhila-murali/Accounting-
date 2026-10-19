import { Trash2, Upload, X } from 'lucide-react';

import Dropdown from '../common/Dropdown.jsx';
import TermsConditionsPanel from '../common/bills/TermsConditionsPanel.jsx';

export default function PurchaseTerms({
  selectedTerms,
  paymentType,
  paymentTypes,
  onTermsChange,
  onPaymentTypeChange,
  attachments = [],
  billFiles = [],
  onBillFilesChange,
  onDeleteAttachment,
  validationMessage,
}) {
  const handleBillFiles = (event) => {
    const newFiles = Array.from(event.target.files || []);
    onBillFilesChange([...billFiles, ...newFiles]);
    event.target.value = '';
  };

  const removeBillFile = (indexToRemove) => {
    onBillFilesChange(
      billFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <TermsConditionsPanel
      selectedTerms={selectedTerms}
      onTermsChange={onTermsChange}
      splitExtraFields
      validationMessage={
        validationMessage?.toLowerCase().includes('terms & conditions')
          ? validationMessage
          : ''
      }
      extraFields={(
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-600">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              name="paymentType"
              value={paymentType}
              onChange={onPaymentTypeChange}
              options={paymentTypes}
              placeholder="Select payment type"
            />
            {validationMessage?.toLowerCase().includes('payment type') && (
              <p className="mb-0 mt-1 text-[11px] text-red-500">{validationMessage}</p>
            )}
          </div>

          <div className="max-w-72">
            <label className="mb-1.5 block text-xs font-semibold text-stone-600">
              Upload Bill
            </label>
            <label className="flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50/50 px-3 text-xs text-stone-500 transition-colors hover:border-[#c5a059] hover:text-[#8c6723]">
              <Upload size={14} />
              <span className="truncate">
                {billFiles.length > 0
                  ? `${billFiles.length} file${billFiles.length > 1 ? 's' : ''} selected`
                  : 'Choose bill files'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                className="sr-only"
                onChange={handleBillFiles}
              />
            </label>

            {billFiles.length > 0 && (
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                {billFiles.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}-${index}`} className="flex max-w-40 shrink-0 items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    <span className="truncate whitespace-nowrap" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBillFile(index)}
                      title="Remove file"
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 border-0 bg-transparent p-0.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    <span className="min-w-0 flex-1 truncate">{file.originalFileName}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteAttachment(file)}
                      title="Remove attachment"
                      className="border-0 bg-transparent p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
