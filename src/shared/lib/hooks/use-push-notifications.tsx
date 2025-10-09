import { useRegisterDeviceMutation } from '@/services/auth/register-device'
import { SentryLogger } from '@/shared/lib/sentry-logger'
import { useNotificationStore } from '@/shared/store/notification-store'
import {
  isNearFuelStationNotification,
  isRouteOfferNotification,
  isValidNotificationData,
  ModalData,
  NotificationData,
} from '@/shared/types/notifications'
import * as Notifications from 'expo-notifications'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { registerForPushNotificationsAsync } from '../registerForPushNotifications'
import { getItem, isDeviceRegistered } from '../storage'

export function usePushNotifications() {
  const router = useRouter()
  const pathname = usePathname()
  const setNotification = useNotificationStore((state) => state.setNotification)
  const listenersSetRef = useRef(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentNotificationData, setCurrentNotificationData] =
    useState<NotificationData | null>(null)
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const { mutate: registerDevice } = useRegisterDeviceMutation({
    onSuccess: () => {
      console.log('Device token successfully sent to server.')
    },
    onError: (err) => {
      console.error('Error sending device token to server:', err)
      SentryLogger.logDeviceRegistrationError(
        'Failed to send device token to server',
        err as Error,
      )
    },
  })

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setCurrentNotificationData(null)
    setModalData(null)
  }

  const createModalData = (notificationData: NotificationData): ModalData => {
    if (isRouteOfferNotification(notificationData)) {
      console.log('Route offer notification:', notificationData)
      return {
        type: 'RouteOffer',
        routeId: notificationData.RouteId,
        fuelPlanId: notificationData.FuelPlanId,
        fuelPlanValidatorId: notificationData.FuelPlanValidatorId,
        fuelRouteVersionId: notificationData.FuelRouteVersionId,
        title: 'Route from manager',
        message: 'When accepting route -',
        buttonText: 'View',
        onButtonPress: () => {
          setNotification({
            routeId: notificationData.RouteId,
            fuelPlanId: notificationData.FuelPlanId,
            fuelPlanValidatorId: notificationData.FuelPlanValidatorId,
            fuelRouteVersionId: notificationData.FuelRouteVersionId,
            title: 'Route from manager',
            message: 'When accepting route -',
          })
          router.push('/(notification)/notifications')
        },
      }
    } else if (isNearFuelStationNotification(notificationData)) {
      return {
        type: 'NearFuelStation',
        title: 'Gas station nearby',
        message: 'Gas station found nearby',
        address: notificationData.Address,
        distance: notificationData.DistanceMiles,
        buttonText: 'Got it',
        onButtonPress: () => {},
      }
    }

    // Fallback, though this shouldn't happen with proper typing
    throw new Error('Unknown notification type')
  }

  const handleNotificationReceived = (notificationData: NotificationData) => {
    console.log('Notification received:', notificationData)

    if (isRouteOfferNotification(notificationData)) {
      console.log('Route offer notification:', notificationData.RouteId)
    } else if (isNearFuelStationNotification(notificationData)) {
      console.log('Fuel station notification:', notificationData.Address)
    }

    setCurrentNotificationData(notificationData)
    setModalData(createModalData(notificationData))
    setIsModalVisible(true)
  }

  const handleNotificationResponse = (notificationData: NotificationData) => {
    console.log('Notification clicked:', notificationData)

    if (isRouteOfferNotification(notificationData)) {
      console.log('Route offer clicked:', notificationData.RouteId)

      setNotification({
        routeId: notificationData.RouteId,
        fuelPlanId: notificationData.FuelPlanId,
        fuelPlanValidatorId: notificationData.FuelPlanValidatorId,
        fuelRouteVersionId: notificationData.FuelRouteVersionId,
        title: 'Route from manager',
        message: 'When accepting route -',
      })

      const targetRoute = '/(notification)/notifications'
      if (pathname !== targetRoute) {
        router.push(targetRoute)
      } else {
        console.log('Already on notification screen, data updated via Zustand.')
      }
    } else if (isNearFuelStationNotification(notificationData)) {
      console.log('Fuel station clicked:', notificationData.Address)
    }
  }

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        const storedUserId = getItem<string>('userId')
        // Check if device is already registered
        const deviceAlreadyRegistered = isDeviceRegistered()

        if (storedUserId && !deviceAlreadyRegistered) {
          console.log('Push token:', token)
          SentryLogger.logDeviceRegistration(
            'Starting device registration from push notifications',
            {
              userId: storedUserId,
              hasToken: !!token,
            },
          )
          // Register device only if it's not already registered
          registerDevice({ userId: storedUserId, pushToken: token })
        } else if (deviceAlreadyRegistered) {
          console.log('Device already registered, skipping registration')
          SentryLogger.logDeviceRegistration(
            'Device already registered, skipping from push notifications',
            {
              userId: storedUserId,
            },
          )
        } else {
          console.warn(
            'User ID not found in storage. Token will not be sent to server.',
          )
          SentryLogger.logDeviceRegistrationError(
            'User ID not found in storage',
            undefined,
            {
              hasStoredUserId: !!storedUserId,
              deviceAlreadyRegistered,
            },
          )
        }
      }
    })

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const rawData = notification.request.content.data

        if (!isValidNotificationData(rawData)) {
          console.warn('Invalid notification data received:', rawData)
          return
        }

        handleNotificationReceived(rawData)
      },
    )

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const rawData = response.notification.request.content.data

        if (!isValidNotificationData(rawData)) {
          console.warn('Invalid notification data in response:', rawData)
          return
        }

        handleNotificationResponse(rawData)
      })

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [registerDevice, pathname, router, setNotification])

  return {
    isModalVisible,
    currentNotificationData,
    modalData,
    handleCloseModal,
  }
}
