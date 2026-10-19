import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import TableEmptyState from '../common/TableEmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { getStockPurchaseHistory } from '../../services/inventory.js';


const formatMoney = (value) => {
  if (value == null) {
    return '—';
  }

  return `₹${Number(value).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};


const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


export default function StockPurchaseHistoryTable({
  itemKey,
  search = '',
  onRecordClick,
  selectionMode = false,
  selectedRecordIds = [], // history data 
  onChoose,
  availableOnly = false,
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await getStockPurchaseHistory(itemKey);

        if (response?.success === false) {
          throw new Error(response.message);
        }

        const purchaseRecords =
          response?.data
            ? response.data
            : [];

        setRecords(purchaseRecords);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          error.message ||
          'Unable to load purchase history.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseHistory();
  }, [itemKey]);


  if (loading) {
    return (
      <LoadingSpinner className="p-10" />
    );
  }


  if (error) {
    return (
      <div className="p-10 text-center text-sm text-rose-600">
        {error}
      </div>
    );
  }


  if (records.length === 0) {
    return (
      <div className="p-8">
        <TableEmptyState
          title="No purchase history"
          message="No purchase history found for this item."
        />
      </div>
    );
  }


  const headings = [
    'Date',
    'Bill No.',
    'Supplier',
    'Quantity',
    'Available',
    'Consumed',
    'Sold',
    'Rate',
    'Total Amount',
  ];

  headings.push('Action');

const searchText = search.trim().toLowerCase();

const visibleRecords = records.filter((record) => {
  if (availableOnly && Number(record.availableQuantity || 0) <= 0) {
    return false;
  }

  if (!searchText) {
    return true;
  }

  const billNumber = record.billNumber?.toLowerCase() || '';
  const supplier = record.supplier?.toLowerCase() || '';
  const quantity = String(record.quantity);

  return (
    billNumber.includes(searchText) ||
    supplier.includes(searchText) ||
    quantity.includes(searchText)
  );
});

  return (
    <div className="overflow-x-auto font-sans">
      <table className="w-full min-w-[1050px] text-left">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-400">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                className={`px-4 py-3 ${
                  heading === 'Action'
                    ? 'sticky right-0 z-10 bg-stone-50 text-center shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.35)]'
                    : ''
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>


        <tbody>
          {visibleRecords.map((record) => {
            const selected =
              selectedRecordIds.includes(
                record.purchaseBillItemId
              );

            const singleQuantity =
              Number(record.quantity) === 1;

            return (
              <tr
                key={record.purchaseBillItemId}
                onClick={() => {
                  if (onRecordClick) {
                    onRecordClick(record);
                  }
                }}
                className={`
                  border-t border-stone-100 text-sm transition
                  ${onRecordClick
                    ? 'cursor-pointer hover:bg-stone-50'
                    : ''
                  }
                  bg-white
                `}
              >
                <td className="px-4 py-4 text-stone-500">
                  {formatDate(record.date)}
                </td>

                <td className="px-4 py-4 font-semibold">
                  {record.billNumber || '—'}
                </td>

                <td className="px-4 py-4">
                  {record.supplier || '—'}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={
                      singleQuantity
                        ? 'relative inline-block pr-2 font-semibold text-stone-900'
                        : ''
                    }
                  >
                    {singleQuantity && (
                      <span className="absolute right-0 top-0 text-[10px] leading-none text-red-500">
                        *
                      </span>
                    )}
                    {record.quantity}
                  </span>
                </td>

                <td className="px-4 py-4 font-semibold text-emerald-700">
                  {record.availableQuantity}
                </td>

                <td className="px-4 py-4">
                  {record.consumedQuantity}
                </td>

                <td className="px-4 py-4">
                  {record.soldQuantity}
                </td>

                <td className="px-4 py-4">
                  {formatMoney(record.rate)}
                </td>

                <td className="px-4 py-4 font-bold">
                  {formatMoney(record.amount)}
                </td>


                {selectionMode && (
                  <td className="sticky right-0 bg-white px-4 py-3 text-center shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                    <input
                      type="checkbox"
                      checked={selected}
                      aria-label={
                        selected
                          ? 'Remove selection'
                          : 'Select material'
                      }
                      onChange={() => onChoose?.(record)}
                      className="h-4 w-4 cursor-pointer accent-[#8c6723]"
                    />
                  </td>
                )}

                {!selectionMode && (
                  <td className="px-4 py-3 text-xs font-semibold text-[#8c6723]">
                    <span className="inline-flex items-center gap-1">
                      Details <ChevronRight size={13} />
                    </span>
                  </td>
                )}
              </tr>
            );
          })}


          {visibleRecords.length === 0 && (
            <tr>
              <td
                colSpan={headings.length}
                className="p-8"
              >
                <TableEmptyState
                  title="No matching records"
                  message="Try another search."
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
