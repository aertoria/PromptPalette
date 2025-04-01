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
    try {
      if (!prompt || typeof prompt !== 'object') {
        console.error("Invalid prompt object:", prompt);
        return;
      }

      setCombinedPrompts((prev) => {
        // Create a new prompt object with required fields and a fresh index
        const newPrompt = {
          ...prompt,
          id: prompt.id || Date.now(), // Ensure we have a valid ID
          title: prompt.title || "Untitled Prompt",
          content: prompt.content || "",
          index: prev.length
        };
        return [...prev, newPrompt];
      });
    } catch (error) {
      console.error("Error adding prompt:", error);
    }
  };

  const removePrompt = (id: number) => {
    try {
      if (typeof id !== 'number') {
        console.error("Invalid ID for removal:", id);
        return;
      }

      setCombinedPrompts((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        // Update indices
        return filtered.map((prompt, idx) => ({ ...prompt, index: idx }));
      });
    } catch (error) {
      console.error("Error removing prompt:", error);
    }
  };

  const movePrompt = (dragIndex: number, hoverIndex: number) => {
    try {
      // Safety checks for valid indices
      if (!Number.isInteger(dragIndex) || !Number.isInteger(hoverIndex) || 
          dragIndex < 0 || hoverIndex < 0) {
        console.error("Invalid indices for moving:", dragIndex, hoverIndex);
        return;
      }

      setCombinedPrompts((prev) => {
        // More safety checks with the actual array
        if (dragIndex >= prev.length || hoverIndex >= prev.length) {
          console.error("Index out of bounds:", dragIndex, hoverIndex, prev.length);
          return prev;
        }

        // Create a new array to avoid mutating state directly
        const newPrompts = [...prev];
        
        // Get the dragged item
        const draggedItem = newPrompts[dragIndex];
        if (!draggedItem) {
          console.error("No item found at dragIndex:", dragIndex);
          return prev;
        }
        
        // Remove the dragged item from its current position
        newPrompts.splice(dragIndex, 1);
        
        // Insert the dragged item at the new position
        newPrompts.splice(hoverIndex, 0, draggedItem);
        
        // Update indices for all items
        return newPrompts.map((prompt, idx) => ({
          ...prompt,
          index: idx
        }));
      });
    } catch (error) {
      console.error("Error moving prompt:", error);
    }
  };

  const clearPrompts = () => {
    setCombinedPrompts([]);
  };

  const getCombinedContent = () => {
    try {
      if (!combinedPrompts || !Array.isArray(combinedPrompts) || combinedPrompts.length === 0) {
        return '';
      }
      
      return combinedPrompts
        .map((prompt) => {
          // Handle all possible undefined/null cases
          if (!prompt) return '';
          if (typeof prompt.content !== 'string') return '';
          return prompt.content.trim();
        })
        .filter(content => content !== '') // Remove any empty content
        .join('\n\n');
    } catch (error) {
      console.error("Error getting combined content:", error);
      return '';
    }
  };

  const saveCombination = async (name: string) => {
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Invalid combination name');
      }
      
      if (!combinedPrompts || !Array.isArray(combinedPrompts) || combinedPrompts.length === 0) {
        throw new Error('No prompts to save');
      }
      
      // Safely map IDs and ensure they're valid
      const promptIds = combinedPrompts
        .filter(prompt => prompt && typeof prompt.id === 'number')
        .map(prompt => prompt.id);
        
      if (promptIds.length === 0) {
        throw new Error('No valid prompt IDs found');
      }
      
      const order = promptIds.map((_, idx) => idx);
      
      const response = await fetch('/api/combinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          promptIds,
          order,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }
      
      return await response.json();
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
