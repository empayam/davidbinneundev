import React from 'react';
import { Search, X, Minus, Square, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";

export const allTabs = [
  { id: 'about', name: 'about.ts', icon: 'TS', iconColor: 'text-[#3178c6]' },
  { id: 'projects', name: 'projects.ts', icon: 'TS', iconColor: 'text-[#3178c6]' },
  { id: 'ctfs', name: 'ctfs.ts', icon: 'TS', iconColor: 'text-[#3178c6]' },
  { id: 'education', name: 'education.ts', icon: 'TS', iconColor: 'text-[#3178c6]' },
  { id: 'contact', name: 'contact.ts', icon: 'TS', iconColor: 'text-[#3178c6]' },
];

export default function VSCodeHeader({ searchTerm, setSearchTerm }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Title bar with menu items */}
      <div className="h-8 bg-[#181818] flex items-center justify-between border-b border-[#2b2b2b]">
        <div className="flex items-center">
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">File</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">Edit</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">Selection</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">View</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">Go</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">Run</span>
          <span className="text-[#cccccc] text-xs hover:bg-[#2d2d2d] px-3 py-1.5 cursor-pointer">Terminal</span>
        </div>
        
        <div className="flex-1" />
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1 px-2">
          <button className="p-1 text-[#808080] hover:text-[#cccccc] opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 text-[#808080] hover:text-[#cccccc] opacity-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search bar in center */}
        <div className="flex justify-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#808080]" />
            <Input
              type="text"
              placeholder="portfolio"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#2d2d2d] border-[#2d2d2d] text-[#cccccc] text-xs pl-8 pr-8 h-6 rounded focus:border-[#007acc] focus:ring-0 placeholder:text-[#808080]"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-[#808080] hover:text-[#cccccc]" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1" />
        

        
        {/* Window controls */}
        <div className="flex">
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#2d2d2d] transition-colors">
            <Minus className="w-4 h-4 text-[#cccccc]" />
          </button>
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#2d2d2d] transition-colors">
            <Copy className="w-3 h-3 text-[#cccccc]" />
          </button>
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#e81123] transition-colors group">
            <X className="w-4 h-4 text-[#cccccc] group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TabsBar({ activeSection, setActiveSection, openTabs, setOpenTabs }) {
  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    if (openTabs.length <= 1) return;
    
    const newOpenTabs = openTabs.filter(id => id !== tabId);
    setOpenTabs(newOpenTabs);
    
    if (activeSection === tabId) {
      const currentIndex = openTabs.indexOf(tabId);
      const nextTab = newOpenTabs[Math.min(currentIndex, newOpenTabs.length - 1)];
      setActiveSection(nextTab);
    }
  };

  const visibleTabs = openTabs.map(id => allTabs.find(tab => tab.id === id)).filter(Boolean);

  return (
    <div className="h-9 bg-[#252526] flex items-end overflow-x-auto border-b border-[#1e1e1e]">
      {visibleTabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveSection(tab.id)}
          className={`h-full flex items-center px-4 text-xs gap-2 cursor-pointer whitespace-nowrap group ${
            activeSection === tab.id
              ? 'bg-[#1e1e1e] border-t-2 border-t-[#007acc] text-[#cccccc]'
              : 'text-[#808080] hover:bg-[#2d2d2d]'
          }`}
        >
          <span className={tab.iconColor}>{tab.icon}</span>
          {tab.name}
          <button
            onClick={(e) => handleCloseTab(e, tab.id)}
            className={`w-4 h-4 flex items-center justify-center rounded hover:bg-[#3c3c3c] ${
              openTabs.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
            } ${activeSection === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <X className="w-3 h-3 text-[#808080] hover:text-[#cccccc]" />
          </button>
        </div>
      ))}
    </div>
  );
}