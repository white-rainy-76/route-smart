import { Typography } from '@/components/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useRouteStore } from '@/shared/stores/route-store'
import { MaterialIcons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

interface RouteSummaryCardProps {
  onEdit: () => void
}

export function RouteSummaryCard({ onEdit }: RouteSummaryCardProps) {
  const { resolvedTheme } = useTheme()
  const { origin, destination, waypoints } = useRouteStore()

  // Формируем текст маршрута
  const getRouteSummaryText = () => {
    if (!origin || !destination) return ''

    const parts: string[] = [origin.name]

    if (waypoints.length > 0) {
      if (waypoints.length === 1) {
        parts.push(waypoints[0].name)
      } else {
        parts.push('waypoints')
      }
    }

    parts.push(destination.name)

    return parts.join(' → ')
  }

  const handleEditPress = () => {
    onEdit()
  }

  if (!origin || !destination) return null

  const routeText = getRouteSummaryText()
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'

  return (
    <Pressable onPress={handleEditPress} className="active:opacity-70">
      <View
        className="flex-row items-center justify-between px-4 py-3.5 rounded-2xl"
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
        <View className="flex-row items-center flex-1 mr-3">
          <MaterialIcons name="place" size={18} color="#4964D8" />
          <Typography
            variant="body"
            weight="600"
            style={{ color: textColor, fontSize: 15, marginLeft: 8 }}
            numberOfLines={1}>
            {routeText}
          </Typography>
        </View>
        <View
          className="w-8 h-8 rounded-lg items-center justify-center"
          style={{ backgroundColor: iconBg }}>
          <MaterialIcons name="edit" size={18} color="#4964D8" />
        </View>
      </View>
    </Pressable>
  )
}
