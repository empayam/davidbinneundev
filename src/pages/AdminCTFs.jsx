import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Loader2, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminHeader from '../components/admin/AdminHeader';
import ImageUploader from '../components/admin/ImageUploader';

const difficulties = ['Easy', 'Medium', 'Hard', 'Insane'];

export default function AdminCTFs() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingCTF, setEditingCTF] = useState(null);
  const [newTech, setNewTech] = useState('');

  const [orderedCTFs, setOrderedCTFs] = useState([]);

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

  const { data: ctfs = [], isLoading } = useQuery({
    queryKey: ['ctfs'],
    queryFn: () => base44.entities.CTF.list(),
  });

  useEffect(() => {
    setOrderedCTFs([...ctfs].sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [ctfs]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CTF.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ctfs'] });
      setEditingCTF(null);
      toast.success('CTF created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CTF.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ctfs'] });
      setEditingCTF(null);
      toast.success('CTF updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CTF.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ctfs'] });
      toast.success('CTF deleted!');
    },
  });

  const handleSave = () => {
    if (editingCTF.id) {
      updateMutation.mutate({ id: editingCTF.id, data: editingCTF });
    } else {
      createMutation.mutate(editingCTF);
    }
  };

  const addTech = () => {
    if (newTech.trim()) {
      setEditingCTF({
        ...editingCTF,
        technologies: [...(editingCTF.technologies || []), newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTech = (index) => {
    setEditingCTF({
      ...editingCTF,
      technologies: editingCTF.technologies.filter((_, i) => i !== index)
    });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(orderedCTFs);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setOrderedCTFs(reordered);
    
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) {
        await base44.entities.CTF.update(reordered[i].id, { order: i });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['ctfs'] });
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
      <AdminHeader currentPage="AdminCTFs" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">CTF Challenges</span>
          </h1>
          <Button
            onClick={() => setEditingCTF({ title: '', platform: '', topic: '', difficulty: 'Medium', technologies: [] })}
            className="bg-[#007acc] hover:bg-[#005a9e]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New CTF
          </Button>
        </div>

        {/* Edit Modal */}
        {editingCTF && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#569cd6] font-mono">
                  {editingCTF.id ? 'Edit CTF' : 'New CTF'}
                </h2>
                <button onClick={() => setEditingCTF(null)}>
                  <X className="w-5 h-5 text-[#808080] hover:text-[#cccccc]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">title:</label>
                    <Input
                      value={editingCTF.title || ''}
                      onChange={(e) => setEditingCTF({ ...editingCTF, title: e.target.value })}
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">platform:</label>
                    <Input
                      value={editingCTF.platform || ''}
                      onChange={(e) => setEditingCTF({ ...editingCTF, platform: e.target.value })}
                      placeholder="HackTheBox, TryHackMe..."
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">description:</label>
                  <Textarea
                    value={editingCTF.description || ''}
                    onChange={(e) => setEditingCTF({ ...editingCTF, description: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#6a9955] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">topic:</label>
                    <Input
                      value={editingCTF.topic || ''}
                      onChange={(e) => setEditingCTF({ ...editingCTF, topic: e.target.value })}
                      placeholder="Web, Forensics, Crypto..."
                      className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#9cdcfe] font-mono text-sm block mb-2">difficulty:</label>
                    <Select value={editingCTF.difficulty} onValueChange={(v) => setEditingCTF({ ...editingCTF, difficulty: v })}>
                      <SelectTrigger className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252526] border-[#3c3c3c]">
                        {difficulties.map(d => (
                          <SelectItem key={d} value={d} className="text-[#cccccc]">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ImageUploader
                  label="image"
                  value={editingCTF.image || ''}
                  onChange={(url) => setEditingCTF({ ...editingCTF, image: url })}
                />

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">writeup_link:</label>
                  <Input
                    value={editingCTF.writeup_link || ''}
                    onChange={(e) => setEditingCTF({ ...editingCTF, writeup_link: e.target.value })}
                    className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#9cdcfe] font-mono text-sm block mb-2">technologies: [</label>
                  <div className="pl-4 space-y-1 mb-2">
                    {editingCTF.technologies?.map((tech, index) => (
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
                  <Button variant="outline" onClick={() => setEditingCTF(null)} className="border-[#3c3c3c] text-[#cccccc]">
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

        {/* CTFs List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="ctfs-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                  {orderedCTFs.map((ctf, index) => (
                    <Draggable key={ctf.id} draggableId={ctf.id} index={index}>
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
                                  <h3 className="text-[#ce9178] font-mono">
                                    <span className="text-[#569cd6]">const</span> {ctf.title?.replace(/\s/g, '_')}
                                  </h3>
                                  <p className="text-[#808080] text-xs">{ctf.platform}{ctf.topic ? ` • ${ctf.topic}` : ''}{ctf.difficulty ? ` • ${ctf.difficulty}` : ''}</p>
                                  <p className="text-[#6a9955] text-sm mt-1">// {ctf.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingCTF(ctf)}
                                    className="text-[#007acc] hover:text-[#007acc] hover:bg-[#007acc]/10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(ctf.id)}
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
                  {orderedCTFs.length === 0 && (
                    <div className="text-center py-12 text-[#808080] font-mono">
                      // No CTFs yet. Click "New CTF" to add one.
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