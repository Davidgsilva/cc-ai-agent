
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

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

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Attempt to play video
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      }
    };

    if (video.readyState >= 3) {
      handleLoadedData();
    }

    playVideo();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Animation variants - respect reduced motion preference
  const containerVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  } : {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const glassVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  } : {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded && !hasVideoError ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/api/placeholder/1920/1080" // Fallback poster
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
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
                     {/* Glass Morphism Container */}
           <motion.div
             className="md rounded-3xl p-8 sm:p-12 lg:p-16"
             variants={glassVariants}
           >


            {/* Company Name */}
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight"
              variants={itemVariants}
            >
              {companyName}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed max-w-2xl mx-auto"
              variants={itemVariants}
            >
              {tagline}
            </motion.p>

            {/* CTA Button */}
            {showCTA && (
              <motion.div
                variants={itemVariants}
              >
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105 focus:scale-105"
                  onClick={onCTAClick}
                  aria-label="Get started with our platform"
                >
                  Get Started
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoSplash;
