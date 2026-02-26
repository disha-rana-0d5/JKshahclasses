import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  videoUrl?: string;
  description?: string;
}

export function VideoModal({ isOpen, onClose, videoTitle = "Demo Class", videoUrl, description }: VideoModalProps) {
  if (!isOpen) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // Handle standard YouTube watch URLs
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;

    // Handle short YouTube URLs
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;

    // Handle already embed URLs
    if (url.includes("/embed/")) return `${url}?autoplay=1`;

    return url;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-black rounded-2xl shadow-2xl max-w-5xl w-full animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">{videoTitle}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-gray-900">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-white">
                  <p className="text-xl font-bold mb-2">No Video Available</p>
                  <p className="text-gray-400 text-sm">Please ask an admin to add a demo video for this course.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="p-4 bg-gray-900 rounded-b-2xl">
          <p className="text-gray-400 text-sm">
            {description || "Watch our expert faculty explain key concepts and teaching methodology. Experience the JK Shah Classes difference."}
          </p>
        </div>
      </div>
    </div>
  );
}
