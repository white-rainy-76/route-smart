import { Button, Screen } from '@/shared/ui'
import { LocationIllustration } from '@/shared/ui/illustrations'
import { Typography } from '@/shared/ui/typography'
import { useApp } from '@/shared/contexts/app-context'
import { useLocation } from '@/shared/hooks/use-location'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Platform, View } from 'react-native'

export default function LocationPermissionScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { permissionStatus, requestPermission, isLoading } = useLocation()
  const { setSeenLocationPermission, hasActiveSubscription } = useApp()

  // Mark that user has seen this screen
  useEffect(() => {
    setSeenLocationPermission(true)
  }, [setSeenLocationPermission])

  // Skip subscription screen on Android (not implemented yet)
  const nextRoute =
    Platform.OS === 'ios' && !hasActiveSubscription ? '/subscription' : '/home'

  const handleAllowAccess = async () => {
    const granted = await requestPermission()
    if (granted) {
      router.replace(nextRoute)
    } else {
      // Even if permission was denied, user has seen the screen
      router.replace(nextRoute)
    }
  }

  const handleLater = () => {
    router.replace(nextRoute)
  }

  return (
    <Screen safeBottom bottomPadding={16}>
      {/* Spacer to push content to bottom */}
      <View className="flex-1" />

      {/* Content container with flex column */}
      <View style={{ flexDirection: 'column' }}>
        {/* Illustration with bottom flex spacing */}
        <View className="items-center" style={{ marginBottom: 54 }}>
          <View className="w-48 h-48 items-center justify-center">
            <LocationIllustration width={278} height={278} />
          </View>
        </View>

        {/* Text content */}
        <View
          className="items-center"
          style={{ paddingHorizontal: 48, marginTop: 54 }}>
          <Typography
            variant="h1"
            align="center"
            className="text-foreground">
            {t('locationPermission.title')}
          </Typography>

          <View style={{ marginTop: 16, marginBottom: 28 }}>
            <Typography
              variant="body"
              weight="600"
              align="center"
              className="text-muted-foreground">
              {t('locationPermission.description')}
            </Typography>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 55, paddingBottom: 28 }}>
          <View className="gap-4">
            <Button
              onPress={handleAllowAccess}
              variant="primary"
              className="mx-auto"
              size="md"
              disabled={isLoading || permissionStatus?.granted}>
              {t('locationPermission.allowAccess')}
            </Button>
            <Button
              onPress={handleLater}
              className="mx-auto"
              variant="outline"
              size="md">
              {t('locationPermission.later')}
            </Button>
          </View>
        </View>
      </View>
    </Screen>
  )
}
