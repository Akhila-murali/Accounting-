import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function InvoiceAttachments({
  documents,
  onAdd,
  onDownload,
  onDelete,
  isBusy,
}) {
  const documentsScrollRef = useRef(null);

  useEffect(() => {
    const container = documentsScrollRef.current;
    if (!container) return undefined;

    const handleWheel = (event) => {
      if (container.scrollWidth <= container.clientWidth) return;

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft += event.deltaX || event.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, [documents.length]);

  const addDocuments = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) onAdd(files);
    event.target.value = '';
  };

  return (
    <div className="min-w-0 w-full">
      <label className="mb-1.5 block text-xs font-semibold text-stone-600">
        Supporting Documents <span className="font-normal text-stone-400">(Optional)</span>
      </label>

      <label className="flex h-[42px] w-full max-w-72 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50/50 px-3 text-xs text-stone-500 transition-colors hover:border-[#c5a059] hover:bg-[#fbf5e7]/40 hover:text-[#8c6723]">
        <Upload size={14} />
        <span>{isBusy ? 'Please wait...' : documents.length > 0 ? 'Add more documents' : 'Choose documents'}</span>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={addDocuments}
          disabled={isBusy}
        />
      </label>

      {documents.length > 0 && (
        <div
          ref={documentsScrollRef}
          className="mt-2 flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-1"
        >
          {documents.map((file, index) => {
            const attachmentId = file.id ?? file.attachmentId;
            const fileName = file.originalFileName ?? file.fileName ?? file.name ?? 'Attachment';

            return (
              <div key={attachmentId ?? `${fileName}-${index}`} className="flex w-52 max-w-[75vw] shrink-0 items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                <FileText size={13} className="shrink-0 text-[#8c6723]" />
                <span className="min-w-0 flex-1 truncate" title={fileName}>{fileName}</span>
                <button type="button" onClick={() => onDownload(file)} disabled={isBusy} aria-label={`Download ${fileName}`} className="border-0 bg-transparent p-0.5 text-stone-400 hover:text-[#8c6723] disabled:opacity-40">
                  <Download size={14} />
                </button>
                <button type="button" onClick={() => onDelete(file)} disabled={isBusy} aria-label={`Remove ${fileName}`} className="border-0 bg-transparent p-0.5 text-stone-400 hover:text-rose-600 disabled:opacity-40">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
