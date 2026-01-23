import { Typography } from '@/shared/ui/typography'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Image } from 'expo-image'
import { View } from 'react-native'

interface AuthLogoProps {
  icon?: string // Deprecated, kept for backward compatibility
  titleKey: string
  subtitleKey: string
}

export function AuthLogo({ titleKey, subtitleKey }: AuthLogoProps) {
  const { t } = useTranslation()

  return (
    <View className="items-center mb-12">
      <View
        className="items-center justify-center mb-6"
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          overflow: 'hidden',
        }}>
        {/* Logo Image */}
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{ width: 88, height: 88 }}
          contentFit="contain"
        />
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
