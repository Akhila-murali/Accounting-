import { useState } from 'react';
import {
  Box,
  Hash,
  Plus,
} from 'lucide-react';

import Button from '../common/Button.jsx';
import Dropdown from '../common/Dropdown.jsx';
import SerialNumberModal from '../common/bills/SerialNumberModal.jsx';


export default function ManufacturedProductDetails({
  product,
  companies,
  units,
  onChange,
  onSerialsSave,
}) {
  const [showSerialModal, setShowSerialModal] = useState(false);


  const openSerialModal = () => {
    const quantity = Number(product.quantity || 0);

    if (quantity <= 0) {
      return;
    }

    setShowSerialModal(true);
  };


  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf5e7] text-[#8c6723]">
            <Box size={16} />
          </div>
          <h2 className="m-0 text-sm font-bold text-stone-900">
            Product Details
          </h2>
        </div>

        <Button
          variant="unstyled"
          onClick={openSerialModal}
          disabled={Number(product.quantity) <= 0}
          className={`group flex items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 ${
            Number(product.quantity) > 0 &&
            product.serialNumbers.length !== Number(product.quantity)
              ? 'serial-attention'
              : ''
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center text-[#8c6723]">
            {product.serialNumbers.length > 0 ? (
              <Hash size={14} />
            ) : (
              <Plus size={14} />
            )}
          </span>

          <span>
            <span className="block text-xs font-semibold text-stone-700">
              Serial Numbers
            </span>
            <span className="block text-[10px] text-stone-400">
              {product.serialNumbers.length}/{product.quantity || 0} added
            </span>
          </span>

        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field
          label="Product Name"
          name="name"
          value={product.name}
          onChange={onChange}
          placeholder="Enter product name"
        />
        <Field
          label="HSN Code"
          name="hsnsac"
          value={product.hsnsac}
          onChange={onChange}
          placeholder="Enter HSN code"
        />
        <Field
          label="Selling Price (₹)"
          name="sellingPricePerUnit"
          type="number"
          min="0"
          value={product.sellingPricePerUnit}
          onChange={onChange}
          placeholder="0.00"
        />
        <Field
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          value={product.quantity}
          onChange={onChange}
          placeholder="0"
        />

        <DropdownField label="Manufacturer">
          <Dropdown
            name="manufacturedByCompanyId"
            value={product.manufacturedByCompanyId}
            onChange={onChange}
            placeholder="Select manufacturer"
            options={companies.map((company) => ({
              value: company.id,
              label: company.companyName,
            }))}
          />
        </DropdownField>
        <DropdownField label="Unit">
          <Dropdown
            name="unit"
            value={product.unit}
            onChange={onChange}
            placeholder="Select unit"
            options={units}
          />
        </DropdownField>
        <Field
          label="Manufacturing Date"
          name="manufacturingDate"
          type="date"
          value={product.manufacturingDate}
          onChange={onChange}
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-stone-600">
            Description
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={onChange}
            rows="3"
            placeholder="Enter product description (optional)"
            className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>

      </div>

      {showSerialModal && (
        <SerialNumberModal
          productName={product.name}
          quantity={product.quantity}
          serialNumbers={product.serialNumbers}
          onSave={onSerialsSave}
          onClose={() => setShowSerialModal(false)}
        />
      )}
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-600">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
      />
    </div>
  );
}

function DropdownField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-600">
        {label}
      </label>
      {children}
   </div>
  );
}
