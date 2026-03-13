import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoFromImage } from './services/geminiService';
import type { AspectRatio, ImageFile } from './types';
import { VideoStatus } from './types';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { VideoPlayer } from './components/VideoPlayer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MovieIcon, WandIcon } from './components/icons';


// FIX: Removed the conflicting global declaration for window.aistudio.
// The type is expected to be provided by the execution environment, and this
// local declaration was causing a TypeScript error.
const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>("Could they be any more cute, animated in a whimsical, gentle style.");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [status, setStatus] = useState<VideoStatus>(VideoStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (hasKey) {
                    setApiKeyReady(true);
                    setShowApiKeyModal(false);
                } else {
                    setShowApiKeyModal(true);
                }
            } catch (e) {
                console.error("Error checking for API key:", e);
                setShowApiKeyModal(true);
            }
        } else {
            console.warn("aistudio not found. Assuming API key is set in environment for local dev.");
            setApiKeyReady(true);
        }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setShowApiKeyModal(false);
      setApiKeyReady(true);
      setError(null);
    }
  };

  const handleImageChange = (newImage: ImageFile) => {
    setImageFile(newImage);
  };
  
  const handleImageRemove = () => {
    if (imageFile) {
        URL.revokeObjectURL(imageFile.previewUrl);
    }
    setImageFile(null);
  };
  
  const resetToIdle = () => {
    setStatus(VideoStatus.IDLE);
    setError(null);
    setVideoUrl(null);
    setProgressMessage('');
  };

  const handleGenerateVideo = useCallback(async () => {
    if (!imageFile || status === VideoStatus.GENERATING) return;

    setStatus(VideoStatus.GENERATING);
    setError(null);
    setVideoUrl(null);
    setProgressMessage('Preparing your request...');

    try {
      const url = await generateVideoFromImage(
        prompt,
        imageFile.base64,
        imageFile.file.type,
        aspectRatio,
        setProgressMessage
      );
      setVideoUrl(url);
      setStatus(VideoStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      if (errorMessage.includes("API key not valid") || errorMessage.includes("Requested entity was not found")) {
        setError("API Key error. Please select a valid API key and try again.");
        setApiKeyReady(false);
        setShowApiKeyModal(true);
      } else {
        setError(errorMessage);
      }
      setStatus(VideoStatus.ERROR);
    }
  }, [imageFile, prompt, aspectRatio, status]);

  if (!apiKeyReady && showApiKeyModal) {
    return <ApiKeyModal onSelectKey={handleSelectKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
            <MovieIcon className="w-10 h-10 text-blue-400" />
            <span>Veo Image Animator</span>
          </div>
          <p className="mt-2 text-lg text-gray-400">Bring your photos to life with the magic of AI video generation.</p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col aspect-[4/3]">
                <ImageUploader 
                    imageFile={imageFile}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                />
            </div>

            <div className="flex flex-col gap-6">
                {status === VideoStatus.IDLE || status === VideoStatus.ERROR ? (
                    <>
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Animation Prompt</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Describe the animation you want to see..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-4">
                                {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                                    <button 
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`py-3 px-4 rounded-lg font-semibold transition ${aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateVideo}
                            disabled={!imageFile || status === VideoStatus.GENERATING}
                            className="w-full flex items-center justify-center gap-3 text-lg font-bold py-4 px-6 rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <WandIcon className="w-6 h-6" />
                            Generate Video
                        </button>
                    </>
                ) : status === VideoStatus.GENERATING ? (
                    <Loader progressMessage={progressMessage} />
                ) : status === VideoStatus.SUCCESS && videoUrl ? (
                    <div className="flex flex-col gap-4">
                        <VideoPlayer videoUrl={videoUrl} />
                        <button
                            onClick={resetToIdle}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Create Another Video
                        </button>
                    </div>
                ) : null}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
