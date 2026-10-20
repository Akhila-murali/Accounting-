import { FileText, Info } from 'lucide-react';

import Dropdown from '../common/Dropdown.jsx';

const inputClass =
  'mt-1.5 h-[42px] w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15';

export default function InvoiceInformation({
  formData,
  companies,
  quotations,
  isSalesInvoice,
  onChange,
}) {
  const companyOptions = companies.map((company) => ({
    value: String(company.id),
    label: company.companyName,
  }));
  

  const quotationOptions = quotations.map((quotation) => ({
    value: String(quotation.id),
    label: quotation.proposalReference,
  }));

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#8c6723]" />
          <h2 className="m-0 text-sm font-bold text-stone-900">
            {isSalesInvoice ? 'Sales Invoice Information' : 'Proforma Information'} 
          </h2>
        </div>
        <div className="text-xs text-stone-500">
          GSTIN:{' '}
          <span className="font-semibold text-stone-700">
            {formData.gstNo || 'Not available'}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-2 2xl:gap-0 2xl:divide-x 2xl:divide-stone-100">
        <div className="min-w-0 2xl:pr-6">
          <SectionTitle>Customer Details</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-stone-600">
              Customer <span className="text-red-500">*</span>
              <div className="mt-1.5">
                <Dropdown
                  name="customerCompanyId"
                  value={formData.customerCompanyId}
                  options={companyOptions}
                  onChange={onChange}
                  placeholder="Select customer"
                  emptyMessage="No customers available"
                />
              </div>
            </label>

            <Field
              label={(
                <>
                  Billing Name{' '}
                  <span className="font-normal text-stone-400">(Optional)</span>
                </>
              )}
              name="billingName"
              value={formData.billingName}
              onChange={onChange}
              placeholder="Enter billing name"
            />
            <Field label="Phone Number" name="phoneNo" value={formData.phoneNo} readOnly placeholder="Selected customer phone" />

            <Field label="State of Supply" name="stateOfSupply" value={formData.stateOfSupply} readOnly placeholder="Selected customer state" />
          </div>
        </div>

        <div className="min-w-0 2xl:pl-6">
          <SectionTitle>Document Details</SectionTitle>

          {isSalesInvoice ? (
            <div className="space-y-4">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[90px_minmax(0,1fr)] xl:grid-cols-[90px_minmax(150px,1fr)_minmax(150px,1fr)]">
                <Field label="Prefix" name="prefix" value={formData.prefix} onChange={onChange} maxLength={12} />
                <Field label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} readOnly />
                <Field wrapperClassName="sm:col-span-2 xl:col-span-1" label="PI Number" name="piNumber" value={formData.piNumber} onChange={onChange} placeholder="Enter PI number" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(120px,0.7fr)]">
                <ProposalField formData={formData} options={quotationOptions} onChange={onChange} />
                <Field label="Invoice Date" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={onChange} required />
                <Field label="Validity (days)" name="validityPeriod" type="number" value={formData.validityPeriod} onChange={onChange} required />
              </div>
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-12">
              <Field
                wrapperClassName="sm:col-span-4"
                label="Prefix"
                name="prefix"
                value={formData.prefix}
                onChange={onChange}
                maxLength={12}
              />
              <div className="min-w-0 sm:col-span-4">
                <Field
                  label="PI No."
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  readOnly
                />
                <p className="mb-0 mt-1.5 flex items-center gap-1.5 whitespace-nowrap text-[10px] text-stone-500">
                  <Info size={11} className="shrink-0" />
                  PI number is auto-generated from the prefix.
                </p>
              </div>
              <div className="min-w-0 sm:col-span-4">
                <ProposalField formData={formData} options={quotationOptions} onChange={onChange} />
              </div>
              <Field
                wrapperClassName="sm:col-span-5 sm:col-start-1 sm:row-start-2 xl:col-span-4"
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={onChange}
                required
              />
              <Field
                wrapperClassName="sm:col-span-3 sm:col-start-6 sm:row-start-2 xl:col-span-3 xl:col-start-5"
                label="Validity (days)"
                name="validityPeriod"
                type="number"
                value={formData.validityPeriod}
                onChange={onChange}
                required
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProposalField({ formData, options, onChange }) {
  return (
    <label className="block text-xs font-semibold text-stone-600">
      Proposal Reference
      <div className="mt-1.5">
        <Dropdown
          name="proposalReference"
          value={formData.proposalReference}
          options={options}
          onChange={onChange}
          onClear={() => onChange({
              target: { name: 'proposalReference', value: '' },
            })}
          placeholder="Select quotation"
          emptyMessage="No quotations available"
        />
      </div>
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-4 mt-0 flex items-center gap-2 text-xs font-bold text-stone-700">
      <span className="h-4 w-1 rounded-full bg-brand-gold" />
      {children}
    </h3>
  );
}

function Field({ label, required = false, wrapperClassName = '', ...inputProps }) {
  return (
    <label className={`relative text-xs font-semibold text-stone-600 ${wrapperClassName}`}>
      {label} {required && <span className="text-red-500">*</span>}
      <input
        {...inputProps}
        className={`${inputClass} read-only:cursor-default read-only:bg-stone-50 read-only:text-stone-500`}
      />
    </label>
  );
}
