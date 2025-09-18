import JSZip from 'jszip';
import type { GeneratedFile, EditorFile } from '../types';

export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadZip = async (files: GeneratedFile[]) => {
  const zip = new JSZip();

  files.forEach(file => {
    const lastDotIndex = file.fileName.lastIndexOf('.');
    const name = lastDotIndex !== -1 ? file.fileName.substring(0, lastDotIndex) : file.fileName;
    const extension = lastDotIndex !== -1 ? file.fileName.substring(lastDotIndex) : '';
    
    const versionedFileName = `${name}-v${file.version}${extension}`;
    
    const projectFolder = zip.folder(file.projectName);
    if (projectFolder) {
        projectFolder.file(versionedFileName, file.content);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gemini-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadProjectZip = async (files: EditorFile[]) => {
  const zip = new JSZip();

  files.forEach(file => {
    // The file.path already contains the directory structure
    zip.file(file.path, file.content);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'editor-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
