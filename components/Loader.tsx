
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Warming up the digital canvas...",
  "Teaching the pixels to dance...",
  "Composing your video masterpiece...",
  "Brewing some creative energy...",
  "Rendering awesomeness, frame by frame...",
  "This might take a few minutes, good things come to those who wait!",
  "Almost there, the magic is happening!"
];

interface LoaderProps {
  progressMessage: string;
}

export const Loader: React.FC<LoaderProps> = ({ progressMessage }) => {
  const [dynamicMessage, setDynamicMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDynamicMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-2xl h-full">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-semibold text-white mb-2">{progressMessage}</p>
        <p className="text-gray-400">{dynamicMessage}</p>
    </div>
  );
};
