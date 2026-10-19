import { Coins } from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('en-IN');

export default function BillSummary({
  taxableAmount,
  cgstAmount = 0,
  sgstAmount = 0,
  igstAmount = 0,
  cessAmount = 0,
  discountValue,
  discountType,
  totalDiscount,
  grandTotal,
  onDiscountChange,
  taxMode = 'igst',
  showCess = false,
}) {
  return (
    <section className="h-full rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Coins size={16} className="text-[#8c6723]" />
        <h2 className="m-0 text-sm font-bold text-stone-900">Bill Summary</h2>
      </div>

      <div className="space-y-2 text-xs text-stone-500">
        <SummaryRow label="Taxable Amount" value={taxableAmount} />
        {taxMode === 'split' ? (
          <>
            <SummaryRow label="CGST" value={cgstAmount} />
            <SummaryRow label="SGST" value={sgstAmount} />
          </>
        ) : (
          <SummaryRow label="IGST" value={igstAmount} />
        )}
        {showCess && <SummaryRow label="Cess" value={cessAmount} />}

        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <span>Bill Discount</span>
          <div className="flex h-[42px] w-28 overflow-hidden rounded-md border border-stone-200 bg-white focus-within:border-[#c5a059]">
            <input
              type="number"
              min="0"
              name="totalDiscountValue"
              value={discountValue}
              onChange={onDiscountChange}
              className="min-w-0 flex-1 border-0 bg-transparent px-2 text-right text-xs outline-none"
            />
            <select
              name="totalDiscountType"
              value={discountType}
              onChange={onDiscountChange}
              className="w-11 border-0 border-l border-stone-200 bg-stone-50 px-1 text-xs text-stone-600 outline-none cursor-pointer"
            >
              <option value="Amount">₹</option>
              <option value="Percentage">%</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Total Discount</span>
          <b className="text-green-600">- ₹{money(totalDiscount)}</b>
        </div>

        <div className="-mx-2 mt-1 flex items-center justify-between rounded-lg bg-[#fbf5e7] px-3 py-3 text-sm">
          <b className="text-stone-900">Grand Total</b>
          <b className="text-base text-[#8c6723]">₹{money(grandTotal)}</b>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <b className="text-stone-700">₹{money(value)}</b>
    </div>
  );
}
