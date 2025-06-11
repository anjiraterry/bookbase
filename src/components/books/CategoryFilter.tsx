'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'fiction', label: 'Fiction', icon: '📖' },
    { id: 'non_fiction', label: 'Non-Fiction', icon: '📘' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'history', label: 'History', icon: '🏛️' },
    { id: 'biography', label: 'Biography', icon: '👤' },
    { id: 'mystery', label: 'Mystery', icon: '🔍' },
    { id: 'romance', label: 'Romance', icon: '💕' },
    { id: 'fantasy', label: 'Fantasy', icon: '🐉' },
    { id: 'thriller', label: 'Thriller', icon: '😱' },
    { id: 'self_help', label: 'Self Help', icon: '💪' },
    { id: 'children', label: 'Children', icon: '🧸' },
    { id: 'other', label: 'Other', icon: '📋' }
  ]

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-2 p-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}