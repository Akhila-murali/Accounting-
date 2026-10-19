import { FileText, Upload, X } from 'lucide-react';

import Dropdown from '../common/Dropdown.jsx';
import TermsConditionsPanel from '../common/bills/TermsConditionsPanel.jsx';

export default function InvoiceTerms({
  selectedTerms,
  onTermsChange,
  description,
  paymentType,
  paymentTypes,
  documents,
  onFieldChange,
  onDocumentsChange,
}) {

  // Add selected documents
  function addDocuments(event) {
    const selectedFiles = event.target.files;

    if (!selectedFiles) {
      return;
    }

    const newFiles = [...selectedFiles];

    onDocumentsChange((currentDocuments) => {
      return [
        ...currentDocuments,
        ...newFiles,
      ];
    });

    // Allows selecting the same file again
    event.target.value = '';
  }


  // Remove one document
  function removeDocument(indexToRemove) {
    onDocumentsChange((currentDocuments) => {
      return currentDocuments.filter((file, index) => {
        return index !== indexToRemove;
      });
    });
  }


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
            />
          </div>


          {/* Supporting Documents */}
          <div className="max-w-72">

            <label className="mb-1.5 block text-xs font-semibold text-stone-600">
              Supporting Documents

              <span className="font-normal text-stone-400">
                {' '}(Optional)
              </span>
            </label>


            {/* Upload */}
            <label className="flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50/50 px-3 text-xs text-stone-500 transition-colors hover:border-[#c5a059] hover:bg-[#fbf5e7]/40 hover:text-[#8c6723]">

              <Upload size={14} />

              <span>
                {documents.length > 0
                  ? 'Add more documents'
                  : 'Choose documents'}
              </span>

              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="sr-only"
                onChange={addDocuments}
              />

            </label>


            {/* Uploaded Files */}
            {documents.length > 0 && (
              <div className="mt-2 space-y-2">

                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600"
                  >

                    <FileText
                      size={13}
                      className="shrink-0 text-[#8c6723]"
                    />

                    <span
                      className="min-w-0 flex-1 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      aria-label={`Remove ${file.name}`}
                      className="border-0 bg-transparent p-0.5 text-stone-400 hover:text-rose-600"
                    >
                      <X size={14} />
                    </button>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      }
    />
  );
}
