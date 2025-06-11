'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Home,
  BookOpen,
  Heart,
  Download,
  Headphones,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Users,
  BarChart3
} from 'lucide-react'

interface SidebarProps {
  userRole: 'librarian' | 'reader'
  activeItem?: string
  onItemClick?: (item: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeItem = 'discover',
  onItemClick
}) => {
  const readerMenuItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'category', label: 'Category', icon: BookOpen },
    { id: 'my-library', label: 'My Library', icon: BookOpen },
    { id: 'download', label: 'Download', icon: Download },
    { id: 'audio-books', label: 'Audio Books', icon: Headphones },
    { id: 'favourite', label: 'Favourite', icon: Heart },
  ]

  const librarianMenuItems = [
    { id: 'discover', label: 'Dashboard', icon: Home },
    { id: 'books', label: 'All Books', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'checkouts', label: 'Checkouts', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ]

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ]

  const menuItems = userRole === 'librarian' ? librarianMenuItems : readerMenuItems

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <ScrollArea className="flex-1 px-4 py-6">
        {/* Main Navigation */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>

        {/* Add Book Button for Librarians */}
        {userRole === 'librarian' && (
          <>
            <Separator className="my-6" />
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              onClick={() => handleItemClick('add-book')}
            >
              <Plus className="mr-3 h-4 w-4" />
              Add New Book
            </Button>
          </>
        )}

        <Separator className="my-6" />

        {/* Bottom Navigation */}
        <div className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  item.id === 'logout' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}