import { useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  Check,
  History,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import Button from '../common/Button.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Toast from '../common/Toast.jsx';
import StockPicker from './StockPicker.jsx';
import ManufacturedStockPicker from './ManufacturedStockPicker.jsx';
import StockPurchaseHistoryTable from '../inventory/StockPurchaseHistoryTable.jsx';
import { getManufacturingMaterials } from '../../services/inventory.js';
import { getManufacturedStockUnits, getManufacturingBatches } from '../../services/manufacturing.js';


const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;


export default function MaterialSelectionSection({
  materials,
  setMaterials,
  materialCost,
}) {
  const [showStock, setShowStock] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [stockTab, setStockTab] = useState('purchased');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [serialRecord, setSerialRecord] = useState(null);
  const [stockUnits, setStockUnits] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [serialSearch, setSerialSearch] = useState('');
  const [serialLoading, setSerialLoading] = useState(false);
  const [serialError, setSerialError] = useState('');
  const [selectionToast, setSelectionToast] = useState(null);
  const [materialDetails, setMaterialDetails] = useState(null);
  const [manufacturedBatches, setManufacturedBatches] = useState([]);
  const [manufacturedLoading, setManufacturedLoading] = useState(false);
  const [manufacturedError, setManufacturedError] = useState('');


  const showSelectionToast = (message) => {
    setSelectionToast({
      message,
      type: 'success',
    });
  };


  const selectMaterial = (material) => {
    const savedRecords = materials.filter(
      (item) => item.itemKey === material.itemKey && item.sourceType === 'Purchase'
    );

    const recordIds = savedRecords.map(
      (item) => item.purchaseBillItemId
    );

    setSelectedStock({ ...material, sourceType: 'Purchase' }); // for stock history modal open
    setSelectedRecordIds(recordIds);
  };

  const selectManufacturedMaterial = async (material) => {
    setSelectedStock({ ...material, sourceType: 'Manufacturing' });  // for manufacturing history modal open
    setHistorySearch('');
    setManufacturedBatches([]);
    setManufacturedError('');
    setManufacturedLoading(true);
    setSelectedRecordIds(
      materials
        .filter((item) => item.itemKey === material.itemKey && item.sourceType === 'Manufacturing')
        .map((item) => item.manufacturingId)
    );

    try {
      const response = await getManufacturingBatches(material.itemKey);
      if (response?.success === false) throw new Error(response.message);
      setManufacturedBatches(response?.data || []);
    } catch (error) {
      setManufacturedError(error.response?.data?.message || error.message || 'Unable to load manufacturing history.');
    } finally {
      setManufacturedLoading(false);
    }
  };

const loadUnits = async (record) => {
  let response;

  if (selectedStock.sourceType === 'Manufacturing') {
    response = await getManufacturedStockUnits(
      record.manufacturingId
    );
  } else {
    response = await getManufacturingMaterials(
      record.purchaseBillId,
      selectedStock.itemKey
    );
  }

  if (response?.success === false) {
    throw new Error(response.message);
  }

  return (response?.data || []).filter(
    (unit) => unit.status === 'Available'
  );
};


const getRecordId = (record) => {
  if (selectedStock.sourceType === 'Manufacturing') {
    return record.manufacturingId;
  }

  return record.purchaseBillItemId;
};


const isSameMaterial = (item, record) => {
  if (selectedStock.sourceType === 'Manufacturing') {
    return (
      item.sourceType === 'Manufacturing' &&
      item.itemKey === selectedStock.itemKey &&
      item.manufacturingId === record.manufacturingId
    );
  }

  return (
    item.sourceType === 'Purchase' &&
    item.itemKey === selectedStock.itemKey &&
    item.purchaseBillItemId === record.purchaseBillItemId
  );
};


const removeRecordSelection = (record) => {
  const recordId = getRecordId(record);

  setMaterials((current) =>
    current.filter(
      (item) => !isSameMaterial(item, record)
    )
  );

  setSelectedRecordIds((current) =>
    current.filter(
      (id) => id !== recordId
    )
  );
};


const saveSelectedUnits = (record, units) => {
  const recordId = getRecordId(record);

  const prices = units.map(
    (unit) => Number(unit.currentPurchasePrice || 0)
  );

  const material = {
    ...selectedStock,

    ...(selectedStock.sourceType === 'Manufacturing'
      ? {
          manufacturingId: record.manufacturingId,
        }
      : {
          purchaseBillItemId: record.purchaseBillItemId,
        }),

    stockUnitIds: units.map(
      (unit) => unit.stockUnitId
    ),

    stockUnitPrices: prices,

    serialNumbers: units.map(
      (unit) => unit.serialNumber
    ),

    selectedQuantity: units.length,

    materialCost: prices.reduce(
      (total, price) => total + price,
      0
    ),

    averagePurchasePrice:
      prices.length > 0
        ? prices.reduce(
            (total, price) => total + price,
            0
          ) / prices.length
        : 0,

    currentSellingPrice:
      units[0]?.currentSellingPrice || 0,
  };

  setMaterials((current) => [
    ...current.filter(
      (item) => !isSameMaterial(item, record)
    ),
    material,
  ]);

  setSelectedRecordIds((current) => {
    if (current.includes(recordId)) {
      return current;
    }

    return [
      ...current,
      recordId,
    ];
  });
};


const chooseRecord = async (record) => {
  if (!selectedStock) {
    return;
  }

  const recordId = getRecordId(record);

  const alreadySelected =
    selectedRecordIds.includes(recordId);

  if (alreadySelected) {
    removeRecordSelection(record);

    showSelectionToast(
      `${selectedStock.name} removed`
    );

    return;
  }

  if (Number(record.availableQuantity || 0) > 1) {
    openSerialPicker(record);
    return;
  }

  try {
    const units = await loadUnits(record);

    const unit = units[0];

    if (!unit) {
      throw new Error(
        'No available stock unit found.'
      );
    }

    saveSelectedUnits(
      record,
      [unit]
    );

    showSelectionToast(
      `${unit.serialNumber} · ${selectedStock.name} selected`
    );
  } catch (error) {
    setSelectionToast({
      message:
        error.response?.data?.message ||
        error.message ||
        'Unable to load stock units.',
      type: 'error',
    });
  }
};


const openSerialPicker = async (record) => {
  if (!selectedStock) {
    return;
  }

  const savedMaterial = materials.find(
    (item) =>
      isSameMaterial(item, record)
  );

  setSerialRecord({
    ...record,
    sourceType: selectedStock.sourceType,
  });

  setSerialSearch('');
  setStockUnits([]);
  setSerialError('');

  setSelectedSerials(
    savedMaterial?.serialNumbers || []
  );

  try {
    setSerialLoading(true);

    const units = await loadUnits(record);

    setStockUnits(units);
  } catch (error) {
    setSerialError(
      error.response?.data?.message ||
      error.message ||
      'Unable to load stock units.'
    );
  } finally {
    setSerialLoading(false);
  }
};


  const toggleSerial = (serial) => {
    setSelectedSerials((current) => {
      if (current.includes(serial)) {
        return current.filter(
          (item) => item !== serial
        );
      }

      return [...current, serial];
    });
  };


const confirmSerials = () => {
  if (!serialRecord || !selectedStock) {
    return;
  }

  if (selectedSerials.length === 0) {
    removeRecordSelection(serialRecord);

    setSerialRecord(null);
    setSelectedStock(null);

    return;
  }

  const selectedUnits = stockUnits.filter(
    (unit) =>
      selectedSerials.includes(
        unit.serialNumber
      )
  );

  if (selectedUnits.length === 0) {
    return;
  }

  saveSelectedUnits(
    serialRecord,
    selectedUnits
  );

  setSerialRecord(null);
  setSelectedStock(null);

  showSelectionToast(
    `${selectedSerials.join(', ')} · ${selectedStock.name} selected`
  );
};


const removeMaterial = (material) => {
  const recordId =
    material.sourceType === 'Manufacturing'
      ? material.manufacturingId
      : material.purchaseBillItemId;

  setMaterials((current) =>
    current.filter((item) => {
      if (material.sourceType === 'Manufacturing') {
        return !(
          item.sourceType === 'Manufacturing' &&
          item.itemKey === material.itemKey &&
          item.manufacturingId === material.manufacturingId
        );
      }

      return !(
        item.sourceType === 'Purchase' &&
        item.itemKey === material.itemKey &&
        item.purchaseBillItemId === material.purchaseBillItemId
      );
    })
  );

  setSelectedRecordIds((current) =>
    current.filter((id) => id !== recordId)
  );
};


  const removeSelectedSerial = (index) => {
    const nextSerials =
      materialDetails.serialNumbers.filter(
        (_, serialIndex) =>
          serialIndex !== index
      );

    const nextStockUnitPrices =
      materialDetails.stockUnitPrices?.filter(
        (_, priceIndex) => priceIndex !== index
      ) || [];

   if (nextSerials.length === 0) {
  removeMaterial(materialDetails);
  setMaterialDetails(null);
  return;
}

    const updatedMaterial = {
      ...materialDetails,
      stockUnitIds: materialDetails.stockUnitIds?.filter(
        (_, stockUnitIndex) => stockUnitIndex !== index
      ) || [],
      stockUnitPrices: nextStockUnitPrices,
      serialNumbers: nextSerials,
      selectedQuantity: nextSerials.length,
      materialCost: nextStockUnitPrices.reduce(
        (total, price) => total + Number(price || 0),
        0
      ),
    };

    setMaterials((current) =>
      current.map((item) => {
    let isSameMaterial;

if (materialDetails.sourceType === 'Manufacturing') {
  isSameMaterial =
    item.sourceType === 'Manufacturing' &&
    item.itemKey === materialDetails.itemKey &&
    item.manufacturingId === materialDetails.manufacturingId;
} else {
  isSameMaterial =
    item.sourceType === 'Purchase' &&
    item.itemKey === materialDetails.itemKey &&
    item.purchaseBillItemId === materialDetails.purchaseBillItemId;
}

        return isSameMaterial
          ? updatedMaterial
          : item;
      })
    );

    setMaterialDetails(updatedMaterial);
  };


  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs">
      <Toast
        toast={selectionToast}
        onClose={() => setSelectionToast(null)}
      />

      <div className="flex items-center gap-3 border-b border-stone-100 bg-stone-50/60 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf5e7] text-[#8c6723]">
          <Boxes size={16} />
        </div>

        <div>
          <h2 className="m-0 text-sm font-bold text-stone-900">
            Required Materials
          </h2>

          <p className="m-0 mt-0.5 text-xs text-stone-400">
            Choose materials from available stock for this production.
          </p>
        </div>

        <Button
          onClick={() => setShowStock(true)}
          className="ml-auto"
          icon={Plus}
        >
          Add Material
        </Button>
      </div>


      <div className="no-scrollbar max-h-80 overflow-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-stone-50 text-[11px] uppercase text-stone-400">
            <tr>
              {[
                '#',
                'Material',
                'HSN/SAC',
                'Available',
                'Avg Cost',
                'Selling Price',
                'Action',
              ].map((title) => (
                <th key={title} className="px-3 py-3">
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8">
                  <TableEmptyState
                    title="No materials added"
                    message="Choose available stock to add production materials."
                  />
                </td>
              </tr>
            ) : (
              materials.map((item, index) => (
                <tr
                  key={`${item.sourceType}-${item.itemKey}-${
                    item.sourceType === 'Manufacturing'
                      ? item.manufacturingId
                      : item.purchaseBillItemId
                  }`}
                  onClick={() => setMaterialDetails(item)}
                  className="cursor-pointer border-t border-stone-100 text-sm transition hover:bg-stone-50/70"
                >
                  <td className="px-3 py-3">
                    {index + 1}
                  </td>

                  <td className="px-3 py-3 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbf5e7] text-[#8c6723]">
                        <Check size={12} strokeWidth={3} />
                      </span>

                      <span>
                        {item.name}

                        {item.serialNumbers?.length > 0 && (
                          <small className="mt-0.5 block font-normal text-stone-400">
                            {item.serialNumbers.join(', ')}
                          </small>
                        )}
                      </span>
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    {item.hsnsac || '—'}
                  </td>

                  <td className="px-3 py-3">
                    {item.selectedQuantity || 1}
                  </td>

                  <td className="px-3 py-3">
                    {money(item.averagePurchasePrice)}
                  </td>

                  <td className="px-3 py-3">
                    {money(item.currentSellingPrice)}
                  </td>

                  <td className="px-3 py-3">
                    <Button
                      variant="unstyled"
                      className="p-1 text-stone-400 hover:text-rose-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeMaterial(item);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      <div className="flex justify-end p-4">
        <div className="flex items-baseline gap-6 px-1 py-2">
          <span className="text-xs font-medium text-stone-500">
            Total Material Cost
          </span>
          <strong className="text-lg text-[#8c6723]">
            {money(materialCost)}
          </strong>
        </div>
      </div>


      {showStock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-4"
          onClick={() => setShowStock(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-stone-200 bg-stone-50 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-200 bg-white px-6 py-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold-light text-brand-gold">
                  <PackageCheck size={19} />
                </div>

                <div>
                  <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                    Step 1 · Available Inventory
                  </p>
                  <h2 className="m-0 mt-1 text-xl font-bold text-stone-900">
                    Choose a material
                  </h2>
                  <p className="m-0 mt-1 text-xs text-stone-500">
                    Select a stock row to review its purchase history before adding it.
                  </p>
                </div>
              </div>

              <Button
                variant="unstyled"
                onClick={() => setShowStock(false)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="p-5">
              <div className="relative mb-4 w-full max-w-xs">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  value={stockSearch}
                  onChange={(event) =>
                    setStockSearch(event.target.value)
                  }
                  placeholder="Search material or HSN..."
                  className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/15"
                />
              </div>

              <div className="mb-4 flex border-b border-stone-200">
                <Button
                  variant="unstyled"
                  onClick={() => setStockTab('purchased')}
                  className={`border-b-2 px-4 py-2 text-xs font-bold tracking-wide transition ${
                    stockTab === 'purchased'
                      ? 'border-brand-gold text-brand-gold'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  PURCHASED MATERIALS
                </Button>

                <Button
                  variant="unstyled"
                  onClick={() => setStockTab('manufactured')}
                  className={`border-b-2 px-4 py-2 text-xs font-bold tracking-wide transition ${
                    stockTab === 'manufactured'
                      ? 'border-brand-gold text-brand-gold'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  MANUFACTURED ITEMS
                </Button>
              </div>

              {stockTab === 'purchased' ? (
                <StockPicker
                  search={stockSearch}
                  onSelect={selectMaterial}
                />
              ) : (
                <ManufacturedStockPicker
                  search={stockSearch}
                  onSelect={selectManufacturedMaterial}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {selectedStock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-4"
          onClick={() => setSelectedStock(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf5e7] text-[#8c6723]">
                    <History size={19} />
                  </div>

                  <div>
                    <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#8c6723]">
                      Step 2 · Source verification
                    </p>

                    <h2 className="m-0 mt-1 text-xl font-bold text-stone-900">
                      History
                    </h2>

                    <p className="m-0 mt-1 text-sm font-semibold text-stone-700">
                      {selectedStock.name}{' '}
                      <span className="font-normal text-stone-400">
                        · HSN/SAC {selectedStock.hsnsac || '—'} ·{' '}
                        {selectedStock.availableQuantity}{' '}
                        {selectedStock.defaultUnit} available
                      </span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="unstyled"
                  onClick={() => setSelectedStock(null)}
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </Button>
              </div>

              <Button
                variant="unstyled"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-[#8c6723]"
                onClick={() => {
                  setSelectedStock(null);
                  setShowStock(true);
                }}
              >
                <ArrowLeft size={14} />
                Back to stock
              </Button>
            </div>

            <div className="p-5">
              <div className="mb-4 max-w-xs">
                <div className="relative min-w-0">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={historySearch}
                    onChange={(event) =>
                      setHistorySearch(event.target.value)
                    }
                    placeholder="Search purchase records..."
                    className="h-[42px] w-full rounded-xl border border-stone-200 pl-8 pr-3 text-xs outline-none focus:border-[#c5a059]"
                  />
                </div>

              </div>

              {selectedStock.sourceType === 'Manufacturing' ? (
                <ManufacturedBatchTable
                  batches={manufacturedBatches}
                  loading={manufacturedLoading}
                  error={manufacturedError}
                  search={historySearch}
                  selectedIds={selectedRecordIds}
                  onChoose={chooseRecord}
                />
              ) : (
                <StockPurchaseHistoryTable
                  itemKey={selectedStock.itemKey}
                  search={historySearch}
                  selectionMode
                  availableOnly
                  selectedRecordIds={selectedRecordIds}
                  onChoose={chooseRecord}
                />
              )}
            </div>
          </div>
        </div>
      )}


      {serialRecord && selectedStock && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/55 p-4"
          onClick={() => setSerialRecord(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="m-0 text-base font-bold text-stone-900">
                    Choose serial numbers
                  </h3>
                  <span className="rounded-full bg-[#fbf5e7] px-2 py-1 text-[11px] font-bold text-[#8c6723]">
                    {selectedSerials.length}/{stockUnits.length}
                  </span>
                </div>
                <p className="m-0 mt-1 text-xs text-stone-400">
                  Select the units required for production.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSerialRecord(null)}
                className="border-0 bg-transparent p-2 text-stone-400 hover:text-stone-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid border-t border-stone-100 md:grid-cols-[1fr_240px]">
              <div className="p-5">
                <div className="relative mb-4 max-w-xs">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={serialSearch}
                    onChange={(event) =>
                      setSerialSearch(event.target.value)
                    }
                    placeholder="Search serial number..."
                    className="h-9 w-full rounded-lg border border-stone-200 pl-8 pr-3 text-xs outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {serialLoading && (
                    <LoadingSpinner className="py-8" />
                  )}

                  {serialError && (
                    <p className="py-8 text-center text-xs text-rose-600">
                      {serialError}
                    </p>
                  )}

                  {stockUnits
                    .filter((unit) =>
                      unit.serialNumber
                        .toLowerCase()
                        .includes(serialSearch.toLowerCase())
                    )
                    .map((unit) => (
                      <label
                        key={unit.stockUnitId}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-[#fbf5e7]/60"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSerials.includes(unit.serialNumber)}
                          onChange={() => toggleSerial(unit.serialNumber)}
                          className="h-4 w-4 accent-[#8c6723]"
                        />
                        <span>{unit.serialNumber}</span>
                      </label>
                    ))}

                  {!serialLoading &&
                    !serialError &&
                    !stockUnits.length && (
                    <TableEmptyState
                      title="No serial numbers"
                      message="No serial numbers are available for this purchase item."
                    />
                    )}
                </div>
              </div>

              <aside className="bg-stone-50/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-xs font-bold uppercase tracking-wide text-stone-500">
                    Selected units
                  </p>

                  {selectedSerials.length > 0 && (
                    <Button
                      variant="unstyled"
                      onClick={() => setSelectedSerials([])}
                      className="ml-auto px-1 text-[11px] font-bold text-[#8c6723] hover:text-rose-600"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="no-scrollbar mt-4 max-h-64 space-y-2 overflow-y-auto">
                  {selectedSerials.length ? (
                    selectedSerials.map((serial, index) => (
                      <div
                        key={`${serial}-${index}`}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbf5e7] text-[#8c6723]">
                          <Check size={12} strokeWidth={3} />
                        </span>

                        {serial}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400">
                      Choose serial numbers from the left.
                    </p>
                  )}
                </div>
              </aside>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
              <Button
                variant="outline"
                onClick={() => setSerialRecord(null)}
              >
                Cancel
              </Button>

              <Button
                onClick={confirmSerials}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}


      {materialDetails && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/55 p-4"
          onClick={() => setMaterialDetails(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="m-0 text-base font-bold text-stone-900">
                  {materialDetails.name}
                </h3>

                <p className="m-0 mt-1 text-xs text-stone-400">
                  Selected serial numbers (
                  {materialDetails.serialNumbers?.length || 0})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMaterialDetails(null)}
                className="border-0 bg-transparent p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {materialDetails.serialNumbers?.length ? (
                materialDetails.serialNumbers.map(
                  (serial, index) => (
                    <div
                      key={`${serial}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 text-sm text-stone-700"
                    >
                      <span className="flex items-center gap-2">
                        <Check
                          size={14}
                          className="text-[#8c6723]"
                        />
                        {serial}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remove ${serial}`}
                        onClick={() =>
                          removeSelectedSerial(index)
                        }
                        className="border-0 bg-transparent p-0 text-stone-400 transition hover:text-rose-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-stone-400">
                  No serial numbers selected.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ManufacturedBatchTable({ batches, loading, error, search, selectedIds, onChoose }) {
  if (loading) return <LoadingSpinner className="p-10" />;
  if (error) return <p className="m-0 p-10 text-center text-sm text-rose-600">{error}</p>;

  const searchText = search.trim().toLowerCase();
  const visibleBatches = batches.filter((batch) =>
    Number(batch.availableQuantity || 0) > 0 &&
    (
      batch.manufacturedByCompanyName?.toLowerCase().includes(searchText) ||
      String(batch.manufacturingId).includes(searchText)
    )
  );

  if (!visibleBatches.length) {
    return <div className="p-8"><TableEmptyState title="No manufacturing history" message="No available manufacturing batches found." /></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-400">
          <tr>
            {['Date', 'Manufacturer', 'Quantity', 'Available', 'Consumed', 'Sold', 'Cost / Item', 'Action'].map((heading) => (
              <th key={heading} className="px-4 py-3">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleBatches.map((batch) => (
            <tr key={batch.manufacturingId} className="border-t border-stone-100">
              <td className="px-4 py-4 text-stone-500">{batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString('en-IN') : '—'}</td>
              <td className="px-4 py-4 font-semibold">{batch.manufacturedByCompanyName || '—'}</td>
              <td className="px-4 py-4">{batch.quantity}</td>
              <td className="px-4 py-4 font-semibold text-emerald-700">{batch.availableQuantity}</td>
              <td className="px-4 py-4">{batch.consumedQuantity}</td>
              <td className="px-4 py-4">{batch.soldQuantity}</td>
              <td className="px-4 py-4">{money(batch.actualManufacturingCostPerItem)}</td>
              <td className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(batch.manufacturingId)}
                  onChange={() => onChoose(batch)}
                  disabled={Number(batch.availableQuantity) <= 0}
                  className="h-4 w-4 cursor-pointer accent-brand-gold disabled:cursor-not-allowed"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
