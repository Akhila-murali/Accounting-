import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const getBreadcrumbs = (pathname, search) => {
  if (pathname === '/dashboard') return [];

  if (pathname === '/quotation-list') {
    return [{ label: 'Sales' }, { label: 'Quotations' }];
  }

  if (pathname.startsWith('/quotations')) {
    const isDetails = pathname !== '/quotations' || search.includes('draftId=');
    return [
      { label: 'Sales' },
      { label: 'Quotations', path: '/quotation-list' },
      { label: isDetails ? 'Quotation Details' : 'Add Quotation' },
    ];
  }

  if (pathname === '/proforma-invoices') {
    return [{ label: 'Sales' }, { label: 'Proforma Invoices' }];
  }

  if (pathname.startsWith('/proforma-invoices/')) {
    return [
      { label: 'Sales' },
      { label: 'Proforma Invoices', path: '/proforma-invoices' },
      { label: pathname === '/proforma-invoices/new' ? 'Add Proforma Invoice' : 'Proforma Invoice Details' },
    ];
  }

  if (pathname === '/sales-invoices') {
    return [{ label: 'Sales' }, { label: 'Sales Invoices' }];
  }

  if (pathname.startsWith('/sales-invoices/')) {
    return [
      { label: 'Sales' },
      { label: 'Sales Invoices', path: '/sales-invoices' },
      { label: pathname === '/sales-invoices/new' ? 'Add Sales Invoice' : 'Sales Invoice Details' },
    ];
  }

  if (pathname === '/purchase') {
    return [{ label: 'Purchases' }, { label: 'Purchase Bills' }];
  }

  if (pathname.startsWith('/purchase/')) {
    return [
      { label: 'Purchases' },
      { label: 'Purchase Bills', path: '/purchase' },
      { label: pathname === '/purchase/new' ? 'Add Purchase Bill' : 'Purchase Details' },
    ];
  }

  if (pathname.startsWith('/products/')) {
    return [
      { label: 'Operations' },
      { label: 'Inventory', path: '/products' },
      { label: 'Inventory History' },
    ];
  }

  const pageBreadcrumbs = {
    '/products': ['Operations', 'Inventory'],
    '/manufacture': ['Operations', 'Manufacture'],
    '/expense': ['Finance', 'Expense'],
    '/companies': ['Management', 'Companies'],
    '/users': ['Management', 'Users'],
    '/terms': ['Management', 'Terms & Conditions'],
    '/settings': ['Settings'],
  };

  return (pageBreadcrumbs[pathname] || []).map((label) => ({ label }));
};

export default function Breadcrumbs() {
  const location = useLocation();
  const items = getBreadcrumbs(location.pathname, location.search);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-brand-gold/70">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight size={13} className="text-stone-300" />}
          {item.path ? (
            <Link to={item.path} className="transition-colors hover:text-brand-gold">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? 'font-medium text-brand-gold' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
