# GenZ Memories - Social Video Platform

A modern social media platform dedicated to preserving Gen Z protest movements and social activism through video content. Built with Next.js 15 and the latest web technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (Recommended: 20+)
- PostgreSQL or MongoDB
- npm or pnpm
- Cloudinary account (for video storage)

### Development Setup

1. **Clone and install dependencies**

   ```bash
   cd genz-memories
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Update .env.local with your configurations
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # (Optional) Open Prisma Studio
   npm run db:studio
   ```

4. **Start Development**

   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
genz-memories/
├── src/
│   ├── app/                # Next.js 15 App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin dashboard
│   │   └── (main)/        # Main app layout
│   ├── components/        # React components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility libraries
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind configuration
```

## 🛠️ Technology Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Database**: Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js 5
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Video Processing**: FFmpeg
- **UI Components**: Radix UI
- **State Management**: TanStack Query

## 🎯 Features

- **Video Upload & Sharing**: TikTok-style vertical video feed
- **Social Features**: Like, comment, share, follow
- **User Profiles**: Customizable profiles with video collections
- **Discovery**: Hashtag-based search and trending content
- **Admin Panel**: Content moderation and user management
- **Real-time**: Live notifications and messaging

## 🌟 Mission

Preserving the voices and moments of social change for future generations. Every protest, every movement, every call for justice deserves to be remembered.

## 📖 Documentation

For detailed project specifications, see [PROJECT_CORE_INSTRUCTIONS.md](./PROJECT_CORE_INSTRUCTIONS.md)
