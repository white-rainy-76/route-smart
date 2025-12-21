import { useLocation } from '@/hooks/use-location'
import { useTranslation } from '@/hooks/use-translation'
import { Pressable, Text, View } from 'react-native'

export function LocationDisplay() {
  const { location, getCurrentLocation, isLoading, error } = useLocation()
  const { t } = useTranslation()

  const handleGetLocation = () => {
    getCurrentLocation()
  }

  if (!location) {
    return (
      <View className="bg-card border border-border rounded-xl p-4">
        <Text className="text-card-foreground font-semibold mb-3">
          {t('location.currentLocation')}
        </Text>
        <Pressable
          onPress={handleGetLocation}
          disabled={isLoading}
          className={`bg-primary rounded-lg py-3 px-4 active:opacity-80 ${
            isLoading ? 'opacity-50' : ''
          }`}>
          <Text className="text-primary-foreground font-semibold text-center">
            {isLoading ? t('common.loading') : t('location.getLocation')}
          </Text>
        </Pressable>
        {error && (
          <Text className="text-destructive text-xs mt-2 text-center">
            {error}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View className="bg-card border border-border rounded-xl p-4">
      <Text className="text-card-foreground font-semibold mb-3">
        {t('location.currentLocation')}
      </Text>
      <View className="gap-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">
            {t('location.latitude')}:
          </Text>
          <Text className="text-card-foreground text-sm font-mono">
            {location.latitude.toFixed(6)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">
            {t('location.longitude')}:
          </Text>
          <Text className="text-card-foreground text-sm font-mono">
            {location.longitude.toFixed(6)}
          </Text>
        </View>
        {location.accuracy !== null && (
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground text-sm">
              {t('location.accuracy')}:
            </Text>
            <Text className="text-card-foreground text-sm">
              ±{location.accuracy.toFixed(0)}m
            </Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={handleGetLocation}
        disabled={isLoading}
        className={`bg-primary rounded-lg py-2 px-4 active:opacity-80 ${
          isLoading ? 'opacity-50' : ''
        }`}>
        <Text className="text-primary-foreground font-semibold text-center text-sm">
          {isLoading ? t('common.loading') : t('location.getLocation')}
        </Text>
      </Pressable>
    </View>
  )
}
