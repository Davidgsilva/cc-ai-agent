
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  companyName = "CC AI Agent",
  tagline = "Your intelligent AI assistant for credit card recommendations and financial insights",
  showCTA = true,
  onCTAClick
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for OAuth errors
  const error = searchParams.get('error');
  const errorMessage = error === 'OAuthCallback' ? 'There was an issue with Google sign-in. Please try again.' : null;

  const handleSignIn = () => {
    router.push('/login');
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

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
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    };

    const handleFirstInteraction = () => {
      if (video.paused && hasVideoError) {
        video.play().catch(error => {
          console.warn('Interaction-triggered play failed:', error);
        });
      }
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('click', handleFirstInteraction);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (video.readyState >= 3) {
      handleLoadedData();
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    } else if (video.readyState >= 2) {
      video.play().catch(error => {
        console.warn('Auto-play failed:', error);
        setHasVideoError(true);
      });
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [hasVideoError]);

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
          onPlay={() => setHasVideoError(false)}
          onError={() => setHasVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback Background */}
        {(!isVideoLoaded || hasVideoError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}
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

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6">
                <Alert className="border-red-200 bg-red-50/90 backdrop-blur-sm">
                  <AlertDescription className="text-red-800">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* CTA Buttons */}
            {showCTA && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="text-white font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105 focus:scale-105 cursor-pointer"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  aria-label="Continue with Google"
                >
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105 focus:scale-105 cursor-pointer"
                  onClick={onCTAClick || handleSignIn}
                  aria-label="Sign in with email"
                >
                  Sign in with Email
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
