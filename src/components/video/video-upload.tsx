"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Film, MapPin, Hash } from "lucide-react";
import { useVideos } from "@/contexts/video-context";
import toast from "react-hot-toast";

interface VideoUploadProps {
  onClose: () => void;
}

export function VideoUpload({ onClose }: VideoUploadProps) {
  const [uploadStep, setUploadStep] = useState<
    "select" | "details" | "uploading"
  >("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    hashtags: "",
  });

  const { addVideo } = useVideos();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadStep("details");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !formData.title.trim()) {
      toast.error("Please provide a title and select a video file");
      return;
    }

    setUploadStep("uploading");

    try {
      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      uploadFormData.append("video", selectedFile);
      uploadFormData.append("title", formData.title.trim());
      uploadFormData.append("description", formData.description.trim());
      uploadFormData.append("location", formData.location.trim());
      uploadFormData.append("hashtags", formData.hashtags.trim());

      // Upload to API
      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Add video to feed context
      addVideo({
        title: result.video.title,
        description: result.video.description,
        videoUrl: result.video.videoUrl,
        thumbnailUrl: result.video.thumbnailUrl,
        hashtags: result.video.hashtags,
        location: result.video.location,
      });

      // Close modal and reset form
      onClose();
      resetUpload();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload video. Please try again."
      );
      setUploadStep("details");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoPreview("");
    setUploadStep("select");
    setFormData({
      title: "",
      description: "",
      location: "",
      hashtags: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {uploadStep === "select" && "Upload Video"}
            {uploadStep === "details" && "Add Details"}
            {uploadStep === "uploading" && "Uploading..."}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadStep === "select" && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <input {...getInputProps()} />
              <Film className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-purple-400">Drop your video here...</p>
              ) : (
                <>
                  <p className="text-gray-300 mb-2">
                    Drag and drop your video here
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    or click to browse
                  </p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Choose Video
                  </button>
                </>
              )}
              <p className="text-gray-500 text-xs mt-4">
                MP4, MOV, AVI, WebM up to 100MB
              </p>
            </div>
          )}

          {uploadStep === "details" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Preview */}
              {videoPreview && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="Give your video a title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Tell people what this video is about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="Where was this filmed?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hashtags: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="#protest #activism #change"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetUpload}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-full transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-full transition-all"
                >
                  Post Video
                </button>
              </div>
            </form>
          )}

          {uploadStep === "uploading" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Uploading your video...
              </h3>
              <p className="text-gray-400">This may take a few moments</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-6">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
