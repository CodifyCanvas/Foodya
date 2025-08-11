'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { MenuCategories } from '@/lib/definations';

interface TagProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tag = React.memo(({ label, isActive, onClick }: TagProps) => {
  return (
    <button
      onClick={onClick}
      className={`border cursor-pointer px-5 py-1.5 rounded-full text-sm font-rubik-400 transition-colors
        ${isActive
          ? 'bg-orange-100 text-orange-600 border-orange-400'
          : 'bg-white text-neutral-800 border-neutral-300'}
      `}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
});
Tag.displayName = 'Tag';

interface OrderCategoryTagsProps {
  categories: MenuCategories[];
}

const OrderCategoryTags = ({ categories }: OrderCategoryTagsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category');

  const handleTagClick = useCallback(
    (name: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!name || name.toLowerCase() === 'all') {
        // Remove category from URL
        params.delete('category');
      } else {
        // Set new category
        params.set('category', slugify(name));
      }

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? '?' + queryString : ''}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div
      className="relative max-w-full overflow-x-auto px-5 scroll-smooth scrollbar-hidden"
      style={{ maxWidth: 'calc(100vw - 15vw)' }}
    >
      <div className="flex flex-row gap-2 w-fit min-w-max">
        {/* ALL Tag */}
        <div className="flex-none">
          <Tag
            label="All"
            isActive={!currentCategory}
            onClick={() => handleTagClick(null)}
          />
        </div>

        {/* Other categories */}
        {categories
          .filter(item => item?.name) // ✅ filter out undefined or null names
          .map((item, index) => {
            const slug = slugify(item.name);
            const isActive = currentCategory === slug;

            return (
              <div key={item.name + index} className="flex-none">
                <Tag
                  label={item.name}
                  isActive={isActive}
                  onClick={() => handleTagClick(item.name)}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrderCategoryTags;
