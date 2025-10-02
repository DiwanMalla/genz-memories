import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TopNavigation } from '@/components/navigation/top-nav';
import { BottomNavigation } from '@/components/navigation/bottom-nav';
import { Search, TrendingUp, Hash, MapPin, Clock } from 'lucide-react';

const trendingHashtags = [
  { tag: '#ClimateStrike', posts: 1234, growth: '+15%' },
  { tag: '#StudentRights', posts: 892, growth: '+8%' },
  { tag: '#BlackLivesMatter', posts: 2156, growth: '+22%' },
  { tag: '#WomensRights', posts: 756, growth: '+12%' },
  { tag: '#Immigration', posts: 643, growth: '+5%' },
  { tag: '#Healthcare', posts: 534, growth: '+18%' },
];

const featuredLocations = [
  { city: 'New York', videos: 456, image: '/locations/nyc.jpg' },
  { city: 'Los Angeles', videos: 342, image: '/locations/la.jpg' },
  { city: 'London', videos: 298, image: '/locations/london.jpg' },
  { city: 'Berlin', videos: 234, image: '/locations/berlin.jpg' },
  { city: 'Sydney', videos: 187, image: '/locations/sydney.jpg' },
  { city: 'Tokyo', videos: 156, image: '/locations/tokyo.jpg' },
];

export default async function DiscoverPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos, hashtags, users..."
              className="w-full bg-gray-900 border border-gray-700 rounded-full pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full whitespace-nowrap">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Trending
            </button>
            <button className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-700">
              <Clock className="w-4 h-4 inline mr-2" />
              Recent
            </button>
            <button className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-700">
              <MapPin className="w-4 h-4 inline mr-2" />
              Near You
            </button>
          </div>

          {/* Trending Hashtags */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trending Hashtags</h2>
              <button className="text-purple-400 text-sm hover:text-purple-300">See All</button>
            </div>
            <div className="space-y-3">
              {trendingHashtags.map((hashtag, index) => (
                <div key={hashtag.tag} className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm font-mono">#{index + 1}</span>
                    <div>
                      <p className="text-purple-400 font-semibold">{hashtag.tag}</p>
                      <p className="text-gray-400 text-sm">{hashtag.posts.toLocaleString()} posts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 text-sm font-semibold">{hashtag.growth}</span>
                    <Hash className="w-4 h-4 text-gray-500 ml-2 inline" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Locations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Locations</h2>
              <button className="text-purple-400 text-sm hover:text-purple-300">Explore Map</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredLocations.map((location) => (
                <div key={location.city} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-md mb-3 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{location.city}</h3>
                  <p className="text-gray-400 text-sm">{location.videos} videos</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}