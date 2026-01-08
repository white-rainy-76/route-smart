import { Typography } from '@/components/ui/typography'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'

interface AuthLogoProps {
  icon: keyof typeof Ionicons.glyphMap
  titleKey: string
  subtitleKey: string
}

export function AuthLogo({ icon, titleKey, subtitleKey }: AuthLogoProps) {
  const { t } = useTranslation()

  return (
    <View className="items-center mb-12">
      <View className="w-28 h-28 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-primary/30 overflow-hidden relative">
        {/* Primary Background */}
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: '#4964D8',
          }}
        />
        {/* Decorative Circle */}
        <View
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30"
          style={{
            backgroundColor: '#FFFFFF',
          }}
        />
        <View
          className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full opacity-20"
          style={{
            backgroundColor: '#FFFFFF',
          }}
        />
        {/* Main Icon */}
        <View className="relative z-10">
          <Ionicons name={icon} size={44} color="#FFFFFF" />
        </View>
      </View>
      <Typography
        variant="h1"
        weight="800"
        align="center"
        color="#383838"
        className="mb-2">
        Smart Tolls
      </Typography>
      <Typography
        variant="bodyLarge"
        weight="600"
        align="center"
        color="#77808D"
        className="mb-1">
        {t(titleKey)}
      </Typography>
      <Typography variant="body" align="center" color="#77808D">
        {t(subtitleKey)}
      </Typography>
    </View>
  )
}
