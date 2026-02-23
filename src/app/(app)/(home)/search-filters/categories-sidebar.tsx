import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomCategory } from '../types';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: CustomCategory[]; //TODO: Remove this later
}

export const CategoriesSidebar  = ( { open, onOpenChange, data }: Props ) => {

  const router = useRouter();

  const [parentCategories, setParentCategories] = useState<CustomCategory[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CustomCategory | null>(null);

  // If we have parent categories, show those, otherwise show root categories
  const currentCategories = parentCategories ?? data ?? [];

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  }

  const handleCategoryClick = (Category: CustomCategory) => {
    if (Category.subcategories && Category.subcategories.length > 0) {
      setParentCategories(Category.subcategories as CustomCategory[]);
      setSelectedCategory(Category);
    } else {
      // This is a leaf category (no subcategories)
      if (parentCategories && selectedCategory) {
        router.push(`/${selectedCategory.slug}/${Category.slug}`);
      } else {
        // this is a main category
        if (Category.slug === "all") {
          router.push(`/`);
        } else {
          router.push(`/${Category.slug}`);
        }
      }

      handleOpenChange(false);

    }

  }

  const handleBackClick = () => {
    if (parentCategories) {
      setParentCategories(null);
      setSelectedCategory(null);
    }
  }

  const backgroundColor = selectedCategory?.color || "white";
    
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
      side="left" 
      className='p-0 transition-none' 
      style={{ backgroundColor
        
      }}>
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            Categories
          </SheetTitle>
            
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {parentCategories && (
            <button
            onClick={() => handleBackClick()}
            className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium cursor-pointer">

              <ChevronLeftIcon className="size-4 mr-2"/>
              Back
            </button>
          )}
          {currentCategories.map((category) => (
            <button 
            key={category.slug}
            onClick={() => handleCategoryClick(category)}
            className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center text-base font-medium cursor-pointer">
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className='size-4'/>
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
