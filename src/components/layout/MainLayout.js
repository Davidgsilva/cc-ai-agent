"use client";

import { useState } from "react";
import { Button, Tabs, Tab } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInterface from "../chat/ChatInterface";
import PreferencesPanel from "../ui/PreferencesPanel";
import CreditCardComparison from "../cards/CreditCardComparison";
import CreditCardHero from "../cards/CreditCardHero";
import RewardCalculator from "../cards/RewardCalculator";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

export default function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("preferences");
  const [cardView, setCardView] = useState("hero");

  const sampleCards = [
    {
      name: "Chase Sapphire Preferred",
      issuer: "Chase",
      annualFee: 95,
      apr: { min: 21.49, max: 28.49 },
      cashbackRate: { base: 1, max: 2 },
      signupBonus: "60,000 points",
      creditScore: "Good to Excellent",
      foreignTransaction: 0,
      benefits: ["Travel rewards", "Transfer partners", "Trip protection"],
      recommended: true
    },
    {
      name: "Chase Freedom Unlimited",
      issuer: "Chase", 
      annualFee: 0,
      apr: { min: 20.49, max: 29.24 },
      cashbackRate: 1.5,
      signupBonus: "$200 bonus",
      creditScore: "Good to Excellent",
      foreignTransaction: 3,
      benefits: ["No annual fee", "Cash back", "Cell phone protection"]
    }
  ];

  const handleSidebarToggle = (content) => {
    if (showSidebar && sidebarContent === content) {
      setShowSidebar(false);
    } else {
      setSidebarContent(content);
      setShowSidebar(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-divider bg-content1 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Credit Card AI</h1>
            <p className="text-sm text-default-500">Powered by Claude AI with Web Search</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex gap-2">
              <Button
                variant={showSidebar && sidebarContent === "preferences" ? "solid" : "bordered"}
                color="primary"
                size="sm"
                onPress={() => handleSidebarToggle("preferences")}
              >
                Preferences
              </Button>
              <Button
                variant={showSidebar && sidebarContent === "comparison" ? "solid" : "bordered"}
                color="secondary"
                size="sm"
                onPress={() => handleSidebarToggle("comparison")}
              >
                Compare
              </Button>
              <Button
                variant={showSidebar && sidebarContent === "calculator" ? "solid" : "bordered"}
                color="success"
                size="sm"
                onPress={() => handleSidebarToggle("calculator")}
              >
                Calculator
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>

        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 450, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-divider bg-content1 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-divider">
                  <h2 className="font-semibold">
                    {sidebarContent === "preferences" && "Your Preferences"}
                    {sidebarContent === "comparison" && "Card Comparison"}
                    {sidebarContent === "calculator" && "Reward Calculator"}
                  </h2>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setShowSidebar(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {sidebarContent === "preferences" && <PreferencesPanel />}
                  {sidebarContent === "comparison" && (
                    <div className="p-4">
                      <div className="mb-4">
                        <Tabs 
                          aria-label="Card view options"
                          selectedKey={cardView}
                          onSelectionChange={setCardView}
                          size="sm"
                        >
                          <Tab key="hero" title="Hero Cards" />
                          <Tab key="table" title="Table View" />
                        </Tabs>
                      </div>
                      {cardView === "hero" ? (
                        <CreditCardHero cards={sampleCards} />
                      ) : (
                        <CreditCardComparison cards={sampleCards} />
                      )}
                    </div>
                  )}
                  {sidebarContent === "calculator" && (
                    <div className="p-4">
                      <RewardCalculator />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* <footer className="border-t border-divider bg-content1 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-default-400">
          <span>AI-powered credit card recommendations with real-time web search</span>
          <span>Always verify offers with official sources</span>
        </div>
      </footer> */}

    </div>
  );
}