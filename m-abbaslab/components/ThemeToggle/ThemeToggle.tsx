// components/ThemeToggle/ThemeToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${
          darkMode ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {darkMode ? (
            <Moon className="w-4 h-4 text-gray-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </div>
      </div>
      
      {/* Background gradients */}
      <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>
    </button>
  )
}
