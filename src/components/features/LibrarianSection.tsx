'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookGrid } from '@/components/books/BookGrid'
import { CheckoutManagement } from './CheckoutManagement'
import { useBooks } from '@/hooks/useBooks'
import { useCheckouts } from '@/hooks/useCheckouts'
import { useUsers, User } from '@/hooks/useUsers' // ✅ Import User type
import { Plus, BookOpen, Users, Clock, TrendingUp } from 'lucide-react'

interface LibrarianSectionProps {
  onAddBook: () => void
}

// Helper function to get user's full name safely with proper typing
const getUserFullName = (user: User | any): string => {
  if (!user) return 'Unknown User'
  
  // For typed User objects, use firstName/lastName
  if ('firstName' in user && 'lastName' in user) {
    const fullName = `${user.firstName} ${user.lastName}`.trim()
    return fullName || user.email || 'Unknown User'
  }
  
  // For untyped objects (like from checkout.user), try both naming conventions
  const firstName = user.firstName || user.first_name || ''
  const lastName = user.lastName || user.last_name || ''
  
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.email || user.name || 'Unknown User'
}

export const LibrarianSection: React.FC<LibrarianSectionProps> = ({
  onAddBook
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'checkouts' | 'users'>('overview')
  
  // Real data from hooks
  const { books, loading: booksLoading } = useBooks()
  const { checkouts, loading: checkoutsLoading } = useCheckouts()
  const { users, loading: usersLoading } = useUsers()

  // Calculate real stats
  const stats = {
    totalBooks: books?.length || 0,
    totalUsers: users?.length || 0,
    activeCheckouts: checkouts?.filter(checkout => !checkout.isReturned)?.length || 0,
    overdueBooks: checkouts?.filter(checkout => checkout.isOverdue && !checkout.isReturned)?.length || 0
  }

  // Generate recent activity from real checkout data
  const recentActivity = (checkouts || [])
    .slice(-5) // Get last 5 checkouts
    .reverse() // Show newest first
    .map((checkout, index) => ({
      id: checkout.id,
      action: checkout.isReturned ? 'Book returned' : 'Book checked out',
      book: checkout.book?.title || 'Unknown Book',
      user: getUserFullName(checkout.user), // ✅ Use helper function
      time: new Date(checkout.checkoutDate).toLocaleDateString()
    }))

  // Loading state
  const isLoading = booksLoading || checkoutsLoading || usersLoading

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Librarian Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your library system</p>
        </div>
        <Button onClick={onAddBook} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Book
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'books', label: 'Books' },
          { id: 'checkouts', label: 'Checkouts' },
          { id: 'users', label: 'Users' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? 'bg-blue-500 shadow-sm' : ''}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.totalBooks}
                </div>
                <p className="text-xs text-muted-foreground">
                  Books in collection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Checkouts</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.activeCheckouts}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently checked out
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? '...' : stats.overdueBooks}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your library system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-600">"{activity.book}" by {activity.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'books' && (
        <div>
          <BookGrid userRole="librarian" />
        </div>
      )}

      {activeTab === 'checkouts' && (
        <div>
          <CheckoutManagement />
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage library users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users?.map((user: User) => { // ✅ Type the user parameter
                      const displayName = getUserFullName(user)
                      
                      return (
                        <Card key={user.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={user.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`}
                                alt={displayName}
                                className="h-10 w-10 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{displayName}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <Badge variant={user.role === 'librarian' ? 'default' : 'secondary'} className="text-xs">
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}