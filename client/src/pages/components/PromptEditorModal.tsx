import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Prompt, promptValidationSchema } from '@shared/schema';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

interface PromptEditorModalProps {
  prompt: Prompt | null;
  categoryId: number | null;
  onClose: () => void;
}

export default function PromptEditorModal({ prompt, categoryId, onClose }: PromptEditorModalProps) {
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();
  
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  const form = useForm<z.infer<typeof promptValidationSchema>>({
    resolver: zodResolver(promptValidationSchema),
    defaultValues: {
      title: prompt?.title || '',
      content: prompt?.content || '',
      categoryId: prompt?.categoryId || categoryId || undefined,
      tags: prompt?.tags || [],
    },
  });
  
  const onSubmit = async (data: z.infer<typeof promptValidationSchema>) => {
    try {
      if (prompt) {
        // Update existing prompt
        await apiRequest('PATCH', `/api/prompts/${prompt.id}`, data);
        toast({
          title: 'Prompt updated',
          description: 'Your prompt has been updated successfully.',
        });
      } else {
        // Create new prompt
        await apiRequest('POST', '/api/prompts', data);
        toast({
          title: 'Prompt created',
          description: 'Your new prompt has been created successfully.',
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['/api/prompts', categoryId] });
      }
      
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save prompt',
        description: 'An error occurred while saving the prompt.',
      });
    }
  };
  
  const addTag = () => {
    if (newTag && newTag.trim() !== '') {
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
        setNewTag('');
      }
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      {...field}
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">Select a category</option>
                      {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your prompt content here..." 
                      className="min-h-[180px] resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag"
                  className="mr-2"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.watch('tags')?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {(!form.watch('tags') || form.watch('tags').length === 0) && (
                  <p className="text-gray-500 text-sm italic">No tags added yet</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {prompt ? 'Save Changes' : 'Create Prompt'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
