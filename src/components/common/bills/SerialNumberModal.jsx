import { useState } from 'react';
import { Pencil, X } from 'lucide-react';

import Button from '../Button.jsx';


export default function SerialNumberModal({
  productName,
  quantity,
  serialNumbers,
  products = [],
  selectedProductId,
  onProductChange,
  onSave,
  onClose,
}) {
  const [serialDraft, setSerialDraft] = useState(() =>
    Array.from(
      { length: Number(quantity) },
      (_, index) => serialNumbers[index] || ''
    )
  );
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(
    serialNumbers.length === 0
  );


  const changeSerial = (index, value) => {
    setSerialDraft((current) =>
      current.map((serial, serialIndex) =>
        serialIndex === index ? value : serial
      )
    );
    setError('');
  };


  const saveSerials = () => {
    const values = serialDraft.map((serial) => serial.trim());

    if (values.some((serial) => !serial)) {
      setError('Enter all serial numbers.');
      return;
    }

    if (new Set(values).size !== values.length) {
      setError('Serial numbers must be unique.');
      return;
    }

    onSave(values);
    onClose();
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="m-0 text-base font-bold text-stone-900">
              {productName || 'Product'}
            </h2>
            <p className="mb-0 mt-1 text-xs text-stone-400">
              Serial Numbers · Quantity {quantity}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button
                variant="unstyled"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#8c6723]"
                title="Edit serial numbers"
              >
                <Pencil size={13} /> Edit
              </Button>
            )}

            <Button
              variant="unstyled"
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700"
              title="Close"
            >
              <X size={17} />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {products.length > 0 && (
            <label className="mb-5 block text-xs font-semibold text-stone-600">
              Product
              <select
                value={selectedProductId}
                onChange={(event) => onProductChange(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#c5a059]"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {serialDraft.map((serial, index) => (
              <label
                key={index}
                className="text-xs font-semibold text-stone-600"
              >
                Serial number {index + 1}
                <input
                  value={serial}
                  readOnly={!isEditing}
                  onChange={(event) =>
                    changeSerial(index, event.target.value)
                  }
                  placeholder={`Enter serial number ${index + 1}`}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm font-normal outline-none ${
                    isEditing
                      ? 'border-stone-200 bg-white focus:border-[#c5a059]'
                      : 'cursor-default border-stone-100 bg-stone-50 text-stone-600'
                  }`}
                />
              </label>
            ))}
          </div>

          {error && (
            <p className="mb-0 mt-3 text-xs text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-100 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isEditing && (
            <Button onClick={saveSerials}>
              Save Serial Numbers
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
