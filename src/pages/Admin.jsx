import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminHeader from '../components/admin/AdminHeader';
import SkillEditor from '../components/admin/SkillEditor';

const defaultSettings = {
  key: 'main',
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
  social_links: [
    { platform: 'GitHub', url: '#', icon: 'Github' },
    { platform: 'LinkedIn', url: '#', icon: 'Linkedin' },
    { platform: 'Twitter', url: '#', icon: 'Twitter' },
    { platform: 'Email', url: 'mailto:your@email.com', icon: 'Mail' },
  ]
};

export default function Admin() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  const [settings, setSettings] = useState(defaultSettings);
  const [newFocus, setNewFocus] = useState('');

  const { data: existingSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ key: 'main' });
      return result[0] || null;
    },
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({ ...defaultSettings, ...existingSettings });
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings?.id) {
        return base44.entities.SiteSettings.update(existingSettings.id, data);
      } else {
        return base44.entities.SiteSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Settings saved successfully!');
    },
  });

  const updateCategory = (index, updatedCategory) => {
    const newCategories = [...settings.skill_categories];
    newCategories[index] = updatedCategory;
    setSettings({ ...settings, skill_categories: newCategories });
  };

  const deleteCategory = (index) => {
    setSettings({
      ...settings,
      skill_categories: settings.skill_categories.filter((_, i) => i !== index)
    });
  };

  const addCategory = () => {
    setSettings({
      ...settings,
      skill_categories: [
        ...settings.skill_categories,
        { title: 'New Category', icon: 'Code', color: '#569cd6', skills: [] }
      ]
    });
  };

  const handleCategoryDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(settings.skill_categories);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSettings({ ...settings, skill_categories: reordered });
  };

  const handleFocusDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(settings.developer_focus);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSettings({ ...settings, developer_focus: reordered });
  };

  const addFocus = () => {
    if (newFocus.trim()) {
      setSettings({
        ...settings,
        developer_focus: [...settings.developer_focus, newFocus.trim()]
      });
      setNewFocus('');
    }
  };

  const removeFocus = (index) => {
    setSettings({
      ...settings,
      developer_focus: settings.developer_focus.filter((_, i) => i !== index)
    });
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc]">
      <AdminHeader currentPage="Admin" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">About Section Settings</span>
          </h1>
          <Button
            onClick={() => saveMutation.mutate(settings)}
            disabled={saveMutation.isPending}
            className="bg-[#007acc] hover:bg-[#005a9e]"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Developer Info */}
        <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 mb-6">
          <h2 className="text-[#569cd6] font-mono mb-4">Developer Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">name:</label>
              <Input
                value={settings.developer_name}
                onChange={(e) => setSettings({ ...settings, developer_name: e.target.value })}
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
              />
            </div>
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">role:</label>
              <Input
                value={settings.developer_role}
                onChange={(e) => setSettings({ ...settings, developer_role: e.target.value })}
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[#9cdcfe] font-mono text-sm block mb-2">bio:</label>
            <Textarea
              value={settings.developer_bio}
              onChange={(e) => setSettings({ ...settings, developer_bio: e.target.value })}
              className="bg-[#1e1e1e] border-[#3c3c3c] text-[#6a9955] font-mono min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-[#9cdcfe] font-mono text-sm block mb-2">focus: [</label>
            <DragDropContext onDragEnd={handleFocusDragEnd}>
              <Droppable droppableId="focus-list">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="pl-4 space-y-2 mb-2">
                    {settings.developer_focus.map((focus, index) => (
                      <Draggable key={`focus-${index}`} draggableId={`focus-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 group ${snapshot.isDragging ? 'bg-[#1e1e1e] rounded px-2 py-1' : ''}`}
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-3 h-3 text-[#808080] group-hover:text-[#cccccc]" />
                            </div>
                            <span className="text-[#ce9178]">"{focus}"</span>
                            <button
                              onClick={() => removeFocus(index)}
                              className="text-[#f44747] hover:text-[#f44747]/80 text-xs opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <div className="flex gap-2">
                      <Input
                        value={newFocus}
                        onChange={(e) => setNewFocus(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addFocus()}
                        placeholder="Add focus area..."
                        className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono text-sm flex-1"
                      />
                      <Button onClick={addFocus} size="sm" className="bg-[#007acc] hover:bg-[#005a9e]">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <span className="text-[#9cdcfe] font-mono text-sm">]</span>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#569cd6] font-mono">Skill Categories</h2>
            <Button onClick={addCategory} size="sm" className="bg-[#007acc] hover:bg-[#005a9e]">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <DragDropContext onDragEnd={handleCategoryDragEnd}>
            <Droppable droppableId="categories-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.skill_categories.map((category, index) => (
                    <Draggable key={`cat-${index}`} draggableId={`cat-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? 'opacity-90' : ''}
                        >
                          <div className="flex gap-2">
                            <div {...provided.dragHandleProps} className="pt-4 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-[#808080] hover:text-[#cccccc]" />
                            </div>
                            <div className="flex-1">
                              <SkillEditor
                                category={category}
                                onUpdate={(updated) => updateCategory(index, updated)}
                                onDelete={() => deleteCategory(index)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </main>
    </div>
  );
}