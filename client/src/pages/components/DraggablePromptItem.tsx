import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DraggablePromptItem as DraggablePromptItemType } from '@/lib/types';
import { ItemTypes } from '@/lib/types';
import { Edit, X, GripVertical, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDndContext } from '@/lib/dndContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DraggablePromptItemProps {
  prompt: DraggablePromptItemType;
  index: number;
  isLast: boolean;
  onEdit?: () => void;
}

export default function DraggablePromptItem({ 
  prompt, 
  index, 
  isLast, 
  onEdit 
}: DraggablePromptItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { movePrompt, removePrompt } = useDndContext();
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROMPT,
    item: { id: prompt.id, index, type: ItemTypes.PROMPT, prompt },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.PROMPT,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      
      // Safety check: make sure we have valid indices
      const dragIndex = typeof item.index === 'number' ? item.index : -1;
      const hoverIndex = typeof index === 'number' ? index : -1;
      
      // Skip if indices are invalid or the same
      if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      try {
        // Time to actually perform the action
        movePrompt(dragIndex, hoverIndex);
        
        // Update the index for the dragged item
        item.index = hoverIndex;
      } catch (error) {
        console.error("Error during drag operation:", error);
      }
    },
  });
  
  // Combine drag and drop refs
  drag(drop(ref));
  
  const handleMoveUp = () => {
    if (index > 0) {
      movePrompt(index, index - 1);
    }
  };
  
  const handleMoveDown = () => {
    if (!isLast) {
      movePrompt(index, index + 1);
    }
  };
  
  const showFullContent = () => {
    setIsContentDialogOpen(true);
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag when clicking expand button
    setIsExpanded(!isExpanded);
  };
  
  const opacity = isDragging ? 0.4 : 1;
  
  return (
    <>
      <div ref={ref} className="relative group" style={{ opacity }}>
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="p-1 text-gray-400 hover:text-gray-600 mb-1 bg-white rounded-full shadow-sm h-auto w-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveUp();
            }}
            disabled={index === 0}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm h-auto w-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveDown();
            }}
            disabled={isLast}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Made entire card draggable */}
        <div 
          ref={drag} 
          className="bg-white border border-gray-200 rounded-lg mb-4 shadow-sm cursor-grab"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center">
                <span>{prompt.title}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Step {index + 1}
                </span>
              </h3>
              <div className="flex items-center space-x-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-primary p-1 opacity-0 group-hover:opacity-100 transition h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit();
                    }}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePrompt(prompt.id);
                  }}
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 relative">
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-[1000px]" : "max-h-[100px] overflow-hidden"
              )}>
                <p>{prompt.content || 'No content available'}</p>
              </div>
              {prompt.content && prompt.content.length > 100 && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={toggleExpand}
                  >
                    {isExpanded ? (
                      <span className="flex items-center">
                        Show less <ChevronUp className="h-3 w-3 ml-1" />
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Show more <ChevronDown className="h-3 w-3 ml-1" />
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {!isLast && (
            <div className="h-8 flex justify-center">
              <svg width="24" height="32" className="overflow-visible">
                <path d="M12,0 L12,32" className="stroke-secondary stroke-2 stroke-dashed" 
                  strokeDasharray="5,5" />
                <circle cx="12" cy="28" r="4" fill="hsl(var(--secondary))" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{prompt.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words font-sans p-4 bg-gray-50 rounded-md">
              {prompt.content || 'No content available'}
            </pre>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                if (prompt.content) {
                  navigator.clipboard.writeText(prompt.content);
                }
                setIsContentDialogOpen(false);
              }}
            >
              Copy & Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsContentDialogOpen(false)}
              className="ml-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}