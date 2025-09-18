
import React, { lazy, Suspense } from 'react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface EditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
  onMount?: (editor: any, monaco: any) => void;
}

const Editor: React.FC<EditorProps> = ({ language, value, onChange, readOnly = false, onMount }) => {
  return (
    <Suspense fallback={<div className="w-full h-full bg-gray-800 animate-pulse" />}>
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        onMount={onMount}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </Suspense>
  );
};

export default Editor;
