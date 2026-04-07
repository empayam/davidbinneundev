import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function DraggableList({ items, onReorder, renderItem, droppableId = 'list' }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {items.map((item, index) => (
              <Draggable key={item.id || index} draggableId={String(item.id || index)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'opacity-90' : ''}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        {...provided.dragHandleProps}
                        className="mt-4 p-1 cursor-grab active:cursor-grabbing text-[#808080] hover:text-[#cccccc]"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        {renderItem(item, index)}
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
  );
}