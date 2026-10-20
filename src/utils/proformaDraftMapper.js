
const getEnumValue = (value, options, firstEnumValue) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isInteger(numericValue)) {
    return numericValue;
  }

  const optionIndex = options.findIndex(
    (option) => String(option.value) === String(value)
  );

  return optionIndex >= 0 ? optionIndex + firstEnumValue : null;
};

const toNullableInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
};

const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getQuotationId = (value, quotations) => {
  const quotationId = toNullableInteger(value);

  if (quotationId === null) return null;

  return quotations.some(
    (quotation) => Number(quotation.id) === quotationId
  )
    ? quotationId
    : null;
};

const serializeItem = (item, units) => ({
  itemName: item.itemName ?? '',
  description: item.description ?? '',
  partNumber: item.partNumber ?? '',
  hsnSac: item.hsnSac ?? item.hsnsac ?? '',
  quantity: toNumber(item.quantity, 0),
  unit: getEnumValue(item.unit, units, 0) ?? 0,
  pricePerUnit: toNumber(item.price, 0),
  gstPercentage: toNumber(item.tax, 0),
  cessPercentage: toNumber(item.cess, 0),
  serialNumbers: Array.isArray(item.serialNumbers)
    ? item.serialNumbers
    : [],
});

const serializeTerm = (term) => ({
  termId: toNullableInteger(term.termId ?? term.id),
  title: term.title ?? '',
  bullets: Array.isArray(term.bullets)
    ? term.bullets
    : [],
});

export const buildProformaDraftContent = ({
  formData,
  items,
  summary,
  selectedTerms,
  units = [],
  paymentTypes = [],
  quotations = [],
}) => {
  const serializedItems = items
    .filter((item) =>
      String(item.itemName ?? '').trim() !== '' ||
      String(item.description ?? '').trim() !== '' ||
      String(item.partNumber ?? '').trim() !== '' ||
      String(item.hsnSac ?? item.hsnsac ?? '').trim() !== '' ||
      (Array.isArray(item.serialNumbers) &&
        item.serialNumbers.length > 0) ||
      toNumber(item.price) !== 0 ||
      toNumber(item.tax) !== 0 ||
      toNumber(item.cess) !== 0 ||
      toNumber(item.quantity, 1) !== 1 ||
      (getEnumValue(item.unit, units, 0) ?? 0) !== 0
    )
    .map((item) => serializeItem(item, units));

  return {
    customerCompanyId: toNullableInteger(
      formData.customerCompanyId
    ),
    billingName: formData.billingName ?? '',
    phoneNo: formData.phoneNo ?? '',
    gstNo: formData.gstNo ?? '',
    stateOfSupply: formData.stateOfSupply ?? '',
    invoiceDate: formData.invoiceDate
      ? `${formData.invoiceDate}T00:00:00`
      : '',
    validityPeriod: toNumber(formData.validityPeriod, 30),
    quotationId: getQuotationId(
      formData.proposalReference,
      quotations
    ),
    description: formData.description ?? '',
    paymentType: getEnumValue(formData.paymentType, paymentTypes, 1),
    totalDiscountType:
      summary.discountType === 'Percentage' ? 2 : 1,
    totalDiscountValue: toNumber(
      summary.discountValue
    ),
    items: serializedItems,
    termsAndConditions: selectedTerms.map(serializeTerm),
  };
};
