import { useEffect, useState } from 'react';
import { ChevronDown, Eye, Filter, Pencil, Plus, ReceiptText, Search, Trash2, X } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import TableEmptyState from '../../components/common/TableEmptyState.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';

import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenseLookups,
  getExpenses,
  updateExpense,
} from '../../services/expense.js';

const initialFormState = {
  type: '',
  amount: '',
  date: '',
  description: '',
  paymentMethod: '',
};

const formatExpense = (expense) => ({
  id: expense.id,
  type: expense.expenseType,
  amount: expense.amount,
  date: expense.expenseDate?.split('T')[0] || '',
  description: expense.description || '',
  paymentMethod: expense.paymentType,
});

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [modalMode, setModalMode] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchTerm = search.trim().toLowerCase();
  const visibleExpenses = expenses
    .filter((expense) =>
      expense.type?.toLowerCase().includes(searchTerm) ||
      expense.description?.toLowerCase().includes(searchTerm) ||
      expense.paymentMethod?.toLowerCase().includes(searchTerm)
    )
    .sort((first, second) => {
      const firstDate = new Date(first.date).getTime();
      const secondDate = new Date(second.date).getTime();
      return sortOrder === 'Newest' ? secondDate - firstDate : firstDate - secondDate;
    });

  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        const lookupsResponse = await getExpenseLookups();

        if (!lookupsResponse?.success) {
          throw new Error(
            lookupsResponse?.message || 'Failed to load expense lookups.'
          );
        }

        setExpenseTypes(lookupsResponse.data?.expenseTypes || []);
        setPaymentMethods(lookupsResponse.data?.paymentTypes || []);

        const expensesResponse = await getExpenses();

        if (!expensesResponse?.success) {
          throw new Error(
            expensesResponse?.message || 'Failed to load expenses.'
          );
        }

        const expenseList = (expensesResponse.data || []).map(formatExpense);
        setExpenses(expenseList);
      } catch (error) {
        setToast({
          message:
            error.response?.data?.message ||
            error.message ||
            'Failed to load expenses.',
          type: 'error',
        });
      }
    };

    loadExpenseData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setModalMode('add');
  };

  const handleOpenEdit = async (expense) => {
    try {
      const response = await getExpense(expense.id);

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to load expense.');
      }

      setFormData(formatExpense(response.data));
      setFormErrors({});
      setModalMode('edit');
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to load expense.',
        type: 'error',
      });
    }
  };

  const handleOpenView = async (expense) => {
    try {
      const response = await getExpense(expense.id);

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Failed to load expense.');
      }

      setSelectedExpense(formatExpense(response.data));
      setModalMode('view');
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to load expense.',
        type: 'error',
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.type) {
      errors.type = 'Expense type is required';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Enter a valid amount';
    }

    if (!formData.date) {
      errors.date = 'Expense date is required';
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const request = {
      expenseType: formData.type,
      amount: Number(formData.amount),
      expenseDate: formData.date,
      description: formData.description.trim() || null,
      paymentType: formData.paymentMethod,
    };

    try {
      setIsSaving(true);

      let response;

      if (modalMode === 'add') {
        response = await createExpense(request);
      } else {
        response = await updateExpense(formData.id, request);
      }

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to save expense.');
      }

      if (response.data) {
        const savedExpense = formatExpense(response.data);

        if (modalMode === 'add') {
          setExpenses((current) => [savedExpense, ...current]);
        } else {
          setExpenses((current) =>
            current.map((expense) =>
              expense.id === savedExpense.id ? savedExpense : expense
            )
          );
        }
      }

      setModalMode(null);

      setToast({
        message: response.message || 'Expense saved successfully.',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to save expense.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      setIsDeleting(true);

      const response = await deleteExpense(expenseToDelete.id);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete expense.');
      }

      setExpenses((current) =>
        current.filter(
          (expense) => expense.id !== expenseToDelete.id
        )
      );

      setExpenseToDelete(null);

      setToast({
        message: response.message || 'Expense deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete expense.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-6 text-stone-800">
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">
            Expenses
          </h1>

          <p className="m-0 mt-1 text-sm text-stone-500">
            Manage your company expenses.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          aria-label="Add Expense"
          className="px-3 sm:px-4"
        >
          <Plus size={15} className="hidden sm:block" />
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">Add Expense</span>
        </Button>
      </div>

      <div className="w-full">
        <div className="w-full overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-xs">
          <div className="flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3.5">
            <div className="relative max-w-sm flex-grow">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search expense..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-8 pr-3 text-sm text-stone-800 transition-all duration-150 placeholder:text-stone-400 focus:border-[#c5a059] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
              />
            </div>

            <div className="relative">
              <Button variant="unstyled"
                type="button"
                onClick={() => setDropdownOpen((current) => !current)}
                className="flex cursor-pointer select-none items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition-all duration-150 hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
              >
                <Filter size={13} className="text-stone-400" />
                <span>{sortOrder}</span>
                <ChevronDown
                  size={13}
                  className={`text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[130px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                  {['Newest', 'Oldest'].map((option) => (
                    <Button variant="unstyled"
                      key={option}
                      type="button"
                      onClick={() => {
                        setSortOrder(option);
                        setDropdownOpen(false);
                      }}
                      className={`w-full cursor-pointer border-none px-4 py-2 text-left text-sm transition-colors ${sortOrder === option ? 'bg-[#fbf5e7] font-semibold text-[#8c6723]' : 'bg-transparent text-stone-600 hover:bg-stone-50'}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="overflow-x-auto"
            onWheel={(event) => {
              const container = event.currentTarget;
              if (container.scrollWidth <= container.clientWidth) return;

              container.scrollLeft += event.deltaY;
            }}
          >
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/60">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Expense Type
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Expense Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Description
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Payment Method
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10"
                    >
                      <TableEmptyState
                        title="No expenses found"
                        message={search ? 'No expenses match your search.' : 'Expenses you create will appear here.'}
                      />
                    </td>
                  </tr>
                ) : (
                  visibleExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-stone-100 transition-colors last:border-0 hover:bg-[#fbf5e7]/40"
                    >
                      <td className="px-4 py-3.5 text-sm font-semibold text-stone-900">
                        {expense.type}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-semibold text-stone-700">
                        ₹{Number(expense.amount).toLocaleString('en-IN')} {/* convert indian rupee format */}
                      </td> 

                      <td className="px-4 py-3.5 text-sm text-stone-500">
                        {new Date(expense.date).toLocaleDateString('en-GB')} {/* convert to dd/mm/yyyy format */}
                      </td>

                      <td className="max-w-52 truncate px-4 py-3.5 text-sm text-stone-500">
                        {expense.description}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-stone-500">
                        {expense.paymentMethod}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="unstyled"
                            type="button"
                            title="View expense"
                            aria-label="View expense"
                            onClick={() => handleOpenView(expense)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-[#8c6723] hover:shadow-xs"
                          >
                            <Eye
                              size={15}
                              strokeWidth={1.8}
                            />
                          </Button>

                          <Button variant="unstyled"
                            type="button"
                            title="Edit expense"
                            aria-label="Edit expense"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEdit(expense);
                            }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-xs"
                          >
                            <Pencil
                              size={14}
                              strokeWidth={1.8}
                            />
                          </Button>

                          <Button variant="unstyled"
                            type="button"
                            title="Delete expense"
                            aria-label="Delete expense"
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpenseToDelete(expense);
                            }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2
                              size={14}
                              strokeWidth={1.8}
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-stone-100 px-4 py-3 text-xs text-stone-500">
            Showing {visibleExpenses.length} entries
          </div>
        </div>
      </div>

      {selectedExpense && modalMode === 'view' && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4"
          onClick={() => {
            setSelectedExpense(null);
            setModalMode(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ReceiptText
                  size={16}
                  className="text-[#8c6723]"
                />

                <h2 className="m-0 text-sm font-bold">
                  Expense Details
                </h2>
              </div>

              <Button variant="unstyled"
                type="button"
                title="Close"
                onClick={() => {
                  setSelectedExpense(null);
                  setModalMode(null);
                }}
                className="cursor-pointer border-0 bg-transparent p-1.5 text-stone-400"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4 p-6 text-sm">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Expense Type
                </label>

                <input
                  value={selectedExpense.type}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Amount
                </label>

                <input
                  value={`₹${Number(
                    selectedExpense.amount
                  ).toLocaleString('en-IN')}`}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Expense Date
                </label>

                <input
                  value={new Date(
                    selectedExpense.date
                  ).toLocaleDateString('en-GB')}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Description
                </label>

                <input
                  value={selectedExpense.description}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Payment Method
                </label>

                <input
                  value={selectedExpense.paymentMethod}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4">
              <h2 className="m-0 text-base font-bold text-stone-900">
                {modalMode === 'add' ? 'Add Expense' : 'Edit Expense'}
              </h2>

              <Button variant="unstyled"
                type="button"
                onClick={() => setModalMode(null)}
                className="cursor-pointer border-0 bg-transparent p-1 text-stone-400"
              >
                <X size={16} />
              </Button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Expense Type *
                </label>

                <Dropdown
                  name="type"
                  value={formData.type}
                  options={expenseTypes}
                  onChange={handleInputChange}
                  placeholder="Select Expense Type"
                  emptyMessage="No expense types available"
                  hasError={Boolean(formErrors.type)}
                />

                {formErrors.type && (
                  <p className="m-0 mt-1 text-xs text-rose-500">
                    {formErrors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Amount *
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className={`w-full rounded-xl border bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059] ${
                    formErrors.amount
                      ? 'border-rose-400'
                      : 'border-stone-200'
                  }`}
                />

                {formErrors.amount && (
                  <p className="m-0 mt-1 text-xs text-rose-500">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Expense Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059] ${
                    formErrors.date
                      ? 'border-rose-400'
                      : 'border-stone-200'
                  }`}
                />

                {formErrors.date && (
                  <p className="m-0 mt-1 text-xs text-rose-500">
                    {formErrors.date}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter description"
                  className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Payment Method *
                </label>

                <Dropdown
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  options={paymentMethods}
                  onChange={handleInputChange}
                  placeholder="Select Payment Method"
                  emptyMessage="No payment methods available"
                  hasError={Boolean(formErrors.paymentMethod)}
                />

                {formErrors.paymentMethod && (
                  <p className="m-0 mt-1 text-xs text-rose-500">
                    {formErrors.paymentMethod}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalMode(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : modalMode === 'add'
                      ? 'Save Expense'
                      : 'Update Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {expenseToDelete && (
        <DeleteConfirmationModal
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          isDeleting={isDeleting}
          onCancel={() => setExpenseToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
