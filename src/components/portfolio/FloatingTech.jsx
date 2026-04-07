import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// IDE-themed colors for skills
const ideColors = [
  '#569cd6', // Blue (keywords)
  '#4ec9b0', // Teal (types)
  '#9cdcfe', // Light blue (variables)
  '#ce9178', // Orange (strings)
  '#dcdcaa', // Yellow (functions)
  '#c586c0', // Purple (control)
  '#6a9955', // Green (comments)
  '#f44747', // Red (errors/security)
  '#d7ba7d', // Gold (constants)
  '#b5cea8', // Light green (numbers)
];

const getRandomIdeColor = (index) => {
  return ideColors[index % ideColors.length];
};

export default function FloatingTech({ searchTerm = '' }) {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ key: 'main' });
      return result[0] || null;
    },
  });

  // Extract all skills from skill categories
  const technologies = useMemo(() => {
    const categories = settings?.skill_categories || [];
    const allSkills = [];
    
    categories.forEach((category, catIndex) => {
      category.skills?.forEach((skill, skillIndex) => {
        allSkills.push({
          name: skill,
          color: getRandomIdeColor(catIndex * 5 + skillIndex),
          category: category.title || 'default'
        });
      });
    });
    
    // If no skills from settings, use some defaults
    if (allSkills.length === 0) {
      return [
        'React', 'TypeScript', 'Node.js', 'Docker', 'AWS', 
        'MongoDB', 'Python', 'Git', 'Linux', 'Kubernetes',
        'Splunk', 'Security', 'JavaScript', 'SQL', 'Express'
      ].map((name, i) => ({ name, color: getRandomIdeColor(i), category: 'default' }));
    }
    
    return allSkills;
  }, [settings]);

  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const generatePositions = () => {
      return technologies.map(() => ({
        x: Math.random() * 85 + 5,
        y: Math.random() * 85 + 5,
        duration: Math.random() * 25 + 35,
        delay: Math.random() * 8,
        scale: 0.8 + Math.random() * 0.4,
      }));
    };
    setPositions(generatePositions());
  }, [technologies.length]);

  const filteredTech = technologies.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {filteredTech.map((tech, index) => {
        const pos = positions[index] || { x: 50, y: 50, duration: 30, delay: 0, scale: 1 };
        const isHighlighted = searchTerm && tech.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return (
          <motion.div
            key={`${tech.name}-${index}`}
            className="absolute font-mono select-none"
            style={{
              fontSize: `${11 + (pos.scale || 1) * 3}px`,
            }}
            initial={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              opacity: 0 
            }}
            animate={{ 
              left: [`${pos.x}%`, `${(pos.x + 12) % 90}%`, `${(pos.x - 8 + 100) % 90}%`, `${pos.x}%`],
              top: [`${pos.y}%`, `${(pos.y - 10 + 100) % 85}%`, `${(pos.y + 8) % 85}%`, `${pos.y}%`],
              opacity: isHighlighted ? 0.9 : 0.12,
              scale: isHighlighted ? 1.5 : 1,
            }}
            transition={{ 
              duration: pos.duration,
              repeat: Infinity,
              delay: pos.delay,
              ease: "easeInOut"
            }}
          >
            <span 
              style={{ 
                color: tech.color,
                textShadow: isHighlighted ? `0 0 20px ${tech.color}, 0 0 40px ${tech.color}50` : 'none'
              }}
            >
              {tech.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}