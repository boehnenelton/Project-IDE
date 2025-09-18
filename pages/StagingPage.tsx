import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Tool } from '@google/genai';
import { AI_PROFILES } from '../constants';
import type { AIProfile, EditorFile } from '../types';
import Editor from '../components/Editor';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { parseAIResponse } from '../utils/fileParser';
import ContextMenu, { MenuItem } from '../components/ContextMenu';

const StagingPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AIProfile>(AI_PROFILES[0]);
  const [attachedImage, setAttachedImage] = useState<{ name: string; data: string; mimeType: string; } | null>(null);
  
  const { 
    addGeneratedFile, 
    stagingContext, 
    setStagingContext,
    sendContentToEditor,
    setActivePage,
    allFiles,
    contentForStagingPrompt,
    clearContentForStagingPrompt,
    addInteraction,
    apiKey,
  } = useAppContext();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const promptEditorRef = useRef<any>(null);
  const contextEditorRef = useRef<any>(null);

  useEffect(() => {
    if (contentForStagingPrompt) {
      setPrompt(contentForStagingPrompt.content);
      clearContentForStagingPrompt();
    }
  }, [contentForStagingPrompt, clearContentForStagingPrompt]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profile = AI_PROFILES.find(p => p.Name === e.target.value);
    if (profile) {
      setSelectedProfile(profile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        setAttachedImage({ name: file.name, data: result, mimeType: file.type });
      } else { // Treat as text
        const fileContext = `\n\n// --- START OF UPLOADED FILE: ${file.name} ---\n${result}\n// --- END OF UPLOADED FILE: ${file.name} ---`;
        setStagingContext(prev => prev + fileContext);
      }
    };

    reader.onerror = (error) => {
      setError(`Error reading file: ${error}`);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    
    e.target.value = ''; // Allow re-uploading the same file
  };


  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    const currentPrompt = prompt;
    setPrompt(''); // Clear prompt editor
    setIsLoading(true);
    setError(null);
    
    const fullPrompt = `${stagingContext}\n\n---\n\nPROMPT:\n${currentPrompt}`;

    try {
      if (!apiKey) {
        throw new Error('API Key not set. Please go to the "Gemini API" page to set your key.');
      }
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const tools: Tool[] = [];
      if (selectedProfile.GoogleSearch_Enabled) {
          tools.push({googleSearch: {}});
      } else if (selectedProfile.CodeInterpreter_Enabled) {
          tools.push({codeExecution: {}});
      }
      
      const textPart = { text: fullPrompt };
      const parts: ({ inlineData: { mimeType: string; data: string; }; } | { text: string; })[] = [textPart];

      if (attachedImage) {
        const base64Data = attachedImage.data.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: attachedImage.mimeType,
              data: base64Data,
            },
          });
        }
      }

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          systemInstruction: selectedProfile.SystemInstruction,
          tools: tools.length > 0 ? tools : undefined,
        }
      });
      
      const textResponse = result.text;
      setPrompt(textResponse); // Put response back into the prompt editor

      addInteraction({
        profileName: selectedProfile.Name,
        prompt: fullPrompt,
        response: textResponse,
        attachedImageName: attachedImage?.name || null,
      });

      const files = parseAIResponse(textResponse);
      files.forEach(file => addGeneratedFile(file));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setPrompt(`Error: ${errorMessage}`);
       addInteraction({
        profileName: selectedProfile.Name,
        prompt: fullPrompt,
        response: `Error: ${errorMessage}`,
        attachedImageName: attachedImage?.name || null,
      });
    } finally {
      setIsLoading(false);
      setAttachedImage(null);
    }
  }, [prompt, stagingContext, selectedProfile, isLoading, addGeneratedFile, addInteraction, attachedImage, apiKey]);

  const handleSendToEditor = () => {
      if (prompt && !isLoading) {
          sendContentToEditor(prompt);
          setActivePage('editor');
      }
  }

  const handleAttachFile = (file: EditorFile) => {
    const fileContext = `\n\n// --- START OF FILE: ${file.path} ---\n${file.content}\n// --- END OF FILE: ${file.path} ---`;
    setStagingContext(prev => prev + fileContext);
  };

  const setupContextMenu = (editor: any, editorType: 'prompt' | 'context') => {
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        
        const selection = editor.getSelection();
        const hasSelection = selection ? !selection.isEmpty() : false;

        let menuItems: MenuItem[] = [
          { label: 'Cut', action: () => editor.trigger('contextmenu', 'editor.action.clipboardCutAction'), disabled: !hasSelection },
          { label: 'Copy', action: () => editor.trigger('contextmenu', 'editor.action.clipboardCopyAction'), disabled: !hasSelection },
          { label: 'Paste', action: () => editor.trigger('contextmenu', 'editor.action.clipboardPasteAction') },
        ];

        if (editorType === 'prompt') {
          menuItems.push({ separator: true });
          menuItems.push({ 
            label: 'Send to Editor', 
            action: handleSendToEditor,
            disabled: isLoading || !prompt 
          });
        }
        setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
      });
    }
  };
  
  const handlePromptEditorMount = (editor: any) => {
    promptEditorRef.current = editor;
    setupContextMenu(editor, 'prompt');
  };

  const handleContextEditorMount = (editor: any) => {
    contextEditorRef.current = editor;
    setupContextMenu(editor, 'context');
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-4">
      {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
      <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-black rounded-lg border border-gray-800">
        <div className="flex flex-col gap-3">
            <div className="w-full md:w-64">
              <label htmlFor="profile-select" className="block text-sm font-medium text-gray-300 mb-1">AI Profile</label>
              <select
                id="profile-select"
                value={selectedProfile.Name}
                onChange={handleProfileChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500"
              >
                {AI_PROFILES.map(p => <option key={p.Name}>{p.Name}</option>)}
              </select>
            </div>
            <div className="w-full md:w-64">
               <label htmlFor="file-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <Icon name="attachment" className="w-4 h-4" />
                <span>Attach File</span>
              </label>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.js,.ts,.tsx,.jsx,.html,.css,image/png,image/jpeg,image/webp,application/pdf" />
            </div>
             {attachedImage && (
              <div className="w-full md:w-64 flex items-center gap-2 text-sm bg-gray-900 p-2 rounded-md">
                <Icon name="image" className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-gray-300 truncate" title={attachedImage.name}>{attachedImage.name}</span>
                <button onClick={() => setAttachedImage(null)} className="ml-auto text-gray-500 hover:text-white">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            )}
        </div>
        <div className="flex-1 text-sm text-gray-400 mt-1">
          <p><strong className="text-gray-200">System Instruction:</strong> {selectedProfile.SystemInstruction}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col bg-black rounded-lg border border-gray-800 overflow-hidden">
             <h2 className="p-3 text-sm font-semibold bg-gray-900 text-red-500">Prompt / Response</h2>
             <div className="flex-1">
                <Editor language="markdown" value={isLoading ? 'Generating response...' : prompt} onChange={(val) => {if(!isLoading) setPrompt(val || '')}} onMount={handlePromptEditorMount} />
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Icon name="send" className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Generating...' : 'Send to Gemini'}</span>
            </button>
            <button
              onClick={handleSendToEditor}
              disabled={isLoading || !prompt}
              className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed transition-colors"
            >
                <Icon name="send-to-editor" className="w-5 h-5" />
                <span>Send to Editor</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-black rounded-lg border border-gray-800 overflow-hidden">
          <h2 className="p-3 text-sm font-semibold bg-gray-900 text-red-500">Persistent Context</h2>
          <div className="flex-1 min-h-0">
            <Editor language="markdown" value={stagingContext} onChange={(val) => setStagingContext(val || '')} onMount={handleContextEditorMount} />
          </div>
          <div className="p-3 border-t border-gray-800 bg-black">
            <h3 className="text-xs font-semibold uppercase text-gray-300 mb-2">Attach File from Editor</h3>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
              {allFiles.length > 0 ? (
                allFiles.map(file => (
                  <div key={file.id} className="flex justify-between items-center bg-gray-900 p-1.5 rounded-md">
                    <span className="text-sm font-mono text-gray-300 truncate" title={file.path}>{file.path}</span>
                    <button 
                      onClick={() => handleAttachFile(file)} 
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-md font-semibold"
                      aria-label={`Attach ${file.path}`}
                    >
                      Attach
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">No files open in editor.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
    </div>
  );
};

export default StagingPage;