import { Typography } from '@/shared/ui/typography'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { Pressable, PressableProps, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface ShowOnMapButtonProps extends Omit<PressableProps, 'children'> {
  disabled?: boolean
}

export function ShowOnMapButton({
  disabled = false,
  style,
  ...props
}: ShowOnMapButtonProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const buttonStyle: ViewStyle = {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // Android shadow
    opacity: disabled ? 0.5 : 1,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Math.max(14, insets.bottom + 14), // Добавляем safe area снизу
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  }

  return (
    <Pressable
      className="w-full flex-row items-start justify-center"
      style={[buttonStyle, style] as PressableProps['style']}
      disabled={disabled}
      {...props}>
      <MaterialIcons name="place" size={20} color="#4964D8" />
      <View className="ml-3">
        <Typography
          variant="body"
          weight="600"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 16,
            lineHeight: 20,
            letterSpacing: 0,
            color: '#111827',
          }}>
          {t('locationPicker.showOnMap')}
        </Typography>
      </View>
    </Pressable>
  )
}
