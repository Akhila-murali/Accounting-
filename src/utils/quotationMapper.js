const emptyDefaultData = {
  productName: '',
  productSubtitle: '',
  proposalTitle: '',
  solutionFeatures: [],
  preparedForLabel: '',
  preparedForDescription: '',
};

const toDateInput = (value) => {
  if (!value || String(value).startsWith('0001-01-01')) {
    return new Date().toISOString().split('T')[0];
  }

  return String(value).split('T')[0];
};

const escapeHtml = (value = '') => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
};

const tableToHtml = (tableData = {}) => {
  const htmlRows = [];

  if (tableData.hasHeader && tableData.headers?.length) {
    const headerCells = tableData.headers.map((header) => {
      return `<th><p>${escapeHtml(header)}</p></th>`;
    });

    htmlRows.push(`<tr>${headerCells.join('')}</tr>`);
  }

  (tableData.rows || []).forEach((row) => {
    const cells = row.map((value) => {
      return `<td><p>${escapeHtml(value)}</p></td>`;
    });

    htmlRows.push(`<tr>${cells.join('')}</tr>`);
  });

  return `<table><tbody>${htmlRows.join('')}</tbody></table>`;
};

const htmlToTable = (html = '') => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const tableRows = Array.from(wrapper.querySelectorAll('tr'));
  const hasHeader = Boolean(wrapper.querySelector('th'));

  const values = tableRows.map((row) => {
    return Array.from(row.children).map((cell) => {
      return cell.textContent.trim();
    });
  });

  const columnCount = values.reduce((largest, row) => {
    return Math.max(largest, row.length);
  }, 0);

  const headers = hasHeader
    ? values[0] || []
    : Array.from({ length: columnCount }, () => '');

  const rows = hasHeader ? values.slice(1) : values;

  return {
    hasHeader,
    headers,
    rows,
  };
};

const getEditorBlockType = (apiType) => {
  if (apiType === 'heading') {
    return 'Heading';
  }

  if (apiType === 'table') {
    return 'Table';
  }

  if (apiType === 'terms') {
    return 'terms';
  }

  return 'Paragraph';
};

const apiBlockToEditor = (block = {}) => {
  const id = block.id || block.blockId;
  const type = block.type || block.blockType;
  const data = block.data ?? block.content;

  if (type === 'terms') {
    return {
      id,
      type: 'terms',
      content: '',
      terms: [
        {
          id: data?.sourceTermId || null,
          title: data?.title || '',
          bullets: data?.bullets || data?.items || [],
        },
      ],
      isOpen: true,
    };
  }

  const tableData = type === 'table'
    ? {
        ...data,
        headers: data?.headers || data?.columns || [],
      }
    : null;

  const content = type === 'table'
    ? tableToHtml(tableData)
    : data?.text ?? data ?? '';

  return {
    id,
    type: getEditorBlockType(type),
    content,
    terms: [],
    isOpen: false,
  };
};
const apiSectionToEditor = (section = {}) => {
  const apiBlocks = section.content?.blocks || [];
  const sectionType = String(section.sectionType || 'custom').toLowerCase();

  const savedPricing =
    section.pricing || section.content?.pricing;

  const pricing = sectionType === 'pricing'
    ? {
        amount: savedPricing?.amount ?? '',
        discountType:
          savedPricing?.discountType || 'Percentage',
        discountValue:
          savedPricing?.discountValue ?? '',
        gstSlabId: savedPricing?.gstSlabId ?? '',
        preview:
          savedPricing?.totalAmount !== undefined
            ? savedPricing
            : null,
      }
    : undefined;

  return {
    id: section.id,
    sectionType,
    title: section.title || '',
    subtitle: section.subtitle || '',
    blocks: apiBlocks.map(apiBlockToEditor),
    pricing,
    isOpen: apiBlocks.some((block) => (block.type || block.blockType) === 'terms'),
    isSaved: true,
  };
};

export const mapQuotationToEditor = (quotation = {}) => {
  const apiSections = quotation.sections || [];

  const sortedSections = [...apiSections].sort((first, second) => {
    return Number(first.displayOrder) - Number(second.displayOrder);
  });

  return {
    id: quotation.id,

    status: Number(quotation.status ?? 0),

    defaultData: {
      ...emptyDefaultData,
      ...(quotation.defaultData || {}),
      solutionFeatures:
        quotation.defaultData?.solutionFeatures || [],
    },

    metadata: {
      proposalReference:
        quotation.proposalReference?.trim() || '',

      dateOfIssue: toDateInput(
        quotation.dateOfIssue
      ),

      validityPeriod:
        quotation.validityPeriod ?? 30,

      siteLocation:
        quotation.siteLocation || '',

      documentClassification:
        quotation.documentClassification || '',

      submittedByCompanyId:
        quotation.submittedBy?.id ||
        quotation.submittedByCompanyId ||
        '',

      submittedToCompanyId:
        quotation.submittedTo?.id ||
        quotation.submittedToCompanyId ||
        '',
    },

    sections: sortedSections.map(apiSectionToEditor),
  };
};

export const mapDraftToEditor = (draft = {}) => {
  const content = draft.content || {};
  const apiSections = content.sections || [];

  const sortedSections = [...apiSections].sort((first, second) => {
    return Number(first.displayOrder) - Number(second.displayOrder);
  });

  return {
    draftId: draft.draftId || null,
    quotationId: draft.quotationId || null,
    version: draft.version ?? null,

    defaultData: {
      ...emptyDefaultData,
      ...(content.defaultData || {}),
      solutionFeatures:
        content.defaultData?.solutionFeatures || [],
    },

    metadata: {
      proposalReference:
        content.proposalReference?.trim() || '',

      dateOfIssue: toDateInput(
        content.dateOfIssue
      ),

      validityPeriod:
        content.validityPeriod ?? 30,

      siteLocation:
        content.siteLocation || '',

      documentClassification:
        content.documentClassification || '',

      submittedByCompanyId:
        content.submittedByCompanyId || '',

      submittedToCompanyId:
        content.submittedToCompanyId || '',
    },

    sections: sortedSections.map(apiSectionToEditor),
  };
};

const termsBlockToApi = (block) => {
  const terms = block.terms || [];

  return terms.map((term, index) => {
    const id = terms.length === 1
      ? block.id
      : `${block.id}-${term.id ?? index}`;

    return {
      id,
      type: 'terms',
      data: {
        sourceTermId: term.id ?? null,
        title: term.title || '',
        bullets: term.bullets || [],
      },
    };
  });
};

const editorBlockToApi = (block) => {
  if (block.type === 'terms') {
    return termsBlockToApi(block);
  }

  const type = block.type.toLowerCase();

  if (block.type === 'Table') {
    const table = htmlToTable(block.content);

    return [
      {
        id: block.id,
        type,
        data: {
          hasHeader: table.hasHeader,
          columns: table.headers,
          rows: table.rows,
        },
      },
    ];
  }

  return [
    {
      id: block.id,
      type,
      data: {
        text: block.content || '',
      },
    },
  ];
};
const editorSectionToApi = (section, index) => {
  const blocks = section.blocks || [];

  const numericId = Number(section.id);

  return {
    id: Number.isInteger(numericId)
      ? numericId
      : 0,

    displayOrder: index + 1,

    sectionType: section.sectionType === 'pricing' ? 'Pricing' : 'Custom',

    title: section.title || '',

    subtitle: section.subtitle || '',

    pricing: section.sectionType === 'pricing'
      ? {
          amount: Number(section.pricing?.amount || 0),
          discountType: section.pricing?.discountType || 'Percentage',
          discountValue: Number(section.pricing?.discountValue || 0),
          gstSlabId: Number(section.pricing?.gstSlabId),
        }
      : undefined,

    content: section.sectionType === 'pricing'
      ? null
      : {
          version: 1,
          blocks: blocks.flatMap(editorBlockToApi),
        },
  };
};

export const buildDraftContent = ({
  defaultData,
  metadata,
  sections,
}) => {
  return {
    proposalReference:
      metadata.proposalReference || '',

    dateOfIssue:
      metadata.dateOfIssue || null,

    validityPeriod:
      Number(metadata.validityPeriod || 0),

    siteLocation:
      metadata.siteLocation || '',

    documentClassification:
      metadata.documentClassification || '',

    submittedByCompanyId:
      metadata.submittedByCompanyId
        ? Number(metadata.submittedByCompanyId)
        : null,

    submittedToCompanyId:
      metadata.submittedToCompanyId
        ? Number(metadata.submittedToCompanyId)
        : null,

    defaultData,

    sections: sections.map(editorSectionToApi),
  };
};
