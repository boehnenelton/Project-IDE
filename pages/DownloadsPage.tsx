import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadFile, downloadZip } from '../utils/download';
import { Icon } from '../components/Icon';
import type { GeneratedFile } from '../types';

const DownloadsPage: React.FC = () => {
  const { generatedFiles, clearGeneratedFiles, setStagingContext, setActivePage, createFile } = useAppContext();

  const filesByProjectAndName = useMemo(() => {
    return generatedFiles.reduce((acc, file) => {
      if (!acc[file.projectName]) {
        acc[file.projectName] = {};
      }
      if (!acc[file.projectName][file.fileName]) {
        acc[file.projectName][file.fileName] = [];
      }
      acc[file.projectName][file.fileName].push(file);
      // Sort versions descending
      acc[file.projectName][file.fileName].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
      return acc;
    }, {} as Record<string, Record<string, GeneratedFile[]>>);
  }, [generatedFiles]);

  const handleAttachAndStage = (file: GeneratedFile) => {
    const fileContext = `
// --- START OF FILE TO UPDATE ---
projectName: ${file.projectName}
filename: ${file.fileName}
version: ${file.version}
\`\`\`${file.fileName.split('.').pop()}
${file.content}
\`\`\`
end of file: ${file.fileName}
// --- END OF FILE TO UPDATE ---

// Instructions: Please update the file above as requested in the prompt. Remember to increment the version number.
`;
    setStagingContext(prev => `${fileContext}\n\n${prev}`);
    setActivePage('staging');
  };

  const handleImportToProject = (file: GeneratedFile) => {
    const baseNameWithFolders = file.fileName;
    const baseNameParts = baseNameWithFolders.split('/');
    const baseName = baseNameParts.pop() || 'file';
    
    const nameParts = baseName.split('.');
    const extension = nameParts.pop() || 'txt';
    const name = nameParts.join('.');

    const newPath = `downloads/${name}-v${file.version}.${extension}`;
    
    createFile(newPath, file.content);
    setActivePage('editor');
  };

  if (generatedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No files generated yet. Use the Staging page to create files with Gemini.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Generated Files</h1>
        <div className="flex gap-2">
           <button 
             onClick={clearGeneratedFiles} 
             className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
             <Icon name="trash" className="w-5 h-5" /> Clear All
           </button>
           <button 
            onClick={() => downloadZip(generatedFiles)} 
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
           >
            <Icon name="zip" className="w-5 h-5" /> Download All as ZIP
           </button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(filesByProjectAndName).map(([projectName, files]) => (
          <div key={projectName} className="bg-black rounded-lg p-4 border border-gray-800">
            <h2 className="text-xl font-semibold text-red-500 mb-4">{projectName}</h2>
            <div className="space-y-4">
              {Object.entries(files).map(([fileName, versions]) => (
                <div key={fileName} className="bg-gray-900 p-4 rounded-md">
                   <h3 className="font-mono text-gray-300 mb-3">{fileName}</h3>
                   <ul className="divide-y divide-gray-800">
                    {versions.map(versionFile => (
                       <li key={versionFile.id} className="flex items-center justify-between py-2">
                         <div>
                           <span className="text-sm text-gray-400">Version: </span>
                           <span className="font-mono text-sm bg-gray-800 text-red-400 px-2 py-1 rounded">{versionFile.version}</span>
                         </div>
                         <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleImportToProject(versionFile)}
                            className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                            title="Add this file to the project explorer under the 'downloads' folder"
                          >
                            <Icon name="import-to-project" className="w-4 h-4" /> Import
                          </button>
                          <button
                            onClick={() => handleAttachAndStage(versionFile)}
                            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                            title="Attach this file to the staging context to request an update"
                          >
                            <Icon name="stage-file" className="w-4 h-4" /> Stage
                          </button>
                          <button
                            onClick={() => downloadFile(versionFile.content, `${fileName.split('.').slice(0,-1).join('.')}-v${versionFile.version}.${fileName.split('.').pop()}`)}
                            className="flex items-center gap-2 text-sm bg-gray-800 text-gray-200 px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <Icon name="download" className="w-4 h-4" /> Download
                          </button>
                         </div>
                       </li>
                    ))}
                   </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadsPage;