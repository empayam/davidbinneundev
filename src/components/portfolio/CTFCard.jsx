import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Flag } from 'lucide-react';

const difficultyColors = {
  'Easy': 'text-[#4ec9b0]',
  'Medium': 'text-[#dcdcaa]',
  'Hard': 'text-[#ce9178]',
  'Insane': 'text-[#f44747]',
};

const categoryIcons = {
  'Web': '🌐',
  'Forensics': '🔍',
  'Crypto': '🔐',
  'Reverse Engineering': '⚙️',
  'Pwn': '💥',
  'Misc': '🎯',
  'OSINT': '🔎',
  'Network': '📡',
};

export default function CTFCard({ ctf, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#252526] border border-[#3c3c3c] rounded-lg overflow-hidden hover:border-[#007acc] transition-all duration-300"
    >
      {ctf.image && (
        <a 
          href={ctf.writeup_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="h-32 overflow-hidden block cursor-pointer"
        >
          <img 
            src={ctf.image} 
            alt={ctf.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </a>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[#9cdcfe] font-mono">
                <span className="text-[#569cd6]">const</span> {ctf.title.replace(/\s/g, '_')}<span className="text-[#cccccc]">:</span> <span className="text-[#4ec9b0]">CTF</span> <span className="text-[#cccccc]">=</span> <span className="text-[#569cd6]">{"{"}</span>
              </h3>
            </div>
          </div>
          {ctf.writeup_link && (
            <a 
              href={ctf.writeup_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#808080] hover:text-[#007acc] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <div className="pl-4 border-l-2 border-[#3c3c3c] ml-2 mb-3 font-mono text-sm">
          <div className="text-[#9cdcfe]">
            platform: <span className="text-[#ce9178]">"{ctf.platform}"</span>,
          </div>
          {ctf.topic && (
            <div className="text-[#9cdcfe]">
              topic: <span className="text-[#ce9178]">"{ctf.topic}"</span>,
            </div>
          )}
          <div className="text-[#9cdcfe]">
            difficulty: <span className={difficultyColors[ctf.difficulty] || 'text-[#cccccc]'}>"{ctf.difficulty}"</span>
          </div>
        </div>
        
        <div className="font-mono text-[#569cd6]">{"}"}</div>
        
        {ctf.description && (
          <div className="text-[#6a9955] text-sm mt-2 font-mono">
            // {ctf.description}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          {ctf.technologies?.map((tech, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 bg-[#1e1e1e] text-[#569cd6] text-xs font-mono rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}