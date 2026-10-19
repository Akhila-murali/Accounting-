import api from "../api";
import { ENDPOINTS } from "../api/apiEndpoints";

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeBullets = (value) => {
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : firstDefined(item?.text, item?.description, item?.value, ""));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizeBullets(parsed);
    } catch {
      return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    }
  }
  return [];
};

const normalizeTerm = (term = {}) => ({
  ...term,
  id: firstDefined(term.id, term.termsAndConditionId, term.termId, term.Id, term.TermsAndConditionId),
  title: firstDefined(term.title, term.name, term.Title, term.Name, ""),
  bullets: normalizeBullets(firstDefined(term.bullets, term.terms, term.Bullets, term.Terms)),
  createdAt: firstDefined(
    term.createdAt,
    term.createdDate,
    term.createdDateTime,
    term.createdOn,
    term.createdOnUtc,
    term.dateCreated,
    term.creationDate,
    term.created_at,
    term.CreatedAt,
    term.CreatedDate,
    term.CreatedDateTime,
    term.CreatedOn,
    Object.entries(term).find(([key]) => /creat.*(at|date|time|on)|(date|time).*creat/i.test(key))?.[1]
  ),
  updatedAt: firstDefined(term.updatedAt, term.updatedDate, term.updatedOn, term.UpdatedAt),
});

const normalizeResponse = (response, isList = false) => {
  const body = response.data;
  if (!body?.success) return body;
  return { ...body, data: isList ? (Array.isArray(body.data) ? body.data.map(normalizeTerm) : []) : normalizeTerm(body.data) };
};

/**
 * Fetch list of all active terms and conditions.
 * Returns array of objects ({ id, title, createdAt, updatedAt }).
 */
export const getTerms = async () => {
  const response = await api.get(ENDPOINTS.TERMS_AND_CONDITIONS.BASE);
  return normalizeResponse(response, true);
};

/**
 * Fetch full details of a single terms and condition by ID.
 * Returns full object ({ id, title, bullets, createdAt, updatedAt }).
 */
export const getTerm = async (id) => {
  const response = await api.get(ENDPOINTS.TERMS_AND_CONDITIONS.BY_ID(id));
  return normalizeResponse(response);
};

/**
 * Create a new terms and condition template.
 * @param {Object} data - { title: string, bullets: Array<string> }
 */
export const createTerm = async (data) => {
  const payload = {
    title: data.title || "",
    bullets: Array.isArray(data.bullets) ? data.bullets : []
  };
  const response = await api.post(ENDPOINTS.TERMS_AND_CONDITIONS.BASE, payload);
  return response.data;
};

/**
 * Update an existing terms and condition template.
 * @param {number|string} id
 * @param {Object} data - { title: string, bullets: Array<string> }
 */
export const updateTerm = async (id, data) => {
  const payload = {
    title: data.title || "",
    bullets: Array.isArray(data.bullets) ? data.bullets : []
  };
  const response = await api.put(ENDPOINTS.TERMS_AND_CONDITIONS.BY_ID(id), payload);
  return response.data;
};

/**
 * Soft delete a terms and condition template.
 * @param {number|string} id
 */
export const deleteTerm = async (id) => {
  const response = await api.delete(ENDPOINTS.TERMS_AND_CONDITIONS.BY_ID(id));
  return response.data;
};
