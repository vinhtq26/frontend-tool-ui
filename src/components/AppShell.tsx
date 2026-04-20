import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
      <div className="md:pl-72">
        <Topbar onMenu={() => setOpenSidebar(true)} />
        <main className="animate-[fadeIn_280ms_ease-out] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
