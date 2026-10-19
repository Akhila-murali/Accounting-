import BillSummary from '../common/bills/BillSummary.jsx';
import PaymentSummary from '../common/bills/PaymentSummary.jsx';

const getAmounts = (item) => {
  const enteredAmount = Number(item.quantity || 0) * Number(item.price || 0);
  const taxRate = Number(item.tax || 0);
  const taxableAmount = enteredAmount;
  const taxAmount = taxableAmount * taxRate / 100;
  const cessAmount = taxableAmount * Number(item.cess || 0) / 100;

  return { taxableAmount, taxAmount, cessAmount };
};

export default function InvoiceSummary({
  items,
  discountValue,
  discountType,
  isSameState,
  onDiscountChange,
}) {
  const totals = items.reduce((total, item) => {
    const amounts = getAmounts(item);
    return {
      taxable: total.taxable + amounts.taxableAmount,
      tax: total.tax + amounts.taxAmount,
      cess: total.cess + amounts.cessAmount,
    };
  }, { taxable: 0, tax: 0, cess: 0 });

  const beforeDiscount = totals.taxable + totals.tax + totals.cess;
  const discount = discountType === 'Percentage'
    ? beforeDiscount * Number(discountValue || 0) / 100
    : Number(discountValue || 0);
  const grandTotal = Math.max(0, beforeDiscount - discount);

  return (
    <aside className="space-y-4">
      <BillSummary
        taxableAmount={totals.taxable}
        cgstAmount={isSameState ? totals.tax / 2 : 0}
        sgstAmount={isSameState ? totals.tax / 2 : 0}
        igstAmount={isSameState ? 0 : totals.tax}
        cessAmount={totals.cess}
        discountValue={discountValue}
        discountType={discountType}
        totalDiscount={discount}
        grandTotal={grandTotal}
        taxMode={isSameState ? 'split' : 'igst'}
        showCess
        onDiscountChange={(event) => onDiscountChange({
          target: {
            name: event.target.name === 'totalDiscountValue'
              ? 'discountValue'
              : 'discountType',
            value: event.target.value,
          },
        })}
      />
      <PaymentSummary totalAmount={grandTotal} />
    </aside>
  );
}
