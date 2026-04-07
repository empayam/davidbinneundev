import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminHeader from '../components/admin/AdminHeader';
import ImageUploader from '../components/admin/ImageUploader';

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [newTech, setNewTech] = useState('');

  const [orderedProjects, setOrderedProjects] = useState([]);

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
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  useEffect(() => {
    setOrderedProjects([...projects].sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [projects]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
      toast.success('Project created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
      toast.success('Project updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted!');
    },
  });

  const handleSave = () => {
    if (editingProject.id) {
      updateMutation.mutate({ id: editingProject.id, data: editingProject });
    } else {
      createMutation.mutate(editingProject);
    }
  };

  const addTech = () => {
    if (newTech.trim()) {
      setEditingProject({
        ...editingProject,
        technologies: [...(editingProject.technologies || []), newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTech = (index) => {
    setEditingProject({
      ...editingProject,
      technologies: editingProject.technologies.filter((_, i) => i !== index)
    });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(orderedProjects);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setOrderedProjects(reordered);
    
    // Update order in database
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) {
        await base44.entities.Project.update(reordered[i].id, { order: i });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    toast.success('Order updated!');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc]">
      <AdminHeader currentPage="AdminProjects" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">Projects</span>
          </h1>
          <Button
            onClick={() => setEditingProject({ title: '', description: '', technologies: [] })}
            className="bg-[#007acc] hover:bg-[#005a9e]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#569cd6] font-mono">
                  {editingProject.id ? 'Edit Project' : 'New Project'}
                </h2>
                <button onClick={() => setEditingProject(null)}>
                  <X className="w-5 h-5 text-[#808080] hover:text-[#cccccc]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">title:</label>
                  <Input
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">description:</label>
                  <Textarea
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#6a9955] font-mono"
                  />
                </div>

                <ImageUploader
                  label="preview_image"
                  value={editingProject.preview_image || ''}
                  onChange={(url) => setEditingProject({ ...editingProject, preview_image: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">live_link:</label>
                    <Input
                      value={editingProject.live_link || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, live_link: e.target.value })}
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">github_link:</label>
                    <Input
                      value={editingProject.github_link || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, github_link: e.target.value })}
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">technologies: [</label>
                  <div className="pl-4 space-y-1 mb-2">
                    {editingProject.technologies?.map((tech, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-[#ce9178]">"{tech}"</span>
                        <button onClick={() => removeTech(index)} className="text-[#f44747]">×</button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTech()}
                        placeholder="Add technology..."
                        className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono text-sm flex-1"
                      />
                      <Button onClick={addTech} size="sm" className="bg-[#007acc]">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-[#9cdcfe] font-mono text-sm">]</span>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingProject(null)} className="border-[#3c3c3c] text-[#cccccc]">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-[#007acc] hover:bg-[#005a9e]">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {orderedProjects.length === 0 && (
          <div className="text-center py-12 text-[#808080] font-mono">
            // No projects yet. Click "New Project" to add one.
          </div>
        )}
        {orderedProjects.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                  {orderedProjects.map((project, index) => (
                    <Draggable key={project.id} draggableId={project.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 hover:border-[#007acc] transition-all ${snapshot.isDragging ? 'border-[#007acc]' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div {...provided.dragHandleProps} className="pt-1 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-[#808080] hover:text-[#cccccc]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-[#4fc1ff] font-mono">
                                    <span className="text-[#c586c0]">class</span> {project.title?.replace(/\s/g, '')}
                                  </h3>
                                  <p className="text-[#6a9955] text-sm mt-1">// {project.description}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {project.technologies?.map((tech, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-[#1e1e1e] text-[#9cdcfe] text-xs font-mono rounded">
                                        "{tech}"
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingProject(project)}
                                    className="text-[#007acc] hover:text-[#007acc] hover:bg-[#007acc]/10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(project.id)}
                                    className="text-[#f44747] hover:text-[#f44747] hover:bg-[#f44747]/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
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
        )}
      </main>
    </div>
  );
}