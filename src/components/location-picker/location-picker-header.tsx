import { Typography } from '@/components/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
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
  const { resolvedTheme } = useTheme()
  const paddingTop = insets.top + 16

  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'

  return (
    <View
      className="flex-row items-center px-5"
      style={{ paddingTop, marginBottom: 20 }}>
      <View className="w-10 items-start">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: iconBg }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center">
        <Typography
          variant="h3"
          weight="600"
          className="text-black"
          style={{
            fontSize: 18,
            lineHeight: 24,
          }}>
          {title}
        </Typography>
      </View>
      <View className="w-10" />
    </View>
  )
}
