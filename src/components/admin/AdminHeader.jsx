import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function AdminHeader({ currentPage }) {
  const navigate = useNavigate();
  const pages = [
    { name: 'about.js', page: 'Admin' },
    { name: 'projects.js', page: 'AdminProjects' },
    { name: 'ctfs.js', page: 'AdminCTFs' },
    { name: 'education.js', page: 'AdminEducation' },
    { name: 'contact.js', page: 'AdminContact' },
    { name: 'technologies.js', page: 'AdminTechnologies' },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('AdminLogin'));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Title bar */}
      <div className="h-8 bg-[#323233] flex items-center justify-between px-3 border-b border-[#252526]">
        <div className="flex items-center gap-2">
          <span className="text-[#cccccc] text-xs font-medium">admin-panel.js — Portfolio Admin</span>
        </div>
        <div className="flex">
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#505050] transition-colors">
            <Minus className="w-4 h-4 text-[#cccccc]" />
          </button>
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#505050] transition-colors">
            <Square className="w-3 h-3 text-[#cccccc]" />
          </button>
          <button className="w-12 h-8 flex items-center justify-center hover:bg-[#e81123] transition-colors group">
            <X className="w-4 h-4 text-[#cccccc] group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Menu bar */}
      <div className="h-9 bg-[#3c3c3c] flex items-center px-3 gap-4 border-b border-[#252526]">
        <Link to={createPageUrl('Home')} className="text-[#cccccc] text-xs hover:bg-[#505050] px-2 py-1 rounded">
          ← Back to Site
        </Link>
        <span className="text-[#808080]">|</span>
        <span className="text-[#cccccc] text-xs">Admin Panel</span>
        <button
          onClick={handleLogout}
          className="ml-auto text-[#cccccc] text-xs hover:bg-[#505050] px-2 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Tabs bar */}
      <div className="h-9 bg-[#252526] flex items-end overflow-x-auto">
        {pages.map((p) => (
          <Link
            key={p.page}
            to={createPageUrl(p.page)}
            className={`h-full flex items-center px-4 text-xs gap-2 whitespace-nowrap ${
              currentPage === p.page
                ? 'bg-[#1e1e1e] border-t-2 border-t-[#007acc] text-[#cccccc]'
                : 'text-[#808080] hover:bg-[#2d2d2d]'
            }`}
          >
            <span className="text-[#519aba]">⟨/⟩</span>
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
