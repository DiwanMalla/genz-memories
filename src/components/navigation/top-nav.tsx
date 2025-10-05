"use client";

import { useState } from "react";
import { Search, Bell, MessageCircle, Plus } from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export function TopNavigation() {
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-40">
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 max-w-md mx-auto">
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

          {user ? (
            <>
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
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </>
          ) : (
            /* Upload Button for Anonymous Users */
            <SignInButton mode="modal">
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        {/* Left Side - Title */}
        <Link
          href="/feed"
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          GenZ Memories
        </Link>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search videos, hashtags, users..."
              className="w-full bg-gray-800 border border-gray-700 rounded-full pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
              >
                <Bell className="w-6 h-6 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </Link>

              {/* Messages */}
              <Link
                href="/messages"
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </Link>

              {/* User Menu */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </>
          ) : (
            /* Upload Button for Anonymous Users */
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Upload</span>
              </button>
            </SignInButton>
          )}
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
