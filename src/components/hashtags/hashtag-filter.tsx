"use client";

import { useState, useEffect } from "react";
import { Hash, X, TrendingUp } from "lucide-react";

interface HashtagData {
  tag: string;
  count: number;
}

interface HashtagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClose?: () => void;
}

export function HashtagFilter({
  selectedTags,
  onTagsChange,
  onClose,
}: HashtagFilterProps) {
  const [trending, setTrending] = useState<HashtagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      const response = await fetch("/api/hashtags/trending");
      if (response.ok) {
        const data = await response.json();
        setTrending(data);
      }
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
      // Fallback to mock data
      setTrending([
        { tag: "ClimateStrike", count: 1234 },
        { tag: "StudentRights", count: 892 },
        { tag: "BlackLivesMatter", count: 2156 },
        { tag: "WomensRights", count: 756 },
        { tag: "Immigration", count: 643 },
        { tag: "Healthcare", count: 534 },
        { tag: "Education", count: 423 },
        { tag: "Justice", count: 389 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    const normalizedTag = tag.startsWith("#") ? tag.slice(1) : tag;

    if (selectedTags.includes(normalizedTag)) {
      onTagsChange(selectedTags.filter((t) => t !== normalizedTag));
    } else {
      onTagsChange([...selectedTags, normalizedTag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const filteredTrending = trending.filter((item) =>
    item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Filter by Hashtags</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Active Filters:</span>
            <button
              onClick={clearAllTags}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1 hover:bg-purple-700 transition-colors"
              >
                <span>#{tag}</span>
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm"
        />
      </div>

      {/* Trending Hashtags */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">Trending</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredTrending.map((item, index) => {
              const isSelected = selectedTags.includes(item.tag);
              return (
                <button
                  key={item.tag}
                  onClick={() => handleTagClick(item.tag)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 font-mono w-6">
                      #{index + 1}
                    </span>
                    <div className="text-left">
                      <p
                        className={`font-medium ${
                          isSelected ? "text-white" : "text-purple-400"
                        }`}
                      >
                        #{item.tag}
                      </p>
                      <p
                        className={`text-xs ${
                          isSelected ? "text-purple-100" : "text-gray-500"
                        }`}
                      >
                        {item.count.toLocaleString()} videos
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
