import React from 'react';
import type { Page } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  page: Page;
  iconName: React.ComponentProps<typeof Icon>['name'];
  label: string;
  activePage: Page;
  onClick: () => void;
}> = ({ page, iconName, label, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-red-600 text-white'
          : 'text-gray-300 hover:bg-gray-900 hover:text-white'
      }`}
    >
      <Icon name={iconName} className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
  const { activePage, setActivePage } = useAppContext();
  
  const handleNav = (page: Page) => {
    setActivePage(page);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <>
      <aside className={`absolute md:relative z-20 md:z-auto w-64 bg-black border-r border-gray-800 flex-shrink-0 flex-col h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center">
            <Icon name="gemini" className="w-8 h-8 text-red-500" />
            <span className="ml-3 text-lg font-bold text-white">Dual-Editor IDE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 md:hidden rounded-md hover:bg-gray-900">
             <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem page="editor" iconName="code" label="Editor" activePage={activePage} onClick={() => handleNav('editor')} />
          <NavItem page="documents" iconName="document" label="Documents" activePage={activePage} onClick={() => handleNav('documents')} />
          <NavItem page="staging" iconName="ai" label="Staging" activePage={activePage} onClick={() => handleNav('staging')} />
          <NavItem page="history" iconName="history" label="History" activePage={activePage} onClick={() => handleNav('history')} />
          <NavItem page="downloads" iconName="download" label="Downloads" activePage={activePage} onClick={() => handleNav('downloads')} />
          <NavItem page="gemini-api" iconName="key" label="Gemini API" activePage={activePage} onClick={() => handleNav('gemini-api')} />
        </nav>
      </aside>
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 md:hidden"></div>}
    </>
  );
};

export default Sidebar;