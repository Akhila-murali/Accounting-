import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StockTable from '../stock/StockTable.jsx';
import { getStockSummary } from '../../services/inventory.js';
import { getManufacturingStockSummary } from '../../services/manufacturing.js';

export default function InventoryStock({
  search = '',
  statusFilter = 'All',
  sortOrder = 'Newest',
  onItemsLoaded,
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const [response, manufacturedResponse] = await Promise.all([
          getStockSummary(),
          getManufacturingStockSummary(),
        ]);
        if (response?.success === false) throw new Error(response.message);

        const manufacturedItems = manufacturedResponse?.data || [];
        const stockItems = (response?.data || []).filter(
          (item) => Number(item.purchasedQuantity || 0) > 0 ||
            !manufacturedItems.some((manufactured) => manufactured.itemKey === item.itemKey)
        ).reverse();

        setItems(stockItems);
        onItemsLoaded?.(stockItems);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load stock.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [onItemsLoaded]);

  const searchText = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchText) ||
      item.hsnsac?.toLowerCase().includes(searchText) ||
      item.manufacturerName?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === 'All' ||
      item.stockStatus === statusFilter ||
      (statusFilter === 'HighStock' && ['InStock', 'OverStock'].includes(item.stockStatus));
    return matchesSearch && matchesStatus;
  });
  const displayedItems = sortOrder === 'Oldest' ? [...filteredItems].reverse() : filteredItems;

  return (
    <StockTable
      items={displayedItems}
      loading={loading}
      error={error}
      onRowClick={(item) => navigate(`/products/${item.itemKey}/history`)}
    />
  );
}
