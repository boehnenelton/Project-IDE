import React, { useMemo, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import Editor from '../components/Editor';
import { Icon } from '../components/Icon';
import type { EditorFile } from '../types';

type MarkdownSyntax = 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'ul' | 'ol' | 'code' | 'link';

const ToolbarButton: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  onClick: () => void;
  label: string;
}> = ({ icon, onClick, label }) => (
  <button
    onClick={onClick}
    title={label}
    className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
  >
    <Icon name={icon} className="w-5 h-5" />
  </button>
);

const DocumentEditorPage: React.FC = () => {
  const {
    allFiles,
    activeFile,
    createFile,
    openFile,
    updateFileContent,
  } = useAppContext();

  const editorRef = useRef<any>(null);

  const documents = useMemo(() =>
    allFiles.filter(file => file.path.startsWith('documents/')).sort((a,b) => a.path.localeCompare(b.path)),
    [allFiles]
  );

  const activeDocument = useMemo(() => {
    if (activeFile && activeFile.path.startsWith('documents/')) {
      return activeFile;
    }
    // If active file is not a doc, find the first doc to display
    if (!activeFile || !activeFile.path.startsWith('documents/')) {
        return documents.length > 0 ? documents[0] : null;
    }
    return null;
  }, [activeFile, documents]);

  const handleCreateDocument = () => {
    const docCount = documents.filter(doc => doc.path.includes('new-document')).length;
    const newDocName = `new-document-${docCount + 1}.md`;
    createFile(`documents/${newDocName}`, `# New Document\n\nStart writing here.`);
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const applyMarkdown = (syntax: MarkdownSyntax) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const selectedText = editor.getModel().getValueInRange(selection);
    let newText = '';

    switch (syntax) {
      case 'h1': newText = `# ${selectedText || 'Heading 1'}`; break;
      case 'h2': newText = `## ${selectedText || 'Heading 2'}`; break;
      case 'h3': newText = `### ${selectedText || 'Heading 3'}`; break;
      case 'bold': newText = `**${selectedText || 'bold text'}**`; break;
      case 'italic': newText = `*${selectedText || 'italic text'}*`; break;
      case 'ul': newText = `- ${selectedText || 'List item'}`; break;
      case 'ol': newText = `1. ${selectedText || 'List item'}`; break;
      case 'code': newText = `\`\`\`\n${selectedText || 'code'}\n\`\`\``; break;
      case 'link': newText = `[${selectedText || 'link text'}](https://example.com)`; break;
    }

    editor.executeEdits('toolbar-action', [{
      range: selection,
      text: newText,
      forceMoveMarkers: true,
    }]);
    editor.focus();
  };

  const handleContentChange = useCallback((value: string | undefined) => {
    if (activeDocument) {
      updateFileContent(activeDocument.id, value || '');
    }
  }, [activeDocument, updateFileContent]);
  
  const handleFileSelect = (file: EditorFile) => {
    openFile(file.id);
  }

  return (
    <div className="flex h-full bg-black">
      <div className="w-72 bg-black flex flex-col h-full border-r border-gray-800">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase text-red-500">Documents</h2>
          <button
            onClick={handleCreateDocument}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md font-semibold"
          >
            + New Document
          </button>
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => handleFileSelect(doc)}
              className={`w-full text-left flex items-center cursor-pointer p-2 text-sm rounded ${
                activeDocument?.id === doc.id ? 'bg-red-600/30 text-white' : 'text-gray-300 hover:bg-gray-900'
              }`}
            >
              <Icon name="document" className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
              <span className="truncate">{doc.path.replace('documents/', '')}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeDocument ? (
          <>
            <div className="flex items-center bg-black border-b border-gray-800 px-4 py-1">
              <ToolbarButton icon="heading" onClick={() => applyMarkdown('h1')} label="H1" />
              <ToolbarButton icon="heading" onClick={() => applyMarkdown('h2')} label="H2" />
              <ToolbarButton icon="heading" onClick={() => applyMarkdown('h3')} label="H3" />
              <div className="border-l h-5 mx-2 border-gray-700" />
              <ToolbarButton icon="bold" onClick={() => applyMarkdown('bold')} label="Bold" />
              <ToolbarButton icon="italic" onClick={() => applyMarkdown('italic')} label="Italic" />
              <div className="border-l h-5 mx-2 border-gray-700" />
              <ToolbarButton icon="list-ul" onClick={() => applyMarkdown('ul')} label="Unordered List" />
              <ToolbarButton icon="list-ol" onClick={() => applyMarkdown('ol')} label="Ordered List" />
              <div className="border-l h-5 mx-2 border-gray-700" />
              <ToolbarButton icon="code-block" onClick={() => applyMarkdown('code')} label="Code Block" />
              <ToolbarButton icon="link" onClick={() => applyMarkdown('link')} label="Link" />
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                key={activeDocument.id}
                language={activeDocument.language}
                value={activeDocument.content}
                onChange={handleContentChange}
                onMount={handleEditorMount}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No document selected. Create one or select from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditorPage;