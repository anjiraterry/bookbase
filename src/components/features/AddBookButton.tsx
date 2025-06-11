'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddBookButtonProps {
  onClick: () => void
}

export const AddBookButton: React.FC<AddBookButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-30 lg:hidden"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}