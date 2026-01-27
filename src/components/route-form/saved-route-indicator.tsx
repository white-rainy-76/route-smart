import { Typography } from '@/shared/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import {
  useDirectionsActions,
  useDirectionsSavedRouteId,
} from '@/stores/directions/hooks'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'

export function SavedRouteIndicator() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const savedRouteId = useDirectionsSavedRouteId()
  const { setSavedRouteId } = useDirectionsActions()

  if (!savedRouteId) return null

  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const bgColor = resolvedTheme === 'dark' ? '#1E293B' : '#F1F5F9'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E2E8F0'

  return (
    <View
      className="flex-row items-center justify-between mb-3 px-4 py-2 rounded-xl"
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor,
      }}>
      <View className="flex-row items-center flex-1">
        <MaterialIcons
          name="bookmark"
          size={16}
          color="#4964D8"
          style={{ marginRight: 8 }}
        />
        <Typography
          variant="caption"
          weight="600"
          style={{
            color: mutedColor,
            fontSize: 12,
          }}>
          {t('routeForm.buildingFromTemplate') ||
            'Building from saved template'}
        </Typography>
      </View>
      <TouchableOpacity
        onPress={() => setSavedRouteId(null)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialIcons name="close" size={18} color={mutedColor} />
      </TouchableOpacity>
    </View>
  )
}
