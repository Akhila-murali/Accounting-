
const PRODUCT_UNIT_VALUES = {
  NONE: 0,
  PCS: 1,
  BOX: 2,
  KG: 3,
  MTR: 4,
  LTR: 5,
  SET: 6,
  DOZEN: 7,
  BUNDLE: 8,
};

const PAYMENT_TYPE_VALUES = {
  Cash: 1,
  StrideindBankAccount: 2,
  UPI: 3,
  Cheque: 4,
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

const serializeItem = (item) => ({
  itemName: item.itemName ?? '',
  description: item.description ?? '',
  partNumber: item.partNumber ?? '',
  quantity: toNumber(item.quantity, 0),
  unit: PRODUCT_UNIT_VALUES[item.unit] ?? 0,
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
}) => {
  const serializedItems = items
    .filter((item) =>
      String(item.itemName ?? '').trim() !== '' ||
      String(item.description ?? '').trim() !== '' ||
      String(item.partNumber ?? '').trim() !== '' ||
      (Array.isArray(item.serialNumbers) &&
        item.serialNumbers.length > 0) ||
      toNumber(item.price) !== 0 ||
      toNumber(item.tax) !== 0 ||
      toNumber(item.cess) !== 0 ||
      toNumber(item.quantity, 1) !== 1 ||
      item.unit !== 'NONE'
    )
    .map(serializeItem);

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
    quotationId: toNullableInteger(
      formData.proposalReference
    ),
    description: formData.description ?? '',
    paymentType:
      PAYMENT_TYPE_VALUES[formData.paymentType] ?? null,
    totalDiscountType:
      summary.discountType === 'Percentage' ? 2 : 1,
    totalDiscountValue: toNumber(
      summary.discountValue
    ),
    items: serializedItems,
    termsAndConditions: selectedTerms.map(serializeTerm),
  };
};
