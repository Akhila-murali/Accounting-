import { useState } from 'react';

import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Home,
  Building2,
  ShoppingCart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Package,
  Factory,
  BadgeIndianRupee,
  BookOpenCheck,
  FileStack,
  MessageSquareQuote,
  ReceiptText,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Button from './Button.jsx';


export default function Sidebar({
  isMobileSidebarOpen,
  onCloseMobile,
  isCollapsed,
  onCollapsedChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const collapsed =
    isCollapsed &&
    !isMobileSidebarOpen;


  const isSettingsRoute =
    location.pathname === '/settings';


  const menuGroups = [
    {
      name: 'Sales',
      items: [
        {
          path: '/quotation-list',
          name: 'Quotations',
          icon: MessageSquareQuote,
        },
        {
          path: '/proforma-invoices',
          name: 'Proforma Invoices',
          icon: FileStack,
        },
        {
          path: '/sales-invoices',
          name: 'Sales Invoices',
          icon: ReceiptText,
        },
      ],
    },
    {
      name: 'Purchases',
      items: [
        {
          path: '/purchase-orders',
          name: 'Purchase Orders',
          icon: ShoppingCart,
          placeholder: true,
        },
        {
          path: '/purchase',
          name: 'Purchase Bills',
          icon: ReceiptText,
        },
      ],
    },
    {
      name: 'Operations',
      items: [
        {
          path: '/manufacture',
          name: 'Manufacture',
          icon: Factory,
        },
        {
          path: '/products',
          name: 'Inventory',
          icon: Package,
        },
      ],
    },
    {
      name: 'Finance',
      items: [
        {
          path: '/expense',
          name: 'Expense',
          icon: BadgeIndianRupee,
        },
      ],
    },
    {
      name: 'Management',
      items: [
        {
          path: '/companies',
          name: 'Companies',
          icon: Building2,
        },
        {
          path: '/users',
          name: 'Users',
          icon: Users,
        },
        {
          path: '/terms',
          name: 'Terms & Conditions',
          icon: BookOpenCheck,
        },
      ],
    },
  ];


  const handleSettingsClick = () => {
    if (isSettingsRoute) {
      const returnPath =
        location.state?.settingsReturnTo ||
        '/dashboard';

      navigate(returnPath);

      return;
    }

    onCloseMobile();

    const currentPath =
      `${location.pathname}${location.search}`;

    navigate('/settings', {
      state: {
        settingsReturnTo: currentPath,
        backgroundLocation: location,
      },
    });
  };


  const handleLogout = async () => {
    setShowLogoutModal(false);

    try {
      await logout();
    } catch (error) {
      console.error(
        'Logout error:',
        error
      );
    } finally {
      navigate('/login');
    }
  };


  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 transition-opacity duration-300 lg:hidden"
          onClick={onCloseMobile}
        />
      )}


      <aside
className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-r-border-subtle bg-white py-4 shadow-xl transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:self-start lg:z-30 lg:shadow-none ${
          isMobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed
            ? 'w-20 px-3'
            : 'w-60 px-4'
        }`}
      >
        <Button
          variant="unstyled"
          type="button"
          onClick={() =>
            onCollapsedChange(
              !isCollapsed
            )
          }
          className="absolute -right-3 top-8 z-40 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 shadow-xs transition-colors hover:bg-stone-50 hover:text-stone-700 lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight size={12} />
          ) : (
            <ChevronLeft size={12} />
          )}
        </Button>


        {isMobileSidebarOpen && (
          <Button
            variant="unstyled"
            type="button"
            onClick={onCloseMobile}
            className="absolute right-6 top-6 z-30 cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 lg:hidden"
          >
            <X size={18} />
          </Button>
        )}


        <div
          className={`mb-5 flex min-w-0 items-center gap-3 border-b border-border-subtle px-2 pb-4 pt-1 ${
            collapsed
              ? 'justify-center'
              : 'flex-row'
          }`}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-gold-highlight/40 text-sm font-extrabold text-brand-gold shadow-xs"
            style={{ backgroundImage: 'var(--gradient-icon-gold)' }}
          >
            S
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h3 className="m-0 truncate text-sm font-bold leading-tight text-stone-900">
                Stride
              </h3>

              <p className="m-0 mt-0.5 truncate text-[9px] text-stone-400">
                Accounting Application
              </p>
            </div>
          )}
        </div>


        <nav className="no-scrollbar flex flex-grow flex-col gap-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium ${
                collapsed
                  ? 'mx-auto h-11 w-11 justify-center'
                  : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'border-l-2 border-brand-gold bg-brand-gold-light text-brand-dark'
                  : 'text-stone-600 hover:bg-stone-50'
              }`
            }
          >
            <Home size={17} className="shrink-0" />

            {!collapsed && (
              <span>Dashboard</span>
            )}
          </NavLink>


          {menuGroups.map((group) => (
            <div key={group.name} className={collapsed ? 'mt-1' : 'mt-4 first:mt-3'}>
              {!collapsed && (
                <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">
                  {group.name}
                </p>
              )}

              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      title={collapsed ? item.name : undefined}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center rounded-xl text-sm transition-colors ${
                          collapsed
                            ? 'mx-auto h-11 w-11 justify-center'
                            : 'gap-3 px-3 py-2 text-xs'
                        } ${
                          isActive && !item.placeholder
                            ? 'bg-brand-gold-light font-semibold text-brand-gold'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`
                      }
                    >
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`mt-3 border-t border-dashed border-border-subtle pt-2 ${collapsed ? '' : 'mx-2'}`}>
          <Button
            variant="unstyled"
            type="button"
            onClick={handleSettingsClick}
            className={`mb-0.5 flex items-center rounded-xl text-xs font-medium transition-colors ${
              collapsed
                ? 'mx-auto h-11 w-11 justify-center'
                : 'w-full gap-3 px-2 py-2'
            } ${
              isSettingsRoute
                ? 'bg-brand-gold-light text-brand-gold'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Settings size={17} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Button>

          <Button
            variant="unstyled"
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center rounded-xl text-xs font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600 ${
              collapsed
                ? 'mx-auto h-11 w-11 justify-center'
                : 'w-full gap-3 px-2 py-2'
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>


      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h4 className="m-0 text-lg font-bold text-stone-900">
              Confirm Logout
            </h4>

            <p className="m-0 mt-2 text-xs leading-relaxed text-stone-500">
              Are you sure you want to log out of your session?
              You will need to sign in again to access your account.
            </p>


            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="unstyled"
                type="button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="cursor-pointer rounded-xl border border-stone-200 bg-transparent px-4 py-2 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800"
              >
                Cancel
              </Button>

              <Button
                variant="unstyled"
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-xl border-none bg-[#8c6723] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#72521a]"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
