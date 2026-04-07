import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Files, Search, GitBranch, Bug, Blocks, 
  ChevronRight, ChevronDown, FolderOpen, Folder,
  User, Briefcase, GraduationCap, Shield, Mail
} from 'lucide-react';

const sidebarItems = [
  { icon: Files, label: 'Explorer', active: true },
  { icon: Search, label: 'Search' },
  { icon: GitBranch, label: 'Source Control' },
  { icon: Bug, label: 'Run and Debug' },
  { icon: Blocks, label: 'Extensions' },
];

const fileStructure = [
  { 
    name: 'src', 
    type: 'folder', 
    expanded: true,
    children: [
      { name: 'about.ts', type: 'file', icon: User, section: 'about' },
      { name: 'projects.ts', type: 'file', icon: Briefcase, section: 'projects' },
      { name: 'ctfs.ts', type: 'file', icon: Shield, section: 'ctfs' },
      { name: 'education.ts', type: 'file', icon: GraduationCap, section: 'education' },
      { name: 'contact.ts', type: 'file', icon: Mail, section: 'contact' },
    ]
  },
];

export default function Sidebar({ activeSection, setActiveSection }) {
  const [expandedFolders, setExpandedFolders] = useState({ 'src': true });
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleFolder = (name) => {
    setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="fixed left-0 top-8 bottom-6 z-40 flex">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-1 hidden lg:flex border-r border-[#252526]">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            className={`w-12 h-12 flex items-center justify-center relative ${
              item.active ? 'text-white' : 'text-[#858585] hover:text-white'
            }`}
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {item.active && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white" />
            )}
            <item.icon className="w-6 h-6" />
            
            {hoveredItem === item.label && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-14 bg-[#252526] text-[#cccccc] text-xs px-2 py-1 rounded border border-[#454545] whitespace-nowrap z-50"
              >
                {item.label}
              </motion.div>
            )}
          </button>
        ))}
      </div>

      {/* Side Panel */}
      <div className="w-56 bg-[#252526] border-r border-[#1e1e1e] h-full">
        <div className="p-2 pt-14 lg:pt-2 text-[#bbbbbb] text-[11px] uppercase tracking-wider font-semibold">
          Explorer
        </div>
        
        <div className="px-2">
          <div className="text-[#cccccc] text-xs font-semibold mb-1 flex items-center gap-1 py-1">
            <ChevronDown className="w-4 h-4" />
            PORTFOLIO
          </div>
          
          {fileStructure.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => toggleFolder(item.name)}
                className="w-full flex items-center gap-1 py-1 px-2 hover:bg-[#2a2d2e] text-[#cccccc] text-sm"
              >
                {expandedFolders[item.name] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {expandedFolders[item.name] ? (
                  <FolderOpen className="w-4 h-4 text-[#dcb67a]" />
                ) : (
                  <Folder className="w-4 h-4 text-[#dcb67a]" />
                )}
                <span className="ml-1">{item.name}</span>
              </button>
              
              {expandedFolders[item.name] && item.children && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="ml-6"
                >
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => setActiveSection(child.section)}
                      className={`w-full flex items-center gap-2 py-1 px-2 text-sm rounded ${
                        activeSection === child.section 
                          ? 'bg-[#094771] text-white' 
                          : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                      }`}
                    >
                      <child.icon className="w-4 h-4 text-[#3178c6]" />
                      {child.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}