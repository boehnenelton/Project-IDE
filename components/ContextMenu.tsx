import React, { useEffect, useRef } from 'react';

// Fix: Make label and action optional to allow for separator items.
export interface MenuItem {
  label?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const style = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="absolute z-50 w-60 bg-black border border-gray-800 rounded-md shadow-lg py-1"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`sep-${index}`} className="border-t border-gray-800 my-1" />;
        }
        return (
          <button
            key={index}
            onClick={() => {
              // Fix: Check for item.action before calling it.
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-red-600 hover:text-white disabled:text-gray-500 disabled:bg-black disabled:cursor-not-allowed"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;