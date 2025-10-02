'use client';

import { useState } from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function TopNavigation() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        {/* Left Side */}
        <Link 
          href="/feed" 
          className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          GenZ
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </Link>

          {/* User Menu */}
          <div className="scale-90">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search videos, hashtags, users..."
              className="w-full bg-gray-800 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}