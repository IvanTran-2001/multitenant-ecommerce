"use client";

import { useState, useRef, useEffect } from 'react'
import { CategoryDropdown } from './category-dropdown';
import { CustomCategory } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListFilterIcon } from 'lucide-react';
import { CategoriesSidebar } from './categories-sidebar';
interface Props {
    data: CustomCategory[];
};

export const Categories = ({ data }:Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const MeasureRef = useRef<HTMLDivElement>(null);
    const viewAllRef = useRef<HTMLDivElement>(null);

    const [visibleCount, setVisibleCount] = useState(data.length);
    const [isAnyHovered, setIsAnyHovered] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    const activeCategory = "all";

    const activeCatgegoryIndex = data.findIndex((cat) => cat.slug === activeCategory);
    const isActiveCategoryHidden = activeCatgegoryIndex >= visibleCount && activeCatgegoryIndex !== -1;

    useEffect(() => {
        const calculateVisible = () => {
            if (!containerRef.current || !MeasureRef.current || !viewAllRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const viewAllWidth = viewAllRef.current.offsetWidth;
            const availableWidth = containerWidth - viewAllWidth;

            const items = Array.from(MeasureRef.current.children);
            let totalWidth = 0;
            let visible = 0;

            for (const item of items) {
                const width = item.getBoundingClientRect().width;

                if (totalWidth + width > availableWidth) break;

                totalWidth += width;
                visible++;
             }

            setVisibleCount(visible);
        };

        const resizeObserver = new ResizeObserver(calculateVisible);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();

    }, [data.length]);

  return (
    <div className='relative w-full'>

        <CategoriesSidebar open={isSideBarOpen} onOpenChange={setIsSideBarOpen} data={data}/>
        <div ref={MeasureRef} className='absolute opacity-0 pointer-events-none flex'
        style={{ position: "fixed", top: -9999, left: -9999 }}>
            {data.map((category: CustomCategory) => (
            <div key={category.id}>
                <CategoryDropdown
                category={category}
                isActive={activeCategory === category.slug}
                isNavigationHovered={false} 
                />
            </div>
        ))}
        </div>

        {/* Visible Items */}
        <div ref={containerRef}
        className="flex flex-nowrap items-center"
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}>
        {data.slice(0, visibleCount).map((category: CustomCategory) => (
            <div key={category.id}>
                <CategoryDropdown
                category={category}
                isActive={activeCategory === category.slug}
                isNavigationHovered={isAnyHovered} 
                />
            </div>
        ))}

        <div ref={viewAllRef} className="shrink-0">
            <Button className= {cn("h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black", 
                            isActiveCategoryHidden && !isAnyHovered && "bg-white border-primary")}
                            onClick={() => setIsSideBarOpen(true)}
            >View All
            <ListFilterIcon className='ml-2'/>
            </Button>
        </div>
        </div>

    </div>
  )
}
