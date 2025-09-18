import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import EditorPage from './pages/EditorPage';
import StagingPage from './pages/StagingPage';
import DownloadsPage from './pages/DownloadsPage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import HistoryPage from './pages/HistoryPage';
import GeminiApiPage from './pages/GeminiApiPage';
import { Icon } from './components/Icon';
import { useAppContext } from './context/AppContext';

const App: React.FC = () => {
  const { activePage } = useAppContext();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'editor':
        return <EditorPage />;
      case 'documents':
        return <DocumentEditorPage />;
      case 'staging':
        return <StagingPage />;
      case 'history':
        return <HistoryPage />;
      case 'downloads':
        return <DownloadsPage />;
      case 'gemini-api':
        return <GeminiApiPage />;
      default:
        return <EditorPage />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center p-2 bg-black border-b border-gray-800">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-900">
            <Icon name="menu" />
          </button>
          <h1 className="ml-4 text-lg font-semibold capitalize">{activePage}</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;