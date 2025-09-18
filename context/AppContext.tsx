import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { GeneratedFile, Page, EditorFile, Interaction } from '../types';

const getLanguageFromPath = (path: string) => {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

interface AppContextType {
  generatedFiles: GeneratedFile[];
  addGeneratedFile: (file: Omit<GeneratedFile, 'id'>) => void;
  clearGeneratedFiles: () => void;
  
  activePage: Page;
  setActivePage: (page: Page) => void;
  
  stagingContext: string;
  setStagingContext: React.Dispatch<React.SetStateAction<string>>;

  sendContentToEditor: (content: string) => void;
  
  contentForStagingPrompt: { content: string; id: number } | null;
  sendContentToStagingPrompt: (content: string) => void;
  clearContentForStagingPrompt: () => void;

  allFiles: EditorFile[];
  openFileIds: Set<string>;
  activeFileId: string | null;
  openFiles: EditorFile[];
  activeFile: EditorFile | undefined;
  
  createFile: (path: string, content?: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setActiveFileId: (fileId: string | null) => void;

  interactions: Interaction[];
  addInteraction: (interaction: Omit<Interaction, 'id' | 'timestamp'>) => void;

  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialReadmeContent = `# Project IDE v1.0.0

## Created By

- **Elton Boehnen**
- **Email**: boehnenelton2024@gmail.com
- **GitHub**: [github.com/boehnenelton](https://github.com/boehnenelton)

---

## About This Application

Welcome to Project IDE!

This is a responsive web application designed for seamless interaction with the Gemini API for advanced code generation. It features:

- A **dual-panel staging area** to build and refine prompts with persistent context.
- A **multi-tab Monaco editor** for a complete development experience.
- A **robust project explorer** to manage your files and folders.
- A dedicated **document editor** with markdown support for project notes and documentation.
- **AI Profile Management** to switch between different AI personas and specializations.
- **Interaction History** to review and reuse past conversations with the AI.
- A **Downloads Manager** to save, version, and import your generated files directly back into your project.

This application is designed to create a fluid and powerful workflow, bridging the gap between AI-assisted coding and traditional development.

---

## Quickstart Workflow

Follow these steps to get started with the core workflow:

1.  **Set API Key**: Before you start, navigate to the **Gemini API** page and enter your Google Gemini API key.

2.  **Go to Staging**: Navigate to the **Staging** page using the sidebar. This is your command center for interacting with the AI.

3.  **Send a Query**: Choose an AI Profile, write your request in the "Prompt" editor (e.g., "create a simple React button component"), and click **Send to Gemini**.

4.  **Go to Downloads**: Once the AI responds, navigate to the **Downloads** page. You will see your newly generated file listed.

5.  **Import or Iterate**:
    *   **To Use the File**: Click the **Import** button to add the file directly into your project under the \`downloads/\` folder. It will open in the Editor, ready for use.
    *   **To Update the File**: Click the **Stage** button. This sends the file back to the Staging page's context. You can then write a new prompt to request changes (e.g., "add a red border to this button").

6.  **Download Your Project**: Once you are happy with your project, navigate back to the **Editor** page and click the **Download Project** button to save a ZIP file of all your work.
`;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activePage, setActivePage] = useState<Page>('editor');
  const [stagingContext, setStagingContext] = useState<string>('');
  const [contentForStagingPrompt, setContentForStagingPrompt] = useState<{ content: string; id: number } | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(() => localStorage.getItem('gemini_api_key'));
  
  // Centralized file state
  const [allFiles, setAllFiles] = useState<EditorFile[]>([
    { id: '1', path: 'src/welcome.js', language: 'javascript', content: "// Welcome to your project!\n// Use the panel on the left to create new files.\n// Right-click in the editor for more options." },
    { 
      id: '2', 
      path: 'package.json', 
      language: 'json', 
      content: JSON.stringify({
        "Format": "BEJson",
        "Format_Version": "1-0-4",
        "Format_Creator": "Elton Boehnen",
        "Parent_Hierarchy": "/",
        "Records_Type": ["PackageConfig"],
        "Fields": [
          { "name": "key", "type": "string" },
          { "name": "value", "type": "string" }
        ],
        "Values": [
          ["name", "my-project"],
          ["version", "1.0.0"]
        ]
      }, null, 2)
    },
    {
      id: '3',
      path: 'documents/README.md',
      language: 'markdown',
      content: initialReadmeContent,
    }
  ]);
  const [openFileIds, setOpenFileIds] = useState<Set<string>>(new Set(['1', '3']));
  const [activeFileId, setActiveFileId] = useState<string | null>('3');

  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const addInteraction = (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setInteractions(prev => [newInteraction, ...prev]);
  };

  const openFiles = useMemo(() => 
    [...openFileIds].map(id => allFiles.find(f => f.id === id)).filter((f): f is EditorFile => !!f),
    [openFileIds, allFiles]
  );

  const activeFile = useMemo(() => 
    allFiles.find(f => f.id === activeFileId),
    [allFiles, activeFileId]
  );
  
  const addGeneratedFile = (file: Omit<GeneratedFile, 'id'>) => {
    const newFile = { ...file, id: `${file.projectName}-${file.fileName}-${file.version}-${Date.now()}` };
    setGeneratedFiles(prevFiles => {
        const exists = prevFiles.some(f => 
            f.projectName === newFile.projectName && 
            f.fileName === newFile.fileName &&
            f.version === newFile.version
        );
        if (exists) return prevFiles;
        return [...prevFiles, newFile];
    });
  };
  
  const clearGeneratedFiles = () => {
    setGeneratedFiles([]);
  };
  
  const sendContentToStagingPrompt = (content: string) => {
    setContentForStagingPrompt({ content, id: Date.now() });
  };

  const clearContentForStagingPrompt = () => {
    setContentForStagingPrompt(null);
  };
  
  const createFile = (path: string, content: string = '') => {
    let newPath = path;
    let counter = 1;
    // Ensure unique path
    while (allFiles.some(f => f.path === newPath)) {
      const parts = path.split('.');
      const extension = parts.pop() || '';
      const base = parts.join('.');
      newPath = `${base}-${counter}.${extension}`;
      counter++;
    }
    
    const language = getLanguageFromPath(newPath);
    let finalContent = content;

    if (!content && language === 'json') {
      const hierarchyPath = newPath.includes('/') ? `/${newPath.substring(0, newPath.lastIndexOf('/'))}` : '/';
      const bejsonTemplate = {
        "Format": "BEJson",
        "Format_Version": "1-0-4",
        "Format_Creator": "Elton Boehnen",
        "Parent_Hierarchy": hierarchyPath,
        "Records_Type": ["NewRecord"],
        "Fields": [
          { "name": "id", "type": "integer" },
          { "name": "name", "type": "string" }
        ],
        "Values": [
          [1, "Example Record"]
        ]
      };
      finalContent = JSON.stringify(bejsonTemplate, null, 2);
    }

    const newFile: EditorFile = {
      id: Date.now().toString(),
      path: newPath,
      language: getLanguageFromPath(newPath),
      content: finalContent,
    };

    setAllFiles(prev => [...prev, newFile]);
    setOpenFileIds(prev => new Set(prev).add(newFile.id));
    setActiveFileId(newFile.id);
  };
  
  const sendContentToEditor = (content: string) => {
    const looksLikeCode = ['const', 'function', 'import', 'class', '<div', 'SELECT', 'FROM'].some(kw => content.includes(kw));
    const extension = looksLikeCode ? 'ts' : 'md';
    const newPath = `from-gemini/response-${Date.now()}.${extension}`;
    createFile(newPath, content);
  };

  const openFile = (fileId: string) => {
    setOpenFileIds(prev => new Set(prev).add(fileId));
    setActiveFileId(fileId);
  };

  const closeFile = (fileIdToClose: string) => {
    const newOpenFileIds = new Set(openFileIds);
    newOpenFileIds.delete(fileIdToClose);
    setOpenFileIds(newOpenFileIds);
    
    if (activeFileId === fileIdToClose) {
      setActiveFileId([...newOpenFileIds][0] || null);
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    setAllFiles(files => files.map(file => 
      file.id === fileId ? { ...file, content: content } : file
    ));
  };

  return (
    <AppContext.Provider value={{ 
      generatedFiles, 
      addGeneratedFile, 
      clearGeneratedFiles,
      activePage,
      setActivePage,
      stagingContext,
      setStagingContext,
      sendContentToEditor,
      contentForStagingPrompt,
      sendContentToStagingPrompt,
      clearContentForStagingPrompt,
      allFiles,
      openFileIds,
      activeFileId,
      openFiles,
      activeFile,
      createFile,
      openFile,
      closeFile,
      updateFileContent,
      setActiveFileId,
      interactions,
      addInteraction,
      apiKey,
      setApiKey,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};