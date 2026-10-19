import { useState } from 'react';
import { IndianRupee, Search, TriangleAlert } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import InventoryStock from '../../components/inventory/InventoryStock.jsx';
import ManufacturedStock from '../../components/inventory/ManufacturedStock.jsx';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [stockItems, setStockItems] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');
  const [statusFilter, setStatusFilter] = useState('All');


  const lowStockCount = stockItems.filter((item) => {
    return (
      item.stockStatus === 'LowStock' ||
      item.stockStatus === 'OutOfStock'
    );
  }).length;


  const stockValue = stockItems.reduce((total, item) => {
    if (activeTab === 'manufactured') {
      return total + Number(item.totalAvailableStockValue || 0);
    }

    const quantity = Number(item.availableQuantity || 0);
    const averagePrice = Number(item.averagePurchasePrice || 0);

    return total + quantity * averagePrice;
  }, 0);


  return (
    <div className="flex min-w-0 flex-col gap-4 font-sans text-stone-800 sm:gap-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-stone-900">
          Inventory
        </h1>

        <p className="mb-0 mt-1 text-sm text-stone-500">
          View current stock and manage inventory products.
        </p>
      </div>


      <div className="hidden grid-cols-2 gap-3 sm:grid">
        <StatCard
          label="Stock Value (At Cost)"
          value={stockValue}
          subtext="Current inventory value"
          icon={<IndianRupee size={19} />}
          formatValue={(amount) => `₹${amount.toLocaleString('en-IN')}`}
        />

        <StatCard
          label="Low / Out of Stock"
          value={lowStockCount}
          subtext="Items requiring attention"
          icon={<TriangleAlert size={19} />}
        />
      </div>


      <div className="flex border-b border-stone-200">
        <Button
          variant="unstyled"
          onClick={() => setActiveTab('materials')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold tracking-wide ${
            activeTab === 'materials'
              ? 'border-[#8c6723] text-[#8c6723]'
              : 'border-transparent text-stone-400'
          }`}
        >
          MATERIALS
        </Button>

        <Button
          variant="unstyled"
          onClick={() => setActiveTab('manufactured')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold tracking-wide ${
            activeTab === 'manufactured'
              ? 'border-[#8c6723] text-[#8c6723]'
              : 'border-transparent text-stone-400'
          }`}
        >
          MANUFACTURED GOODS
        </Button>
      </div>


      <div className="flex w-full max-w-xl flex-row gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search stock..."
            className="h-[42px] w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div className="w-36 shrink-0 sm:w-44">
          <Dropdown
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'All', label: 'All Stock' },
              { value: 'LowStock', label: 'Low Stock' },
              { value: 'OutOfStock', label: 'Out of Stock' },
              { value: 'HighStock', label: 'High Stock' },
            ]}
          />
        </div>
      </div>


      {activeTab === 'materials' ? (
        <InventoryStock
          search={search}
          statusFilter={statusFilter}
          onItemsLoaded={setStockItems}
        />
      ) : (
        <ManufacturedStock
          search={search}
          statusFilter={statusFilter}
          onItemsLoaded={setStockItems}
        />
      )}
    </div>
  );
}
