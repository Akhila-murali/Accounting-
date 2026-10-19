import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import TermsTable from '../../components/terms/TermsTable.jsx';
import TermsForm from '../../components/terms/TermsForm.jsx';
import TermsDetails from '../../components/terms/TermsDetails.jsx';
import Button from '../../components/common/Button.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';
import {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
} from '../../services/terms.js';

export default function TermsAndConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal state: null | 'add' | 'edit'
  const [modalMode, setModalMode] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirm state
  const [termToDelete, setTermToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

 const fetchTerms = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await getTerms();

    if (response?.success) {
      const sortedTerms = [...(response.data || [])].sort((a, b) => {
        return Number(b.id) - Number(a.id);
      });

      setTerms(sortedTerms);
    } else {
      setError(response?.message || 'Failed to retrieve terms and conditions.');
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
      'An error occurred while loading terms and conditions.'
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTerms();
}, []);

  const handleOpenAdd = () => {
    setSelectedTerm(null);
    setIsDetailsOpen(false);
    setModalMode('add');
  };

  const handleOpenEdit = async (term) => {
    try {
      const response = await getTerm(term.id);
      if (response?.success && response.data) {
        setSelectedTerm(response.data);
        setModalMode('edit');
      } else {
        showToast(response?.message || 'Failed to retrieve terms details.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error loading terms details.', 'error');
    }
  };

  const handleOpenDelete = (term) => {
    setTermToDelete(term);
  };

  const handleOpenView = async (term) => {
    try {
      const response = await getTerm(term.id);
      if (response?.success && response.data) {
        setSelectedTerm(response.data);
        setIsDetailsOpen(true);
      } else {
        showToast(response?.message || 'Failed to retrieve terms details.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error loading terms details.', 'error');
    }
  };

  const handleSave = async (title, bullets) => {
    setIsSubmitting(true);

    try {
      const payload = { title, bullets };
      const response = modalMode === 'add'
        ? await createTerm(payload)
        : await updateTerm(selectedTerm.id, payload);

      if (response?.success) {
        showToast(
          response.message || `Terms & Conditions ${modalMode === 'add' ? 'added' : 'updated'} successfully.`,
          'success'
        );
        setModalMode(null);
        setSelectedTerm(null);
        setIsDetailsOpen(false);
        fetchTerms();
      } else {
        showToast(response?.message || 'Failed to save terms and conditions.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Server error occurred while saving terms and conditions.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!termToDelete) return;
    setIsDeleting(true);

    try {
      const response = await deleteTerm(termToDelete.id);
      if (response?.success) {
        showToast(response.message || 'Terms & Conditions deleted successfully.', 'success');
        setTermToDelete(null);
        if (selectedTerm?.id === termToDelete.id) {
          setSelectedTerm(null);
          setIsDetailsOpen(false);
        }
        fetchTerms();
      } else {
        showToast(response?.message || 'Failed to delete terms and conditions.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting terms and conditions.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorderBullets = async (bullets) => {
    if (!selectedTerm) return;
    const previousBullets = selectedTerm.bullets;
    setSelectedTerm((current) => ({ ...current, bullets }));
    try {
      const response = await updateTerm(selectedTerm.id, { title: selectedTerm.title, bullets });
      
      if (!response?.success) throw new Error(response?.message || 'Failed to reorder bullets.');
      setTerms((current) => current.map((term) => term.id === selectedTerm.id ? { ...term, bullets } : term));
      showToast(response.message || 'Bullet order updated successfully.');
    } catch (err) {
      setSelectedTerm((current) => ({ ...current, bullets: previousBullets }));
      showToast(err.response?.data?.message || err.message || 'Failed to reorder bullets.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-stone-800 relative">

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 m-0">Terms & Conditions</h1>
          <p className="text-stone-500 text-sm m-0 mt-1">Create, manage and organize your terms & conditions.</p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          <span className="hidden sm:inline">Add Terms & Condition</span>
        </Button>
      </div>

      {/* Table */}
      <div className="w-full">
        <TermsTable
          terms={terms}
          loading={loading}
          error={error}
          fetchTerms={fetchTerms}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenView}
          selectedTerm={selectedTerm}
          isDetailsOpen={isDetailsOpen}
        />

        {isDetailsOpen && selectedTerm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4" onClick={() => setIsDetailsOpen(false)}>
            <div className="relative w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
              <TermsDetails 
                isDetailsOpen={isDetailsOpen}
                setIsDetailsOpen={setIsDetailsOpen}
                selectedTerm={selectedTerm}
                handleOpenEdit={handleOpenEdit}
                handleOpenDelete={handleOpenDelete}
                onReorderBullets={handleReorderBullets}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <TermsForm
          mode={modalMode}
          initialData={selectedTerm}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {termToDelete && (
        <DeleteConfirmationModal
          title="Delete Terms"
          message={<>Are you sure you want to delete <span className="font-semibold text-stone-800">{termToDelete.title}</span>?</>}
          isDeleting={isDeleting}
          onCancel={() => setTermToDelete(null)}
          onConfirm={handleDeleteExecute}
        />
      )}
    </div>
  );
}
