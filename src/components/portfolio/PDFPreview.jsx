import React from 'react';

export default function CertificatePreview({ imageUrl, title, onOpenCertificate }) {
  if (!imageUrl) return null;

  return (
    <div 
      onClick={() => onOpenCertificate && onOpenCertificate({ imageUrl, title })}
      className="relative w-full h-32 bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden cursor-pointer group"
    >
      <img 
        src={imageUrl} 
        alt={title || 'Certificate'} 
        className="w-full h-full object-contain"
      />
      
      <div className="absolute inset-0 bg-[#007acc]/0 group-hover:bg-[#007acc]/20 transition-colors flex items-center justify-center">
        <span className="text-white text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-[#1e1e1e]/80 px-2 py-1 rounded">
          View Certificate
        </span>
      </div>
    </div>
  );
}