import { useEffect, useState } from 'react';
import {
  Calculator,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from 'lucide-react';

import Button from '../common/Button.jsx';
import {
  createExpense,
  getExpenseLookups,
  getExpenses,
} from '../../services/expense.js';


const emptyExpenseForm = {
  expenseType: '',
  amount: '',
  expenseDate: '',
  description: '',
  paymentType: '',
};


const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;


export default function ManufacturingCostSummary({
  materialCost,
  expenses,
  setExpenses,
  savedManufacturing,
}) {
  const [availableExpenses, setAvailableExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expenseError, setExpenseError] = useState('');
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [savingExpense, setSavingExpense] = useState(false);


  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoadingExpenses(true);
        setExpenseError('');

        const [expensesResponse, lookupsResponse] = await Promise.all([
          getExpenses(),
          getExpenseLookups(),
        ]);

        if (!expensesResponse?.success) {
          throw new Error(expensesResponse?.message);
        }

        setAvailableExpenses(expensesResponse.data || []);
        setExpenseTypes(lookupsResponse?.data?.expenseTypes || []);
        setPaymentTypes(lookupsResponse?.data?.paymentTypes || []);
      } catch (error) {
        setExpenseError(
          error.response?.data?.message ||
          error.message ||
          'Unable to load expenses.'
        );
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadExpenses();
  }, []);

  const expenseTotal = expenses.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const displayMaterialCost =
    savedManufacturing?.actualMaterialCost ?? materialCost;

  const displayExpenseTotal =
    savedManufacturing?.expenseTotal ?? expenseTotal;

  const displayBatchCost =
    savedManufacturing?.actualManufacturingCostPerBatch ??
    displayMaterialCost + displayExpenseTotal;


  const selectExpense = (expenseId) => {
    if (!expenseId) {
      return;
    }

    const selectedExpense = availableExpenses.find(
      (expense) =>
        String(expense.id) === String(expenseId)
    );

    if (!selectedExpense) {
      return;
    }

    const alreadyAdded = expenses.some(
      (expense) =>
        String(expense.id) === String(selectedExpense.id)
    );

    if (!alreadyAdded) {
      setExpenses((current) => [
        ...current,
        selectedExpense,
      ]);
    }

  };


  const saveExpense = async (event) => {
    event.preventDefault();

    if (
      !expenseForm.expenseType ||
      Number(expenseForm.amount) <= 0 ||
      !expenseForm.expenseDate ||
      !expenseForm.paymentType
    ) {
      setExpenseError('Complete all required expense fields.');
      return;
    }

    try {
      setSavingExpense(true);
      setExpenseError('');

      const response = await createExpense({
        ...expenseForm,
        amount: Number(expenseForm.amount),
        description: expenseForm.description.trim() || null,
      });

      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'Unable to save expense.');
      }

      setAvailableExpenses((current) => [response.data, ...current]);
      setExpenses((current) => [...current, response.data]);
      setExpenseForm(emptyExpenseForm);
      setShowExpenseForm(false);
    } catch (error) {
      setExpenseError(
        error.response?.data?.message ||
        error.message ||
        'Unable to save expense.'
      );
    } finally {
      setSavingExpense(false);
    }
  };


  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
      <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-4">
          <ReceiptText
            size={16}
            className="text-[#8c6723]"
          />
          <h2 className="m-0 text-sm font-bold">
            Additional Expenses
          </h2>
        </div>

        <div className="p-4">
          <label className="mb-1.5 block text-xs font-semibold text-stone-600">
            Select Expense
          </label>

          <div className="flex gap-2">
            <select
              value=""
              disabled={loadingExpenses || availableExpenses.length === 0}
              onChange={(event) => selectExpense(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none focus:border-[#c5a059] disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
            >
              <option value="">
                {loadingExpenses
                  ? 'Loading expenses...'
                  : availableExpenses.length === 0
                    ? 'No expenses available'
                    : 'Choose an expense...'}
              </option>

              {availableExpenses.map((expense) => {
                const alreadyAdded = expenses.some(
                  (item) => String(item.id) === String(expense.id)
                );

                return (
                  <option
                    key={expense.id}
                    value={expense.id}
                    disabled={alreadyAdded}
                  >
                    {expense.expenseType} · {money(expense.amount)}
                    {alreadyAdded ? ' · Added' : ''}
                  </option>
                );
              })}
            </select>

            <Button
              onClick={() => setShowExpenseForm(true)}
              className="h-10 w-12 p-0"
              title="Create expense"
              aria-label="Create expense"
            >
              <Plus size={20} />
            </Button>
          </div>

          {expenseError && (
            <p className="mb-0 mt-2 text-xs text-rose-600">
              {expenseError}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-stone-100 p-4">
          {expenses.length === 0 ? (
            <p className="m-0 rounded-lg bg-stone-50 px-3 py-3 text-xs text-stone-400">
              No expenses selected yet.
            </p>
          ) : (
            expenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-stone-800">
                    {item.expenseType}
                  </p>

                  <p className="m-0 mt-1 truncate text-[11px] text-stone-400">
                    {item.paymentType || 'Payment method not specified'}
                    {item.expenseDate && (
                      <> · {new Date(item.expenseDate).toLocaleDateString('en-IN')}</>
                    )}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-bold text-[#8c6723]">
                  {money(item.amount)}
                </span>

                <Button
                  variant="unstyled"
                  onClick={() =>
                    setExpenses((current) =>
                      current.filter(
                        (expense) => expense.id !== item.id
                      )
                    )
                  }
                  className="p-1 text-stone-400 hover:text-rose-600"
                  title="Remove expense"
                  aria-label="Remove expense"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>


      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm lg:col-span-3">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold-light text-brand-gold">
            <Calculator size={16} />
          </span>
          <h2 className="m-0 text-base font-bold text-stone-800">
            Cost Summary
          </h2>
        </div>

        <div className="divide-y divide-stone-100">
          <CostRow
            label="Material Total"
            value={displayMaterialCost}
          />

          <CostRow
            label="Expense Total"
            value={displayExpenseTotal}
          />
        </div>

        <CostRow
          label="Final Total"
          value={displayBatchCost}
          highlight
        />
      </section>

      {showExpenseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4">
              <h2 className="m-0 text-base font-bold text-stone-900">
                Add Expense
              </h2>

              <Button
                variant="unstyled"
                onClick={() => setShowExpenseForm(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
                title="Close"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={saveExpense} className="space-y-4 p-6">
              <ExpenseSelect
                label="Expense Type"
                name="expenseType"
                value={expenseForm.expenseType}
                options={expenseTypes}
                placeholder="Select Expense Type"
                onChange={setExpenseForm}
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Amount <span className="text-red-500">*</span>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(event) =>
                    setExpenseForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm font-normal text-stone-700 outline-none focus:border-[#c5a059]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Expense Date <span className="text-red-500">*</span>
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(event) =>
                    setExpenseForm((current) => ({
                      ...current,
                      expenseDate: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm font-normal text-stone-700 outline-none focus:border-[#c5a059]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Description
                <textarea
                  value={expenseForm.description}
                  onChange={(event) =>
                    setExpenseForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows="3"
                  placeholder="Enter description"
                  className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm font-normal text-stone-700 outline-none focus:border-[#c5a059]"
                />
              </label>

              <ExpenseSelect
                label="Payment Method"
                name="paymentType"
                value={expenseForm.paymentType}
                options={paymentTypes}
                placeholder="Select Payment Method"
                onChange={setExpenseForm}
              />

              {expenseError && (
                <p className="m-0 text-xs text-rose-600">
                  {expenseError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExpenseForm(false)}
                  disabled={savingExpense}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={savingExpense}>
                  {savingExpense ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function ExpenseSelect({
  label,
  name,
  value,
  options,
  placeholder,
  onChange,
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
      {label} <span className="text-red-500">*</span>
      <select
        value={value}
        onChange={(event) =>
          onChange((current) => ({
            ...current,
            [name]: event.target.value,
          }))
        }
        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm font-normal text-stone-700 outline-none focus:border-[#c5a059]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}


function CostRow({
  label,
  value,
  highlight,
}) {
  return (
    <div className={`flex items-center justify-between gap-6 ${
      highlight
        ? 'mt-1 rounded-lg border border-brand-gold-highlight bg-brand-gold-light px-3 py-2.5'
        : 'px-2 py-3'
    }`}>
      <p className={`m-0 text-xs ${
        highlight
          ? 'font-bold text-brand-gold'
          : 'text-stone-500'
      }`}>
        {label}
      </p>

      <p
        className={`m-0 text-sm font-bold ${
          highlight
            ? 'text-brand-gold'
            : 'text-stone-800'
        }`}
      >
        {money(value)}
      </p>
    </div>
  );
}
