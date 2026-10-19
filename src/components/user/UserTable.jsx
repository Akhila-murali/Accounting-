import { useState } from 'react';
import { Search, Filter, ChevronDown, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import TableEmptyState from '../common/TableEmptyState.jsx';

export default function UserTable({
  users = [],
  loading,
  error,
  fetchUsers,
  selectedUser,
  isDetailsOpen,
  handleOpenView,
  handleOpenEdit,
  handleOpenDelete,
}) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const term = search.toLowerCase();

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phoneNumber?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();
    return sortOrder === 'Newest' ? second - first : first - second;
  });

  return (
    <div
      className="w-full max-h-[calc(100vh-175px)] overflow-y-auto no-scrollbar rounded-2xl border border-stone-200/60 bg-white shadow-xs"
    >
      {/* Toolbar: Search Box & Sort Filter */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 bg-white">
        <div className="relative flex-grow max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search user name, email, phone or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] transition-all duration-150"
          />
        </div>
        <div className="relative">
          <button type="button" onClick={() => setDropdownOpen((value) => !value)} className="flex items-center gap-2 px-3.5 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 transition-all duration-150 cursor-pointer select-none font-medium">
            <Filter size={13} className="text-stone-400" />
            <span>{sortOrder}</span>
            <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 min-w-[130px] overflow-hidden py-1">
              {['Newest', 'Oldest'].map((option) => (
                <button key={option} type="button" onClick={() => { setSortOrder(option); setDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm cursor-pointer border-none ${sortOrder === option ? 'text-[#8c6723] font-semibold bg-[#fbf5e7]' : 'text-stone-600 bg-transparent hover:bg-stone-50'}`}>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Table List */}
      <div
        className="overflow-x-auto pb-2"
        onWheel={(event) => {
          const container = event.currentTarget;
          if (container.scrollWidth <= container.clientWidth) return;

          container.scrollLeft += event.deltaY;
        }}
      >
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="w-[28%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Full Name
              </th>
              <th className="w-[32%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Email
              </th>
              <th className="w-[22%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider truncate">
                Phone
              </th>
              <th className="w-[20%] px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider text-left truncate">
                Role
              </th>
              <th className="px-4 py-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? ( // skelton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-3/4"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-2/3"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/2"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/3"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded-md w-1/2"></div></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle className="text-rose-500" size={24} />
                    <p className="text-sm font-semibold text-stone-800 m-0">Failed to load users</p>
                    <p className="text-xs text-stone-500 m-0">{error}</p>
                    {fetchUsers && (
                      <button
                        onClick={fetchUsers}
                        className="mt-2 text-xs font-bold text-[#8c6723] hover:text-[#72521a] bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all cursor-pointer bg-white"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <TableEmptyState
                    title="No users found"
                    message={search ? 'No users match your search.' : 'Registered users will appear here.'}
                  />
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const isSelected = selectedUser?.userId === user.userId && isDetailsOpen; // for the side bar highlight
                return (
                  <tr
                    key={user.userId || user.email}
                    className={`border-b border-stone-100 last:border-b-0 hover:bg-[#fbf5e7]/25 transition-all ${
                      isSelected ? 'bg-[#fbf5e7]/40 border-l-4 border-l-[#8c6723]' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-stone-900 text-sm font-semibold whitespace-nowrap">
                      {user.fullName || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-stone-600 text-sm whitespace-nowrap">
                      {user.email || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-stone-500 text-sm whitespace-nowrap">
                      {user.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-left whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fbf5e7] text-[#8c6723] border border-[#c5a059]/30">
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" title="View user" aria-label="View user" onClick={() => handleOpenView(user)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-[#8c6723] hover:shadow-xs">
                          <Eye size={15} strokeWidth={1.8} />
                        </button>
                        <button type="button" title="Edit user" aria-label="Edit user" onClick={() => handleOpenEdit(user)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-xs">
                          <Pencil size={14} strokeWidth={1.8} />
                        </button>
                        <button type="button" title="Delete user" aria-label="Delete user" onClick={() => handleOpenDelete(user)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="px-4 py-3.5 border-t border-stone-100 text-stone-500 text-xs bg-stone-50/10">
        <span>Showing {sortedUsers.length} entries</span>
      </div>

    </div>
  );
}
