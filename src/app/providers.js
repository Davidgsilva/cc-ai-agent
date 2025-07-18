"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      themes={['light', 'dark']}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}