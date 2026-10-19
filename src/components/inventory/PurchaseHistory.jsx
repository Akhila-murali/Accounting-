import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../common/Button.jsx';
import InventoryItemDetailsModal from './InventoryItemDetailsModal.jsx';
import StockPurchaseHistoryTable from './StockPurchaseHistoryTable.jsx';
import { getPurchase } from '../../services/purchase.js';

export default function PurchaseHistory({ itemKey }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState('');


  const openItemDetails = async (record) => {
    setSelectedRecord(record); // for opening the modal
    setSelectedItem(null);
    setItemError('');
    setLoadingItem(true);

    try {
      const response = await getPurchase(record.purchaseBillId);
      const item = response?.data?.items?.find(
        (currentItem) => currentItem.id === record.purchaseBillItemId
      );
      if (!response?.success || !item) throw new Error(response?.message || 'Item details not found.');
      setSelectedItem(item); // for pass data to modal
    } catch (requestError) {
      setItemError(requestError.response?.data?.message || requestError.message || 'Unable to load item details.');
    } finally {
      setLoadingItem(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 font-sans text-stone-800">
      <Button variant="unstyled" 
      onClick={() => navigate('/products')} className="flex w-fit items-center gap-1.5 text-sm text-stone-500">
        <ArrowLeft size={15} /> Back
      </Button>
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#8c6723]">Material Purchase History</p>
        <h1 className="m-0 mt-1 text-2xl font-bold text-stone-900">{itemKey}</h1>
      </div>
      <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs">
        <div className="border-b border-stone-100 p-4">
          <div className="relative max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search purchase records..." className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-[#c5a059]" />
          </div>
        </div>
        <StockPurchaseHistoryTable itemKey={itemKey} search={search} onRecordClick={openItemDetails} />
      </section>

      {selectedRecord && (
        <InventoryItemDetailsModal item={selectedItem} record={selectedRecord} loading={loadingItem} error={itemError} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
