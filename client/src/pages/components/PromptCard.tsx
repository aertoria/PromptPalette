import { useDrag } from 'react-dnd';
import { Prompt } from '@shared/schema';
import { Edit, GripVertical } from 'lucide-react';
import { ItemTypes } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
}

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ItemTypes.PROMPT,
    item: { id: prompt.id, type: ItemTypes.PROMPT, prompt },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag} // Changed from dragPreview to drag to make the entire card draggable
      className={`bg-white border border-gray-200 rounded-lg mb-3 hover:shadow-md transition ${
        isDragging ? 'opacity-60' : ''
      }`}
      style={{ cursor: 'grab' }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{prompt.title}</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-primary p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag when clicking edit button
                onEdit();
              }}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <div
              className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-grab"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{prompt.content}</p>
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
