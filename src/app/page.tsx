import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Upload, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12">
        <div className="text-2xl font-bold text-white">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GenZ Memories
          </span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/feed" className="text-white hover:text-purple-400 mr-4">
              Feed
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 md:px-12 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="block">Preserve the</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Voice of Change
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Document and share the movements that matter. Every protest, every voice, 
            every moment of activism deserves to be remembered for future generations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                  Start Documenting
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/feed" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                Go to Feed
              </Link>
            </SignedIn>
            <button className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Share Your Story</h3>
            <p className="text-gray-400">Upload videos of protests, rallies, and activism moments to preserve history.</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Build Community</h3>
            <p className="text-gray-400">Connect with fellow activists and amplify voices for social change.</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Safe & Secure</h3>
            <p className="text-gray-400">Your content is protected with end-to-end security and privacy controls.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Making History Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-purple-400">10K+</div>
              <div className="text-gray-400">Videos Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400">5K+</div>
              <div className="text-gray-400">Activists</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">50+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400">100+</div>
              <div className="text-gray-400">Movements</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-24 py-8">
        <div className="container mx-auto px-6 md:px-12 text-center text-gray-400">
          <p>&copy; 2025 GenZ Memories. Preserving the voice of change for future generations.</p>
        </div>
      </footer>
    </div>
  );
}
