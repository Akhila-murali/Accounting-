import { useEffect, useState } from 'react';

import StockTable from '../stock/StockTable.jsx';
import { getStockSummary } from '../../services/inventory.js';
import { getManufacturingStockSummary } from '../../services/manufacturing.js';

export default function StockPicker({ search = '', onSelect }) {
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
        setItems((response?.data || []).filter(
          (item) => Number(item.purchasedQuantity || 0) > 0 ||
            !manufacturedItems.some((manufactured) => manufactured.itemKey === item.itemKey)
        ).reverse());
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load stock.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const searchText = search.trim().toLowerCase();
  const displayedItems = items.filter((item) =>
    Number(item.availableQuantity || 0) > 0 &&
    (
      item.name?.toLowerCase().includes(searchText) ||
      item.hsnsac?.toLowerCase().includes(searchText) ||
      item.manufacturerName?.toLowerCase().includes(searchText)
    )
  );

  return <StockTable items={displayedItems} loading={loading} error={error} onRowClick={onSelect} />;
}
