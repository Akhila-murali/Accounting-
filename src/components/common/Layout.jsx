import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';

export default function Layout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="global-wrapper flex h-screen bg-[#f8f9fa] text-stone-800 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Right Content Area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Page Content Body */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <div
            className={`mx-auto w-full transition-[max-width] duration-300 ${
              isSidebarCollapsed ? 'max-w-[1800px]' : 'max-w-[1600px]'
            }`}
          >
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
