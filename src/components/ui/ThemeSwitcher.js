"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log("Current theme:", theme, "Resolved theme:", resolvedTheme);
    }
  }, [theme, resolvedTheme, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={theme === "light" ? "solid" : "bordered"}
        color={theme === "light" ? "primary" : "default"}
        onPress={() => {
          console.log("Setting theme to light");
          setTheme("light");
        }}
      >
        ☀️ Light
      </Button>
      <Button
        size="sm"
        variant={theme === "dark" ? "solid" : "bordered"}
        color={theme === "dark" ? "primary" : "default"}
        onPress={() => {
          console.log("Setting theme to dark");
          setTheme("dark");
        }}
      >
        🌙 Dark
      </Button>
      <Button
        size="sm"
        variant={theme === "system" ? "solid" : "bordered"}
        color={theme === "system" ? "primary" : "default"}
        onPress={() => {
          console.log("Setting theme to system");
          setTheme("system");
        }}
      >
        💻 System
      </Button>
    </div>
  );
}