import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, Eye, Printer } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Toast from '../../components/common/Toast.jsx';
import CoverInformation from '../../components/quotation/CoverInformation.jsx';
import QuotationMetadata from '../../components/quotation/QuotationMetadata.jsx';
import QuotationSections from '../../components/quotation/QuotationSections.jsx';
import QuotationPreview from '../../components/quotation/QuotationPreview.jsx';

import { getCompanies } from '../../services/company.js';
import { getPricingPreview } from '../../services/pricing.js';

import {
  getQuotationDefaults,
  getQuotation,
  getActiveDrafts,
  getDraft,
  createNewDraft,
  updateDraft,
  commitDraft,
  createEditDraft,
  applyDraft,
} from '../../services/quotation.js';

import {
  buildDraftContent,
  mapDraftToEditor,
  mapQuotationToEditor,
} from '../../utils/quotationMapper.js';

const emptyDefaultData = {
  productName: '',
  productSubtitle: '',
  proposalTitle: '',
  solutionFeatures: [],
  preparedForLabel: '',
  preparedForDescription: '',
};

const initialMetadata = {
  proposalReference: '',
  dateOfIssue: new Date().toISOString().split('T')[0],
  validityPeriod: 30,
  siteLocation: '',
  documentClassification: '',
  submittedByCompanyId: '',
  submittedToCompanyId: '',
};

const getErrorMessage = (requestError, fallback) => (
  requestError.response?.data?.message || requestError.message || fallback
);

const restorePricingPreviews = async (sections) => {
  return Promise.all(
    sections.map(async (section) => {
      const pricing = section.pricing;

      if (
        section.sectionType !== 'pricing' ||
        !pricing ||
        Number(pricing.amount) <= 0 ||
        Number(pricing.gstSlabId) <= 0
      ) {
        return section;
      }

      try {
        const response = await getPricingPreview({
          amount: Number(pricing.amount),
          discountType: pricing.discountType,
          discountValue: Number(pricing.discountValue || 0),
          gstSlabId: Number(pricing.gstSlabId),
        });

        return {
          ...section,
          pricing: {
            ...pricing,
            preview: response?.data || response,
          },
        };
      } catch {
        return section;
      }
    })
  );
};
export default function Quotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDraftId = searchParams.get('draftId');
  const [isInformationOpen, setIsInformationOpen] = useState(true);
  const [defaultData, setDefaultData] = useState(emptyDefaultData);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [sections, setSections] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotationId, setQuotationId] = useState(id || '');
  const [draftId, setDraftId] = useState(null);
  const [draftVersion, setDraftVersion] = useState(null);
  const [draftType, setDraftType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDraftData = async (draft) => {
    const mappedDraft = mapDraftToEditor(draft);
    const draftSections = await restorePricingPreviews(
      mappedDraft.sections
    );

    setDraftId(mappedDraft.draftId);
    setDraftVersion(mappedDraft.version);
    setDraftType(draft.draftType || '');

    if (mappedDraft.quotationId) {
      setQuotationId(mappedDraft.quotationId);
    }

    
    setDefaultData(mappedDraft.defaultData);
setMetadata(mappedDraft.metadata);
    setSections(draftSections);
    setSaveStatus('saved');
  };

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError('');

        const companyResponse = await getCompanies();

        if (!active) {
          return;
        }

        if (companyResponse?.success) {
          setCompanies(companyResponse.data || []);
        }

        // CONTINUE ACTIVE DRAFT
        if (selectedDraftId) {
          const draftResponse = await getDraft(selectedDraftId);

          if (!draftResponse?.success || !draftResponse.data) {
            throw new Error(
              draftResponse?.message || 'Unable to load draft.'
            );
          }

          await loadDraftData(draftResponse.data);
          return;
        }
        if (id) {
          const activeResponse = await getActiveDrafts(); 
          const activeDrafts = activeResponse?.success
            ? activeResponse.data || []
            : [];

          const existingDraft = activeDrafts.find((draft) => (
            String(draft.quotationId) === String(id)
          ));

          if (existingDraft) {
            const draftResponse = await getDraft(existingDraft.draftId);

            if (!draftResponse?.success || !draftResponse.data) {
              throw new Error(
                draftResponse?.message || 'Unable to load quotation draft.'
              );
            }

            await loadDraftData(draftResponse.data);
            return;
          }

          const response = await getQuotation(id);

          if (!response?.success || !response.data) {
            throw new Error(
              response?.message || 'Unable to load quotation.'
            );
          }

          const editor = mapQuotationToEditor(response.data);
          setQuotationId(editor.id);
          setDefaultData(editor.defaultData);
          setMetadata(editor.metadata);
          setSections(editor.sections);
          setSaveStatus('saved');

          return;
        }

        const defaultsResponse = await getQuotationDefaults();

        if (!active) {
          return;
        }

        if (!defaultsResponse?.success || !defaultsResponse.data) {
          throw new Error(
            defaultsResponse?.message ||
              'Unable to load quotation defaults.'
          );
        }

        const defaults = defaultsResponse.data;

        setDefaultData({
          ...emptyDefaultData,
          ...defaults,
          solutionFeatures: defaults.solutionFeatures || [],
        });

        setMetadata({
          ...initialMetadata,

          proposalReference: defaults.proposalReference || '',
          dateOfIssue: defaults.dateOfIssue || initialMetadata.dateOfIssue,
          validityPeriod: defaults.validityPeriod ?? 30,
          siteLocation: defaults.siteLocation || '',
          documentClassification: defaults.documentClassification || '',
          submittedByCompanyId: defaults.submittedByCompanyId || '',
          submittedToCompanyId: defaults.submittedToCompanyId || '',
        });
        setSaveStatus('saved');
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, 'Unable to load quotation.'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPage(); 

    return () => {
      active = false;
    };
  }, [id, selectedDraftId]);

  const handleDefaultDataChange = (data) => {
    setDefaultData(data);
    setSaveStatus('unsaved');
  };

  const handleMetadataChange = (data) => {
    setMetadata(data);
    setError('');
    setSaveStatus('unsaved');
  };

  const handleSectionsChange = (data) => {
    setSections(data);
    setSaveStatus('unsaved');
  };

  const handleSave = async () => {
    const submittedBy = metadata.submittedByCompanyId;
    const submittedTo = metadata.submittedToCompanyId;
    const isSameCompany =
      submittedBy &&
      submittedTo &&
      String(submittedBy) === String(submittedTo);

    if (isSameCompany) {
      setSaveStatus('unsaved');
      setError(
        'Submitted By and Submitted To must be different companies.'
      );
      return null;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      setError('');

      let currentDraftId = draftId;
      let currentVersion = draftVersion;

      // First real change in a new quotation.
      if (!currentDraftId) {
        const draftResponse = id
          ? await createEditDraft(id)
          : await createNewDraft();

        if (!draftResponse?.success || !draftResponse.data) {
          throw new Error(
            draftResponse?.message ||
              'Unable to create draft.'
          );
        }

        currentDraftId = draftResponse.data.draftId;
        currentVersion = draftResponse.data.version;

        setDraftId(currentDraftId);
        setDraftType(
          draftResponse.data.draftType ||
          (id ? 'ExistingQuotationEdit' : 'NewQuotation')
        );

        if (id) {
          setQuotationId(id);
        }
      }

      const content = buildDraftContent({ defaultData, metadata, sections });
      const response = await updateDraft(currentDraftId, {
        version: currentVersion,
        content,
      });

      if (!response?.success || !response.data) {
        throw new Error(
          response?.message ||
            'Unable to save draft.'
        );
      }

      setDraftVersion(response.data.version);

      setSaveStatus('saved');

      return currentDraftId;
    } catch (requestError) {
      setSaveStatus('unsaved');

      setError(getErrorMessage(requestError, 'Unable to save quotation.'));

      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuotation = async () => {
    try {
      setError('');

      const currentDraftId = await handleSave();

      if (!currentDraftId) return;

      setIsSaving(true);

      const isEditDraft = Boolean(id) || draftType === 'ExistingQuotationEdit';
      const response = isEditDraft
        ? await applyDraft(currentDraftId) // save current draft id
        : await commitDraft(currentDraftId); // treat as a new draft quation and commit it

      if (!response?.success) {
        throw new Error(response?.message || 'Unable to save quotation.');
      }

      setMessage(
        isEditDraft
          ? 'Quotation changes saved successfully.'
          : 'Quotation created successfully.'
      );

      navigate('/quotation-list');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save quotation.'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saveStatus !== 'unsaved' || isLoading || isSaving) {
      return undefined;
    }

    const timer =
      window.setTimeout(() => {
        handleSave();
      }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    defaultData,
    metadata,
    sections,
    saveStatus,
    isLoading,
    isSaving,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner className="py-16" />
    );
  }

  return (
    <div className="flex flex-col gap-8 text-stone-800">
      <Toast
        toast={
          message
            ? {
                message,
                type: 'success',
              }
            : error
              ? {
                  message: error,
                  type: 'error',
                }
              : null
        }
        onClose={() => {
          setMessage('');
          setError('');
        }}
      />

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          {(quotationId || selectedDraftId) && (
            <Button variant="unstyled"
              type="button"
              onClick={() => navigate('/quotation-list')}
              className="mb-3 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back
            </Button>
          )}

          <h1 className="text-2xl font-bold text-stone-900 m-0">
            {selectedDraftId
              ? 'Quotation Draft'
              : quotationId
                ? 'Quotation'
                : 'Create Quotation'}
          </h1>

          <p className="text-sm text-stone-500 mt-1 mb-0">
            Build and edit the quotation using reusable sections.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto xl:justify-end">
          {(saveStatus === 'unsaved' || draftId) && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  isSaving
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span>
                {isSaving ? 'Saving draft...' : 'Draft saved'}
              </span>
            </div>
          )}

  <Button
  variant="outline"
  onClick={handleCreateQuotation}
  disabled={isSaving}
  className="bg-white text-stone-800 border-stone-200 hover:bg-stone-50"
>
  Save as Quotation
</Button>

          <Button
            variant="outline"
            icon={Eye}
            onClick={() =>
              setShowPreview(true)
            }
          >
            Preview
          </Button>

          <Button
            icon={Printer}
            onClick={() =>
              setShowPreview(true)
            }
          >
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border border-stone-200/60 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between px-5 py-3">
          <Button variant="unstyled"
            type="button"
            onClick={() => {
              setIsInformationOpen(
                (current) =>
                  !current
              );
            }}
            className="flex flex-1 items-center justify-between bg-white border-0 cursor-pointer text-sm font-bold text-stone-900"
          >
            Quotation Information

            <ChevronDown
              size={17}
              className={
                isInformationOpen
                  ? 'rotate-180'
                  : ''
              }
            />
          </Button>
        </div>

        {isInformationOpen && (
          <div className="px-4 pb-4">
            <fieldset className="border-0 p-0 m-0">
              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
                <CoverInformation
                  data={defaultData}
                  onChange={
                    handleDefaultDataChange
                  }
                />

                <QuotationMetadata
                  data={metadata}
                  onChange={
                    handleMetadataChange
                  }
                  companies={companies}
                  readOnlyReference
                />
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <QuotationSections
        key={
          quotationId || 'new'
        }
        onSectionsChange={
          handleSectionsChange
        }
        initialSections={sections}
      />

      {showPreview && (
        <QuotationPreview
          coverData={{
            brand:
              defaultData.productName,

            proposalTitle:
              defaultData.proposalTitle,

            highlights:
              defaultData.solutionFeatures,

            documentType:
              defaultData.productSubtitle,

            preparedFor:
              defaultData.preparedForLabel,

            operation:
              defaultData.preparedForDescription,
          }}
          metadataData={{
            ...metadata,

            submittedBy:
              companies.find(
                (company) => {
                  return (
                    String(
                      company.id
                    ) ===
                    String(
                      metadata.submittedByCompanyId
                    )
                  );
                }
              )?.companyName || '',

            submittedTo:
              companies.find(
                (company) => {
                  return (
                    String(
                      company.id
                    ) ===
                    String(
                      metadata.submittedToCompanyId
                    )
                  );
                }
              )?.companyName || '',

            classification:
              metadata.documentClassification,
          }}
          sections={sections}
          onClose={() =>
            setShowPreview(false)
          }
        />
      )}
    </div>
  );
}
