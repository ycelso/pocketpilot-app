"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

interface ThemeToggleButtonProps {
  variant?: 'default' | 'green';
}

export function ThemeToggleButton({ variant = 'default' }: ThemeToggleButtonProps) {
  const { theme, setTheme } = useTheme()

  const buttonClasses = variant === 'green' 
    ? "text-white hover:text-white hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`${buttonClasses} h-10 w-10`}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
