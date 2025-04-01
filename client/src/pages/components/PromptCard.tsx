import { useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Prompt } from '@shared/schema';
import { DraggablePromptItem, ItemTypes } from '@/lib/types';
import { GripVertical } from 'lucide-react';
import { useDndContext } from '@/lib/dndContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: () => void;
}

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { addPrompt, combinedPrompts } = useDndContext();
  const [isDoubleClicking, setIsDoubleClicking] = useState(false);
  const { toast } = useToast();
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROMPT,
    item: { 
      id: prompt.id, 
      type: ItemTypes.PROMPT, 
      prompt: {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        categoryId: prompt.categoryId,
        index: 0,
        tags: prompt.tags || [],
        createdAt: prompt.createdAt || new Date()
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDoubleClick = () => {
    // Check if prompt is already in the composer
    const isDuplicate = combinedPrompts.some(p => p.id === prompt.id);
    
    if (isDuplicate) {
      toast({
        title: "Duplicate Prompt",
        description: "This prompt is already in the composer.",
        variant: "destructive",
      });
      return;
    }

    setIsDoubleClicking(true);
    addPrompt({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId,
      index: 0,
      tags: prompt.tags || [],
      createdAt: prompt.createdAt || new Date()
    });
    
    // Reset the double-clicking state after animation
    setTimeout(() => {
      setIsDoubleClicking(false);
    }, 500);
  };

  drag(ref);
  
  return (
    <div 
      ref={ref}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-grab hover:shadow-md transition-all duration-200",
        isDragging && "opacity-50",
        isDoubleClicking && "scale-95 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{prompt.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{prompt.content}</p>
        </div>
        <div className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
