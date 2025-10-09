import MapBase from '@/components/map/map-base'
import { GasStationMarker } from '@/components/map/ui/markers/gas-station-marker'
import { RouteList } from '@/components/route/route-list'
import { useAcceptRouteMutation } from '@/services/route/accept-route.mutation'
import { useDeclineFuelRouteMutation } from '@/services/route/decline-fuel-route.mutation'
import { useGetRouteByIdMutation } from '@/services/route/get-route-by-id.mutation'
import { useTranslation } from '@/shared/lib/i18n'
import { useTheme } from '@/shared/lib/theme'
import { useNotificationStore } from '@/shared/store/notification-store'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Marker, Polyline } from 'react-native-maps'

export default function NotificationDetailsScreen() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const router = useRouter()
  const currentNotification = useNotificationStore(
    (state) => state.currentNotification,
  )
  const routeId = currentNotification?.routeId
  const fuelPlanId = currentNotification?.fuelPlanId
  const fuelPlanValidatorId = currentNotification?.fuelPlanValidatorId
  const fuelRouteVersionId = currentNotification?.fuelRouteVersionId
  const [isMapReady, setMapReady] = useState(false)

  const {
    mutateAsync: getRouteById,
    data: routeData,
    isPending: isRouteLoading,
  } = useGetRouteByIdMutation({
    onError: (error) => {
      console.error('Route details fetch error:', error)
    },
  })

  const { mutateAsync: acceptRouteMutation, isPending: isAccepting } =
    useAcceptRouteMutation({
      onSuccess: () => {
        console.log('Route accepted successfully')
        router.push('/')
      },
      onError: (error) => {
        console.error('Accept route error:', error)
      },
    })

  const { mutateAsync: declineRouteMutation, isPending: isDeclining } =
    useDeclineFuelRouteMutation({
      onSuccess: () => {
        console.log('Route declined successfully')
        router.push('/')
      },
      onError: (error) => {
        console.error('Decline route error:', error)
      },
    })

  const handleAcceptRoute = async () => {
    console.log('Accepting route')
    console.log(routeId, fuelPlanId, routeData?.sectionId)
    if (
      routeId &&
      fuelPlanId &&
      // fuelPlanValidatorId &&
      // fuelRouteVersionId &&
      routeData?.sectionId
    ) {
      try {
        await acceptRouteMutation({
          routeId,
          routeSectionId: routeData.sectionId,
          fuelPlanId,
          fuelPlanValidatorId: fuelPlanValidatorId ?? '',
          fuelRouteVersionId: fuelRouteVersionId ?? '',
        })
      } catch (error) {
        console.error('Failed to accept route:', error)
      }
    }
  }

  const handleDeclineRoute = async () => {
    console.log('Declining route')
    console.log(
      routeId,
      fuelPlanId,

      routeData?.sectionId,
    )
    if (
      routeId &&
      fuelPlanId &&
      // fuelPlanValidatorId &&
      // fuelRouteVersionId &&
      routeData?.sectionId
    ) {
      try {
        await declineRouteMutation({
          routeId,
          routeSectionId: routeData.sectionId,
          fuelPlanId,
          fuelPlanValidatorId: fuelPlanValidatorId ?? '',
          fuelRouteVersionId: fuelRouteVersionId ?? '',
        })
      } catch (error) {
        console.error('Failed to decline route:', error)
      }
    }
  }

  useEffect(() => {
    if (routeId) {
      getRouteById({
        routeId,
        ...(fuelPlanId && { fuelPlanId }),
      })
    }
  }, [routeId, fuelPlanId, getRouteById])

  // Memoize drive time and miles display for consistency and performance
  const displayDriveTime = useMemo(() => {
    if (
      !routeData?.routeInfo ||
      typeof routeData.routeInfo.driveTime !== 'number' ||
      routeData.routeInfo.driveTime < 0
    )
      return ''
    const totalMinutes = Math.floor(routeData.routeInfo.driveTime / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    } else {
      return `${minutes}min`
    }
  }, [routeData?.routeInfo])

  const displayMiles = useMemo(() => {
    if (
      !routeData?.routeInfo ||
      typeof routeData.routeInfo.miles !== 'number' ||
      routeData.routeInfo.miles < 0
    )
      return '-'
    const milesInMeters = routeData.routeInfo.miles
    const convertedMiles = (milesInMeters * 0.000621371).toFixed(1)

    return convertedMiles
  }, [routeData?.routeInfo])

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.colors.background.primary }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('notifications.details_title'),
          headerStyle: { backgroundColor: theme.colors.header.background },
          headerTintColor: theme.colors.header.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/')}
              className="pl-4 pr-2">
              <Text
                className="text-white text-2xl"
                style={{ color: theme.colors.header.text }}>
                {'<'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {isRouteLoading && (
        <View
          className="absolute inset-0 items-center justify-center z-50"
          style={{ backgroundColor: theme.colors.background.secondary + 'B3' }}>
          <ActivityIndicator size="large" color="#4964D8" />
        </View>
      )}

      {/* Map takes fixed height */}
      <View className="min-h-[300px]">
        <MapBase
          setMapReady={setMapReady}
          enableBottomSheet
          bottomSheetContent={
            <View
              className="p-4 rounded-xl space-y-5 font-nunito border-b"
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderBottomColor: theme.colors.text.secondary,
              }}>
              <View className="flex-row flex-wrap justify-between text-sm text-text-neutral font-semibold">
                {/* Existing Route Info */}
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.drive_time')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {displayDriveTime}
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.miles')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {displayMiles}mi
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.gallons')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {routeData?.routeInfo.gallons ?? '-'}
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.tolls')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    ${routeData?.routeInfo.tolls ?? '-'}
                  </Text>
                </View>

                {/* New Fields Display */}
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.origin')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {routeData?.originName ?? '-'}
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.destination')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {routeData?.destinationName ?? '-'}
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.weight')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {routeData?.weight ?? '-'} lbs
                  </Text>
                </View>
                <View className="flex-col items-start w-1/2 mb-2">
                  <Text
                    className="font-normal"
                    style={{ color: theme.colors.text.secondary }}>
                    {t('notifications.remaining_fuel')}
                  </Text>
                  <Text
                    className="font-bold whitespace-nowrap"
                    style={{ color: theme.colors.text.primary }}>
                    {routeData?.remainingFuel ?? '-'} gal
                  </Text>
                </View>
              </View>
            </View>
          }>
          {routeData?.mapPoints && routeData.mapPoints.length > 1 && (
            <Polyline
              coordinates={routeData.mapPoints}
              strokeWidth={4}
              strokeColor="#4964D8"
              tappable
              geodesic={true}
            />
          )}

          {/* Gas station markers */}
          {routeData?.fuelStations?.map((station) => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.position?.lat || 0,
                longitude: station.position?.lng || 0,
              }}
              anchor={{ x: 0.5, y: 1 }}>
              <GasStationMarker station={station} />
            </Marker>
          ))}
        </MapBase>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1 "
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        {routeData?.fuelStations && (
          <View
            className="rounded-3xl my-5 px-5 py-5 mx-5"
            style={{
              backgroundColor: theme.colors.background.secondary,
            }}>
            <Text
              className="font-nunito font-bold text-sm leading-8 mb-6"
              style={{ color: theme.colors.text.primary }}>
              {t('profile.refueling_details')}
            </Text>
            {/* Pass fuelStations to RouteList */}
            <RouteList
              gasStations={routeData.fuelStations}
              selectedRouteId={routeData.sectionId}
            />
          </View>
        )}

        <View className="px-5 pb-5 pt-2.5 space-y-3">
          <TouchableOpacity
            className={`bg-[#2AC78A] h-11 rounded-[22px] justify-center items-center w-full ${isAccepting ? 'opacity-60' : ''}`}
            onPress={handleAcceptRoute}
            disabled={isAccepting}>
            <Text className="font-nunito font-medium text-base leading-6 text-center text-white">
              {isAccepting
                ? t('notifications.accepting')
                : t('notifications.accept_route')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-[#EF4444] h-11 rounded-[22px] justify-center items-center w-full mt-2 ${isDeclining ? 'opacity-60' : ''}`}
            onPress={handleDeclineRoute}
            disabled={isDeclining}>
            <Text className="font-nunito font-medium text-base leading-6 text-center text-white">
              {isDeclining
                ? t('notifications.declining')
                : t('notifications.decline_route')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
