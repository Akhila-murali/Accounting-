import { Fragment, useEffect, useRef, useState } from 'react';
import { Hash, Plus, Trash2 } from 'lucide-react';

import Dropdown from '../common/Dropdown.jsx';
import { getProducts } from '../../services/product.js';

const getItemAmounts = (item, gstSlabs) => {
  const grossAmount =
    Number(item.quantity) * Number(item.pricePerUnit);
  const discountAmount =
    item.discountType === 'Percentage'
      ? grossAmount * Number(item.discountValue || 0) / 100
      : Number(item.discountValue || 0);
  const taxableAmount = Math.max(0, grossAmount - discountAmount);
  const gstSlab = gstSlabs.find(
    (slab) => String(slab.id) === String(item.gstSlabId)
  );
  const gstPercentage = Number(gstSlab?.percentage || 0);
  const gstAmount = taxableAmount * gstPercentage / 100;

  return {
    taxableAmount,
    gstAmount,
    totalAmount: taxableAmount + gstAmount,
  };
};

export default function PurchaseItems({
  items,
  units,
  gstSlabs,
  isSameState,
  onAdd,
  onChange,
  onDelete,
  onOpenSerials,
  validationMessage,
}) {
  const tableScrollRef = useRef(null);

  useEffect(() => {
    const container = tableScrollRef.current;
    if (!container) return undefined;

    const handleWheel = (event) => {
      if (container.scrollWidth <= container.clientWidth) return;

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft += event.deltaX || event.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const headings = [
    '#',
    'Item',
    'HSN/SAC',
    'Qty',
    'Unit',
    'Purchase Price',
    'Selling Price',
    'Discount',
    'Taxable Value',
    'GST',
    ...(isSameState ? ['CGST', 'SGST'] : ['IGST']),
    'Amount',
    '',
  ];

  return (
    <section className="items-field-hover rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="m-0 text-sm font-bold text-stone-900">
          Items
        </h2>
        <button
          type="button"
          onClick={() => onOpenSerials()}
          disabled={!items.some((item) => item.itemName.trim() && Number(item.quantity) > 0)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 ${
            items.some(
              (item) => item.itemName.trim() &&
                Number(item.quantity) > 0 &&
                item.serialNumbers.length !== Number(item.quantity)
            )
              ? 'serial-attention'
              : 'border border-transparent bg-transparent'
          }`}
        >
          <Hash size={14} className="text-[#8c6723]" />
          <span>
            <span className="block text-xs font-semibold text-stone-700">Serial Numbers</span>
            <span className="block text-[10px] text-stone-400">Add by product</span>
          </span>
        </button>
      </div>

        <div
          ref={tableScrollRef}
          className="overflow-x-auto pb-2"
        >
          <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                {headings.map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap border-y border-stone-200 px-2 py-2 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const amounts = getItemAmounts(item, gstSlabs);
                return (
                  <Fragment key={item.id}>
                  <tr
                    className="border-b border-stone-100 text-stone-700"
                  >
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="min-w-48 px-2 py-2">
                      <ProductInput
                        item={item}
                        onChange={onChange}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.hsnsac}
                        onChange={(event) =>
                          onChange(
                            item.id,
                            'hsnsac',
                            event.target.value
                          )
                        }
                        className="h-[42px] w-20 rounded-md border border-stone-200 px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          onChange(
                            item.id,
                            'quantity',
                            event.target.value
                          )
                        }
                        className="h-[42px] w-16 rounded-md border border-stone-200 px-2"
                      />
                    </td>
                    <td className="w-24 px-2 py-2">
                      <Dropdown
                        name="unit"
                        value={item.unit}
                        onChange={(event) =>
                          onChange(item.id, 'unit', event.target.value)
                        }
                        options={units}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.pricePerUnit}
                        onChange={(event) =>
                          onChange(
                            item.id,
                            'pricePerUnit',
                            event.target.value
                          )
                        }
                        className="h-[42px] w-24 rounded-md border border-stone-200 px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.sellingPricePerUnit}
                        onChange={(event) =>
                          onChange(
                            item.id,
                            'sellingPricePerUnit',
                            event.target.value
                          )
                        }
                        className="h-[42px] w-24 rounded-md border border-stone-200 px-2"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex h-[42px] w-28 overflow-hidden rounded-md border border-stone-200 bg-white focus-within:border-[#c5a059]">
                        <input
                          type="number"
                          min="0"
                          value={item.discountValue}
                          onChange={(event) =>
                            onChange(
                              item.id,
                              'discountValue',
                              event.target.value
                            )
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-2 text-right text-xs outline-none"
                        />
                        <select
                          name="discountType"
                          value={item.discountType}
                          onChange={(event) =>
                            onChange(
                              item.id,
                              'discountType',
                              event.target.value
                            )
                          }
                          className="w-11 border-0 border-l border-stone-200 bg-stone-50 px-1 text-xs text-stone-600 outline-none cursor-pointer"
                        >
                          <option value="Amount">₹</option>
                          <option value="Percentage">%</option>
                        </select>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-semibold">
                      ₹{amounts.taxableAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="w-28 px-2 py-2">
                      <Dropdown
                        name="gstSlabId"
                        value={String(item.gstSlabId)}
                        onChange={(event) =>
                          onChange(
                            item.id,
                            'gstSlabId',
                            event.target.value
                          )
                        }
                        options={gstSlabs.map((slab) => ({
                          value: String(slab.id),
                          label: slab.name,
                        }))}
                      />
                    </td>
                    {isSameState ? (
                      <>
                        <td className="whitespace-nowrap px-2 py-2">
                          ₹{(amounts.gstAmount / 2).toLocaleString('en-IN')}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">
                          ₹{(amounts.gstAmount / 2).toLocaleString('en-IN')}
                        </td>
                      </>
                    ) : (
                      <td className="whitespace-nowrap px-2 py-2">
                        ₹{amounts.gstAmount.toLocaleString('en-IN')}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-2 py-2 font-semibold">
                      ₹{amounts.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="border-none bg-transparent p-1 text-stone-400 cursor-pointer hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  {validationMessage?.includes(`row ${index + 1}`) && (
                    <tr>
                      <td colSpan={headings.length} className="px-2 pb-2 text-[11px] text-red-500">
                        {validationMessage}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-1 border-none bg-transparent p-0 text-xs font-semibold text-[#8c6723] cursor-pointer"
      >
        <Plus size={14} /> Add Row
      </button>
    </section>
  );
}
function ProductInput({ item, onChange }) {

  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const inputRef = useRef(null);

  const openMenu = () => {
    const rect = inputRef.current.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setIsOpen(true);
  };

  const loadProducts = async (search = '') => {
    try {
      const response = await getProducts(search);
      setProducts(Array.isArray(response?.data) ? response.data : []);
      openMenu();
    } catch {
      setProducts([]);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    onChange(item.id, 'itemName', value);

    const selectedProduct = products.find(
      (product) => product.name === value
    );

    if (selectedProduct) {
      selectProduct(selectedProduct);
    } else {
      onChange(item.id, 'stockUnitId', null);
      loadProducts(value);
    }
  };

  const selectProduct = (product) => {
    onChange(item.id, 'itemName', product.name);
    onChange(item.id, 'stockUnitId', product.stockUnitId);
    onChange(item.id, 'hsnsac', product.hsnsac || product.hsnSac || '');
    setIsOpen(false);
  };

  return (
    <>
      <input
        ref={inputRef}
        value={item.itemName}
        onFocus={() => loadProducts(item.itemName)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        onChange={handleChange}
        placeholder="Enter or select item"
        className="h-[42px] w-full rounded-md border border-stone-200 px-2 outline-none focus:border-[#c5a059]"
      />
      {isOpen && products.length > 0 && (
        <div
          style={menuPosition}
          className="fixed z-[110] max-h-44 overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-xl"
        >
          {products.map((product) => (
            <button
              key={`${product.name}-${product.hsnsac}`}
              type="button"
              onMouseDown={() => selectProduct(product)}
              className="block w-full border-0 bg-white px-3 py-2 text-left hover:bg-[#fbf5e7] cursor-pointer"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-semibold text-stone-800">
                  {product.name}
                </span>
                {product.availableQuantity != null && (
                  <span className="shrink-0 text-[9px] font-normal text-stone-400">
                    Qty: {product.availableQuantity}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
