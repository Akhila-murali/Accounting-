import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login.jsx';
import Layout from './components/common/Layout.jsx';

import Dashboard from './pages/dashboard/Dashboard.jsx';
import Company from './pages/company/Company.jsx';
import User from './pages/users/User.jsx';
import TermsAndConditions from './pages/terms/TermsAndConditions.jsx';

import Quotation from './pages/quotation/Quotation.jsx';
import QuotationList from './pages/quotation/QuotationList.jsx';

import Purchase from './pages/purchase/Purchase.jsx';
import PurchaseList from './pages/purchase/PurchaseList.jsx';

import Inventory from './pages/inventory/Inventory.jsx';
import InventoryHistory from './pages/inventory/InventoryHistory.jsx';

import Expense from './pages/expenses/Expense.jsx';
import Manufacture from './pages/manufacturing/Manufacture.jsx';
import Prefix from './pages/settings/Prefix.jsx';
import NotFound from './pages/not-found/NotFound.jsx';
import Invoice from './pages/invoice/Invoice.jsx';
import ProformaInvoiceList from './pages/invoice/ProformaInvoiceList.jsx';
import SalesInvoiceList from './pages/invoice/SalesInvoiceList.jsx';


export default function App() {
  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const backgroundLocation =
    location.state?.backgroundLocation;


  const closeSettingsModal = () => {
    const returnPath =
      location.state?.settingsReturnTo ||
      '/dashboard';

    navigate(returnPath);
  };


  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-stone-200 border-t-[#8c6723]" />
        </div>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }


  return (
    <>
      <Layout>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quotations" element={<Quotation />} />
        <Route path="/quotations/:id" element={<Quotation />} />
        <Route path="/quotation-list" element={<QuotationList />} />
        <Route path="/proforma-invoices" element={<ProformaInvoiceList />} />
        <Route path="/proforma-invoices/new" element={<Invoice key="proforma-new" />} />
        
<Route
  path="/proforma-invoices/drafts/:draftId"
  element={<Invoice key="proforma-draft" />}
/>

        <Route path="/proforma-invoices/:id" element={<Invoice key="proforma-details" />} />
        <Route path="/sales-invoices" element={<SalesInvoiceList />} />
        <Route path="/sales-invoices/new" element={<Invoice key="sales-new" />} />
        <Route path="/sales-invoices/:id" element={<Invoice key="sales-details" />} />
        <Route path="/purchase" element={<PurchaseList />} />
        <Route path="/purchase/new" element={<Purchase />} />
        <Route path="/purchase/:id" element={<Purchase />} />
        <Route path="/products" element={<Inventory />} />
        <Route path="/products/:id/history" element={<InventoryHistory />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/manufacture" element={<Manufacture />} />
        <Route path="/companies" element={<Company />} />
        <Route path="/users" element={<User />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/settings" element={<Prefix onClose={closeSettingsModal} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>


      {backgroundLocation &&
        location.pathname === '/settings' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 sm:p-6"
          >
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl">
              <Prefix onClose={closeSettingsModal} />
            </div>
          </div>
        )}
    </>
  );
}
