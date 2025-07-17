'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from "../components/layout/MainLayout";
import VideoSplash from "../components/splash/VideoSplash";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  const handleEnterApp = () => {
    setShowSplash(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <VideoSplash
            companyName="Credit Card AI"
            tagline="AI-powered credit card recommendations with real-time insights"
            showCTA={true}
            onCTAClick={handleEnterApp}
          />
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <MainLayout />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
