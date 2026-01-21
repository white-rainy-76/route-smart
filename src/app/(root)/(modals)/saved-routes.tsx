import { Typography } from '@/shared/ui/typography'
import {
    routeQueries,
    type SavedRouteItem,
} from '@/services/route/get-saved-route'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { RoutePoint, useRouteStore } from '@/shared/stores/route-store'
import { MaterialIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
    RefreshControl,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

export default function SavedRoutesScreen() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'
  const inputBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const placeholderColor = resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'

  // Stores
  const setOrigin = useRouteStore((s) => s.setOrigin)
  const setDestination = useRouteStore((s) => s.setDestination)
  const setWaypoints = useRouteStore((s) => s.setWaypoints)
  const setSavedRouteId = useDirectionsStore((s) => s.setSavedRouteId)
  const clearDirections = useDirectionsStore((s) => s.clearDirections)

  // Получить список сохранённых маршрутов
  const {
    data: savedRoutes = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery(routeQueries.allSavedRoute())

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Обработчик нажатия на маршрут
  const handleRoutePress = useCallback(
    (route: SavedRouteItem) => {
      // Очищаем предыдущие directions
      clearDirections()

      // Устанавливаем savedRouteId
      setSavedRouteId(route.id)

      // Преобразуем startLocation в RoutePoint
      const originPoint: RoutePoint = {
        id: `origin-${route.id}`,
        name: route.startLocation.address || '',
        address: route.startLocation.address || '',
        latitude: route.startLocation.latitude,
        longitude: route.startLocation.longitude,
      }

      // Преобразуем endLocation в RoutePoint
      const destinationPoint: RoutePoint = {
        id: `destination-${route.id}`,
        name: route.endLocation.address || '',
        address: route.endLocation.address || '',
        latitude: route.endLocation.latitude,
        longitude: route.endLocation.longitude,
      }

      // Преобразуем viaPoints в waypoints
      const waypointsPoints: RoutePoint[] =
        route.waypoints?.map((wp, index) => ({
          id: `waypoint-${route.id}-${index}`,
          name: wp.address || wp.name || '',
          address: wp.address || wp.name || '',
          latitude: wp.latitude,
          longitude: wp.longitude,
        })) || []

      // Устанавливаем точки в store
      setOrigin(originPoint)
      setDestination(destinationPoint)
      setWaypoints(waypointsPoints)

      // Закрываем модалку и возвращаемся на карту
      router.back()
    },
    [clearDirections, setSavedRouteId, setOrigin, setDestination, setWaypoints],
  )

  // Фильтрация маршрутов по поисковому запросу
  const filteredRoutes = useMemo(() => {
    if (!savedRoutes || savedRoutes.length === 0) return []

    if (!searchQuery.trim()) return savedRoutes

    const query = searchQuery.toLowerCase()
    return savedRoutes.filter((route: SavedRouteItem) => {
      const startName = route.name?.toLowerCase() || ''
      const startAddress = route.startLocation?.address?.toLowerCase() || ''
      const endAddress = route.endLocation?.address?.toLowerCase() || ''

      return (
        startName.includes(query) ||
        startAddress.includes(query) ||
        endAddress.includes(query)
      )
    })
  }, [savedRoutes, searchQuery])

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-20 pb-5 bg-background">
        <View className="w-10 items-start">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: iconBg }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Typography variant="h1" weight="700" className="text-foreground">
            {t('drawer.savedRoutes')}
          </Typography>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#4964D8"
            colors={['#4964D8']}
          />
        }>
        {/* Search */}
        <View className="px-5 mb-4">
          <View
            className="flex-row items-center rounded-2xl px-4 py-3"
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: borderColor,
            }}>
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('savedRoutes.searchPlaceholder')}
              placeholderTextColor={placeholderColor}
              className="flex-1 ml-3"
              style={{
                fontFamily: 'Nunito_400Regular',
                fontSize: 16,
                lineHeight: 20,
                color: textColor,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="ml-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={20} color={mutedColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Routes List */}
        <View className="px-5">
          {isLoading ? (
            <View
              className="rounded-2xl p-6 items-center justify-center"
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderColor,
              }}>
              <MaterialIcons
                name="hourglass-empty"
                size={48}
                color={mutedColor}
                style={{ marginBottom: 12 }}
              />
              <Typography
                variant="body"
                weight="600"
                style={{ color: textColor, marginBottom: 4 }}>
                {t('common.loading')}
              </Typography>
            </View>
          ) : isError ? (
            <View
              className="rounded-2xl p-6 items-center justify-center"
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderColor,
              }}>
              <MaterialIcons
                name="error-outline"
                size={48}
                color="#EF4444"
                style={{ marginBottom: 12 }}
              />
              <Typography
                variant="body"
                weight="600"
                style={{ color: textColor, marginBottom: 4 }}>
                {t('common.error')}
              </Typography>
              <Typography variant="caption" style={{ color: mutedColor }}>
                {t('common.retry')}
              </Typography>
            </View>
          ) : filteredRoutes.length === 0 ? (
            <View
              className="rounded-2xl p-6 items-center justify-center"
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderColor,
              }}>
              <MaterialIcons
                name="route"
                size={48}
                color={mutedColor}
                style={{ marginBottom: 12 }}
              />
              <Typography
                variant="body"
                weight="600"
                style={{ color: textColor, marginBottom: 4 }}>
                {t('savedRoutes.noRoutes')}
              </Typography>
              <Typography variant="caption" style={{ color: mutedColor }}>
                {t('savedRoutes.noRoutesDescription')}
              </Typography>
            </View>
          ) : (
            <View className="gap-3">
              {filteredRoutes.map((route: SavedRouteItem, index: number) => (
                <TouchableOpacity
                  key={route.id || index}
                  className="active:opacity-70"
                  onPress={() => handleRoutePress(route)}>
                  <View
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: cardBg,
                      borderWidth: 1,
                      borderColor: borderColor,
                      shadowColor: resolvedTheme === 'dark' ? '#000' : '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}>
                    {/* Route name - только если есть */}
                    {route.name && (
                      <View className="mb-3">
                        <Typography
                          variant="body"
                          weight="700"
                          style={{
                            color: textColor,
                            fontSize: 16,
                            lineHeight: 22,
                          }}
                          numberOfLines={2}>
                          {route.name}
                        </Typography>
                      </View>
                    )}

                    {/* Origin and Destination */}
                    <View className="flex-row items-start mb-3">
                      <View className="items-center mr-3">
                        <MaterialIcons
                          name="place"
                          size={20}
                          color="#4964D8"
                          style={{ marginBottom: 4 }}
                        />
                        <View
                          className="flex-1"
                          style={{
                            width: 2,
                            backgroundColor: borderColor,
                            marginVertical: 4,
                          }}
                        />
                        <MaterialIcons name="place" size={20} color="#10B981" />
                      </View>

                      <View className="flex-1">
                        <View className="mb-3">
                          <Typography
                            variant="caption"
                            weight="600"
                            style={{
                              color: mutedColor,
                              fontSize: 11,
                              marginBottom: 2,
                            }}>
                            {t('savedRoutes.from')}
                          </Typography>
                          <Typography
                            variant="body"
                            weight="600"
                            style={{ color: textColor, fontSize: 15 }}
                            numberOfLines={1}>
                            {route.startLocation?.address || '-'}
                          </Typography>
                        </View>

                        <View>
                          <Typography
                            variant="caption"
                            weight="600"
                            style={{
                              color: mutedColor,
                              fontSize: 11,
                              marginBottom: 2,
                            }}>
                            {t('savedRoutes.to')}
                          </Typography>
                          <Typography
                            variant="body"
                            weight="600"
                            style={{ color: textColor, fontSize: 15 }}
                            numberOfLines={1}>
                            {route.endLocation?.address || '-'}
                          </Typography>
                        </View>
                      </View>
                    </View>

                    {/* Waypoints count */}
                    {route.waypoints && route.waypoints.length > 0 && (
                      <View
                        className="flex-row items-center mt-2 pt-3 border-t"
                        style={{ borderTopColor: borderColor }}>
                        <MaterialIcons
                          name="more-horiz"
                          size={16}
                          color={mutedColor}
                        />
                        <Typography
                          variant="caption"
                          weight="600"
                          style={{
                            color: mutedColor,
                            fontSize: 12,
                            marginLeft: 6,
                          }}>
                          {route.waypoints.length}{' '}
                          {route.waypoints.length === 1
                            ? t('savedRoutes.waypoint')
                            : t('savedRoutes.waypoints')}
                        </Typography>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}


