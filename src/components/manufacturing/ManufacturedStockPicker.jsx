import { useEffect, useState } from 'react';

import ManufacturedStockTable from '../stock/ManufacturedStockTable.jsx';
import { getManufacturingStockSummary } from '../../services/manufacturing.js';

export default function ManufacturedStockPicker({ search = '', onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await getManufacturingStockSummary();
        if (response?.success === false) throw new Error(response.message);
        setItems([...(response?.data || [])].reverse());
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load manufactured goods.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const searchText = search.trim().toLowerCase();
  const displayedItems = items.filter((item) =>
    Number(item.availableQuantity || 0) > 0 &&
    item.itemKey?.toLowerCase().includes(searchText)
  );

  return <ManufacturedStockTable items={displayedItems} loading={loading} error={error} onRowClick={onSelect} />;
}
