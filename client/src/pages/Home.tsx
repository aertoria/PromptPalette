import { useState } from 'react';
import SideBar from './components/SideBar';
import Header from './components/Header';
import PromptLibrary from './components/PromptLibrary';
import PromptComposer from './components/PromptComposer';
import PromptEditorModal from './components/PromptEditorModal';
import { DndContextProvider } from '@/lib/dndContext';
import { useQuery } from '@tanstack/react-query';
import { Prompt, Category } from '@shared/schema';

export default function Home() {
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(3); // Default to Customer Support
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: prompts } = useQuery<Prompt[]>({
    queryKey: ['/api/prompts', currentCategoryId],
    queryFn: () => 
      fetch(`/api/prompts${currentCategoryId ? `?categoryId=${currentCategoryId}` : ''}`)
        .then(res => res.json()),
  });

  const currentCategory = categories?.find(c => c.id === currentCategoryId);
  
  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingPrompt(null);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <DndContextProvider>
      <div className="flex h-screen overflow-hidden">
        <SideBar 
          isOpen={isMobileSidebarOpen}
          onToggle={toggleMobileSidebar}
          onCategorySelect={setCurrentCategoryId}
          currentCategoryId={currentCategoryId}
          onCreatePrompt={handleCreatePrompt}
        />
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button 
            className="bg-primary text-white rounded-full p-3 shadow-lg"
            onClick={toggleMobileSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
        
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <Header 
            categoryName={currentCategory?.name || 'All Prompts'} 
          />
          
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            <PromptLibrary 
              prompts={prompts || []} 
              onEditPrompt={handleEditPrompt}
              onCreatePrompt={handleCreatePrompt}
            />
            <PromptComposer />
          </div>
        </main>
      </div>
      
      {isEditorOpen && (
        <PromptEditorModal
          prompt={editingPrompt}
          categoryId={currentCategoryId}
          onClose={handleCloseEditor}
        />
      )}
    </DndContextProvider>
  );
}
