import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, FileText, History, Pencil, Search, Trash2, WalletCards, X } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import Button from '../Button.jsx';
import TableEmptyState from '../TableEmptyState.jsx';


const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;


const today = () => new Date().toISOString().split('T')[0];

export default function PaymentSummary({ totalAmount }) {
  const paymentFormRef = useRef(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);
  const [comments, setComments] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyOrder, setHistoryOrder] = useState('Newest');
  const [showHistoryFilter, setShowHistoryFilter] = useState(false);

  const total = Number(totalAmount || 0);
  const paymentHistory = [];
  const paid = Math.min(amountPaid, total);
  const balance = Math.max(total - paid, 0);
  const paidPercentage = total > 0
    ? Math.round((paid / total) * 100)
    : 0;

  const chartData = [
    { name: 'Paid', value: paid },
    { name: 'Balance', value: balance },
  ];

  const searchText = historySearch.trim().toLowerCase();
  const visiblePayments = paymentHistory
    .filter((payment) =>
      payment.date.toLowerCase().includes(searchText) ||
      payment.comments.toLowerCase().includes(searchText) ||
      String(payment.amount).includes(searchText)
    )
    .sort((first, second) => {
      const dateDifference = new Date(second.date) - new Date(first.date);
      const newestFirst = dateDifference || second.sequence - first.sequence;
      return historyOrder === 'Newest' ? newestFirst : -newestFirst;
    });

  const addPayment = () => {
    const amount = Number(paymentAmount);

    if (!paymentDate) {
      setPaymentError('Payment date is required.');
      return;
    }

    if (amount <= 0) {
      setPaymentError('Enter a valid payment amount.');
      return;
    }

    if (amount > balance) {
      setPaymentError(`Amount cannot exceed the balance due of ${money(balance)}.`);
      return;
    }

    setPaymentError('');
    setAmountPaid((current) => current + amount);
    clearPaymentForm();
    setShowPaymentInput(false);
  };

  const clearPaymentForm = () => {
    setPaymentAmount('');
    setPaymentDate('');
    setComments('');
    setPaymentError('');
  };

  useEffect(() => {
    if (!showPaymentInput) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!paymentFormRef.current?.contains(event.target)) {
        setShowPaymentInput(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [showPaymentInput]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WalletCards size={16} className="text-[#8c6723]" />
          <h2 className="m-0 text-sm font-bold text-stone-900">
            Payment Summary
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowPaymentInput(false);
            setHistorySearch('');
            setShowHistory(true);
          }}
          className="border-0 bg-transparent p-0 text-[11px] font-semibold text-[#8c6723] hover:underline"
        >
          History
        </button>
      </div>

      <div className="relative mt-3 hidden min-h-32 flex-1 rounded-lg bg-[#fbf8f1] px-3 pt-2 sm:block">
        <div className="relative h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="82%"
                innerRadius={42}
                outerRadius={54}
                startAngle={180}
                endAngle={0}
                fill="#e7e5e4"
                stroke="none"
              >
                <Cell fill="#9a741e" />
                <Cell fill="#e7e5e4" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center">
            <p className="m-0 text-base font-bold text-stone-800">{paidPercentage}%</p>
            <p className="m-0 text-[10px] text-stone-400">Paid</p>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="m-0 text-[10px] text-stone-500">Balance Due</p>
        <p className="m-0 mt-0.5 text-lg font-bold text-[#76520d]">{money(balance)}</p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <AmountCard icon={FileText} label="Grand Total" value={total} />
        <AmountCard icon={WalletCards} label="Amount Paid" value={paid} />
      </div>

      {showPaymentInput && (
        <div ref={paymentFormRef} className="mt-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="m-0 text-xs font-bold text-stone-800">Add Payment</p>
            <button
              type="button"
              onClick={clearPaymentForm}
              className="border-0 bg-transparent p-0 text-[10px] font-semibold text-[#8c6723] hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            <PaymentField label="Date">
              <input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="mt-1.5 h-[42px] w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-[#c5a059]"
              />
            </PaymentField>

            <PaymentField label="Amount">
              <input
                type="number"
                min="1"
                max={balance}
                value={paymentAmount}
                onChange={(event) => {
                  setPaymentAmount(event.target.value);
                  setPaymentError('');
                }}
                placeholder="Enter amount"
                className="mt-1.5 h-[42px] w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-[#c5a059]"
              />
              {paymentError && (
                <span className="mt-1 block text-[11px] font-medium leading-4 text-red-500">
                  {paymentError}
                </span>
              )}
            </PaymentField>

            <PaymentField label="Comments">
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Add a note (optional)"
                rows="2"
                className="mt-1.5 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#c5a059]"
              />
            </PaymentField>
          </div>

          <Button
            onClick={addPayment}
            className="mt-3 w-full"
          >
            Save Payment
          </Button>
        </div>
      )}

      {!showPaymentInput && (
        <Button
          onClick={() => {
            if (!paymentDate) setPaymentDate(today());
            setShowPaymentInput(true);
          }}
          disabled={balance === 0}
          className="mt-3 w-full"
        >
          + Add Payment
        </Button>
      )}

      {showHistory && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/55 p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf5e7] text-[#8c6723]">
                  <History size={18} />
                </span>
                <div>
                  <h3 className="m-0 text-base font-bold text-stone-900">
                    Payment History
                  </h3>
                  <p className="m-0 mt-1 text-xs text-stone-400">
                    Review all payments recorded for this document.
                  </p>
                </div>
              </div>

              <Button
                variant="unstyled"
                onClick={() => setShowHistory(false)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close payment history"
              >
                <X size={17} />
              </Button>
            </div>

            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/50 p-4 sm:gap-3 sm:px-6">
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Search date, comments or amount..."
                  className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/15"
                />
              </div>

              <div className="relative shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryFilter((current) => !current)}
                  className="min-w-24 justify-between px-3 text-xs sm:min-w-28"
                >
                  {historyOrder}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${showHistoryFilter ? 'rotate-180' : ''}`}
                  />
                </Button>

                {showHistoryFilter && (
                  <div className="absolute right-0 top-full z-10 mt-1.5 min-w-32 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                    {['Newest', 'Oldest'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setHistoryOrder(option);
                          setShowHistoryFilter(false);
                        }}
                        className={`w-full border-0 px-4 py-2 text-left text-xs font-medium ${
                          historyOrder === option
                            ? 'bg-[#fbf5e7] text-[#8c6723]'
                            : 'bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-auto p-4 sm:p-6">
              {visiblePayments.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-stone-200">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Comments</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePayments.map((payment) => (
                        <tr key={payment.id} className="border-t border-stone-100 bg-white hover:bg-stone-50/70">
                          <td className="whitespace-nowrap px-4 py-3.5 text-stone-600">
                            {new Date(`${payment.date}T00:00:00`).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="max-w-72 px-4 py-3.5 text-stone-500">
                            {payment.comments || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-stone-800">
                            {money(payment.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                title="Edit payment"
                                aria-label="Edit payment"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-xs"
                              >
                                <Pencil size={14} strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                title="Delete payment"
                                aria-label="Delete payment"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={14} strokeWidth={1.8} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8">
                  <TableEmptyState
                    title="No payment history"
                    message="Payment records will appear here once they are available."
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

function PaymentField({ label, children }) {
  return (
    <label className="block text-[10px] font-semibold text-stone-600">
      {label}
      {children}
    </label>
  );
}


function AmountCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-stone-100 px-2 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fbf5e7] text-[#8c6723]">
        <Icon size={13} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[9px] text-stone-400">{label}</p>
        <p className="m-0 truncate text-xs font-bold text-stone-800">{money(value)}</p>
      </div>
    </div>
  );
}
