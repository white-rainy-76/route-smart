import { Typography } from '@/components/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { RoutePoint } from '@/shared/stores/route-store'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'

interface RouteInputProps {
  label: string
  point: RoutePoint | null
  waypointsCount?: number
  valueText?: string | null
  numberOfLines?: number
  onPress: () => void
  showAddButton?: boolean
  onAddPress?: () => void
  icon?: 'place' | 'speedometer'
  showIcon?: boolean
}

export function RouteInput({
  label,
  point,
  waypointsCount,
  valueText,
  numberOfLines = 1,
  onPress,
  showAddButton = false,
  onAddPress,
  icon = 'place',
  showIcon = true,
}: RouteInputProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()

  const valueColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#50565A'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'

  const hasValue = !!point
  const displayText =
    valueText ??
    (point
      ? waypointsCount && waypointsCount > 1
        ? t('routeForm.withMoreStops', {
            name: point.name,
            count: waypointsCount - 1,
          })
        : point.name
      : null)

  return (
    <View className="mb-0">
      <View className={`flex-row items-center w-full`}>
        <TouchableOpacity
          onPress={onPress}
          className="flex-1"
          activeOpacity={0.7}
          disabled={icon === 'speedometer'}>
          <View className="flex-row items-center">
            {showIcon && (
              <View className="mr-[15px]">
                <MaterialIcons
                  name={icon === 'place' ? 'place' : 'speed'}
                  size={24}
                  color={hasValue ? '#4964D8' : mutedColor}
                />
              </View>
            )}
            <View className="flex-1">
              <Typography
                variant="body"
                color={hasValue ? valueColor : mutedColor}
                style={{
                  fontFamily: 'Nunito_400Regular',
                  fontSize: 16,
                  lineHeight: 20,
                  letterSpacing: 0,
                }}
                numberOfLines={numberOfLines}>
                {displayText || label}
              </Typography>
            </View>
          </View>
        </TouchableOpacity>
        {showAddButton && (
          <TouchableOpacity
            onPress={onAddPress}
            className="w-9 h-9 rounded-full border border-border items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="add" size={20} color="#4964D8" />
          </TouchableOpacity>
        )}
      </View>
      <View
        className={`h-[1px] bg-border mt-1 ${showIcon ? 'ml-[39px]' : 'ml-0'}`}
      />
    </View>
  )
}
