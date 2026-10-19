import { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Edit2, AlertCircle, Loader2, GripVertical } from 'lucide-react';
import Button from '../common/Button.jsx';

// Converts a block of pasted text into an array of bullet strings
function parseTextToBullets(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[\s•\-\*\d+\.\)]+/, '').trim()) // for remove leading bullets, numbers, dashes, asterisks, etc.
    .filter((line) => line.length > 0);
}

export default function TermsForm({
  mode,           // 'add' | 'edit'
  initialData,    // { title, bullets } for edit
  onSave,         // (title, bullets) => void
  onClose,
  isSubmitting,
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [pasteText, setPasteText] = useState('');
  const [bullets, setBullets] = useState(initialData?.bullets || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [errors, setErrors] = useState({});
  const [draggedBullet, setDraggedBullet] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Convert pasted text into editable bullets
  const handleProcessBullets = () => {
    const parsed = parseTextToBullets(pasteText);
    if (parsed.length === 0) return;
    setBullets((prev) => [...prev, ...parsed]);
    setPasteText('');
  };

  const handleAddBullet = () => {
    setBullets((prev) => [...prev, '']);
    setEditingIndex(bullets.length);
    setEditingText('');
  };

  const handleDeleteBullet = (index) => {
    setBullets((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const reorderBullet = (targetIndex) => {
    if (draggedBullet === null || draggedBullet === targetIndex) return;
    setBullets((current) => {
      const reordered = [...current];
      const [moved] = reordered.splice(draggedBullet, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });
    setDraggedBullet(null);
    setDropTarget(null);
    setEditingIndex(null);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingText(bullets[index]);
  };

  const handleSaveEdit = (index) => {
    const updated = [...bullets];
    updated[index] = editingText.trim();
    if (!editingText.trim()) {
      updated.splice(index, 1);
    }
    setBullets(updated);
    setEditingIndex(null);
    setEditingText('');
  };

const validate = () => {
  const newErrors = {};

  if (!title.trim()) {
    newErrors.title = 'Title is required';
  }

  const validBullets = bullets.filter((bullet) => bullet.trim());

  if (validBullets.length === 0) {
    newErrors.bullets = 'At least one bullet is required';
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(title.trim(), bullets.filter((b) => b.trim()));
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4 shrink-0">
          <h2 className="m-0 text-base font-bold text-stone-900">
            {mode === 'add' ? 'Add Terms & Conditions' : 'Edit Terms & Conditions'}
          </h2>
          <Button variant="unstyled"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent p-1 text-stone-400"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Form Body */}
     <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
               onChange={(e) => {  setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: '' }));
}}
                placeholder="e.g. Standard Terms & Conditions"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-stone-50/50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.title ? 'border-red-300 focus:ring-red-500/20' : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title}
                </p>
              )}
            </div>

            {/* Paste Terms → Process → Editable Bullets (one connected section) */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                Paste Terms
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your terms and conditions here..."
                rows={4}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-50/50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all resize-none"
              />
              <p className="text-xs text-stone-400 mt-1">Paste full terms text. We'll convert it into bullets for easy editing.</p>
              <Button variant="unstyled"
                type="button"
                onClick={handleProcessBullets}
                disabled={!pasteText.trim()}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#8c6723] bg-[#fbf5e7] border border-[#c5a059]/40 rounded-xl hover:bg-[#f3e4c6] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                Process Bullets
              </Button>

              {/* Bullets appear right below Process Bullets in the same section */}
              {(bullets.length > 0 || errors.bullets) && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                    Bullets (Editable)
                  </label>
                  {errors.bullets && (
                    <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.bullets}
                    </p>
                  )}

                    <div className="space-y-2">
                      {bullets.map((bullet, index) => (
                        <div key={index} onDragOver={(event) => { event.preventDefault(); setDropTarget(index); }} onDrop={(event) => { event.preventDefault(); reorderBullet(index); }} className={`flex items-center gap-2 bg-stone-50 border rounded-xl px-3 py-2 transition-all ${dropTarget === index && draggedBullet !== index ? 'border-[#c5a059] ring-2 ring-[#c5a059]/15' : 'border-stone-200'}`}>
                          <span draggable onDragStart={() => setDraggedBullet(index)} onDragEnd={() => { setDraggedBullet(null); setDropTarget(null); }} title="Drag to reorder bullet" className="inline-flex cursor-grab text-stone-300 hover:text-stone-600 active:cursor-grabbing"><GripVertical size={13}/></span>
                          <span className="text-xs text-stone-400 font-mono w-4 shrink-0">{index + 1}</span>

                          {editingIndex === index ? (
                            <input
                            autoFocus // autoFocus to focus the input when editing starts
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => handleSaveEdit(index)} // for when user clicks outside the input
                            onKeyDown={(e) => { // auto-save on Enter, cancel on Escape
                              if (e.key === 'Enter') {
                                handleSaveEdit(index);
                              }

                              if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            className="flex-1 text-sm bg-transparent border-none outline-none text-stone-800"
                          />
                        ) : (
                          <span className="flex-1 text-sm text-stone-700 leading-relaxed">
                            {bullet || <span className="text-stone-300 italic">Empty bullet</span>}
                          </span>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="unstyled"
                            type="button"
                            onClick={() => handleStartEdit(index)}
                            className="p-1 rounded-lg text-stone-400 hover:text-[#8c6723] hover:bg-[#fbf5e7] transition-all cursor-pointer border-none bg-transparent"
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button variant="unstyled"
                            type="button"
                            onClick={() => handleDeleteBullet(index)}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="unstyled"
                    type="button"
                    onClick={handleAddBullet}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#8c6723] hover:text-[#72521a] cursor-pointer border-none bg-transparent p-0"
                  >
                    <Plus size={14} />
                    Add Bullet
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-white shrink-0">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={bullets.length === 0} className="flex items-center gap-2">
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /><span>Saving...</span></>
              ) : (
                mode === 'add' ? 'Save Terms' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
