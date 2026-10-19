import {
  User as UserIcon,
  X,
  Info,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function UserDetails({
  isDetailsOpen,
  setIsDetailsOpen,
  selectedUser,
}) {
  if (!isDetailsOpen || !selectedUser) return null;

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto text-left">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#fbf5e7] text-[#8c6723] flex items-center justify-center">
              <UserIcon size={15} />
            </div>

            <h2 className="text-sm font-bold text-stone-900 m-0">
              User Details
            </h2>
          </div>

          <div className="flex items-center gap-1.5">

            <button
              onClick={() => setIsDetailsOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer border-none bg-transparent"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-stone-100 bg-white">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 m-0">
              {selectedUser.fullName || 'User Name'}
            </h3>

            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#fbf5e7] text-[#8c6723] border border-[#c5a059]/30 rounded-full shrink-0">
              {selectedUser.role || 'user'}
            </span>
          </div>

          <p className="text-xs text-stone-500 font-mono mt-1 m-0">
            ID: {selectedUser.userId || '—'}
          </p>

        </div>

        <div className="p-5 space-y-6 bg-white">

          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <Info size={13} />
              Basic Information
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Full Name</span>
                <span className="text-stone-900 font-bold">
                  {selectedUser.fullName || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">
                  User Identity ID
                </span>

                <span className="text-stone-900 font-mono text-xs">
                  {selectedUser.userId || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Assigned Role</span>

                <span className="text-[#8c6723] font-bold uppercase text-xs bg-[#fbf5e7] px-2 py-0.5 rounded-lg">
                  {selectedUser.role || 'user'}
                </span>
              </div>

            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <Phone size={13} />
              Contact Information
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">
                  Phone Number
                </span>

                <span className="text-stone-900 font-semibold">
                  {selectedUser.phoneNumber || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">
                  Email Address
                </span>

                <span className="text-[#8c6723] font-semibold break-all">
                  {selectedUser.email || '—'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <ShieldCheck size={13} />
              Account Security
            </h4>

            <div className="flex justify-between items-center py-1 text-xs sm:text-sm">
              <span className="text-stone-500 font-medium">
                Account Status
              </span>

              <span className="text-emerald-600 font-semibold">
                ● Active
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
