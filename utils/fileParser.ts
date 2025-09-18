import type { GeneratedFile } from '../types';

export const parseAIResponse = (responseText: string): Omit<GeneratedFile, 'id'>[] => {
  const files: Omit<GeneratedFile, 'id'>[] = [];
  const regex = /projectName:\s*(.*?)\s*\nfilename:\s*(.*?)\s*\nversion:\s*(.*?)\s*\n([\s\S]*?)\nend of file:.*?(?=\nprojectName:|$)/gs;
  
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    const projectName = match[1].trim();
    const fileName = match[2].trim();
    const version = match[3].trim();
    let content = match[4].trim();
    
    if (content.startsWith('```')) {
      content = content.substring(content.indexOf('\n') + 1);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.lastIndexOf('```'));
    }

    if (projectName && fileName && version && content) {
      files.push({ projectName, fileName, version, content: content.trim() });
    }
  }

  if (files.length === 0 && responseText.trim().length > 0) {
      files.push({
          projectName: 'default-project',
          fileName: `response-${Date.now()}.txt`,
          version: '1.0.0',
          content: responseText.trim()
      });
  }

  return files;
};
