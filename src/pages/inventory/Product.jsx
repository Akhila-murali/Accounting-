/* Product page temporarily disabled. Kept for future use.
import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, PackagePlus, X } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import Toast from '../../components/common/Toast.jsx';
import ProductDetails from '../../components/product/ProductDetails.jsx';
import ProductTable from '../../components/product/ProductTable.jsx';
import { getCompanies } from '../../services/company.js';
import {
  getPurchaseLookups,
  getStockSummary,
} from '../../services/purchase.js';
import { createProduct } from '../../services/product.js';

const emptyForm = {
  name: '',
  hsnsac: '',
  defaultUnit: '',
  manufacturedByCompanyId: '',
  quantity: 1,
  serialNumbers: '',
  pricePerUnit: 0,
  sellingPricePerUnit: 0,
};

const mapProduct = (product) => ({
  ...product,
  id: product.stockUnitId,
  hsnSac: product.hsnsac,
  qty: product.quantity,
  pricePerUnit: product.currentPurchasePrice,
  sellingPricePerUnit: product.currentSellingPrice,
  status: product.status || 'Available',
  total:
    Number(product.quantity || 0) *
    Number(product.currentPurchasePrice || 0),
});

export default function Product() {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadProductData = async () => {
    try {
      setLoading(true);

      const [productResponse, companyResponse, lookupResponse] =
        await Promise.all([
          getStockSummary(),
          getCompanies(),
          getPurchaseLookups(),
        ]);

      if (productResponse?.success === false) {
        throw new Error(productResponse.message);
      }

      setProducts(
        Array.isArray(productResponse?.data)
          ? productResponse.data.map(mapProduct)
          : []
      );
      setCompanies(
        companyResponse?.success && Array.isArray(companyResponse.data)
          ? companyResponse.data
          : []
      );
      setUnits(lookupResponse?.data?.units || []);
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          'Failed to load products.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setFormErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      ...emptyForm,
      defaultUnit: units[0]?.value || '',
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const serialNumbers = formData.serialNumbers
      .split(',')
      .map((serial) => serial.trim())
      .filter(Boolean);

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.hsnsac.trim()) {
      errors.hsnsac = 'HSN/SAC is required';
    }

    if (!formData.defaultUnit) {
      errors.defaultUnit = 'Unit is required';
    }

    if (!formData.manufacturedByCompanyId) {
      errors.manufacturedByCompanyId = 'Manufacturer is required';
    }

    if (Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than zero';
    }

    if (Number(formData.pricePerUnit) < 0) {
      errors.pricePerUnit = 'Purchase price cannot be negative';
    }

    if (Number(formData.sellingPricePerUnit) < 0) {
      errors.sellingPricePerUnit = 'Selling price cannot be negative';
    }

    if (serialNumbers.length > Number(formData.quantity)) {
      errors.serialNumbers = 'Serial numbers cannot exceed quantity';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await createProduct({
        name: formData.name.trim(),
        hsnsac: formData.hsnsac.trim(),
        defaultUnit: formData.defaultUnit,
        manufacturedByCompanyId:
          Number(formData.manufacturedByCompanyId),
        quantity: Number(formData.quantity),
        serialNumbers: formData.serialNumbers
          .split(',')
          .map((serial) => serial.trim())
          .filter(Boolean),
        pricePerUnit: Number(formData.pricePerUnit),
        sellingPricePerUnit:
          Number(formData.sellingPricePerUnit),
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to add product.');
      }

      setIsAddOpen(false);
      showToast(response.message || 'Product added successfully.');
      await loadProductData();
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          'Failed to add product.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Product data must load once when the page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6 text-stone-800 relative">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 m-0">
            Products
          </h1>
          <p className="text-stone-500 text-sm m-0 mt-1">
            Manage your products and inventory.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={PackagePlus}>
          Add Product
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start w-full">
        <ProductTable
          products={products}
          loading={loading}
          selectedProduct={selectedProduct}
          isDetailsOpen={isDetailsOpen}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
        />

        {isDetailsOpen && selectedProduct && (
          <div className="w-full lg:w-1/2">
            <ProductDetails
              product={selectedProduct}
              onClose={() => setIsDetailsOpen(false)}
            />
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <PackagePlus size={16} className="text-[#8c6723]" />
                <h2 className="text-base text-stone-900 m-0">
                  Add New Product
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 border-0 bg-transparent text-stone-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              id="productForm"
              onSubmit={handleSave}
              className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <FormField
                label="Product Name"
                name="name"
                value={formData.name}
                error={formErrors.name}
                onChange={handleInputChange}
              />
              <FormField
                label="HSN/SAC"
                name="hsnsac"
                value={formData.hsnsac}
                error={formErrors.hsnsac}
                onChange={handleInputChange}
              />

              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider mb-1.5 block">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  name="defaultUnit"
                  value={formData.defaultUnit}
                  onChange={handleInputChange}
                  options={units}
                />
                <FieldError message={formErrors.defaultUnit} />
              </div>

              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider mb-1.5 block">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  name="manufacturedByCompanyId"
                  value={formData.manufacturedByCompanyId}
                  onChange={handleInputChange}
                  options={companies.map((company) => ({
                    value: String(company.id),
                    label: company.companyName,
                  }))}
                />
                <FieldError message={formErrors.manufacturedByCompanyId} />
              </div>

              <FormField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                error={formErrors.quantity}
                onChange={handleInputChange}
              />
              <FormField
                label="Purchase Price"
                name="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                error={formErrors.pricePerUnit}
                onChange={handleInputChange}
              />
              <FormField
                label="Selling Price"
                name="sellingPricePerUnit"
                type="number"
                value={formData.sellingPricePerUnit}
                error={formErrors.sellingPricePerUnit}
                onChange={handleInputChange}
              />
              <FormField
                label="Serial Numbers"
                name="serialNumbers"
                value={formData.serialNumbers}
                error={formErrors.serialNumbers}
                placeholder="SER001, SER002"
                required={false}
                onChange={handleInputChange}
              />
            </form>

            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="productForm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  error,
  placeholder,
  required = true,
  onChange,
}) {
  return (
    <div>
      <label className="text-xs text-stone-500 uppercase tracking-wider mb-1.5 block">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        min={type === 'number' ? '0' : undefined}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-stone-50/50 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-500/20'
            : 'border-stone-200 focus:ring-[#c5a059]/20'
        }`}
      />
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle size={12} /> {message}
    </p>
  );
}
*/
