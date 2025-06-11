'use client'
import React from 'react'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  userRole: 'librarian' | 'reader'
  isOpen: boolean
  onClose: () => void
  activeItem: string
  onItemClick: (item: string) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({
  userRole,
  isOpen,
  onClose,
  activeItem,
  onItemClick
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Sidebar Content */}
        <div className="h-full">
          <Sidebar 
            userRole={userRole}
            activeItem={activeItem}
            onItemClick={onItemClick}
          />
        </div>
      </div>
    </>
  )
}