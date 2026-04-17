
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  disableBackdropClick?: boolean;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, hideCloseButton = false, disableBackdropClick = false }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableBackdropClick) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disableBackdropClick]);
  
  if (!isOpen) return null;

  const handleBackdropClick = () => {
      if (!disableBackdropClick) {
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={handleBackdropClick}>
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {!hideCloseButton && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <CloseIcon />
            </button>
          )}
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
