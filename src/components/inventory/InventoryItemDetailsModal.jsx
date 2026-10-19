import { useState } from 'react';
import { FileText, Hash, Package, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function InventoryItemDetailsModal({ item, record, loading, error, onClose }) {
  const [page, setPage] = useState(0);
  const serials = item?.serialNumbers || [];
  const visibleSerials = serials.slice(page * 5, page * 5 + 5);
  const hasNext = (page + 1) * 5 < serials.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 font-sans" onClick={onClose}>
      <section className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between border-b border-stone-100 bg-gradient-to-r from-[#fffaf0] to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fbf5e7] text-[#8c6723]"><Package size={21} /></span>
            <div>
              <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-stone-400">Inventory Item</p>
              <h2 className="m-0 text-xl font-bold text-stone-900">{item?.itemName || 'Item Details'}</h2>
              <p className="m-0 mt-1 text-xs text-stone-500">{record?.billNumber} · {record?.supplier}</p>
            </div>
          </div>
          <Button variant="unstyled" onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700"><X size={19} /></Button>
        </header>

        <div className="overflow-y-auto p-5">
          {loading ? <LoadingSpinner className="py-12" /> : error ? <Message text={error} error /> : item && (
            <div className="space-y-4">
              <section className="overflow-hidden rounded-xl border border-stone-200">
                <SectionTitle icon={FileText} title="Item Details" text="Stock & Pricing Information" />
                <div className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                  <div>
                    <Detail label="HSN/SAC" value={item.hsnsac} />
                    <Detail label="Quantity" value={item.quantity} />
                    <Detail label="Purchase Price" value={money(item.pricePerUnit)} />
                    <Detail label="Discount" value={item.discountType === 'Percentage' ? `${item.discountValue || 0}%` : money(item.discountValue)} />
                    <div className="my-2 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 text-stone-900"><b className="text-xs">Total Amount</b><b className="text-lg">{money(item.totalAmount)}</b></div>
                  </div>
                  <div className="sm:border-l sm:border-stone-100 sm:pl-4">
                    <Detail label="Unit" value={item.unit} />
                    <Detail label="GST" value={item.gstPercentage != null ? `${item.gstPercentage}%` : null} />
                    <Detail label="Selling Price" value={money(item.sellingPricePerUnit)} />
                    <Detail label="Taxable Value" value={money(item.taxableValue)} />
                  </div>
                </div>

                <div className="border-t border-stone-100 px-5 py-4">
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-stone-400">Description</p>
                  <p className="m-0 mt-2 min-h-5 whitespace-pre-wrap break-words text-xs leading-5 text-stone-700">
                    {item.description || 'Empty'}
                  </p>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-stone-200">
                <SectionTitle icon={Hash} title="Serial Numbers" text={`${serials.length} total`} />
                <div className="px-4 py-2">
                  {visibleSerials.length ? visibleSerials.map((serial, index) => (
                    <div key={`${serial}-${index}`} className="flex border-b border-stone-100 px-1 py-2 last:border-0">
                      <span className="w-9 text-[10px] text-stone-400">{page * 5 + index + 1}</span>
                      <span className="text-xs font-semibold text-stone-800">{serial}</span>
                    </div>
                  )) : <p className="m-0 py-5 text-center text-xs text-stone-400">No serial numbers added.</p>}

                  {serials.length > 5 && (
                    <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                      <PageButton label="Previous" hidden={page === 0} onClick={() => setPage(page - 1)} />
                      <span className="text-[10px] text-stone-400">Showing {page * 5 + 1}–{page * 5 + visibleSerials.length}</span>
                      <PageButton label="Next" hidden={!hasNext} onClick={() => setPage(page + 1)} />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        <footer className="flex justify-end border-t border-stone-100 px-5 py-3"><Button onClick={onClose}>Close</Button></footer>
      </section>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, text }) {
  return <div className="flex items-center justify-between border-b border-stone-100 bg-[#faf7f1] px-4 py-3"><div className="flex items-center gap-2"><Icon size={15} className="text-[#8c6723]" /><h3 className="m-0 text-sm font-bold text-stone-800">{title}</h3></div><span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">{text}</span></div>;
}

function Detail({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-1 py-2.5"><span className="text-xs text-stone-500">{label}</span><b className="text-xs text-stone-800">{value || '—'}</b></div>;
}

function PageButton({ label, hidden, onClick }) {
  return <button type="button" onClick={onClick} className={`border-0 bg-transparent p-0 text-[10px] font-semibold text-[#8c6723] ${hidden ? 'invisible' : ''}`}>{label}</button>;
}

function Message({ text, error }) {
  return <p className={`m-0 py-12 text-center text-sm ${error ? 'text-rose-600' : 'text-stone-500'}`}>{text}</p>;
}
