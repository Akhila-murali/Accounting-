import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ManufacturedStockTable from '../stock/ManufacturedStockTable.jsx';
import { getManufacturingStockSummary } from '../../services/manufacturing.js';

export default function ManufacturedStock({ search = '', statusFilter = 'All', onItemsLoaded }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await getManufacturingStockSummary();
        if (response?.success === false) throw new Error(response.message);
        const stockItems = [...(response?.data || [])].reverse();
        setItems(stockItems);
        onItemsLoaded?.(stockItems);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load manufactured goods.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [onItemsLoaded]);

  const searchText = search.trim().toLowerCase();
  const displayedItems = items.filter((item) => {
    const matchesSearch = item.itemKey?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === 'All' ||
      item.stockStatus === statusFilter ||
      (statusFilter === 'HighStock' && ['InStock', 'OverStock'].includes(item.stockStatus));

    return matchesSearch && matchesStatus;
  });

  return (
    <ManufacturedStockTable
      items={displayedItems}
      loading={loading}
      error={error}
      onRowClick={(item) => navigate(`/products/${encodeURIComponent(item.itemKey)}/history?type=manufactured`)}
    />
  );
}
