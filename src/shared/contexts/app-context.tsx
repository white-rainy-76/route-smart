import { getSubscriptionStatus } from '@/services/subscription'
import { getUserId } from '@/shared/lib/auth'
import {
  hasSubscriptionHistory as hasSubscriptionHistoryFromStatus,
  isSubscriptionActive,
  normalizeSubscriptionStatus,
  SUBSCRIPTION_STATUS,
} from '@/shared/lib/subscription-status'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AppState, Platform } from 'react-native'

interface AppContextState {
  hasCompletedOnboarding: boolean
  isAuthenticated: boolean
  hasTruckProfile: boolean
  hasSeenLocationPermission: boolean
  hasActiveSubscription: boolean
  hasSubscriptionHistory: boolean
  subscriptionStatus: number | null
  subscriptionExpiresAtUtc: string | null
  isSubscriptionLoading: boolean
  isLoading: boolean
}

interface SubscriptionSnapshot {
  hasActiveSubscription: boolean
  hasSubscriptionHistory: boolean
  subscriptionStatus: number | null
  subscriptionExpiresAtUtc: string | null
}

interface AppContextType extends AppContextState {
  completeOnboarding: () => Promise<void>
  setAuthenticated: (value: boolean) => Promise<void>
  setTruckProfile: (value: boolean) => Promise<void>
  setSeenLocationPermission: (value: boolean) => Promise<void>
  setSubscriptionActive: (value: boolean) => Promise<void>
  refreshSubscriptionStatus: (
    userIdOverride?: string | null,
  ) => Promise<SubscriptionSnapshot | null>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  ONBOARDING: '@road-smart:onboarding-completed',
  AUTH: '@road-smart:authenticated',
  TRUCK_PROFILE: '@road-smart:truck-profile-completed',
  LOCATION_PERMISSION: '@road-smart:location-permission-seen',
  SUBSCRIPTION_ACTIVE: '@road-smart:subscription-active',
  SUBSCRIPTION_STATUS: '@road-smart:subscription-status',
  SUBSCRIPTION_EXPIRES_AT: '@road-smart:subscription-expires-at',
  SUBSCRIPTION_HISTORY: '@road-smart:subscription-history',
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppContextState>({
    hasCompletedOnboarding: false,
    isAuthenticated: false,
    hasTruckProfile: false,
    hasSeenLocationPermission: false,
    hasActiveSubscription: false,
    hasSubscriptionHistory: false,
    subscriptionStatus: null,
    subscriptionExpiresAtUtc: null,
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
        subscriptionStatus,
        subscriptionExpiresAt,
        subscriptionHistory,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH),
        AsyncStorage.getItem(STORAGE_KEYS.TRUCK_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_ACTIVE),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRES_AT),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_HISTORY),
      ])

      const storedStatus =
        typeof subscriptionStatus === 'string' && subscriptionStatus.length > 0
          ? Number(subscriptionStatus)
          : null
      const normalizedStatus = normalizeSubscriptionStatus(
        Number.isNaN(storedStatus as number) ? null : storedStatus,
      )
      const hasHistory =
        subscriptionHistory === 'true' ||
        hasSubscriptionHistoryFromStatus(normalizedStatus)
      const hasActive =
        normalizedStatus !== null
          ? isSubscriptionActive(normalizedStatus)
          : subscriptionActive === 'true'
      const expiresAtUtc = subscriptionExpiresAt?.trim()
        ? subscriptionExpiresAt
        : null

      setState({
        hasCompletedOnboarding: onboarding === 'true',
        isAuthenticated: auth === 'true',
        hasTruckProfile: truckProfile === 'true',
        hasSeenLocationPermission: locationPermission === 'true',
        hasActiveSubscription: hasActive,
        hasSubscriptionHistory: hasHistory,
        subscriptionStatus: normalizedStatus,
        subscriptionExpiresAtUtc: expiresAtUtc,
        isSubscriptionLoading: Platform.OS === 'ios' && auth === 'true',
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
      setState((prev) => ({
        ...prev,
        isAuthenticated: value,
      }))
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

  const persistSubscriptionSnapshot = useCallback(
    async (snapshot: SubscriptionSnapshot) => {
      await AsyncStorage.multiSet([
        [
          STORAGE_KEYS.SUBSCRIPTION_ACTIVE,
          snapshot.hasActiveSubscription.toString(),
        ],
        [
          STORAGE_KEYS.SUBSCRIPTION_HISTORY,
          snapshot.hasSubscriptionHistory.toString(),
        ],
        [
          STORAGE_KEYS.SUBSCRIPTION_STATUS,
          snapshot.subscriptionStatus !== null
            ? snapshot.subscriptionStatus.toString()
            : '',
        ],
        [
          STORAGE_KEYS.SUBSCRIPTION_EXPIRES_AT,
          snapshot.subscriptionExpiresAtUtc ?? '',
        ],
      ])
    },
    [],
  )

  const setSubscriptionSnapshot = useCallback(
    async (snapshot: SubscriptionSnapshot) => {
      await persistSubscriptionSnapshot(snapshot)
      setState((prev) => ({ ...prev, ...snapshot }))
    },
    [persistSubscriptionSnapshot],
  )

  const setSubscriptionActive = async (value: boolean) => {
    const status = value
      ? state.subscriptionStatus ?? SUBSCRIPTION_STATUS.ACTIVE
      : state.subscriptionStatus
    const snapshot: SubscriptionSnapshot = {
      hasActiveSubscription: value,
      hasSubscriptionHistory: value ? true : state.hasSubscriptionHistory,
      subscriptionStatus: status,
      subscriptionExpiresAtUtc: state.subscriptionExpiresAtUtc,
    }

    try {
      await setSubscriptionSnapshot(snapshot)
    } catch (error) {
      console.error('Error saving subscription state:', error)
    }
  }

  const refreshSubscriptionStatus = useCallback(
    async (
      userIdOverride?: string | null,
    ): Promise<SubscriptionSnapshot | null> => {
      // For now we only support iOS subscriptions; Android can be added later.
      if (Platform.OS !== 'ios') {
        setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
        return null
      }

      if (!state.isAuthenticated && !userIdOverride) {
        setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
        return null
      }

      setState((prev) => ({ ...prev, isSubscriptionLoading: true }))
      try {
        const userId = userIdOverride?.trim() || (await getUserId())
        if (!userId) {
          setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
          return null
        }

        const response = await getSubscriptionStatus({ userId })
        const normalizedStatus = normalizeSubscriptionStatus(
          response.status ?? null,
        )
        const expiresAtUtc = response.expiresAtUtc?.trim()
          ? response.expiresAtUtc
          : null
        const snapshot: SubscriptionSnapshot = {
          hasActiveSubscription: isSubscriptionActive(normalizedStatus),
          hasSubscriptionHistory: hasSubscriptionHistoryFromStatus(
            normalizedStatus,
          ),
          subscriptionStatus: normalizedStatus,
          subscriptionExpiresAtUtc: expiresAtUtc,
        }

        await setSubscriptionSnapshot(snapshot)
        return snapshot
      } catch (error) {
        // Keep cached value if status check fails.
        console.error('Error refreshing subscription status:', error)
        return null
      } finally {
        setState((prev) => ({ ...prev, isSubscriptionLoading: false }))
      }
    },
    [state.isAuthenticated, setSubscriptionSnapshot],
  )

  useEffect(() => {
    void refreshSubscriptionStatus()
  }, [refreshSubscriptionStatus])

  useEffect(() => {
    if (!state.isAuthenticated) return
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshSubscriptionStatus()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [state.isAuthenticated, refreshSubscriptionStatus])

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
