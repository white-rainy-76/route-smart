import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useRouteStore, type RoutePoint } from '@/shared/stores/route-store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist'

type RouteListItem =
  | { kind: 'origin'; point: RoutePoint }
  | { kind: 'waypoint'; point: RoutePoint }
  | { kind: 'destination'; point: RoutePoint }

function toListItem(
  kind: RouteListItem['kind'],
  point: RoutePoint,
): RouteListItem {
  return { kind, point }
}

function keyFor(item: RouteListItem) {
  // Ensure uniqueness even if same point id appears multiple times
  return `${item.kind}:${item.point.id}`
}

export function WaypointsEditor({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()

  const origin = useRouteStore((s) => s.origin)
  const destination = useRouteStore((s) => s.destination)
  const waypoints = useRouteStore((s) => s.waypoints)
  const setOrigin = useRouteStore((s) => s.setOrigin)
  const setDestination = useRouteStore((s) => s.setDestination)
  const setWaypoints = useRouteStore((s) => s.setWaypoints)
  const setSavedRouteId = useDirectionsStore((s) => s.setSavedRouteId)

  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#0F172A'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'

  const data: RouteListItem[] = [
    ...(origin ? [toListItem('origin', origin)] : []),
    ...waypoints.map((p) => toListItem('waypoint', p)),
    ...(destination ? [toListItem('destination', destination)] : []),
  ]

  const applyListToStore = (items: RouteListItem[]) => {
    // Очищаем savedRouteId при изменении точек через drag list
    setSavedRouteId(null)

    const points = items.map((x) => x.point)
    if (points.length === 0) {
      setOrigin(null)
      setDestination(null)
      setWaypoints([])
      return
    }
    if (points.length === 1) {
      setOrigin(points[0])
      setDestination(null)
      setWaypoints([])
      return
    }
    setOrigin(points[0])
    setDestination(points[points.length - 1])
    setWaypoints(points.slice(1, -1))
  }

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<RouteListItem>) => {
    const index = getIndex?.() ?? 0

    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        activeOpacity={0.8}
        className="flex-row items-center py-3">
        <View style={{ width: 27, alignItems: 'center' }}>
          <View
            style={{
              width: 17,
              height: 17,
              borderRadius: 999,
              backgroundColor: '#4964D8',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 9.71,
                lineHeight: 16.19,
                letterSpacing: 0,
                color: '#FFFFFF',
              }}>
              {index + 1}
            </Text>
          </View>
        </View>

        <View className="w-7 items-center">
          <MaterialIcons name="drag-indicator" size={20} color={mutedColor} />
        </View>

        <View className="flex-1">
          <Typography
            variant="body"
            weight="600"
            color={textColor}
            numberOfLines={1}>
            {item.point.name}
          </Typography>
          {item.point.address && (
            <Typography
              variant="bodySmall"
              weight="400"
              color={mutedColor}
              numberOfLines={1}
              className="mt-1">
              {item.point.address}
            </Typography>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            const next = data.filter((x) => keyFor(x) !== keyFor(item))
            applyListToStore(next)
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-9 h-9 items-center justify-center rounded-full"
          style={{
            borderWidth: 1,
            borderColor: '#D6D6D6',
          }}>
          <MaterialIcons name="close" size={20} color="#50565A" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1">
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => keyFor(item)}
        renderItem={renderItem}
        onDragEnd={({ data: next }) => {
          applyListToStore(next)
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
      />

      <View 
        className="gap-4"
        style={{ paddingBottom: Platform.OS === 'android' ? 20 : 0 }}>
        <TouchableOpacity
          onPress={() => router.push('/location-picker?type=waypoint&append=1')}
          activeOpacity={0.7}
          className="flex-row items-center py-3">
          {/* align with list columns: number column + icon column */}
          <View style={{ width: 27 }} />
          <View className="w-7 items-center">
            <MaterialIcons name="add" size={20} color={mutedColor} />
          </View>
          <View className="flex-1">
            <Typography
              variant="body"
              weight="600"
              color={mutedColor}
              numberOfLines={1}>
              {t('routeForm.to')}
            </Typography>
          </View>
        </TouchableOpacity>

        <Button
          variant="outline"
          size="md"
          onPress={onBack}
          className="w-full min-w-[303px] mx-auto">
          {t('routeForm.back')}
        </Button>
      </View>
    </View>
  )
}
