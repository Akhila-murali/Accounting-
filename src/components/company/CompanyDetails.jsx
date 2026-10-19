import React from 'react';
import { Building2, X, Info, Phone, MapPin } from 'lucide-react';

const formatVal = (val, fallback = '—') => {
  if (!val || typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'string' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return fallback;
  }
  return trimmed;
};

export default function CompanyDetails({
  isDetailsOpen,
  setIsDetailsOpen,
  selectedCompany,
}) {
  if (!isDetailsOpen || !selectedCompany) return null;

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto text-left">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">

        {/* Top Header Bar: Title & Professional Small Action Icons */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#fbf5e7] text-[#8c6723] flex items-center justify-center font-bold text-xs">
              <Building2 size={15} />
            </div>
            <h2 className="text-sm font-bold text-stone-900 m-0">Company Details</h2>
          </div>

          {/* Small Sleek Action Icons */}
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

        {/* Company Profile Header */}
        <div className="px-5 py-4 border-b border-stone-100 bg-white">
          <h3 className="text-base font-bold text-stone-900 m-0">
            {formatVal(selectedCompany.companyName, 'Company Name')}
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-1 m-0">
            GST: {formatVal(selectedCompany.gstNo, 'Not specified')}
          </p>
        </div>

        {/* Content Details Sections */}
        <div className="p-5 space-y-6 bg-white">

          {/* Basic Information */}
          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <Info size={13} className="text-[#8c6723]" />
              <span>Basic Information</span>
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Company Name</span>
                <span className="text-stone-900 font-bold">{formatVal(selectedCompany.companyName)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">GST Number</span>
                <span className="text-stone-900 font-mono font-semibold">{formatVal(selectedCompany.gstNo)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">PAN</span>
                <span className="text-stone-900 font-mono font-semibold">{formatVal(selectedCompany.pan)}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <Phone size={13} className="text-[#8c6723]" />
              <span>Contact Information</span>
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Phone Number</span>
                <span className="text-stone-900 font-semibold">{formatVal(selectedCompany.phoneNumber)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">Email</span>
                <span className="text-[#8c6723] font-semibold break-all">{formatVal(selectedCompany.email)}</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-xs font-bold text-[#8c6723] uppercase tracking-wider flex items-center gap-2 m-0 mb-3 pb-1.5 border-b border-stone-100">
              <MapPin size={13} className="text-[#8c6723]" />
              <span>Address Information</span>
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-start gap-4 py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium shrink-0">Address</span>
                <span className="text-stone-900 font-semibold text-right flex-1 break-words">{formatVal(selectedCompany.address)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">City</span>
                <span className="text-stone-900 font-semibold">{formatVal(selectedCompany.city)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">State</span>
                <span className="text-stone-900 font-semibold">{formatVal(selectedCompany.state)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-50">
                <span className="text-stone-500 font-medium">Country</span>
                <span className="text-stone-900 font-semibold">{formatVal(selectedCompany.country)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">PIN Code</span>
                <span className="text-stone-900 font-mono font-semibold">{formatVal(selectedCompany.pin)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
