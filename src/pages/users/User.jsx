import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import {
  getUsers,
  getUser,
  getRoles,
  registerUser,
  updateUser,
  deleteUser
} from '../../services/user';
import UserTable from '../../components/user/UserTable.jsx';
import UserDetails from '../../components/user/UserDetails.jsx';
import Button from '../../components/common/Button.jsx';
import Dropdown from '../../components/common/Dropdown.jsx';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal.jsx';
import Toast from '../../components/common/Toast.jsx';

const initialFormState = {
  fullName: '',
  phoneNumber: '',
  email: '',
  password: '',
  role: 'user'
};

export default function User() {
  // Data list and state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Details State
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback notifications (Toast)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch active users from GET /api/registration/users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      if (response?.success) {
        setUsers(response.data || []);
      } else {
        setError(response?.message || 'Failed to retrieve users.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'An error occurred while loading users.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch available roles from GET /api/registration/roles
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };



  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let emailError = '';

      if (!value.trim()) {
        emailError = 'Email is required';
      } else if (!emailRegex.test(value.trim())) {
        emailError = 'Enter a valid email address';
      }

      setFormErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
      return;
    }

    if (name === 'phoneNumber') {
      let phoneError = '';

      if (!value.trim()) {
        phoneError = 'Phone number is required';
      } else if (!/^\d+$/.test(value)) {
        phoneError = 'Phone number must contain only numbers';
      } else if (!/^\d{10}$/.test(value)) {
        phoneError = 'Phone number must be exactly 10 digits';
      }

      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: phoneError,
      }));
      return;
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

const handleOpenAdd = () => {
  setFormData(initialFormState);
  setFormErrors({});
  setModalMode('add');
};

  const handleOpenEdit = async (user) => {
    try {
      const res = await getUser(user.userId);
      if (res?.success && res.data) {
        setFormData({
          fullName: res.data.fullName || '',
          phoneNumber: res.data.phoneNumber || '',
          email: res.data.email || '',
          password: '',
          role: res.data.role || 'user'
        });
        setFormErrors({});
        setModalMode('edit');
      } else {
        showToast(res?.message || 'Failed to retrieve user details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error loading user details.', 'error');
    }
  };

 const handleOpenView = async (user) => {
  try {
    const res = await getUser(user.userId);

    if (res?.success && res.data) {
      setSelectedUser(res.data);
      setIsDetailsOpen(true);
    } else {
      showToast(res?.message || 'Failed to retrieve user details.', 'error');
    }
  } catch (err) {
    showToast(
      err.response?.data?.message || 'Error loading user details.',
      'error'
    );
  }
};

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must contain only numbers';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Enter a valid email address';
      }
    }
    if (modalMode === 'add') {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 4) {
        errors.password = 'Password must be at least 4 characters';
      }
      if (!formData.role.trim()) {
        errors.role = 'Role selection is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);  // avoid multiple clicks while processing
    try {
      let res;
      if (modalMode === 'add') {
        res = await registerUser(formData);
      } else {
        res = await updateUser(selectedUser.userId, formData);
      }

      if (res?.success) {
        showToast(
          res.message || `User ${modalMode === 'add' ? 'registered' : 'updated'} successfully.`,
          'success'
        );
        setModalMode(null);
        fetchUsers();

        if (modalMode === 'edit' && res.data) {
          setSelectedUser(res.data);
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
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUser(userToDelete.userId);
      if (res?.success) {
        showToast(res.message || 'User deleted successfully.', 'success');
        setIsDeleteConfirmOpen(false);
        setUserToDelete(null);
        setIsDetailsOpen(false);
        fetchUsers();
      } else {
        showToast(res?.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting user.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

    useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-stone-800 relative">
      {/* Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="m-0 whitespace-nowrap text-xl font-bold text-stone-900 sm:text-2xl">Users</h1>
          <p className="text-stone-500 text-sm m-0 mt-1">
            Manage your registered system users.
          </p>
        </div>
        <Button onClick={handleOpenAdd} aria-label="Add User" className="px-3 sm:px-4">
          <UserPlus size={15} className="hidden sm:block" />
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </div>

      <div className="w-full">
        <UserTable
          users={users}
          loading={loading}
          error={error}
          fetchUsers={fetchUsers}
          selectedUser={selectedUser}
          isDetailsOpen={isDetailsOpen}
          handleOpenView={handleOpenView}
          handleOpenEdit={handleOpenEdit}
          handleOpenDelete={handleOpenDelete}
        />

        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4" onClick={() => setIsDetailsOpen(false)}>
            <div className="relative w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
              <UserDetails
                isDetailsOpen={isDetailsOpen}
                setIsDetailsOpen={setIsDetailsOpen}
                selectedUser={selectedUser}
                handleOpenEdit={handleOpenEdit}
                handleOpenDelete={handleOpenDelete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-stone-900/40 transition-opacity z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4 shrink-0">
              <h2 className="m-0 text-base font-bold text-stone-900">
                {modalMode === 'add' ? 'Add User' : 'Edit User'}
              </h2>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="cursor-pointer border-0 bg-transparent p-1 text-stone-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-left">
              <form onSubmit={handleSave} id="userForm" className="space-y-4 m-0">
                {/* Full Name Field */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        formErrors.fullName
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                      }`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        formErrors.phoneNumber
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                      }`}
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        formErrors.email
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field (Only during registration / Add Mode) */}
                {modalMode === 'add' && (
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="e.g. John@12345"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm bg-stone-50/50 text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                          formErrors.password
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer p-1 flex items-center"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.password}
                      </p>
                    )}
                  </div>
                )}

                {/* Role Dropdown Field (Only during registration / Add Mode) */}
                {modalMode === 'add' && (
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                      Assign Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Dropdown
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        options={roles.map((role) => ({ value: role, label: role }))}
                        placeholder="Select role"
                        icon={Shield}
                        hasError={Boolean(formErrors.role)}
                      />
                    </div>
                    {formErrors.role && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.role}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer Actions */}
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
                form="userForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  modalMode === 'add' ? 'Register User' : 'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && userToDelete && (
        <DeleteConfirmationModal
          title="Delete User"
          message={<>Are you sure you want to delete <span className="font-semibold text-stone-800">{userToDelete.fullName}</span>? This will soft-delete the user from active accounts.</>}
          confirmLabel="Delete User"
          isDeleting={isDeleting}
          onCancel={() => { setIsDeleteConfirmOpen(false); setUserToDelete(null); }}
          onConfirm={handleDeleteExecute}
        />
      )}
    </div>
  );
}
