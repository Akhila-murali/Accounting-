import { useEffect, useState } from 'react';
import { ChevronDown, FileDigit, X } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import {
  getDocumentPrefixes,
  updateDocumentPrefixes,
} from '../../services/prefix.js';

const prefixFields = [
  {
    key: 'sale',
    label: 'Sale',
  },
  {
    key: 'saleOrder',
    label: 'Sale Order',
  },
  {
    key: 'purchaseOrder',
    label: 'Purchase Order',
  },
  {
    key: 'estimate',
    label: 'Estimate',
  },
  {
    key: 'proformaInvoice',
    label: 'Proforma Invoice',
  },
  {
    key: 'purchaseBill',
    label: 'Purchase Bill',
  },
  {
    key: 'creditNote',
    label: 'Credit Note',
  },
  {
    key: 'deliveryChallan',
    label: 'Delivery Challan',
  },
  {
    key: 'paymentIn',
    label: 'Payment In',
  },
  {
    key: 'saleFixedAsset',
    label: 'Sale Fixed Asset',
  },
];

const initialPrefixes = {
  sale: '',
  saleOrder: '',
  purchaseOrder: '',
  estimate: '',
  proformaInvoice: '',
  purchaseBill: '',
  creditNote: '',
  deliveryChallan: '',
  paymentIn: '',
  saleFixedAsset: '',
};

const settingsTabs = [
  'General',
  'Prefixes',
  'Numbering',
  'Taxes',
  'Notifications',
];



export default function Prefix({ onClose }) {
  const [prefixes, setPrefixes] = useState(initialPrefixes);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedPrefixes, setSavedPrefixes] = useState(initialPrefixes);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Use the values received from the API as dropdown suggestions.
  const prefixOptions = [
    ...new Set(Object.values(savedPrefixes).filter(Boolean)),
  ];

  useEffect(() => {
    const fetchPrefixes = async () => {
      try {
        setLoading(true);
        const response = await getDocumentPrefixes();

        if (!response?.success || !response?.data) {
          setToast({
            message: response?.message || 'Failed to retrieve document prefixes.',
            type: 'error',
          });
          return;
        }

        const data = { ...initialPrefixes, ...response.data };
        setPrefixes(data);
        setSavedPrefixes(data);
      } catch (err) {
        setToast({
          message:
            err.response?.data?.message ||
            'An error occurred while loading document prefixes.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrefixes();
  }, []);

  const updatePrefix = (key, value) => {
    setPrefixes((currentPrefixes) => ({
      ...currentPrefixes,
      [key]: value,
    }));

    setToast(null);
  };

  const savePrefixes = async () => {
    try {
      setSaving(true);

      const response = await updateDocumentPrefixes(prefixes);

      if (!response?.success) {
        showToast(response?.message || 'Failed to save document prefixes.', 'error');
        return;
      }

      const updated = { ...initialPrefixes, ...(response.data ?? prefixes) };

      setPrefixes(updated);
      setSavedPrefixes(updated);
      showToast(response.message || 'Document prefixes saved successfully.');
      window.setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Server error occurred while saving prefixes.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-scale-page flex w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white font-sans text-stone-800 shadow-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div
        className="flex items-start justify-between border-b border-brand-gold-highlight/20 px-5 py-5 sm:px-7"
        style={{ backgroundImage: 'var(--gradient-surface-gold)' }}
      >
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Configure how your business documents are generated.
          </p>
        </div>

        <Button
          variant="unstyled"
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={19} />
        </Button>
      </div>

      <section className="w-full bg-white">

        <header className="border-b border-stone-200 px-5 pt-3 sm:px-7">
          <nav className="flex gap-5 overflow-x-auto">
            {settingsTabs.map((tab) => (
              <Button
                key={tab}
                variant="unstyled"
                type="button"
                disabled={tab !== 'Prefixes'}
                className={`border-b-2 pb-3 text-xs font-semibold ${
                  tab === 'Prefixes'
                    ? 'border-[#8c6723] text-[#8c6723]'
                    : 'border-transparent text-stone-400'
                }`}
              >
                {tab}
              </Button>
            ))}
          </nav>
        </header>

        <div className="border-b border-stone-100 bg-stone-50/40 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf5e7] text-[#8c6723]">
              <FileDigit size={17} />
            </span>

            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Document Prefixes
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                Type or select a prefix for each document.
              </p>
            </div>

          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">

            {prefixFields.map((field) => (
              <PrefixField
                key={field.key}
                label={field.label}
                value={prefixes[field.key]}
                options={prefixOptions}
                onChange={(value) =>
                  updatePrefix(field.key, value)
                }
              />
            ))}

          </div>
        </div>

{loading && (
  <p className="px-5 py-2 text-sm text-stone-500 sm:px-7">
    Loading document prefixes...
  </p>
)}

        <footer className="flex min-h-16 items-center justify-end gap-3 border-t border-stone-100 bg-stone-50/40 px-5 py-4 sm:px-7">
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

<Button
  onClick={savePrefixes}
  disabled={loading || saving}
>
  {saving ? 'Saving...' : 'Save Changes'}
</Button>

        </footer>

      </section>
    </div>
  );
}


function PrefixField({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  const selectPrefix = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative">
      
      <label className="text-xs font-semibold text-stone-600">
        {label}
      </label>

      <div className="relative mt-2">

        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          maxLength={12}
          placeholder="Enter or select prefix"
          className="h-[42px] w-full rounded-xl border border-stone-200 bg-white px-3 pr-10 text-sm font-semibold uppercase tracking-wide text-stone-800 outline-none placeholder:text-xs placeholder:font-normal placeholder:normal-case placeholder:text-stone-400 focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/15"
        />

        <Button
          variant="unstyled"
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-0 top-0 flex h-[42px] w-10 items-center justify-center bg-transparent text-stone-400"
        >
          <ChevronDown
            size={15}
            className={open ? 'rotate-180' : ''}
          />
        </Button>

        {open && filteredOptions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
            {filteredOptions.map((option) => (
              <Button
                key={option}
                variant="unstyled"
                type="button"
                onMouseDown={() => selectPrefix(option)}
                className="block w-full border-0 bg-white px-3 py-2 text-left text-xs font-semibold tracking-wide text-stone-800 hover:bg-[#fbf5e7]"
              >
                {option}
              </Button>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
