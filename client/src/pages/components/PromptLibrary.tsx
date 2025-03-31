import { Prompt } from '@shared/schema';
import PromptCard from './PromptCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptLibraryProps {
  prompts: Prompt[];
  onEditPrompt: (prompt: Prompt) => void;
  onCreatePrompt: () => void;
}

export default function PromptLibrary({ prompts, onEditPrompt, onCreatePrompt }: PromptLibraryProps) {
  return (
    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Available Prompts</h2>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 text-sm flex items-center"
          onClick={onCreatePrompt}
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
      
      {prompts.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-3">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="font-medium text-gray-700 mb-1">No prompts available</h3>
          <p className="text-sm text-gray-500">Create your first prompt to get started</p>
          <Button 
            className="mt-4"
            onClick={onCreatePrompt}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      ) : (
        <>
          {prompts.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              onEdit={() => onEditPrompt(prompt)} 
            />
          ))}
        </>
      )}
    </div>
  );
}
