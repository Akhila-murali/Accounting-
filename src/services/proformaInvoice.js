
import api from "../api";
import { ENDPOINTS } from "../api/apiEndpoints";

// Create a new Proforma Invoice Draft.
export const createProformaInvoiceDraft = async () => {
  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.NEW
  );

  if (response.data?.success === false) {
    throw new Error(
      response.data.message || "Failed to create draft."
    );
  }

  return response.data;
};


export const getProformaInvoiceDraftById = async (draftId) => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.BY_ID(draftId)
  );

  if (response.data?.success === false) {
    throw new Error(
      response.data.message || "Failed to load draft."
    );
  }

  return response.data;
};

export const getActiveProformaInvoiceDrafts = async () => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.ACTIVE
  );
  return response.data;
};

export const discardProformaInvoiceDraft = async (draftId) => {
  const response = await api.delete(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.BY_ID(draftId)
  );
  return response.data;
};


export const updateProformaInvoiceDraft = async (
  draftId,
  version,
  content
) => {
  const response = await api.put(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.BY_ID(draftId),
    {
      version,
      content,
    }
  );

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message ||
      'Failed to update Proforma Invoice Draft.'
    );
  }

  return response.data;
};


export const commitProformaInvoiceDraft = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.COMMIT(draftId)
  );

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message ||
      'Failed to finalize Proforma Invoice.'
    );
  }

  return response.data;
};

export const createProformaInvoiceEditDraft = async (invoiceId) => {
  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.EDIT(invoiceId)
  );
  return response.data;
};

export const applyProformaInvoiceDraft = async (draftId) => {
  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_DRAFTS.APPLY(draftId)
  );
  return response.data;
};

export const uploadProformaDraftAttachment = async (draftId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.DRAFT_BASE(draftId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getProformaDraftAttachments = async (draftId) => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.DRAFT_BASE(draftId)
  );
  return response.data;
};

export const downloadProformaDraftAttachment = async (draftId, attachmentId) => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.DRAFT_DOWNLOAD(draftId, attachmentId),
    { responseType: 'blob' }
  );
  return response.data;
};

export const deleteProformaDraftAttachment = async (draftId, attachmentId) => {
  const response = await api.delete(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.DRAFT_DELETE(draftId, attachmentId)
  );
  return response.data;
};

export const uploadProformaInvoiceAttachment = async (invoiceId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.INVOICE_BASE(invoiceId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getProformaInvoiceAttachments = async (invoiceId) => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.INVOICE_BASE(invoiceId)
  );
  return response.data;
};

export const downloadProformaInvoiceAttachment = async (invoiceId, attachmentId) => {
  const response = await api.get(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.INVOICE_DOWNLOAD(invoiceId, attachmentId),
    { responseType: 'blob' }
  );
  return response.data;
};

export const deleteProformaInvoiceAttachment = async (invoiceId, attachmentId) => {
  const response = await api.delete(
    ENDPOINTS.PROFORMA_INVOICE_ATTACHMENTS.INVOICE_DELETE(invoiceId, attachmentId)
  );
  return response.data;
};

export const getProformaInvoices = async () => {
  const response = await api.get(ENDPOINTS.PROFORMA_INVOICES.BASE);
  return response.data;
};

export const getProformaInvoice = async (id) => {
  const response = await api.get(ENDPOINTS.PROFORMA_INVOICES.BY_ID(id));
  return response.data;
};

export const getProformaQuotationReferences = async () => {
  const response = await api.get(ENDPOINTS.QUOTATIONS.BASE);
  return response.data;
};

export const deleteProformaInvoice = async (id) => {
  const response = await api.delete(ENDPOINTS.PROFORMA_INVOICES.BY_ID(id));
  return response.data;
};
