import { useParams, useSearchParams } from 'react-router-dom';

import PurchaseHistory from '../../components/inventory/PurchaseHistory.jsx';
import ManufacturingHistory from '../../components/manufacturing/ManufacturingHistory.jsx';

export default function InventoryHistory() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  return searchParams.get('type') === 'manufactured'
    ? <ManufacturingHistory itemKey={id} />
    : <PurchaseHistory itemKey={id} />;
}
