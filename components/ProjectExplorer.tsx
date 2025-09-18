import React, { useMemo, useState } from 'react';
import type { EditorFile } from '../types';
import { Icon } from './Icon';

interface ProjectExplorerProps {
  files: EditorFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  file?: EditorFile;
  children: Record<string, TreeNode>;
}

const buildFileTree = (files: EditorFile[]): TreeNode => {
  const root: TreeNode = { name: 'root', path: '', children: {} };

  files.forEach(file => {
    let currentNode = root;
    const pathParts = file.path.split('/').filter(p => p);

    pathParts.forEach((part, index) => {
      const isLastPart = index === pathParts.length - 1;
      if (!currentNode.children[part]) {
        const currentPath = pathParts.slice(0, index + 1).join('/');
        currentNode.children[part] = {
          name: part,
          path: currentPath,
          children: {},
          file: isLastPart ? file : undefined,
        };
      }
      currentNode = currentNode.children[part];
       if (isLastPart) {
        currentNode.file = file;
      }
    });
  });

  return root;
};

const FileSystemNode: React.FC<{
  node: TreeNode;
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  level: number;
}> = ({ node, activeFileId, onFileSelect, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = Object.keys(node.children).length > 0 && !node.file;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (node.file) {
      onFileSelect(node.file.id);
    }
  };

  const sortedChildren = Object.values(node.children).sort((a, b) => {
    const aIsFolder = Object.keys(a.children).length > 0 && !a.file;
    const bIsFolder = Object.keys(b.children).length > 0 && !b.file;
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const isActive = node.file ? activeFileId === node.file.id : false;

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`flex items-center cursor-pointer py-1 text-sm rounded ${isActive ? 'bg-red-600/30 text-white' : 'text-gray-300 hover:bg-gray-900'}`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <Icon 
          name={isFolder ? (isOpen ? 'folder-open' : 'folder') : 'file'}
          className={`w-4 h-4 mr-2 flex-shrink-0 ${isFolder ? 'text-red-500' : 'text-gray-500'}`}
        />
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div>
          {sortedChildren.map(child => (
            <FileSystemNode 
              key={child.path} 
              node={child} 
              activeFileId={activeFileId} 
              onFileSelect={onFileSelect} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ files, activeFileId, onFileSelect, onFileCreate }) => {
  const [newFilePath, setNewFilePath] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilePath.trim()) {
      onFileCreate(newFilePath.trim());
      setNewFilePath('');
      setIsCreating(false);
    }
  };
  
  return (
    <div className="w-64 bg-black flex flex-col h-full border-r border-gray-800">
      <div className="p-2 border-b border-gray-800">
        <h2 className="text-sm font-bold uppercase text-red-500">Project</h2>
      </div>
      <div className="p-2">
        <button 
          onClick={() => setIsCreating(true)} 
          className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-gray-200 py-1.5 rounded-md"
        >
          + New File
        </button>
      </div>
       {isCreating && (
        <form onSubmit={handleCreateFile} className="p-2 border-b border-gray-800">
          <input
            type="text"
            autoFocus
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            onBlur={() => { if (!newFilePath) setIsCreating(false); }}
            placeholder="src/path/to/file.js"
            className="w-full bg-gray-800 text-white text-sm rounded p-1 border border-red-500 outline-none"
          />
        </form>
      )}
      <div className="flex-1 p-2 overflow-y-auto">
        {Object.values(fileTree.children).sort((a,b) => a.name.localeCompare(b.name)).map(node => (
          <FileSystemNode
            key={node.path}
            node={node}
            activeFileId={activeFileId}
            onFileSelect={onFileSelect}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectExplorer;