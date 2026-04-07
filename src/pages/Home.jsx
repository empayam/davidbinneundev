import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import VSCodeHeader, { TabsBar } from '../components/portfolio/VSCodeHeader';
import Sidebar from '../components/portfolio/Sidebar';
import FloatingTech from '../components/portfolio/FloatingTech';
import StatusBar from '../components/portfolio/StatusBar';
import AboutSection from '../components/portfolio/AboutSection';
import ProjectCard from '../components/portfolio/ProjectCard';
import CTFCard from '../components/portfolio/CTFCard';
import CourseCard from '../components/portfolio/CourseCard';
import ContactSection from '../components/portfolio/ContactSection';
import CertificateViewer from '../components/portfolio/CertificateViewer';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('about');
  const [openTabs, setOpenTabs] = useState(['about']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCertificate, setOpenCertificate] = useState(null);
  const [lineCount, setLineCount] = useState(1);
  const contentRef = useRef(null);

  const handleSetActiveSection = (section) => {
    if (!openTabs.includes(section)) {
      setOpenTabs([...openTabs, section]);
    }
    setActiveSection(section);
  };

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: ctfs = [] } = useQuery({
    queryKey: ['ctfs'],
    queryFn: () => base44.entities.CTF.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  // Filter content based on search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technologies?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  const filteredCTFs = useMemo(() => {
    if (!searchTerm) return ctfs;
    return ctfs.filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.technologies?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [ctfs, searchTerm]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.technologies?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [courses, searchTerm]);

  // Update line count based on visible content height
  useEffect(() => {
    const updateLineCount = () => {
      if (contentRef.current) {
        const height = contentRef.current.clientHeight;
        setLineCount(Math.max(1, Math.ceil(height / 24)));
      }
    };

    updateLineCount();
    window.addEventListener('resize', updateLineCount);
    
    // Use ResizeObserver for content changes
    const observer = new ResizeObserver(updateLineCount);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateLineCount);
      observer.disconnect();
    };
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return <AboutSection />;
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="font-mono text-sm">
              <span className="text-[#6a9955]">// Projects I've built</span>
            </div>
            {filteredProjects.length === 0 ? (
              <div className="text-[#808080] font-mono text-center py-12">
                {searchTerm ? `// No projects found matching "${searchTerm}"` : '// No projects yet. Add some from the dashboard!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </div>
        );
      case 'ctfs':
        return (
          <div className="space-y-6">
            <div className="font-mono text-sm">
              <span className="text-[#6a9955]">// Capture The Flag challenges completed</span>
            </div>
            {filteredCTFs.length === 0 ? (
              <div className="text-[#808080] font-mono text-center py-12">
                {searchTerm ? `// No CTFs found matching "${searchTerm}"` : '// No CTFs yet. Add some from the dashboard!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCTFs.map((ctf, index) => (
                  <CTFCard key={ctf.id} ctf={ctf} index={index} />
                ))}
              </div>
            )}
          </div>
        );
      case 'education':
        return (
          <div className="space-y-6">
            <div className="font-mono text-sm">
              <span className="text-[#6a9955]">// Courses and certifications</span>
            </div>
            {filteredCourses.length === 0 ? (
              <div className="text-[#808080] font-mono text-center py-12">
                {searchTerm ? `// No courses found matching "${searchTerm}"` : '// No courses yet. Add some from the dashboard!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course, index) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    index={index} 
                    onOpenCertificate={setOpenCertificate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'contact':
        return <ContactSection />;
      default:
        return <AboutSection />;
    }
  };

  return (
    <div className="h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden flex flex-col">
      {/* Floating Technologies Background */}
      <FloatingTech searchTerm={searchTerm} />
      
      {/* VSCode Header with Search */}
      <VSCodeHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-12 left-2 z-50 lg:hidden bg-[#007acc] p-2 rounded-md shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed z-40`}>
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={(section) => {
            handleSetActiveSection(section);
            setSidebarOpen(false);
          }} 
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <main className="lg:ml-[17rem] ml-0 mt-8 flex-1 overflow-auto relative z-10 pb-6">
        {/* Fixed header area */}
        <div className="sticky top-0 z-20 bg-[#1e1e1e]">
          {/* Tabs bar - positioned above content only */}
          <div className="pl-12 lg:pl-0">
            <TabsBar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              openTabs={openTabs}
              setOpenTabs={setOpenTabs}
            />
          </div>

          {/* Breadcrumb path */}
          <div className="h-6 bg-[#1e1e1e] border-b border-[#2b2b2b] flex items-center px-4 pl-14 lg:pl-4 text-xs text-[#808080]">
            <span className="text-[#cccccc]">src</span>
            <span className="mx-1">&gt;</span>
            <span className="text-[#cccccc]">{activeSection}.ts</span>
            <span className="mx-1">&gt;</span>
            <span className="text-[#808080]">...</span>
          </div>
        </div>
        
        {/* Code content with line numbers */}
        <div className="flex">
          {/* Main content */}
          <div 
            ref={contentRef}
            className="flex-1 p-4 lg:p-6 relative"
          >
            {/* Line numbers gutter - positioned inside content */}
            <div className="absolute left-0 top-4 w-8 hidden lg:flex flex-col items-end pr-2 text-[#858585] text-xs font-mono select-none">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="h-6 leading-6">{i + 1}</div>
              ))}
            </div>
            <div className="lg:ml-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      
      {/* Status Bar */}
      <StatusBar />

      {/* Certificate Viewer */}
      {openCertificate && (
        <CertificateViewer 
          certificate={openCertificate} 
          onClose={() => setOpenCertificate(null)} 
        />
      )}
    </div>
  );
}
