import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

import Button from '../common/Button.jsx';
import { createQuotationPdf } from '../../utils/quotationPdf.js';

export default function QuotationPreview({
  coverData,
  metadataData,
  sections,
  onClose,
}) {
  const [pdf, setPdf] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const generatedPdf = createQuotationPdf(
      coverData,
      metadataData,
      sections
    );

    const pdfBlob = generatedPdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    setPdf(generatedPdf);
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url); // cleanup the browser memory after close preview 
    };
  }, [coverData, metadataData, sections]);

  const downloadPdf = () => {
    if (!pdf) return;

    const proposalReference =
      metadataData.proposalReference?.trim() || 'quotation';

    const fileName = proposalReference.replace(
      /[^a-z0-9_-]+/gi,
      '-'
    );

    pdf.save(`${fileName}.pdf`);
  };

  return (
    <div
      className="quotation-preview-overlay fixed inset-0 z-[100] bg-black/70 p-3 md:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="PDF preview"
    >
      <div className="quotation-preview-modal w-full max-w-5xl h-[94vh] bg-[#0b1730] rounded-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="quotation-preview-toolbar px-4 py-3 flex items-center justify-between border-b border-white/10 text-white">
          <div>
            <h2 className="text-sm font-bold m-0">
              {coverData.brand || 'Product Name'}
            </h2>

            <p className="text-[10px] text-white/55 m-0 mt-1">
              {metadataData.proposalReference || 'Quotation draft'}
            </p>
          </div>

          <Button variant="unstyled"
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="border-0 bg-transparent text-white/60 hover:text-white cursor-pointer p-1"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 min-h-0 bg-stone-700 p-2 md:p-3">
          <iframe
            title="Generated quotation PDF"
            src={
              pdfUrl
                ? `${pdfUrl}#view=FitH&toolbar=1&navpanes=1`
                : undefined
            }
            className="w-full h-full border-0 bg-white"
          />
        </div>

        <div className="px-4 py-3 flex justify-end gap-2 border-t border-white/10">
          <Button
            variant="outline"
            icon={X}
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            icon={Download}
            onClick={downloadPdf}
            disabled={!pdf}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
