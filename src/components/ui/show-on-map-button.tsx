import { Typography } from '@/components/ui/typography'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { Pressable, PressableProps, View, ViewStyle } from 'react-native'

export interface ShowOnMapButtonProps extends Omit<PressableProps, 'children'> {
  disabled?: boolean
}

export function ShowOnMapButton({
  disabled = false,
  style,
  ...props
}: ShowOnMapButtonProps) {
  const { t } = useTranslation()

  const buttonStyle: ViewStyle = {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08, // #00000014 = rgba(0,0,0,0.08) ≈ 0.08 opacity
    shadowRadius: 32,
    elevation: 5, // Android shadow
    opacity: disabled ? 0.5 : 1,
    height: 44,
    padding: 12,
  }

  return (
    <Pressable
      className="max-w-[362px] mx-auto bg-white rounded-xl flex-row items-center"
      style={[buttonStyle, style] as PressableProps['style']}
      disabled={disabled}
      {...props}>
      <MaterialIcons name="place" size={20} color="#4964D8" />
      <View className="ml-3 flex-1">
        <Typography
          variant="body"
          weight="600"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 16,
            lineHeight: 20,
            letterSpacing: 0,
            color: '#383838',
          }}>
          {t('locationPicker.showOnMap')}
        </Typography>
      </View>
    </Pressable>
  )
}
