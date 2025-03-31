import { Category, Prompt, Template } from "@shared/schema";

export interface DraggablePromptItem extends Prompt {
  index?: number;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface DragItem {
  type: string;
  id: number;
  index: number;
  prompt: DraggablePromptItem;
}

export enum ItemTypes {
  PROMPT = 'prompt',
}
