import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '../components/Editor';
import { Icon } from '../components/Icon';
import { useAppContext } from '../context/AppContext';
import ContextMenu, { MenuItem } from '../components/ContextMenu';
import ProjectExplorer from '../components/ProjectExplorer';
import { downloadProjectZip } from '../utils/download';

const EditorPage: React.FC = () => {
  const { 
    allFiles,
    openFiles,
    activeFile,
    activeFileId,
    createFile,
    openFile,
    closeFile,
    updateFileContent,
    setActiveFileId,
    sendContentToStagingPrompt,
    setStagingContext, 
    setActivePage, 
  } = useAppContext();
  
  const editorRef = useRef<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  
  const sendSelectionToPrompt = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const text = editor.getModel().getValueInRange(selection);
      sendContentToStagingPrompt(text);
      setActivePage('staging');
    }
  };
  
  const sendSelectionToContext = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const text = editor.getModel().getValueInRange(selection);
      setStagingContext(prevContext => `${prevContext}\n\n// --- Selection from Editor ---\n${text}`);
      setActivePage('staging');
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        
        const selection = editor.getSelection();
        const hasSelection = selection ? !selection.isEmpty() : false;

        const menuItems: MenuItem[] = [
          { label: 'Cut', action: () => editor.trigger('contextmenu', 'editor.action.clipboardCutAction'), disabled: !hasSelection },
          { label: 'Copy', action: () => editor.trigger('contextmenu', 'editor.action.clipboardCopyAction'), disabled: !hasSelection },
          { label: 'Paste', action: () => editor.trigger('contextmenu', 'editor.action.clipboardPasteAction') },
          { separator: true },
          { 
            label: 'Send Selection to Prompt', 
            action: sendSelectionToPrompt,
            disabled: !hasSelection
          },
          { 
            label: 'Send Selection to Context', 
            action: sendSelectionToContext,
            disabled: !hasSelection
          },
        ];
        setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
      });
    }
  };

  const handleContentChange = useCallback((value: string | undefined) => {
    if (!activeFileId) return;
    updateFileContent(activeFileId, value || '');
  }, [activeFileId, updateFileContent]);


  return (
    <div className="flex h-full bg-black">
      {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
      <ProjectExplorer 
        files={allFiles} 
        activeFileId={activeFileId} 
        onFileSelect={openFile}
        onFileCreate={createFile}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center bg-black border-b border-gray-800">
          <div className="flex-1 flex items-start overflow-x-auto">
            {openFiles.map(file => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center px-4 py-2 text-sm border-r border-gray-800 whitespace-nowrap ${
                  activeFileId === file.id
                    ? 'bg-black text-white'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
              >
                {file.path.split('/').pop()}
                <button onClick={(e) => { e.stopPropagation(); closeFile(file.id); }} className="ml-3 text-gray-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-gray-800">
                  &times;
                </button>
              </button>
            ))}
          </div>
          <div className="flex">
            <button 
              onClick={sendSelectionToPrompt} 
              className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 border-r border-red-800"
              title="Send selected text to Prompt"
            >
              <Icon name="send" className="w-4 h-4" />
              <span>To Prompt</span>
            </button>
             <button 
              onClick={sendSelectionToContext} 
              className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              title="Send selected text to Persistent Context"
            >
              <Icon name="add-to-context" className="w-4 h-4" />
              <span>To Context</span>
            </button>
            <button 
              onClick={() => downloadProjectZip(allFiles)}
              className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 border-l border-red-800"
              title="Download entire project as a ZIP file"
            >
              <Icon name="zip" className="w-4 h-4" />
              <span>Download Project</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeFile ? (
            <Editor
              key={activeFile.id}
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleContentChange}
              onMount={handleEditorDidMount}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No file open. Select a file from the project explorer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;