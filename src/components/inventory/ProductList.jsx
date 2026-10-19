import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import DeleteConfirmationModal from '../common/DeleteConfirmationModal.jsx';
import TableEmptyState from '../common/TableEmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Toast from '../common/Toast.jsx';
import { deleteProduct, getAllProducts, getProductDeletePreview } from '../../services/product.js';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ProductList({ search = '' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const searchText = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchText) ||
    product.serialNumber?.toLowerCase().includes(searchText) ||
    product.hsnsac?.toLowerCase().includes(searchText) ||
    product.manufacturerName?.toLowerCase().includes(searchText)
  );

  const prepareDelete = async (product) => {
    try {
      const response = await getProductDeletePreview(product.stockUnitId);
      if (!response?.success) throw new Error(response?.message);
      setPendingDelete({ ...product, ...response.data });
    } catch (requestError) {
      setToast({
        type: 'error',
        message: requestError.response?.data?.message || requestError.message || 'Unable to preview product deletion.',
      });
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteProduct(pendingDelete.stockUnitId);
      if (!response?.success) throw new Error(response?.message);
      setProducts((current) => current.filter((product) => product.stockUnitId !== pendingDelete.stockUnitId));
      setPendingDelete(null);
      setToast({ type: 'success', message: response.message || 'Product deleted successfully.' });
    } catch (requestError) {
      setToast({
        type: 'error',
        message: requestError.response?.data?.message || requestError.message || 'Unable to delete product.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getAllProducts();

        if (response?.success === false) {
          throw new Error(response.message);
        }

        setProducts(Array.isArray(response?.data) ? response.data : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          'Unable to load products.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="-mx-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-stone-200 bg-white font-sans text-stone-800 shadow-xs sm:mx-0 sm:w-full sm:rounded-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div
        className="w-full max-w-full overflow-x-auto overscroll-x-contain"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth <= container.clientWidth) return;

          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead className="bg-stone-50 text-[11px] uppercase text-stone-500">
            <tr>
              {[
                'Serial Number',
                'Product',
                'HSN/SAC',
                'Unit',
                'Manufacturer',
                'Purchase Price',
                'Selling Price',
                'Actions',
              ].map((heading) => (
                <th key={heading} className="border-b border-stone-200 px-3 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-sm text-stone-500">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-sm text-rose-600">
                  {error}
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8">
                  <TableEmptyState title="No products found" message="Inventory products will appear here." />
                </td>
              </tr>
            ) : filteredProducts.map((product) => (
              <tr key={product.stockUnitId} className="border-b border-stone-100 text-sm text-stone-700 last:border-b-0">
                <td className="px-3 py-3">{product.serialNumber || '—'}</td>
                <td className="px-3 py-3 font-medium text-stone-900">{product.name}</td>
                <td className="px-3 py-3">{product.hsnsac || '—'}</td>
                <td className="px-3 py-3">{product.defaultUnit || '—'}</td>
                <td className="px-3 py-3">{product.manufacturerName || '—'}</td>
                <td className="px-3 py-3">{money(product.currentPurchasePrice)}</td>
                <td className="px-3 py-3">{money(product.currentSellingPrice)}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    title="Edit product"
                    aria-label={`Edit ${product.name}`}
                    className="mr-1 border-0 bg-transparent p-1.5 text-stone-400 hover:text-[#8c6723] cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => prepareDelete(product)}
                    title="Delete product"
                    aria-label={`Delete ${product.name}`}
                    className="border-0 bg-transparent p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <DeleteConfirmationModal
          title="Delete Product"
          message={pendingDelete.warning || `Delete ${pendingDelete.name}?`}
          isDeleting={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
