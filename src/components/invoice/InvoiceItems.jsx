import { Hash, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Button from '../common/Button.jsx';
import Dropdown from '../common/Dropdown.jsx';
import SerialNumberModal from '../common/bills/SerialNumberModal.jsx';


// Create empty row
function createInvoiceItem() {
  return {
    id: crypto.randomUUID(),
    itemName: '',
    serialNumbers: [],
    description: '',
    partNumber: '',
    quantity: 1,
    unit: 'NONE',
    price: 0,
    tax: 0,
    cess: 0,
  };
}


const inputClass =
  'h-[42px] w-full rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-800 outline-none focus:border-[#c5a059]';



const unitOptions = [
  { value: 'NONE', label: 'NONE' },
  { value: 'PCS', label: 'PCS' },
  { value: 'BOX', label: 'BOX' },
  { value: 'KG', label: 'KG' },
  { value: 'MTR', label: 'MTR' },
  { value: 'LTR', label: 'LTR' },
  { value: 'SET', label: 'SET' },
  { value: 'DOZEN', label: 'DOZEN' },
  { value: 'BUNDLE', label: 'BUNDLE' },
];



// Format amount
function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


export default function InvoiceItems({
  items,
  onItemsChange,
  products = [],
  gstSlabs,
  isSameState,
}) {
  const [serialItemId, setSerialItemId] = useState(null);


  // Update one field of one item
  function updateItem(id, field, value) {
    onItemsChange((currentItems) => {
      return currentItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }

        return item;
      });
    });
  }


  // Remove row
  function removeItem(id) {
    if (items.length === 1) {
      return;
    }

    onItemsChange((currentItems) => {
      return currentItems.filter((item) => item.id !== id);
    });
  }


  // Add new row
  function addItem() {
    onItemsChange((currentItems) => {
      return [
        ...currentItems,
            createInvoiceItem(),
      ];
    });
  }


  // Products that can have serial numbers
  const serialProducts = items.filter((item) => {
    const hasName = item.itemName.trim() !== '';
    const hasQuantity = Number(item.quantity) > 0;

    return hasName && hasQuantity;
  });


  // Check whether any product has missing serial numbers
  const hasSerialMismatch = serialProducts.some((item) => {
    return item.serialNumbers.length !== Number(item.quantity);
  });


  // Open serial number modal
  function openSerialModal() {
    if (serialProducts.length === 0) {
      return;
    }

    setSerialItemId(serialProducts[0].id);
  }


  // Find currently selected serial product
  const serialItem = items.find((item) => {
    return item.id === serialItemId;
  });


  // GST dropdown options
  const gstOptions = gstSlabs.map((slab) => {
    return {
      value: String(slab.percentage),
      label: slab.name || `${slab.percentage}%`,
    };
  });

  const productOptions = products.map((product) => ({
    value: product.name,
    label: product.name,
  }));

  function selectProduct(id, productName) {
    const product = products.find((item) => item.name === productName);

    onItemsChange((currentItems) => currentItems.map((item) => (
      item.id === id
        ? {
            ...item,
            itemName: productName,
            price: product?.sellingPricePerUnit ?? product?.currentSellingPrice ?? item.price,
          }
        : item
    )));
  }


  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">

      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">

        <h2 className="m-0 text-sm font-bold text-stone-900">
          Items
        </h2>

        <button
          type="button"
          onClick={openSerialModal}
          disabled={serialProducts.length === 0}
          className={`
            flex items-center gap-2 rounded-xl px-3 py-2 text-left
            transition hover:bg-stone-50
            disabled:cursor-not-allowed disabled:opacity-40
            ${
              hasSerialMismatch
                ? 'serial-attention'
                : 'border border-transparent bg-transparent'
            }
          `}
        >
          <Hash
            size={14}
            className="text-[#8c6723]"
          />

          <span>
            <span className="block text-xs font-semibold text-stone-700">
              Serial Numbers
            </span>

            <span className="block text-[10px] text-stone-400">
              Add by product
            </span>
          </span>
        </button>

      </div>


      {/* Items table */}
      <div className="overflow-x-auto pb-2">

        <table className="w-full min-w-[1450px] border-collapse text-left text-xs">

          <thead className="bg-stone-50 text-stone-500">
            <tr>
              {[
                '#',
                'Item',
                'Description',
                'Part Number',
                'Qty',
                'Unit',
                'Price/Unit',
                'Taxable Value',
                'GST',
                ...(isSameState ? ['CGST', 'SGST'] : ['IGST']),
                'Add Cess',
                'Amount',
                '',
              ].map((heading) => (
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

              // Calculations
              const quantity = Number(item.quantity || 0);
              const price = Number(item.price || 0);
              const gstRate = Number(item.tax || 0);
              const cessRate = Number(item.cess || 0);

              const taxableValue = quantity * price;

              const gstAmount =
                (taxableValue * gstRate) / 100;

              const cessAmount =
                (taxableValue * cessRate) / 100;

              const totalAmount =
                taxableValue +
                gstAmount +
                cessAmount;


              return (
                <tr
                  key={item.id}
                  className="border-b border-stone-100 text-stone-700"
                >

                  {/* Number */}
                  <td className="px-2 py-2">
                    {index + 1}
                  </td>


                  {/* Item */}
                  <td className="min-w-52 px-2 py-2">
                    <Dropdown
                      name="itemName"
                      value={item.itemName}
                      options={productOptions}
                      onChange={(event) => selectProduct(item.id, event.target.value)}
                      placeholder="Enter item"
                    />
                  </td>


                  {/* Description */}
                  <td className="min-w-44 px-2 py-2">
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Description"
                      className={inputClass}
                    />
                  </td>


                  {/* Part Number */}
                  <td className="px-2 py-2">
                    <input
                      value={item.partNumber}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'partNumber',
                          e.target.value
                        )
                      }
                      placeholder="Part number"
                      className={`${inputClass} w-28`}
                    />
                  </td>


                  {/* Quantity */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'quantity',
                          e.target.value
                        )
                      }
                      className={`${inputClass} w-16`}
                    />
                  </td>


                  {/* Unit */}
                  <td className="w-32 px-2 py-2">
                    <Dropdown
                      name="unit"
                      value={item.unit}
                      options={unitOptions}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'unit',
                          e.target.value
                        )
                      }
                    />
                  </td>


                  {/* Price */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'price',
                          e.target.value
                        )
                      }
                      className={`${inputClass} w-28`}
                    />
                  </td>


                  {/* Taxable Value */}
                  <td className="whitespace-nowrap px-2 py-2 font-semibold">
                    ₹{formatMoney(taxableValue)}
                  </td>


                  {/* GST */}
                  <td className="w-28 px-2 py-2">
                    <Dropdown
                      name="tax"
                      value={String(item.tax)}
                      options={gstOptions}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'tax',
                          e.target.value
                        )
                      }
                      placeholder="Select GST"
                    />
                  </td>


                  {/* GST Amount */}
                  {isSameState ? (
                    <>
                      <td className="whitespace-nowrap px-2 py-2">
                        ₹{formatMoney(gstAmount / 2)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2">
                        ₹{formatMoney(gstAmount / 2)}
                      </td>
                    </>
                  ) : (
                    <td className="whitespace-nowrap px-2 py-2">
                      ₹{formatMoney(gstAmount)}
                    </td>
                  )}


                  {/* Cess */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.cess}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'cess',
                          e.target.value
                        )
                      }
                      className={`${inputClass} w-20`}
                    />
                  </td>


                  {/* Total */}
                  <td className="whitespace-nowrap px-2 py-2 font-semibold">
                    ₹{formatMoney(totalAmount)}
                  </td>


                  {/* Delete */}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="
                        border-0 bg-transparent p-1
                        text-stone-400
                        hover:text-red-500
                        disabled:opacity-30
                      "
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>

                </tr>
              );
            })}

          </tbody>
        </table>

      </div>


      {/* Add Row */}
      <Button
        variant="unstyled"
        icon={Plus}
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold"
      >
        Add Row
      </Button>


      {/* Serial Number Modal */}
      {serialItem && (
        <SerialNumberModal
          key={`${serialItem.id}-${serialItem.quantity}`}

          productName={serialItem.itemName}

          quantity={Number(serialItem.quantity)}

          serialNumbers={serialItem.serialNumbers}

          products={serialProducts.map((item) => {
            return {
              id: item.id,
              name: item.itemName,
            };
          })}

          selectedProductId={serialItem.id}

          onProductChange={setSerialItemId}

          onSave={(serialNumbers) => {
            updateItem(
              serialItem.id,
              'serialNumbers',
              serialNumbers
            );
          }}

          onClose={() => {
            setSerialItemId(null);
          }}
        />
      )}

    </section>
  );
}
