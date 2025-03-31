import { useState } from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface HeaderProps {
  categoryName: string;
}

export default function Header({ categoryName }: HeaderProps) {
  const [viewType, setViewType] = useState<string>("list");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">{categoryName} Prompts</h1>
          <p className="text-sm text-gray-500">Manage and combine your {categoryName.toLowerCase()} prompts</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search prompts..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value)}>
            <ToggleGroupItem value="grid" aria-label="Grid View" title="Grid View">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View" title="List View">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </header>
  );
}
