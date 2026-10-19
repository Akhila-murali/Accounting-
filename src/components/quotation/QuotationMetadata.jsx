import { useState } from 'react';
import { ChevronDown, FileText, Info } from 'lucide-react';

import Button from '../common/Button.jsx';

const inputStyle =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white ' +
  'text-sm text-stone-800 outline-none focus:border-[#c5a059] ' +
  'focus:ring-2 focus:ring-[#c5a059]/20';

const labelStyle =
  'grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2 ' +
  'text-xs text-stone-600';

const prefixOptions = ['QUO', 'IEN-100', 'IEN-200'];

export default function QuotationMetadata({ data, onChange, companies = [], readOnlyReference = false }) {
  const [prefix, setPrefix] = useState('QUO');
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const filteredPrefixes = prefixOptions.filter((option) =>
    option.toLowerCase().includes(prefix.toLowerCase())
  );

  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const renderCompanyOptions = () => {
    return companies.map((company) => (
      <option key={company.id} value={company.id}>
        {company.companyName}
      </option>
    ));
  };

  return (
    <div className="h-full p-4 bg-white border border-stone-200 rounded-xl">
      <h2 className="flex items-center gap-2.5 text-sm font-bold text-stone-900 m-0 mb-4">
        <FileText size={16} className="text-stone-500" />
        Quotation Metadata
      </h2>

      <div className="space-y-2.5">
        <label className={labelStyle}>
          <span>Submitted By</span>
          <select
            className={inputStyle}
            value={data.submittedByCompanyId}
            onChange={(event) => {
              update('submittedByCompanyId', event.target.value);
            }}
          >
            <option value="">Select company</option>
            {renderCompanyOptions()}
          </select>
        </label>

        <label className={labelStyle}>
          <span>Submitted To</span>
          <select
            className={inputStyle}
            value={data.submittedToCompanyId}
            onChange={(event) => {
              update('submittedToCompanyId', event.target.value);
            }}
          >
            <option value="">Select company</option>
            {renderCompanyOptions()}
          </select>
        </label>

        <div className="grid grid-cols-1 items-center gap-y-2 text-xs text-stone-600 sm:grid-cols-[110px_150px_120px_160px] sm:gap-x-3">
          <span className="whitespace-nowrap">Prefix</span>

          <div className="relative">
            <input
              type="text"
              value={prefix}
              maxLength={12}
              onFocus={() => setIsPrefixOpen(true)}
              onBlur={() => window.setTimeout(() => setIsPrefixOpen(false), 150)}
              onChange={(event) => {
                setPrefix(event.target.value.toUpperCase());
                setIsPrefixOpen(true);
              }}
              placeholder="Enter or select prefix"
              className={`${inputStyle} pr-9 uppercase`}
            />

            <Button
              variant="unstyled"
              onClick={() => setIsPrefixOpen(!isPrefixOpen)}
              className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-stone-400"
            >
              <ChevronDown
                size={14}
                className={isPrefixOpen ? 'rotate-180' : ''}
              />
            </Button>

            {isPrefixOpen && filteredPrefixes.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                {filteredPrefixes.map((option) => (
                  <Button
                    key={option}
                    variant="unstyled"
                    onMouseDown={() => {
                      setPrefix(option);
                      setIsPrefixOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-semibold text-stone-800 hover:bg-[#fbf5e7]"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <span className="whitespace-nowrap">Proposal Reference</span>
          <input
            type="text"
            readOnly={readOnlyReference}
            className={`${inputStyle} read-only:bg-stone-50 read-only:text-stone-500`}
            value={data.proposalReference}
            onChange={(event) => {
              update('proposalReference', event.target.value);
            }}
          />

          <p className="m-0 flex items-center gap-1.5 text-[10px] text-stone-500 sm:col-start-2 sm:col-end-[-1]">
            <Info size={11} className="shrink-0" />
            Reference is auto-generated from the prefix.
          </p>
        </div>

        <label className={labelStyle}>
          <span>Date of Issue</span>
          <input
            type="date"
            className={inputStyle}
            value={data.dateOfIssue}
            onChange={(event) => {
              update('dateOfIssue', event.target.value);
            }}
          />
        </label>

        <label className={labelStyle}>
          <span>Validity (days)</span>
          <input
            type="number"
            min="0"
            className={inputStyle}
            value={data.validityPeriod}
            onChange={(event) => {
              update('validityPeriod', event.target.value);
            }}
          />
        </label>

        <label className={labelStyle}>
          <span>Site Location</span>
          <input
            type="text"
            className={inputStyle}
            value={data.siteLocation}
            onChange={(event) => {
              update('siteLocation', event.target.value);
            }}
          />
        </label>

        <label className={labelStyle}>
          <span>Classification</span>
          <input
            type="text"
            className={inputStyle}
            value={data.documentClassification}
            onChange={(event) => {
              update('documentClassification', event.target.value);
            }}
          />
        </label>
      </div>
    </div>
  );
}
