import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, PackageCheck, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../common/Button.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';
import { getManufacturedStockUnits, getManufacturingBatches } from '../../services/manufacturing.js';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';

export default function ManufacturingHistory({ itemKey }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [stockUnits, setStockUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState('');

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await getManufacturingBatches(itemKey);
        if (response?.success === false) throw new Error(response.message);
        setBatches(response?.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load manufacturing batches.');
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, [itemKey]);

  const openBatch = async (batch) => {
    setSelectedBatch(batch); // for opem modal
    setStockUnits([]);
    setUnitsError('');
    setUnitsLoading(true);
    try {
      const response = await getManufacturedStockUnits(batch.manufacturingId);
      if (response?.success === false) throw new Error(response.message);
      setStockUnits(response?.data || []); // data to modal
    } catch (requestError) {
      setUnitsError(requestError.response?.data?.message || requestError.message || 'Unable to load stock units.');
    } finally {
      setUnitsLoading(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 font-sans text-stone-800">
      <Button variant="unstyled" onClick={() => navigate('/products')} className="flex w-fit items-center gap-1.5 text-sm text-stone-500">
        <ArrowLeft size={15} /> Back
      </Button>
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#8c6723]">Manufacturing History</p>
        <h1 className="m-0 mt-1 text-2xl font-bold text-stone-900">{itemKey}</h1>
      </div>
      <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs">
        <div className="border-b border-stone-100 p-4">
          <div className="relative max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batches..." className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-[#c5a059]" />
          </div>
        </div>
        <BatchTable batches={batches} loading={loading} error={error} search={search} onSelect={openBatch} />  {/* history tables */}
      </section>

      {selectedBatch && (
        <StockUnitsModal batch={selectedBatch} units={stockUnits} loading={unitsLoading} error={unitsError} onClose={() => setSelectedBatch(null)} />
      )}
    </div>
  );
}

function BatchTable({ batches, loading, error, search, onSelect }) {
  if (loading) return <LoadingSpinner className="p-10" />;
  if (error) return <p className="m-0 p-10 text-center text-sm text-rose-600">{error}</p>;
  if (!batches.length) return <div className="p-8"><TableEmptyState title="No batches found" message="Manufacturing batches will appear here." /></div>;

  const searchText = search.trim().toLowerCase();
  const visibleBatches = batches.filter((batch) => batch.manufacturedByCompanyName?.toLowerCase().includes(searchText));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-500">
          <tr>{['Date', 'Manufacturer', 'Quantity', 'Available', 'Consumed', 'Sold', 'Cost / Item', 'Selling Price', 'Action'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
        </thead>
        <tbody>{visibleBatches.map((batch) => (
          <tr key={batch.manufacturingId} onClick={() => onSelect(batch)} className="cursor-pointer border-t border-stone-100 hover:bg-[#fbf5e7]/30">
            <td className="px-4 py-3">{date(batch.manufacturingDate)}</td>
            <td className="px-4 py-3 font-semibold">{batch.manufacturedByCompanyName || '—'}</td>
            <td className="px-4 py-3">{batch.quantity}</td>
            <td className="px-4 py-3 text-emerald-700">{batch.availableQuantity}</td>
            <td className="px-4 py-3">{batch.consumedQuantity}</td>
            <td className="px-4 py-3">{batch.soldQuantity}</td>
            <td className="px-4 py-3">{money(batch.actualManufacturingCostPerItem)}</td>
            <td className="px-4 py-3">{money(batch.sellingPricePerUnit)}</td>
            <td className="px-4 py-3 text-xs font-semibold text-[#8c6723]"><span className="inline-flex items-center gap-1">Details <ChevronRight size={13} /></span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function StockUnitsModal({ batch, units, loading, error, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-4" onClick={onClose}>
      <section className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between bg-gradient-to-r from-[#fffaf0] to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf5e7] text-[#8c6723]"><PackageCheck size={19} /></span>
            <div>
              <h2 className="m-0 text-base font-bold text-stone-900">Available Stock Units</h2>
              <p className="m-0 mt-1 text-xs text-stone-400">Manufacturing Batch #{batch.manufacturingId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="border-0 bg-transparent p-1 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="max-h-[65vh] overflow-auto">
          {loading ? <LoadingSpinner className="p-10" /> :
            error ? <p className="p-10 text-center text-sm text-rose-600">{error}</p> :
            units.length === 0 ? <div className="p-8"><TableEmptyState title="No available units" message="All units from this batch are currently unavailable." /></div> : (
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-stone-50 text-[11px] uppercase text-stone-500"><tr>{['Serial Number', 'HSN/SAC', 'Unit', 'Cost', 'Selling Price', 'Status'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
                <tbody>{units.map((unit) => (
                  <tr key={unit.stockUnitId} className="border-t border-stone-100 transition hover:bg-[#fbf5e7]/30">
                    <td className="px-4 py-3 font-semibold">{unit.serialNumber || '—'}</td>
                    <td className="px-4 py-3">{unit.hsnsac || '—'}</td>
                    <td className="px-4 py-3">{unit.defaultUnit}</td>
                    <td className="px-4 py-3">{money(unit.currentPurchasePrice)}</td>
                    <td className="px-4 py-3">{money(unit.currentSellingPrice)}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{unit.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
        </div>
      </section>
    </div>
  );
}
