import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CodeComment from './CodeComment';
import { Shield, Code, Cloud, Database, TestTube, Loader2 } from 'lucide-react';

const iconMap = {
  Shield, Code, Cloud, Database, TestTube
};

const defaultSettings = {
  developer_name: 'Your Name',
  developer_role: 'Full-Stack Developer',
  developer_bio: 'Full-Stack Developer & Security Professional\nPassionate about building secure, scalable applications\nSpecialized in SIEM operations and endpoint security',
  developer_focus: ['Security', 'Web Development', 'Cloud'],
  skill_categories: [
    { title: 'Security Operations', icon: 'Shield', color: '#f44747', skills: ['Splunk', 'Cortex XDR', 'FortiSIEM', 'Harmony', 'Log Analysis', 'Endpoint Investigation', 'Active Directory', 'Firewall Configuration', 'Packet Analysis'] },
    { title: 'Frontend Development', icon: 'Code', color: '#569cd6', skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Secure Coding'] },
    { title: 'Backend Development', icon: 'Database', color: '#4ec9b0', skills: ['Node.js', 'Express', 'Docker', 'Git', 'SQL', 'MongoDB'] },
    { title: 'Cloud & AWS', icon: 'Cloud', color: '#dcdcaa', skills: ['EC2', 'S3', 'IAM', 'Lambda', 'DynamoDB'] },
    { title: 'Testing & Automation', icon: 'TestTube', color: '#c586c0', skills: ['Jest', 'Puppeteer', 'Automation', 'Scripting'] },
  ],
};

export default function AboutSection() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ key: 'main' });
      return result[0] || null;
    },
  });

  const config = { ...defaultSettings, ...settings };
  const skillCategories = config.skill_categories || defaultSettings.skill_categories;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Line numbers + code structure */}
      <div className="font-mono text-sm">
        <CodeComment multiline>
          {config.developer_bio}
        </CodeComment>
        
        <div className="mt-4">
          <span className="text-[#569cd6]">const</span>{' '}
          <span className="text-[#9cdcfe]">developer</span>
          <span className="text-[#cccccc]">:</span>{' '}
          <span className="text-[#4ec9b0]">Developer</span>{' '}
          <span className="text-[#cccccc]">=</span>{' '}
          <span className="text-[#ffd700]">{'{'}</span>
        </div>
        
        <div className="pl-4 space-y-1">
          <div>
            <span className="text-[#9cdcfe]">name</span>
            <span className="text-[#cccccc]">:</span>{' '}
            <span className="text-[#ce9178]">"{config.developer_name}"</span>
            <span className="text-[#cccccc]">,</span>
          </div>
          <div>
            <span className="text-[#9cdcfe]">role</span>
            <span className="text-[#cccccc]">:</span>{' '}
            <span className="text-[#ce9178]">"{config.developer_role}"</span>
            <span className="text-[#cccccc]">,</span>
          </div>
          <div>
            <span className="text-[#9cdcfe]">focus</span>
            <span className="text-[#cccccc]">:</span>{' '}
            <span className="text-[#569cd6]">[</span>
            {config.developer_focus?.map((f, i) => (
              <span key={i}>
                <span className="text-[#ce9178]">"{f}"</span>
                {i < config.developer_focus.length - 1 && <span className="text-[#cccccc]">, </span>}
              </span>
            ))}
            <span className="text-[#569cd6]">]</span>
            <span className="text-[#cccccc]">,</span>
          </div>
          <div>
            <span className="text-[#9cdcfe]">skills</span>
            <span className="text-[#cccccc]">:</span>{' '}
            <span className="text-[#ffd700]">{'{'}</span>
            {skillCategories.map((cat, i) => {
              const skillNames = ['frontend', 'backend', 'security', 'aws', 'testing'];
              const skillName = skillNames[i] || 'other';
              return (
                <span key={cat.title}>
                  <span className="text-[#9cdcfe]">{skillName}</span>
                  <span className="text-[#cccccc]">: </span>
                  <span className="text-[#dcdcaa]">{skillName}Skills</span>
                  {i < skillCategories.length - 1 && <span className="text-[#cccccc]">, </span>}
                </span>
              );
            })}
            <span className="text-[#ffd700]">{'}'}</span>
          </div>
        </div>
        
        <div className="text-[#ffd700]">{'}'}</div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {skillCategories.map((category, idx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 hover:border-[#007acc] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { className: "w-5 h-5", style: { color: category.color } })}
              <h3 className="text-[#cccccc] font-medium">{category.title}</h3>
            </div>
            
            <div className="font-mono text-sm">
              <span className="text-[#c586c0]">export const</span>{' '}
              <span className="text-[#dcdcaa]">
                {category.title === 'Security Operations' ? 'securitySkills' :
                 category.title === 'Frontend Development' ? 'frontendSkills' :
                 category.title === 'Backend Development' ? 'backendSkills' :
                 category.title === 'Cloud & AWS' ? 'awsSkills' :
                 category.title === 'Testing & Automation' ? 'testingSkills' : 'skills'}
              </span>
              <span className="text-[#cccccc]">:</span>{' '}
              <span className="text-[#4ec9b0]">string</span>
              <span className="text-[#569cd6]">[]</span>{' '}
              <span className="text-[#cccccc]">=</span>{' '}
              <span className="text-[#569cd6]">[</span>
              <div className="pl-2">
                {category.skills.map((skill, i) => (
                  <div key={skill}>
                    <span className="text-[#ce9178]">"{skill}"</span>
                    {i < category.skills.length - 1 && <span className="text-[#cccccc]">,</span>}
                  </div>
                ))}
              </div>
              <span className="text-[#569cd6]">]</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}