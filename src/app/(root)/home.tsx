import { LanguageSwitcher } from '@/components/language-switcher'
import { LocationDisplay } from '@/components/location-display'
import { LocationPermissionRequest } from '@/components/location-permission-request'
import { ThemeToggle } from '@/components/theme-toggle'
import { useLocation } from '@/hooks/use-location'
import { useTheme } from '@/hooks/use-theme'
import { useTranslation } from '@/hooks/use-translation'
import { ScrollView, Text, View } from 'react-native'

export default function HomeScreen() {
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation()
  const { permissionStatus } = useLocation()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-1 items-center justify-center p-6">
      <View className="w-full max-w-md gap-6">
        <View className="items-center gap-2">
          <Text className="text-4xl font-bold text-primary mb-2">
            {t('home.title')}
          </Text>
          <Text className="text-lg text-foreground/70 text-center">
            {t('home.subtitle')}
          </Text>
          <Text className="text-base text-foreground/70 text-center">
            {t('home.description')}
          </Text>
        </View>

        <View className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <Text className="text-card-foreground font-semibold mb-4 text-center">
            {t('home.themeManagement')}
          </Text>
          <ThemeToggle />
        </View>

        <View className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <Text className="text-card-foreground font-semibold mb-4 text-center">
            {t('language.changeLanguage')}
          </Text>
          <LanguageSwitcher />
        </View>

        <View className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <Text className="text-card-foreground font-semibold mb-4 text-center">
            📍 {t('location.permissionTitle')}
          </Text>
          {permissionStatus?.granted ? (
            <LocationDisplay />
          ) : (
            <LocationPermissionRequest />
          )}
        </View>

        <View className="bg-card rounded-xl p-4 border border-border">
          <Text className="text-muted-foreground text-xs mb-2">
            {t('home.currentTheme')}
          </Text>
          <Text className="text-card-foreground font-medium">
            {resolvedTheme === 'dark'
              ? `🌙 ${t('theme.dark')}`
              : `☀️ ${t('theme.light')}`}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
