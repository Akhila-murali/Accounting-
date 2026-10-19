import { useState, useEffect } from 'react';
import {
  Building2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  CreditCard
} from 'lucide-react';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} from '../../services/company';
import CompanyTable from '../../components/company/CompanyTable.jsx';
import CompanyDetails from '../../components/company/CompanyDetails.jsx';
import Button from '../../components/common/Button.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';

const COUNTRY_OPTIONS = ['', 'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Singapore', 'Malaysia', 'Australia', 'Canada'].map((country) => ({ value: country, label: country || 'Select country' }));

const STATUS_OPTIONS = ['A to Z', 'Z to A'];

  const initialFormState = {
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    gstNo: '',
    pan: '',
    phoneNumber: '',
    email: ''
  };

export default function Company() {
  // Data list and state
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback notifications (Toast)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

 const fetchCompanies = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await getCompanies();

    if (response.success) {
      setCompanies(response.data || []);
    } else {
      setError(response.message || 'Failed to retrieve companies.');
    }
  } catch (error) {
    setError(
      error.response?.data?.message ||
      'An error occurred while loading companies.'
    );
  } finally {
    setLoading(false);
  }
};

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setModalMode('add');
  };

  const handleOpenEdit = async (company) => {
    try {
      const res = await getCompany(company.id);
      if (res?.success && res.data) {
        setFormData({
          companyName: res.data.companyName || '',
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          country: res.data.country || '',
          pin: res.data.pin || '',
          gstNo: res.data.gstNo || '',
          pan: res.data.pan || '',
          phoneNumber: res.data.phoneNumber || '',
          email: res.data.email || ''
        });
        setFormErrors({});
        setModalMode('edit');
      } else {
        showToast(res?.message || 'Failed to retrieve company details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error loading company details.', 'error');
    }
  };

  const handleOpenView = async (company) => {
  
    try {
      const res = await getCompany(company.id);
      if (res?.success && res.data) {
        setSelectedCompany(res.data);
        setIsDetailsOpen(true);
      } else {
        showToast(res?.message || 'Failed to retrieve company details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error loading company details.', 'error');
    }
  };

  const handleOpenDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteConfirmOpen(true);
    
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email address';
      }
    }
    if(formData.pin.trim() && isNaN(formData.pin.trim())){
      errors.pin = 'PIN code must be a number';
    }
    if(formData.country.trim().length < 1){
      errors.country = 'Country is required';
    }
   if (formData.phoneNumber.trim()) {
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Enter a valid 10-digit phone number';
    }
  }
      
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let res;
      if (modalMode === 'add') {
        res = await createCompany(formData);
      } else {
        res = await updateCompany(selectedCompany.id, formData);
      }

      if (res?.success) {
        showToast(res.message || `Company ${modalMode === 'add' ? 'created' : 'updated'} successfully.`, 'success');
        setModalMode(null);
        fetchCompanies();

        // Update selectedCompany state so CompanyDetails updates immediately without refresh
        if (modalMode === 'edit' && selectedCompany) {
          if (res.data) {
            setSelectedCompany(res.data);
          } else {
            setSelectedCompany((prev) => ({ ...prev, ...formData }));
          }
        }
      } else {
        showToast(res?.message || 'An error occurred.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Server error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCompany(companyToDelete.id);
      if (res?.success) {
        showToast(res.message || 'Company deleted successfully.', 'success');
        setIsDeleteConfirmOpen(false);
        setCompanyToDelete(null);
        fetchCompanies();
      } else {
        showToast(res?.message || 'Failed to delete company.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting company.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
  fetchCompanies();
}, []);

  return (
    <div className="flex flex-col gap-6 text-stone-800 relative">
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">Companies</h1>
          <p className="text-stone-500 text-sm m-0 mt-1">Manage your company directory.</p>
        </div>
        <Button onClick={handleOpenAdd} aria-label="Add Company" className="px-3 sm:px-4">
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+ Add Company</span>
        </Button>
      </div>

      <div className="w-full">
        <CompanyTable
          companies={companies}
          loading={loading}
          error={error}
          fetchCompanies={fetchCompanies}
          selectedCompany={selectedCompany}
          isDetailsOpen={isDetailsOpen}
          handleOpenView={handleOpenView}
          handleOpenEdit={handleOpenEdit}
          handleOpenDelete={handleOpenDelete}
        />

        {isDetailsOpen && selectedCompany && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4" onClick={() => setIsDetailsOpen(false)}>
            <div className="relative w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
              <CompanyDetails
                isDetailsOpen={isDetailsOpen}
                setIsDetailsOpen={setIsDetailsOpen}
                selectedCompany={selectedCompany}
                handleOpenEdit={handleOpenEdit}
                handleOpenDelete={handleOpenDelete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Company Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-stone-900/40 transition-opacity z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4 shrink-0">
              <h2 className="m-0 text-base font-bold text-stone-900">
                {modalMode === 'add' ? 'Add Company' : 'Edit Company'}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="cursor-pointer border-0 bg-transparent p-1 text-stone-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-6 flex-grow text-left">
              <form onSubmit={handleSave} className="space-y-6 m-0" id="companyForm">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#8c6723] uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2 m-0 mb-4">
                    <Building2 size={13} className="text-[#8c6723]" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Company Name */}
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${formErrors.companyName
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                          }`}
                      />
                      {formErrors.companyName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.companyName}
                        </p>
                      )}
                    </div>

                    {/* GST No */}
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        GST No
                      </label>
                      <input
                        type="text"
                        name="gstNo"
                        value={formData.gstNo}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all font-mono"
                      />
                    </div>

                    {/* PAN */}
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        PAN
                      </label>
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-extrabold text-[#8c6723] uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2 m-0 mb-4">
                    <CreditCard size={13} className="text-[#8c6723]" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Phone Number */}
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all"
                      />
                       {formErrors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 transition-all ${formErrors.email
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-stone-50/50 focus:bg-white'
                          : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059] bg-stone-50/50 focus:bg-white'
                          }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-extrabold text-[#8c6723] uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2 m-0 mb-4">
                    <Building2 size={13} className="text-[#8c6723]" />
                    <span>Address Information</span>
                  </h3>
                  <div className="space-y-4">
                    {/* Address */}
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all"
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Country & PIN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                          Country
                        </label>
                        <div className="relative">
                          <Dropdown
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            options={COUNTRY_OPTIONS}
                            hasError={Boolean(formErrors.country)}
                          />
                           {formErrors.country && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.country}
                        </p>
                      )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                          PIN
                        </label>
                        <input
                          type="text"
                          name="pin"
                          value={formData.pin}
                          onChange={handleInputChange}
                          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 focus:border-[#c5a059] focus:bg-white transition-all"
                        />
                         {formErrors.pin && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.pin}
                        </p>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-white shrink-0">
              <Button
                variant="outline"
                onClick={() => setModalMode(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="companyForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Company'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && companyToDelete && (
        <DeleteConfirmationModal
          title="Delete Company"
          message={<>Are you sure you want to delete <span className="font-semibold text-stone-800">{companyToDelete.companyName}</span>? The company will be removed from the active company list.</>}
          confirmLabel="Delete Company"
          isDeleting={isDeleting}
          onCancel={() => { setIsDeleteConfirmOpen(false); setCompanyToDelete(null); }}
          onConfirm={async () => { await handleDeleteExecute(); setIsDetailsOpen(false); }}
        />
      )}
    </div>
  );
}
