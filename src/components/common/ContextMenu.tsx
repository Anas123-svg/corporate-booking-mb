import { useRef, useEffect } from 'react';

interface ContextMenuProps {
  xPos: number;
  yPos: number;
  onClose: () => void;
  children: React.ReactNode;
}

const ContextMenu = ({ xPos, yPos, onClose, children } : ContextMenuProps) => {
  const menuRef = useRef(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: yPos,
        left: xPos,
        zIndex: 1000,
        backgroundColor: 'white',
      }}
    >
      {children}
    </div>
  );
};

export default ContextMenu;