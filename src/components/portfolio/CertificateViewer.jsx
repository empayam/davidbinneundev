import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function CertificateViewer({ certificate, onClose }) {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e1e]">
      {/* Tab bar */}
      <div className="h-9 bg-[#252526] flex items-end border-b border-[#3c3c3c]">
        <div className="h-full flex items-center px-4 text-xs gap-2 bg-[#1e1e1e] border-t-2 border-t-[#007acc] text-[#cccccc]">
          <ImageIcon className="w-4 h-4 text-[#6997d5]" />
          <span className="font-mono">{certificate.title || 'certificate'}.png</span>
          <button 
            onClick={onClose}
            className="ml-2 hover:bg-[#3c3c3c] rounded p-0.5"
          >
            <X className="w-3 h-3 text-[#808080] hover:text-[#cccccc]" />
          </button>
        </div>
      </div>

      {/* Image content */}
      <div className="h-[calc(100vh-2.25rem)] flex items-center justify-center p-8 overflow-auto">
        <img 
          src={certificate.imageUrl} 
          alt={certificate.title || 'Certificate'} 
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-12 right-4 text-[#808080] hover:text-[#cccccc] bg-[#252526] p-2 rounded"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}