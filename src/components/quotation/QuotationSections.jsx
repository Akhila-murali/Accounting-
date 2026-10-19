import { useState } from 'react';
import {BadgeIndianRupee, ChevronDown,FileText,GripVertical,Heading1,List, Pilcrow, Plus, Save,Table2,Trash2, X,} from 'lucide-react';
import Button from '../common/Button.jsx';
import QuotationBlockEditor from './QuotationBlockEditor.jsx';
import QuotationPricing from './QuotationPricing.jsx';

const blockTypes = [
  { name: 'Heading', type: 'Heading', icon: Heading1 },
  { name: 'Paragraph', type: 'Paragraph', icon: Pilcrow },
  { name: 'Terms & Condition', type: 'terms', icon: List },
  { name: 'Table', type: 'Table', icon: Table2 },
];

const moveItem = (items, fromIndex, toIndex) => {
  const updatedItems = [...items];
  const [movedItem] = updatedItems.splice(fromIndex, 1);
  updatedItems.splice(toIndex, 0, movedItem);

  return updatedItems;
};

export default function QuotationSections({
  onSectionsChange,
  initialSections = [],
}) {
  const [sections, setSections] = useState(initialSections);

  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dropTargetBlockId, setDropTargetBlockId] = useState(null);

  // Update local sections and inform parent.
  const updateSections = (updatedSections) => {
    setSections(updatedSections);
    onSectionsChange(updatedSections);
  };

  const handleCreateSection = (sectionType = 'custom') => {
    const isPricing = sectionType === 'pricing';

    const newSection = {
      id: `section-${crypto.randomUUID()}`,
      sectionType,
      title: isPricing ? 'Pricing' : '',
      subtitle: isPricing ? 'Pricing details' : '',
      blocks: [],
      isOpen: true,
      isSaved: false,
      pricing: isPricing
        ? {
            amount: '',
            discountType: 'Percentage',
            discountValue: '',
            gstSlabId: '',
          }
        : undefined,
    };

    updateSections([...sections, newSection]);
  };

  const handleUpdateSection = (sectionIndex, changes) => {
    const updatedSections = [...sections];

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      ...changes,
    };

    updateSections(updatedSections);
  };

  const handleDeleteSection = (sectionIndex) => {
    const updatedSections = sections.filter(
      (_, index) => index !== sectionIndex
    );

    updateSections(updatedSections);
  };

  const handleToggleSection = (sectionIndex) => {
    const updatedSections = [...sections];

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      isOpen: !updatedSections[sectionIndex].isOpen,
    };

    // UI-only change. No autosave needed.
    setSections(updatedSections);
  };

  const handleReorderSection = (targetId) => {
    if (!draggedSectionId || draggedSectionId === targetId) {
      return;
    }

    const fromIndex = sections.findIndex(
      (section) => section.id === draggedSectionId
    );

    const toIndex = sections.findIndex(
      (section) => section.id === targetId
    );

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const reorderedSections = moveItem(
      sections,
      fromIndex,
      toIndex
    );

    updateSections(reorderedSections);

    setDraggedSectionId(null);
    setDropTargetId(null);
  };

  const handleAddBlock = (sectionIndex, type) => {
    const newBlock = {
      id: `${type === 'terms' ? 'term-block' : 'block'}-${crypto.randomUUID()}`,
      type,
      content: '',
      terms: [],
      isOpen: true,
    };

    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];

    updatedSections[sectionIndex] = {
      ...section,
      blocks: [...section.blocks, newBlock],
    };

    updateSections(updatedSections);
  };

 const handleUpdateBlock = (
  sectionIndex,
  blockIndex,
  content,
  selectedTerms
) => {
  const section = sections[sectionIndex];
  const updatedBlocks = [...section.blocks];
  const block = updatedBlocks[blockIndex];

  updatedBlocks[blockIndex] = {
    ...block,
    content: content !== undefined ? content : block.content,
    terms: selectedTerms !== undefined ? selectedTerms : block.terms,
  };

  handleUpdateSection(sectionIndex, {
    blocks: updatedBlocks,
  });
};

const handleRemoveBlock = (sectionIndex, blockIndex) => {
  const section = sections[sectionIndex];

  const updatedBlocks = section.blocks.filter(
    (_, index) => index !== blockIndex
  );

  handleUpdateSection(sectionIndex, {
    blocks: updatedBlocks,
  });
};

  const handleToggleBlock = (sectionIndex, blockIndex) => {
    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];
    const updatedBlocks = [...section.blocks];

    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      isOpen: !updatedBlocks[blockIndex].isOpen,
    };

    updatedSections[sectionIndex] = {
      ...section,
      blocks: updatedBlocks,
    };

    setSections(updatedSections);
  };

  const handleReorderBlock = (sectionIndex, targetBlockId) => {
    if (!draggedBlock) {
      return;
    }

    const section = sections[sectionIndex];

    if (
      draggedBlock.sectionId !== section.id ||
      draggedBlock.blockId === targetBlockId
    ) {
      return;
    }

    const fromIndex = section.blocks.findIndex(
      (block) => block.id === draggedBlock.blockId
    );

    const toIndex = section.blocks.findIndex(
      (block) => block.id === targetBlockId
    );

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const reorderedBlocks = moveItem(
      section.blocks,
      fromIndex,
      toIndex
    );

   handleUpdateSection(sectionIndex, {
  blocks: reorderedBlocks,
});

    setDraggedBlock(null);
    setDropTargetBlockId(null);
  };

const handleSaveSection = (sectionIndex) => {
  const section = sections[sectionIndex];

  const savedData = {
    title: section.title,
    subtitle: section.subtitle,
    blocks: section.blocks,
    pricing: section.pricing,
  };

  handleUpdateSection(sectionIndex, {
    isSaved: true,
    isOpen: false,
    savedData,
  });
};

const handleDiscardSection = (sectionIndex) => {
  const section = sections[sectionIndex];

  if (!section.isSaved) {
    handleDeleteSection(sectionIndex);
    return;
  }

  handleUpdateSection(sectionIndex, {
    ...section.savedData,
    isOpen: false,
  });
};

  const handleSectionDragStart = (event, sectionId) => {
    event.stopPropagation();

    setDraggedSectionId(sectionId);

    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (event, sectionId) => {
    if (!draggedSectionId) {
      return;
    }

    event.preventDefault();

    setDropTargetId(sectionId);
  };

  const handleSectionDrop = (event, sectionId) => {
    event.preventDefault();

    handleReorderSection(sectionId);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    setDropTargetId(null);
  };

  const handleBlockDragStart = (
    event,
    sectionId,
    blockId
  ) => {
    event.stopPropagation();

    setDraggedBlock({
      sectionId,
      blockId,
    });

    event.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (
    event,
    sectionId,
    blockId
  ) => {
    if (!draggedBlock) {
      return;
    }

    if (draggedBlock.sectionId !== sectionId) {
      return;
    }

    event.preventDefault();

    setDropTargetBlockId(blockId);
  };

  const handleBlockDrop = (
    event,
    sectionIndex,
    blockId
  ) => {
    event.preventDefault();

    handleReorderBlock(sectionIndex, blockId);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlock(null);
    setDropTargetBlockId(null);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <List size={18} className="text-stone-500" />

          <h2 className="m-0 text-base font-bold text-stone-900">
            Sections
          </h2>

          <span className="rounded-lg bg-[#fbf5e7] px-2.5 py-1 text-xs font-bold text-[#8c6723]">
            <span className="sm:hidden">{sections.length}</span>
            <span className="hidden sm:inline">{sections.length} sections</span>
          </span>
        </div>

        <CreateSectionMenu onCreate={handleCreateSection} />
      </div>  

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-5 pb-12 pt-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <FileText size={21} />
          </div>

          <h3 className="mb-1 mt-4 text-sm font-bold text-stone-800">
            No sections created
          </h3>

          <p className="mb-5 mt-0 text-xs text-stone-500">
            Create a section to start adding quotation content.
          </p>
        </div>
      )}

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const isSectionDropTarget =
          dropTargetId === section.id &&
          draggedSectionId !== section.id;

        return (
          <div
            key={section.id}
            onDragOver={(event) =>
              handleSectionDragOver(event, section.id)
            }
            onDrop={(event) =>
              handleSectionDrop(event, section.id)
            }
            className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${
              isSectionDropTarget
                ? 'border-[#c5a059] ring-2 ring-[#c5a059]/15'
                : 'border-stone-200'
            }`}
          >
            {/* Section Header */}
            <div
              onClick={() =>
                handleToggleSection(sectionIndex)
              }
              className="flex cursor-pointer items-center gap-2.5 border-b border-stone-100 px-5 py-4"
            >
              <span
                draggable
                onDragStart={(event) =>
                  handleSectionDragStart(
                    event,
                    section.id
                  )
                }
                onDragEnd={handleSectionDragEnd}
                onClick={(event) =>
                  event.stopPropagation()
                }
                title="Drag to reorder section"
                className="inline-flex cursor-grab text-stone-400 hover:text-stone-700 active:cursor-grabbing"
              >
                <GripVertical size={17} />
              </span>

              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                  section.sectionType === 'pricing'
                    ? 'bg-brand-gold-light text-brand-gold'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                <span className="sm:hidden">{sectionIndex + 1}</span>
                <span className="hidden sm:inline">SECTION {sectionIndex + 1}</span>
              </span>

              {section.title && (
                <span className="truncate text-sm font-bold text-stone-900">
                  {section.title}
                </span>
              )}

              <span className="flex-1" />

              <Button variant="unstyled"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteSection(sectionIndex);
                }}
                title="Delete section"
                className="cursor-pointer border-0 bg-transparent p-1 text-rose-500"
              >
                <Trash2 size={14} />
              </Button>

              <ChevronDown
                size={16}
                className={`text-stone-500 transition-transform ${
                  section.isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Pricing Section */}
            {section.isOpen &&
              section.sectionType === 'pricing' && (
                <QuotationPricing
                  pricing={section.pricing}
                  onChange={(pricing) =>
                    handleUpdateSection(
                      sectionIndex,
                      { pricing }
                    )
                  }
                  onDiscard={() =>
                    handleDiscardSection(sectionIndex)
                  }
                  onSave={() =>
                    handleSaveSection(sectionIndex)
                  }
                />
              )}

            {/* Normal Content Section */}
            {section.isOpen &&
              section.sectionType !== 'pricing' && (
                <div className="space-y-5 p-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-700">
                      Section Title
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      value={section.title}
                      onChange={(event) =>
                        handleUpdateSection(
                          sectionIndex,
                          {
                            title: event.target.value,
                          }
                        )
                      }
                      placeholder="Enter section title..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-700">
                      Section Subtitle
                    </label>

                    <input
                      value={section.subtitle}
                      onChange={(event) =>
                        handleUpdateSection(
                          sectionIndex,
                          {
                            subtitle: event.target.value,
                          }
                        )
                      }
                      placeholder="Enter a short section description..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
                    />
                  </div>

                  {/* Add Content */}
                  <div>
                    <p className="mb-2 mt-0 text-xs text-stone-600">
                      Add content
                    </p>

                    <div className="flex flex-nowrap gap-2 sm:flex-wrap">
                      {blockTypes.map((blockType) => {
                        const Icon = blockType.icon;

                        return (
                          <Button
                            key={blockType.name}
                            variant="outline"
                            icon={Icon}
                            title={blockType.name}
                            aria-label={blockType.name}
                            className="!px-2.5 sm:!px-4"
                            onClick={() =>
                              handleAddBlock(
                                sectionIndex,
                                blockType.type
                              )
                            }
                          >
                            <span className="hidden sm:inline">
                              {blockType.name}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Blocks */}
                  <div className="max-h-[32rem] overflow-y-auto pr-1 no-scrollbar">
                    {section.blocks.length === 0 && (
                      <div className="rounded-xl border border-dashed border-stone-300 px-5 pb-10 pt-12 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                          <FileText size={20} />
                        </div>

                        <h3 className="mb-1 mt-4 text-sm font-bold text-stone-800">
                          This section is empty
                        </h3>

                        <p className="mb-5 mt-0 text-xs text-stone-500">
                          Add content blocks using the
                          buttons above.
                        </p>

                        <Button
                          variant="outline"
                          icon={Plus}
                          onClick={() =>
                            handleAddBlock(
                              sectionIndex,
                              'Paragraph'
                            )
                          }
                          className="border-[#c5a059] text-[#8c6723]"
                        >
                          Add Block
                        </Button>
                      </div>
                    )}

                    {section.blocks.length > 0 && (
                      <div className="space-y-3">
                        {section.blocks.map(
                          (block, blockIndex) => {
                            const isBlockDropTarget =
                              dropTargetBlockId ===
                                block.id &&
                              draggedBlock?.blockId !==
                                block.id;

                            return (
                              <div
                                key={block.id}
                                onDragOver={(event) =>
                                  handleBlockDragOver(
                                    event,
                                    section.id,
                                    block.id
                                  )
                                }
                                onDrop={(event) =>
                                  handleBlockDrop(
                                    event,
                                    sectionIndex,
                                    block.id
                                  )
                                }
                                className={`overflow-hidden rounded-lg transition-all ${
                                  isBlockDropTarget
                                    ? 'ring-2 ring-[#c5a059]/15'
                                    : ''
                                } ${
                                  block.type === 'terms'
                                    ? ''
                                    : 'border border-stone-200'
                                }`}
                              >
                                {/* Block Header */}
                                {block.type !== 'terms' && <div
                                  onClick={() =>
                                    handleToggleBlock(
                                      sectionIndex,
                                      blockIndex
                                    )
                                  }
                                  className="flex cursor-pointer items-center gap-2 bg-stone-50/60 px-3 py-2"
                                >
                                  <span
                                    draggable
                                    onDragStart={(
                                      event
                                    ) =>
                                      handleBlockDragStart(
                                        event,
                                        section.id,
                                        block.id
                                      )
                                    }
                                    onDragEnd={
                                      handleBlockDragEnd
                                    }
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                    title="Drag to reorder block"
                                    className="inline-flex cursor-grab text-stone-400 hover:text-stone-700 active:cursor-grabbing"
                                  >
                                    <GripVertical
                                      size={14}
                                    />
                                  </span>

                                  <span className="flex-1 text-xs font-semibold text-stone-700">
                                    {block.type}
                                  </span>

                                  <Button variant="unstyled"
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();

                                      handleRemoveBlock(
                                        sectionIndex,
                                        blockIndex
                                      );
                                    }}
                                    className="cursor-pointer border-0 bg-transparent p-0 text-rose-500"
                                  >
                                    <Trash2 size={13} />
                                  </Button>

                                  <ChevronDown
                                    size={14}
                                    className={`text-stone-500 transition-transform ${
                                      block.isOpen
                                        ? 'rotate-180'
                                        : ''
                                    }`}
                                  />
                                </div>}

                                {/* Block Editor */}
                                {(block.isOpen || block.type === 'terms') && (
                                  <div className={block.type === 'terms' ? '' : 'border-t border-stone-100 p-3'}>
                                    <QuotationBlockEditor
                                      block={block}
                                      isTermsOpen={block.isOpen}
                                      termsHeaderActions={block.type === 'terms' ? (
                                        <>
                                          <span
                                            draggable
                                            onDragStart={(event) => handleBlockDragStart(event, section.id, block.id)}
                                            onDragEnd={handleBlockDragEnd}
                                            title="Drag to reorder block"
                                            className="inline-flex cursor-grab text-stone-400 hover:text-stone-700 active:cursor-grabbing"
                                          >
                                            <GripVertical size={14} />
                                          </span>
                                          <Button variant="unstyled" type="button" title="Remove terms" onClick={() => handleRemoveBlock(sectionIndex, blockIndex)} className="cursor-pointer border-0 bg-transparent p-0 text-rose-500">
                                            <Trash2 size={13} />
                                          </Button>
                                          <Button variant="unstyled" type="button" title={block.isOpen ? 'Collapse terms' : 'Expand terms'} onClick={() => handleToggleBlock(sectionIndex, blockIndex)} className="cursor-pointer border-0 bg-transparent p-0 text-stone-500">
                                            <ChevronDown size={14} className={`transition-transform ${block.isOpen ? 'rotate-180' : ''}`} />
                                          </Button>
                                        </>
                                      ) : null}
                                      onChange={(
                                        content,
                                        selectedTerms
                                      ) =>
                                        handleUpdateBlock(
                                          sectionIndex,
                                          blockIndex,
                                          content,
                                          selectedTerms
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-stone-100 pt-2">
                    <Button
                      variant="outline"
                      icon={X}
                      onClick={() =>
                        handleDiscardSection(
                          sectionIndex
                        )
                      }
                    >
                      Discard
                    </Button>

                    <Button
                      icon={Save}
                      disabled={!section.title.trim()}
                      onClick={() =>
                        handleSaveSection(sectionIndex)
                      }
                    >
                      Save Section
                    </Button>
                  </div>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}

function CreateSectionMenu({ onCreate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group relative">
      <Button
        variant="outline"
        icon={Plus}
        onClick={() => setIsOpen(!isOpen)}
        className="!px-2.5 border-[#c5a059] text-[#8c6723] sm:!px-4"
      >
        <span className="hidden sm:inline">Create Section</span>
      </Button>

      <div
        className={`absolute right-0 top-full z-30 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-xl ${
          isOpen
            ? 'block'
            : 'hidden group-hover:block'
        }`}
      >
        <Button variant="unstyled"
          type="button"
          onClick={() => {
            onCreate('custom');  //handleCreateSection('custom');
            setIsOpen(false);
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left hover:bg-stone-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText size={16} />
          </span>

          <span>
            <span className="block text-xs font-bold text-stone-800">
              Content Section
            </span>

            <span className="mt-0.5 block text-[10px] text-stone-500">
              Add headings, text and tables
            </span>
          </span>
        </Button>

        <Button variant="unstyled"
          type="button"
          onClick={() => {
            onCreate('pricing');
            setIsOpen(false);
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left hover:bg-brand-gold-light"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold-light text-brand-gold">
            <BadgeIndianRupee size={16} />
          </span>

          <span>
            <span className="block text-xs font-bold text-stone-800">
              Pricing
            </span>

            <span className="mt-0.5 block text-[10px] text-stone-500">
              Calculate quotation totals
            </span>
          </span>
        </Button>
      </div>
    </div>
  );
}
