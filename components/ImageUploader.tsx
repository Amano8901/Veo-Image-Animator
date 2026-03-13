
import React, { useRef } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  imageFile: ImageFile | null;
  onImageChange: (image: ImageFile) => void;
  onImageRemove: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imageFile, onImageChange, onImageRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);
        onImageChange({ file, previewUrl, base64 });
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("Could not process the selected file. Please try another image.");
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        handleFileChange({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full h-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center p-4 transition-all duration-300">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {imageFile ? (
        <div className="relative w-full h-full">
          <img src={imageFile.previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
          <button
            onClick={onImageRemove}
            className="absolute top-2 right-2 p-1.5 bg-gray-900 bg-opacity-70 rounded-full text-white hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div
            className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
          <UploadIcon className="w-12 h-12 mb-4" />
          <p className="font-semibold text-lg">Click to upload or drag & drop</p>
          <p className="text-sm">PNG, JPG or WEBP</p>
        </div>
      )}
    </div>
  );
};
