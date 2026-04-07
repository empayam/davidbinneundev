import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export default function StatusBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 bg-[#181818] border-t border-[#2b2b2b] flex items-center justify-between px-2 z-50 text-xs text-[#cccccc]">
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-2">
          <span className="flex items-center">
            <AlertTriangle className="w-3 h-3 mr-0.5" />
            0 Problems
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">Ln 7, Col 25</span>
        <span className="hidden sm:inline">Spaces: 2</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">LF</span>
        <span className="flex items-center gap-1">
          {"{ }"} TypeScript
        </span>
        <Bell className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}