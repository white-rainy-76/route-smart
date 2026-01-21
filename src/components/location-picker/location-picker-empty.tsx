import { Typography } from '@/shared/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { View } from 'react-native'

export function LocationPickerEmpty() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#BDBCBC'

  return (
    <View className="p-10 items-center">
      <MaterialIcons name="search-off" size={48} color={mutedColor} />
      <Typography
        variant="body"
        align="center"
        color={mutedColor}
        className="mt-4">
        {t('locationPicker.noResultsFound')}
      </Typography>
    </View>
  )
}
