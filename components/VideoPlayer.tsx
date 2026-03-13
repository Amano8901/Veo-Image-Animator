
import React from 'react';
import { DownloadIcon } from './icons';

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `veo-generated-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full bg-gray-800 rounded-2xl p-4 flex flex-col gap-4">
      <video
        src={videoUrl}
        controls
        autoPlay
        loop
        muted
        className="w-full aspect-video rounded-lg bg-black"
      >
        Your browser does not support the video tag.
      </video>
      <button
        onClick={handleDownload}
        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
      >
        <DownloadIcon className="w-5 h-5" />
        Download Video
      </button>
    </div>
  );
};
