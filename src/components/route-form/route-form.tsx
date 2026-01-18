import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { useGetDirectionsMutation } from '@/services/directions'
import { useGetTollRoadsMutation } from '@/services/toll-roads/api'
import { useGetTollsAlongPolylineSectionsMutation } from '@/services/tolls/get-tolls-along-polyline-sections/api'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useRouteStore } from '@/shared/stores/route-store'
import { useTollRoadsStore } from '@/shared/stores/toll-roads-store'
import { useTollsStore } from '@/shared/stores/tolls-store'
import { MaterialIcons } from '@expo/vector-icons'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { MotiView } from 'moti'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, View } from 'react-native'
import { routeFormSchema, validateRoutePoints } from './route-form.validation'
import { RouteInput } from './route-input'
import { RouteSummaryCard } from './route-summary-card'
import { SavedRouteIndicator } from './saved-route-indicator'

export function RouteForm({
  onManageWaypoints,
}: {
  onManageWaypoints?: () => void
}) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { origin, destination, waypoints, hasOriginAndDestination } =
    useRouteStore()
  const setDirections = useDirectionsStore((s) => s.setDirections)
  const setDirectionsLoading = useDirectionsStore((s) => s.setLoading)
  const setTollRoads = useTollRoadsStore((s) => s.setTollRoads)
  const setTollRoadsLoading = useTollRoadsStore((s) => s.setLoading)
  const setTolls = useTollsStore((s) => s.setTolls)
  const setTollsLoading = useTollsStore((s) => s.setLoading)
  const savedRouteId = useDirectionsStore((s) => s.savedRouteId)

  const tollRoadsMutation = useGetTollRoadsMutation()
  const tollsMutation = useGetTollsAlongPolylineSectionsMutation()

  const [isCollapsed, setIsCollapsed] = useState(false)

  const directionsMutation = useGetDirectionsMutation('create', {
    onSuccess: async (directions) => {
      // Устанавливаем directions в store
      setDirections(directions)

      // Скрываем форму после успешного расчета
      setIsCollapsed(true)

      // Извлекаем routeSectionId из directions
      const routeSectionIds = directions.route.map(
        (section) => section.routeSectionId,
      )

      if (routeSectionIds.length === 0) {
        setTollRoadsLoading(false)
        setTollsLoading(false)
        return
      }

      // Устанавливаем loading для toll-roads и tolls
      setTollRoadsLoading(true)
      setTollsLoading(true)

      try {
        // Делаем два параллельных запроса
        const [tollRoads, tolls] = await Promise.all([
          tollRoadsMutation.mutateAsync(routeSectionIds),
          tollsMutation.mutateAsync(routeSectionIds),
        ])

        setTollRoads(tollRoads)
        setTolls(tolls)
      } catch (error) {
        console.error('Failed to fetch tolls data:', error)
        // В случае ошибки очищаем данные
        setTollRoads(null)
        setTolls(null)
      } finally {
        setTollRoadsLoading(false)
        setTollsLoading(false)
      }
    },
  })

  // Синхронизируем состояние загрузки directions с store
  useEffect(() => {
    setDirectionsLoading(directionsMutation.isPending)
  }, [directionsMutation.isPending, setDirectionsLoading])

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      mpg: '',
    },
  })

  // Локальное состояние для ошибок точек
  const [pointErrors, setPointErrors] = useState<{
    destination?: string
  }>({})

  // Валидация точек при изменении
  useEffect(() => {
    const errors = validateRoutePoints(origin, destination, waypoints)
    setPointErrors(errors)
  }, [origin, destination, waypoints])

  const totalPointsCount = waypoints.length + (destination ? 1 : 0)

  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'
  const valueColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#50565A'
  const activeColor = '#4964D8'
  const dotsColor = origin && destination ? activeColor : mutedColor

  const handleOriginPress = () => {
    router.push('/location-picker?type=origin')
  }

  const handleDestinationPress = () => {
    if (waypoints.length > 0 && onManageWaypoints) {
      onManageWaypoints()
      return
    }
    router.push('/location-picker?type=destination')
  }

  const handleAddWaypoint = () => {
    router.push('/location-picker?type=waypoint')
  }

  const onSubmit = async (data: { mpg: string }) => {
    if (!origin || !destination) return

    // Проверка точек
    const errors = validateRoutePoints(origin, destination, waypoints)
    if (errors.destination) {
      setPointErrors(errors)
      return
    }
    setPointErrors({})

    const mpgValueRaw = data.mpg.trim().replace(',', '.')
    const mpgValue = mpgValueRaw.length === 0 ? 0 : Number(mpgValueRaw)

    try {
      const savedRouteId = useDirectionsStore.getState().savedRouteId

      // Очистить предыдущий маршрут/толлы перед новым расчетом (особенно важно для Android,
      // где Polyline иногда "залипает" визуально до полного размонтирования).
      setDirections(null)
      setTollRoads(null)
      setTolls(null)

      const directions = await directionsMutation.mutateAsync({
        origin: {
          latitude: origin.latitude,
          longitude: origin.longitude,
          name: origin.name,
          address: origin.address,
        },
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude,
          name: destination.name,
          address: destination.address,
        },
        ViaPoints:
          waypoints.length > 0
            ? waypoints.map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
                name: p.name,
                address: p.address,
              }))
            : undefined,
        originName: origin.name,
        destinationName: destination.name,
        savedRouteId: savedRouteId || undefined,
        milesPerGallon: mpgValue,
      })

      setDirections(directions)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to calculate route')
    }
  }

  const destinationValueText =
    origin && destination && waypoints.length > 0
      ? [origin.name, ...waypoints.map((w) => w.name), destination.name].join(
          ' - ',
        )
      : null

  const handleEditPress = () => {
    setIsCollapsed(false)
  }

  return (
    <View>
      {isCollapsed ? (
        <MotiView
          key="summary"
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 150,
            mass: 0.8,
          }}>
          <RouteSummaryCard onEdit={handleEditPress} />
        </MotiView>
      ) : (
        <MotiView
          key="form"
          from={{ opacity: 0, scale: 0.9, translateY: -20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 150,
            mass: 0.8,
          }}>
          <View>
            {/* Container with icons on left and inputs on right */}
            <View className="flex-row">
              {/* Left side: Icons with dots between them */}
              <View className="items-center mr-[15px] mt-1">
                <MaterialIcons
                  name="place"
                  size={15}
                  color={origin ? '#4964D8' : mutedColor}
                />
                <View className="my-2">
                  <View
                    className="w-1 h-1 rounded-full mb-1"
                    style={{ backgroundColor: dotsColor }}
                  />
                  <View
                    className="w-1 h-1 rounded-full mb-1"
                    style={{ backgroundColor: dotsColor }}
                  />
                  <View
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: dotsColor }}
                  />
                </View>
                <MaterialIcons
                  name="place"
                  size={15}
                  color={destination ? '#4964D8' : mutedColor}
                />
              </View>

              {/* Right side: Two input fields */}
              <View className="flex-1">
                <RouteInput
                  label={t('routeForm.chooseStart')}
                  point={origin}
                  onPress={handleOriginPress}
                  icon="place"
                  showIcon={false}
                />
                <View className="mt-5">
                  <RouteInput
                    label={t('routeForm.chooseDestination')}
                    point={destination}
                    waypointsCount={totalPointsCount}
                    valueText={destinationValueText}
                    numberOfLines={4}
                    showAddButton={hasOriginAndDestination()}
                    onPress={handleDestinationPress}
                    onAddPress={handleAddWaypoint}
                    icon="place"
                    showIcon={false}
                    error={pointErrors.destination}
                  />
                </View>
              </View>
            </View>

            <View className="mt-5 mb-0">
              <View className="flex-row items-center w-[240px]">
                <View className="mr-[15px]">
                  <MaterialIcons name="speed" size={15} color={mutedColor} />
                </View>
                <Controller
                  control={control}
                  name="mpg"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-1">
                      <BottomSheetTextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('routeForm.mpgPlaceholder')}
                        placeholderTextColor={mutedColor}
                        keyboardType="numeric"
                        className="flex-1 p-0"
                        style={{
                          fontFamily: 'Nunito_400Regular',
                          fontSize: 16,
                          lineHeight: 20,
                          letterSpacing: 0,
                          color: valueColor,
                        }}
                      />
                      {errors.mpg && (
                        <View className="mt-1 ml-0">
                          <View className="h-[1px] bg-red-500 mt-1" />
                          <Typography
                            variant="caption"
                            color="#EF4444"
                            className="mt-1">
                            {errors.mpg.message}
                          </Typography>
                        </View>
                      )}
                    </View>
                  )}
                />
              </View>
              {!errors.mpg && (
                <View className="h-[1px] bg-border mt-1 ml-[39px]" />
              )}
            </View>

            <View className="mt-[12px] mx-3">
              {/* Индикатор сохранённого маршрута */}
              <SavedRouteIndicator />

              <Button
                variant="primary"
                size="md"
                onPress={handleSubmit(onSubmit)}
                style={{ width: '100%' }}
                disabled={
                  !hasOriginAndDestination() || directionsMutation.isPending
                }>
                {savedRouteId
                  ? t('routeForm.buildFromTemplate') || 'Build from Template'
                  : t('routeForm.calculate')}
              </Button>
            </View>
          </View>
        </MotiView>
      )}
    </View>
  )
}
