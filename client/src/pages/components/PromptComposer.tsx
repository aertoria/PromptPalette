import { useDrop } from 'react-dnd';
import { ItemTypes, DragItem } from '@/lib/types';
import { useDndContext } from '@/lib/dndContext';
import DraggablePromptItem from './DraggablePromptItem';
import { Plus, RotateCcw, Save, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export default function PromptComposer() {
  const { 
    combinedPrompts, 
    addPrompt, 
    clearPrompts, 
    getCombinedContent,
    saveCombination
  } = useDndContext();
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PROMPT,
    drop: (item: DragItem) => {
      // Only add if it's coming from the library, not from rearranging
      if (item.index === undefined) {
        addPrompt(item.prompt);
        
        toast({
          title: "Prompt added",
          description: "The prompt has been added to your composition."
        });
      }
      return { name: 'PromptComposer' };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  const combinedContent = getCombinedContent();
  
  const handleCopyAll = () => {
    navigator.clipboard.writeText(combinedContent);
    toast({
      title: "Copied to clipboard",
      description: "The combined prompt has been copied to your clipboard."
    });
  };
  
  const handleReset = () => {
    if (combinedPrompts.length > 0) {
      if (confirm("Are you sure you want to reset? This will clear all prompts.")) {
        clearPrompts();
        toast({
          title: "Reset successful",
          description: "All prompts have been cleared from the composer."
        });
      }
    }
  };
  
  const openSaveDialog = () => setIsSaveDialogOpen(true);
  const closeSaveDialog = () => setIsSaveDialogOpen(false);
  
  const saveSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters")
  });
  
  const form = useForm<z.infer<typeof saveSchema>>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      name: ""
    }
  });
  
  const onSubmit = async (data: z.infer<typeof saveSchema>) => {
    try {
      await saveCombination(data.name);
      closeSaveDialog();
      form.reset();
      toast({
        title: "Saved successfully",
        description: `The prompt combination "${data.name}" has been saved.`
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "An error occurred while saving the prompt combination.",
        variant: "destructive"
      });
    }
  };
  
  const handleExport = () => {
    const dataStr = `data:text/plain;charset=utf-8,${encodeURIComponent(combinedContent)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "prompt_export.txt");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Exported successfully",
      description: "The combined prompt has been exported as a text file."
    });
  };
  
  const handleSendToGemini = () => {
    // Copy the combined content to clipboard first
    navigator.clipboard.writeText(combinedContent);
    
    // The URL for Gemini with the prompt in the search parameter
    const geminiUrl = `https://gemini.google.com/app?text=${encodeURIComponent(combinedContent)}`;
    
    // Open Gemini in a new tab with the combined prompt
    window.open(geminiUrl, '_blank');
    
    toast({
      title: "Sent to Gemini",
      description: "The combined prompt has been copied to clipboard and sent to Gemini in a new tab."
    });
  };
  
  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-4">
        <h2 className="font-medium mb-2">Prompt Composer</h2>
        <p className="text-sm text-gray-600">Drag prompts from the library and arrange them in the desired order</p>
      </div>
      
      {/* Drop Area for Prompts */}
      <div 
        ref={drop}
        className={`bg-white border-2 ${isOver && canDrop ? 'border-primary/70 bg-primary/5' : 'border-dashed border-gray-300'} 
        rounded-lg p-6 min-h-[300px] mb-6 transition-colors duration-200`}
      >
        {combinedPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-3">
              <span className="text-4xl">🔄</span>
            </div>
            <h3 className="font-medium text-gray-700 mb-1">Drop prompts here</h3>
            <p className="text-sm text-gray-500">Drag prompts from the library to start combining them</p>
          </div>
        ) : (
          <div>
            {combinedPrompts.map((prompt, index) => (
              <DraggablePromptItem 
                key={`${prompt.id}-${index}`}
                prompt={prompt}
                index={index}
                isLast={index === combinedPrompts.length - 1}
              />
            ))}
            
            {/* Drop Area for New Items */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center items-center min-h-[80px] text-gray-500">
              <Plus className="mr-2 h-4 w-4" />
              <span>Drop prompt here</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Combined Output Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <span>Combined Output</span>
            {combinedContent && (
              <span className="text-xs text-gray-500 ml-2">
                ({combinedContent.length} characters)
              </span>
            )}
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs bg-primary text-white hover:bg-primary/90"
            onClick={handleCopyAll}
            disabled={!combinedContent}
          >
            Copy All
          </Button>
        </h3>
        <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[300px] overflow-y-auto">
          {combinedContent ? (
            <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words font-sans">{combinedContent}</pre>
          ) : (
            <p className="text-sm text-gray-400 italic">No prompts added yet. Drag prompts from the library to start.</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button
            variant="outline"
            className="text-gray-700"
            onClick={handleReset}
            disabled={combinedPrompts.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="text-gray-700"
            onClick={openSaveDialog}
            disabled={combinedPrompts.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            className="text-gray-700"
            onClick={handleExport}
            disabled={combinedPrompts.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSendToGemini}
            disabled={combinedPrompts.length === 0}
          >
            <Zap className="mr-2 h-4 w-4" />
            Send to Gemini
          </Button>
        </div>
      </div>
      
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Prompt Combination</DialogTitle>
            <DialogDescription>
              Give your prompt combination a name to save it for future use.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combination Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a name for this combination" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeSaveDialog}>
                  Cancel
                </Button>
                <Button type="submit">Save Combination</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
