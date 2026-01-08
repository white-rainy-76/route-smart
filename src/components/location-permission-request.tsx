import { useLocation } from '@/shared/hooks/use-location'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Pressable, Text, View } from 'react-native'

interface LocationPermissionRequestProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
}

export function LocationPermissionRequest({
  onPermissionGranted,
  onPermissionDenied,
}: LocationPermissionRequestProps) {
  const { permissionStatus, requestPermission, isLoading } = useLocation()
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      onPermissionGranted?.()
    } else {
      onPermissionDenied?.()
    }
  }

  // Если разрешение уже предоставлено, не показываем компонент
  if (permissionStatus?.granted) {
    return null
  }

  // Если разрешение окончательно отклонено и нельзя спросить снова
  if (
    permissionStatus &&
    !permissionStatus.granted &&
    !permissionStatus.canAskAgain
  ) {
    return (
      <View className="bg-card border border-border rounded-xl p-4">
        <Text className="text-card-foreground font-semibold mb-2">
          {t('location.permissionDenied')}
        </Text>
        <Text className="text-muted-foreground text-sm mb-3">
          {t('location.permissionDeniedDescription')}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {t('location.openSettings')}
        </Text>
      </View>
    )
  }

  return (
    <View className="bg-card border border-border rounded-xl p-6">
      <View className="items-center mb-4">
        <Text className="text-4xl mb-2">📍</Text>
        <Text className="text-card-foreground font-semibold text-lg mb-2">
          {t('location.permissionTitle')}
        </Text>
        <Text className="text-muted-foreground text-sm text-center">
          {t('location.permissionDescription')}
        </Text>
      </View>

      <Pressable
        onPress={handleRequestPermission}
        disabled={isLoading}
        className={`bg-primary rounded-lg py-3 px-6 active:opacity-80 ${
          isLoading ? 'opacity-50' : ''
        }`}>
        <Text className="text-primary-foreground font-semibold text-center">
          {isLoading ? t('common.loading') : t('location.requestPermission')}
        </Text>
      </Pressable>

      {permissionStatus && !permissionStatus.granted && (
        <Text className="text-muted-foreground text-xs text-center mt-3">
          {t('location.permissionHint')}
        </Text>
      )}
    </View>
  )
}
