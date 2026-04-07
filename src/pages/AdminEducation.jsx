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

export default function AdminEducation() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newTech, setNewTech] = useState('');

  const [orderedCourses, setOrderedCourses] = useState([]);

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

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  useEffect(() => {
    setOrderedCourses([...courses].sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [courses]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      toast.success('Course created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      toast.success('Course updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted!');
    },
  });

  const handleSave = () => {
    if (editingCourse.id) {
      updateMutation.mutate({ id: editingCourse.id, data: editingCourse });
    } else {
      createMutation.mutate(editingCourse);
    }
  };

  const addTech = () => {
    if (newTech.trim()) {
      setEditingCourse({
        ...editingCourse,
        technologies: [...(editingCourse.technologies || []), newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTech = (index) => {
    setEditingCourse({
      ...editingCourse,
      technologies: editingCourse.technologies.filter((_, i) => i !== index)
    });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(orderedCourses);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setOrderedCourses(reordered);
    
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) {
        await base44.entities.Course.update(reordered[i].id, { order: i });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['courses'] });
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
      <AdminHeader currentPage="AdminEducation" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">Courses & Education</span>
          </h1>
          <Button
            onClick={() => setEditingCourse({ title: '', provider: '', technologies: [] })}
            className="bg-[#007acc] hover:bg-[#005a9e]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#569cd6] font-mono">
                  {editingCourse.id ? 'Edit Course' : 'New Course'}
                </h2>
                <button onClick={() => setEditingCourse(null)}>
                  <X className="w-5 h-5 text-[#808080] hover:text-[#cccccc]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">title:</label>
                    <Input
                      value={editingCourse.title || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">provider:</label>
                    <Input
                      value={editingCourse.provider || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, provider: e.target.value })}
                      placeholder="Udemy, Coursera..."
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">description:</label>
                  <Textarea
                    value={editingCourse.description || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#6a9955] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">months:</label>
                  <Input
                    type="number"
                    value={editingCourse.months || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, months: parseInt(e.target.value) || 0 })}
                    placeholder="Duration in months"
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#b5cea8] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">certificate_link:</label>
                  <Input
                    value={editingCourse.certificate_link || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, certificate_link: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">
                    certificate_image:
                  </label>
                  <ImageUploader
                    value={editingCourse.certificate_pdf || ''}
                    onChange={(url) => setEditingCourse({ ...editingCourse, certificate_pdf: url })}
                    label="Upload Certificate Image"
                  />
                  <p className="text-[#808080] text-xs mt-1 font-mono">// Upload an image of your certificate</p>
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">technologies: [</label>
                  <div className="pl-4 space-y-1 mb-2">
                    {editingCourse.technologies?.map((tech, index) => (
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
                  <Button variant="outline" onClick={() => setEditingCourse(null)} className="border-[#3c3c3c] text-[#cccccc]">
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

        {/* Courses List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="courses-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                  {orderedCourses.map((course, index) => (
                    <Draggable key={course.id} draggableId={course.id} index={index}>
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
                                  <h3 className="text-[#dcdcaa] font-mono">
                                    <span className="text-[#c586c0]">function</span> {course.title?.replace(/\s/g, '')}()
                                  </h3>
                                  <p className="text-[#808080] text-xs">{course.provider}{course.months ? ` • ${course.months} months` : ''}</p>
                                  <p className="text-[#6a9955] text-sm mt-1">// {course.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingCourse(course)}
                                    className="text-[#007acc] hover:text-[#007acc] hover:bg-[#007acc]/10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(course.id)}
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
                  {orderedCourses.length === 0 && (
                    <div className="text-center py-12 text-[#808080] font-mono">
                      // No courses yet. Click "New Course" to add one.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
    </div>
  );
}