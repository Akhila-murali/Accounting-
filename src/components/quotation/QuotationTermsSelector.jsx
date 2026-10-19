import TermsConditionsPanel from '../common/bills/TermsConditionsPanel.jsx';

export default function QuotationTermsSelector({
  selectedTerms = [],
  onChange,
  readOnly = false,
}) {
  return (
    <TermsConditionsPanel
      selectedTerms={selectedTerms}
      onTermsChange={onChange}
      readOnly={readOnly}
    />
  );
}
