import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SkillEditor({ category, onUpdate, onDelete }) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      onUpdate({
        ...category,
        skills: [...(category.skills || []), newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    onUpdate({
      ...category,
      skills: category.skills.filter((_, i) => i !== index)
    });
  };

  const updateCategoryField = (field, value) => {
    onUpdate({ ...category, [field]: value });
  };

  const handleSkillDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(category.skills || []);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onUpdate({ ...category, skills: reordered });
  };

  return (
    <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 hover:border-[#007acc] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Input
            value={category.title || ''}
            onChange={(e) => updateCategoryField('title', e.target.value)}
            placeholder="Category title"
            className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
          />
          <div className="flex gap-2">
            <Input
              value={category.color || ''}
              onChange={(e) => updateCategoryField('color', e.target.value)}
              placeholder="Color (e.g., #569cd6)"
              className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono flex-1"
            />
            <div 
              className="w-10 h-10 rounded border border-[#3c3c3c]"
              style={{ backgroundColor: category.color || '#569cd6' }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-[#f44747] hover:text-[#f44747] hover:bg-[#f44747]/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="font-mono text-sm mb-2">
        <span className="text-[#569cd6]">const</span>{' '}
        <span className="text-[#4fc1ff]">skills</span>{' '}
        <span className="text-[#cccccc]">= [</span>
      </div>

      <DragDropContext onDragEnd={handleSkillDragEnd}>
        <Droppable droppableId={`skills-${category.title}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="pl-4 space-y-1 mb-2">
              {category.skills?.map((skill, index) => (
                <Draggable key={`${skill}-${index}`} draggableId={`${skill}-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 group ${snapshot.isDragging ? 'bg-[#1e1e1e] rounded px-1' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3 h-3 text-[#808080] group-hover:text-[#cccccc]" />
                      </div>
                      <span className="text-[#ce9178]">"{skill}"</span>
                      <span className="text-[#cccccc]">,</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="opacity-0 group-hover:opacity-100 text-[#f44747] hover:text-[#f44747]/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-2 pl-4">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add new skill..."
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono text-sm flex-1"
        />
        <Button
          onClick={addSkill}
          size="sm"
          className="bg-[#007acc] hover:bg-[#005a9e]"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="font-mono text-sm mt-2">
        <span className="text-[#cccccc]">]</span>
      </div>
    </div>
  );
}