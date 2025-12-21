import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme, vars } from 'nativewind'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { View, useColorScheme as useRNColorScheme } from 'react-native'

export type Theme = 'light' | 'dark' | 'system'

// Определяем темы через vars
const themes = {
  light: vars({
    '--color-background': '255 255 255',
    '--color-foreground': '17 24 28',
    '--color-card': '255 255 255',
    '--color-card-foreground': '17 24 28',
    '--color-muted': '241 245 249',
    '--color-muted-foreground': '100 116 139',
    '--color-accent': '241 245 249',
    '--color-accent-foreground': '15 23 42',
    '--color-border': '226 232 240',
    '--color-input': '226 232 240',
    '--color-primary': '10 126 164',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '241 245 249',
    '--color-secondary-foreground': '15 23 42',
    '--color-destructive': '239 68 68',
    '--color-destructive-foreground': '255 255 255',
  }),
  dark: vars({
    '--color-background': '15 23 42',
    '--color-foreground': '248 250 252',
    '--color-card': '30 41 59',
    '--color-card-foreground': '248 250 252',
    '--color-muted': '30 41 59',
    '--color-muted-foreground': '148 163 184',
    '--color-accent': '30 41 59',
    '--color-accent-foreground': '248 250 252',
    '--color-border': '51 65 85',
    '--color-input': '51 65 85',
    '--color-primary': '56 189 248',
    '--color-primary-foreground': '15 23 42',
    '--color-secondary': '30 41 59',
    '--color-secondary-foreground': '248 250 252',
    '--color-destructive': '248 113 113',
    '--color-destructive-foreground': '255 255 255',
  }),
}

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => Promise<void>
  toggleTheme: () => Promise<void>
  isLoaded: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@app_theme'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const systemColorScheme = useRNColorScheme()
  const { setColorScheme: setNativeWindColorScheme } = useColorScheme()
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme)
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadTheme()
  }, [])

  // Determine resolved theme based on current setting
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : theme

  // Apply theme to NativeWind and update color scheme
  useEffect(() => {
    if (!isLoaded) return
    // Устанавливаем colorScheme в NativeWind для правильной работы dark: классов
    setNativeWindColorScheme(resolvedTheme)
  }, [resolvedTheme, isLoaded, setNativeWindColorScheme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  const toggleTheme = async () => {
    if (theme === 'system') {
      await setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      await setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isLoaded,
  }

  return (
    <ThemeContext.Provider value={value}>
      <View style={themes[resolvedTheme]} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
