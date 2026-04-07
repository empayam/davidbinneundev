import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ value, onChange, label = "image" }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[#9cdcfe] font-mono text-sm block mb-2">{label}:</label>
      
      {value ? (
        <div className="relative group">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-lg border border-[#3c3c3c]"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-[#1e1e1e]/80 p-1 rounded-full text-[#f44747] hover:bg-[#1e1e1e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#3c3c3c] rounded-lg cursor-pointer hover:border-[#007acc] transition-colors bg-[#1e1e1e]">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-[#808080] mb-2" />
              <span className="text-[#808080] text-sm font-mono">Click to upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}