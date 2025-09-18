import React from 'react';

// Define the props for the Icon component
interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

// A dictionary to hold SVG paths for each icon name
const icons: { [key: string]: React.ReactNode } = {
  menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
  gemini: <path d="M12.928 3.072L12 5.25l-.928-2.178L9 3l2.072-2.072L12 .75l.928 2.178L15 3l-2.072.072zM3.072 9.072L3 11.25l-.072-2.178L.75 9l2.178-2.072L3 6.75l.072 2.178L5.25 9l-2.178.072zm9.856 0L12 11.25l-.928-2.178L9 9l2.072-2.072L12 6.75l.928 2.178L15 9l-2.072.072zM12 12.75c-3.978 0-7.538 3.015-8.25 7.125h16.5c-.712-4.11-4.272-7.125-8.25-7.125z" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
  code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4" />,
  document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  ai: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
  history: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  send: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
  'add-to-context': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  attachment: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />,
  image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  'send-to-editor': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  zip: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4M8 2h8v4H8V2z" />,
  folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
  'folder-open': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />,
  file: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  'stage-file': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  'import-to-project': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L4 19l-2 2 2-2 4-4a6 6 0 015.743-7.743z" />,
  heading: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5h8M13 19h8M5 5v14h8V5H5z" />,
  bold: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />,
  italic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4l-4 16m-2-16h8m-8 16h8" />,
  'list-ul': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  'list-ol': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 6h10M11 12h10M11 18h10M4 6h1v4M4 12h1.5l-1.5 2h2" />,
  'code-block': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 4-4-4" />,
  link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
};

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};