import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

export default function ProjectCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#252526] border border-[#3c3c3c] rounded-lg overflow-hidden hover:border-[#007acc] transition-all duration-300 group"
    >
      {project.preview_image && (
        <a 
          href={project.live_link || project.github_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-40 overflow-hidden block cursor-pointer"
        >
          <img 
            src={project.preview_image} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent opacity-60" />
        </a>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[#9cdcfe] font-mono text-lg">
            <span className="text-[#569cd6]">const</span> {project.title.replace(/\s/g, '')}<span className="text-[#cccccc]">:</span> <span className="text-[#4ec9b0]">Project</span>
          </h3>
          <div className="flex gap-2">
            {project.github_link && (
              <a 
                href={project.github_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#808080] hover:text-[#cccccc] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {project.live_link && (
              <a 
                href={project.live_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#808080] hover:text-[#cccccc] transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
        
        <p className="text-[#6a9955] text-sm mb-3 font-mono">
          // {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {project.technologies?.map((tech, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-[#1e1e1e] text-[#9cdcfe] text-xs font-mono rounded border border-[#3c3c3c]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}