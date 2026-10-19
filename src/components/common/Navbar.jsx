import { Menu, Bell, ChevronDown } from 'lucide-react';

export default function Navbar({ onOpenMobileSidebar }) {
  return (
    <header className="h-20 bg-white border-b border-stone-200/80 px-8 flex items-center justify-between shrink-0">
      {/* Left Section: Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        {/* Hamburger menu toggle (Mobile/Tablet only) */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden text-stone-500 hover:text-stone-900 transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center justify-center shrink-0"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Section: Notification & User Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative text-stone-500 hover:text-stone-900 transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center justify-center">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#c5a059] rounded-full"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
          <div className="w-10 h-10 rounded-full bg-[#fbf5e7] border border-[#c5a059]/10 flex items-center justify-center text-[#8c6723] font-bold text-sm select-none">
            A
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-stone-900 text-sm font-semibold leading-tight">Admin</span>
            <span className="text-stone-400 text-xs leading-none">Administrator</span>
          </div>
          <ChevronDown size={16} className="text-stone-400 shrink-0" />
        </div>
      </div>
    </header>
  );
}
