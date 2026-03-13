
import { GoogleGenAI } from "@google/genai";
import type { AspectRatio } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideoFromImage = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  try {
    onProgress("Initializing Gemini...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    onProgress("Starting video generation with Veo...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: {
        imageBytes: imageBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
      }
    });

    onProgress("This can take a few minutes. Your video is being crafted...");
    
    const pollingInterval = 10000;

    while (!operation.done) {
      await delay(pollingInterval);
      onProgress("Checking on your video's progress...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Could not retrieve the generated video. Please try again.");
    }

    onProgress("Finalizing and fetching your video...");
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

    if (!videoResponse.ok) {
        const errorBody = await videoResponse.text();
        console.error("Video download failed:", errorBody);
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    
    onProgress("Video processing complete!");
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error) {
    console.error("Error in generateVideoFromImage:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred during video generation.");
  }
};
