import { Typography } from '@/components/ui/typography'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface LocationPickerHeaderProps {
  title: string
  onBack: () => void
}

export function LocationPickerHeader({
  title,
  onBack,
}: LocationPickerHeaderProps) {
  const insets = useSafeAreaInsets()
  const paddingTop = insets.top + 16

  return (
    <View
      className="flex-row items-center px-5"
      style={{ paddingTop, marginBottom: 26 }}>
      <View className="w-6 items-start">
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color="#383838" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center">
        <Typography
          variant="h3"
          weight="700"
          className="text-center"
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 18,
            lineHeight: 28,
            letterSpacing: 0,
            color: '#383838',
          }}>
          {title}
        </Typography>
      </View>
      <View className="w-6" />
    </View>
  )
}
