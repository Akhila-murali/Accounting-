import { useEffect, useState } from 'react';
import { Plus, ScrollText } from 'lucide-react';

import TermsForm from '../../terms/TermsForm.jsx';
import {
  createTerm,
  getTerm,
  getTerms,
} from '../../../services/terms.js';

export default function TermsConditionsPanel({
  selectedTerms = [],
  onTermsChange,
  value = '',
  onChange,
  extraFields,
  readOnly = false,
  headerActions,
  isOpen = true,
  splitExtraFields = false,
  validationMessage = '',
}) {
  const [terms, setTerms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await getTerms();

        if (response?.success) {
          setTerms(response.data || []);
        }
      } catch {
        setError('Unable to load terms and conditions.');
      }
    };

    loadTerms();
  }, []);

  const selectTerm = async (termId) => {
    if (!termId) {
      return;
    }

    const alreadySelected = selectedTerms.some(
      (term) =>
        String(term.id) === String(termId)
    );

    if (alreadySelected && onTermsChange) {
      const updatedTerms = selectedTerms.filter(
        (term) =>
          String(term.id) !== String(termId)
      );

      onTermsChange(updatedTerms);
      return;
    }

    try {
      setError('');

      const response = await getTerm(termId);

      if (!response?.success || !response.data) {
        setError('Unable to load the term.');
        return;
      }

      const term = response.data;

      if (onTermsChange) {
        onTermsChange([
          ...selectedTerms,
          term,
        ]);
      }

      if (onChange) {
        const text = (term.bullets || [])
          .map((bullet, index) =>
            `${index + 1}. ${bullet}`
          )
          .join('\n');

        onChange(text);
      }
    } catch {
      setError('Unable to load the term.');
    }
  };

  const saveNewTerm = async (title, bullets) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await createTerm({
        title,
        bullets,
      });

      if (!response?.success || !response.data) {
        setError('Unable to save the term.');
        return;
      }

      const newTerm = response.data;

      setTerms([
        ...terms,
        newTerm,
      ]);

      if (onTermsChange) {
        onTermsChange([
          ...selectedTerms,
          newTerm,
        ]);
      }

      if (onChange) {
        const text = (newTerm.bullets || [])
          .map((bullet, index) =>
            `${index + 1}. ${bullet}`
          )
          .join('\n');

        onChange(text);
      }

      setShowForm(false);
    } catch {
      setError('Unable to save the term.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">

      <div
        className={`flex items-center gap-2 ${
          isOpen ? 'mb-4' : ''
        }`}
      >
        <ScrollText
          size={16}
          className="text-[#8c6723]"
        />

        <h2 className="m-0 flex-1 text-sm font-bold text-stone-900">
          Terms &amp; Conditions
        </h2>

        {headerActions}
      </div>

      {isOpen && (
        <div className={`grid grid-cols-1 gap-4 ${
          splitExtraFields ? 'lg:grid-cols-2 lg:items-start' : ''
        }`}>

          <div className="min-w-0">

            <label className="mb-1.5 block text-xs font-semibold text-stone-600">
              Select Template
            </label>

            <div className="mb-3 flex max-w-xl gap-2">

              <select
                value=""
                disabled={readOnly || terms.length === 0}
                onChange={(event) =>
                  selectTerm(event.target.value)
                }
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700 outline-none focus:border-[#c5a059] disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed"
              >
                {terms.length === 0 ? (
                  <option value="">
                    No terms & conditions available
                  </option>
                ) : (
                  <>
                    <option value="">
                      Choose Terms & Conditions...
                    </option>

                    {terms.map((term) => {
                      const selected = selectedTerms.some(
                        (selectedTerm) =>
                          String(selectedTerm.id) ===
                          String(term.id)
                      );

                      return (
                        <option
                          key={term.id}
                          value={term.id}
                        >
                          {selected ? '✓ ' : ''}
                          {term.title}
                        </option>
                      );
                    })}
                  </>
                )}
              </select>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  title="Create a new term"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-[#8c6723] shadow-sm cursor-pointer hover:bg-[#fbf5e7]"
                >
                  <Plus size={17} />
                </button>
              )}

            </div>

            {onChange ? (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                  Terms &amp; Conditions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  rows="6"
                  className="w-full resize-none rounded-lg border border-stone-200 p-3 text-xs leading-5 outline-none focus:border-[#c5a059]"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTerms.length === 0 ? (
                  <p className="m-0 rounded-lg bg-stone-50 px-3 py-2.5 text-xs text-stone-400">
                    No terms selected yet.
                  </p>
                ) : (
                  selectedTerms.map((term, termIndex) => (
                    <div key={term.id} className="rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-xs text-stone-700">
                      <p className="m-0 font-semibold text-stone-800">
                        {term.title || `Selected Term ${termIndex + 1}`}
                      </p>
                      {term.bullets?.length > 0 && (
                        <ul className="mb-0 mt-2 space-y-1 pl-4 leading-5">
                          {term.bullets.map((bullet, index) => (
                            <li key={index}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {error && (
              <p className="mb-0 mt-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            {validationMessage && (
              <p className="mb-0 mt-2 text-[11px] text-red-500">
                {validationMessage}
              </p>
            )}

          </div>

          {extraFields}

        </div>
      )}

      {!readOnly && showForm && (
        <TermsForm
          mode="add"
          initialData={null}
          onSave={saveNewTerm}
          onClose={() => setShowForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

    </section>
  );
}
