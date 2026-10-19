import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';
import ManufacturedProductDetails from '../../components/manufacturing/ManufacturedProductDetails.jsx';
import MaterialSelectionSection from '../../components/manufacturing/MaterialSelectionSection.jsx';
import ManufacturingCostSummary from '../../components/manufacturing/ManufacturingCostSummary.jsx';
import { getCompanies } from '../../services/company.js';
import { getPurchaseLookups } from '../../services/purchase.js';
import { createManufacturing } from '../../services/manufacturing.js';


const initialProduct = {
  name: '',
  description: '',
  hsnsac: '',
  unit: '',
  quantity: '',
  sellingPricePerUnit: '',
  manufacturedByCompanyId: '',
  manufacturingDate: new Date().toISOString().split('T')[0],
  serialNumbers: [],
};

export default function Manufacture() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [product, setProduct] = useState(initialProduct);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [savedManufacturing, setSavedManufacturing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [toast, setToast] = useState(null);


  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [companyResponse, lookupResponse] = await Promise.all([
          getCompanies(),
          getPurchaseLookups(),
        ]);

        if (companyResponse?.success) {
          setCompanies(companyResponse.data || []);
        }

        if (lookupResponse?.success) {
          setUnits(lookupResponse.data?.units || []);
        }
      } catch {
        setCompanies([]);
        setUnits([]);
      }
    };

    loadFormOptions();
  }, []);


  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProduct((current) => {
      if (name !== 'quantity') {
        return { ...current, [name]: value };
      }

      const quantity = Math.max(0, Number(value || 0));
      const serialNumbers = current.serialNumbers.slice(0, quantity);

      return {
        ...current,
        quantity: value,
        serialNumbers,
      };
    });
  };


  const saveSerialNumbers = (serialNumbers) => {
    setProduct((current) => ({
      ...current,
      serialNumbers,
    }));
  };

  const materialCost = materials.reduce(
    (total, item) =>
      total + Number(
        item.materialCost ?? item.averagePurchasePrice ?? 0
      ),
    0
  );


  const saveManufacturing = async () => {
    const stockUnitIds = materials.flatMap(
      (material) => material.stockUnitIds || []
    );

    const expenseIds = expenses.map(
      (expense) => expense.id
    );

    const serialNumbers = product.serialNumbers.map(
      (serial) => serial.trim()
    );

    if (
      !product.name.trim() ||
      !product.hsnsac.trim() ||
      !product.unit ||
      Number(product.quantity) <= 0 ||
      Number(product.sellingPricePerUnit) <= 0 ||
      !product.manufacturedByCompanyId ||
      !product.manufacturingDate
    ) {
      setToast({
        message: 'Complete all required product fields.',
        type: 'error',
      });
      return;
    }

    if (stockUnitIds.length === 0) {
      setToast({
        message: 'Select at least one material stock unit.',
        type: 'error',
      });
      return;
    }

    if (
      serialNumbers.length !== Number(product.quantity) ||
      serialNumbers.some((serial) => !serial)
    ) {
      setToast({
        message: 'Enter one serial number for every output item.',
        type: 'error',
      });
      return;
    }

    const request = {
      name: product.name.trim(),
      description: product.description.trim() || null,
      hsnsac: product.hsnsac.trim(),
      unit: Number(product.unit) || product.unit,
      quantity: Number(product.quantity),
      sellingPricePerUnit: Number(product.sellingPricePerUnit),
      manufacturedByCompanyId: Number(product.manufacturedByCompanyId),
      manufacturingDate: `${product.manufacturingDate}T00:00:00Z`,
      stockUnitIds,
      expenseIds,
      serialNumbers,
    };

    try {
      setIsSaving(true);

      const response = await createManufacturing(request);

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Unable to save manufacturing.');
      }

      setSavedManufacturing(response.data);
      setToast({
        message: response.message || 'Manufacturing saved successfully.',
        type: 'success',
      });
      setShowSaveConfirm(false);
      navigate('/products?tab=manufactured');
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Unable to save manufacturing.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-sans text-stone-800">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="m-0 text-2xl font-bold text-stone-900">Manufacture</h1>
        <p className="mb-0 mt-1 text-sm text-stone-500">
          Create a product from available inventory materials.
        </p>
      </div>

      <ManufacturedProductDetails
        product={product}
        companies={companies}
        units={units}
        onChange={handleProductChange}
        onSerialsSave={saveSerialNumbers}
      />
      <MaterialSelectionSection
        materials={materials}
        setMaterials={setMaterials}
        materialCost={materialCost}
      />
      <ManufacturingCostSummary
        materialCost={materialCost}
        expenses={expenses}
        setExpenses={setExpenses}
        savedManufacturing={savedManufacturing}
      />

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button
          icon={Save}
          onClick={() => setShowSaveConfirm(true)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      {showSaveConfirm && (
        <ConfirmationModal
          title="Save Manufacturing?"
          message="Do you want to save this manufacturing record?"
          confirmLabel="Yes, Save"
          isSubmitting={isSaving}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={saveManufacturing}
        />
      )}
    </div>
  );
}
