import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DraggablePromptItem } from './types';

interface DndContextProps {
  combinedPrompts: DraggablePromptItem[];
  addPrompt: (prompt: DraggablePromptItem) => void;
  removePrompt: (id: number) => void;
  movePrompt: (dragIndex: number, hoverIndex: number) => void;
  clearPrompts: () => void;
  getCombinedContent: () => string;
  saveCombination: (name: string) => Promise<void>;
}

const DndContext = createContext<DndContextProps | undefined>(undefined);

export function useDndContext() {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error('useDndContext must be used within a DndProvider');
  }
  return context;
}

interface DndProviderProps {
  children: ReactNode;
}

export function DndContextProvider({ children }: DndProviderProps) {
  const [combinedPrompts, setCombinedPrompts] = useState<DraggablePromptItem[]>([]);

  const addPrompt = (prompt: DraggablePromptItem) => {
    setCombinedPrompts((prev) => [...prev, { ...prompt, index: prev.length }]);
  };

  const removePrompt = (id: number) => {
    setCombinedPrompts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // Update indices
      return filtered.map((prompt, idx) => ({ ...prompt, index: idx }));
    });
  };

  const movePrompt = (dragIndex: number, hoverIndex: number) => {
    setCombinedPrompts((prev) => {
      const newPrompts = [...prev];
      const draggedItem = newPrompts[dragIndex];
      
      // Remove the dragged item
      newPrompts.splice(dragIndex, 1);
      
      // Insert it at the new position
      newPrompts.splice(hoverIndex, 0, draggedItem);
      
      // Update indices
      return newPrompts.map((prompt, idx) => ({ ...prompt, index: idx }));
    });
  };

  const clearPrompts = () => {
    setCombinedPrompts([]);
  };

  const getCombinedContent = () => {
    return combinedPrompts.map((prompt) => prompt.content).join(' ');
  };

  const saveCombination = async (name: string) => {
    try {
      const promptIds = combinedPrompts.map(prompt => prompt.id);
      const order = combinedPrompts.map((_, idx) => idx);
      
      await fetch('/api/combinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          promptIds,
          order,
        }),
      });
    } catch (error) {
      console.error('Failed to save combination:', error);
      throw error;
    }
  };

  return (
    <DndContext.Provider 
      value={{ 
        combinedPrompts, 
        addPrompt, 
        removePrompt, 
        movePrompt, 
        clearPrompts, 
        getCombinedContent,
        saveCombination
      }}
    >
      {children}
    </DndContext.Provider>
  );
}
