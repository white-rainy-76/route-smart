import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Pressable, Text, View } from 'react-native'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme, theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={toggleTheme}
      className="bg-card border border-border rounded-lg p-4 active:opacity-80">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">
            {resolvedTheme === 'dark' ? '🌙' : '☀️'}
          </Text>
          <View>
            <Text className="text-card-foreground font-semibold">
              {resolvedTheme === 'dark'
                ? t('home.darkTheme')
                : t('home.lightTheme')}
            </Text>
            <Text className="text-muted-foreground text-xs mt-0.5">
              {theme === 'system'
                ? t('home.systemTheme')
                : t('home.manualTheme')}
            </Text>
          </View>
        </View>
        <View className="px-3 py-1.5 bg-primary rounded-md">
          <Text className="text-primary-foreground text-sm font-medium">
            {t('home.changeTheme')}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
