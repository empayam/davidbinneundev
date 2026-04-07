import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award } from 'lucide-react';
import CertificatePreview from './PDFPreview';

export default function CourseCard({ course, index, onOpenCertificate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 hover:border-[#007acc] transition-all duration-300"
    >
      {/* Certificate Image Preview */}
      {course.certificate_pdf && (
        <div className="mb-3">
          <CertificatePreview 
            imageUrl={course.certificate_pdf} 
            title={course.title} 
            onOpenCertificate={onOpenCertificate}
          />
        </div>
      )}

      <div className="mb-2">
        <h3 className="text-[#9cdcfe] font-mono">
          <span className="text-[#569cd6]">const</span> {course.title.replace(/\s/g, '')}<span className="text-[#cccccc]">:</span> <span className="text-[#4ec9b0]">Course</span>
        </h3>
        <p className="text-[#808080] text-xs mt-1">{course.provider}</p>
      </div>
      
      {course.description && (
        <div className="text-[#6a9955] text-sm mb-3 font-mono">
          <div>/*</div>
          {course.description.split('\n').map((line, i) => (
            <div key={i}> * {line}</div>
          ))}
          <div> */</div>
        </div>
      )}
      
      {course.months && (
        <div className="flex items-center gap-1 text-xs text-[#808080] mb-3">
          <Calendar className="w-3 h-3" />
          {course.months} {course.months === 1 ? 'month' : 'months'}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {course.technologies?.map((tech, i) => (
          <span 
            key={i}
            className="px-2 py-0.5 bg-[#1e1e1e] text-[#c586c0] text-xs font-mono rounded border border-[#3c3c3c]"
          >
            {tech}
          </span>
        ))}
      </div>

      {course.certificate_link && (
        <a 
          href={course.certificate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#4ec9b0] hover:text-[#4ec9b0]/80 text-xs mt-3"
        >
          <Award className="w-4 h-4" />
          Credential
        </a>
      )}
    </motion.div>
  );
}