"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative h-9 w-9"
    >
      {mounted && (
        <>
          <Sun
            className={`h-4 w-4 transition-all ${
              resolvedTheme === "dark"
                ? "scale-0 -rotate-90"
                : "scale-100 rotate-0"
            }`}
          />
          <Moon
            className={`absolute h-4 w-4 transition-all ${
              resolvedTheme === "dark"
                ? "scale-100 rotate-0"
                : "scale-0 rotate-90"
            }`}
          />
        </>
      )}
    </Button>
  );
}
