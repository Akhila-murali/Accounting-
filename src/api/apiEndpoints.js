export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7100";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  DOCUMENT_SETTINGS: {
  PREFIXES: "/api/document-settings/prefixes",
},

  COMPANIES: {
    BASE: "/api/Company",
    BY_ID: (id) => `/api/Company/${id}`,
  },

  REGISTRATION: {
    REGISTER: "/api/registration/register",
    ROLES: "/api/registration/roles",
    USERS: "/api/registration/users",
    USER_BY_ID: (userId) => `/api/registration/users/${userId}`,
  },

  TERMS_AND_CONDITIONS: {
    BASE: "/api/TermsAndCondition",
    BY_ID: (id) => `/api/TermsAndCondition/${id}`,
  },

  QUOTATIONS: {
    BASE: "/api/Quotation",
    DEFAULTS: "/api/Quotation/defaults",
    BY_ID: (id) => `/api/Quotation/${id}`,
    DUPLICATE: (id) => `/api/Quotation/${id}/duplicate`,
  },
  PRICING: {
    GST_SLABS: "/api/gst-slabs",
    PREVIEW: "/api/quotation-pricing/preview",
  },
  PURCHASE_BILLS: {
    BASE: "/api/PurchaseBill",
    LOOKUPS: "/api/PurchaseBill/lookups",
    BY_ID: (id) => `/api/PurchaseBill/${id}`,
    COMPLETE: (id) => `/api/PurchaseBill/${id}/complete`,
    UPLOAD_ATTACHMENT: (id) => `/api/PurchaseBill/${id}/bill`,
    DELETE_PREVIEW: (id) => `/api/PurchaseBill/${id}/delete-preview`,
    DELETE_ATTACHMENT: (purchaseBillId, attachmentId) =>
      `/api/PurchaseBill/${purchaseBillId}/bill/${attachmentId}`,
  },
  PURCHASE_DRAFTS: {
    NEW: "/api/purchase-bill-drafts/new",
    BY_ID: (id) => `/api/purchase-bill-drafts/${id}`,
    ACTIVE: "/api/purchase-bill-drafts/active",
    COMMIT: (id) => `/api/purchase-bill-drafts/${id}/commit`,
    EDIT: (purchaseBillId) =>
      `/api/purchase-bill-drafts/${purchaseBillId}/edit-draft`,
    APPLY: (id) => `/api/purchase-bill-drafts/${id}/apply`,
    APPLY_PREVIEW: (id) => `/api/purchase-bill-drafts/${id}/apply-preview`,
  },
  INVENTORY: {
    STOCK_SUMMARY: "/api/Inventory/stock-summary",
    STOCK_PURCHASES: (itemKey) =>
      `/api/Inventory/stock-summary/${encodeURIComponent(itemKey)}/purchases`,
    STOCK_UNITS: "/api/Inventory",
  },
  EXPENSES: {
    BASE: "/api/Expense",
    LOOKUPS: "/api/Expense/lookups",
    BY_ID: (id) => `/api/Expense/${id}`,
  },
  MANUFACTURING: {
    BASE: "/api/Manufacturing",
    BY_ID: (id) => `/api/Manufacturing/${id}`,
    STOCK_SUMMARY: "/api/Manufacturing/stock-summary",
    BATCHES: (productName) =>
      `/api/Manufacturing/stock-summary/${encodeURIComponent(productName)}/batches`,
    STOCK_UNITS: (manufacturingId) =>
      `/api/Manufacturing/${manufacturingId}/stock-units`,
  },
  PRODUCTS: {
    BASE: "/api/products",
    ALL: "/api/products/all",
    BY_ID: (id) => `/api/products/${id}`,
    DELETE_PREVIEW: (id) => `/api/products/${id}/delete-preview`,
  },
QUOTATION_DRAFTS: {
  NEW: '/api/quotation-drafts/new',
  BY_ID: (id) => `/api/quotation-drafts/${id}`,
  ACTIVE: '/api/quotation-drafts/active',
  COMMIT: (id) => `/api/quotation-drafts/${id}/commit`,
  EDIT: (quotationId) => `/api/quotation/${quotationId}/edit-draft`,
  APPLY: (id) => `/api/quotation-drafts/${id}/apply`,
  SAVE_AS_NEW: (id) => `/api/quotation-drafts/${id}/save-as-new`,
},


PROFORMA_INVOICE_DRAFTS: {
  NEW: "/api/proforma-invoice-drafts/new",
  ACTIVE: "/api/proforma-invoice-drafts/active",
  BY_ID: (draftId) =>
    `/api/proforma-invoice-drafts/${draftId}`,
  COMMIT: (draftId) =>
    `/api/proforma-invoice-drafts/${draftId}/commit`,
  EDIT: (invoiceId) =>
    `/api/proforma-invoices/${invoiceId}/edit-draft`,
  APPLY: (draftId) =>
    `/api/proforma-invoice-drafts/${draftId}/apply`,
},

PROFORMA_INVOICES: {
  BASE: "/api/proforma-invoices",
  BY_ID: (id) => `/api/proforma-invoices/${id}`,
},

PROFORMA_INVOICE_ATTACHMENTS: {
  DRAFT_BASE: (draftId) =>
    `/api/ProformaInvoiceDraft/${draftId}/attachments`,
  DRAFT_DOWNLOAD: (draftId, attachmentId) =>
    `/api/ProformaInvoiceDraft/${draftId}/attachments/${attachmentId}/download`,
  DRAFT_DELETE: (draftId, attachmentId) =>
    `/api/ProformaInvoiceDraft/${draftId}/attachments/${attachmentId}`,

  INVOICE_BASE: (invoiceId) =>
    `/api/ProformaInvoice/${invoiceId}/attachments`,
  INVOICE_DOWNLOAD: (invoiceId, attachmentId) =>
    `/api/ProformaInvoice/${invoiceId}/attachments/${attachmentId}/download`,
  INVOICE_DELETE: (invoiceId, attachmentId) =>
    `/api/ProformaInvoice/${invoiceId}/attachments/${attachmentId}`,
},


};
