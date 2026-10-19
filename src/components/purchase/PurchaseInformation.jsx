import { FileText } from 'lucide-react';

import Dropdown from '../common/Dropdown.jsx';

const inputClass =
  'mt-1.5 h-[42px] w-full rounded-lg border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none focus:border-[#c5a059]';

export default function PurchaseInformation({
  formData,
  suppliers,
  paymentTerms,
  onChange,
  validationMessage,
}) {
  const errorFor = (field) => {
    const message = validationMessage?.toLowerCase() || '';
    return message.includes(field) ? validationMessage : '';
  };
  const fieldError = 'mt-1 text-[11px] font-normal text-red-500';
  const selectedPaymentTerm = paymentTerms.find(
    (item) => String(item.value) === String(formData.paymentTerms)
  );
  const isCustomPaymentTerm = `${selectedPaymentTerm?.value || ''} ${selectedPaymentTerm?.label || ''}`
    .toLowerCase()
    .includes('custom');
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#8c6723]" />
          <h2 className="m-0 text-sm font-bold text-stone-900">
            Purchase Information
          </h2>
        </div>
        <div className="text-xs text-stone-500">
          GSTIN:{' '}
          <span className="font-semibold text-stone-700">
            {formData.gstNo || 'Not available'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-stone-600">
          Supplier <span className="text-red-500">*</span>
          <div className="mt-1.5">
            <Dropdown
              name="supplierCompanyId"
              value={formData.supplierCompanyId}
              onChange={onChange}
              options={suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.companyName,
              }))}
              placeholder="Select supplier"
            />
          </div>
          {errorFor('supplier') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Phone Number <span className="text-red-500">*</span>
          <input
            name="phoneNo"
            value={formData.phoneNo}
            readOnly
            className={`${inputClass} cursor-default bg-stone-50`}
          />
          {errorFor('phone number') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          PO Number <span className="text-red-500">*</span>
          <input
            name="poNo"
            value={formData.poNo}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('po number') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          PO Date <span className="text-red-500">*</span>
          <input
            type="date"
            name="poDate"
            value={formData.poDate}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('po date') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          PI Number <span className="text-red-500">*</span>
          <input
            name="piNo"
            value={formData.piNo}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('pi number') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          PI Date <span className="text-red-500">*</span>
          <input
            type="date"
            name="piDate"
            value={formData.piDate}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('pi date') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Bill Number <span className="text-red-500">*</span>
          <input
            name="billNumber"
            value={formData.billNumber}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('bill number') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Bill Date <span className="text-red-500">*</span>
          <input
            type="date"
            name="billDate"
            value={formData.billDate}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('bill date') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          E-Way Bill Number <span className="text-red-500">*</span>
          <input
            name="eWayBillNo"
            value={formData.eWayBillNo}
            onChange={onChange}
            className={inputClass}
          />
          {errorFor('e-way') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Payment Terms <span className="text-red-500">*</span>
          <div className="mt-1.5">
            <Dropdown
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={onChange}
              options={paymentTerms}
              placeholder="Select payment terms"
            />
          </div>
          {errorFor('payment terms') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Due Date <span className="text-red-500">*</span>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={onChange}
            readOnly={Boolean(formData.paymentTerms) && !isCustomPaymentTerm}
            className={`${inputClass} ${formData.paymentTerms && !isCustomPaymentTerm ? 'cursor-default bg-stone-50' : ''}`}
          />
          {errorFor('due date') && <span className={fieldError}>{validationMessage}</span>}
        </label>

        <label className="text-xs font-semibold text-stone-600">
          State of Supply <span className="text-red-500">*</span>
          <input
            name="stateOfSupply"
            value={formData.stateOfSupply}
            readOnly
            placeholder="Selected supplier state"
            className={`${inputClass} cursor-default bg-stone-50`}
          />
          {errorFor('state of supply') && <span className={fieldError}>{validationMessage}</span>}
        </label>
      </div>
    </section>
  );
}
