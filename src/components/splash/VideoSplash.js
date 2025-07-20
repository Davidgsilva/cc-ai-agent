
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Hook to detect user's motion preference
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

const VideoSplash = ({
  videoSrc = "/splash-video.mp4",
  companyName = "COMPANY NAME",
  tagline = "Your tagline here",
  showCTA = true,
  onCTAClick = () => {}
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef(null);

  // Handle video load and error states
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      setHasVideoError(false);
    };

    const handleError = () => {
      setHasVideoError(true);
      setIsVideoLoaded(false);
    };

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      setHasVideoError(false);
      // Immediately play when video can play
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Immediately attempt to play if video is already ready
    if (video.readyState >= 3) {
      handleLoadedData();
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    } else if (video.readyState >= 2) {
      // Can play through - start playing immediately
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${
            isVideoLoaded && !hasVideoError ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Background video"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback Background */}
        {(!isVideoLoaded || hasVideoError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full p-4 sm:p-6 lg:p-8">
        <div
          className="text-center max-w-4xl mx-auto"
        >
                     {/* Glass Morphism Container */}
           <div
             className="md rounded-3xl p-8 sm:p-12 lg:p-16"
           >


            {/* Company Name */}
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight"
            >
              {companyName}
            </h1>

            {/* Tagline */}
            <p
              className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed max-w-2xl mx-auto"
            >
              {tagline}
            </p>

            {/* CTA Button */}
            {showCTA && (
              <div
              >
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105 focus:scale-105 cursor-pointer"
                  onClick={onCTAClick}
                  aria-label="Get started with our platform"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSplash;
