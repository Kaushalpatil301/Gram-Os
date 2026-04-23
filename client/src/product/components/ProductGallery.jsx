import React, { useState, useEffect } from "react";
import { getProductData } from "../lib/data";

const ImageSkeleton = () => (
  <div className="aspect-square rounded-3xl overflow-hidden animate-pulse bg-gradient-to-br from-slate-200 to-slate-300">
    <div className="w-full h-full bg-slate-300 flex items-center justify-center">
      <svg
        className="w-16 h-16 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
);

const DotsSkeleton = ({ count }) => (
  <div className="flex justify-center space-x-3">
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full bg-slate-300 animate-pulse"
        />
      ))}
  </div>
);

export default function ProductGallery({ batchId = "LOT12345" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      setIsDataLoading(true);
      const productData = getProductData(batchId);
      const productImages =
        productData.gallery?.length > 0
          ? productData.gallery
          : [productData.image];

      setImages(productImages);
      setCurrentImageIndex(0);

      const initialLoadingStates = {};
      productImages.forEach((_, index) => {
        initialLoadingStates[index] = true;
      });
      setImageLoadingStates(initialLoadingStates);
      setIsDataLoading(false);
    };

    loadProductData();
  }, [batchId]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleImageLoad = (index) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isDataLoading || images.length === 0) {
    return (
      <div className="space-y-6">
        <ImageSkeleton />
        <DotsSkeleton count={3} />
      </div>
    );
  }

  const productData = getProductData(batchId);
  const hasMultipleImages = images.length > 1;
  const currentImageLoading = imageLoadingStates[currentImageIndex];

  return (
    <div className="space-y-6">
      <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group backdrop-blur-lg bg-white/80 border border-white/50">
        {currentImageLoading && (
          <div className="absolute inset-0 z-10">
            <ImageSkeleton />
          </div>
        )}

        <img
          src={images[currentImageIndex]}
          className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
            currentImageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => handleImageLoad(currentImageIndex)}
          onError={() => handleImageLoad(currentImageIndex)}
          alt={`Product image ${currentImageIndex + 1}`}
        />

        {hasMultipleImages && !currentImageLoading && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-md hover:scale-110 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-slate-600 border border-white/50"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-md hover:scale-110 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-slate-600 border border-white/50"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="flex justify-center space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 scale-125"
                  : imageLoadingStates[index]
                  ? "bg-slate-300 animate-pulse"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
