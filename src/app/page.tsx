import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Clock, Star } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Extensive Collection',
      description: 'Access thousands of books across various genres and categories'
    },
    {
      icon: Users,
      title: 'Easy Management',
      description: 'Librarians can efficiently manage books, users, and checkouts'
    },
    {
      icon: Clock,
      title: 'Quick Checkout',
      description: 'Simple and fast book checkout process for readers'
    },
    {
      icon: Star,
      title: 'Reading Tracking',
      description: 'Track your reading progress and discover new favorites'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">BookBase</span>
            </div>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Your
            <span className="text-blue-600"> Digital Library</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover, manage, and enjoy your favorite books with our modern library management system. 
            Perfect for librarians and book lovers alike.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Reading
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Collection
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-gray-600">Books Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">342</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">89</div>
              <div className="text-gray-600">Books Checked Out</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl text-white text-center py-16 px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of readers and discover your next favorite book today.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Sign In Now
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">BookBase</span>
          </div>
          <p className="text-gray-400">
            © 2024 BookBase. All rights reserved. Built with ❤️ for book lovers.
          </p>
        </div>
      </footer>
    </div>
  )
}