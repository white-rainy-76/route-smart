import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useIAP } from 'react-native-iap'
import { IOS_SUBSCRIPTION_PRODUCT_IDS } from '../iap/products'

interface AppState {
  hasCompletedOnboarding: boolean
  isAuthenticated: boolean
  hasTruckProfile: boolean
  hasSeenLocationPermission: boolean
  hasActiveSubscription: boolean
  isSubscriptionLoading: boolean
  isLoading: boolean
}

interface AppContextType extends AppState {
  completeOnboarding: () => Promise<void>
  setAuthenticated: (value: boolean) => Promise<void>
  setTruckProfile: (value: boolean) => Promise<void>
  setSeenLocationPermission: (value: boolean) => Promise<void>
  setSubscriptionActive: (value: boolean) => Promise<void>
  refreshSubscriptionStatus: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ONBOARDING: '@road-smart:onboarding-completed',
  AUTH: '@road-smart:authenticated',
  TRUCK_PROFILE: '@road-smart:truck-profile-completed',
  LOCATION_PERMISSION: '@road-smart:location-permission-seen',
  SUBSCRIPTION_ACTIVE: '@road-smart:subscription-active',
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { connected, hasActiveSubscriptions } = useIAP()
  const [state, setState] = useState<AppState>({
    hasCompletedOnboarding: false,
    isAuthenticated: false,
    hasTruckProfile: false,
    hasSeenLocationPermission: false,
    hasActiveSubscription: false,
    isSubscriptionLoading: true,
    isLoading: true,
  })

  useEffect(() => {
    loadAppState()
  }, [])

  const loadAppState = async () => {
    try {
      const [
        onboarding,
        auth,
        truckProfile,
        locationPermission,
        subscriptionActive,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH),
        AsyncStorage.getItem(STORAGE_KEYS.TRUCK_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_ACTIVE),
      ])

      setState({
        hasCompletedOnboarding: onboarding === 'true',
        isAuthenticated: auth === 'true',
        hasTruckProfile: truckProfile === 'true',
        hasSeenLocationPermission: locationPermission === 'true',
        hasActiveSubscription: subscriptionActive === 'true',
        isSubscriptionLoading: true,
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

  const setSeenLocationPermission = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOCATION_PERMISSION,
        value.toString(),
      )
      setState((prev) => ({ ...prev, hasSeenLocationPermission: value }))
    } catch (error) {
      console.error('Error saving location permission state:', error)
    }
  }

  const setSubscriptionActive = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SUBSCRIPTION_ACTIVE,
        value.toString(),
      )
      setState((prev) => ({ ...prev, hasActiveSubscription: value }))
    } catch (error) {
      console.error('Error saving subscription state:', error)
    }
  }

  const refreshSubscriptionStatus = async () => {
    // For now we only support iOS subscriptions; Android can be added later.
    if (Platform.OS !== 'ios') {
      setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
      return
    }

    if (!connected) return

    setState((prev) => ({ ...prev, isSubscriptionLoading: true }))
    try {
      const active = await hasActiveSubscriptions(IOS_SUBSCRIPTION_PRODUCT_IDS)
      await setSubscriptionActive(active)
    } catch (error) {
      // Keep cached value if store check fails.
      console.error('Error refreshing subscription status:', error)
    } finally {
      setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
    }
  }

  useEffect(() => {
    // Whenever the IAP connection becomes ready, refresh subscription status.
    void refreshSubscriptionStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  return (
    <AppContext.Provider
      value={{
        ...state,
        completeOnboarding,
        setAuthenticated,
        setTruckProfile,
        setSeenLocationPermission,
        setSubscriptionActive,
        refreshSubscriptionStatus,
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
