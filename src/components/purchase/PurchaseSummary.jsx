import BillSummary from '../common/bills/BillSummary.jsx';
import PaymentSummary from '../common/bills/PaymentSummary.jsx';

const calculateItem = (item, gstSlabs) => {
  const grossAmount =
    Number(item.quantity) * Number(item.pricePerUnit);
  const discountAmount =
    item.discountType === 'Percentage'
      ? grossAmount * Number(item.discountValue || 0) / 100
      : Number(item.discountValue || 0);
  const taxableAmount = Math.max(0, grossAmount - discountAmount);
  const gstSlab = gstSlabs.find(
    (slab) => String(slab.id) === String(item.gstSlabId)
  );
  const gstAmount =
    taxableAmount * Number(gstSlab?.percentage || 0) / 100; 

  return { taxableAmount, discountAmount, gstAmount };
};

export default function PurchaseSummary({
  items,
  gstSlabs,
  isSameState,
  totalDiscountValue,
  totalDiscountType,
  savedPurchase,
  onDiscountChange,
}) {
  const calculatedItems = items.map((item) =>
    calculateItem(item, gstSlabs)
  );
  const taxableAmount = calculatedItems.reduce(
    (sum, item) => sum + item.taxableAmount,
    0
  );
  const itemDiscount = calculatedItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );
  const gstAmount = calculatedItems.reduce(
    (sum, item) => sum + item.gstAmount,
    0
  );
  const billDiscount =
    totalDiscountType === 'Percentage'
      ? (taxableAmount + gstAmount) *
        Number(totalDiscountValue || 0) /
        100
      : Number(totalDiscountValue || 0);
  const grandTotal = Math.max(
    0,
    taxableAmount + gstAmount - billDiscount
  );
  const displayTaxable =
    savedPurchase?.subtotalAmount ?? taxableAmount;
  const displayDiscount =
    savedPurchase?.totalDiscountAmount ??
    itemDiscount + billDiscount;
  const displayCgst =
    savedPurchase?.totalCGST ??
    (isSameState ? gstAmount / 2 : 0);
  const displaySgst =
    savedPurchase?.totalSGST ??
    (isSameState ? gstAmount / 2 : 0);
  const displayIgst =
    savedPurchase?.totalIGST ??
    (isSameState ? 0 : gstAmount);
  const displayTotal = savedPurchase?.totalAmount ?? grandTotal;

  return (
    <aside className="space-y-4 xl:sticky xl:top-0">
      <BillSummary
        taxableAmount={displayTaxable}
        cgstAmount={displayCgst}
        sgstAmount={displaySgst}
        igstAmount={displayIgst}
        discountValue={totalDiscountValue}
        discountType={totalDiscountType}
        totalDiscount={displayDiscount}
        grandTotal={displayTotal}
        onDiscountChange={onDiscountChange}
        taxMode={isSameState ? 'split' : 'igst'}
      />

      <PaymentSummary totalAmount={displayTotal} />

    </aside>
  );
}
