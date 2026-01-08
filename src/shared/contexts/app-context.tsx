import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AppState {
  hasCompletedOnboarding: boolean
  isAuthenticated: boolean
  hasTruckProfile: boolean
  isLoading: boolean
}

interface AppContextType extends AppState {
  completeOnboarding: () => Promise<void>
  setAuthenticated: (value: boolean) => Promise<void>
  setTruckProfile: (value: boolean) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ONBOARDING: '@road-smart:onboarding-completed',
  AUTH: '@road-smart:authenticated',
  TRUCK_PROFILE: '@road-smart:truck-profile-completed',
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    hasCompletedOnboarding: false,
    isAuthenticated: false,
    hasTruckProfile: false,
    isLoading: true,
  })

  useEffect(() => {
    loadAppState()
  }, [])

  const loadAppState = async () => {
    try {
      const [onboarding, auth, truckProfile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH),
        AsyncStorage.getItem(STORAGE_KEYS.TRUCK_PROFILE),
      ])

      setState({
        hasCompletedOnboarding: onboarding === 'true',
        isAuthenticated: auth === 'true',
        hasTruckProfile: truckProfile === 'true',
        isLoading: false,
      })
    } catch (error) {
      console.error('Error loading app state:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true')
      setState((prev) => ({ ...prev, hasCompletedOnboarding: true }))
    } catch (error) {
      console.error('Error saving onboarding state:', error)
    }
  }

  const setAuthenticated = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH, value.toString())
      setState((prev) => ({ ...prev, isAuthenticated: value }))
    } catch (error) {
      console.error('Error saving auth state:', error)
    }
  }

  const setTruckProfile = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRUCK_PROFILE, value.toString())
      setState((prev) => ({ ...prev, hasTruckProfile: value }))
    } catch (error) {
      console.error('Error saving truck profile state:', error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        completeOnboarding,
        setAuthenticated,
        setTruckProfile,
      }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
