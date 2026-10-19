import { useState } from 'react';
import { ScrollText, X, List, Info, GripVertical } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function TermsDetails({
  isDetailsOpen,
  setIsDetailsOpen,
  selectedTerm,
  onReorderBullets,
}) {
  const [draggedBullet, setDraggedBullet] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  if (!isDetailsOpen || !selectedTerm) return null;

  const bullets = Array.isArray(selectedTerm.bullets) ? selectedTerm.bullets : [];
  const reorderBullet = (targetIndex) => {
    if (draggedBullet === null || draggedBullet === targetIndex) return;
    const reordered = [...bullets];
    const [moved] = reordered.splice(draggedBullet, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorderBullets?.(reordered);
    setDraggedBullet(null);
    setDropTarget(null);
  };
  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto text-left">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">

        {/* Top Header Bar: Title & Action Icons */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#fbf5e7] text-[#8c6723] flex items-center justify-center font-bold text-xs">
              <ScrollText size={15} />
            </div>
            <h2 className="text-sm font-bold text-stone-900 m-0">Terms Details</h2>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <Button variant="unstyled"
              onClick={() => setIsDetailsOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer border-none bg-transparent"
              title="Close"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Term Profile Header */}
        <div className="px-5 py-4 border-b border-stone-100 bg-white">
          <h3 className="text-base font-bold text-stone-900 m-0">
            {selectedTerm.title || 'Untitled Terms'}
          </h3>
        </div>

        {/* Content Details Sections */}
        <div className="p-5 space-y-6 bg-white">

          {/* Bullets List */}
          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <List size={13} className="text-[#8c6723]" />
              <span>Terms & Condition Bullets ({bullets.length})</span>
            </h4>

            {bullets.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2 m-0">
                No bullet points added for this template.
              </p>
            ) : (
              <div className="space-y-2">
                {bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    onDragOver={(event) => { event.preventDefault(); setDropTarget(idx); }}
                    onDrop={(event) => { event.preventDefault(); reorderBullet(idx); }}
                    className={`flex items-start gap-2.5 bg-stone-50/70 border rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 transition-all ${dropTarget === idx && draggedBullet !== idx ? 'border-[#c5a059] ring-2 ring-[#c5a059]/15' : 'border-stone-200/60'}`}
                  >
                    <span 
                    draggable
                     onDragStart={() => setDraggedBullet(idx)}
                     onDragEnd={() => { setDraggedBullet(null); 
                     setDropTarget(null); }} title="Drag to reorder bullet" className="inline-flex mt-1 cursor-grab text-stone-300 hover:text-stone-600 active:cursor-grabbing"><GripVertical size={13}/></span>
                    <span className="w-5 h-5 rounded-md bg-[#fbf5e7] text-[#8c6723] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <Info size={13} className="text-[#8c6723]" />
              <span>Template Info</span>
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Template Title</span>
                <span className="text-stone-900 font-bold">{selectedTerm.title || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">Total Bullet Points</span>
                <span className="text-stone-900 font-semibold">{bullets.length} Points</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-stone-500 font-medium">Created At</span>
                <span className="text-stone-900 font-semibold">{formatDate(selectedTerm.createdAt)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
