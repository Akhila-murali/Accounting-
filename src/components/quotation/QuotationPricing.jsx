import { useEffect, useState } from 'react';
import {
  Calculator,
  IndianRupee,
  Save,
  X,
} from 'lucide-react';

import {
  getGstSlabs,
  getPricingPreview,
} from '../../services/pricing.js';

import Button from '../common/Button.jsx';


const formatMoney = (value) => {
  if (value === null || value === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
};


export default function QuotationPricing({
  pricing,
  onChange,
  onDiscard,
  onSave,
}) {
  const [gstSlabs, setGstSlabs] = useState([]);
  const [isLoadingSlabs, setIsLoadingSlabs] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [gstError, setGstError] = useState('');
  const [calculationError, setCalculationError] = useState('');

  const preview = pricing.preview || null;


  useEffect(() => {
    let isMounted = true;

    const loadGstSlabs = async () => {
      try {
        const response = await getGstSlabs();

        const slabs = response?.data ?? response;

        if (isMounted) {
          setGstSlabs(
            Array.isArray(slabs)
              ? slabs
              : []
          );
        }
      } catch (error) {
        if (isMounted) {
          setGstError(
            error.response?.data?.message ||
            'Unable to load GST slabs.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlabs(false);
        }
      }
    };

    loadGstSlabs();

    return () => {
      isMounted = false;
    };
  }, []);


  const updateField = (field, value) => {
    setCalculationError('');

    onChange({
      ...pricing,
      [field]: value,
      preview: null,
    });
  };


  const handleCalculate = async () => {
    const request = {
      amount: Number(pricing.amount),
      discountType: pricing.discountType,
      discountValue: Number(pricing.discountValue || 0),
      gstSlabId: Number(pricing.gstSlabId),
    };

    if (request.amount <= 0) {
      setCalculationError(
        'Enter a valid total amount.'
      );

      return;
    }

    if (!request.gstSlabId) {
      setCalculationError(
        'Select a GST slab.'
      );

      return;
    }

    try {
      setIsCalculating(true);
      setCalculationError('');

      const response = await getPricingPreview(request);

      const calculatedPricing =
        response?.data ?? response;

      onChange({
        ...pricing,
        preview: calculatedPricing,
      });
    } catch (error) {
      setCalculationError(
        error.response?.data?.message ||
        'Unable to calculate pricing.'
      );
    } finally {
      setIsCalculating(false);
    }
  };


  return (
    <div className="quotation-pricing p-2 sm:p-4">

      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="m-0 text-sm font-bold text-stone-900">
              Pricing Summary
            </h3>

            <p className="m-0 mt-1 text-xs text-stone-500">
              Enter pricing details and calculate the final quotation amount.
              All amounts are in INR.
            </p>
          </div>

          <Button
            icon={Calculator}
            onClick={handleCalculate}
            disabled={
              isCalculating ||
              isLoadingSlabs
            }
          >
            {isCalculating
              ? 'Calculating...'
              : 'Calculate'}
          </Button>
        </div>


        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

          {/* Total Amount */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-light text-xs font-bold text-brand-gold">
                1
              </span>

              <div>
                <p className="m-0 text-xs font-bold text-stone-800">
                  Total Amount
                </p>

                <p className="m-0 mt-0.5 text-[10px] text-stone-400">
                  Enter the base amount
                </p>
              </div>
            </div>

            <div className="relative">
              <IndianRupee
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="number"
                min="0"
                value={pricing.amount ?? ''}
                onChange={(event) =>
                  updateField(
                    'amount',
                    event.target.value
                  )
                }
                className="pricing-input pricing-input-prefix"
              />
            </div>
          </div>


          {/* Discount Type */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-light text-xs font-bold text-brand-gold">
                2
              </span>

              <div>
                <p className="m-0 text-xs font-bold text-stone-800">
                  Discount Type
                </p>

                <p className="m-0 mt-0.5 text-[10px] text-stone-400">
                  Select discount type
                </p>
              </div>
            </div>

            <select
              value={pricing.discountType ?? ''}
              onChange={(event) =>
                updateField(
                  'discountType',
                  event.target.value
                )
              }
              className="pricing-input cursor-pointer"
            >
              <option value="">
                Select
              </option>

              <option value="Percentage">
                Percentage (%)
              </option>

              <option value="Amount">
                Fixed Amount
              </option>
            </select>
          </div>


          {/* Discount Value */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-light text-xs font-bold text-brand-gold">
                3
              </span>

              <div>
                <p className="m-0 text-xs font-bold text-stone-800">
                  Discount Value
                </p>

                <p className="m-0 mt-0.5 text-[10px] text-stone-400">
                  Enter discount value
                </p>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={pricing.discountValue ?? ''}
                onChange={(event) =>
                  updateField(
                    'discountValue',
                    event.target.value
                  )
                }
                className="pricing-input pricing-input-suffix"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                {pricing.discountType === 'Percentage'
                  ? '%'
                  : '₹'}
              </span>
            </div>
          </div>


          {/* GST Slab */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-light text-xs font-bold text-brand-gold">
                4
              </span>

              <div>
                <p className="m-0 text-xs font-bold text-stone-800">
                  GST Slab
                </p>

                <p className="m-0 mt-0.5 text-[10px] text-stone-400">
                  Select applicable GST slab
                </p>
              </div>
            </div>

            <select
              value={pricing.gstSlabId ?? ''}
              disabled={isLoadingSlabs}
              onChange={(event) =>
                updateField(
                  'gstSlabId',
                  Number(event.target.value)
                )
              }
              className="pricing-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingSlabs
                  ? 'Loading GST slabs...'
                  : 'Select GST slab'}
              </option>

              {gstSlabs.map((slab) => (
                <option
                  key={slab.id}
                  value={slab.id}
                >
                  {slab.name ||
                    `GST ${slab.percentage}%`}
                </option>
              ))}
            </select>
          </div>

        </div>


        {gstError && (
          <p className="m-0 mt-4 text-xs font-medium text-rose-600">
            {gstError}
          </p>
        )}


        {calculationError && (
          <p className="m-0 mt-4 text-xs font-medium text-rose-600">
            {calculationError}
          </p>
        )}

      </div>


      {/* Calculation Breakdown */}
      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">

        <div className="flex items-center gap-2">
          <Calculator
            size={15}
            className="text-brand-gold"
          />

          <h3 className="m-0 text-sm font-bold text-stone-900">
            Calculation Breakdown
          </h3>
        </div>


        <div className="mt-4 flex justify-between border-b border-stone-100 pb-2 text-[11px] text-stone-400">
          <span>
            Description
          </span>

          <span>
            Amount (INR)
          </span>
        </div>


        {/* Total Amount */}
        <div className="flex items-center justify-between border-b border-stone-100 px-2 py-3">
          <span className="text-xs font-semibold text-stone-800">
            Total Amount
          </span>

          <span className="text-xs font-bold text-stone-800">
            {formatMoney(preview?.amount)}
          </span>
        </div>


        {/* Discount */}
        <div className="flex items-center justify-between border-b border-stone-100 px-2 py-3">
          <span className="text-xs font-semibold text-stone-800">
            Less: Discount
          </span>

          <span className="text-xs font-bold text-rose-500">
            {preview?.discountAmount !== null &&
            preview?.discountAmount !== undefined
              ? `−${formatMoney(
                  preview.discountAmount
                )}`
              : '—'}
          </span>
        </div>


        {/* Taxable Amount */}
        <div className="flex items-center justify-between border-b border-stone-100 px-2 py-3">
          <span className="text-xs font-semibold text-stone-800">
            Taxable Amount
          </span>

          <span className="text-xs font-bold text-stone-800">
            {formatMoney(
              preview?.taxableAmount
            )}
          </span>
        </div>


        {/* GST */}
        <div className="flex items-center justify-between border-b border-stone-100 px-2 py-3">
          <span className="text-xs font-semibold text-stone-800">
            {preview
              ? `Add: GST (${preview.gstPercentage}%)`
              : 'Add: GST'}
          </span>

          <span className="text-xs font-bold text-stone-800">
            {formatMoney(
              preview?.gstAmount
            )}
          </span>
        </div>


        {/* Final Amount */}
        <div className="mt-2 flex items-center justify-between rounded-lg border border-[#ead8b3] bg-brand-gold-light px-2 py-3">
          <span className="text-xs font-semibold text-stone-800">
            Final Amount
          </span>

          <span className="text-xs font-bold text-brand-gold">
            {formatMoney(
              preview?.totalAmount
            )}
          </span>
        </div>

      </div>


      <div className="mt-5 flex justify-end gap-2 border-t border-stone-100 pt-4">

        <Button
          variant="outline"
          icon={X}
          onClick={onDiscard}
        >
          Discard
        </Button>

        <Button
          icon={Save}
          onClick={onSave}
        >
          Save Section
        </Button>

      </div>

    </div>
  );
}